"""Pure vanilla Python Dynamic Programming for Watch-Party Cinema Booking.

Implements the Unbounded Coin Change problem to find the minimum number of seat bundles
that sum to *exactly* groupSize, and reconstructs the optimal bundle breakdown.
No external optimization libraries (e.g., scipy, ortools, pulp) are used.
"""

from typing import Any


def solve_bundle_booking(group_size: int, bundle_sizes: list[int]) -> dict[str, Any]:
    """Computes the minimum total number of cinema bundles needed to seat exactly `group_size` guests

    using an Unbounded Coin Change Dynamic Programming formulation.

    Parameters:
        group_size: Integer between 1 and 10,000.
        bundle_sizes: List of distinct positive integers (each 1 <= size <= 500).

    Returns:
        A dict containing:
        - possible: bool
        - message: str ("Not possible" if unreachable)
        - group_size: int
        - total_bundles: int | None
        - breakdown: dict[str, int] | None (mapping bundle size -> count)
    """
    if group_size <= 0:
        return {
            "possible": False,
            "message": "Not possible",
            "group_size": group_size,
            "total_bundles": None,
            "breakdown": None,
        }

    valid_sizes = sorted(list(set(b for b in bundle_sizes if b > 0)))
    if not valid_sizes:
        return {
            "possible": False,
            "message": "Not possible",
            "group_size": group_size,
            "total_bundles": None,
            "breakdown": None,
        }

    # dp[s] holds the minimum number of bundles needed to form sum `s`
    # parent[s] holds the bundle size chosen to transition to `s`
    INF = float("inf")
    dp = [INF] * (group_size + 1)
    parent = [-1] * (group_size + 1)

    # Base case: 0 people require 0 bundles
    dp[0] = 0

    for s in range(1, group_size + 1):
        for b in valid_sizes:
            if s >= b and dp[s - b] + 1 < dp[s]:
                dp[s] = dp[s - b] + 1
                parent[s] = b

    if dp[group_size] == INF:
        return {
            "possible": False,
            "message": "Not possible",
            "group_size": group_size,
            "total_bundles": None,
            "breakdown": None,
        }

    # Reconstruct optimal bundle counts
    breakdown_counts: dict[str, int] = {}
    curr = group_size
    while curr > 0:
        b = parent[curr]
        key = str(b)
        breakdown_counts[key] = breakdown_counts.get(key, 0) + 1
        curr -= b

    # Sort keys in descending numeric order for clean presentation (e.g. "20", "9", "6")
    sorted_breakdown = {
        k: breakdown_counts[k]
        for k in sorted(breakdown_counts.keys(), key=lambda x: int(x), reverse=True)
    }

    return {
        "possible": True,
        "message": f"Optimal bundle allocation found: {int(dp[group_size])} bundle(s)",
        "group_size": group_size,
        "total_bundles": int(dp[group_size]),
        "breakdown": sorted_breakdown,
    }
