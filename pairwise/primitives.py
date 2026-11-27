"""Shared bottle/slot tracking and fixed-point maintenance primitives.

This module implements:
- `TrackedGame`: maintains the bijection between initial-position bottle IDs
  (`0..n-1`) and current slot positions (`0..n-1`), plus the locked set.
- `phase0_eliminate_fixed_points`: detects and locks all `f_0` initial fixed
  points in <= 2n + 5 swaps, establishing the Golden Invariant `f_cur == num_locked`.
- `resolve_hit`: restores `f_cur == num_locked` in <= 2 swaps per newly locked
  slot whenever a swap produces `delta == +1`.
- `sweep_single_bottle` and `finish_small_phase2`: deterministic clean-up routines.
"""

from __future__ import annotations

from game import BottleGame


class TrackedGame:
    """Tracks bottle-to-slot positions, locked elements, and fixed-point invariants."""

    def __init__(self, game: BottleGame) -> None:
        self.game: BottleGame = game
        self.n: int = game.n
        # Bottle `b` is the item that started at index `b` at t=0.
        self.bottle_at: list[int] = list(range(self.n))
        self.slot_of: list[int] = list(range(self.n))
        self.locked_slot: list[bool] = [False] * self.n
        self.locked_bottle: list[bool] = [False] * self.n
        self.unlocked_slots: set[int] = set(range(self.n))
        self.unlocked_bottles: set[int] = set(range(self.n))
        self.num_locked: int = 0
        self.f_cur: int = game.correct_count

    def raw_swap(self, i: int, j: int) -> int:
        """Swap slots `i` and `j`, update tracking maps, and return delta `f_new - f_old`."""
        new_f = self.game.swap(i, j)
        delta = new_f - self.f_cur
        self.f_cur = new_f

        bi = self.bottle_at[i]
        bj = self.bottle_at[j]
        self.bottle_at[i] = bj
        self.bottle_at[j] = bi
        self.slot_of[bi] = j
        self.slot_of[bj] = i
        return delta

    def lock(self, slot: int) -> None:
        """Mark `slot` and the bottle currently inside it as permanently fixed."""
        assert not self.locked_slot[slot], f"Slot {slot} already locked"
        bottle = self.bottle_at[slot]
        assert not self.locked_bottle[bottle], f"Bottle {bottle} already locked"
        self.locked_slot[slot] = True
        self.locked_bottle[bottle] = True
        self.unlocked_slots.discard(slot)
        self.unlocked_bottles.discard(bottle)
        self.num_locked += 1

    def _find_fixed_among_pair(self, a: int, b: int, w: int) -> tuple[int, bool]:
        """Identify which of `{a, b}` is fixed given exactly one of them is fixed.

        Returns `(fixed_slot, w_is_also_fixed)`. Leaves the array unchanged.
        Precondition: `w not in {a, b}`, and `is_fixed(a) ^ is_fixed(b)`.
        """
        d1 = self.raw_swap(a, w)
        self.raw_swap(a, w)
        if d1 == -2:
            # Both `a` and `w` were fixed.
            return a, True
        if d1 >= 0:
            # Neither `a` nor `w` was fixed, so `b` must be fixed.
            return b, False

        # d1 == -1: exactly one of {a, w} is fixed.
        d2 = self.raw_swap(b, w)
        self.raw_swap(b, w)
        assert d2 != -1, "Impossible: both (a^w) and (b^w) cannot hold when (a^b) holds"
        if d2 == -2:
            # Both `b` and `w` were fixed.
            return b, True
        # Neither `b` nor `w` was fixed, so `a` is fixed and `w` is not.
        return a, False

    def phase0_eliminate_fixed_points(self) -> None:
        """Find and lock all initial fixed points so `f_cur == num_locked`.

        Uses <= 2n + 5 swaps in all cases.
        """
        if self.f_cur == self.n:
            for s in range(self.n):
                if not self.locked_slot[s]:
                    self.lock(s)
            return

        if self.f_cur == 0:
            return

        # Since f_cur != n and f_cur != 0, and a perm cannot have n - 1 fixed points,
        # we must have n >= 3 and 1 <= f_cur <= n - 2.
        assert self.n >= 3

        known_non_fixed: set[int] = set()
        anchor: int | None = None

        k = 0
        while k + 1 < self.n:
            d = self.raw_swap(k, k + 1)
            if d == -2:
                # Both k and k+1 were fixed; restore and lock both.
                self.raw_swap(k, k + 1)
                self.lock(k)
                self.lock(k + 1)
                anchor = k
                break
            if d == -1:
                # Exactly one of {k, k+1} was fixed; restore and disambiguate.
                self.raw_swap(k, k + 1)
                w = 0 if k > 0 else 2
                fixed_slot, w_fixed = self._find_fixed_among_pair(k, k + 1, w)
                self.lock(fixed_slot)
                if w_fixed:
                    self.lock(w)
                anchor = fixed_slot
                break
            if d == 2:
                # Neither was fixed, and swapping fixed BOTH! Keep and lock both.
                self.lock(k)
                self.lock(k + 1)
                anchor = k
                break
            if d == 1:
                # Neither was fixed, and swapping fixed exactly ONE! Keep and disambiguate.
                w = 0 if k > 0 else 2
                fixed_slot, w_fixed = self._find_fixed_among_pair(k, k + 1, w)
                self.lock(fixed_slot)
                if w_fixed:
                    self.lock(w)
                anchor = fixed_slot
                break
            # d == 0: neither k nor k+1 is fixed after this swap.
            known_non_fixed.add(k)
            known_non_fixed.add(k + 1)
            k += 2

        if anchor is None:
            # All pairs (0,1), (2,3), ... had 0 fixed points, so n is odd and n-1 is fixed.
            anchor = self.n - 1
            self.lock(anchor)

        # Probe remaining untested slots against the known fixed anchor.
        if self.f_cur > self.num_locked:
            for i in range(self.n):
                if self.f_cur == self.num_locked:
                    break
                if self.locked_slot[i] or i in known_non_fixed:
                    continue
                d = self.raw_swap(anchor, i)
                self.raw_swap(anchor, i)
                if d == -2:
                    self.lock(i)

        assert self.f_cur == self.num_locked, (
            f"Phase 0 invariant failed: f_cur={self.f_cur}, num_locked={self.num_locked}"
        )

    def resolve_two_pending(self, a: int, b: int, c: int, d: int) -> None:
        """Resolve two disjoint pending 1-hit pairs `{a, b}` and `{c, d}` in 2 or 4 swaps.

        Precondition: each of `{a, b}` and `{c, d}` contains exactly 1 unlocked fixed point.
        """
        d1 = self.raw_swap(a, c)
        self.raw_swap(a, c)
        if d1 == -2:
            self.lock(a)
            self.lock(c)
            return
        if d1 >= 0:
            self.lock(b)
            self.lock(d)
            return
        # d1 == -1: a ^ c
        d2 = self.raw_swap(a, d)
        self.raw_swap(a, d)
        assert d2 != -1, "Impossible: both (a^c) and (a^d) when (c^d) holds"
        if d2 == -2:
            self.lock(a)
            self.lock(d)
        else:
            self.lock(b)
            self.lock(c)

    def resolve_hit(
        self,
        a: int,
        b: int,
        exclude: set[int] | None = None,
        extra_pending: int = 0,
        undo_on_zero: bool = True,
        hard_exclude: set[int] | None = None,
        pending_slot_pairs: dict[int, int] | None = None,
    ) -> int | None:
        """Resolve a delta=+1 hit between unlocked slots `a` and `b`.

        Precondition:
        - `self.f_cur == self.num_locked + 1 + extra_pending`
        - Both `a` and `b` are unlocked (`a != b`), and the unique unlocked fixed
          point among `{a, b}` is either `a` or `b`.

        Postcondition:
        - `self.f_cur == self.num_locked + remaining_extra_pending`.
        - Uses <= 2 swaps per newly locked slot (iterative, O(1) stack space).
        - If `a` ended up locked and the bottle that started at `a` on entry
          is NOT locked, returns the unlocked slot `w` where that bottle now sits;
          otherwise returns `None`.
        """
        assert self.f_cur == self.num_locked + 1 + extra_pending
        assert a != b and not self.locked_slot[a] and not self.locked_slot[b]

        orig_bottle_a = self.bottle_at[a]
        first_w: int | None = None
        banned = {a} | (set(exclude) if exclude else set())
        hard_banned = {a} | (set(hard_exclude) if hard_exclude else set())
        cur_b = b

        while True:
            banned.add(cur_b)
            hard_banned.add(cur_b)

            w: int | None = None
            for cand in self.unlocked_slots:
                if cand not in banned:
                    w = cand
                    break
            if w is None:
                for cand in self.unlocked_slots:
                    if cand not in hard_banned:
                        w = cand
                        break

            if w is None:
                # Only reachable if EVERY unlocked slot in the game lies in `{a, cur_b}`
                # or inside `pending_slot_pairs`. Resolve `{a, cur_b}` jointly with one
                # pending pair `{c, d}`.
                assert pending_slot_pairs, "Need at least 3 unlocked slots to resolve a +1 hit"
                c: int | None = None
                for cand in self.unlocked_slots:
                    if cand != a and cand != cur_b and cand in pending_slot_pairs:
                        c = cand
                        break
                assert c is not None, "Pending slot map inconsistent with hard_exclude"
                d_slot = pending_slot_pairs.pop(c)
                pending_slot_pairs.pop(d_slot)
                self.resolve_two_pending(a, cur_b, c, d_slot)
                break

            d = self.raw_swap(a, w)
            if d == -1:
                # `a` was fixed; undo and lock `a`.
                self.raw_swap(a, w)
                self.lock(a)
                break
            if d == 0:
                # Neither `a` nor `w` became fixed and `a` wasn't fixed -> `cur_b` is fixed.
                if undo_on_zero:
                    self.raw_swap(a, w)
                self.lock(cur_b)
                break
            if d == 2:
                # `cur_b` was fixed, and swapping `(a, w)` fixed BOTH `a` and `w`!
                self.lock(cur_b)
                self.lock(a)
                self.lock(w)
                break
            if d == 1:
                # `cur_b` was fixed, and swapping `(a, w)` fixed one of `{a, w}`.
                if first_w is None:
                    first_w = w
                self.lock(cur_b)
                cur_b = w
                continue

            raise AssertionError(f"Unexpected delta {d} during resolve_hit({a}, {cur_b})")

        if (
            first_w is not None
            and self.locked_slot[a]
            and not self.locked_bottle[orig_bottle_a]
        ):
            return first_w
        return None

    def phase0_fast(self, small_threshold: int = 16) -> list[tuple[int, int]]:
        """Eliminate all initial fixed points with minimax-distilled no-undo probing.

        Key Trick #3 improvements over naive `phase0_eliminate_fixed_points`:
        1. Never undoes `delta=0` swaps and reuses the single fixed `anchor` for
           remaining pairs (`1..3` swaps per pair instead of `2..4`).
        2. When remaining size < `small_threshold`, skips undoing `delta=-1` (when
           a fixed point just got cleared!) and skips 4-swap disambiguation on
           `delta=+1` before an anchor exists, clearing fixed points in ~1 swap/pair.
        3. Records and returns all proven-false `(bottle, slot)` pairs observed so
           Phase 2 never re-tests them.
        """
        if self.f_cur == self.n:
            for s in range(self.n):
                if not self.locked_slot[s]:
                    self.lock(s)
            return []

        if self.f_cur == 0:
            return [(self.bottle_at[s], s) for s in self.unlocked_slots]

        assert self.n >= 3
        anchor: int | None = None
        false_pairs: list[tuple[int, int]] = []

        k = 0
        while k + 1 < self.n and self.f_cur > self.num_locked:
            if self.locked_slot[k] and self.locked_slot[k + 1]:
                k += 2
                continue
            if self.locked_slot[k] or self.locked_slot[k + 1]:
                other = k + 1 if self.locked_slot[k] else k
                assert anchor is not None
                dp = self.raw_swap(anchor, other)
                self.raw_swap(anchor, other)
                if dp == -2:
                    self.lock(other)
                else:
                    false_pairs.append((self.bottle_at[other], other))
                k += 2
                continue

            d = self.raw_swap(k, k + 1)
            if d == 0:
                false_pairs.append((self.bottle_at[k], k))
                false_pairs.append((self.bottle_at[k + 1], k + 1))
            elif d == 2:
                self.lock(k)
                self.lock(k + 1)
                if anchor is None:
                    anchor = k
            elif d == -2:
                self.raw_swap(k, k + 1)
                self.lock(k)
                self.lock(k + 1)
                if anchor is None:
                    anchor = k
            elif d == -1:
                if self.n - self.num_locked < small_threshold:
                    # No-undo shortcut: both k and k+1 are now non-fixed!
                    false_pairs.append((self.bottle_at[k], k))
                    false_pairs.append((self.bottle_at[k + 1], k + 1))
                else:
                    self.raw_swap(k, k + 1)
                    if anchor is not None:
                        dp = self.raw_swap(anchor, k)
                        self.raw_swap(anchor, k)
                        fixed_slot = k if dp == -2 else k + 1
                        other = k + 1 if fixed_slot == k else k
                        self.lock(fixed_slot)
                        false_pairs.append((self.bottle_at[other], other))
                    else:
                        w = 0 if k > 0 else 2
                        fixed_slot, w_fixed = self._find_fixed_among_pair(k, k + 1, w)
                        other = k + 1 if fixed_slot == k else k
                        self.lock(fixed_slot)
                        anchor = fixed_slot
                        false_pairs.append((self.bottle_at[other], other))
                        if w_fixed and not self.locked_slot[w]:
                            self.lock(w)
            elif d == 1:
                if self.n - self.num_locked < small_threshold and anchor is None:
                    # Undo the accidental hit in 1 swap to keep 0 fixed points in {k, k+1}.
                    self.raw_swap(k, k + 1)
                    false_pairs.append((self.bottle_at[k], k))
                    false_pairs.append((self.bottle_at[k + 1], k + 1))
                else:
                    if anchor is not None:
                        dp = self.raw_swap(anchor, k)
                        self.raw_swap(anchor, k)
                        fixed_slot = k if dp == -2 else k + 1
                        other = k + 1 if fixed_slot == k else k
                        self.lock(fixed_slot)
                        false_pairs.append((self.bottle_at[other], other))
                    else:
                        w = 0 if k > 0 else 2
                        fixed_slot, w_fixed = self._find_fixed_among_pair(k, k + 1, w)
                        other = k + 1 if fixed_slot == k else k
                        self.lock(fixed_slot)
                        anchor = fixed_slot
                        false_pairs.append((self.bottle_at[other], other))
                        if w_fixed and not self.locked_slot[w]:
                            self.lock(w)
            else:
                raise AssertionError(f"Unexpected delta {d} in phase0_fast")

            k += 2

        if self.f_cur > self.num_locked:
            assert self.f_cur == self.num_locked + 1
            assert not self.locked_slot[self.n - 1]
            self.lock(self.n - 1)

        assert self.f_cur == self.num_locked, (
            f"phase0_fast invariant failed: f_cur={self.f_cur}, num_locked={self.num_locked}"
        )
        for s in self.unlocked_slots:
            false_pairs.append((self.bottle_at[s], s))
        return false_pairs

    def finish_deferred_history(
        self, initial_false_pairs: list[tuple[int, int]] | None = None
    ) -> None:
        """Exact endgame solver distilling Trick #3 from minimax belief trees.

        Combines:
        - Proven-false `(bottle, slot)` bitmasks (never re-testing failed edges)
        - 1-option constraint propagation (immediately locking forced slots/bottles)
        - Deferred resolution of `delta=+1` hits (`pending = (a, b)`) fused with
          the next information-gathering swap (and no-undo on `delta=0`).
        """
        assert self.f_cur == self.num_locked
        if not self.unlocked_slots:
            return

        n = self.n
        tested_for_slot: list[int] = [0] * n
        tested_for_bottle: list[int] = [0] * n

        def _mark_false(b: int, s: int) -> None:
            tested_for_slot[s] |= 1 << b
            tested_for_bottle[b] |= 1 << s

        for s in self.unlocked_slots:
            _mark_false(self.bottle_at[s], s)
        if initial_false_pairs:
            for b, s in initial_false_pairs:
                if not self.locked_bottle[b] and not self.locked_slot[s]:
                    _mark_false(b, s)

        def _sync_masks() -> tuple[int, int]:
            sm = 0
            for sl in self.unlocked_slots:
                sm |= 1 << sl
            bm = 0
            for bt in self.unlocked_bottles:
                bm |= 1 << bt
            return sm, bm

        unlocked_slots_mask, unlocked_bottles_mask = _sync_masks()
        pending: tuple[int, int] | None = None

        while self.unlocked_slots:
            if len(self.unlocked_slots) == 2:
                assert pending is None
                a, b = tuple(self.unlocked_slots)
                d = self.raw_swap(a, b)
                assert d == 2, f"Expected delta=2 on last pair, got {d}"
                self.lock(a)
                self.lock(b)
                break

            if pending is not None:
                a, b = pending
                best_choice: tuple[int, int, int] | None = None
                best_score = -1
                for p_slot, partner in ((a, b), (b, a)):
                    tp = tested_for_slot[p_slot]
                    bit_bp = 1 << self.bottle_at[p_slot]
                    for w in self.unlocked_slots:
                        if w == a or w == b:
                            continue
                        sc = (0 if (tp & (1 << self.bottle_at[w])) else 1) + (
                            0 if (tested_for_slot[w] & bit_bp) else 1
                        )
                        if sc > best_score:
                            best_score = sc
                            best_choice = (p_slot, partner, w)
                            if sc == 2:
                                break
                    if best_score == 2:
                        break

                assert best_choice is not None
                p_slot, partner, w = best_choice
                d = self.raw_swap(p_slot, w)
                if d == -1:
                    self.raw_swap(p_slot, w)
                    self.lock(p_slot)
                    pending = None
                    _mark_false(self.bottle_at[partner], partner)
                    _mark_false(self.bottle_at[w], w)
                elif d == 0:
                    # Do NOT undo (p_slot, w); lock partner and record new edges.
                    self.lock(partner)
                    pending = None
                    _mark_false(self.bottle_at[p_slot], p_slot)
                    _mark_false(self.bottle_at[w], w)
                elif d == 2:
                    self.lock(partner)
                    self.lock(p_slot)
                    self.lock(w)
                    pending = None
                elif d == 1:
                    self.lock(partner)
                    pending = (p_slot, w)
                else:
                    raise AssertionError(f"Unexpected delta {d} while resolving pending")

                unlocked_slots_mask, unlocked_bottles_mask = _sync_masks()
                continue

            # 1-option constraint propagation: forced slot.
            forced_move: tuple[int, int, bool] | None = None
            for s in self.unlocked_slots:
                avail = (~tested_for_slot[s]) & unlocked_bottles_mask
                if avail.bit_count() == 1:
                    u = (avail & -avail).bit_length() - 1
                    forced_move = (self.slot_of[u], s, True)
                    break

            if forced_move is None:
                for u in self.unlocked_bottles:
                    avail = (~tested_for_bottle[u]) & unlocked_slots_mask
                    if avail.bit_count() == 1:
                        s = (avail & -avail).bit_length() - 1
                        forced_move = (self.slot_of[u], s, False)
                        break

            if forced_move is not None:
                old_s, s, _ = forced_move
                assert old_s != s
                d = self.raw_swap(old_s, s)
                if d == 2:
                    self.lock(s)
                    self.lock(old_s)
                elif d == 1:
                    self.lock(s)
                    _mark_false(self.bottle_at[old_s], old_s)
                else:
                    raise AssertionError(f"Expected delta in (1, 2) on forced move, got {d}")
                unlocked_slots_mask, unlocked_bottles_mask = _sync_masks()
                continue

            # Normal move: pick most-constrained slot s0 and best untested partner.
            s0 = max(
                self.unlocked_slots,
                key=lambda s: (tested_for_slot[s] & unlocked_bottles_mask).bit_count(),
            )
            t_s0 = tested_for_slot[s0]
            bit_b0 = 1 << self.bottle_at[s0]
            best_target: int | None = None
            fallback_target: int | None = None
            for s in self.unlocked_slots:
                if s == s0:
                    continue
                if not (t_s0 & (1 << self.bottle_at[s])):
                    if not (tested_for_slot[s] & bit_b0):
                        best_target = s
                        break
                    if fallback_target is None:
                        fallback_target = s

            target = best_target if best_target is not None else fallback_target
            assert target is not None, f"Slot {s0} has no untested partner despite >1 option"

            d = self.raw_swap(s0, target)
            if d == 0:
                _mark_false(self.bottle_at[s0], s0)
                _mark_false(self.bottle_at[target], target)
            elif d == 2:
                self.lock(s0)
                self.lock(target)
                unlocked_slots_mask, unlocked_bottles_mask = _sync_masks()
            elif d == 1:
                pending = (s0, target)
            else:
                raise AssertionError(f"Unexpected delta {d} during finish_deferred_history")

    def sweep_single_bottle(self, u: int, candidate_slots: list[int]) -> None:
        """Sweep unlocked bottle `u` across `candidate_slots` until locked."""
        for s in candidate_slots:
            if self.locked_bottle[u]:
                break
            if self.locked_slot[s]:
                continue
            cur = self.slot_of[u]
            if cur == s:
                continue
            d = self.raw_swap(cur, s)
            if d == 2:
                self.lock(s)
                self.lock(cur)
                break
            if d == 1:
                self.resolve_hit(s, cur)

    def finish_small_phase2(self) -> None:
        """Solve remaining unlocked slots cleanly using non-resetting pivot sweeps."""
        while self.unlocked_slots:
            if len(self.unlocked_slots) == 2:
                a, b = tuple(self.unlocked_slots)
                d = self.raw_swap(a, b)
                assert d == 2, f"Expected delta=2 on last pair, got {d}"
                self.lock(a)
                self.lock(b)
                break

            s0 = next(iter(self.unlocked_slots))
            others = [s for s in self.unlocked_slots if s != s0]
            for s in others:
                if self.locked_slot[s0]:
                    break
                if self.locked_slot[s]:
                    continue
                d = self.raw_swap(s0, s)
                if d == 2:
                    self.lock(s0)
                    self.lock(s)
                    break
                if d == 1:
                    self.resolve_hit(s0, s)
                    break
