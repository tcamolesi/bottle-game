# Full-Reorder Bottle Game (V2) — Experiment Report

All runs verified solved via `FullReorderGame.verify_solved()`.

## 1. Random Permutations Scaling

| `n` | Solver | Trials | Mean Queries | Max Queries | `Q / (n log2 n)` | `Q / (n log2 log2 n)` | `Q / LB_info` | Avg Time (s) |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 10 | `shift_binary_search` | 20 | 30.2 | 35 | 0.909 | 1.744 | 4.31x | 0.000 |
| 10 | `random_elimination` | 20 | 35.6 | 45 | 1.073 | 2.058 | 5.09x | 0.000 |
| 10 | `optimal_coin_weighing` | 20 | 25.7 | 33 | 0.774 | 1.484 | 3.67x | 0.000 |
| 20 | `shift_binary_search` | 20 | 80.3 | 88 | 0.929 | 1.901 | 5.35x | 0.000 |
| 20 | `random_elimination` | 20 | 97.8 | 109 | 1.131 | 2.315 | 6.52x | 0.001 |
| 20 | `optimal_coin_weighing` | 20 | 67.2 | 76 | 0.777 | 1.591 | 4.48x | 0.000 |
| 50 | `shift_binary_search` | 10 | 263.8 | 277 | 0.935 | 2.113 | 6.76x | 0.002 |
| 50 | `random_elimination` | 10 | 313.6 | 330 | 1.111 | 2.512 | 8.04x | 0.006 |
| 50 | `optimal_coin_weighing` | 10 | 200.5 | 211 | 0.711 | 1.606 | 5.14x | 0.002 |
| 100 | `shift_binary_search` | 10 | 631.6 | 651 | 0.951 | 2.312 | 7.90x | 0.009 |
| 100 | `random_elimination` | 10 | 768.5 | 799 | 1.157 | 2.813 | 9.61x | 0.030 |
| 100 | `optimal_coin_weighing` | 10 | 470.1 | 483 | 0.708 | 1.721 | 5.88x | 0.008 |
| 200 | `shift_binary_search` | 5 | 1467.2 | 1500 | 0.960 | 2.500 | 8.95x | 0.036 |
| 200 | `random_elimination` | 5 | 1801.0 | 1814 | 1.178 | 3.069 | 10.98x | 0.180 |
| 200 | `optimal_coin_weighing` | 5 | 1048.0 | 1067 | 0.686 | 1.786 | 6.39x | 0.036 |
| 500 | `shift_binary_search` | 3 | 4288.7 | 4300 | 0.957 | 2.711 | 10.19x | 0.244 |
| 500 | `optimal_coin_weighing` | 3 | 2857.0 | 2870 | 0.637 | 1.806 | 6.79x | 0.334 |
| 1000 | `shift_binary_search` | 2 | 9574.5 | 9610 | 0.961 | 2.887 | 11.19x | 1.053 |
| 1000 | `optimal_coin_weighing` | 2 | 6020.0 | 6032 | 0.604 | 1.815 | 7.03x | 2.053 |

## 2. Adversarial Inputs (Reverse, Cyclic Shift, Odd-`n` Orthomorphism)

| `n` | Input | Solver | Queries | `Q / (n log2 n)` | `Q / (n log2 log2 n)` | Time (s) |
|---:|---|---|---:|---:|---:|---:|
| 101 | `reverse` | `shift_binary_search` | 342 | 0.509 | 1.238 | 0.004 |
| 101 | `reverse` | `optimal_coin_weighing` | 482 | 0.717 | 1.745 | 0.008 |
| 101 | `cyclic_shift_1` | `shift_binary_search` | 1 | 0.001 | 0.004 | 0.000 |
| 101 | `cyclic_shift_1` | `optimal_coin_weighing` | 472 | 0.702 | 1.709 | 0.008 |
| 101 | `orthomorphism` | `shift_binary_search` | 654 | 0.973 | 2.367 | 0.010 |
| 101 | `orthomorphism` | `optimal_coin_weighing` | 472 | 0.702 | 1.709 | 0.008 |
| 501 | `reverse` | `shift_binary_search` | 2001 | 0.445 | 1.262 | 0.104 |
| 501 | `reverse` | `optimal_coin_weighing` | 2896 | 0.645 | 1.826 | 0.342 |
| 501 | `cyclic_shift_1` | `shift_binary_search` | 1 | 0.000 | 0.001 | 0.000 |
| 501 | `cyclic_shift_1` | `optimal_coin_weighing` | 2891 | 0.643 | 1.823 | 0.342 |
| 501 | `orthomorphism` | `shift_binary_search` | 4469 | 0.995 | 2.818 | 0.251 |
| 501 | `orthomorphism` | `optimal_coin_weighing` | 2869 | 0.639 | 1.809 | 0.346 |
| 1001 | `reverse` | `shift_binary_search` | 4240 | 0.425 | 1.277 | 0.430 |
| 1001 | `reverse` | `optimal_coin_weighing` | 6019 | 0.603 | 1.813 | 2.029 |
| 1001 | `cyclic_shift_1` | `shift_binary_search` | 1 | 0.000 | 0.000 | 0.000 |
| 1001 | `cyclic_shift_1` | `optimal_coin_weighing` | 6017 | 0.603 | 1.812 | 2.007 |
| 1001 | `orthomorphism` | `shift_binary_search` | 9931 | 0.995 | 2.991 | 1.059 |
| 1001 | `orthomorphism` | `optimal_coin_weighing` | 6023 | 0.604 | 1.814 | 2.065 |
