"""Head-to-head benchmark comparing optimal v1 vs optimal v2 (Trick #3 distilled rules).

Evaluates:
1. Exact exhaustive n = 2..6 (side-by-side with exact minimax optima).
2. Uniformly random permutations across n = 10..2000.
3. Adversarial inputs (`reverse_perm` and `cyclic_shift_1`) across n = 20..2000.

Generates `EXPERIMENT_REPORT_V2.md`.
"""

from __future__ import annotations

import itertools
import random
import time

from game import BottleGame, cyclic_shift_perm, random_perm, reverse_perm
from optimal import solve_optimal_deterministic, solve_optimal_randomized
from optimal_v2 import solve_optimal_v2_deterministic, solve_optimal_v2_randomized


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
    exact_ref = {
        2: (1, 0.500),
        3: (5, 2.500),
        4: (6, 4.000),
        5: (8, 5.750),
        6: (11, None),
    }

    small_rows: list[dict] = []
    for n in (2, 3, 4, 5, 6):
        perms = [list(p) for p in itertools.permutations(range(n))]
        c1 = [solve_optimal_deterministic(BottleGame(list(p))) for p in perms]
        c2 = [solve_optimal_v2_deterministic(BottleGame(list(p))) for p in perms]
        ex_w, ex_e = exact_ref[n]
        row = {
            "n": n,
            "ex_w": ex_w,
            "ex_e": ex_e,
            "v1_avg": sum(c1) / len(c1),
            "v1_wc": max(c1),
            "v2_avg": sum(c2) / len(c2),
            "v2_wc": max(c2),
        }
        small_rows.append(row)
        print(
            f"[Small n={n}] Exact WC={ex_w} | "
            f"v1: avg={row['v1_avg']:.3f}, wc={row['v1_wc']} | "
            f"v2: avg={row['v2_avg']:.3f}, wc={row['v2_wc']}"
        )

    rng = random.Random(2026)
    sizes = [10, 20, 50, 100, 200, 500, 1000, 1500, 2000]
    trials_by_n = {10: 40, 20: 30, 50: 20, 100: 15, 200: 10, 500: 5, 1000: 3, 1500: 2, 2000: 2}

    rand_rows: list[dict] = []
    for n in sizes:
        lb = n * (n - 1) / 8.0
        perms = [random_perm(n, rng) for _ in range(trials_by_n[n])]
        v1_det, t1d = _run_trials(solve_optimal_deterministic, perms)
        v2_det, t2d = _run_trials(solve_optimal_v2_deterministic, perms)
        v1_rand, t1r = _run_trials(
            lambda g: solve_optimal_randomized(g, seed=rng.randint(0, 10**9)), perms
        )
        v2_rand, t2r = _run_trials(
            lambda g: solve_optimal_v2_randomized(g, seed=rng.randint(0, 10**9)), perms
        )
        gain_det = (v1_det - v2_det) / v1_det * 100.0
        gain_rand = (v1_rand - v2_rand) / v1_rand * 100.0
        row = {
            "n": n,
            "trials": trials_by_n[n],
            "lb": lb,
            "v1_det": v1_det,
            "v2_det": v2_det,
            "v1_rand": v1_rand,
            "v2_rand": v2_rand,
            "gain_det": gain_det,
            "gain_rand": gain_rand,
            "t1": t1r / len(perms),
            "t2": t2r / len(perms),
        }
        rand_rows.append(row)
        print(
            f"[Random n={n:>4}] LB={lb:>9.1f} | "
            f"v1_rand={v1_rand:>9.1f} ({v1_rand/lb:.3f}x) -> "
            f"v2_rand={v2_rand:>9.1f} ({v2_rand/lb:.3f}x) [{gain_rand:+.1f}% swaps]"
        )

    adv_sizes = [20, 50, 100, 200, 500, 1000, 1500, 2000]
    adv_rows: list[dict] = []
    for n in adv_sizes:
        lb_det = n * (n - 1) / 4.0
        lb_rand = n * (n - 1) / 8.0
        rev = reverse_perm(n)
        cyc = cyclic_shift_perm(n, 1)

        v1_det_rev, _ = _run_trials(solve_optimal_deterministic, [rev])
        v2_det_rev, _ = _run_trials(solve_optimal_v2_deterministic, [rev])
        v1_det_cyc, _ = _run_trials(solve_optimal_deterministic, [cyc])
        v2_det_cyc, _ = _run_trials(solve_optimal_v2_deterministic, [cyc])

        seeds = [100 + i for i in range(5 if n <= 1000 else 3)]
        v1_rr, v2_rr, v1_rc, v2_rc = [], [], [], []
        for s in seeds:
            g = BottleGame(list(rev)); v1_rr.append(solve_optimal_randomized(g, seed=s)); g.verify_solved()
            g = BottleGame(list(rev)); v2_rr.append(solve_optimal_v2_randomized(g, seed=s)); g.verify_solved()
            g = BottleGame(list(cyc)); v1_rc.append(solve_optimal_randomized(g, seed=s + 1000)); g.verify_solved()
            g = BottleGame(list(cyc)); v2_rc.append(solve_optimal_v2_randomized(g, seed=s + 1000)); g.verify_solved()

        row = {
            "n": n,
            "lb_det": lb_det,
            "lb_rand": lb_rand,
            "v1_det_rev": v1_det_rev,
            "v2_det_rev": v2_det_rev,
            "v1_det_cyc": v1_det_cyc,
            "v2_det_cyc": v2_det_cyc,
            "v1_rand_rev": sum(v1_rr) / len(v1_rr),
            "v2_rand_rev": sum(v2_rr) / len(v2_rr),
            "v1_rand_cyc": sum(v1_rc) / len(v1_rc),
            "v2_rand_cyc": sum(v2_rc) / len(v2_rc),
        }
        adv_rows.append(row)
        print(
            f"[Adv n={n:>4}] rev: v1_rand={row['v1_rand_rev']:>8.1f} -> v2_rand={row['v2_rand_rev']:>8.1f} "
            f"({row['v2_rand_rev']/lb_rand:.3f}x LB_rand) | "
            f"v1_det={v1_det_rev:>8.0f} -> v2_det={v2_det_rev:>8.0f} ({v2_det_rev/lb_det:.3f}x LB_det)"
        )

    lines = [
        "# Bottle Game v1 vs v2 (Trick #3 Distilled Minimax Rules)",
        "",
        "Compares original `optimal.py` (`v1`) against `optimal_v2.py` (`v2`), which adds:",
        "- `phase0_fast`: no-undo pair probing with a single anchor",
        "- Deferred `delta=+1` resolution inside Dihedral squares (piggybacking on the next scheduled swap)",
        "- `finish_deferred_history`: bitmask-tracked endgame with 1-option constraint propagation and deferred resolution",
        "",
        "## 1. Exhaustive Small-n ($n = 2 \\dots 6$) vs Exact Minimax Optima",
        "",
        "| $n$ | Exact Minimax WC | Exact Min Exp | v1 Avg | v1 WC | **v2 Avg** | **v2 WC** | Avg Saved | WC Saved |",
        "|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for r in small_rows:
        ex_e_s = f"{r['ex_e']:.3f}" if r["ex_e"] is not None else "—"
        avg_sv = (r["v1_avg"] - r["v2_avg"]) / r["v1_avg"] * 100.0
        wc_sv = (r["v1_wc"] - r["v2_wc"]) / r["v1_wc"] * 100.0
        lines.append(
            f"| {r['n']} | {r['ex_w']} | {ex_e_s} | {r['v1_avg']:.3f} | {r['v1_wc']} | "
            f"**{r['v2_avg']:.3f}** | **{r['v2_wc']}** | {avg_sv:+.1f}% | {wc_sv:+.1f}% |"
        )

    lines.extend(
        [
            "",
            "## 2. Uniformly Random Permutations ($n = 10 \\dots 2000$)",
            "",
            "| $n$ | $\\mathrm{LB}_{\\mathrm{avg}}$ | v1 Det (ratio) | **v2 Det (ratio)** | Det Saved | v1 Rand (ratio) | **v2 Rand (ratio)** | Rand Saved | v2 Time |",
            "|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
        ]
    )
    for r in rand_rows:
        lb = r["lb"]
        lines.append(
            f"| {r['n']} | {lb:.1f} | {r['v1_det']:.1f} ({r['v1_det']/lb:.3f}x) | "
            f"**{r['v2_det']:.1f} ({r['v2_det']/lb:.3f}x)** | {r['gain_det']:+.1f}% | "
            f"{r['v1_rand']:.1f} ({r['v1_rand']/lb:.3f}x) | "
            f"**{r['v2_rand']:.1f} ({r['v2_rand']/lb:.3f}x)** | {r['gain_rand']:+.1f}% | {r['t2']:.3f}s |"
        )

    lines.extend(
        [
            "",
            "## 3. Adversarial Permutations (`reverse_perm` and `cyclic_shift_1`)",
            "",
            "| $n$ | $\\mathrm{LB}_{\\mathrm{det}}$ | v1 Det Rev | **v2 Det Rev (ratio)** | $\\mathrm{LB}_{\\mathrm{rand}}$ | v1 Rand Rev | **v2 Rand Rev (ratio)** | Rand Rev Saved | v2 Rand Cyc1 (ratio) |",
            "|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
        ]
    )
    for r in adv_rows:
        lbd = r["lb_det"]
        lbr = r["lb_rand"]
        rev_sv = (r["v1_rand_rev"] - r["v2_rand_rev"]) / r["v1_rand_rev"] * 100.0
        lines.append(
            f"| {r['n']} | {lbd:.1f} | {r['v1_det_rev']:.0f} ({r['v1_det_rev']/lbd:.3f}x) | "
            f"**{r['v2_det_rev']:.0f} ({r['v2_det_rev']/lbd:.3f}x)** | {lbr:.1f} | "
            f"{r['v1_rand_rev']:.1f} ({r['v1_rand_rev']/lbr:.3f}x) | "
            f"**{r['v2_rand_rev']:.1f} ({r['v2_rand_rev']/lbr:.3f}x)** | {rev_sv:+.1f}% | "
            f"**{r['v2_rand_cyc']:.1f} ({r['v2_rand_cyc']/lbr:.3f}x)** |"
        )

    out_path = "/home/tiago/projects/bottle-game/EXPERIMENT_REPORT_V2.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
