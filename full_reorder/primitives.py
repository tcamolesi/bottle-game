"""Shared tracking, Golden-Invariant baseline, and Locked-Anchor Bridge primitives.

Implements `TrackedReorderGame`:
- Tracks locked `(bottle, slot)` pairs `L` and unlocked sets `U`, `S_U`.
- Maintains the Golden Invariant zero-match baseline `p0` (`slot_of`) such that
  `p0[b] == pi[b]` for all `b in L` and `p0[b] != pi[b]` for all `b in U`,
  so `f(p0) == |L|`.
- `lock_and_maintain_baseline(b, s)`: locks `(b, s)` and restores `f(p0) == |L|`
  in <= 1 query, automatically catching free cascade locks.
- `query_blocks(blocks, active_indices)`: implements the Locked-Anchor Bridge
  Lemma for vertex-disjoint closed cycles (0 anchors) and directed paths
  (1 anchor each), returning the exact noise-free sum of matches inside the
  activated blocks.
- `binary_search_one_match(block)`: finds one true match in a block with >= 1
  match in O(log len(block)) queries (using 0-noise anchor binary search when
  |L| >= 1, and the 1-bridge disambiguation protocol when |L| == 0).
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Literal

from full_reorder.game import FullReorderGame


@dataclass(frozen=True)
class Block:
    """A vertex-disjoint directed cycle or path of candidate edges wrt `p0`.

    - `kind == "cycle"`: `vertices = [v_0, ..., v_{k-1}]` (`k >= 2`), encoding
      the `k` edges `(v_i, p0[v_{(i+1) % k}])`. Requires 0 locked anchors.
    - `kind == "path"`: `vertices = [v_0, ..., v_k]` (`k >= 1`, `len >= 2`),
      encoding the `k` edges `(v_i, p0[v_{i+1}])`. Requires 1 locked anchor.
    """

    kind: Literal["cycle", "path"]
    vertices: tuple[int, ...]
    edges: tuple[tuple[int, int], ...]

    @staticmethod
    def make_cycle(vertices: list[int] | tuple[int, ...], p0: list[int]) -> "Block":
        verts = tuple(vertices)
        k = len(verts)
        assert k >= 2
        edges = tuple((verts[i], p0[verts[(i + 1) % k]]) for i in range(k))
        return Block(kind="cycle", vertices=verts, edges=edges)

    @staticmethod
    def make_path(vertices: list[int] | tuple[int, ...], p0: list[int]) -> "Block":
        verts = tuple(vertices)
        k = len(verts)
        assert k >= 2
        edges = tuple((verts[i], p0[verts[i + 1]]) for i in range(k - 1))
        return Block(kind="path", vertices=verts, edges=edges)


class TrackedReorderGame:
    """Manages locked elements, baseline `p0`, and noise-free block queries."""

    def __init__(self, game: FullReorderGame) -> None:
        self.game: FullReorderGame = game
        self.n: int = game.n
        self.locked_bottle: list[bool] = [False] * self.n
        self.locked_slot: list[bool] = [False] * self.n
        self.pi_known: list[int] = [-1] * self.n
        self.unlocked_bottles: set[int] = set(range(self.n))
        self.unlocked_slots: set[int] = set(range(self.n))
        self.locked_pairs: list[tuple[int, int]] = []
        self.p0: list[int] | None = None
        self.inv_p0: list[int] | None = None

    def query_slot_of(self, slot_of: list[int]) -> int:
        """Convert `slot_of` (`bottle -> slot`) to `bottle_at` and query oracle."""
        n = self.n
        bottle_at = [0] * n
        for b, s in enumerate(slot_of):
            bottle_at[s] = b
        return self.game.reorder(bottle_at)

    def set_baseline(self, p0: list[int]) -> None:
        """Install `p0` (`slot_of` map) and its inverse `inv_p0`."""
        n = self.n
        inv = [0] * n
        for b, s in enumerate(p0):
            inv[s] = b
        self.p0 = list(p0)
        self.inv_p0 = inv

    def find_initial_zero_baseline_random(self, rng: random.Random) -> list[int]:
        """Find an initial `p0` with `f(p0) == 0` via random derangement sampling.

        Expected queries: e ~ 2.718 (plus 0 queries if f_0 == 0).
        """
        n = self.n
        if self.game.is_solved():
            p0 = list(range(n))
            for i in range(n):
                self._mark_locked(i, i)
            self.set_baseline(p0)
            return p0
        if self.game.correct_count == 0:
            p0 = list(range(n))
            self.set_baseline(p0)
            return p0

        cand = list(range(n))
        while True:
            rng.shuffle(cand)
            f = self.query_slot_of(cand)
            if f == n:
                for b, s in enumerate(cand):
                    self._mark_locked(b, s)
                self.set_baseline(cand)
                return list(cand)
            if f == 0:
                self.set_baseline(cand)
                return list(cand)

    def _mark_locked(self, b: int, s: int) -> None:
        assert not self.locked_bottle[b], f"Bottle {b} already locked"
        assert not self.locked_slot[s], f"Slot {s} already locked"
        self.locked_bottle[b] = True
        self.locked_slot[s] = True
        self.pi_known[b] = s
        self.unlocked_bottles.discard(b)
        self.unlocked_slots.discard(s)
        self.locked_pairs.append((b, s))

    def lock_and_maintain_baseline(self, b: int, s: int) -> list[tuple[int, int]]:
        """Lock `(b, s)` and update `p0` in <= 1 query preserving `f(p0) == |L|`.

        Returns the list of newly locked `(bottle, slot)` pairs (including any
        free cascade lock when `p0[u] = old_s` also turns out to be a match, or
        when only 1 unlocked element remains).
        """
        if self.locked_bottle[b]:
            assert self.pi_known[b] == s, (
                f"Contradiction: bottle {b} locked to {self.pi_known[b]}, not {s}"
            )
            return []

        assert self.p0 is not None and self.inv_p0 is not None
        assert not self.locked_slot[s], f"Slot {s} already locked"

        p0 = self.p0
        inv_p0 = self.inv_p0
        old_s = p0[b]
        u = inv_p0[s]
        assert old_s != s and u != b, (
            f"Golden Invariant violated: p0[{b}]={old_s} == {s}"
        )

        # Swap b and u in p0 so p0[b] = s and p0[u] = old_s.
        p0[b] = s
        p0[u] = old_s
        inv_p0[s] = b
        inv_p0[old_s] = u

        self._mark_locked(b, s)
        newly_locked: list[tuple[int, int]] = [(b, s)]

        if len(self.unlocked_bottles) == 1:
            # The single remaining unlocked bottle must map to the single remaining slot.
            rem_b = next(iter(self.unlocked_bottles))
            rem_s = next(iter(self.unlocked_slots))
            assert p0[rem_b] == rem_s
            self._mark_locked(rem_b, rem_s)
            newly_locked.append((rem_b, rem_s))

        if not self.unlocked_bottles:
            if not self.game.is_solved():
                f = self.query_slot_of(p0)
                assert f == self.n, f"Expected f==n ({self.n}), got {f}"
            return newly_locked

        # Query p0 to check if (u, old_s) also happened to match (free cascade lock!).
        f = self.query_slot_of(p0)
        if f == self.n:
            # Every remaining unlocked bottle in p0 matched! (e.g., 2 left swapped into place)
            for rem_b in list(self.unlocked_bottles):
                rem_s = p0[rem_b]
                self._mark_locked(rem_b, rem_s)
                newly_locked.append((rem_b, rem_s))
            return newly_locked

        if f == len(self.locked_pairs) + 1:
            self._mark_locked(u, old_s)
            newly_locked.append((u, old_s))
            assert len(self.unlocked_bottles) != 1, (
                "Impossible: 1 unlocked element would force f == n"
            )
            return newly_locked

        assert f == len(self.locked_pairs), (
            f"Golden Invariant broken: f={f}, |L|={len(self.locked_pairs)}"
        )
        return newly_locked

    def decompose_partial_matching(
        self, edges: list[tuple[int, int]]
    ) -> list[Block]:
        """Decompose a partial matching of unlocked non-`p0` edges into cycles and paths."""
        assert self.p0 is not None and self.inv_p0 is not None
        nxt: dict[int, int] = {}
        in_deg: dict[int, int] = {}
        for b, s in edges:
            assert not self.locked_bottle[b] and not self.locked_slot[s]
            assert s != self.p0[b]
            v = self.inv_p0[s]
            assert b not in nxt, f"Duplicate bottle {b} in partial matching"
            assert v not in in_deg, f"Duplicate slot {s} in partial matching"
            nxt[b] = v
            in_deg[v] = 1

        visited: set[int] = set()
        blocks: list[Block] = []

        # 1. Extract all maximal directed paths (starting at vertices with in_deg == 0).
        for start in list(nxt.keys()):
            if start in visited or start in in_deg:
                continue
            verts = [start]
            visited.add(start)
            cur = start
            while cur in nxt:
                nx = nxt[cur]
                verts.append(nx)
                visited.add(nx)
                cur = nx
            blocks.append(Block.make_path(verts, self.p0))

        # 2. Extract remaining directed cycles.
        for start in list(nxt.keys()):
            if start in visited:
                continue
            verts = []
            cur = start
            while cur not in visited:
                visited.add(cur)
                verts.append(cur)
                cur = nxt[cur]
            assert cur == start and len(verts) >= 2
            blocks.append(Block.make_cycle(verts, self.p0))

        return blocks

    def query_blocks(self, blocks: list[Block], active_indices: list[int]) -> int:
        """Query the exact match count summed over `blocks[j]` for `j in active_indices`.

        Precondition:
        - All `blocks[j].vertices` for `j in active_indices` are pairwise
          vertex-disjoint subsets of `self.unlocked_bottles`.
        - Number of `path` blocks in `active_indices` <= `len(self.locked_pairs)`.
        """
        if not active_indices:
            return 0
        assert self.p0 is not None
        slot_of = list(self.p0)
        anchor_idx = 0
        num_locked = len(self.locked_pairs)
        used_verts: set[int] = set()

        for j in active_indices:
            blk = blocks[j]
            for v in blk.vertices:
                assert not self.locked_bottle[v], f"Vertex {v} in block is locked"
                assert v not in used_verts, f"Blocks are not vertex-disjoint at {v}"
                used_verts.add(v)
            if blk.kind == "cycle":
                verts = blk.vertices
                k = len(verts)
                for i in range(k):
                    slot_of[verts[i]] = self.p0[verts[(i + 1) % k]]
            else:
                assert anchor_idx < num_locked, (
                    f"Not enough locked anchors ({num_locked}) for path blocks"
                )
                b_anc, s_anc = self.locked_pairs[anchor_idx]
                anchor_idx += 1
                verts = blk.vertices
                for i in range(len(verts) - 1):
                    slot_of[verts[i]] = self.p0[verts[i + 1]]
                slot_of[verts[-1]] = s_anc
                slot_of[b_anc] = self.p0[verts[0]]

        f = self.query_slot_of(slot_of)
        return f - (num_locked - anchor_idx)

    def binary_search_one_match(self, block: Block) -> tuple[int, int]:
        """Find one true match inside `block` (known to have >= 1 match) in O(log len) queries."""
        assert self.p0 is not None
        edges = block.edges
        m = len(edges)
        assert m >= 1
        if m == 1:
            return edges[0]

        if len(self.locked_pairs) >= 1:
            # Zero-noise exact binary search using 1 locked anchor.
            verts = block.vertices
            lo = 0
            hi = m
            while hi - lo > 1:
                mid = (lo + hi) // 2
                if block.kind == "cycle":
                    sub_verts = [verts[i % len(verts)] for i in range(lo, mid + 1)]
                else:
                    sub_verts = list(verts[lo : mid + 1])
                left_blk = Block.make_path(sub_verts, self.p0)
                cnt = self.query_blocks([left_blk], [0])
                if cnt > 0:
                    hi = mid
                else:
                    lo = mid
            return edges[lo]

        # len(locked_pairs) == 0: 1-bridge closed-cycle binary search.
        verts = block.vertices
        lo = 0
        hi = m
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if block.kind == "cycle":
                arc_verts = [verts[i % len(verts)] for i in range(lo, mid + 1)]
            else:
                arc_verts = list(verts[lo : mid + 1])

            # Close arc_verts with 1 bridge edge (end_v, p0[start_v]) into a cycle.
            cyc_blk = Block.make_cycle(arc_verts, self.p0)
            f = self.query_blocks([cyc_blk], [0])
            if f >= 2:
                hi = mid
            elif f == 0:
                lo = mid
            else:
                # f == 1: disambiguate whether the bridge edge or the arc has the match.
                start_v = arc_verts[0]
                end_v = arc_verts[-1]
                bridge_edge = (end_v, self.p0[start_v])
                swap_blk = Block.make_cycle([start_v, end_v], self.p0)
                f_swap = self.query_blocks([swap_blk], [0])
                if f_swap == 0:
                    # Bridge is NOT a match -> arc definitely has 1 match.
                    hi = mid
                elif f_swap == 2:
                    return bridge_edge
                else:
                    # f_swap == 1: one of {(end_v, p0[start_v]), (start_v, p0[end_v])} matches.
                    w = next(
                        v for v in self.unlocked_bottles if v != start_v and v != end_v
                    )
                    probe_slot_of = list(self.p0)
                    probe_slot_of[end_v] = self.p0[start_v]
                    probe_slot_of[start_v] = self.p0[w]
                    probe_slot_of[w] = self.p0[end_v]
                    f_probe = self.query_slot_of(probe_slot_of)
                    if f_probe == 0:
                        return (start_v, self.p0[end_v])
                    return bridge_edge

        return edges[lo]
