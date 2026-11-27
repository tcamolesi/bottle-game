"""Provably optimal Adaptive-Square Dihedral solver for the Bottle Game.

Achieves:
- Deterministic worst-case:  <= n^2 / 4 + O(n^(3/2)) swaps  (matches Theorem 1)
- Average-case (uniform pi): <= n^2 / 8 + O(n^(3/2)) swaps  (matches Theorem 2)
- Randomized worst-case exp: <= n^2 / 8 + O(n^(3/2)) swaps  (matches Yao bound)
"""

from __future__ import annotations

import math
import random

from game import BottleGame
from primitives import TrackedGame


def dihedral_round_pairs(s: int, r: int) -> list[tuple[int, int]]:
    """Return the `s/2` disjoint index pairs for round `r` (`0 <= r < s - 1`).

    Uses the alternating fixed-point-free dihedral involutions on `Z_s` (`s` even):
    - Even round `r` (Involution A): `A(x) = (-x - 1) mod s`
    - Odd round `r`  (Involution B): `B(x) = (-x + 1) mod s`
    """
    assert s >= 2 and s % 2 == 0, f"s must be even >= 2, got {s}"
    assert 0 <= r < s - 1, f"round {r} out of range for s={s}"
    half = s // 2
    if r % 2 == 0:
        return [(k, s - 1 - k) for k in range(half)]
    return [(0, 1)] + [(k, s + 1 - k) for k in range(2, half + 1)]


def solve_optimal(
    game: BottleGame,
    randomized: bool = False,
    seed: int | None = None,
    block_scale: float = 1.22,
) -> int:
    """Solve the Bottle Game using the Adaptive-Square Dihedral Blocked algorithm."""
    rng = random.Random(seed) if randomized else None
    tg = TrackedGame(game)

    # Phase 0: eliminate all initial fixed points -> Golden Invariant (f_cur == num_locked).
    tg.phase0_eliminate_fixed_points()

    # Phase 1: adaptive-square Dihedral sweeps.
    while True:
        m = len(tg.unlocked_slots)
        if m == 0:
            break
        b = max(2, 2 * int(round(block_scale * math.sqrt(m) / 2.0)))
        if m <= max(16, 4 * b):
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
            if len(tg.unlocked_slots) <= max(16, 4 * b):
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
                    # len(pool_todo) <= p: sweep one bottle to reduce p to even (or exit).
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
                assert u_source is not None, "Size mismatch between U and V during setup"

                old_slot = tg.slot_of[u_source]
                d = tg.raw_swap(old_slot, v_target)
                if d == 2:
                    tg.lock(v_target)
                    tg.lock(old_slot)
                    interrupted = True
                    break
                if d == 1:
                    tg.resolve_hit(v_target, old_slot)
                    interrupted = True
                    break

            if interrupted:
                returned = [sl for sl in V if not tg.locked_slot[sl]]
                for sl in returned:
                    pool_todo_set.add(sl)
                pool_todo = returned + pool_todo
                continue

            # In-place Dihedral A, B, A, B sweep on S = list(V).
            S: list[int] = list(V)
            origin: dict[int, str] = {sl: "V" for sl in S}
            rem_B_set = set(rem_B)
            aborted_to_phase2 = False

            for r in range(s - 1):
                if all(tg.locked_bottle[u] for u in rem_B_set):
                    break

                for idx_a, idx_b in dihedral_round_pairs(s, r):
                    if all(tg.locked_bottle[u] for u in rem_B_set):
                        break

                    slot_a = S[idx_a]
                    slot_b = S[idx_b]
                    d = tg.raw_swap(slot_a, slot_b)
                    if d == 0:
                        continue

                    S_set = set(S)
                    if d == 2:
                        tg.lock(slot_a)
                        tg.lock(slot_b)
                    elif d == 1:
                        displaced_w = tg.resolve_hit(slot_a, slot_b, exclude=S_set)
                        if (
                            tg.locked_slot[slot_a]
                            and displaced_w is not None
                            and not tg.locked_slot[displaced_w]
                            and displaced_w not in S_set
                        ):
                            if displaced_w in pool_done_set:
                                pool_done_set.remove(displaced_w)
                                origin[displaced_w] = "done"
                            else:
                                pool_todo_set.discard(displaced_w)
                                origin[displaced_w] = "todo"
                            S[idx_a] = displaced_w
                    else:
                        raise AssertionError(f"Unexpected delta {d} during Dihedral sweep")

                    # Replace any slots in S that are now locked.
                    for idx in range(s):
                        if tg.locked_slot[S[idx]]:
                            sp_sl, sp_org = _take_spare(set(S))
                            if sp_sl is None:
                                aborted_to_phase2 = True
                                break
                            origin[sp_sl] = sp_org
                            S[idx] = sp_sl

                    if aborted_to_phase2:
                        break

                if aborted_to_phase2:
                    break

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

    # Phase 2: exact cleanup for small remaining size.
    tg.finish_small_phase2()
    return game.swap_count


def solve_optimal_deterministic(game: BottleGame) -> int:
    """Deterministic optimal solver (worst-case <= n^2/4 + O(n^1.5), avg <= n^2/8 + O(n^1.5))."""
    return solve_optimal(game, randomized=False)


def solve_optimal_randomized(game: BottleGame, seed: int | None = None) -> int:
    """Randomized optimal solver (worst-case expected <= n^2/8 + O(n^1.5) for EVERY input)."""
    return solve_optimal(game, randomized=True, seed=seed)
