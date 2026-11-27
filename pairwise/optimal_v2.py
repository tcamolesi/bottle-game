"""Improved Optimal Solver v2 distilling Trick #3 from minimax belief trees.

Retains the asymptotically optimal Adaptive-Square Dihedral Blocked architecture
(O(n^2) CPU, O(n) memory, ratio -> 1.00x of n(n-1)/8 and n(n-1)/4), while
eliminating most of the O(n) and O(n^1.5) overhead via:
1. `phase0_fast`: no-undo pair probing with a single anchor (~1-3 swaps/pair).
2. Deferred hit resolution inside Dihedral squares: delta=+1 pairs stay pending
   and piggyback on the very next scheduled Dihedral swap (0 extra swaps in
   most cases instead of 2-swap probe+undo).
3. `finish_deferred_history`: bitmask-tracked endgame with 1-option constraint
   propagation, deferred resolution, and no-undo probes.
"""

from __future__ import annotations

import math
import random

from game import BottleGame
from optimal import dihedral_round_pairs
from primitives import TrackedGame


def solve_optimal_v2(
    game: BottleGame,
    randomized: bool = False,
    seed: int | None = None,
    block_scale: float = 1.22,
    phase2_threshold: int = 28,
) -> int:
    """Solve the Bottle Game using Adaptive-Square Dihedral + Trick #3 optimizations."""
    rng = random.Random(seed) if randomized else None
    tg = TrackedGame(game)

    false_pairs = tg.phase0_fast(small_threshold=16)

    while True:
        m = len(tg.unlocked_slots)
        if m == 0:
            break
        b = max(2, 2 * int(round(block_scale * math.sqrt(m) / 2.0)))
        if m <= max(phase2_threshold, b + 6):
            break

        all_unlocked_bottles = sorted(tg.unlocked_bottles)
        pool = sorted(tg.unlocked_slots)
        if rng is not None:
            rng.shuffle(all_unlocked_bottles)
            rng.shuffle(pool)

        rem_B = all_unlocked_bottles[:b]
        pool_todo: list[int] = list(pool)
        pool_todo_set: set[int] = set(pool)
        pool_done: list[int] = []
        pool_done_set: set[int] = set()

        def _take_spare(current_S_set: set[int]) -> tuple[int | None, str]:
            for sl in pool_done:
                if sl in pool_done_set and not tg.locked_slot[sl] and sl not in current_S_set:
                    pool_done_set.remove(sl)
                    return sl, "done"
            for sl in pool_todo:
                if sl in pool_todo_set and not tg.locked_slot[sl] and sl not in current_S_set:
                    pool_todo_set.remove(sl)
                    return sl, "todo"
            for sl in tg.unlocked_slots:
                if sl not in current_S_set:
                    if sl in pool_done_set:
                        pool_done_set.remove(sl)
                        return sl, "done"
                    if sl in pool_todo_set:
                        pool_todo_set.remove(sl)
                        return sl, "todo"
                    return sl, "todo"
            return None, ""

        aborted_phase1 = False

        while True:
            rem_B = [u for u in rem_B if not tg.locked_bottle[u]]
            pool_todo = [
                sl for sl in pool_todo if sl in pool_todo_set and not tg.locked_slot[sl]
            ]
            pool_todo_set = set(pool_todo)

            if not rem_B or not pool_todo:
                break
            if len(tg.unlocked_slots) <= max(phase2_threshold, b + 6):
                aborted_phase1 = True
                break

            p = len(rem_B)
            if p == 1:
                tg.sweep_single_bottle(rem_B[0], pool_todo)
                break

            if len(pool_todo) == 1:
                for u in list(rem_B):
                    if tg.locked_slot[pool_todo[0]]:
                        break
                    tg.sweep_single_bottle(u, pool_todo)
                break

            if p % 2 == 0:
                if len(pool_todo) >= p:
                    s = p
                    U = list(rem_B)
                else:
                    s = len(pool_todo) - (len(pool_todo) % 2)
                    U = list(rem_B[:s])
            else:
                if len(pool_todo) >= p + 1:
                    rem_B_set = set(rem_B)
                    sp_b: int | None = None
                    for sl in pool_todo[: p + 1]:
                        cand = tg.bottle_at[sl]
                        if not tg.locked_bottle[cand] and cand not in rem_B_set:
                            sp_b = cand
                            break
                    if sp_b is None:
                        for cand in tg.unlocked_bottles:
                            if cand not in rem_B_set:
                                sp_b = cand
                                break
                    assert sp_b is not None
                    s = p + 1
                    U = list(rem_B) + [sp_b]
                else:
                    tg.sweep_single_bottle(rem_B[0], pool_todo)
                    if not tg.locked_bottle[rem_B[0]]:
                        break
                    continue

            V = pool_todo[:s]
            pool_todo = pool_todo[s:]
            for sl in V:
                pool_todo_set.discard(sl)

            # Setup: move all bottles of U into the slots of V.
            U_set = set(U)
            V_set = set(V)
            interrupted = False
            while True:
                v_target: int | None = None
                for v in V:
                    if tg.bottle_at[v] not in U_set:
                        v_target = v
                        break
                if v_target is None:
                    break

                u_source: int | None = None
                for u in U:
                    if tg.slot_of[u] not in V_set:
                        u_source = u
                        break
                assert u_source is not None

                old_slot = tg.slot_of[u_source]
                d = tg.raw_swap(old_slot, v_target)
                if d == 2:
                    tg.lock(v_target)
                    tg.lock(old_slot)
                    interrupted = True
                    break
                if d == 1:
                    tg.resolve_hit(v_target, old_slot, undo_on_zero=False)
                    interrupted = True
                    break

            if interrupted:
                returned = [sl for sl in V if not tg.locked_slot[sl]]
                for sl in returned:
                    pool_todo_set.add(sl)
                pool_todo = returned + pool_todo
                continue

            # In-place Dihedral A, B, A, B sweep with deferred hit resolution.
            S: list[int] = list(V)
            origin: dict[int, str] = {sl: "V" for sl in S}
            rem_B_set = set(rem_B)
            partner_of: dict[int, int] = {}
            aborted_to_phase2 = False

            def _replace_locked_indices() -> None:
                nonlocal aborted_to_phase2
                for idx in range(s):
                    if tg.locked_slot[S[idx]]:
                        sp_sl, sp_org = _take_spare(set(S))
                        if sp_sl is None:
                            aborted_to_phase2 = True
                            break
                        origin[sp_sl] = sp_org
                        S[idx] = sp_sl

            def _resolve_index_externally(idx: int) -> None:
                p_idx = partner_of.pop(idx)
                partner_of.pop(p_idx)
                extra_p = len(partner_of) // 2
                slot_a = S[idx]
                slot_b = S[p_idx]
                S_set = set(S)
                slot_to_idx = {S[k]: k for k in partner_of}
                pending_slot_pairs = {S[k]: S[v] for k, v in partner_of.items()}
                hard_ex = set(pending_slot_pairs.keys())

                dw = tg.resolve_hit(
                    slot_a,
                    slot_b,
                    exclude=S_set | hard_ex,
                    extra_pending=extra_p,
                    undo_on_zero=True,
                    hard_exclude=hard_ex,
                    pending_slot_pairs=pending_slot_pairs,
                )
                # Sync partner_of if resolve_hit jointly resolved any extra pair.
                for k_idx in list(partner_of.keys()):
                    if S[k_idx] not in pending_slot_pairs:
                        partner_of.pop(k_idx, None)
                if (
                    tg.locked_slot[slot_a]
                    and dw is not None
                    and not tg.locked_slot[dw]
                    and dw not in S_set
                ):
                    if dw in pool_done_set:
                        pool_done_set.remove(dw)
                        origin[dw] = "done"
                    else:
                        pool_todo_set.discard(dw)
                        origin[dw] = "todo"
                    S[idx] = dw
                _replace_locked_indices()

            for r in range(s - 1):
                if all(tg.locked_bottle[u] for u in rem_B_set):
                    break

                for idx_a, idx_b in dihedral_round_pairs(s, r):
                    if all(tg.locked_bottle[u] for u in rem_B_set):
                        break
                    if len(tg.unlocked_slots) - len(S) <= max(2, len(partner_of)):
                        aborted_to_phase2 = True
                        break

                    in_a = idx_a in partner_of
                    in_b = idx_b in partner_of

                    if in_a and in_b:
                        _resolve_index_externally(idx_a)
                        if aborted_to_phase2:
                            break
                        # idx_a is now resolved and unlocked; idx_b might still be pending
                        # (unless jointly resolved above). Fall through into Case 0 or Case 2.
                        in_a = idx_a in partner_of
                        in_b = idx_b in partner_of

                    if not in_a and not in_b:
                        slot_a = S[idx_a]
                        slot_b = S[idx_b]
                        d = tg.raw_swap(slot_a, slot_b)
                        if d == 0:
                            continue
                        if d == 2:
                            tg.lock(slot_a)
                            tg.lock(slot_b)
                            _replace_locked_indices()
                        elif d == 1:
                            partner_of[idx_a] = idx_b
                            partner_of[idx_b] = idx_a
                        else:
                            raise AssertionError(f"Unexpected delta {d} in Case 0")
                    else:
                        # Exactly one of {idx_a, idx_b} is in partner_of.
                        u, v = (idx_a, idx_b) if in_a else (idx_b, idx_a)
                        p_idx = partner_of.pop(u)
                        partner_of.pop(p_idx)
                        slot_u = S[u]
                        slot_v = S[v]
                        slot_p = S[p_idx]

                        d = tg.raw_swap(slot_u, slot_v)
                        if d == -1:
                            # slot_u was the fixed member of {slot_u, slot_p}.
                            tg.raw_swap(slot_u, slot_v)
                            tg.lock(slot_u)
                            _replace_locked_indices()
                            if aborted_to_phase2:
                                break
                            # Now complete the round-r swap with the fresh spare at S[u].
                            new_slot_u = S[u]
                            d2 = tg.raw_swap(new_slot_u, slot_v)
                            if d2 == 0:
                                pass
                            elif d2 == 2:
                                tg.lock(new_slot_u)
                                tg.lock(slot_v)
                                _replace_locked_indices()
                            elif d2 == 1:
                                partner_of[u] = v
                                partner_of[v] = u
                            else:
                                raise AssertionError(f"Unexpected delta {d2} in Case 2 spare swap")
                        elif d == 0:
                            # slot_p was fixed; round-r swap (slot_u, slot_v) is complete.
                            tg.lock(slot_p)
                            _replace_locked_indices()
                        elif d == 2:
                            tg.lock(slot_p)
                            tg.lock(slot_u)
                            tg.lock(slot_v)
                            _replace_locked_indices()
                        elif d == 1:
                            tg.lock(slot_p)
                            partner_of[u] = v
                            partner_of[v] = u
                            _replace_locked_indices()
                        else:
                            raise AssertionError(f"Unexpected delta {d} in Case 2")

                    if aborted_to_phase2:
                        break

                if aborted_to_phase2:
                    break

            # Always drain any remaining deferred pairs before leaving the square.
            if partner_of:
                pending_slot_pairs = {S[k]: S[v] for k, v in partner_of.items()}
                while pending_slot_pairs:
                    slot_a = next(iter(pending_slot_pairs))
                    slot_b = pending_slot_pairs.pop(slot_a)
                    pending_slot_pairs.pop(slot_b)
                    extra_p = len(pending_slot_pairs) // 2
                    hard_ex = set(pending_slot_pairs.keys())
                    tg.resolve_hit(
                        slot_a,
                        slot_b,
                        exclude=set(S) | hard_ex,
                        extra_pending=extra_p,
                        undo_on_zero=False,
                        hard_exclude=hard_ex,
                        pending_slot_pairs=pending_slot_pairs,
                    )
                partner_of.clear()

            assert tg.f_cur == tg.num_locked

            if aborted_to_phase2:
                aborted_phase1 = True
                break

            for sl in S:
                if tg.locked_slot[sl]:
                    continue
                if origin.get(sl) in ("V", "done"):
                    if sl not in pool_done_set:
                        pool_done.append(sl)
                        pool_done_set.add(sl)
                else:
                    if sl not in pool_todo_set:
                        pool_todo.append(sl)
                        pool_todo_set.add(sl)

        if aborted_phase1:
            break

    # Phase 2: Trick #3 deferred-resolution + 1-option constraint propagation endgame.
    tg.finish_deferred_history(initial_false_pairs=false_pairs)
    return game.swap_count


def solve_optimal_v2_deterministic(game: BottleGame) -> int:
    """Deterministic v2 solver (worst-case <= n^2/4 + O(n^1.5), avg <= n^2/8 + O(n^1.5))."""
    return solve_optimal_v2(game, randomized=False)


def solve_optimal_v2_randomized(game: BottleGame, seed: int | None = None) -> int:
    """Randomized v2 solver (worst-case expected <= n^2/8 + O(n^1.5) for EVERY input)."""
    return solve_optimal_v2(game, randomized=True, seed=seed)
