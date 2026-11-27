# The Bottle Game (Permutation Mastermind)

**[Watch the Interactive Animated Explainer](https://tcamolesi.github.io/bottle-game/)** · **[Read the Undergrad-Friendly Guide](BOTTLE_GAME_GUIDE.md)**

Algorithms, optimality proofs, empirical benchmarks, and a 12-chapter interactive HTML5/WebGL animated explainer for two variations of the **Bottle Game** (Permutation Mastermind with fixed-point count feedback $f(\pi) = |\{i : \pi(i) = \sigma(i)\}|$):

1. **Game 1 — Pairwise Swap (`pairwise/`):** Each move swaps two bottles (`\ell_2`-local moves).
2. **Game 2 — Full Reorder (`full_reorder/`):** Each move chooses any permutation $\pi \in S_n$ without duplicating labels.

---

## Summary of Results

| Game Variant | Prior Literature | This Repository |
|---|---|---|
| **Game 1: Pairwise Swap** (Deterministic) | $n^2 / 4 \le D(n, 2) \le \frac{1}{2} n^2 \log n$ ([Subercaseaux, FUN 2026](https://arxiv.org/abs/2601.19161v2)) | **Exact $\frac{n^2}{4} + O(n^{3/2})$** (`pairwise/optimal.py`, closes the $\log n$ gap; matches lower bound in [pairwise/PROOF.md](pairwise/PROOF.md)) |
| **Game 1: Pairwise Swap** (Randomized) | $\frac{n(n-1)}{8} \le A(n, 2) \le O(n^2 \log n)$ (Yao + FUN 2026) | **Exact $\frac{n^2}{8} + O(n^{3/2})$** expected (`1.055×` lower bound empirically at $n = 2{,}000$) |
| **Game 2: Full Reorder** (Strict $S_n$, Adaptive) | $O(n \log n)$ ([Ko–Teng 1986](https://doi.org/10.1016/0196-6774(86)90042-8) / naive) · vs. $\Theta(n)$ *with cloning allowed* (Martinsson & Su 2024) | **$O(n \log \log n)$ upper bound** (`full_reorder/optimal.py`, `6,020` vs `9,574.5` at $n = 1{,}000$, `-37%`; flat `1.81× n log log n` up to $n = 4{,}000$)* |

*\*Honest formal status for Game 2 ([full_reorder/PROOF.md](full_reorder/PROOF.md)): the algorithm and benchmarks are complete up to $n = 4{,}000$; two technical steps remain to formalize an unconditional theorem: (1) concentration bounds for greedy batch packing across rounds, and (2) replacing the MILP solver on rare $c \ge 2$ multi-match groups with a direct polynomial-time decoder.*

---

## Repository Structure

```text
.
├── docs/                  # GitHub Pages static site (standalone animated explainer)
│   ├── index.html         # Single-file 12-chapter interactive film (GSAP + Three.js + KaTeX + neural VO)
│   └── .nojekyll
├── pairwise/              # Game 1: Pairwise-swap model, exact DP, Dihedral-block optimal solvers & proof
├── full_reorder/          # Game 2: Full-reorder model, Lindström D_k coin weighing, involution solver & benchmarks
├── video/                 # Source code & audio generation script for the 12-chapter explainer
├── BOTTLE_GAME_GUIDE.md   # Didactic end-to-end walkthrough for CS undergraduates
└── README.md
```

---

## Running Tests & Rebuilding the Explainer

```bash
# Game 1 (Pairwise Swap) exhaustive & asymptotic test suite
python3 pairwise/test_all.py

# Game 2 (Full Reorder) Lindström coin-weighing & solver test suite (requires numpy, scipy)
python3 full_reorder/test_all.py

# Rebuild the standalone explainer into docs/index.html (requires edge-tts, mutagen, Node.js)
python3 video/scripts/gen_voice.py
npm --prefix video install
npm --prefix video run build
cp video/dist/index.html docs/index.html
```
