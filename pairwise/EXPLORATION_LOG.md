# Bottle Game Exploration Log: Hypotheses, Experiments, and Breakthroughs

This document records the full research and engineering log for solving the **Bottle Game** (sorting an unknown permutation of `0..n-1` using pair swaps and scalar fixed-point count feedback $f_t = |\{k : a_t[k] = k\}|$), including toy experiments, dead ends, empirical surprises, and the final provably optimal algorithm.

---

## 1. Initial Intuition & Why $\Omega(n \log n)$ Information Theory Is Misleading

### Hypothesis 1 (Naive Entropy Bound): *Is the game $\Theta(n \log n)$?*
Each swap changes $f_t$ by $\Delta \in \{-2, -1, 0, +1, +2\}$ (5 possible outcomes), and there are $n!$ hidden permutations, so $\log_5(n!) = \Theta(n \log n)$ might look like a plausible lower bound.

**Why it fails:** The feedback distribution is overwhelmingly concentrated on $\Delta = 0$. When swapping two random non-fixed indices in a derangement, $\mathbb{P}(\Delta > 0) = O(1/n)$, so the Shannon entropy per swap is only $H(\Delta) = O\!\left(\frac{\log n}{n}\right)$ bits! Dividing $\log_2(n!) = \Theta(n \log n)$ bits by $O\!\left(\frac{\log n}{n}\right)$ bits per swap immediately hints at **$\Omega(n^2)$** swaps — not $O(n \log n)$.

### Toy Experiment 1: Exact Belief-State DP for $n = 2, 3$ (`toy_examples.py`)
To build intuition on tiny instances without heuristic assumptions, `exact_belief_dp(n)` in [toy_examples.py](file:///home/tiago/projects/bottle-game/toy_examples.py) builds the exact belief-state transition graph (all reachable subsets of consistent arrays after observing $f_0$ and feedback $f_t$) and computes exact minimax worst-case swaps and exact minimum expected swaps:

- **$n = 2$** (`2` reachable states): exact minimax worst-case = `1`, exact min expected = `0.5000`.
- **$n = 3$** (`11` reachable states): exact minimax worst-case = `5`, exact min expected = `2.5000`.

Even at $n = 3$, the true optimum (`5` worst-case, `2.5` expected) already exceeds $\log_5(6)$ and tracks closer to quadratic edge testing.

---

## 2. Breakthrough 1: The Edge-Exposure Reduction

Every item can be identified by its initial slot at $t = 0$ (**bottle $b$** starts in slot $b$). The unknown initial array corresponds to a hidden perfect matching $\pi \subseteq K_{n,n}$ between bottles and slots.

- At $t = 0$, only the $n$ diagonal `(bottle, slot)` pairs $(b, b)$ have been co-located ($|E_0| = n$).
- Each swap moves at most 2 bottles to new slots, adding at most 2 edges to the exposed set $E_t$ ($|E_T| \le n + 2T$).
- All feedback $f_0, \dots, f_T$ is completely determined by which edges of $E_t$ lie in $\pi$.
- Since $\pi \subseteq E_T$ at termination, letting $R(\pi) = E_T \setminus \pi$ be the **rejected edges** gives the fundamental inequality:
  $$T(\pi) \ge \frac{|R(\pi)|}{2}.$$

From this single lens, we proved two tight universal lower bounds in [PROOF.md](file:///home/tiago/projects/bottle-game/PROOF.md):
1. **Theorem 1 (DAG Adversary, Deterministic Worst-Case):** An adversary against the stronger edge-revealing oracle answers NO unless an edge is forced in every consistent matching. At termination, the non-rejected off-diagonal edges (oriented after relabeling $\pi = \mathrm{id}$) must form a DAG ($\le \binom{n}{2}$ edges), forcing $|R(\pi)| \ge \binom{n}{2}$ and
   $$T_{\mathrm{worst}} \ge \left\lceil \frac{n(n-1)}{4} \right\rceil \sim 0.25\,n^2.$$
2. **Theorem 2 (Transposition Pairing, Average-Case & Yao Bound):** Pairing every $\pi \in S_n$ with $\pi \circ (i\ j)$ shows each pair $\{i, j\}$ contributes $\ge 1/2$ rejected edge on average, forcing $\mathbb{E}[|R|] \ge \frac{n(n-1)}{4}$ and
   $$\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[T(\pi)] \ge \frac{n(n-1)}{8} \sim 0.125\,n^2.$$
   By Yao's minimax principle, this applies to **every** randomized algorithm in the worst case too.

---

## 3. Turning Scalar Counts Into Edge Membership (`primitives.py`)

A major gap between the Edge-Revealing Oracle and the actual game is that we only observe the sum $f_t$, not *which* slot became fixed.

### What Worked: Fixed-Point Elimination + The Golden Invariant
If either `i` or `j` is currently fixed, swapping `(i, j)` **cannot create** a new fixed point, giving an exact signature:
- $\Delta = -2 \iff$ both `i` and `j` were fixed,
- $\Delta = -1 \iff$ exactly one of `{i, j}` was fixed,
- $\Delta \ge 0 \iff$ neither was fixed.

Using this lemma, we built two reusable primitives in [primitives.py](file:///home/tiago/projects/bottle-game/primitives.py):
1. **`phase0_eliminate_fixed_points`:** Finds one fixed anchor by scanning disjoint pairs $(0,1), (2,3), \dots$ and tests remaining slots against it in $\le 2n + 5$ swaps (exhaustively verified on all $n!$ permutations for $n = 1\dots 6$ in `toy_examples.py`: max observed swaps were `0, 0, 6, 12, 14, 16` vs limits `7, 9, 11, 13, 15, 17`). This establishes the **Golden Invariant**:
   $$f_{\mathrm{cur}} = |\text{locked}| \quad (\text{zero unlocked fixed points}).$$
2. **`resolve_hit(a, b)`:** Whenever a swap `(a, b)` yields $\Delta = +1$ under the Golden Invariant, probing `a` against a third unlocked slot `w` either locks `a` (2 swaps), locks `b` (2 swaps), locks all 3 (1 swap), or locks `b` and continues resolving `(a, w)` (1 swap + chain). Total cost across the entire game: $\le 2n$ swaps.

### Engineering Bug Caught & Fixed: `RecursionError` on Long Cycles
During the initial `n = 1500` benchmark on `cyclic_shift_perm(1500, 1)`, our original recursive `resolve_hit` hit Python's recursion limit (`RecursionError: maximum recursion depth exceeded`). Why? Because `cyclic_shift_perm(n, 1)` is a single $n$-cycle: once one element locks, probing sequential slots unwinds the entire $1500$-cycle in a single $\Delta = +1$ chain! Converting `resolve_hit` in [primitives.py](file:///home/tiago/projects/bottle-game/primitives.py) to an **iterative `while True:` loop** fixed the crash completely and lets `optimal_det` solve `cyclic_shift_perm(2000, 1)` in just `20,057` swaps (`0.020x` $\mathrm{LB}_{\mathrm{det}}$).

---

## 4. Exploratory Algorithms: What Worked and What Hit a Wall (`exploratory.py`)

We implemented and benchmarked three natural baselines in [exploratory.py](file:///home/tiago/projects/bottle-game/exploratory.py). Comparing them against theory exposed subtle mechanics:

| Algorithm | Idea | Observed Random Ratio (vs $\frac{n(n-1)}{8}$) | Observed `reverse_perm` (vs $\frac{n(n-1)}{4}$) | Verdict |
|---|---|---|---|---|
| `solve_naive_resetting` | Probe `s0` vs others; **undo** every $\Delta = 0$ swap | `3.44x–3.66x` (`~0.42 n^2`) | `2.00x` (`~0.50 n^2`, up to `n^2` general) | **Too slow:** undoing wastes 2 swaps per single edge. |
| `solve_pivot_sweep` | Never undo $\Delta = 0$; sweep `s0` through others | `1.80x` at $n=2000$ (`~0.225 n^2`) | `1.00x` on rev (`~0.50 n^2` general) | **Prefix-retesting trap** (see below). |
| `solve_history_sweep` | Bitmask of all proven-false `(bottle, slot)` pairs; pick most-constrained `s0` | `1.16x` at $n=500$ (`~0.145 n^2`) | `0.80x` on rev (`~0.20 n^2`, `<= 0.33 n^2` general) | **Density wall & $O(n^3)$ CPU** (see below). |

### Discovery 1: Why `pivot_sweep` Scored `~0.225 n^2` Instead of $\frac{1}{2e} n^2 \approx 0.184 n^2$
An idealized model where each pass resets independently predicts $\int_0^1 (1-t)e^{-t}\,dt = 1/e \implies \frac{1}{2e} n^2 \approx 0.1839\,n^2$ (`1.47x` $\mathrm{LB}_{\mathrm{avg}}$). Yet in experiments (`benchmark.py`), `pivot_sweep` consistently ran at `1.80x–1.89x` (`~0.225–0.236 n^2`).

**Why?** When `s0 = 0` sweeps `1..k` and triggers a lock at `s = k` (`s` locks, *not* `s0`), the prefix slots `1..k-1` now hold the old bottles shifted from `0..k-2` — every single one of which was *already tested at `0` and proven not to be bottle `0`'s match*! Thus restarting `s0 = 0` from index `1` re-sweeps an already-cleared prefix with zero chance of locking `0`.

### Discovery 2: Why `history_sweep` Hits a Wall (and Costs $O(n^3)$ CPU)
Tracking all known-false `(bottle, slot)` pairs in bitmasks avoids repeating failed edges and drops random swaps to `1.16x` $\mathrm{LB}_{\mathrm{avg}}$ at $n = 500$. However:
1. **Single-edge waste near the dense regime:** As the tested graph fills, it becomes harder to find swaps where *both* newly formed edges `(b_s, s0)` and `(b_s0, s)` are untested, drifting away from the ideal 2-new-edges-per-swap rate.
2. **Worst-case ODE wall:** Greedy single-pivot selection against an adversary can yield up to $\sim \frac{1}{3} n^2$ swaps (`> 0.25 n^2`).
3. **CPU bottleneck:** Scanning the unlocked slots with bitmasks on every swap takes $\Theta(n^3)$ local CPU work, making `n = 1000..2000` slow compared to $O(n^2)$-time structured schedules.

---

## 5. Breakthrough 2: Block Design & The Dihedral $A, B, A, B$ Schedule

### Dead End: Recursive Divide-and-Conquer Quadrants
Splitting bottles/slots into halves $(A, B, C, D)$:
- Running squares on $A, D$, then swapping halves and running $B', C'$ wastes extra setup/cross-boundary swaps (up to $\frac{3}{8}n^2$ worst-case, $\frac{5}{32}n^2$ avg).
- Ordering blocks cleanly ($A, B'C', D'$) removes the leading-order waste, but still pays overhead inside small recursive leaves unless recursion stops at block size $b = \Theta(\sqrt{n})$.

### What Worked: Flat Adaptive Squares + Dihedral 1-Factorization (`optimal.py`)
Instead of full recursion, we process bottles in **batches of size $b \approx 1.22 \sqrt{m}$** (where $m$ is the remaining unlocked count) across the pool of $m$ unlocked slots:
- In each step, let $p = |\text{rem\_B}|$ be the surviving unlocked batch bottles, form an even square size $s$ ($p$, or $p+1$ with one spare bottle), pull $s$ slots $V$ from the pool, move $U$ into $V$ in $\le s$ setup swaps, and run an **in-place Dihedral $A, B, A, B$ sweep** on $S = V$.
- **Why naive reflection fails vs. why Dihedral $A, B, A, B$ works:** A single fixed-point-free involution only swaps pairs back and forth ($A^2 = \mathrm{id}$). Alternating two involutions in the dihedral group $D_s$ for even $s = 2k$:
  $$A(x) = (-x - 1) \bmod s, \qquad B(x) = (-x + 1) \bmod s$$
  produces $P_{2t}(x) \equiv x + 2t \pmod s$ and $P_{2t+1}(x) \equiv -x - 2t - 1 \pmod s$, visiting every slot of the same parity on even rounds and every slot of the opposite parity on odd rounds!
  Verified in `toy_examples.py` for $s \in \{2, 4, 6, 8, 10, 12, 20\}$: all $s^2$ `(bottle, slot)` pairs are covered in $\frac{s(s-1)}{2}$ swaps with **zero duplicate edges**.
- **Handling mid-square locks:** When a bottle locks mid-square, replacing its slot in $S$ with a spare unlocked slot (or reusing the displaced probe slot $w$ from `resolve_hit`) preserves the $s$-element sweep on all surviving batch bottles without restarting the square.

---

## 6. Final Empirical Results Summary

From [EXPERIMENT_REPORT.md](file:///home/tiago/projects/bottle-game/EXPERIMENT_REPORT.md) (all runs verified solved via `BottleGame.verify_solved()`):

1. **Random Permutations (Ratio to $\mathrm{LB}_{\mathrm{avg}} = n(n-1)/8$):**
   - `optimal_det`: drops monotonically from `2.322x` ($n=20$) $\to$ `1.451x` ($n=100$) $\to$ `1.188x` ($n=500$) $\to$ `1.113x` ($n=1000$) $\to$ **`1.089x`** ($n=2000$, `544,197.5` swaps vs `499,750.0` LB, `0.398s`/run).
   - `optimal_rand`: drops monotonically from `2.322x` ($n=20$) $\to$ `1.428x` ($n=100$) $\to$ `1.116x` ($n=500$) $\to$ `1.099x` ($n=1000$) $\to$ **`1.055x`** ($n=2000$, `527,448.5` swaps vs `499,750.0` LB).
2. **Adversarial Permutations (`reverse_perm` and `cyclic_shift_1` at $n = 2000$):**
   - `reverse_perm(2000)` puts all initial deterministic batch bottles at the back of the slot pool: `optimal_det` uses `959,896` swaps (`0.960x` of $\mathrm{LB}_{\mathrm{det}} = 999,500$), while `optimal_rand` breaks the adversary down to **`530,390.0`** swaps (**`1.061x`** of Yao's $\mathrm{LB}_{\mathrm{rand}} = 499,750$).
   - `cyclic_shift_1(2000)`: `optimal_det` unwinds in `20,057` swaps (`0.020x` $\mathrm{LB}_{\mathrm{det}}$) while `optimal_rand` matches the Yao bound at **`526,537.0`** swaps (**`1.054x`** $\mathrm{LB}_{\mathrm{rand}}$).

Together with Theorems 1, 2, and 5 in [PROOF.md](file:///home/tiago/projects/bottle-game/PROOF.md), this establishes asymptotic optimality ($1 + o(1)$ ratio to the exact information-theoretic lower bounds) across deterministic worst-case, average-case, and randomized worst-case expected complexity.

---

## 7. `optimal_v2`: Distilling Trick #3 from Exact Minimax Trees

Inspecting the exact minimax decision trees for $n = 5, 6$ in `~/bottle-puzzle` showed *why* exact search outperformed `optimal.py` (`v1`) by ~2× on tiny $n$:
1. **No-undo probing:** When a swap changes fixed points by $\Delta = -1$ or $\Delta = 0$, don't swap back; record the newly exposed non-fixed edges and keep probing forward.
2. **Deferred $\Delta = +1$ resolution:** When a swap creates a single unlocked fixed point (`pending = (a, b)`), leave it unresolved and piggyback disambiguation onto the very next swap involving `a` or `b` (resolving `{a, b}` in `0` extra swaps whenever $\Delta \ge 0$).
3. **1-option constraint propagation:** Whenever bitmasks narrow a slot or bottle down to 1 remaining candidate, lock it directly in 1 swap.

We implemented all three in [primitives.py](file:///home/tiago/projects/bottle-game/primitives.py) (`phase0_fast`, `resolve_two_pending`, and `finish_deferred_history`) and [optimal_v2.py](file:///home/tiago/projects/bottle-game/optimal_v2.py) (`solve_optimal_v2`).

### What Worked vs. What Needed Tuning
- **Small & medium $n$ saw massive gains** ([EXPERIMENT_REPORT_V2.md](file:///home/tiago/projects/bottle-game/EXPERIMENT_REPORT_V2.md)):
  - $n = 3$: dropped from `3.500 avg / 7 wc` (`v1`) to **`2.500 avg / 5 wc`** — **matching the exact minimax optimum!**
  - $n = 4$: dropped from `6.250 / 13` to **`5.417 avg / 10 wc`** (`+13.3%` avg, `+23.1%` wc).
  - $n = 5$: dropped from `9.217 / 18` to **`7.167 avg / 13 wc`** (`+22.2%` avg, `+27.8%` wc).
  - $n = 6$: dropped from `12.708 / 23` to **`10.367 avg / 20 wc`** (`+18.4%` avg).
  - $n = 10, 20, 50, 100, 200$: random-case swaps dropped by **`+22.3%`**, **`+33.8%`** (`114.9` $\to$ `76.0`), **`+18.7%`** (`539.0` $\to$ `438.2`), **`+3.8%`**, and **`+4.9%`** (`6,274.5` $\to$ `5,969.5`).
- **Why large-$n$ speedup plateaus around ~1% (and the `block_scale` ablation):** Profiling `v1` at $n = 1000$ revealed that `phase0` (`493.8`), `resolve` (`1,962.0`), and `phase2` (`188.8`) together represent only **1.9%** of total swaps (`setup = 14,554.6` is 10.5%, `dihedral = 121,126.2` is 87.2%). Trying a larger `block_scale = 1.8` to save setup swaps backfired at $n = 1000\text{--}2000$ (`138,590.8` vs `136,718.4` in our 5-trial ablation) because wider squares increase mid-square spare-replacement waste. Restoring `block_scale = 1.22` preserved the best large-$n$ balance (`523,857.4` = `1.048x LB` in 5-trial ablation; `527,078.5` = `1.055x LB` in `EXPERIMENT_REPORT_V2.md` at $n = 2000$).

### Connection to the Exact Worst-Case Function $W^*(n)$
While our bounds pin down the **asymptotic** minimax worst-case complexity completely:
$$\left\lceil \frac{n(n-1)}{4} \right\rceil \le W^*(n) \le \frac{n^2}{4} + O(n^{3/2}) \implies W^*(n) = \frac{1}{4}n^2 + o(n^2),$$
computing the **exact integer** $W^*(n)$ is much harder than finding an asymptotically optimal strategy:
- Exact values are known only up to $n = 6$ via `~/bottle-puzzle` (`0, 1, 5, 6, 8, 11` for $n = 1 \dots 6$).
- Deciding even the size of a single belief state given $f_t = 0$ history reduces to computing a `0/1` matrix **permanent** (`#P`-complete), and belief states grow doubly exponentially ($\subseteq 2^{n!}$, jumping `294` $\to$ `530,717` canonical states from $n=5$ to $n=6$).
- Like the exact comparison-sorting number $S(n)$ (still open past $n \approx 47$ despite trivial $n \log_2 n$ asymptotics), $W^*(n)$ is finitely computable in principle for any fixed $n$, yet has no known polynomial-time exact algorithm or closed form.
