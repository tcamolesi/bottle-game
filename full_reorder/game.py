"""Core Full-Reorder Bottle Game environment and permutation generators.

In the Full-Reorder Bottle Game (equivalent to Strict Permutation Mastermind
with black-peg feedback), a hidden permutation `a_0` of `{0, ..., n-1}` is
queried by submitting arbitrary permutations `bottle_at_slot` of `{0, ..., n-1}`.
Each query returns the scalar fixed-point count `|{s : a_0[bottle_at_slot[s]] == s}|`.
"""

from __future__ import annotations

import random


class FullReorderGame:
    """Black-box oracle for the Full-Reorder Bottle Game.

    `bottle[b]` is the item that started at index `b` at t=0 (value `a_0[b]`).
    A query `reorder(bottle_at_slot)` places bottle `bottle_at_slot[s]` into
    slot `s`, and returns the number of slots `s` whose bottle matches `s`.
    """

    def __init__(self, perm: list[int]) -> None:
        n = len(perm)
        if sorted(perm) != list(range(n)):
            raise ValueError(f"Expected a permutation of 0..{n - 1}, got {perm!r}")
        self._init_a: list[int] = list(perm)
        self._a: list[int] = list(perm)
        self.n: int = n
        self._correct: int = sum(1 for i, v in enumerate(self._a) if i == v)
        self.query_count: int = 0

    @property
    def correct_count(self) -> int:
        """Current number of slots `s` with `a[s] == s`."""
        return self._correct

    def is_solved(self) -> bool:
        """Return True iff the last queried order completely sorted the array."""
        return self._correct == self.n

    def reorder(self, bottle_at_slot: list[int]) -> int:
        """Reorder all bottles so slot `s` receives bottle `bottle_at_slot[s]`.

        Returns the new `correct_count`.
        """
        n = self.n
        if len(bottle_at_slot) != n:
            raise ValueError(f"Expected length {n}, got {len(bottle_at_slot)}")
        seen = [False] * n
        for b in bottle_at_slot:
            if not (0 <= b < n):
                raise ValueError(f"Bottle index {b} out of range for n={n}")
            if seen[b]:
                raise ValueError(f"Duplicate bottle index {b} in permutation")
            seen[b] = True

        init_a = self._init_a
        new_a = [init_a[b] for b in bottle_at_slot]
        self._a = new_a
        self._correct = sum(1 for s, v in enumerate(new_a) if s == v)
        self.query_count += 1
        return self._correct

    def verify_solved(self) -> None:
        """Assert that the internal array is strictly `0..n-1`."""
        assert self._correct == self.n, (
            f"Not solved: correct_count={self._correct}, n={self.n}"
        )
        assert self._a == list(range(self.n)), f"Array not sorted: {self._a!r}"


def random_perm(n: int, rng: random.Random | None = None) -> list[int]:
    """Generate a uniformly random permutation of `0..n-1`."""
    r = rng if rng is not None else random
    arr = list(range(n))
    r.shuffle(arr)
    return arr


def random_derangement(n: int, rng: random.Random | None = None) -> list[int]:
    """Generate a uniformly random derangement of `0..n-1` (n != 1)."""
    if n == 0:
        return []
    if n == 1:
        raise ValueError("No derangement exists for n=1")
    r = rng if rng is not None else random
    while True:
        arr = list(range(n))
        r.shuffle(arr)
        if all(arr[i] != i for i in range(n)):
            return arr


def reverse_perm(n: int) -> list[int]:
    """Return the reverse permutation `[n-1, n-2, ..., 0]`."""
    return list(range(n - 1, -1, -1))


def cyclic_shift_perm(n: int, k: int = 1) -> list[int]:
    """Return `[(i + k) % n for i in range(n)]`."""
    if n == 0:
        return []
    return [(i + k) % n for i in range(n)]


def fixed_point_perm(
    n: int, num_fixed: int, rng: random.Random | None = None
) -> list[int]:
    """Generate a permutation of length `n` with exactly `num_fixed` fixed points."""
    if not (0 <= num_fixed <= n) or num_fixed == n - 1:
        raise ValueError(
            f"Cannot construct perm of size {n} with {num_fixed} fixed points"
        )
    r = rng if rng is not None else random
    indices = list(range(n))
    fixed_positions = set(r.sample(indices, num_fixed))
    unfixed = [i for i in indices if i not in fixed_positions]
    der = random_derangement(len(unfixed), r)
    arr = list(range(n))
    for idx, val in zip(unfixed, [unfixed[d] for d in der]):
        arr[idx] = val
    return arr


def orthomorphism_perm(n: int) -> list[int]:
    """Return `[(2 * i) % n for i in range(n)]` for odd `n`.

    For every odd `n`, every cyclic shift `sigma_k(i) = (i + k) % n` satisfies
    `perm[sigma_k(i)] == i` at a unique `i`, so all `n` cyclic shifts yield
    feedback `f == 1` (zero `c_k == 0` shifts).
    """
    if n <= 0 or n % 2 == 0:
        raise ValueError(f"Orthomorphism 2*i mod n requires positive odd n, got {n}")
    return [(2 * i) % n for i in range(n)]
