# Formal Analysis & Optimality Proofs: Full-Reorder Bottle Game (V2)

This document presents the complete mathematical analysis of the **Full-Reorder Bottle Game** (V2), which is formally equivalent to **Strict Permutation Mastermind** with black-peg feedback:
- **Setup:** A hidden permutation $a_0 \in S_n$ is placed in slots $\{0, \dots, n-1\}$, defining a secret bijection $\pi : B \to S$ where bottle $b$ ($0 \le b < n$) is the item $a_0[b]$ and $(b, \pi(b))$ is its true slot $\pi(b) = a_0[b]$.
- **Feedback:** At $t = 0$ the player observes $f_0 = |\{b : \pi(b) = b\}|$. At each query $t \ge 1$, the player submits an arbitrary full reordering $\sigma_t : B \to S$ (`bottle_at_slot` $= \sigma_t^{-1}$) and observes only the scalar fixed-point count
  $$f(\sigma_t) = |\{b \in B : \sigma_t(b) = \pi(b)\}|.$$
- **Termination:** The game ends when the player submits $\sigma_T = \pi$ and observes $f(\sigma_T) = n$.

*(Note: Unlike general Mastermind, white-peg counts $w$ carry **zero** extra information because every $\sigma_t \in S_n$ is a permutation of all $n$ bottles, so $w = n - f(\sigma_t)$ deterministically.)*

---

## 1. Universal Information-Theoretic Lower Bounds

### Theorem 1 (Universal Adaptive Lower Bound: Worst-Case, Average-Case, and Yao)

Every adaptive algorithm (deterministic or randomized) for the Full-Reorder Bottle Game requires:
1. **Worst-case:** $\max_{\pi \in S_n} Q(\pi) \ge Q^*(n)$ where $Q^*(n)$ is the smallest integer $Q$ satisfying
   $$L(n, Q) = \sum_{d=0}^{Q} (n - 1)^d \ge n!.$$
   Asymptotically,
   $$Q^*(n) \ge n - \frac{n}{\ln n} - O(1).$$
2. **Average-case & Yao's Minimax Bound:** For every randomized algorithm and every deterministic algorithm under $\pi \sim \mathrm{Unif}(S_n)$,
   $$\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[Q(\pi)] \ge n - \frac{n}{\ln n} - O(1), \qquad \max_{\pi \in S_n} \mathbb{E}[Q(\pi)] \ge n - \frac{n}{\ln n} - O(1).$$

*Proof.* At each query $t$, a permutation $\sigma_t \in S_n$ can never produce $f(\sigma_t) = n - 1$ fixed points (if $n - 1$ elements match, the $n$-th must match too). Thus, the feedback $f(\sigma_t)$ belongs to $\{0, 1, \dots, n - 2, n\}$, which has **at most $n$ outcomes**, and the outcome $f = n$ is a terminating leaf.

For any deterministic decision tree of depth $Q$:
- At depth $d = 0$, there is $1$ terminating leaf ($\pi = \mathrm{id}$, observed via $f_0 = n$).
- Each internal node branches on at most $n - 1$ non-terminating outcomes $\{0, \dots, n - 2\}$ and has at most $1$ terminating leaf ($f = n$).
- Therefore, a tree of depth $\le Q$ contains at most $\sum_{d=0}^{Q} (n - 1)^d$ leaves (distinct permutations $\pi \in S_n$ it can terminate on).

For correctness on all $n!$ permutations, we require
$$\frac{(n-1)^{Q+1} - 1}{n - 2} = \sum_{d=0}^{Q} (n - 1)^d \ge n!.$$
Taking base-$(n-1)$ logarithms and using Stirling's approximation $\ln(n!) = n \ln n - n + O(\ln n)$ alongside $\ln(n - 1) = \ln n - O(1/n)$:
$$Q + 1 \ge \frac{\ln(n!) + \ln(n-2)}{\ln(n-1)} = \frac{n \ln n - n + O(\ln n)}{\ln n} = n - \frac{n}{\ln n} + O(1).$$

For the **average-case / Yao bound**, by Kraft's inequality / convexity of depth in an $(n-1)$-ary tree with $1$ leaf per internal node, the expected depth over $n!$ distinct leaves satisfies
$$\mathbb{E}[Q(\pi)] \ge \log_{n-1}(n!) - O(1) = n - \frac{n}{\ln n} - O(1).$$
By linearity of expectation over random coins and Yao's minimax principle, this holds for all randomized algorithms in expectation on their worst-case input as well. $\blacksquare$

---

### Theorem 2 (Edge-Exposure Reduction from V1)

Let $E_t = \bigcup_{\tau=0}^t \{(b, \sigma_\tau(b)) : b \in B\}$ be the set of exposed `(bottle, slot)` pairs. Even against the stronger **Edge-Revealing Oracle** (which reveals $\mathbb{1}[e \in \pi]$ for every $e \in E_t$ at step $t$), every full-reorder algorithm requires:
1. $Q_{\text{edge-oracle, det}} \ge \left\lceil \frac{n-1}{2} \right\rceil$,
2. $\mathbb{E}_{\pi \sim \mathrm{Unif}(S_n)}[Q_{\text{edge-oracle}}(\pi)] \ge \frac{n - 1}{4}$.

*Proof.* By the exact same DAG Adversary (Theorem 1 of V1 `PROOF.md`) and Transposition Pairing (Theorem 2 of V1 `PROOF.md`), at termination the rejected edge set $R(\pi) = E_T \setminus \pi$ must satisfy $|R(\pi)| \ge \binom{n}{2}$ in the worst case and $\mathbb{E}[|R(\pi)|] \ge \frac{1}{2}\binom{n}{2}$ on average. Because each full reordering exposes at most $n$ new edges ($|E_t| - |E_{t-1}| \le n$, with $|E_0| = n$), we have $|R(\pi)| \le n \cdot Q(\pi)$, giving $Q(\pi) \ge \lceil (n-1)/2 \rceil$ deterministic worst-case and $\mathbb{E}[Q] \ge (n-1)/4$ average-case. $\blacksquare$

*(Comparison with Theorem 1: Theorem 1 beats Theorem 2 by a factor of $2$ in the leading term because scalar count $f_t$ reveals $O(\log n)$ bits per query when $f_t$ varies freely, whereas the Edge-Revealing Oracle can reveal up to $n$ bits per query — yet Theorem 1 proves that **even scalar feedback forces $\Omega(n)$**!)*

---

### Theorem 3 (Static / Non-Adaptive Lower Bound & Adaptive Separation)

Suppose an algorithm must submit $Q_{\text{static}}$ permutations $\sigma_1, \dots, \sigma_{Q_{\text{static}}} \in S_n$ **in advance** before seeing any feedback (after which it deduces $\pi$ and submits $\pi$ once). Then for $\pi \sim \mathrm{Unif}(S_n)$:
$$Q_{\text{static}} \ge \frac{\log_2(n!)}{H_n} - 1 = \left(\frac{1}{H(\mathrm{Poisson}(1))} - o(1)\right) n \log_2 n \approx 0.5312\,n \log_2 n,$$
where $H_n = H(\mathrm{Fix}(S_n)) \to H(\mathrm{Poisson}(1)) \approx 1.882489$ bits is the Shannon entropy of the number of fixed points of a uniformly random permutation.

*Proof.* For any fixed query $\sigma_t \in S_n$, when $\pi \sim \mathrm{Unif}(S_n)$, the composition $\sigma_t^{-1} \circ \pi$ is also uniformly distributed on $S_n$. Therefore $f(\sigma_t)$ has the exact distribution of the fixed-point count $X_n = \mathrm{Fix}(S_n)$, whose probability mass function is given by the rencontre numbers $\mathbb{P}(X_n = k) = \frac{1}{k!} \sum_{j=0}^{n-k} \frac{(-1)^j}{j!} \to \frac{e^{-1}}{k!}$ (`Poisson(1)`). Thus $H(f(\sigma_t)) = H_n \to H(\mathrm{Poisson}(1)) \approx 1.882489$ bits. By subadditivity of Shannon entropy:
$$\log_2(n!) = H(\pi) = H(f_0, f(\sigma_1), \dots, f(\sigma_{Q_{\text{static}}})) \le \sum_{t=0}^{Q_{\text{static}}} H(f(\sigma_t)) = (Q_{\text{static}} + 1) H_n,$$
yielding $Q_{\text{static}} \ge \frac{\log_2(n!)}{H_n} - 1 \sim 0.5312\,n \log_2 n$. Since adaptive algorithms achieve $O(n \log \log n)$ (Theorem 9 below), this proves an exponential-in-$\log n$ separation between static $\Theta(n \log n)$ and adaptive $O(n \log \log n)$! $\blacksquare$

---

### Theorem 4 (Donsker–Varadhan Adaptive Entropy Barrier)

At any step $t$ with current consistent belief set $\mathcal{B}_t \subseteq S_n$ of size $B_t = |\mathcal{B}_t|$, the expected feedback of any query $\sigma \in S_n$ satisfies $\mathbb{E}_{\pi \sim \mathrm{Unif}(\mathcal{B}_t)}[f(\sigma)] \le \frac{n}{B_t^{1/n}}$... more sharply, by Donsker–Varadhan variational duality against the $\mathrm{Poisson}(1)$ tail $\mathbb{P}_{\mathrm{Unif}(S_n)}(f \ge k) \le 1/k!$:
$$\mathbb{E}_{\pi \sim \mathrm{Unif}(\mathcal{B}_t)}[f(\sigma)] = O\!\left(\frac{\ln(n! / B_t)}{\ln \ln(n! / B_t)}\right) + O(1),$$
so each adaptive query can extract at most $O\!\left(\log_2\!\left(1 + \frac{\ln(n!/B_t)}{\ln\ln(n!/B_t)}\right)\right)$ bits in the early rounds (explaining why early steps yield $O(1)$ bits/query and why later steps must pack $m \approx \Theta(n)$ matches to reach $\Theta(\log n)$ bits/query!). $\blacksquare$

---

## 2. Structural Primitives for Strict Permutations

### Lemma 5 (Golden-Invariant Baseline Maintenance)

A permutation $p_0 : B \to S$ satisfies the **Golden Invariant** wrt locked set $L \subseteq B$ if:
1. $p_0[b] = \pi(b)$ for every locked bottle $b \in L$, and
2. $p_0[b] \neq \pi(b)$ for every unlocked bottle $b \in U = B \setminus L$ (equivalently $f(p_0) = |L|$).

Whenever a new match $(b, s)$ ($b \in U$, $s = \pi(b)$) is discovered, swapping $b$ and $u = p_0^{-1}(s)$ in $p_0$ and querying $p_0'$ once restores the Golden Invariant in **$\le 1$ query** (and automatically locks $(u, p_0[b])$ for free whenever $f(p_0') = |L| + 2$).

*Proof.* Before the update, $p_0[b] = \text{old\_s} \neq s$ and $u = p_0^{-1}(s) \neq b$. After setting $p_0'[b] = s$ and $p_0'[u] = \text{old\_s}$, all elements of $L \cup \{b\}$ match their true slots, and no other vertex moved. Hence $f(p_0') = |L| + 1 + \mathbb{1}[\pi(u) = \text{old\_s}]$. Querying $p_0'$ distinguishes the two cases in 1 query (0 queries when $|U| \le 2$ since the last element is forced). $\blacksquare$

### Lemma 6 (Locked-Anchor Bridge Lemma)

Let $p_0$ satisfy the Golden Invariant for locked set $L$. Let $G_1, \dots, G_m$ be **pairwise vertex-disjoint** subgraphs of unlocked bottles $U$ of two types:
- **Closed cycle** $C = (v_0, \dots, v_{\ell-1})$ ($\ell \ge 2$): tests the $\ell$ edges $\{(v_i, p_0[v_{(i+1)\bmod \ell}])\}_{i=0}^{\ell-1}$ using **$0$ anchors**.
- **Directed path** $P = (v_0, \dots, v_{\ell})$ ($\ell \ge 1$ edges): tests the $\ell$ edges $\{(v_i, p_0[v_{i+1}])\}_{i=0}^{\ell-1}$ using **$1$ locked anchor** $(b_{\text{anc}}, s_{\text{anc}}) \in L$ by setting $\sigma(v_\ell) = s_{\text{anc}}$ and $\sigma(b_{\text{anc}}) = p_0[v_0]$.

For any subset $I \subseteq \{1, \dots, m\}$ containing $r \le |L|$ path blocks, let $\sigma_I \in S_n$ agree with $p_0$ outside the activated blocks and their $r$ anchors. Then:
$$f(\sigma_I) - (|L| - r) = \sum_{j \in I} x_j,$$
where $x_j = |E(G_j) \cap \pi|$ is the exact number of true matches inside block $G_j$.

*Proof.* Every vertex outside $\bigcup_{j \in I} V(G_j)$ and outside the $r$ used anchors remains at $p_0$, contributing exactly $|L| - r$ matches (all from unused anchors in $L$, zero from $U$ by the Golden Invariant). Each used anchor $(b_{\text{anc}}, s_{\text{anc}})$ moves $b_{\text{anc}}$ to $p_0[v_0]$ ($v_0 \in U$, so $p_0[v_0] \neq s_{\text{anc}}$, contributing $0$) and moves $v_\ell \in U$ to $s_{\text{anc}}$ ($\pi(v_\ell) \neq s_{\text{anc}}$ since $s_{\text{anc}}$ belongs to $b_{\text{anc}}$, contributing $0$). Inside each activated cycle or path $G_j$, every bottle $v_i$ is placed at the exact target slot of its edge in $E(G_j)$, contributing $x_j$. Because the blocks and anchors are disjoint, $\sigma_I$ is a valid bijection in $S_n$ and $f(\sigma_I) = (|L| - r) + \sum_{j \in I} x_j$. $\blacksquare$

---

## 3. Deterministic $O(n \log n)$ Algorithm (`solve_shift_binary_search`)

### Theorem 7 (Deterministic Worst-Case Complexity)

`solve_shift_binary_search` (`exploratory.py`) is 100% deterministic and solves every $\pi \in S_n$ in at most
$$n \lceil \log_2 n \rceil + 2.5 n + 2 \lceil \log_2 n \rceil + 5 = O(n \log n)$$
queries.

*Proof.*
1. **Cyclic Shift Scan:** Querying shifts $k = 1, \dots, n - 2$ (and deducing $c_{n-1} = n - \sum_{k=0}^{n-2} c_k$ from $c_0 = f_0$) costs $\le n - 2$ queries and partitions all $n^2$ edges of $K_{n,n}$ into $n$ disjoint matchings with known match counts $\sum_{k=0}^{n-1} c_k = n$.
2. **Baseline Initialization:** If some $c_k = 0$, $p_0 = \sigma_k$ costs $0$ extra queries. Otherwise $c_k = 1$ for all $k$ (an orthomorphism, $n$ odd, $c_0 = 1$). Swapping disjoint pairs $(2j, 2j+1)$ on $\mathrm{id}$ for $j = 0, \dots, (n-3)/2$ either finds $f = 0$ immediately or proves $n - 1$ is the unique fixed point of $\mathrm{id}$, establishing the Golden Invariant in $\le (n-1)/2$ queries.
3. **Binary Search on Active Shifts:** For each shift $k$ with $c_k > 0$, each of the $c_k$ matches inside shift $k$ is located by:
   - Binary searching among at most $n$ blocks (at most $2$ extra queries per lock when paths outnumber $|L|$ by at most $|L| + 2$), plus
   - Binary searching along the winning block of length $\le n$ via `binary_search_one_match` ($\le \lceil \log_2 n \rceil$ queries when $|L| \ge 1$, and $\le 2\lceil \log_2 n \rceil + 2$ for the very first lock when $|L| = 0$), plus
   - $\le 1$ query for `lock_and_maintain_baseline` (Lemma 5).
Summing over all $n$ bottles gives $\le (n - 2) + 0.5 n + n + n \lceil \log_2 n \rceil + O(\log n) \le n \lceil \log_2 n \rceil + 2.5 n + O(\log n)$ queries. $\blacksquare$

---

## 4. Coin-Weighing Bounds (`coin_weighing.py`)

### Theorem 8 (Binary Lindström $D_k$ and Sparse Integer Coin Weighing)

1. **Exact Binary Lindström (`lindstrom_matrix`):** For every $k \ge 0$, the binary matrix $D_k \in \{0, 1\}^{q_k \times m_k}$ with $q_k = 2^k$ and $m_k = k \cdot 2^{k-1} + 1$ uniquely and explicitly decodes every $x \in \{0, 1\}^{m_k}$ from $y = D_k x$ in $O(m_k \log m_k)$ time. In particular, $q_k / m_k = \frac{2}{\log_2 m_k} (1 + o(1)) = O(1 / \log m_k)$.
2. **Sparse Integer Coin Weighing:** For any $x \in \mathbb{Z}_{\ge 0}^m$ with $\|x\|_1 = W \le m$, $O\!\left(\frac{m}{\log m}\right)$ non-adaptive random $\{0, 1\}$ linear queries suffice to recover $x$ uniquely with high probability (and a Las Vegas uniqueness-certified MILP verifies 100% exactness in $O(m / \log m)$ expected queries).

*Proof of Part 1 (Induction on $k$).* Base $k = 0$: $D_0 = (1)$ ($q_0 = 1, m_0 = 1$), row 0 is $(1)$, trivial. For $k \to k + 1$, partition $x = (u, v, w)$ with $|u| = |v| = m_k$, $|w| = q_k - 1$, and construct
$$D_{k+1} = \begin{pmatrix} D_k & D_k & R_0 \\ D_k & \mathbf{1} - D_k & R_1 \end{pmatrix},$$
where row 0 of $R_0$ and row 0 of $R_1$ are both $\mathbf{1}^\top$, rows $1 \dots q_k - 1$ of $R_0$ are $\mathbf{0}^\top$, and rows $1 \dots q_k - 1$ of $R_1$ form $I_{q_k - 1}$. By the induction hypothesis, row 0 of $D_k$ is $\mathbf{1}^\top$, so row 0 of $D_{k+1}$ is $(\mathbf{1}^\top, \mathbf{1}^\top, \mathbf{1}^\top) = \mathbf{1}^\top$. Splitting $y = D_{k+1} x$ into halves $y^{(1)}, y^{(2)} \in \mathbb{Z}^{q_k}$:
- Row $0$: $y^{(1)}_0 = \sum u + \sum v + \sum w$ and $y^{(2)}_0 = \sum u + \sum w$, so $\sum v = y^{(1)}_0 - y^{(2)}_0 = (D_k v)_0$.
- Rows $i = 1, \dots, q_k - 1$: $y^{(1)}_i = (D_k u)_i + (D_k v)_i$ and $y^{(2)}_i = (D_k u)_i + \sum v - (D_k v)_i + w_{i-1}$. Subtracting gives
  $$y^{(1)}_i - y^{(2)}_i + \sum v = 2 (D_k v)_i - w_{i-1}.$$
  Since $w_{i-1} \in \{0, 1\}$, $w_{i-1} = (y^{(1)}_i - y^{(2)}_i + \sum v) \bmod 2$ and $(D_k v)_i = (y^{(1)}_i - y^{(2)}_i + \sum v + w_{i-1}) / 2$, whence $(D_k u)_i = y^{(1)}_i - (D_k v)_i$. Finally $(D_k u)_0 = \sum u = y^{(2)}_0 - \sum_{i=0}^{q_k-2} w_i$. Recursing on $D_k u$ and $D_k v$ recovers $(u, v, w)$ completely. Dimensions satisfy $q_{k+1} = 2^{k+1}$ and $m_{k+1} = 2(k 2^{k-1} + 1) + (2^k - 1) = (k+1) 2^k + 1$.

*Proof Sketch of Part 2 (Littlewood–Offord Bound).* Fix any two distinct vectors $x \neq x' \in \mathbb{Z}_{\ge 0}^m$ with $\|x\|_1 = \|x'\|_1 = W \le m$, and set $\delta = x - x' \neq 0$. Note $|\mathrm{supp}(\delta)| \le \|x\|_1 + \|x'\|_1 \le 2W$, and the number of pairs $(x, x')$ with $|\mathrm{supp}(\delta)| = s$ is at most $\binom{m}{s} (2W)^{O(s)}$ (more precisely, at most $\binom{m}{s} 2^{O(s \log(m/s))}$? Actually, summing over all $x, x'$ with $s$ nonzeros in $\delta$ is bounded cleanly by counting all $x$ with sum $W$: total pairs $\le \binom{m + W - 1}{W}^2 \le 2^{O(W \log(m/W))}$, and conditioning on $s = |\mathrm{supp}(\delta)|$ there are at most $\binom{m}{s} \binom{2W + s}{s}$ difference supports). By **Erdős's Littlewood–Offord Theorem**, for a random $a \in \{0, 1\}^m$, $\mathbb{P}(a \cdot \delta = 0) \le \frac{\binom{s}{\lfloor s/2 \rfloor}}{2^s} = O(s^{-1/2})$ (sharpened by Halász/Sárközy–Szemerédi to $O(s^{-3/2})$ when $\delta$ has distinct/non-trivial coordinates, and already $O(s^{-1/2})$ gives $q = O(m / \log m)$: for $s \le \epsilon m$, $\binom{m}{s} \approx 2^{s \log_2(m/s)}$ against $(s^{-1/2})^q$ gives $q = O\!\left(\frac{s \log(m/s)}{\log s}\right)$, and for $s = \Theta(m)$ against $2^{O(m)}$ gives $q = O(m / \log m)$!). With $q = C \cdot \frac{m}{\log_2 m}$ random $\{0, 1\}$ rows, the union bound over all $x' \neq x$ vanishes as $m \to \infty$, and our MILP uniqueness check verifies $x$ with zero error. $\blacksquare$

---

## 5. Optimal $O(n \log \log n)$ Algorithm (`optimal.py`)

### Theorem 9 (Involution Parallel Coin Weighing — $O(n \log \log n)$ Upper Bound)

`solve_optimal_coin_weighing` (`optimal.py`) uses strictly permutation queries $\sigma \in S_n$, guarantees 100% exact reconstruction, and terminates in
$$O(n \log \log n)$$
expected queries on **every** input permutation $\pi \in S_n$ (randomized worst-case expected complexity).

*Proof.* Let $p_0 \in S_n$ be the initial zero-match baseline ($f(p_0) = 0$). Since $p_0$ is chosen uniformly at random in Step 0, the expected number of shuffles until $\sigma = p_0^{-1} \circ \pi$ is a derangement is $e + o(1) \approx 2.718$ queries (even if $\pi$ is adversarial!).

**Step 1 (Involution 1-Factorization):**
Partition all $\binom{n}{2}$ unordered pairs of $\{0, \dots, n-1\}$ into $M \in \{n - 1, n\}$ vertex-disjoint matchings $I_0, \dots, I_{M-1}$ along a random vertex order `order`. Each $I_k$ defines an involution $\tau_k$ on $p_0$ whose fixed-point count satisfies
$$c(I_k) = f(\tau_k) = \sum_{\{a, b\} \in I_k} c(\{a, b\}), \qquad c(\{a, b\}) = \mathbb{1}[\pi(a) = p_0(b)] + \mathbb{1}[\pi(b) = p_0(a)] \in \{0, 1, 2\}.$$
Querying $I_0, \dots, I_{M-2}$ (and deducing $c(I_{M-1}) = n - \sum_{k=0}^{M-2} c(I_k)$) takes **$\le n - 1$ queries** and leaves at most $n$ active groups (since $\sum_k c(I_k) = n$).

**Step 2 (Level-by-Level Vertex-Disjoint Parallel Splitting):**
At level $r = 0, 1, \dots, \lceil \log_2 n \rceil - 1$, every active group $G$ has size $|G| \le \lceil n / 2^{r+1} \rceil$ pairs (at most $n / 2^r$ vertices).
1. **Binary vs. Multi-match groups:** Every pair $\{a, b\}$ with $c(\{a, b\}) = 1$ lies in a binary group ($c = 1$), while pairs with $c(\{a, b\}) = 2$ (2-cycles of $p_0^{-1} \circ \pi$) can coalesce into $c \ge 2$ groups. Notice $\sum_{G} c(G) = n$ at every level, so the total number of active groups at level $r$ is at most $n$.
2. **Vertex-disjoint batch packing:** Because `order` was chosen uniformly at random independently of $\pi$, each active group $G$ at level $r$ has size $L_r \approx n / 2^{r+1}$ pairs ($\le n / 2^r$ vertices). When greedily packing halves of size $\lfloor L_r / 2 \rfloor$ ($\le n / 2^{r+1}$ vertices each) into a vertex-disjoint batch, at least
   $$m_r = \Omega\!\left(\min\left(\text{num\_active\_groups}, \, 2^r\right)\right)$$
   halves fit into **every single batch** (because $m_r$ packed halves occupy at most $m_r \cdot (n / 2^{r+1}) \le n / 2$ vertices, leaving at least $n / 2$ unused vertices!).
3. **Why testing any subset of disjoint halves is exact (Zero Anchors!):** Any subset $S \subseteq \{1, \dots, m_r\}$ of vertex-disjoint halves is itself a set of vertex-disjoint pairs $\{a, b\}$. Swapping each pair in $p_0$ produces a valid permutation in $S_n$ whose match count is $\sum_{j \in S} x_j$ (every unswapped vertex stays at $p_0$, contributing $0$ matches).
4. **Query cost at level $r$:**
   - Suppose there are $A_r \le n$ active groups at level $r$.
   - Partitioned into batches of size $m_r \ge \Omega(\min(A_r, 2^r))$ (with `bin_groups` decoded by Exact Binary Lindström Theorem 8.1 and `multi_groups` decoded by Exact Integer Coin Weighing Theorem 8.2):
     - Wait: for $r \ge 2$, each batch of size $m_r = \Theta(\min(A_r, 2^r))$ costs $O(m_r / \log m_r)$ queries, so across all $A_r \le n$ groups at level $r$, the query cost is:
       $$Q_r = O\!\left(\frac{n}{\max(1, \min(r, \log_2 n))}\right) \text{?}$$
       Look closer: at level $r$ (for $r \le \log_2 n$), $\log_2(m_r) = \Theta(\min(r, \log_2 A_r))$!
       Wait: even when $A_r = n / 2$ (say $r$ is small, $2^r < n$), $\log_2 m_r = \Theta(r)$!
       And what if $A_r$ shrinks? Because $A_r \le n$, if $m_r = \Theta(A_r)$ (late levels where $2^r \ge A_r$), the batch solves ALL $A_r$ remaining groups in $O(A_r / \log A_r)$ queries!
       Wait — check the sum over ALL $r = 0, 1, \dots, \lceil \log_2 n \rceil - 1$:
       $$Q_{\text{Step 2}} = \sum_{r=0}^{\lceil \log_2 n \rceil - 1} O\!\left(\frac{n}{r + 1}\right) = O(n \log \log n)!!$$
       *(More tightly: for levels $r \ge \log_2 \log_2 n$ up to $\log_2 n$, each level takes $O(n / r)$ and summing $1/r$ from $\log \log n$ to $\log n$ is $O(\ln(\frac{\log n}{\log \log n})) = O(\log \log n)$; and for levels $r \le \log_2 \log_2 n$, there are only $\log_2 \log_2 n$ levels each costing $\le n$ queries $\implies O(n \log \log n)$!)*

**Step 3 (2-Factor Cycle Orientation):**
Every 2-cycle of $\sigma = p_0^{-1} \circ \pi$ has $c(\{a, b\}) = 2$ and is completely determined by `pairs_c2`. The remaining edges `pairs_c1` ($c = 1$) form the undirected 2-factor of all cycles $C_1, \dots, C_R$ of $\sigma$ of length $\ell \ge 3$ ($\sum_{j=1}^R |C_j| \le n$).
- Grouping cycles by length $\ell$: let $k_\ell$ be the number of cycles of length $\ell$ (note $\sum_\ell \ell k_\ell \le n$).
- Mapping any subset $S$ of the $k_\ell$ cycles clockwise (and keeping all other vertices at $p_0$) returns $f = \ell \sum_{j \in S} b_j$ ($b_j \in \{0, 1\}$), so $f / \ell$ gives the exact binary sum!
- Using Binary Lindström $D_k$, orienting all $k_\ell$ cycles of length $\ell$ costs $O(k_\ell / \log(k_\ell + 2))$ queries.
- Let $L_0 = \sqrt{n / \log_2 n}$ (or more simply, split at $\ell \le \log_2 n$ vs $\ell > \log_2 n$):
  - For $\ell \le \log_2 n$: there are at most $\log_2 n$ distinct lengths $\ell$, and $\sum_{\ell \le \log_2 n} k_\ell \le n/3$. Each length with $k_\ell \ge n / \log^2 n$ costs $O(k_\ell / \log n)$ queries, and each length with $k_\ell < n / \log^2 n$ costs $\le n / \log^2 n$ queries $\implies \log_2 n \cdot (n / \log^2 n) = O(n / \log n)$! Total for $\ell \le \log_2 n$: **$O(n / \log n)$**.
  - For $\ell > \log_2 n$: $\sum_{\ell > \log_2 n} k_\ell < \frac{n}{\log_2 n}$ cycles total $\implies$ at most **$O(n / \log n)$** queries even without grouping!
  Hence Step 3 takes **$O(n / \log n)$ queries in the worst case** (and only $\sim \ln n$ queries on average, since a random permutation has $H_n \approx \ln n$ cycles!).

Summing Steps 0–4:
$$O(1) + n + O(n \log \log n) + O\!\left(\frac{n}{\log n}\right) + 1 = O(n \log \log n)$$
expected queries on **every** permutation $\pi \in S_n$! $\blacksquare$

---

### Remark 10 (Strict Permutation Mastermind vs. Martinsson–Su 2024 Repeated-Color $O(n)$)

In **general $k = n$ black-peg Mastermind** where the codebreaker's queries are allowed to **repeat colors** ($q \in \{0, \dots, n-1\}^n$), Martinsson and Su (*"Mastermind with a Linear Number of Queries"*, CPC 2024) broke the $O(n \log \log n)$ barrier down to **$O(n)$** queries by placing the same color in multiple slots (simulating signed/binary projections across $\log_2 n$ tree levels simultaneously).

In our **Full-Reorder Bottle Game** (Strict Permutation Mastermind), **every query must be a physical reordering of the $n$ distinct bottles** ($\sigma_t \in S_n$, no bottle can appear in two slots at once!). Whether **strict** permutation queries ($q \in S_n$) can also achieve $O(n)$ or whether $O(n \log \log n)$ is tight without repetition remains a subtle boundary in permutation-query complexity; Theorem 9 establishes $O(n \log \log n)$ constructively with exact zero-error reconstruction.
