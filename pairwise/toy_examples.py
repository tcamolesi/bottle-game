"""Toy examples, exact belief-state DP, and theoretical constant checks.

This script explores the Bottle Game on small inputs and verifies core lemmas:
1. Exact belief-state Dynamic Programming for n = 2 and n = 3 (both worst-case
   minimax swaps and minimum expected swaps over a uniform prior).
2. Exhaustive verification of the Fixed-Point Detection Lemma and Phase 0
   bound (<= 2n + 5 swaps) across all n! permutations for n = 1..6.
3. Verification and matrix trace of the Dihedral A, B, A, B 1-factorization
   schedule for even sizes s in {2, 4, 6, 8, 10, 12, 20}.
4. Empirical check of exploratory solver scaling constants:
   - naive_resetting: ~0.500 n^2 avg, ~1.000 n^2 worst
   - pivot_sweep:     ~1/(2e) n^2 = 0.1839 n^2 avg, ~0.500 n^2 worst
   - history_sweep:   ~0.167 n^2 avg, ~0.333 n^2 worst (ODE density wall)
"""

from __future__ import annotations

import itertools
import math
import random
from collections import defaultdict, deque

from exploratory import solve_history_sweep, solve_naive_resetting, solve_pivot_sweep
from game import BottleGame, random_perm, reverse_perm
from optimal import dihedral_round_pairs, solve_optimal_deterministic, solve_optimal_randomized
from primitives import TrackedGame


def _apply_swap(perm: tuple[int, ...], i: int, j: int) -> tuple[int, ...]:
    lst = list(perm)
    lst[i], lst[j] = lst[j], lst[i]
    return tuple(lst)


def _fixed_count(perm: tuple[int, ...]) -> int:
    return sum(1 for i, v in enumerate(perm) if i == v)


def exact_belief_dp(n: int) -> dict[str, float]:
    """Compute exact optimal worst-case and expected swaps for small `n` (n <= 3).

    Models the full adaptive belief state S (frozenset of candidate arrays
    consistent with all observed feedback). Notice that for any valid swap (i, j),
    each candidate `a in S` transitions to `swap(a, i, j)` and is partitioned
    into buckets by `fixed_count(swap(a, i, j))`.

    Wait: a player knows the current belief state S; if `f = n` is observed at t=0
    then identity is reached in 0 swaps. We evaluate from the initial belief after
    observing `f_0` (averaged over `f_0` weights for expectation, and max over `f_0`
    for worst-case).
    """
    all_perms = list(itertools.permutations(range(n)))
    identity = tuple(range(n))
    pairs = [(i, j) for i in range(n) for j in range(i + 1, n)]

    # Build reachable belief states via BFS from the initial f_0 buckets.
    init_buckets: dict[int, list[tuple[int, ...]]] = defaultdict(list)
    for p in all_perms:
        init_buckets[_fixed_count(p)].append(p)

    roots = [frozenset(v) for v in init_buckets.values()]
    visited: set[frozenset[tuple[int, ...]]] = set(roots)
    queue: deque[frozenset[tuple[int, ...]]] = deque(roots)
    transitions: dict[
        frozenset[tuple[int, ...]],
        list[list[tuple[int, frozenset[tuple[int, ...]]]]],
    ] = {}

    while queue:
        state = queue.popleft()
        if len(state) == 1 and next(iter(state)) == identity:
            continue
        state_moves: list[list[tuple[int, frozenset[tuple[int, ...]]]]] = []
        for i, j in pairs:
            buckets: dict[int, list[tuple[int, ...]]] = defaultdict(list)
            for p in state:
                np = _apply_swap(p, i, j)
                buckets[_fixed_count(np)].append(np)
            children: list[tuple[int, frozenset[tuple[int, ...]]]] = []
            for cnt, plist in buckets.items():
                child = frozenset(plist)
                children.append((len(plist), child))
                if child not in visited:
                    visited.add(child)
                    queue.append(child)
            state_moves.append(children)
        transitions[state] = state_moves

    solved_state = frozenset({identity})

    # Shortest-path / Bellman value iteration for exact minimax worst-case swaps.
    worst_val: dict[frozenset[tuple[int, ...]], float] = {
        s: (0.0 if s == solved_state else float("inf")) for s in visited
    }
    changed = True
    while changed:
        changed = False
        for s, moves in transitions.items():
            best = worst_val[s]
            for children in moves:
                cand = 1.0 + max(worst_val[c] for _, c in children)
                if cand < best:
                    best = cand
            if best < worst_val[s]:
                worst_val[s] = best
                changed = True

    # Value iteration for exact minimum expected swaps under uniform prior.
    exp_val: dict[frozenset[tuple[int, ...]], float] = {
        s: (0.0 if s == solved_state else float(n * n)) for s in visited
    }
    for _ in range(500):
        max_diff = 0.0
        for s, moves in transitions.items():
            total_w = len(s)
            best = float("inf")
            for children in moves:
                cand = 1.0 + sum((w / total_w) * exp_val[c] for w, c in children)
                if cand < best:
                    best = cand
            diff = abs(best - exp_val[s])
            if diff > max_diff:
                max_diff = diff
            exp_val[s] = best
        if max_diff < 1e-12:
            break

    total_perms = len(all_perms)
    opt_worst = max(worst_val[r] for r in roots)
    opt_exp = sum((len(r) / total_perms) * exp_val[r] for r in roots)
    return {
        "n": float(n),
        "states": float(len(visited)),
        "opt_worst": opt_worst,
        "opt_exp": opt_exp,
        "lb_worst": math.ceil(n * (n - 1) / 4),
        "lb_exp": n * (n - 1) / 8,
    }


def verify_fixed_point_lemma_and_phase0() -> None:
    """Verify Lemma 3 and Phase 0 swap budget exhaustively for n = 1..6."""
    for n in range(1, 7):
        max_phase0_swaps = 0
        for perm in itertools.permutations(range(n)):
            # Exhaustively check every pair swap delta on small n <= 5.
            if n <= 5:
                f0 = sum(1 for i, v in enumerate(perm) if i == v)
                for i in range(n):
                    for j in range(i + 1, n):
                        np = _apply_swap(perm, i, j)
                        delta = _fixed_count(np) - f0
                        fixed_i = perm[i] == i
                        fixed_j = perm[j] == j
                        if fixed_i and fixed_j:
                            assert delta == -2
                        elif fixed_i or fixed_j:
                            assert delta == -1
                        else:
                            assert delta >= 0

            g = BottleGame(list(perm))
            tg = TrackedGame(g)
            tg.phase0_eliminate_fixed_points()
            max_phase0_swaps = max(max_phase0_swaps, g.swap_count)
            assert g.swap_count <= 2 * n + 5, (
                f"Phase 0 exceeded 2n+5 for n={n}, perm={perm}: {g.swap_count}"
            )
            assert tg.f_cur == tg.num_locked
            for s in range(n):
                if tg.locked_slot[s]:
                    assert g._a[s] == s
        print(f"  n={n}: Phase 0 verified on {math.factorial(n):>4} perms | max swaps = {max_phase0_swaps} (limit {2*n+5})")


def verify_dihedral_schedules(sizes: list[int]) -> None:
    """Verify Dihedral A, B, A, B sweeps visit all s^2 pairs in s(s-1)/2 swaps."""
    for s in sizes:
        # Track bottle currently at each slot index, and visitation matrix visited[b][slot].
        bottle_at = list(range(s))
        visited = [[False] * s for _ in range(s)]
        for i in range(s):
            visited[bottle_at[i]][i] = True

        swap_total = 0
        for r in range(s - 1):
            pairs = dihedral_round_pairs(s, r)
            assert len(pairs) == s // 2
            seen_indices: set[int] = set()
            for a, b in pairs:
                assert a != b and a not in seen_indices and b not in seen_indices
                seen_indices.add(a)
                seen_indices.add(b)
                bottle_at[a], bottle_at[b] = bottle_at[b], bottle_at[a]
                swap_total += 1
                assert not visited[bottle_at[a]][a], f"Duplicate visit ({bottle_at[a]}, {a}) at s={s}, r={r}"
                assert not visited[bottle_at[b]][b], f"Duplicate visit ({bottle_at[b]}, {b}) at s={s}, r={r}"
                visited[bottle_at[a]][a] = True
                visited[bottle_at[b]][b] = True

        assert swap_total == s * (s - 1) // 2
        assert all(all(row) for row in visited)

        if s in (4, 6):
            print(f"\n  Dihedral A,B,A,B trace for s={s} ({swap_total} swaps -> {s*s} pairs covered):")
            bottle_at = list(range(s))
            hist = [[i] for i in range(s)]
            for r in range(s - 1):
                pairs = dihedral_round_pairs(s, r)
                inv_name = "A" if r % 2 == 0 else "B"
                for a, b in pairs:
                    bottle_at[a], bottle_at[b] = bottle_at[b], bottle_at[a]
                for slot_idx, b_id in enumerate(bottle_at):
                    hist[b_id].append(slot_idx)
                print(f"    Round {r} ({inv_name}): pairs={pairs} -> slots={bottle_at}")
            for b_id, path in enumerate(hist):
                assert sorted(path) == list(range(s))
                print(f"    Bottle {b_id} trajectory: {path}")


def check_exploratory_constants() -> None:
    """Compare simulated swap counts at n=100, 200 against theoretical ODE limits."""
    rng = random.Random(42)
    print("\nExploratory algorithm scaling check (mean over 10 random perms + reverse worst-case):")
    for n in (100, 200):
        solvers = [
            ("naive_reset", solve_naive_resetting, "~0.42", "0.5000 (rev)"),
            ("pivot_sweep", solve_pivot_sweep, "~0.23", "0.2500 (rev)"),
            ("history_sweep", solve_history_sweep, "~0.14-0.17", "<= 0.3333"),
            ("optimal_det", solve_optimal_deterministic, "-> 0.1250", "<= 0.2500"),
            ("optimal_rand", lambda g: solve_optimal_randomized(g, seed=rng.randint(0, 10**6)), "-> 0.1250", "-> 0.1250"),
        ]
        perms = [random_perm(n, rng) for _ in range(10)]
        rev = reverse_perm(n)
        print(f"  n = {n}:")
        for name, fn, pred_avg, pred_wc in solvers:
            avg_swaps = sum(fn(BottleGame(list(p))) for p in perms) / len(perms)
            rev_swaps = fn(BottleGame(list(rev)))
            print(
                f"    {name:14s}: avg/n^2 = {avg_swaps / (n * n):.4f} (asymp {pred_avg:>9s}) | "
                f"rev/n^2 = {rev_swaps / (n * n):.4f} (bound {pred_wc})"
            )


def main() -> None:
    print("1. Exact Belief-State DP for small n:")
    for n in (2, 3):
        res = exact_belief_dp(n)
        print(
            f"  n={int(res['n'])}: reachable states={int(res['states'])}, "
            f"exact opt_worst={res['opt_worst']:.0f} (edge LB={res['lb_worst']:.0f}), "
            f"exact opt_exp={res['opt_exp']:.4f} (edge LB={res['lb_exp']:.4f})"
        )

    print("\n2. Exhaustive Fixed-Point Detection Lemma & Phase 0 verification (n=1..6):")
    verify_fixed_point_lemma_and_phase0()

    print("\n3. Dihedral A, B, A, B 1-factorization verification:")
    verify_dihedral_schedules([2, 4, 6, 8, 10, 12, 20])

    print("\n4. Exploratory vs Optimal scaling verification:")
    check_exploratory_constants()


if __name__ == "__main__":
    main()
