"""Core Bottle Game environment and permutation generators.

In the Bottle Game, a hidden permutation `a` of `{0, ..., n-1}` is sorted via
pair swaps. After each swap `(i, j)` with `i != j`, the oracle reveals only
the scalar fixed-point count `|{k : a[k] == k}|`.
"""

from __future__ import annotations

import random


class BottleGame:
    """Black-box oracle for the Bottle Game.

    The underlying array `_a` is intentionally kept private so solvers can
    only inspect `n`, `correct_count`, `swap_count`, `is_solved()`, and the
    feedback returned by `swap(i, j)`.
    """

    def __init__(self, perm: list[int]) -> None:
        n = len(perm)
        if sorted(perm) != list(range(n)):
            raise ValueError(f"Expected a permutation of 0..{n - 1}, got {perm!r}")
        self._a: list[int] = list(perm)
        self.n: int = n
        self._correct: int = sum(1 for i, v in enumerate(self._a) if i == v)
        self.swap_count: int = 0

    @property
    def correct_count(self) -> int:
        """Current number of indices `i` with `a[i] == i`."""
        return self._correct

    def is_solved(self) -> bool:
        """Return True iff the hidden permutation is completely sorted."""
        return self._correct == self.n

    def swap(self, i: int, j: int) -> int:
        """Swap positions `i` and `j` (`i != j`) and return new `correct_count`."""
        if not (0 <= i < self.n and 0 <= j < self.n):
            raise IndexError(f"Swap indices ({i}, {j}) out of range for n={self.n}")
        if i == j:
            raise ValueError(f"Swap indices must be distinct, got ({i}, {j})")

        old_i = self._a[i]
        old_j = self._a[j]
        delta = (
            (1 if old_j == i else 0)
            + (1 if old_i == j else 0)
            - (1 if old_i == i else 0)
            - (1 if old_j == j else 0)
        )
        self._a[i], self._a[j] = old_j, old_i
        self._correct += delta
        self.swap_count += 1
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
        raise ValueError(f"Cannot construct perm of size {n} with {num_fixed} fixed points")
    r = rng if rng is not None else random
    indices = list(range(n))
    fixed_positions = set(r.sample(indices, num_fixed))
    unfixed = [i for i in indices if i not in fixed_positions]
    der = random_derangement(len(unfixed), r)
    arr = list(range(n))
    for idx, val in zip(unfixed, [unfixed[d] for d in der]):
        arr[idx] = val
    return arr
