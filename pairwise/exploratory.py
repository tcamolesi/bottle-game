"""Exploratory baseline algorithms for the Bottle Game.

These algorithms represent the progression of hypotheses explored on the way
to the optimal algorithm:
1. `solve_naive_resetting`: undoes every delta=0 swap (~n^2/2 avg, ~n^2 worst).
2. `solve_pivot_sweep`: non-resetting sweep of a pivot slot (~n^2/(2e) avg, ~n^2/2 worst).
3. `solve_history_sweep`: tracks all known-false (bottle, slot) pairs via bitmasks
   and avoids repeating failed edges (~n^2/6 avg, hits the ~n^2/3 ODE density wall).
"""

from __future__ import annotations

from game import BottleGame
from primitives import TrackedGame


def solve_naive_resetting(game: BottleGame) -> int:
    """Naive baseline: probe slot `s0` against others, undoing every `delta=0` swap."""
    tg = TrackedGame(game)
    tg.phase0_eliminate_fixed_points()

    while tg.unlocked_slots:
        if len(tg.unlocked_slots) == 2:
            a, b = tuple(tg.unlocked_slots)
            d = tg.raw_swap(a, b)
            assert d == 2, f"Expected delta=2 on last pair, got {d}"
            tg.lock(a)
            tg.lock(b)
            break

        s0 = next(iter(tg.unlocked_slots))
        others = [s for s in tg.unlocked_slots if s != s0]
        for s in others:
            if tg.locked_slot[s0]:
                break
            if tg.locked_slot[s]:
                continue
            d = tg.raw_swap(s0, s)
            if d == 0:
                # Undo the unproductive swap so s0 keeps its original bottle.
                tg.raw_swap(s0, s)
            elif d == 2:
                tg.lock(s0)
                tg.lock(s)
                break
            elif d == 1:
                tg.resolve_hit(s0, s)
                break
            else:
                raise AssertionError(f"Unexpected delta {d}")

    return game.swap_count


def solve_pivot_sweep(game: BottleGame) -> int:
    """Non-resetting pivot sweep: never undoes `delta=0` swaps."""
    tg = TrackedGame(game)
    tg.phase0_eliminate_fixed_points()
    tg.finish_small_phase2()
    return game.swap_count


def solve_history_sweep(game: BottleGame) -> int:
    """History-aware greedy sweep using bitmasks of proven-false `(bottle, slot)` pairs.

    At each outer iteration, selects the unlocked slot `s0` with the fewest
    remaining untested candidate bottles and sweeps `s0` over unlocked slots
    whose current bottle has not yet been tested in `s0`.
    """
    tg = TrackedGame(game)
    tg.phase0_eliminate_fixed_points()

    n = game.n
    # Bit `b` in `tested_for_slot[s]` is 1 iff bottle `b` is known not to belong in `s`.
    tested_for_slot: list[int] = [0] * n
    unlocked_bottles_mask = 0
    for s in tg.unlocked_slots:
        b = tg.bottle_at[s]
        tested_for_slot[s] = 1 << b
        unlocked_bottles_mask |= 1 << b

    def _sync_lock_mask() -> int:
        mask = 0
        for b in tg.unlocked_bottles:
            mask |= 1 << b
        return mask

    while tg.unlocked_slots:
        if len(tg.unlocked_slots) == 2:
            a, b = tuple(tg.unlocked_slots)
            d = tg.raw_swap(a, b)
            assert d == 2, f"Expected delta=2 on last pair, got {d}"
            tg.lock(a)
            tg.lock(b)
            break

        # Pick unlocked slot `s0` with the maximum number of already-tested unlocked bottles.
        s0 = max(
            tg.unlocked_slots,
            key=lambda s: (tested_for_slot[s] & unlocked_bottles_mask).bit_count(),
        )

        # Scan unlocked slots `s != s0` whose current bottle hasn't been tested in `s0`.
        # Prefer swaps where BOTH newly formed edges (b_s, s0) and (b_s0, s) are untested.
        best_s = None
        fallback_s = None
        t_s0 = tested_for_slot[s0]
        b0 = tg.bottle_at[s0]
        bit_b0 = 1 << b0
        for s in tg.unlocked_slots:
            if s == s0:
                continue
            bs = tg.bottle_at[s]
            if not (t_s0 & (1 << bs)):
                if not (tested_for_slot[s] & bit_b0):
                    best_s = s
                    break
                if fallback_s is None:
                    fallback_s = s

        target = best_s if best_s is not None else fallback_s
        assert target is not None, f"Slot {s0} ran out of untested bottles unexpectedly"

        # Record the two new edges being tested by swapping (s0, target).
        b_s0 = tg.bottle_at[s0]
        b_t = tg.bottle_at[target]
        tested_for_slot[s0] |= 1 << b_t
        tested_for_slot[target] |= 1 << b_s0

        d = tg.raw_swap(s0, target)
        if d == 2:
            tg.lock(s0)
            tg.lock(target)
            unlocked_bottles_mask = _sync_lock_mask()
        elif d == 1:
            changed_slots: list[int] = [s0, target]
            w = tg.resolve_hit(s0, target)
            if w is not None:
                changed_slots.append(w)
            unlocked_bottles_mask = _sync_lock_mask()
            # Any unlocked slot currently has a non-fixed bottle (Golden Invariant).
            for x in tg.unlocked_slots:
                tested_for_slot[x] |= 1 << tg.bottle_at[x]

    return game.swap_count
