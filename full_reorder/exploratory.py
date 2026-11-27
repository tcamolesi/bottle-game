"""Exploratory and deterministic O(n log n) solvers for the Full-Reorder Bottle Game.

Implements:
1. `solve_greedy_entropy`: exact belief-set max-entropy heuristic for small n (n <= 6).
2. `solve_random_elimination`: simple random matching elimination + probing baseline.
3. `solve_shift_binary_search`: 100% deterministic O(n log n) solver using
   cyclic shift scan + Golden-Invariant baseline + Locked-Anchor Bridge
   binary search (<= n ceil(log2 n) + 2.5 n + O(log n) queries).
"""

from __future__ import annotations

import itertools
import math
import random
from collections import defaultdict

from full_reorder.game import FullReorderGame
from full_reorder.primitives import Block, TrackedReorderGame


def _slot_of_to_bottle_at(slot_of: list[int]) -> list[int]:
    n = len(slot_of)
    bottle_at = [0] * n
    for b, s in enumerate(slot_of):
        bottle_at[s] = b
    return bottle_at


def solve_greedy_entropy(game: FullReorderGame) -> int:
    """Exact belief-set greedy max-entropy solver for small n (n <= 6)."""
    if game.is_solved():
        return game.query_count

    n = game.n
    assert n <= 6, "solve_greedy_entropy is intended for n <= 6"
    all_perms = list(itertools.permutations(range(n)))

    # Candidate secret permutations a_0 (a_0[bottle] = true_slot).
    f0 = game.correct_count
    belief = [p for p in all_perms if sum(1 for i, v in enumerate(p) if i == v) == f0]

    while not game.is_solved():
        if len(belief) == 1:
            a0 = belief[0]
            bottle_at = _slot_of_to_bottle_at(list(a0))
            f = game.reorder(bottle_at)
            assert f == n
            break

        belief_set = set(belief)
        best_query: tuple[int, ...] | None = None
        best_score: tuple[float, int, int] = (-1.0, -1, -1)

        # Evaluate candidate bottle_at queries.
        for q in all_perms:
            buckets: dict[int, int] = defaultdict(int)
            for a0 in belief:
                cnt = 0
                for s in range(n):
                    if a0[q[s]] == s:
                        cnt += 1
                buckets[cnt] += 1
            if len(buckets) <= 1:
                continue
            total = len(belief)
            entropy = 0.0
            max_b = 0
            for c in buckets.values():
                p = c / total
                entropy -= p * math.log2(p)
                if c > max_b:
                    max_b = c
            # Prefer higher entropy, smaller max bucket, and queries inside belief.
            q_inv = tuple(_slot_of_to_bottle_at(list(q)))
            in_belief = 1 if q_inv in belief_set else 0
            score = (round(entropy, 12), -max_b, in_belief)
            if score > best_score:
                best_score = score
                best_query = q

        assert best_query is not None
        f = game.reorder(list(best_query))
        if f == n:
            break
        belief = [
            a0
            for a0 in belief
            if sum(1 for s in range(n) if a0[best_query[s]] == s) == f
        ]

    return game.query_count


def _find_block_with_match(
    t: TrackedReorderGame, blocks: list[Block]
) -> Block:
    """Binary search among `blocks` (total sum >= 1) for a block with >= 1 match."""
    if len(blocks) == 1:
        return blocks[0]

    cycles = [blk for blk in blocks if blk.kind == "cycle"]
    paths = [blk for blk in blocks if blk.kind == "path"]
    ordered = cycles + paths

    lo = 0
    hi = len(ordered)
    while hi - lo > 1:
        mid = (lo + hi) // 2
        anchors_avail = len(t.locked_pairs)
        # Ensure the tested slice uses <= anchors_avail path blocks.
        test_end = mid
        path_cnt = sum(1 for b in ordered[lo:test_end] if b.kind == "path")
        if path_cnt > anchors_avail:
            # Shrink test_end so path_cnt <= anchors_avail.
            kept = 0
            p_seen = 0
            for blk in ordered[lo:mid]:
                if blk.kind == "path":
                    if p_seen >= anchors_avail:
                        break
                    p_seen += 1
                kept += 1
            if kept == 0:
                # Only possible when anchors_avail == 0 and ordered[lo] is a path.
                # Close ordered[lo] with 1 bridge edge into a cycle and test it!
                blk0 = ordered[lo]
                assert t.p0 is not None
                if len(blk0.vertices) >= 2:
                    cyc = Block.make_cycle(blk0.vertices, t.p0)
                    f = t.query_blocks([cyc], [0])
                    if f == 0:
                        lo += 1
                        continue
                    if f >= 2:
                        return blk0
                    # f == 1: test bridge edge (verts[-1], p0[verts[0]]).
                    s_v, e_v = blk0.vertices[0], blk0.vertices[-1]
                    swap_blk = Block.make_cycle([s_v, e_v], t.p0)
                    f_swap = t.query_blocks([swap_blk], [0])
                    if f_swap == 0:
                        return blk0
                    if f_swap == 2:
                        return Block.make_cycle([s_v, e_v], t.p0)
                    # f_swap == 1: bridge or reverse matches -> return 2-cycle!
                    return swap_blk
            test_end = lo + kept

        idxs = list(range(lo, test_end))
        cnt = t.query_blocks(ordered, idxs)
        if cnt > 0:
            hi = test_end
        else:
            lo = test_end

    return ordered[lo]


def solve_random_elimination(
    game: FullReorderGame, seed: int | None = None
) -> int:
    """Simple randomized elimination + binary-search probing baseline."""
    if game.is_solved():
        return game.query_count

    n = game.n
    if n == 2:
        f = game.reorder([1, 0])
        assert f == 2
        return game.query_count

    rng = random.Random(seed)
    t = TrackedReorderGame(game)
    t.find_initial_zero_baseline_random(rng)
    if game.is_solved():
        return game.query_count

    assert t.p0 is not None and t.inv_p0 is not None
    all_mask = (1 << n) - 1
    cand_slots = [all_mask ^ (1 << t.p0[b]) for b in range(n)]
    cand_bottles = [all_mask ^ (1 << t.inv_p0[s]) for s in range(n)]
    ub_mask = all_mask
    us_mask = all_mask

    def _elim(b: int, s: int) -> None:
        cand_slots[b] &= ~(1 << s)
        cand_bottles[s] &= ~(1 << b)

    def _lock(b: int, s: int) -> None:
        nonlocal ub_mask, us_mask
        if t.locked_bottle[b]:
            return
        old_s = t.p0[b]  # type: ignore[index]
        newly = t.lock_and_maintain_baseline(b, s)
        for lb, ls in newly:
            ub_mask &= ~(1 << lb)
            us_mask &= ~(1 << ls)
        if not t.locked_slot[old_s]:
            _elim(t.inv_p0[old_s], old_s)  # type: ignore[index]

    def _propagate() -> None:
        changed = True
        while changed and not game.is_solved():
            changed = False
            for b in list(t.unlocked_bottles):
                if t.locked_bottle[b]:
                    continue
                avail = cand_slots[b] & us_mask
                if avail.bit_count() == 1:
                    s = (avail & -avail).bit_length() - 1
                    _lock(b, s)
                    changed = True
                    if game.is_solved():
                        return
            for s in list(t.unlocked_slots):
                if t.locked_slot[s]:
                    continue
                avail = cand_bottles[s] & ub_mask
                if avail.bit_count() == 1:
                    b = (avail & -avail).bit_length() - 1
                    _lock(b, s)
                    changed = True
                    if game.is_solved():
                        return

    while not game.is_solved():
        _propagate()
        if game.is_solved():
            break

        u_bots = list(t.unlocked_bottles)
        u_slots = list(t.unlocked_slots)
        # Build a permutation on unlocked bottles trying to pick candidate edges.
        rng.shuffle(u_bots)
        used_s = 0
        assigned: dict[int, int] = {}
        unassigned_b: list[int] = []
        for b in u_bots:
            avail = cand_slots[b] & us_mask & ~used_s
            if avail:
                # Pick random candidate bit from avail.
                choices: list[int] = []
                tmp = avail
                while tmp:
                    lsb = tmp & -tmp
                    choices.append(lsb.bit_length() - 1)
                    tmp ^= lsb
                s = rng.choice(choices)
                assigned[b] = s
                used_s |= 1 << s
            else:
                unassigned_b.append(b)

        rem_slots = [s for s in u_slots if not (used_s & (1 << s))]
        rng.shuffle(rem_slots)
        for b, s in zip(unassigned_b, rem_slots):
            assigned[b] = s

        # Fix any collision with p0[b] in >=2 steps.
        if len(u_bots) >= 2:
            for idx, b in enumerate(u_bots):
                if assigned[b] == t.p0[b]:
                    other = u_bots[(idx + 1) % len(u_bots)]
                    assigned[b], assigned[other] = assigned[other], assigned[b]

        slot_of = list(t.p0)
        for b, s in assigned.items():
            slot_of[b] = s
        f = t.query_slot_of(slot_of)
        if f == n:
            break

        matches = f - len(t.locked_pairs)
        if matches == 0:
            for b, s in assigned.items():
                _elim(b, s)
        else:
            edges = [(b, s) for b, s in assigned.items() if s != t.p0[b]]
            blocks = t.decompose_partial_matching(edges)
            blk = _find_block_with_match(t, blocks)
            if game.is_solved():
                break
            b_hit, s_hit = t.binary_search_one_match(blk)
            if game.is_solved():
                break
            _lock(b_hit, s_hit)

    return game.query_count


def solve_shift_binary_search(game: FullReorderGame) -> int:
    """100% deterministic O(n log n) solver via cyclic shift scan + binary search.

    Uses <= n * ceil(log2 n) + 2.5 * n + O(log n) queries on every permutation.
    """
    if game.is_solved():
        return game.query_count

    n = game.n
    if n == 2:
        f = game.reorder([1, 0])
        assert f == 2
        return game.query_count

    # Step 1: Cyclic shift scan (k = 0 is already known as game.correct_count).
    c = [0] * n
    c[0] = game.correct_count
    running_sum = c[0]

    for k in range(1, n):
        if running_sum == n:
            c[k] = 0
            continue
        if k == n - 1:
            # Deduce last shift count without querying!
            c[k] = n - running_sum
            break
        # slot_of[b] = (b + k) % n  <==>  bottle_at[s] = (s - k) % n
        bottle_at = [(s - k) % n for s in range(n)]
        f = game.reorder(bottle_at)
        c[k] = f
        if f == n:
            return game.query_count
        running_sum += f

    t = TrackedReorderGame(game)

    # Step 2: Deterministically establish a Golden-Invariant baseline p0.
    zero_k = next((k for k in range(n) if c[k] == 0), None)
    if zero_k is not None:
        t.set_baseline([(b + zero_k) % n for b in range(n)])
    else:
        # Orthomorphism case: every shift has c[k] == 1 (so n is odd and c[0] == 1).
        assert c[0] == 1 and n % 2 == 1
        found_zero = False
        for j in range((n - 1) // 2):
            a, b = 2 * j, 2 * j + 1
            cand = list(range(n))
            cand[a], cand[b] = cand[b], cand[a]
            f = t.query_slot_of(cand)
            if f == n:
                return game.query_count
            if f == 0:
                t.set_baseline(cand)
                found_zero = True
                break
        if not found_zero:
            # Unique fixed point of identity MUST be n - 1!
            t.set_baseline(list(range(n)))
            t._mark_locked(n - 1, n - 1)

    # Step 3: Resolve each shift k with c[k] > 0 via Locked-Anchor Bridge binary search.
    for k in range(n):
        if game.is_solved():
            break
        if c[k] == 0:
            continue

        while not game.is_solved():
            locked_in_shift = sum(
                1 for b, s in t.locked_pairs if (b + k) % n == s
            )
            c_rem = c[k] - locked_in_shift
            if c_rem <= 0:
                break

            assert t.p0 is not None
            edges = [
                (b, (b + k) % n)
                for b in t.unlocked_bottles
                if not t.locked_slot[(b + k) % n] and (b + k) % n != t.p0[b]
            ]
            if c_rem == len(edges):
                for b, s in edges:
                    if not t.locked_bottle[b]:
                        t.lock_and_maintain_baseline(b, s)
                    if game.is_solved():
                        break
                break

            blocks = t.decompose_partial_matching(edges)
            blk = _find_block_with_match(t, blocks)
            if game.is_solved():
                break
            b_hit, s_hit = t.binary_search_one_match(blk)
            if game.is_solved():
                break
            t.lock_and_maintain_baseline(b_hit, s_hit)

    if not game.is_solved():
        assert len(t.unlocked_bottles) == 0 and t.p0 is not None
        t.query_slot_of(t.p0)

    return game.query_count
