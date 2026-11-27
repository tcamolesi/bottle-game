"""Comprehensive test suite for all Bottle Game solvers.

Tests:
1. Exhaustive verification over ALL permutations for n = 1..6 (873 permutations)
   across all 5 solvers (`naive_resetting`, `pivot_sweep`, `history_sweep`,
   `optimal_det`, `optimal_rand`).
2. Edge-case & stress tests for n in {7, 8, 15, 16, 17, 31, 32, 33, 50, 100, 200}:
   identity, reverse, cyclic shifts, single transposition, derangements,
   half-fixed permutations, and random permutations.
3. Asymptotic optimality sanity assertions at n = 200 on reverse_perm(200) and
   random permutations.
"""

from __future__ import annotations

import itertools
import random

from exploratory import solve_history_sweep, solve_naive_resetting, solve_pivot_sweep
from game import (
    BottleGame,
    cyclic_shift_perm,
    fixed_point_perm,
    random_derangement,
    random_perm,
    reverse_perm,
)
from optimal import solve_optimal_deterministic, solve_optimal_randomized
from optimal_v2 import solve_optimal_v2_deterministic, solve_optimal_v2_randomized


def _run_solver(solver_fn, perm: list[int]) -> int:
    game = BottleGame(list(perm))
    swaps = solver_fn(game)
    game.verify_solved()
    assert swaps == game.swap_count, f"Returned {swaps} != swap_count {game.swap_count}"
    return swaps


def test_exhaustive_small_n() -> None:
    solvers = [
        ("naive_resetting", solve_naive_resetting),
        ("pivot_sweep", solve_pivot_sweep),
        ("history_sweep", solve_history_sweep),
        ("optimal_det", solve_optimal_deterministic),
        ("optimal_rand", lambda g: solve_optimal_randomized(g, seed=12345)),
        ("optimal_v2_det", solve_optimal_v2_deterministic),
        ("optimal_v2_rand", lambda g: solve_optimal_v2_randomized(g, seed=12345)),
    ]
    total_runs = 0
    for n in range(1, 7):
        perms = [list(p) for p in itertools.permutations(range(n))]
        for name, fn in solvers:
            for perm in perms:
                _run_solver(fn, perm)
                total_runs += 1
        print(f"  [PASS] Exhaustive n={n} ({len(perms)} perms x {len(solvers)} solvers)")
    print(f"Exhaustive small-n passed: {total_runs} runs.")


def test_stress_and_edge_cases() -> None:
    rng = random.Random(20261125)
    sizes = [7, 8, 15, 16, 17, 31, 32, 33, 50, 100, 200]
    solvers = [
        ("naive_resetting", solve_naive_resetting),
        ("pivot_sweep", solve_pivot_sweep),
        ("history_sweep", solve_history_sweep),
        ("optimal_det", solve_optimal_deterministic),
        ("optimal_rand", lambda g: solve_optimal_randomized(g, seed=rng.randint(0, 10**9))),
        ("optimal_v2_det", solve_optimal_v2_deterministic),
        ("optimal_v2_rand", lambda g: solve_optimal_v2_randomized(g, seed=rng.randint(0, 10**9))),
    ]

    for n in sizes:
        cases: list[tuple[str, list[int]]] = [
            ("identity", list(range(n))),
            ("reverse", reverse_perm(n)),
            ("cyclic_1", cyclic_shift_perm(n, 1)),
            ("cyclic_half", cyclic_shift_perm(n, n // 2)),
            ("single_transposition", [n - 1] + list(range(1, n - 1)) + [0]),
            ("derangement", random_derangement(n, rng)),
            ("half_fixed", fixed_point_perm(n, n // 2, rng)),
            ("random_1", random_perm(n, rng)),
            ("random_2", random_perm(n, rng)),
        ]
        for case_name, perm in cases:
            for solver_name, fn in solvers:
                if n > 100 and solver_name == "history_sweep":
                    # history_sweep already tested up to n=100 here and up to n=500 in benchmark.
                    continue
                swaps = _run_solver(fn, perm)
                if case_name == "identity":
                    assert swaps == 0, f"{solver_name} used {swaps} swaps on identity n={n}"
        print(f"  [PASS] Edge & stress cases n={n}")


def test_optimality_bounds_n200() -> None:
    n = 200
    rev = reverse_perm(n)
    det_rev = _run_solver(solve_optimal_deterministic, rev)
    det_bound = n * (n - 1) / 4 + 3.0 * (n ** 1.5)
    assert det_rev <= det_bound, f"Det worst-case too high at n={n}: {det_rev} > {det_bound:.0f}"

    rng = random.Random(999)
    rand_rev_trials = [
        _run_solver(lambda g, s=i: solve_optimal_randomized(g, seed=s), rev)
        for i in range(10)
    ]
    rand_rev_mean = sum(rand_rev_trials) / len(rand_rev_trials)
    rand_bound = n * (n - 1) / 8 + 3.0 * (n ** 1.5)
    assert rand_rev_mean <= rand_bound, (
        f"Rand reverse mean too high at n={n}: {rand_rev_mean:.1f} > {rand_bound:.0f}"
    )

    rand_perms = [random_perm(n, rng) for _ in range(10)]
    det_rand_mean = sum(_run_solver(solve_optimal_deterministic, p) for p in rand_perms) / len(rand_perms)
    assert det_rand_mean <= rand_bound, (
        f"Det random mean too high at n={n}: {det_rand_mean:.1f} > {rand_bound:.0f}"
    )

    # Verify iterative resolve_hit handles deep >1000-step cycle unwinding cleanly.
    _run_solver(solve_optimal_deterministic, cyclic_shift_perm(1500, 1))
    _run_solver(solve_optimal_v2_deterministic, cyclic_shift_perm(1500, 1))
    v2_rev = _run_solver(solve_optimal_v2_deterministic, rev)
    assert v2_rev <= det_bound, f"v2 Det worst-case too high at n={n}: {v2_rev} > {det_bound:.0f}"
    print(
        f"  [PASS] Bounds at n=200: det_rev={det_rev} (ratio to n(n-1)/4 = {det_rev/(n*(n-1)/4):.3f}), "
        f"v2_det_rev={v2_rev} ({v2_rev/(n*(n-1)/4):.3f}), "
        f"rand_rev_mean={rand_rev_mean:.1f} (ratio to n(n-1)/8 = {rand_rev_mean/(n*(n-1)/8):.3f}), "
        f"det_rand_mean={det_rand_mean:.1f} (ratio to n(n-1)/8 = {det_rand_mean/(n*(n-1)/8):.3f}); "
        f"n=1500 cyclic_shift_1 passed for v1 & v2."
    )


def main() -> None:
    print("Running exhaustive tests (n=1..6)...")
    test_exhaustive_small_n()
    print("Running edge & stress tests (n=7..200)...")
    test_stress_and_edge_cases()
    print("Running asymptotic bound assertions (n=200)...")
    test_optimality_bounds_n200()
    print("ALL TESTS PASSED.")


if __name__ == "__main__":
    main()
