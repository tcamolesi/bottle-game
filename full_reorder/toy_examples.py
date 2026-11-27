"""Toy examples, exact belief-state DP, entropy limits, and lemma checks for V2.

Explores and verifies:
1. Exact belief-state DAG DP for n = 2, 3, 4 (exact minimax worst-case and
   minimum expected queries over uniform prior), compared with:
   - Exact tree leaf-counting lower bound Q* where L(n, Q*) >= n!
   - V1 pair-swap exact optima (n=2: 1 wc / 0.5 avg, n=3: 5 wc / 2.5 avg, n=4: 6 wc)
2. Exact fixed-point Shannon entropy H_n = H(Fix(S_n)) for n = 2..15, showing
   convergence to H(Poisson(1)) ~ 1.8825 bits and the static lower bound.
3. Exact verification of Binary Lindström matrices D_k (k = 1..6).
4. Verification of the Locked-Anchor Bridge Lemma on random permutations.
5. Exhaustive comparison across all n! permutations for n = 1..6.
"""

from __future__ import annotations

import itertools
import math
import random
from collections import defaultdict

from full_reorder.coin_weighing import (
    decode_lindstrom_binary,
    lindstrom_cols,
    lindstrom_matrix,
)
from full_reorder.exploratory import (
    solve_greedy_entropy,
    solve_random_elimination,
    solve_shift_binary_search,
)
from full_reorder.game import FullReorderGame, orthomorphism_perm, random_perm
from full_reorder.optimal import solve_optimal_coin_weighing
from full_reorder.primitives import Block, TrackedReorderGame


def exact_tree_lower_bound(n: int) -> int:
    """Smallest Q such that L(n, Q) = sum_{d=0}^Q (n-1)^d >= n!."""
    fact_n = math.factorial(n)
    if n <= 1:
        return 0
    total = 1  # d = 0 (already f_0 == n)
    q = 0
    power = 1
    while total < fact_n:
        q += 1
        power *= (n - 1)
        total += power
    return q


def exact_belief_dp_v2(n: int) -> dict[str, float]:
    """Exact minimax worst-case and min expected queries for n <= 4.

    Models the FullReorderGame rules exactly:
    - Initial observation f_0 partitions S_n into root belief sets B_{f_0}.
    - B_n = {id} takes 0 queries.
    - At belief state S (frozenset of candidate a_0 indices), querying permutation
      q partitions S into buckets by matches(q, a_0) in {0, ..., n}:
      * bucket f == n costs 1 total query (0 remaining).
      * bucket f < n costs 1 + V(B_f).
    """
    all_perms = list(itertools.permutations(range(n)))
    m = len(all_perms)
    # Precompute match_table[q_idx][a0_idx] where q_idx indexes bottle_at_slot.
    match_table: list[list[int]] = [[0] * m for _ in range(m)]
    for qi, q in enumerate(all_perms):
        for ai, a0 in enumerate(all_perms):
            cnt = 0
            for s in range(n):
                if a0[q[s]] == s:
                    cnt += 1
            match_table[qi][ai] = cnt

    init_buckets: dict[int, list[int]] = defaultdict(list)
    for ai, a0 in enumerate(all_perms):
        f0 = sum(1 for i, v in enumerate(a0) if i == v)
        init_buckets[f0].append(ai)

    memo_wc: dict[frozenset[int], int] = {}
    memo_exp: dict[frozenset[int], float] = {}

    def solve_wc(state: frozenset[int]) -> int:
        if state in memo_wc:
            return memo_wc[state]
        if len(state) == 1:
            memo_wc[state] = 1
            return 1

        best = 10**9
        for qi in range(m):
            buckets: dict[int, list[int]] = defaultdict(list)
            row = match_table[qi]
            for ai in state:
                buckets[row[ai]].append(ai)
            # Skip uninformative queries that keep the exact same state.
            if len(buckets) == 1 and n not in buckets:
                continue
            cand = 1
            for f_val, sub in buckets.items():
                if f_val == n:
                    continue
                sub_val = solve_wc(frozenset(sub))
                if 1 + sub_val > cand:
                    cand = 1 + sub_val
                if cand >= best:
                    break
            if cand < best:
                best = cand
        memo_wc[state] = best
        return best

    def solve_exp(state: frozenset[int]) -> float:
        if state in memo_exp:
            return memo_exp[state]
        if len(state) == 1:
            memo_exp[state] = 1.0
            return 1.0

        total_w = len(state)
        best = float("inf")
        for qi in range(m):
            buckets: dict[int, list[int]] = defaultdict(list)
            row = match_table[qi]
            for ai in state:
                buckets[row[ai]].append(ai)
            if len(buckets) == 1 and n not in buckets:
                continue
            cand = 1.0
            for f_val, sub in buckets.items():
                if f_val == n:
                    continue
                cand += (len(sub) / total_w) * solve_exp(frozenset(sub))
            if cand < best:
                best = cand
        memo_exp[state] = best
        return best

    wc_over_roots = 0
    exp_over_roots = 0.0
    for f0, root_list in init_buckets.items():
        if f0 == n:
            continue
        root = frozenset(root_list)
        w = solve_wc(root)
        e = solve_exp(root)
        if w > wc_over_roots:
            wc_over_roots = w
        exp_over_roots += (len(root_list) / m) * e

    return {
        "n": float(n),
        "tree_lb": float(exact_tree_lower_bound(n)),
        "exact_wc": float(wc_over_roots),
        "exact_exp": exp_over_roots,
        "states_wc": float(len(memo_wc)),
    }


def fixed_point_entropy(n: int) -> float:
    """Compute exact Shannon entropy H(Fix(S_n)) in bits via rencontre numbers."""
    # Subfactorials !(m)
    der = [1, 0]
    for k in range(2, n + 1):
        der.append((k - 1) * (der[k - 1] + der[k - 2]))
    fact_n = math.factorial(n)
    h = 0.0
    for k in range(n + 1):
        cnt = math.comb(n, k) * der[n - k]
        if cnt > 0:
            p = cnt / fact_n
            h -= p * math.log2(p)
    return h


def verify_lindstrom_matrices() -> None:
    print("\n=== Binary Lindström Matrix D_k Verification (k = 1..6) ===")
    rng = random.Random(42)
    for k in range(1, 7):
        mat = lindstrom_matrix(k)
        q_k = len(mat)
        m_k = len(mat[0])
        assert q_k == (1 << k)
        assert m_k == lindstrom_cols(k)
        for _ in range(20):
            x = [rng.randint(0, 1) for _ in range(m_k)]
            y = [sum(mat[r][c] * x[c] for c in range(m_k)) for r in range(q_k)]
            rec = decode_lindstrom_binary(k, y)
            assert rec == x, f"Lindström decode mismatch at k={k}"
        print(
            f"  [PASS] k={k}: q={q_k:3d} queries for m={m_k:3d} binary vars "
            f"(ratio q/m = {q_k / m_k:.4f})"
        )


def verify_bridge_lemma() -> None:
    print("\n=== Locked-Anchor Bridge Lemma Verification ===")
    rng = random.Random(1234)
    for n in [10, 25, 60]:
        for _ in range(20):
            perm = random_perm(n, rng)
            game = FullReorderGame(perm)
            t = TrackedReorderGame(game)
            t.find_initial_zero_baseline_random(rng)
            if game.is_solved():
                continue
            # Lock a few true pairs (using oracle knowledge ONLY inside this unit test).
            num_locks = rng.randint(1, max(1, n // 4))
            for _ in range(num_locks):
                if len(t.unlocked_bottles) <= 2:
                    break
                b = rng.choice(list(t.unlocked_bottles))
                true_s = perm[b]
                t.lock_and_maintain_baseline(b, true_s)
                if game.is_solved():
                    break
            if game.is_solved() or len(t.unlocked_bottles) < 4:
                continue

            # Build disjoint cycles and paths on unlocked bottles.
            u_list = list(t.unlocked_bottles)
            rng.shuffle(u_list)
            blocks: list[Block] = []
            idx = 0
            while idx + 3 <= len(u_list) and len(blocks) < len(t.locked_pairs) + 2:
                kind = "cycle" if (len(blocks) % 2 == 0 or len([b for b in blocks if b.kind == "path"]) >= len(t.locked_pairs)) else "path"
                length = min(rng.randint(2, 4), len(u_list) - idx)
                verts = u_list[idx : idx + length]
                idx += length
                if kind == "cycle":
                    blocks.append(Block.make_cycle(verts, t.p0))  # type: ignore[arg-type]
                else:
                    blocks.append(Block.make_path(verts, t.p0))  # type: ignore[arg-type]

            if not blocks:
                continue
            # Test arbitrary subset I with #paths <= |locked_pairs|.
            active = [
                j
                for j, blk in enumerate(blocks)
                if rng.random() < 0.6
            ]
            # Trim paths if needed.
            path_limit = len(t.locked_pairs)
            filtered: list[int] = []
            p_cnt = 0
            for j in active:
                if blocks[j].kind == "path":
                    if p_cnt >= path_limit:
                        continue
                    p_cnt += 1
                filtered.append(j)

            observed = t.query_blocks(blocks, filtered)
            expected = sum(
                1 for j in filtered for (b_e, s_e) in blocks[j].edges if perm[b_e] == s_e
            )
            assert observed == expected, (
                f"Bridge Lemma mismatch: observed={observed} != expected={expected}"
            )
    print("  [PASS] Locked-Anchor Bridge Lemma exact across all randomized trials.")


def run_exhaustive_small_n() -> None:
    print("\n=== Exhaustive Solver Comparison (n = 1..6, all 873 perms) ===")
    for n in range(1, 7):
        perms = [list(p) for p in itertools.permutations(range(n))]
        solvers: list[tuple[str, object]] = [
            ("shift_bin", solve_shift_binary_search),
            ("rand_elim", lambda g: solve_random_elimination(g, seed=42)),
            ("opt_cw", lambda g: solve_optimal_coin_weighing(g, seed=42)),
        ]
        if n <= 5:
            solvers.insert(0, ("greedy_ent", solve_greedy_entropy))

        stats = []
        for name, fn in solvers:
            counts = []
            for p in perms:
                g = FullReorderGame(p)
                q = fn(g)  # type: ignore[operator]
                g.verify_solved()
                assert q == g.query_count
                counts.append(q)
            avg_q = sum(counts) / len(counts)
            wc_q = max(counts)
            stats.append(f"{name}: avg={avg_q:.3f}, wc={wc_q}")
        print(f"  n={n} ({len(perms):3d} perms): " + " | ".join(stats))


def main() -> None:
    print("=== Exact Belief-State DP (n = 2, 3, 4) ===")
    v1_ref = {2: "1 wc / 0.500 avg", 3: "5 wc / 2.500 avg", 4: "6 wc (V1 exact)"}
    for n in (2, 3, 4):
        res = exact_belief_dp_v2(n)
        print(
            f"  n={n}: V2 exact_wc={int(res['exact_wc'])}, "
            f"V2 exact_exp={res['exact_exp']:.4f}, "
            f"tree_LB={int(res['tree_lb'])}, "
            f"states={int(res['states_wc'])} | V1 pair-swap: {v1_ref[n]}"
        )

    print("\n=== Fixed-Point Entropy H_n = H(Fix(S_n)) & Static Lower Bound ===")
    for n in [2, 3, 4, 5, 6, 8, 10, 12, 15]:
        hn = fixed_point_entropy(n)
        log_fact = math.lgamma(n + 1) / math.log(2.0)
        static_lb = log_fact / hn
        print(
            f"  n={n:2d}: H_n = {hn:.6f} bits, "
            f"log2(n!) = {log_fact:6.2f}, "
            f"static LB = {static_lb:5.2f} (ratio to n log2 n = {static_lb / (n * math.log2(n)):.4f})"
        )

    verify_lindstrom_matrices()
    verify_bridge_lemma()
    run_exhaustive_small_n()

    # Quick orthomorphism toy check at n = 9
    ortho9 = orthomorphism_perm(9)
    g = FullReorderGame(ortho9)
    q = solve_shift_binary_search(g)
    g.verify_solved()
    print(f"\n=== Orthomorphism Toy Check (n=9): solved in {q} queries (all shifts have c_k=1) ===")


if __name__ == "__main__":
    main()
