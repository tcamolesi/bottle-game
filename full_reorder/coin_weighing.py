"""Coin-weighing primitives for O(m / log m) block decoding.

Implements:
1. Exact deterministic Binary Lindström matrix `D_k` (`2^k` rows, `k * 2^(k-1) + 1`
   columns) with O(m log m) recursive decoding for binary vectors `x in {0, 1}^m`.
2. Las Vegas zero-error sparse non-negative integer coin-weighing solver
   (`solve_sparse_coin_weighing`) for `x_j in {0, ..., caps[j]}` using random
   {0, 1} linear measurements, `scipy.optimize.milp` (HiGHS), and 1-query
   exact certification of zero/full blocks.
"""

from __future__ import annotations

import math
import random
from functools import lru_cache
from typing import Callable

import numpy as np
from scipy.optimize import Bounds, LinearConstraint, milp


def lindstrom_cols(k: int) -> int:
    """Number of binary variables solved by Lindström matrix D_k (2^k rows)."""
    if k < 0:
        raise ValueError(f"k must be >= 0, got {k}")
    if k == 0:
        return 1
    return k * (1 << (k - 1)) + 1


@lru_cache(maxsize=16)
def lindstrom_matrix(k: int) -> list[list[int]]:
    """Construct the exact binary Lindström matrix D_k of shape (2^k, k*2^(k-1)+1).

    Row 0 is always the all-ones vector `[1, ..., 1]`.
    """
    if k == 0:
        return [[1]]
    prev = lindstrom_matrix(k - 1)
    q_prev = len(prev)
    m_prev = len(prev[0])
    w_len = q_prev - 1
    rows: list[list[int]] = []
    zeros_w = [0] * w_len
    ones_w = [1] * w_len
    for r in range(q_prev):
        w_top = ones_w if r == 0 else zeros_w
        rows.append(prev[r] + prev[r] + w_top)
    for r in range(q_prev):
        comp = [1 - val for val in prev[r]]
        if r == 0:
            w_row = list(ones_w)
        else:
            w_row = [1 if idx == r - 1 else 0 for idx in range(w_len)]
        rows.append(prev[r] + comp + w_row)
    assert len(rows) == 2 * q_prev
    assert len(rows[0]) == 2 * m_prev + w_len
    return rows


def decode_lindstrom_binary(k: int, y: list[int]) -> list[int]:
    """Decode `y = D_k @ x` in O(m_k log m_k) time for `x in {0, 1}^{m_k}`."""
    if k == 0:
        assert len(y) == 1
        return [int(y[0])]
    half = 1 << (k - 1)
    assert len(y) == 2 * half
    y1 = y[:half]
    y2 = y[half:]
    sum_v = y1[0] - y2[0]
    w: list[int] = []
    dv = [0] * half
    du = [0] * half
    dv[0] = sum_v
    for i in range(1, half):
        diff = y1[i] - y2[i] + sum_v
        wi = diff & 1
        w.append(wi)
        dvi = (diff + wi) >> 1
        dv[i] = dvi
        du[i] = y1[i] - dvi
    du[0] = y2[0] - sum(w)
    u = decode_lindstrom_binary(k - 1, du)
    v = decode_lindstrom_binary(k - 1, dv)
    return u + v + w


@lru_cache(maxsize=None)
def _plan_lindstrom_cost(m: int) -> tuple[int, tuple[str, int]]:
    """DP returning `(min_queries, (mode, param))` for `m` binary vars with known sum."""
    if m <= 1:
        return (0, ("direct", m))
    best_cost = m - 1
    best_action = ("direct", m)

    # Option 1: pad up to m_k >= m (row 0 is known == remaining_sum, so 2^k - 1 queries).
    k = 1
    while lindstrom_cols(k) < m:
        k += 1
    pad_cost = (1 << k) - 1
    if pad_cost < best_cost:
        best_cost = pad_cost
        best_action = ("pad", k)

    # Option 2: split off exact chunk of size m_k < m (needs 2^k queries incl. row 0).
    for ks in range(2, k + 1):
        mk = lindstrom_cols(ks)
        if mk < m:
            rem_cost, _ = _plan_lindstrom_cost(m - mk)
            total_cost = (1 << ks) + rem_cost
            if total_cost < best_cost:
                best_cost = total_cost
                best_action = ("split", ks)

    return (best_cost, best_action)


def solve_binary_coin_weighing(
    m: int,
    total_sum: int,
    query_fn: Callable[[list[int]], int],
) -> list[int]:
    """Recover exact `x in {0, 1}^m` given `total_sum = sum(x)` using Lindström D_k.

    `query_fn(active_indices)` returns `sum(x[j] for j in active_indices)`.
    Uses strictly <= m - 1 queries, and O(m / log m) queries asymptotically.
    """
    if m == 0:
        return []
    if total_sum == 0:
        return [0] * m
    if total_sum == m:
        return [1] * m

    result = [0] * m
    offset = 0
    rem = m
    rem_sum = total_sum

    while rem > 0:
        if rem_sum == 0:
            break
        if rem_sum == rem:
            for j in range(offset, offset + rem):
                result[j] = 1
            break
        if rem == 1:
            result[offset] = rem_sum
            break

        _, (mode, param) = _plan_lindstrom_cost(rem)
        if mode == "direct":
            running = 0
            for j in range(rem - 1):
                val = query_fn([offset + j])
                result[offset + j] = val
                running += val
                if running == rem_sum:
                    break
                if rem_sum - running == rem - 1 - j:
                    for j2 in range(j + 1, rem):
                        result[offset + j2] = 1
                    running = rem_sum
                    break
            else:
                result[offset + rem - 1] = rem_sum - running
            break

        if mode == "pad":
            k = param
            mat = lindstrom_matrix(k)
            y = [rem_sum]
            for r in range(1, len(mat)):
                row = mat[r]
                indices = [offset + j for j in range(rem) if row[j] == 1]
                y.append(query_fn(indices) if indices else 0)
            decoded = decode_lindstrom_binary(k, y)
            for j in range(rem):
                result[offset + j] = decoded[j]
            break

        # mode == "split"
        k = param
        mk = lindstrom_cols(k)
        mat = lindstrom_matrix(k)
        y = []
        for row in mat:
            indices = [offset + j for j in range(mk) if row[j] == 1]
            y.append(query_fn(indices) if indices else 0)
        decoded = decode_lindstrom_binary(k, y)
        for j in range(mk):
            result[offset + j] = decoded[j]
        offset += mk
        rem -= mk
        rem_sum -= y[0]

    return result


def solve_sparse_coin_weighing(
    m: int,
    total_sum: int,
    caps: list[int],
    query_fn: Callable[[list[int]], int],
    rng: random.Random,
) -> tuple[list[int], list[int], list[int] | None]:
    """Las Vegas zero-error solver for sparse `x in Z^m` with `0 <= x[j] <= caps[j]`.

    Returns `(zero_indices, full_indices, exact_x_or_none)` such that:
    - Every `j in zero_indices` is 100% verified to have `x[j] == 0`.
    - Every `j in full_indices` is 100% verified to have `x[j] == caps[j]`.
    - If `exact_x` is not None, it is the 100% verified full vector `x`.
    """
    if m == 0:
        return ([], [], [])
    if total_sum == 0:
        return (list(range(m)), [], [0] * m)
    total_cap = sum(caps)
    if total_sum == total_cap:
        return ([], list(range(m)), list(caps))

    if all(c == 1 for c in caps):
        x_bin = solve_binary_coin_weighing(m, total_sum, query_fn)
        zeros = [j for j, v in enumerate(x_bin) if v == 0]
        fulls = [j for j, v in enumerate(x_bin) if v == 1]
        return (zeros, fulls, x_bin)

    def _direct_finish(known_rows: list[tuple[list[int], int]]) -> tuple[list[int], list[int], list[int] | None]:
        x_val = [None] * m  # type: ignore[list-item]
        # Query single blocks directly until deduced or m-1 queried.
        running_sum = 0
        queried_single: set[int] = set()
        for row, rhs in known_rows:
            if sum(row) == 1:
                j = row.index(1)
                x_val[j] = rhs
                queried_single.add(j)
                running_sum += rhs

        unknown = [j for j in range(m) if x_val[j] is None]
        for idx_pos, j in enumerate(unknown):
            if len(unknown) - idx_pos == 1:
                x_val[j] = total_sum - running_sum
                break
            rem_cap = sum(caps[u] for u in unknown[idx_pos:])
            if running_sum == total_sum:
                for u in unknown[idx_pos:]:
                    x_val[u] = 0
                break
            if total_sum - running_sum == rem_cap:
                for u in unknown[idx_pos:]:
                    x_val[u] = caps[u]
                break
            val = query_fn([j])
            x_val[j] = val
            running_sum += val

        exact = [int(v) for v in x_val]  # type: ignore[arg-type]
        zeros = [j for j, v in enumerate(exact) if v == 0]
        fulls = [j for j, v in enumerate(exact) if v == caps[j]]
        return (zeros, fulls, exact)

    if m <= 4:
        return _direct_finish([])

    # Information-theoretic estimate of random rows needed:
    # H(x) <= min(log2 C(m + W - 1, W), sum_j log2(cap_j + 1))
    # H(row) ~ 0.5 * log2(2 * pi * e * Var(row_sum))
    h_stars_bars = (
        math.lgamma(m + total_sum) - math.lgamma(m) - math.lgamma(total_sum + 1)
    ) / math.log(2.0)
    h_caps = sum(math.log2(c + 1) for c in caps)
    h_x = min(h_stars_bars, h_caps)
    # Expected variance of a random 0/1 sum is ~ sum(x_j^2)/4 >= total_sum / 4.
    h_row = max(1.0, 0.5 * math.log2(2.0 * math.pi * math.e * max(total_sum, 1) / 4.0))
    q0 = max(2, math.ceil(1.25 * h_x / h_row))

    if q0 >= m - 1:
        return _direct_finish([])

    rows: list[list[int]] = [[1] * m]
    rhs_list: list[int] = [total_sum]
    seen_rows: set[tuple[int, ...]] = {tuple([1] * m), tuple([0] * m)}
    non_all_queries = 0

    def _add_random_rows(count: int) -> None:
        nonlocal non_all_queries
        attempts = 0
        added = 0
        while added < count and non_all_queries < m - 1 and attempts < count * 8 + 20:
            attempts += 1
            row = [rng.randint(0, 1) for _ in range(m)]
            key = tuple(row)
            if key in seen_rows:
                continue
            seen_rows.add(key)
            active = [j for j, bit in enumerate(row) if bit == 1]
            val = query_fn(active)
            rows.append(row)
            rhs_list.append(val)
            non_all_queries += 1
            added += 1

    _add_random_rows(q0)

    bounds = Bounds(lb=np.zeros(m, dtype=float), ub=np.array(caps, dtype=float))
    integrality = np.ones(m, dtype=int)
    c_zero = np.zeros(m, dtype=float)

    while non_all_queries < m - 1:
        A = np.array(rows, dtype=float)
        y_vec = np.array(rhs_list, dtype=float)
        res = milp(
            c=c_zero,
            integrality=integrality,
            bounds=bounds,
            constraints=LinearConstraint(A, y_vec, y_vec),
            options={"time_limit": 0.25},
        )
        if not res.success:
            # Solver timed out or failed; fall back safely to direct finish.
            return _direct_finish(list(zip(rows[1:], rhs_list[1:])))

        x_hat = [int(round(v)) for v in res.x]
        z_cand = [j for j in range(m) if x_hat[j] == 0]
        f_cand = [j for j in range(m) if x_hat[j] == caps[j]]

        verified_zeros: list[int] = []
        verified_fulls: list[int] = []

        if z_cand:
            z_row = [1 if j in set(z_cand) else 0 for j in range(m)]
            z_key = tuple(z_row)
            if z_key not in seen_rows:
                seen_rows.add(z_key)
                sz = query_fn(z_cand)
                non_all_queries += 1
                rows.append(z_row)
                rhs_list.append(sz)
                if sz == 0:
                    verified_zeros = z_cand
            else:
                # Already queried before; check if its stored rhs is 0.
                for r, rhs in zip(rows, rhs_list):
                    if r == z_row and rhs == 0:
                        verified_zeros = z_cand
                        break

        if verified_zeros:
            if f_cand and non_all_queries < m - 1:
                f_row = [1 if j in set(f_cand) else 0 for j in range(m)]
                f_key = tuple(f_row)
                cap_f = sum(caps[j] for j in f_cand)
                if f_key not in seen_rows:
                    seen_rows.add(f_key)
                    sf = query_fn(f_cand)
                    non_all_queries += 1
                    rows.append(f_row)
                    rhs_list.append(sf)
                    if sf == cap_f:
                        verified_fulls = f_cand
                else:
                    for r, rhs in zip(rows, rhs_list):
                        if r == f_row and rhs == cap_f:
                            verified_fulls = f_cand
                            break
            exact = x_hat if len(verified_zeros) + len(verified_fulls) == m else None
            return (verified_zeros, verified_fulls, exact)

        # If Z was empty (can happen when total_sum is high), try verifying F!
        if not z_cand and f_cand:
            f_row = [1 if j in set(f_cand) else 0 for j in range(m)]
            f_key = tuple(f_row)
            cap_f = sum(caps[j] for j in f_cand)
            if f_key not in seen_rows:
                seen_rows.add(f_key)
                sf = query_fn(f_cand)
                non_all_queries += 1
                rows.append(f_row)
                rhs_list.append(sf)
                if sf == cap_f:
                    return ([], f_cand, None)

        extra = min(max(1, q0 // 4), (m - 1) - non_all_queries)
        if extra <= 0:
            break
        _add_random_rows(extra)

    return _direct_finish(list(zip(rows[1:], rhs_list[1:])))


def solve_exact_integer_coin_weighing(
    m: int,
    total_sum: int,
    caps: list[int],
    query_fn: Callable[[list[int]], int],
    rng: random.Random,
) -> list[int]:
    """Exact Las Vegas recovery of `x in Z^m` with `0 <= x[j] <= caps[j]` and `sum(x) == total_sum`.

    Uses random {0, 1} measurements + MILP uniqueness certification (and separating
    queries if a second feasible solution exists), guaranteeing 100% exactness.
    """
    if m == 0:
        return []
    if total_sum == 0:
        return [0] * m
    total_cap = sum(caps)
    if total_sum == total_cap:
        return list(caps)
    if all(c == 1 for c in caps):
        return solve_binary_coin_weighing(m, total_sum, query_fn)

    def _direct_finish(known_rows: list[tuple[list[int], int]]) -> list[int]:
        x_val: list[int | None] = [None] * m
        running_sum = 0
        for row, rhs in known_rows:
            if sum(row) == 1:
                j = row.index(1)
                if x_val[j] is None:
                    x_val[j] = rhs
                    running_sum += rhs

        unknown = [j for j in range(m) if x_val[j] is None]
        for idx_pos, j in enumerate(unknown):
            if len(unknown) - idx_pos == 1:
                x_val[j] = total_sum - running_sum
                break
            rem_cap = sum(caps[u] for u in unknown[idx_pos:])
            if running_sum == total_sum:
                for u in unknown[idx_pos:]:
                    x_val[u] = 0
                break
            if total_sum - running_sum == rem_cap:
                for u in unknown[idx_pos:]:
                    x_val[u] = caps[u]
                break
            val = query_fn([j])
            x_val[j] = val
            running_sum += val
        return [int(v) for v in x_val]  # type: ignore[arg-type]

    if m <= 6:
        return _direct_finish([])

    h_stars_bars = (
        math.lgamma(m + total_sum) - math.lgamma(m) - math.lgamma(total_sum + 1)
    ) / math.log(2.0)
    h_caps = sum(math.log2(c + 1) for c in caps)
    h_x = min(h_stars_bars, h_caps)
    h_row = max(1.0, 0.5 * math.log2(2.0 * math.pi * math.e * max(total_sum, 1) / 4.0))
    q0 = max(2, math.ceil(1.25 * h_x / h_row))

    if q0 >= m - 1:
        return _direct_finish([])

    rows: list[list[int]] = [[1] * m]
    rhs_list: list[int] = [total_sum]
    seen_rows: set[tuple[int, ...]] = {tuple([1] * m), tuple([0] * m)}
    non_all_queries = 0

    def _add_row_indices(active: list[int]) -> None:
        nonlocal non_all_queries
        row = [0] * m
        for j in active:
            row[j] = 1
        key = tuple(row)
        if key in seen_rows:
            return
        seen_rows.add(key)
        val = query_fn(active)
        rows.append(row)
        rhs_list.append(val)
        non_all_queries += 1

    def _add_random_rows(count: int) -> None:
        nonlocal non_all_queries
        attempts = 0
        added = 0
        while added < count and non_all_queries < m - 1 and attempts < count * 8 + 20:
            attempts += 1
            row = [rng.randint(0, 1) for _ in range(m)]
            key = tuple(row)
            if key in seen_rows:
                continue
            seen_rows.add(key)
            active = [j for j, bit in enumerate(row) if bit == 1]
            val = query_fn(active)
            rows.append(row)
            rhs_list.append(val)
            non_all_queries += 1
            added += 1

    _add_random_rows(q0)

    bounds = Bounds(lb=np.zeros(m, dtype=float), ub=np.array(caps, dtype=float))
    integrality = np.ones(m, dtype=int)
    c_zero = np.zeros(m, dtype=float)

    while non_all_queries < m - 1:
        A = np.array(rows, dtype=float)
        y_vec = np.array(rhs_list, dtype=float)
        res = milp(
            c=c_zero,
            integrality=integrality,
            bounds=bounds,
            constraints=LinearConstraint(A, y_vec, y_vec),
            options={"time_limit": 0.25},
        )
        if not res.success:
            return _direct_finish(list(zip(rows[1:], rhs_list[1:])))

        x_hat = [int(round(v)) for v in res.x]

        # MILP uniqueness check: seek any integer solution x != x_hat to A x == y.
        # Variables: [x (m), p (m), q (m), b (m)] -> total 4m variables.
        num_rows = len(rows)
        total_vars = 4 * m
        A_uniq = np.zeros((num_rows + 3 * m, total_vars), dtype=float)
        lb_uniq = np.zeros(total_vars, dtype=float)
        ub_uniq = np.zeros(total_vars, dtype=float)

        # Bounds on x, p, q, b
        ub_uniq[:m] = np.array(caps, dtype=float)
        for j in range(m):
            ub_uniq[m + j] = float(caps[j] - x_hat[j])
            ub_uniq[2 * m + j] = float(x_hat[j])
            ub_uniq[3 * m + j] = 1.0

        # Constraints 1: A x == y
        A_uniq[:num_rows, :m] = A
        c_lb = np.full(num_rows + 3 * m, -np.inf, dtype=float)
        c_ub = np.full(num_rows + 3 * m, np.inf, dtype=float)
        c_lb[:num_rows] = y_vec
        c_ub[:num_rows] = y_vec

        # Constraints 2: x_j - p_j + q_j == x_hat[j]
        for j in range(m):
            r_idx = num_rows + j
            A_uniq[r_idx, j] = 1.0
            A_uniq[r_idx, m + j] = -1.0
            A_uniq[r_idx, 2 * m + j] = 1.0
            c_lb[r_idx] = float(x_hat[j])
            c_ub[r_idx] = float(x_hat[j])

        # Constraints 3: p_j - (caps[j] - x_hat[j]) * b_j <= 0
        for j in range(m):
            r_idx = num_rows + m + j
            A_uniq[r_idx, m + j] = 1.0
            A_uniq[r_idx, 3 * m + j] = -float(caps[j] - x_hat[j])
            c_ub[r_idx] = 0.0

        # Constraints 4: q_j + x_hat[j] * b_j <= x_hat[j]
        for j in range(m):
            r_idx = num_rows + 2 * m + j
            A_uniq[r_idx, 2 * m + j] = 1.0
            A_uniq[r_idx, 3 * m + j] = float(x_hat[j])
            c_ub[r_idx] = float(x_hat[j])

        c_obj = np.zeros(total_vars, dtype=float)
        c_obj[m : 3 * m] = -1.0  # Maximize sum(p + q)

        res_u = milp(
            c=c_obj,
            integrality=np.ones(total_vars, dtype=int),
            bounds=Bounds(lb=lb_uniq, ub=ub_uniq),
            constraints=LinearConstraint(A_uniq, c_lb, c_ub),
            options={"time_limit": 0.25},
        )
        if not res_u.success:
            return _direct_finish(list(zip(rows[1:], rhs_list[1:])))

        diff_sum = -float(res_u.fun)
        if diff_sum < 0.5:
            return x_hat

        x_alt = [int(round(v)) for v in res_u.x[:m]]
        sep = [j for j in range(m) if x_hat[j] > x_alt[j]]
        if not sep:
            sep = [j for j in range(m) if x_hat[j] < x_alt[j]]
        assert sep
        prev_q = non_all_queries
        _add_row_indices(sep)
        if non_all_queries == prev_q:
            # Separating row was somehow already seen; add random rows.
            _add_random_rows(min(max(1, q0 // 5), (m - 1) - non_all_queries))

    return _direct_finish(list(zip(rows[1:], rhs_list[1:])))

