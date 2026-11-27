"""Benchmark suite for the Full-Reorder Bottle Game (V2).

Benchmarks:
- `shift_binary_search` (deterministic O(n log n))
- `random_elimination` (randomized elimination baseline, up to n = 200)
- `optimal_coin_weighing` (adaptive O(n log log n) coin-weighing)

Across sizes n in {10, 20, 50, 100, 200, 500, 1000} on random permutations, plus
adversarial inputs (`reverse_perm`, `cyclic_shift_1`, and odd-n `orthomorphism_perm`),
and writes `full_reorder/EXPERIMENT_REPORT.md`.
"""

from __future__ import annotations

import math
import random
import sys
import time
from pathlib import Path

_ROOT = str(Path(__file__).resolve().parent.parent)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from full_reorder.exploratory import (
    solve_random_elimination,
    solve_shift_binary_search,
)
from full_reorder.game import (
    FullReorderGame,
    cyclic_shift_perm,
    orthomorphism_perm,
    random_perm,
    reverse_perm,
)
from full_reorder.optimal import solve_optimal_coin_weighing


def info_lb(n: int) -> float:
    """Information-theoretic adaptive lower bound Q* ~ n - n / ln(n)."""
    if n <= 1:
        return 0.0
    if n == 2:
        return 1.0
    fact_n = math.lgamma(n + 1)
    # Exact log_{n-1}(n! * (n-2) + 1) - 1, or Stirling asymptotic n - n/ln(n).
    q = 1
    # Sum_{d=0}^Q (n-1)^d >= n!  => ((n-1)^{Q+1} - 1)/(n-2) >= n!
    target = fact_n + math.log(max(1, n - 2))
    q_exact = math.ceil(target / math.log(n - 1)) - 1
    return float(max(q, q_exact))


def run_benchmark() -> None:
    rng = random.Random(20261126)
    sizes = [10, 20, 50, 100, 200, 500, 1000]
    trials_map = {10: 20, 20: 20, 50: 10, 100: 10, 200: 5, 500: 3, 1000: 2}

    random_rows: list[dict[str, object]] = []
    for n in sizes:
        trials = trials_map[n]
        perms = [random_perm(n, rng) for _ in range(trials)]
        lb = info_lb(n)
        nlogn = n * math.log2(n)
        nloglogn = n * math.log2(math.log2(max(4, n)))

        solvers: list[tuple[str, object]] = [
            ("shift_binary_search", solve_shift_binary_search),
            ("optimal_coin_weighing", solve_optimal_coin_weighing),
        ]
        if n <= 200:
            solvers.insert(1, ("random_elimination", solve_random_elimination))

        for name, fn in solvers:
            qs: list[int] = []
            t0 = time.perf_counter()
            for ti, p in enumerate(perms):
                g = FullReorderGame(p)
                if name == "shift_binary_search":
                    q = fn(g)  # type: ignore[operator]
                else:
                    q = fn(g, seed=1000 + ti)  # type: ignore[operator]
                g.verify_solved()
                qs.append(q)
            elapsed = (time.perf_counter() - t0) / trials
            mean_q = sum(qs) / len(qs)
            max_q = max(qs)
            random_rows.append(
                {
                    "n": n,
                    "trials": trials,
                    "solver": name,
                    "mean_q": mean_q,
                    "max_q": max_q,
                    "lb": lb,
                    "ratio_lb": mean_q / lb,
                    "ratio_nlogn": mean_q / nlogn,
                    "ratio_nloglogn": mean_q / nloglogn,
                    "sec": elapsed,
                }
            )
            print(
                f"n={n:4d} | {name:22s} | mean={mean_q:8.1f} (max={max_q:5d}) | "
                f"Q/(n log2 n)={mean_q/nlogn:.3f} | Q/(n log2 log2 n)={mean_q/nloglogn:.3f} | "
                f"Q/LB={mean_q/lb:.2f}x | {elapsed:.3f}s"
            )

    adv_rows: list[dict[str, object]] = []
    for n in [101, 501, 1001]:
        cases = [
            ("reverse", reverse_perm(n)),
            ("cyclic_shift_1", cyclic_shift_perm(n, 1)),
            ("orthomorphism", orthomorphism_perm(n)),
        ]
        nlogn = n * math.log2(n)
        nloglogn = n * math.log2(math.log2(max(4, n)))
        for cname, perm in cases:
            for name, fn in [
                ("shift_binary_search", solve_shift_binary_search),
                ("optimal_coin_weighing", solve_optimal_coin_weighing),
            ]:
                t0 = time.perf_counter()
                g = FullReorderGame(perm)
                q = fn(g) if name == "shift_binary_search" else fn(g, seed=777)
                g.verify_solved()
                elapsed = time.perf_counter() - t0
                adv_rows.append(
                    {
                        "n": n,
                        "case": cname,
                        "solver": name,
                        "q": q,
                        "ratio_nlogn": q / nlogn,
                        "ratio_nloglogn": q / nloglogn,
                        "sec": elapsed,
                    }
                )
                print(
                    f"ADV n={n:4d} {cname:14s} | {name:22s} | q={q:5d} | "
                    f"Q/(n log2 n)={q/nlogn:.3f} | {elapsed:.3f}s"
                )

    # Write EXPERIMENT_REPORT.md
    lines: list[str] = [
        "# Full-Reorder Bottle Game (V2) — Experiment Report",
        "",
        "All runs verified solved via `FullReorderGame.verify_solved()`.",
        "",
        "## 1. Random Permutations Scaling",
        "",
        "| `n` | Solver | Trials | Mean Queries | Max Queries | `Q / (n log2 n)` | `Q / (n log2 log2 n)` | `Q / LB_info` | Avg Time (s) |",
        "|---:|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for r in random_rows:
        lines.append(
            f"| {r['n']} | `{r['solver']}` | {r['trials']} | "
            f"{r['mean_q']:.1f} | {r['max_q']} | "
            f"{r['ratio_nlogn']:.3f} | {r['ratio_nloglogn']:.3f} | "
            f"{r['ratio_lb']:.2f}x | {r['sec']:.3f} |"
        )

    lines.extend(
        [
            "",
            "## 2. Adversarial Inputs (Reverse, Cyclic Shift, Odd-`n` Orthomorphism)",
            "",
            "| `n` | Input | Solver | Queries | `Q / (n log2 n)` | `Q / (n log2 log2 n)` | Time (s) |",
            "|---:|---|---|---:|---:|---:|---:|",
        ]
    )
    for r in adv_rows:
        lines.append(
            f"| {r['n']} | `{r['case']}` | `{r['solver']}` | {r['q']} | "
            f"{r['ratio_nlogn']:.3f} | {r['ratio_nloglogn']:.3f} | {r['sec']:.3f} |"
        )
    lines.append("")

    report_path = Path(__file__).resolve().parent / "EXPERIMENT_REPORT.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\nWrote {report_path}")


if __name__ == "__main__":
    run_benchmark()
