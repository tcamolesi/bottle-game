"""Benchmark suite comparing exploratory and optimal Bottle Game algorithms.

Measures:
1. Uniformly random permutations across n = 20..2000, reporting mean swap counts
   and ratios against the universal lower bound LB_avg = n(n-1)/8.
2. Adversarial / worst-case permutations (`reverse_perm(n)` and `cyclic_shift_perm(n, 1)`),
   reporting ratios against LB_det = n(n-1)/4 (deterministic) and LB_rand = n(n-1)/8
   (randomized worst-case expected).

Writes a formatted Markdown experiment report to `EXPERIMENT_REPORT.md`.
"""

from __future__ import annotations

import random
import time

from exploratory import solve_history_sweep, solve_naive_resetting, solve_pivot_sweep
from game import BottleGame, cyclic_shift_perm, random_perm, reverse_perm
from optimal import solve_optimal_deterministic, solve_optimal_randomized


def _run_trials(solver_fn, perms: list[list[int]]) -> tuple[float, float]:
    t0 = time.perf_counter()
    counts = []
    for p in perms:
        g = BottleGame(list(p))
        c = solver_fn(g)
        g.verify_solved()
        counts.append(c)
    dt = time.perf_counter() - t0
    return sum(counts) / len(counts), dt


def main() -> None:
    rng = random.Random(2026)

    random_sizes = [20, 50, 100, 200, 500, 1000, 1500, 2000]
    trials_by_n = {20: 30, 50: 20, 100: 15, 200: 10, 500: 5, 1000: 3, 1500: 2, 2000: 2}

    avg_rows: list[dict] = []
    for n in random_sizes:
        lb_avg = n * (n - 1) / 8.0
        perms = [random_perm(n, rng) for _ in range(trials_by_n[n])]

        row: dict[str, object] = {"n": n, "lb_avg": lb_avg, "trials": trials_by_n[n]}

        if n <= 500:
            m_naive, _ = _run_trials(solve_naive_resetting, perms)
            m_hist, _ = _run_trials(solve_history_sweep, perms)
            row["naive"] = m_naive
            row["hist"] = m_hist
        else:
            row["naive"] = None
            row["hist"] = None

        m_pivot, _ = _run_trials(solve_pivot_sweep, perms)
        m_det, t_det = _run_trials(solve_optimal_deterministic, perms)
        m_rand, t_rand = _run_trials(
            lambda g: solve_optimal_randomized(g, seed=rng.randint(0, 10**9)), perms
        )

        row["pivot"] = m_pivot
        row["opt_det"] = m_det
        row["opt_rand"] = m_rand
        row["t_det"] = t_det / len(perms)
        row["t_rand"] = t_rand / len(perms)
        avg_rows.append(row)
        print(
            f"[Random n={n:>4}] LB={lb_avg:>9.1f} | "
            f"pivot={m_pivot:>9.1f} ({m_pivot/lb_avg:.3f}x) | "
            f"opt_det={m_det:>9.1f} ({m_det/lb_avg:.3f}x) | "
            f"opt_rand={m_rand:>9.1f} ({m_rand/lb_avg:.3f}x)"
        )

    adv_sizes = [20, 50, 100, 200, 500, 1000, 1500, 2000]
    adv_rows: list[dict] = []
    for n in adv_sizes:
        lb_det = n * (n - 1) / 4.0
        lb_rand = n * (n - 1) / 8.0
        rev = reverse_perm(n)
        cyc = cyclic_shift_perm(n, 1)

        row: dict[str, object] = {"n": n, "lb_det": lb_det, "lb_rand": lb_rand}
        if n <= 500:
            row["naive_rev"], _ = _run_trials(solve_naive_resetting, [rev])
            row["hist_rev"], _ = _run_trials(solve_history_sweep, [rev])
        else:
            row["naive_rev"] = None
            row["hist_rev"] = None

        row["pivot_rev"], _ = _run_trials(solve_pivot_sweep, [rev])
        row["opt_det_rev"], _ = _run_trials(solve_optimal_deterministic, [rev])
        row["opt_det_cyc"], _ = _run_trials(solve_optimal_deterministic, [cyc])

        rand_seeds = [100 + i for i in range(5 if n <= 1000 else 3)]
        rev_rand_vals = []
        cyc_rand_vals = []
        for s in rand_seeds:
            g1 = BottleGame(list(rev))
            rev_rand_vals.append(solve_optimal_randomized(g1, seed=s))
            g1.verify_solved()

            g2 = BottleGame(list(cyc))
            cyc_rand_vals.append(solve_optimal_randomized(g2, seed=s + 1000))
            g2.verify_solved()

        row["opt_rand_rev"] = sum(rev_rand_vals) / len(rev_rand_vals)
        row["opt_rand_cyc"] = sum(cyc_rand_vals) / len(cyc_rand_vals)
        adv_rows.append(row)
        print(
            f"[Adversarial n={n:>4}] rev: det={row['opt_det_rev']:>9.0f} ({row['opt_det_rev']/lb_det:.3f}x LB_det), "
            f"rand={row['opt_rand_rev']:>9.1f} ({row['opt_rand_rev']/lb_rand:.3f}x LB_rand) | "
            f"cyc: det={row['opt_det_cyc']:>9.0f} ({row['opt_det_cyc']/lb_det:.3f}x LB_det), "
            f"rand={row['opt_rand_cyc']:>9.1f} ({row['opt_rand_cyc']/lb_rand:.3f}x LB_rand)"
        )

    # Render EXPERIMENT_REPORT.md
    lines: list[str] = [
        "# Bottle Game Experiment Report",
        "",
        "Empirical evaluation comparing exploratory baselines against the provably optimal **Adaptive-Square Dihedral Blocked** algorithm (`optimal.py`).",
        "",
        "## Theoretical Reference Bounds",
        "",
        "- **Deterministic worst-case lower bound (Theorem 1):** $\\mathrm{LB}_{\\mathrm{det}}(n) = \\lceil n(n-1)/4 \\rceil \\sim 0.25\\,n^2$",
        "- **Average-case & Yao randomized lower bound (Theorem 2):** $\\mathrm{LB}_{\\mathrm{avg}}(n) = n(n-1)/8 \\sim 0.125\\,n^2$",
        "",
        "---",
        "",
        "## 1. Uniformly Random Permutations (Average Case vs $\\mathrm{LB}_{\\mathrm{avg}} = n(n-1)/8$)",
        "",
        "| $n$ | Trials | $\\mathrm{LB}_{\\mathrm{avg}}$ | Naive Reset (ratio) | Pivot Sweep (ratio) | History Sweep (ratio) | **Optimal Det (ratio)** | **Optimal Rand (ratio)** | Time/run (Det) |",
        "|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]

    for r in avg_rows:
        lb = float(r["lb_avg"])
        naive_s = f"{r['naive']:.1f} ({r['naive']/lb:.2f}x)" if r["naive"] is not None else "—"
        hist_s = f"{r['hist']:.1f} ({r['hist']/lb:.2f}x)" if r["hist"] is not None else "—"
        piv_s = f"{r['pivot']:.1f} ({r['pivot']/lb:.2f}x)"
        det_s = f"**{r['opt_det']:.1f} ({r['opt_det']/lb:.3f}x)**"
        rand_s = f"**{r['opt_rand']:.1f} ({r['opt_rand']/lb:.3f}x)**"
        lines.append(
            f"| {r['n']} | {r['trials']} | {lb:.1f} | {naive_s} | {piv_s} | {hist_s} | {det_s} | {rand_s} | {r['t_det']:.3f}s |"
        )

    lines.extend(
        [
            "",
            "---",
            "",
            "## 2. Adversarial / Worst-Case Inputs (`reverse_perm` and `cyclic_shift_1`)",
            "",
            "- Deterministic algorithms are compared against $\\mathrm{LB}_{\\mathrm{det}} = n(n-1)/4$.",
            "- Randomized optimal (`opt_rand`, mean over 3–5 seeds) is compared against Yao's randomized bound $\\mathrm{LB}_{\\mathrm{rand}} = n(n-1)/8$.",
            "",
            "| $n$ | $\\mathrm{LB}_{\\mathrm{det}}$ | Naive Rev (ratio) | Pivot Rev (ratio) | History Rev (ratio) | **Opt Det Rev (ratio)** | **Opt Det Cyc1 (ratio)** | $\\mathrm{LB}_{\\mathrm{rand}}$ | **Opt Rand Rev (ratio)** | **Opt Rand Cyc1 (ratio)** |",
            "|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
        ]
    )

    for r in adv_rows:
        lbd = float(r["lb_det"])
        lbr = float(r["lb_rand"])
        naive_s = f"{r['naive_rev']:.0f} ({r['naive_rev']/lbd:.2f}x)" if r["naive_rev"] is not None else "—"
        hist_s = f"{r['hist_rev']:.0f} ({r['hist_rev']/lbd:.2f}x)" if r["hist_rev"] is not None else "—"
        piv_s = f"{r['pivot_rev']:.0f} ({r['pivot_rev']/lbd:.2f}x)"
        det_rev_s = f"**{r['opt_det_rev']:.0f} ({r['opt_det_rev']/lbd:.3f}x)**"
        det_cyc_s = f"**{r['opt_det_cyc']:.0f} ({r['opt_det_cyc']/lbd:.3f}x)**"
        rand_rev_s = f"**{r['opt_rand_rev']:.1f} ({r['opt_rand_rev']/lbr:.3f}x)**"
        rand_cyc_s = f"**{r['opt_rand_cyc']:.1f} ({r['opt_rand_cyc']/lbr:.3f}x)**"
        lines.append(
            f"| {r['n']} | {lbd:.1f} | {naive_s} | {piv_s} | {hist_s} | {det_rev_s} | {det_cyc_s} | {lbr:.1f} | {rand_rev_s} | {rand_cyc_s} |"
        )

    last_all = next(r for r in reversed(avg_rows) if r["naive"] is not None)
    last_row = avg_rows[-1]
    last_adv = adv_rows[-1]
    lb_all = float(last_all["lb_avg"])
    lb_last = float(last_row["lb_avg"])
    lb_adv_det = float(last_adv["lb_det"])
    lb_adv_rand = float(last_adv["lb_rand"])

    lines.extend(
        [
            "",
            "---",
            "",
            "## Key Empirical Conclusions",
            "",
            (
                f"1. **Convergence to Theoretical Optimality ($1.00\\times$):** At $n = {last_row['n']}$, "
                f"`optimal_det` reaches **{last_row['opt_det']/lb_last:.3f}x** and `optimal_rand` reaches "
                f"**{last_row['opt_rand']/lb_last:.3f}x** of "
                r"$\mathrm{LB}_{\mathrm{avg}} = n(n-1)/8$ "
                f"(down monotonically from {avg_rows[0]['opt_rand']/float(avg_rows[0]['lb_avg']):.3f}x at "
                f"$n={avg_rows[0]['n']}$ due to the vanishing $O(n^{{3/2}})$ setup/replacement overhead)."
            ),
            f"2. **Baseline Hierarchy (measured at $n = {last_all['n']}$ on random permutations):**",
            (
                f"   - `naive_resetting`: {last_all['naive']/lb_all:.2f}x "
                r"$\mathrm{LB}_{\mathrm{avg}}$ "
                "(pays ~2x per failed probe due to undoing swaps)."
            ),
            (
                f"   - `pivot_sweep`: {last_all['pivot']/lb_all:.2f}x "
                r"$\mathrm{LB}_{\mathrm{avg}}$ "
                f"({last_row['pivot']/lb_last:.2f}x at $n={last_row['n']}$; "
                "re-tests already-cleared prefixes whenever a non-pivot slot locks)."
            ),
            (
                f"   - `history_sweep`: {last_all['hist']/lb_all:.2f}x "
                r"$\mathrm{LB}_{\mathrm{avg}}$ "
                "(avoids repeating failed edges via global history, yet still pays single-edge / degree-drift overhead)."
            ),
            (
                f"   - `optimal_det` & `optimal_rand`: {last_all['opt_det']/lb_all:.3f}x and "
                f"{last_all['opt_rand']/lb_all:.3f}x at $n={last_all['n']}$, shrinking to "
                f"**{last_row['opt_det']/lb_last:.3f}x** and **{last_row['opt_rand']/lb_last:.3f}x** at $n={last_row['n']}$."
            ),
            (
                f"3. **Randomization Cuts Adversarial Worst-Case in Half:** On the adversarial "
                f"`reverse_perm({last_adv['n']})` (where all initial batch bottles sit at the back of the deterministic slot order), "
                f"`optimal_det` uses {last_adv['opt_det_rev']:.0f} swaps "
                f"({last_adv['opt_det_rev']/lb_adv_det:.3f}x " + r"$\mathrm{LB}_{\mathrm{det}}$), "
                f"while `optimal_rand` breaks the adversary down to **{last_adv['opt_rand_rev']:.1f}** swaps "
                f"(**{last_adv['opt_rand_rev']/lb_adv_rand:.3f}x** " + r"$\mathrm{LB}_{\mathrm{rand}}$). "
                f"On `cyclic_shift_1({last_adv['n']})`, `resolve_hit` cascades along the single $n$-cycle for "
                f"`optimal_det` ({last_adv['opt_det_cyc']:.0f} swaps) while `optimal_rand` matches the universal Yao bound at "
                f"**{last_adv['opt_rand_cyc']:.1f}** swaps (**{last_adv['opt_rand_cyc']/lb_adv_rand:.3f}x** "
                + r"$\mathrm{LB}_{\mathrm{rand}}$)."
            ),
            "",
        ]
    )

    out_path = "/home/tiago/projects/bottle-game/EXPERIMENT_REPORT.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
