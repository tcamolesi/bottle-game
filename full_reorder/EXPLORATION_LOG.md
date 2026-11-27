# Bottle Game V2 (Full-Reorder) Exploration Log: Analysis, Pivots, and Breakthroughs

This document records the research, toy experiments, architectural pivot, and empirical results for the **Full-Reorder Bottle Game (V2)** — sorting an unknown permutation of `0..n-1` by submitting an arbitrary permutation $\sigma_t \in S_n$ (`bottle_at_slot`) and observing only the scalar fixed-point count $f(\sigma_t) = |\{s : a_0[\sigma_t^{-1}(s)] = s\}|$ (equivalently, **Strict Permutation Mastermind** with black-peg feedback).

---

## 1. How Full-Reorder Changes the Complexity Landscape (V1 vs. V2)

In V1 (pair swaps), each step changed at most 2 edges, capping information gain at $O\!\left(\frac{\log n}{n}\right)$ bits per swap and forcing $\Theta(n^2)$ swaps. Allowing arbitrary permutations $\sigma_t \in S_n$ collapses the complexity from quadratic to near-linear:

1. **Universal Adaptive Lower Bound (Theorem 1 in [PROOF.md](file:///home/tiago/projects/bottle-game/full_reorder/PROOF.md)):**
   Each query has $\le n$ outcomes ($f \in \{0, \dots, n-2, n\}$, since $n-1$ fixed points is impossible), with $f=n$ terminating. Counting leaves in an $(n-1)$-ary tree ($L(n, Q) = \sum_{d=0}^Q (n-1)^d \ge n!$) gives:
   $$Q^*(n) \ge n - \frac{n}{\ln n} - O(1)$$
   for deterministic worst-case, uniform average-case, and Yao's randomized worst-case expected complexity.
2. **Static (Non-Adaptive) Lower Bound (Theorem 3):**
   For any fixed permutation $\sigma_t$, $\sigma_t^{-1} \circ \pi$ is uniform on $S_n$, so $H(f(\sigma_t)) = H_n \to H(\mathrm{Poisson}(1)) \approx 1.882489$ bits. Thus non-adaptive strategies require at least
   $$Q_{\text{static}} \ge \frac{\log_2(n!)}{H_n} - 1 \sim 0.5312\,n \log_2 n.$$
3. **Why Early Adaptive Queries Still Only Extract $O(1)$ Bits (Theorem 4):**
   By Donsker–Varadhan duality against the $\mathrm{Poisson}(1)$ tail, any query when the belief set has size $B_t$ achieves $\mathbb{E}[f_{t+1}] = O\!\left(\frac{\ln(n!/B_t)}{\ln\ln(n!/B_t)}\right) + O(1)$. To break the static $0.5312\,n\log_2 n$ barrier, an adaptive solver must **accumulate matched structures** and **batch $m$ binary/sparse questions in parallel** via coin weighing so later queries extract $\Theta(\log m)$ bits each.

---

## 2. Toy Experiments & Exact Belief-State DP (`toy_examples.py`)

Running `exact_belief_dp_v2(n)` in [toy_examples.py](file:///home/tiago/projects/bottle-game/full_reorder/toy_examples.py) computed the exact minimax worst-case and minimum expected queries on small $n$:

| `n` | V2 Tree LB $Q^*(n)$ | V2 Exact Minimax WC | V2 Exact Min Expected | V1 Pair-Swap Exact |
|---:|---:|---:|---:|---:|
| 2 | 1 | `1` (`1` state) | `0.5000` | `1` wc / `0.5000` avg |
| 3 | 2 | `3` (`10` states) | `1.5000` | `5` wc / `2.5000` avg |
| 4 | 3 | `4` (`106` states) | `2.5833` | `6` wc |

Exact fixed-point entropy $H_n = H(\mathrm{Fix}(S_n))$ converges rapidly to $H(\mathrm{Poisson}(1))$:
- $n = 2$: `1.000000` bits
- $n = 4$: `1.750000` bits
- $n = 6$: `1.875491` bits
- $n = 10$: `1.882486` bits
- $n = 15$: `1.882489` bits

---

## 3. Deterministic Baseline & Orthomorphisms (`exploratory.py`)

We built a **100% deterministic $O(n \log n)$** solver `solve_shift_binary_search` in [exploratory.py](file:///home/tiago/projects/bottle-game/full_reorder/exploratory.py):
1. **Cyclic shift scan:** Query shifts $\sigma_k(b) = (b + k) \bmod n$ for $k = 1 \dots n-2$ (and deduce $c_{n-1} = n - \sum_{k=0}^{n-2} c_k$ using $c_0 = f_0$).
2. **Adversarial Edge Case — Odd-$n$ Orthomorphisms (`2*i % n`):** Every cyclic shift of `orthomorphism_perm(n)` has $c_k = 1$, so **no shift has $c_k = 0$**! To establish the Golden-Invariant baseline $p_0$ (`f(p0) == |L|`) deterministically without a zero shift, `solve_shift_binary_search` scans disjoint transpositions $(2j, 2j+1)$ on $\mathrm{id}$: either one drops $f$ from $1 \to 0$ (giving $p_0$ immediately), or all $(n-1)/2$ pairs keep $f \ge 1$, proving $n - 1$ is the unique fixed point of $\mathrm{id}$ and locking `(n-1, n-1)` directly on `p0 = id`!
3. **Locked-Anchor Bridge Binary Search:** Decomposes each active shift into cycles (`0` anchors) and paths (`1` anchor each), using a 1-bridge cycle-closure protocol for the very first lock ($|L|=0$) and zero-noise anchor binary search for all subsequent locks.

Result: Guaranteed $\le n \lceil \log_2 n \rceil + 2.5 n + O(\log n)$ deterministic queries (`0.961 * n log2 n` on random $n = 1000$; `0.995 * n log2 n` on worst-case `orthomorphism(1001)`).

---

## 4. Crucial Empirical Discovery: Why Candidate-Graph Edge Elimination Lost to Binary Search (And the Pivot That Won)

### Dead End: Candidate-Graph Edge Elimination + Anchored Coin Weighing
Our initial `O(n log log n)` attempt tracked an explicit $n \times n$ candidate bipartite graph $G$, locked $m_0 \approx 1.5\sqrt{n}$ anchors in Phase 0, and ran coin weighing on vertex-disjoint paths of length $s \approx 0.65 d$ to certify all-zero (`Z`) and all-full (`F`) blocks.

Profiling at $n = 200$ and $n = 500$ exposed **two fundamental bottlenecks**:
1. **Dense-regime waste (`3,111` queries at $n=500$):** While $d \in [n/12, n]$, 1-block probing only eliminates $\approx 0.368\,d$ edges per query (requiring $\sim 1.36\,n$ queries per halving of $d$), whereas a cyclic shift scan eliminates $\sim n/e$ shifts of size $n$ in $n$ queries.
2. **Information discard & anchor bottleneck (`3,516` queries at $n=500$):** Discarding $x_j \ge 1$ blocks rather than splitting them threw away most of the coin-weighing information, while capping $m \le |L| = 34$ starved coin weighing of batch width. Total at $n = 500$ was **`7,344` queries** — *worse* than `shift_binary_search` (`4,289`)!

### Breakthrough: Involution 1-Factorization + Parallel Binary Lindström + 2-Factor Cycle Orientation (`optimal.py`)
We replaced the candidate-graph design with a **zero-anchor, 1-factorization parallel splitting** architecture in [optimal.py](file:///home/tiago/projects/bottle-game/full_reorder/optimal.py):
1. **Zero-Match Baseline $p_0$:** Sample random permutations until $f(p_0) = 0$ (expected $e \approx 2.72$ queries; neutralizes *all* adversarial inputs).
2. **Involution 1-Factorization:** Partition all $\binom{n}{2}$ unordered pairs $\{a, b\}$ along a random vertex order into $n - 1$ (even $n$) or $n$ (odd $n$) disjoint involutions on $p_0$, scanning them in $\le n - 1$ queries. Each pair $\{a, b\}$ holds $c(\{a, b\}) \in \{0, 1, 2\}$ matches.
3. **Level-by-Level Parallel Splitting (Zero Anchors!):** Any subset of vertex-disjoint involution halves is itself a valid involution on $p_0$ whose feedback is the exact sum $\sum x_j$ with **zero anchors** and **zero baseline updates**.
   - Binary groups ($c = 1$, $>95\%$ of volume) pack up to `449` vertex-disjoint halves per batch and decode via **Exact Binary Lindström $D_k$** ([coin_weighing.py](file:///home/tiago/projects/bottle-game/full_reorder/coin_weighing.py), verified for $k = 1\dots 7$: $D_7$ solves $449$ variables in $127$ queries).
   - Multi-match groups ($c \ge 2$) pack up to `96` vertex-disjoint halves and decode via **MILP-uniqueness-certified exact integer coin weighing** (`solve_exact_integer_coin_weighing`).
4. **2-Factor Cycle Orientation:** Pairs with $c = 2$ are immediately resolved; pairs with $c = 1$ form the undirected 2-factor of $\ge 3$-cycles of $p_0^{-1} \circ \pi$. Grouping cycles by length $\ell$ yields feedback $\ell \sum_{j \in S} b_j$ ($b_j \in \{0, 1\}$), orienting all cycles in $O(n / \log n)$ worst-case ($\sim \ln n$ expected) queries via Binary Lindström $D_k$.

---

## 5. Final Empirical Results Summary ([EXPERIMENT_REPORT.md](file:///home/tiago/projects/bottle-game/full_reorder/EXPERIMENT_REPORT.md))

All 2,772 exhaustive runs ($n = 1\dots 6$), stress tests ($n = 7\dots 200$), and scaling benchmarks ($n = 10\dots 1001$) passed `FullReorderGame.verify_solved()`:

1. **Sub-logarithmic Scaling (`Q / (n log2 n)` shrinking while `Q / (n log2 log2 n)` stays ~`1.8`):**
   - `n = 100`: `optimal_coin_weighing = 470.1` (`0.708 n log2 n`, `1.721 n log2 log2 n`, `0.008s`) vs `shift_binary_search = 631.6` (`0.951 n log2 n`).
   - `n = 200`: `optimal_coin_weighing = 1,048.0` (`0.686 n log2 n`, `1.786 n log2 log2 n`, `0.036s`) vs `shift_binary_search = 1,467.2` (`0.960 n log2 n`).
   - `n = 500`: `optimal_coin_weighing = 2,857.0` (`0.637 n log2 n`, `1.806 n log2 log2 n`, `0.334s`) vs `shift_binary_search = 4,288.7` (`0.957 n log2 n`).
   - `n = 1000`: `optimal_coin_weighing = 6,020.0` (**`0.604 n log2 n`**, **`1.815 n log2 log2 n`**, `2.053s`) vs `shift_binary_search = 9,574.5` (`0.961 n log2 n`) — **37.1% fewer queries** than $O(n \log n)$!
2. **Adversarial Invariance ($n = 1001$):**
   - `reverse(1001)`: `optimal_coin_weighing = 6,019` (`0.603 n log2 n`).
   - `cyclic_shift_1(1001)`: `optimal_coin_weighing = 6,017` (`0.603 n log2 n`).
   - `orthomorphism(1001)`: `optimal_coin_weighing = 6,023` (`0.604 n log2 n`, vs `9,931` for `shift_binary_search` — **39.4% fewer queries**!).
