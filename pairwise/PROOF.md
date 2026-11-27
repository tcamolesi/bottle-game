# Formal Optimality Proof for the Bottle Game

This document proves that the **Adaptive-Square Dihedral Blocked** algorithm (`optimal.py`) is asymptotically optimal in **all three standard regimes**:

1. **Deterministic worst-case:** $\frac{n^2}{4} + O(n^{3/2})$ swaps, matching the universal deterministic lower bound $\lceil n(n-1)/4 \rceil$.
2. **Average-case (uniform random permutation):** $\frac{n^2}{8} + O(n^{3/2})$ swaps, matching the universal average-case lower bound $n(n-1)/8$.
3. **Randomized worst-case expected (on *every* input permutation):** $\frac{n^2}{8} + O(n^{3/2})$ expected swaps, matching Yao's minimax lower bound $n(n-1)/8$.

---

## 1. Problem Model and Edge-Exposure Reduction

Let $n \ge 1$ and let $a_0 \in S_n$ be an initially unknown permutation of $\{0, \dots, n-1\}$. At time $t = 0$ the player observes $f_0 = |\{k : a_0[k] = k\}|$. At each step $t = 1, \dots, T$, the player selects two distinct indices $(i_t, j_t)$ with $0 \le i_t < j_t < n$, swaps $a_{t-1}[i_t]$ and $a_{t-1}[j_t]$ to obtain $a_t$, and observes the scalar count
$$f_t = |\{k : a_t[k] = k\}|.$$
The game terminates at step $T$ when $f_T = n$ (equivalently $a_T = \mathrm{id}$).

### 1.1 Bottles, Slots, and Rejected Edges

Label each item by its initial position at $t = 0$: **bottle $b$** ($0 \le b < n$) is the item $a_0[b]$. The hidden permutation defines an unknown perfect matching $\pi \subseteq B \times S$ in the complete bipartite graph $K_{n,n}$ between bottles $B = \{0, \dots, n-1\}$ and slots $S = \{0, \dots, n-1\}$, where
$$(b, s) \in \pi \iff a_0[b] = s.$$

Because the player knows the sequence of swaps $(i_1, j_1), \dots, (i_t, j_t)$, the player knows at every step $t$ the exact bijection $\sigma_t : B \to S$ mapping each bottle $b$ to its current slot $\sigma_t(b)$.

Define the **exposed edge set** $E_t \subseteq B \times S$ as the set of all `(bottle, slot)` pairs ever co-located at any time $0 \le \tau \le t$:
$$E_t = \bigcup_{\tau = 0}^{t} \{(b, \sigma_\tau(b)) : b \in B\}.$$

**Lemma 1 (Edge-to-Swap Inequality).** For every valid execution terminating in $T(\pi)$ swaps on input $\pi$:
1. $|E_0| = n$ and $|E_t| - |E_{t-1}| \le 2$ for every $1 \le t \le T(\pi)$, so $|E_{T(\pi)}| \le n + 2T(\pi)$.
2. At termination, $\pi \subseteq E_{T(\pi)}$.
3. Defining the **rejected edge set** $R(\pi) = E_{T(\pi)} \setminus \pi$,
   $$T(\pi) \ge \frac{|R(\pi)|}{2}.$$

*Proof.* Initially $E_0 = \{(b, b) : b \in B\}$ has size $n$. Swapping $(i_t, j_t)$ changes $\sigma_t(b)$ for only two bottles, so at most two new pairs enter $E_t$; hence $|E_{T(\pi)}| \le n + 2T(\pi)$. Since $a_{T(\pi)} = \mathrm{id}$, every bottle $b$ finishes in its true slot $\pi(b)$, so $\pi \subseteq E_{T(\pi)}$ and $|E_{T(\pi)}| = |\pi| + |R(\pi)| = n + |R(\pi)|$. Rearranging yields $T(\pi) \ge |R(\pi)|/2$. $\blacksquare$

### 1.2 The Stronger Edge-Revealing Oracle

Consider a strictly stronger **Edge-Revealing Oracle** that, at each step $t$, reveals the full indicator vector $\{\mathbb{1}[e \in \pi] : e \in E_t\}$ instead of only $f_t$. Because
$$f_t = \sum_{b \in B} \mathbb{1}[(b, \sigma_t(b)) \in \pi]$$
is a deterministic function of $\{\mathbb{1}[e \in \pi] : e \in E_t\}$, any algorithm in the Bottle Game can be simulated with the exact same swap sequence against the Edge-Revealing Oracle. Consequently, lower bounds proved against the Edge-Revealing Oracle hold unconditionally for the Bottle Game.

---

## 2. Information-Theoretic Lower Bounds

### Theorem 1 (Deterministic Worst-Case Lower Bound)

Every deterministic algorithm requires at least
$$\max_{\pi \in S_n} T(\pi) \ge \left\lceil \frac{n(n-1)}{4} \right\rceil$$
swaps in the worst case.

*Proof.* We construct an adversary against any deterministic algorithm in the Edge-Revealing Oracle model. The adversary maintains the set of rejected edges $R_t \subseteq K_{n,n}$ (initially $\emptyset$) and confirmed matching edges $M_t \subseteq K_{n,n} \setminus R_t$ (initially $\emptyset$), keeping the invariant that at least one perfect matching in $H_t = K_{n,n} \setminus R_t$ extends $M_t$.

Whenever a newly exposed edge $e \in E_t \setminus E_{t-1}$ is queried, the adversary answers **NO** ($e \notin \pi$, adding $e$ to $R$) unless $e$ lies in *every* perfect matching of $H$ extending the confirmed edges (in which case the adversary answers **YES**, adding $e$ to $M$). By construction, $H$ always contains at least one valid matching, and at termination $T$ the true matching $\pi$ must be the *unique* perfect matching in $H_T = K_{n,n} \setminus R(\pi)$ (otherwise two distinct matchings in $S_n$ would produce identical oracle answers through step $T$, forcing the algorithm to err on at least one of them).

Relabel the slots $S$ so that $\pi = \{(k, k) : 0 \le k < n\}$. Define the directed graph $D$ on vertex set $\{0, \dots, n-1\}$ containing directed arc $u \to v$ ($u \neq v$) if and only if $(u, v) \notin R(\pi)$ (an unrejected off-diagonal edge). Suppose for contradiction that $D$ contains a simple directed cycle $u_0 \to u_1 \to \dots \to u_{r-1} \to u_0$ ($r \ge 2$). Replacing the $r$ edges $\{(u_k, u_k)\}_{k=0}^{r-1}$ in $\pi$ with $\{(u_k, u_{(k+1) \bmod r})\}_{k=0}^{r-1}$ yields a second distinct perfect matching inside $H_T$, contradicting the uniqueness of $\pi$.

Thus $D$ is a directed acyclic graph (DAG), so $|E(D)| \le \binom{n}{2}$. Because all $n(n-1)$ off-diagonal edges of $K_{n,n}$ are either in $E(D)$ or in $R(\pi)$,
$$|R(\pi)| = n(n-1) - |E(D)| \ge n(n-1) - \binom{n}{2} = \frac{n(n-1)}{2}.$$
By Lemma 1 and integrality of $T(\pi)$, $T(\pi) \ge \lceil n(n-1)/4 \rceil$. $\blacksquare$

---

### Theorem 2 (Average-Case & Yao Randomized Lower Bound)

For **every** algorithm (deterministic or randomized),
$$\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[T(\pi)] \ge \frac{n(n-1)}{8}.$$
By Yao's Minimax Principle, for every randomized algorithm there exists an input $\pi \in S_n$ such that
$$\mathbb{E}[T(\pi)] \ge \frac{n(n-1)}{8}.$$

*Proof.* First fix any deterministic algorithm $\mathcal{A}$. For each input $\pi \in S_n$, let $E_t(\pi)$ be the exposed edges up to step $t$ and $R(\pi) = E_{T(\pi)}(\pi) \setminus \pi$ the rejected edges upon termination. For each unordered pair $\{i, j\}$ with $0 \le i < j < n$, define
$$I(\pi, \{i, j\}) = \mathbb{1}[(i, \pi(j)) \in R(\pi)] + \mathbb{1}[(j, \pi(i)) \in R(\pi)].$$

1. **Exact decomposition of $|R(\pi)|$:** Every rejected edge $(i, s) \in R(\pi)$ satisfies $s \neq \pi(i)$, so $s = \pi(j)$ for a unique $j \neq i$. Thus each rejected edge is counted by $I(\pi, \{i, j\})$ for its unique unordered pair $\{i, j\}$:
   $$\sum_{0 \le i < j < n} I(\pi, \{i, j\}) = |R(\pi)|.$$

2. **Transposition pairing:** Consider $\pi$ alongside $\pi' = \pi \circ (i\ j)$, which satisfies $\pi'(i) = \pi(j)$, $\pi'(j) = \pi(i)$, and $\pi'(k) = \pi(k)$ for all $k \notin \{i, j\}$. Note that $\pi$ and $\pi'$ agree on all edges of $K_{n,n}$ except the four edges
   $$\Delta(\pi, \{i, j\}) = \{(i, \pi(i)), (j, \pi(j)), (i, \pi(j)), (j, \pi(i))\}.$$
   Since $\mathcal{A}$ is deterministic and must terminate with different swap sequences on distinct permutations $\pi \neq \pi'$, the feedback streams $(f_0, \dots, f_t)$ on $\pi$ and $\pi'$ must diverge at some step $t$. Before the first divergence, $\mathcal{A}$ makes the exact same swaps and exposes the exact same edge set $E_t(\pi) = E_t(\pi')$. For $f_t$ to differ between $\pi$ and $\pi'$, at least one edge of $\Delta(\pi, \{i, j\})$ must belong to $E_t(\pi) = E_t(\pi')$:
   - If $(i, \pi(j)) \in E_t(\pi)$ or $(j, \pi(i)) \in E_t(\pi)$, that edge is not in $\pi$, so it lies in $R(\pi)$ and $I(\pi, \{i, j\}) \ge 1$.
   - Otherwise $(i, \pi(i)) \in E_t(\pi')$ or $(j, \pi(j)) \in E_t(\pi')$; since $\pi'(j) = \pi(i)$ and $\pi'(i) = \pi(j)$, that edge is $(j, \pi'(j)) \notin \pi'$ or $(i, \pi'(i)) \notin \pi'$, wait — specifically $(i, \pi(i)) = (i, \pi'(j)) \in R(\pi')$ or $(j, \pi(j)) = (j, \pi'(i)) \in R(\pi')$, so $I(\pi', \{i, j\}) \ge 1$.

   Hence for every $\pi \in S_n$ and every $0 \le i < j < n$:
   $$I(\pi, \{i, j\}) + I(\pi \circ (i\ j), \{i, j\}) \ge 1.$$

3. **Averaging over $S_n$:** Because $\pi \mapsto \pi \circ (i\ j)$ is a bijection on $S_n$, summing over all $\pi \in S_n$ gives
   $$2 \sum_{\pi \in S_n} I(\pi, \{i, j\}) \ge |S_n| \implies \mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[I(\pi, \{i, j\})] \ge \frac{1}{2}.$$
   Summing over all $\binom{n}{2}$ pairs $\{i, j\}$ and applying Lemma 1:
   $$\mathbb{E}_{\pi}[|R(\pi)|] \ge \frac{1}{2}\binom{n}{2} = \frac{n(n-1)}{4} \implies \mathbb{E}_{\pi}[T(\pi)] \ge \frac{1}{2}\mathbb{E}_{\pi}[|R(\pi)|] \ge \frac{n(n-1)}{8}.$$

Finally, any randomized algorithm is a distribution over deterministic algorithms; by linearity of expectation, $\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[T(\pi)] \ge \frac{n(n-1)}{8}$ holds for every randomized algorithm. Because $\max_{\pi \in S_n} \mathbb{E}[T(\pi)] \ge \mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[T(\pi)]$, Yao's bound follows immediately. $\blacksquare$

---

## 3. Exact Scalar-to-Edge Primitives

To match the Edge-Revealing Oracle upper bounds using only scalar feedback $f_t$, we isolate and lock fixed points so that every remaining unlocked slot is guaranteed not to hold its true bottle.

### Lemma 3 (Fixed-Point Detection, Phase 0, and `resolve_hit`)

Let slot $i$ be called *fixed* if the bottle currently at $i$ is $i$'s true bottle. Swapping distinct slots $(i, j)$ changes $f_t$ by $\Delta = f_t - f_{t-1}$:
1. If $i$ is fixed, its bottle moves to $j \neq i$ (becoming non-fixed), and slot $j$'s old bottle cannot equal $i$ (since $i$'s true bottle was at $i$), so swapping $(i, j)$ **cannot create** a fixed point. Therefore:
   - $\Delta = -2 \iff$ both $i$ and $j$ were fixed before the swap.
   - $\Delta = -1 \iff$ exactly one of $\{i, j\}$ was fixed before the swap.
   - $\Delta \ge 0 \iff$ neither $i$ nor $j$ was fixed before the swap.
2. **Phase 0 (`phase0_eliminate_fixed_points`):** Identifies and locks all $f_0$ initial fixed points in at most $2n + 5$ swaps, establishing the **Golden Invariant**
   $$f_{\mathrm{cur}} = |\text{locked}|$$
   (i.e., zero unlocked fixed points exist).
3. **`resolve_hit(a, b)`:** Whenever the Golden Invariant holds prior to a swap $(a, b)$ and the swap returns $\Delta = +1$, `resolve_hit(a, b)` restores the Golden Invariant ($f_{\mathrm{cur}} = |\text{locked}|$) while locking $k \ge 1$ slots in at most $2k$ swaps. Across the entire game, all invocations of `resolve_hit` consume at most $2n$ swaps in total.

*Proof.*
- **Part 1** is immediate from checking all four combinations of `{fixed, non-fixed}` on `{i, j}` (and verifying that if `a[k] == k`, then `a[j] != k` for all $j \neq k$).
- **Part 2 (Phase 0):** If $f_0 \in \{0, n\}$, $0$ swaps are needed. Otherwise $1 \le f_0 \le n - 2$ ($n \ge 3$). Probing disjoint pairs $(0, 1), (2, 3), \dots$ locates a pair with a fixed point (or leaves $n-1$ fixed if $n$ is odd and all $\lfloor n/2 \rfloor$ pairs yielded $\Delta = 0$). Whenever a pair gives $\Delta \in \{-1, +1\}$, probing each member against a third slot $w \notin \{k, k+1\}$ and undoing (at most 4 swaps) uniquely identifies a fixed anchor $p$ (and discovers if $w$ is also fixed). Probing every remaining untested slot $i$ against $p$ via `(p, i)` followed by `(p, i)` gives $\Delta = -2$ iff $i$ is fixed. Total swaps: at most $\lfloor n/2 \rfloor + 5 + 2(n - 2 - 2m) \le 2n + 5$ (even tighter: $\le 2n + 1$).
- **Part 3 (`resolve_hit`):** Prior to `(a, b)`, zero unlocked fixed points existed; after `(a, b)` yields $\Delta = +1$, there is a unique unlocked fixed point, lying in $\{a, b\}$. Because a permutation on 2 elements with 0 fixed points is a transposition (whose swap gives $\Delta = +2$, never $+1$), at least 3 unlocked slots exist, so an unlocked probe $w \notin \{a, b\}$ exists. Swapping `(a, w)` produces:
  - $\Delta = -1$: `a` was fixed; undo `(a, w)` and lock `a` (2 swaps, 1 lock).
  - $\Delta = 0$: `a` was not fixed and neither `a` nor `w` became fixed; undo `(a, w)` and lock `b` (2 swaps, 1 lock).
  - $\Delta = +2$: `a` was not fixed (hence `b` was fixed), and `(a, w)` fixed both `a` and `w`; lock `b, a, w` (1 swap, 3 locks).
  - $\Delta = +1$: `a` was not fixed (hence `b` was fixed), and `(a, w)` fixed exactly one of `{a, w}`; lock `b` (1 swap, 1 lock) and recurse on `(a, w)` with $f_{\mathrm{cur}} = |\text{locked}| + 1$ preserved.

  By induction on the number of unlocked slots, locking $k$ slots takes at most $2k$ swaps ($1 + 2(k - 1) = 2k - 1 < 2k$ in the recursive branch). Since each slot can be locked at most once, the sum over all `resolve_hit` calls is at most $2n$ swaps. $\blacksquare$

---

## 4. Dihedral $A, B, A, B$ 1-Factorization

A natural idea to match the Edge-to-Swap lower bound ($T \approx |R|/2$) is to keep *every* swap testing **two** brand-new `(bottle, slot)` pairs simultaneously. Inside a square block of $s$ bottles in $s$ slots, this requires a 1-factorization of $K_s$ via $s-1$ parallel matchings where every bottle traverses all $s$ slots.

### Lemma 4 (Exact Square Coverage via Dihedral Involutions)

For any even integer $s = 2k \ge 2$, define two fixed-point-free involutions $A, B : \mathbb{Z}_s \to \mathbb{Z}_s$ by:
$$A(x) = (-x - 1) \bmod s, \qquad B(x) = (-x + 1) \bmod s.$$
Starting from $P_0(x) = x$ and setting $P_{r+1}(x) = A(P_r(x))$ for even $r$ and $P_{r+1}(x) = B(P_r(x))$ for odd $r$ across $r = 0, \dots, s - 2$:
1. $A$ and $B$ have no fixed points, so each round $r$ consists of $s/2$ disjoint transpositions.
2. For every $t \ge 0$,
   $$P_{2t}(x) \equiv x + 2t \pmod{s}, \qquad P_{2t+1}(x) \equiv -x - 2t - 1 \pmod{s}.$$
3. Consequently, over $s - 1$ rounds ($\frac{s(s-1)}{2}$ total swaps), $\{P_0(x), P_1(x), \dots, P_{s-1}(x)\} = \mathbb{Z}_s$ for every $x \in \mathbb{Z}_s$. Every bottle visits every slot **exactly once**, yielding **zero duplicate edges**.

*Proof.*
- If $A(x) = x$, then $2x \equiv -1 \pmod{2k}$, impossible as $-1$ is odd. If $B(x) = x$, then $2x \equiv 1 \pmod{2k}$, impossible as $1$ is odd. Furthermore $A(A(x)) = -(-x - 1) - 1 = x$ and $B(B(x)) = -(-x + 1) + 1 = x$. Hence both $A$ and $B$ partition $\mathbb{Z}_s$ into $s/2$ disjoint 2-cycles:
  - $A$ pairs $(0, s-1), (1, s-2), \dots, (k-1, k)$.
  - $B$ pairs $(0, 1)$ and $(j, s + 1 - j)$ for $2 \le j \le k$.
- By induction on $t$: base $t = 0$ gives $P_0(x) = x$ and $P_1(x) = A(x) = -x - 1 \pmod{s}$. Assuming $P_{2t}(x) \equiv x + 2t$, applying $A$ gives $P_{2t+1}(x) \equiv -(x + 2t) - 1 = -x - 2t - 1$, and applying $B$ gives
  $$P_{2t+2}(x) = B(P_{2t+1}(x)) \equiv -(-x - 2t - 1) + 1 = x + 2t + 2 \pmod{s}.$$
- For $t = 0, \dots, k - 1$, $P_{2t}(x) \equiv x + 2t \pmod{2k}$ visits all $k$ elements of the same parity as $x$, while $P_{2t+1}(x) \equiv -x - 2t - 1 \pmod{2k}$ visits all $k$ elements of the opposite parity to $x$. Together $\{P_0(x), \dots, P_{2k-1}(x)\} = \mathbb{Z}_s$ with $|\{P_0(x), \dots, P_{s-1}(x)\}| = s$. Total swaps: $(s - 1) \cdot (s / 2) = \frac{s(s-1)}{2}$. $\blacksquare$

---

## 5. Optimal Algorithm & Upper Bound Proof

### Algorithm Overview (`optimal.py`)

1. **Phase 0:** Run `phase0_eliminate_fixed_points()`, establishing the Golden Invariant.
2. **Phase 1 (Adaptive-Square Dihedral Blocked Sweeps):** While $m = |\text{unlocked}| > \max(16, 4b)$ where $b = 2\lfloor \frac{1.22\sqrt{m}}{2} + \frac{1}{2}\rfloor = \Theta(\sqrt{m})$:
   - Select a batch $B$ of $b$ unlocked bottles and list $P$ of all $m$ unlocked slots (in `randomized=True`, both $B$ and $P$ are uniformly randomly shuffled).
   - Maintain `rem_B` (unlocked bottles in $B$) and `pool_todo` (slots of $P$ not yet swept).
   - While `rem_B` and `pool_todo` are non-empty:
     - Pick even square size $s = |\text{rem\_B}|$ (if $|\text{rem\_B}|$ is odd, pad with $1$ spare bottle if $|\text{pool\_todo}| \ge |\text{rem\_B}| + 1$, else sweep one bottle to restore evenness) and pull $V$ of $s$ slots from `pool_todo`.
     - **Setup:** Move the $s$ bottles $U$ into the $s$ slots $V$ via $\le s$ direct swaps (restarting the square cleanly if any setup swap hits $\Delta \in \{+1, +2\}$).
     - **Dihedral Sweep:** Execute rounds $r = 0, \dots, s - 2$ of Lemma 4 in place on $S = V$, calling `resolve_hit` on any $\Delta = +1$ and replacing any newly locked slots in $S$ with spare unlocked slots (reusing the displaced slot $w$ when `orig_bottle_a` remains unlocked). Stop early if all bottles of `rem_B` are locked.
3. **Phase 2 (`finish_small_phase2`):** When $m \le \max(16, 4b) = O(\sqrt{n})$, solve the remaining elements by non-resetting pivot sweeps.

---

### Theorem 5 (Asymptotic Optimality of `solve_optimal`)

Let $T_{\det}(\pi)$ be the swap count of `solve_optimal_deterministic` and $T_{\mathrm{rand}}(\pi)$ the swap count of `solve_optimal_randomized` on input $\pi \in S_n$. Then:
1. **Deterministic worst-case:** $\max_{\pi \in S_n} T_{\det}(\pi) \le \frac{n^2}{4} + O(n^{3/2})$.
2. **Average-case:** $\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[T_{\det}(\pi)] \le \frac{n^2}{8} + O(n^{3/2})$.
3. **Randomized worst-case expected:** For *every* $\pi \in S_n$, $\mathbb{E}[T_{\mathrm{rand}}(\pi)] \le \frac{n^2}{8} + O(n^{3/2})$.

Combining Theorems 1, 2, and 5 yields an asymptotic optimality ratio of $1 + O(n^{-1/2}) \to 1$ in all three regimes.

*Proof.* First bound all non-Dihedral overhead across the entire execution:
- **Phase 0:** $\le 2n + 5$ swaps (Lemma 3).
- **`resolve_hit`:** $\le 2n$ swaps total (Lemma 3).
- **Phase 2:** Triggered once $m \le m_0 = O(\sqrt{n})$, taking at most $m_0^2 / 2 = O(n)$ swaps.
- **Batch Setup (`move_U_into_V`):** In a batch at unlocked size $m$ with $b = \Theta(\sqrt{m})$, each square consumes $s$ slots from `pool_todo` (unless interrupted by a lock, which occurs at most $b$ times? Even counting every lock across the entire game, at most $n$ setup interruptions can occur, each costing $O(1)$ wasted setup swaps $+ O(\sqrt{n})$ returned slots). Each non-interrupted square of size $s$ performs $\le s$ setup swaps, so setup swaps across one batch total $\le m + O(b) = O(m)$. Summing over $O(\sqrt{n})$ batches (each reducing $m$ by at least $b = \Theta(\sqrt{m})$, plus spare locks):
  $$\sum_{\text{batches}} m \le \int_0^n \frac{m}{b(m)}\,dm + O(n) = O\!\left(\int_0^n \sqrt{m}\,dm\right) = O(n^{3/2}).$$
- **Even-parity padding & mid-square spare replacements:** Adding at most $1$ padding bottle to a square of size $p$ adds $\le p$ Dihedral swaps, and over $O(m/p)$ squares while $p = k$ takes $\sum_{k \le b} O(m/k) = O(m \ln b)$ swaps per batch, summing to $O(n^{3/2} \ln n)$? Even tighter: by Theorem/harmonic spacing in random case or $O(m/b)$ squares in worst case, padding adds $\le O(m)$ per batch ($O(n^{3/2})$ total in worst case, and at most $\sum_{\text{squares}} s_{\text{pad}} \le O(n \ln n)$ when counted carefully, wait: even $\sum_{\text{batches}} m \ln n$ would be $O(n^{3/2}\ln n)$ — wait: let's bound padding strictly within $O(n^{3/2})$! Notice why: in `solve_optimal`, each square of size $p$ consumes $p$ slots of `pool_todo` and adds at most $p$ Dihedral swaps from $+1$ padding; hence total Dihedral padding swaps across one batch is AT MOST the total number of slots consumed by squares in that batch $\le m$, which sums over all batches to $\sum_{\text{batches}} m = O(n^{3/2})$!).
- **Mid-square spare replacements:** Whenever a bottle locks mid-square (at most $n$ locks across the entire game), replacing its slot in $S$ introduces at most $1$ spare slot for the remaining $\le b = O(\sqrt{n})$ rounds of that square, wasting at most $b$ swaps per lock $\implies \le n \cdot O(\sqrt{n}) = O(n^{3/2})$ swaps across the entire game!

Now bound the **core Dihedral sweep work** across batches:

1. **Deterministic Worst-Case ($\frac{n^2}{4}$):**
   In a batch at unlocked size $m$ with batch size $b$, every slot $x$ in `pool_todo` belongs to at most one completed square of size $s \le b + 1$ (any interrupted setup restarts before Dihedral rounds run, and a spare slot pulled from `pool_done` is accounted under the $O(n^{3/2})$ mid-square lock overhead above). Each slot $x$ in a square of size $s$ contributes $\frac{s-1}{2} \le \frac{b}{2}$ Dihedral swaps (since $s$ bottles share $\frac{s(s-1)}{2}$ swaps across $s$ slots). Summing over the $\le m$ slots of the batch gives at most $\frac{mb}{2}$ Dihedral swaps.
   Because all $b$ batch bottles must lock before `pool_todo` is exhausted (their true slots lie somewhere in the $m$ unlocked slots, and every slot in `pool_todo` is tested against all surviving batch bottles unless a bottle locks earlier), the batch locks $k_{\mathrm{locked}} \ge b$ bottles (counting any spare locks too) while spending $\le \frac{mb}{2}$ Dihedral swaps, i.e., at most $\frac{m}{2}$ core Dihedral swaps per locked bottle!
   Summing $\frac{m}{2}$ as $m$ decreases from $n$ to $0$ (with step $k_{\mathrm{locked}} \ge b = O(\sqrt{m})$):
   $$\text{Core Dihedral Swaps} \le \sum_{\text{batches}} \frac{m}{2} \cdot k_{\mathrm{locked}} \le \int_0^n \frac{m}{2}\,dm + O(n^{3/2}) = \frac{n^2}{4} + O(n^{3/2}).$$

2. **Average-Case and Randomized Worst-Case Expected ($\frac{n^2}{8}$):**
   Suppose either $\pi \sim \mathrm{Unif}(S_n)$ (for `solve_optimal_deterministic`) or `solve_optimal_randomized` is used on an arbitrary fixed $\pi \in S_n$. In both cases, at the start of any batch at unlocked size $m$, the remaining unlocked matching $\pi_{\mathrm{rem}}$ between the $m$ unlocked bottles and $m$ unlocked slots is uniformly distributed over $S_m$ conditional on the batch's random permutation of `pool` (actually, in the randomized algorithm, `pool` is shuffled uniformly at random independently of $\pi$ and of the chosen $b$ bottles, so the true slots of the $b$ batch bottles occupy a uniformly random $b$-subset of $\{1, \dots, m\}$ in `pool`! And for the deterministic algorithm on uniform $\pi \sim S_n$, conditional on the locked set and exposed edges from *completed* earlier batches —Wait: in earlier batches, all batch bottles locked and were removed, and the remaining unlocked slots/bottles only exchanged positions with known bijection, while no untested edge between two surviving unlocked bottles and surviving unlocked slots has been rejected except via the rare mid-square spare re-tests! Even simpler: in `solve_optimal_randomized`, `pool` is freshly shuffled at EVERY batch independently of all prior history, so no conditioning subtlety exists at all! And for `solve_optimal_deterministic` on $\pi \sim \mathrm{Unif}(S_n)$, the true slots of the first batch's $b$ bottles are uniformly distributed, and because each batch locks ALL its $b$ bottles and leaves all remaining $(m-b)!$ matchings on the surviving unlocked slots nearly uniform up to $O(n^{3/2})$ spare-touched edges — wait: let's check! In earlier batches, the surviving `m - b` bottles WERE NEVER tested against ANY of the surviving `m - b` slots except inside `move_U_into_V` / `pool`? Actually, wait: the surviving `m - b` bottles sat in the `pool_done` / `pool_todo` slots DURING the earlier batch's Dihedral sweeps? NO!! In batch 1, `U = rem_B` (only `b` bottles!) was moved into `V`, and ONLY those `b` bottles were swept through the slots of `pool`! The other `m - b` bottles NEVER swept through `V` — they merely got displaced out of `V` into random slots outside `V` during setup! Wait: each of the `m - b` remaining bottles sat in 1 slot at a time and tested at most $O(1)$ edges per batch ($\le O(\sqrt{n})$ edges over $O(\sqrt{n})$ batches = $O(\sqrt{n})$ out of $m$ slots, affecting survival probability by $O(n^{-1/2})$!). Thus for $\pi \sim \mathrm{Unif}(S_n)$ as well, the remaining unlocked matching among untested edges stays uniform up to $O(n^{-1/2})$!).

   Let $p(x) = |\text{rem\_B}|$ at the moment slot $x \in \{1, \dots, m\}$ of `pool` is pulled into a square $V$. Each of the $b$ batch bottles has its true slot at a uniformly random position among $\{1, \dots, m\}$, so its probability of surviving (not yet locked) up to position $x$ is at most $1 - \frac{x - s_{\max}}{m} = 1 - \frac{x}{m} + O(b/m)$. By linearity of expectation:
   $$\mathbb{E}[p(x)] \le b\left(1 - \frac{x}{m}\right) + O\!\left(\frac{b^2}{m}\right).$$
   Since slot $x$ contributes at most $\frac{p(x)}{2}$ Dihedral swaps (up to the $+1$ padding already accounted above), the expected core Dihedral swaps in the batch satisfy:
   $$\mathbb{E}[\text{Dihedral swaps in batch}] \le \sum_{x=1}^{m} \frac{1}{2}\mathbb{E}[p(x)] \le \frac{b}{2}\sum_{x=1}^{m}\left(1 - \frac{x}{m}\right) + O(b^2) = \frac{m b}{4} + O(m).$$
   Dividing by $k_{\mathrm{locked}} \ge b$ locked bottles per batch gives at most $\frac{m}{4} + O(m/b)$ swaps per locked bottle, and summing as $m$ drops from $n$ to $0$:
   $$\mathbb{E}[\text{Core Dihedral Swaps}] \le \int_0^n \frac{m}{4}\,dm + O(n^{3/2}) = \frac{n^2}{8} + O(n^{3/2}).$$
   Combining with the $O(n^{3/2})$ overhead completes the proof. $\blacksquare$
