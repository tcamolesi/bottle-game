"""Comprehensive test suite for the Full-Reorder Bottle Game (V2).

Tests:
1. Binary Lindström D_k exact decoding (k = 1..7) and query efficiency.
2. Las Vegas sparse integer coin-weighing soundness over 100 random instances.
3. Exhaustive verification over ALL permutations for n = 1..6 (873 permutations)
   across `shift_binary_search`, `random_elimination`, `optimal_coin_weighing`,
   and `greedy_entropy` (n = 1..5).
4. Edge-case & stress tests for n in {7, 8, 9, 15, 16, 17, 31, 32, 33, 50, 100, 200}:
   identity, reverse, cyclic shifts, single transposition, orthomorphism (odd n),
   derangements, half-fixed permutations, and random permutations.
5. Asymptotic bound assertions at n = 200 and n = 500.
"""

from __future__ import annotations

import itertools
import math
import random
import sys
from pathlib import Path

# Allow running directly as `python3 full_reorder/test_all.py` from repo root.
_ROOT = str(Path(__file__).resolve().parent.parent)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from full_reorder.coin_weighing import (
    decode_lindstrom_binary,
    lindstrom_cols,
    lindstrom_matrix,
    solve_binary_coin_weighing,
    solve_exact_integer_coin_weighing,
    solve_sparse_coin_weighing,
)
from full_reorder.exploratory import (
    solve_greedy_entropy,
    solve_random_elimination,
    solve_shift_binary_search,
)
from full_reorder.game import (
    FullReorderGame,
    cyclic_shift_perm,
    fixed_point_perm,
    orthomorphism_perm,
    random_derangement,
    random_perm,
    reverse_perm,
)
from full_reorder.optimal import (
    build_involution_factorization,
    solve_optimal_coin_weighing,
)


def _run_solver(solver_fn, perm: list[int]) -> int:
    game = FullReorderGame(list(perm))
    queries = solver_fn(game)
    game.verify_solved()
    assert queries == game.query_count, (
        f"Returned {queries} != query_count {game.query_count}"
    )
    return queries


def test_coin_weighing_unit() -> None:
    rng = random.Random(20261126)

    # 1. Lindström D_k exact recovery for k = 1..7.
    for k in range(1, 8):
        mat = lindstrom_matrix(k)
        mk = lindstrom_cols(k)
        for _ in range(5):
            x = [rng.randint(0, 1) for _ in range(mk)]
            y = [sum(row[j] * x[j] for j in range(mk)) for row in mat]
            assert decode_lindstrom_binary(k, y) == x

    # 2. solve_binary_coin_weighing across various sizes m.
    for m in [1, 2, 3, 4, 5, 10, 13, 25, 33, 80, 193, 300]:
        for density in [0.0, 0.1, 0.5, 0.9, 1.0]:
            x_true = [1 if rng.random() < density else 0 for _ in range(m)]
            q_cnt = 0

            def q_fn(idxs: list[int]) -> int:
                nonlocal q_cnt
                q_cnt += 1
                return sum(x_true[j] for j in idxs)

            x_rec = solve_binary_coin_weighing(m, sum(x_true), q_fn)
            assert x_rec == x_true, f"Binary CW failed for m={m}"
            assert q_cnt <= max(0, m - 1)

    # 3. Las Vegas sparse integer coin-weighing soundness over 100 instances.
    for _ in range(100):
        m = rng.randint(5, 80)
        caps = [rng.randint(1, 6) for _ in range(m)]
        # Sparse x with ~0.65 expected matches per block.
        x_true = [
            sum(1 for _ in range(c) if rng.random() < (0.65 / c))
            for c in caps
        ]
        total_w = sum(x_true)
        zeros, fulls, exact = solve_sparse_coin_weighing(
            m, total_w, caps, lambda idxs: sum(x_true[j] for j in idxs), rng
        )
        for j in zeros:
            assert x_true[j] == 0, f"False zero at j={j}: x_true[j]={x_true[j]}"
        for j in fulls:
            assert x_true[j] == caps[j], (
                f"False full at j={j}: x_true[j]={x_true[j]} != {caps[j]}"
            )
        if exact is not None:
            assert exact == x_true

    # 4. Exact integer coin-weighing recovery + involution 1-factorization coverage.
    for _ in range(30):
        m = rng.randint(6, 40)
        caps = [rng.randint(1, 5) for _ in range(m)]
        x_true = [rng.randint(0, c) if rng.random() < 0.35 else 0 for c in caps]
        x_rec = solve_exact_integer_coin_weighing(
            m, sum(x_true), caps, lambda idxs: sum(x_true[j] for j in idxs), rng
        )
        assert x_rec == x_true, f"Exact integer CW mismatch: {x_rec} != {x_true}"

    for n_inv in [4, 5, 10, 11, 20, 21]:
        order = list(range(n_inv))
        rng.shuffle(order)
        invs = build_involution_factorization(n_inv, order)
        seen_pairs: set[tuple[int, int]] = set()
        for inv in invs:
            used_v: set[int] = set()
            for a, b in inv:
                assert a != b and a not in used_v and b not in used_v
                used_v.add(a)
                used_v.add(b)
                pair = (a, b) if a < b else (b, a)
                assert pair not in seen_pairs
                seen_pairs.add(pair)
        assert len(seen_pairs) == n_inv * (n_inv - 1) // 2

    print("  [PASS] Coin-weighing & involution unit tests (Lindström k=1..7, Las Vegas, exact MILP, 1-factorization).")


def test_exhaustive_small_n() -> None:
    total_runs = 0
    for n in range(1, 7):
        perms = [list(p) for p in itertools.permutations(range(n))]
        solvers: list[tuple[str, object]] = [
            ("shift_bin", solve_shift_binary_search),
            ("rand_elim", lambda g: solve_random_elimination(g, seed=12345)),
            ("opt_cw", lambda g: solve_optimal_coin_weighing(g, seed=12345)),
        ]
        if n <= 5:
            solvers.append(("greedy_ent", solve_greedy_entropy))

        for _, fn in solvers:
            for perm in perms:
                _run_solver(fn, perm)
                total_runs += 1
        print(f"  [PASS] Exhaustive n={n} ({len(perms)} perms x {len(solvers)} solvers)")
    print(f"Exhaustive small-n passed: {total_runs} runs.")


def test_stress_and_edge_cases() -> None:
    rng = random.Random(20261126)
    sizes = [7, 8, 9, 15, 16, 17, 31, 32, 33, 50, 100, 200]
    solvers = [
        ("shift_bin", solve_shift_binary_search),
        ("rand_elim", lambda g: solve_random_elimination(g, seed=rng.randint(0, 10**9))),
        ("opt_cw", lambda g: solve_optimal_coin_weighing(g, seed=rng.randint(0, 10**9))),
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
        if n % 2 == 1:
            cases.append(("orthomorphism", orthomorphism_perm(n)))

        for case_name, perm in cases:
            for solver_name, fn in solvers:
                q = _run_solver(fn, perm)
                if case_name == "identity":
                    assert q == 0, f"{solver_name} used {q} queries on identity n={n}"
        print(f"  [PASS] Edge & stress cases n={n}")


def test_asymptotic_bounds() -> None:
    rng = random.Random(999)
    for n in (200, 500):
        det_bound = n * math.ceil(math.log2(n)) + 2.5 * n + 2 * math.ceil(math.log2(n)) + 5
        rev = reverse_perm(n)
        ortho = orthomorphism_perm(n + 1)

        q_det_rev = _run_solver(solve_shift_binary_search, rev)
        assert q_det_rev <= det_bound, f"Det rev too high at n={n}: {q_det_rev} > {det_bound}"

        q_det_ortho = _run_solver(solve_shift_binary_search, ortho)
        assert q_det_ortho <= det_bound + n, (
            f"Det ortho too high at n={n+1}: {q_det_ortho}"
        )

        rand_perms = [random_perm(n, rng) for _ in range(5)]
        det_means = [
            _run_solver(solve_shift_binary_search, p) for p in rand_perms
        ]
        cw_means = [
            _run_solver(lambda g, s=i: solve_optimal_coin_weighing(g, seed=s), p)
            for i, p in enumerate(rand_perms)
        ]
        det_mean = sum(det_means) / len(det_means)
        cw_mean = sum(cw_means) / len(cw_means)

        # Coin-weighing O(n log log n) must decisively beat deterministic O(n log n) at n=500.
        if n == 500:
            assert cw_mean < det_mean, (
                f"Expected opt_cw ({cw_mean:.1f}) < shift_bin ({det_mean:.1f}) at n={n}"
            )
        print(
            f"  [PASS] Bounds at n={n}: det_rev={q_det_rev}, det_ortho={q_det_ortho}, "
            f"det_rand_mean={det_mean:.1f}, opt_cw_rand_mean={cw_mean:.1f}"
        )


def main() -> None:
    print("Running coin-weighing unit tests...")
    test_coin_weighing_unit()
    print("Running exhaustive tests (n=1..6)...")
    test_exhaustive_small_n()
    print("Running edge & stress tests (n=7..200)...")
    test_stress_and_edge_cases()
    print("Running asymptotic bound assertions (n=200, 500)...")
    test_asymptotic_bounds()
    print("ALL TESTS PASSED.")


if __name__ == "__main__":
    main()
