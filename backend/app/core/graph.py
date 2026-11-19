"""Pure vanilla Python Graph Algorithms for Movie Prerequisites.

Includes:
1. Cycle Detection (DFS/BFS traversal from proposed prerequisites).
2. Transitive Ancestor Resolution.
3. Topological Sort (Kahn's Algorithm with deterministic tie-breaking).
No third-party graph libraries (e.g., networkx) are used.
"""

from typing import Any


def has_circular_dependency(
    target_movie_id: int,
    proposed_prerequisite_ids: list[int],
    graph: dict[int, list[int]]
) -> bool:
    """Checks whether making `proposed_prerequisite_ids` prerequisites of `target_movie_id`

    would create a direct or indirect circular dependency.

    In this graph representation:
      graph[movie_id] = list of prerequisite_ids that must be watched BEFORE movie_id.
    
    If any path from any proposed prerequisite can reach `target_movie_id`,
    then adding `target_movie_id -> proposed_prerequisite` completes a directed cycle.
    """
    # Direct self-loop check
    if target_movie_id in proposed_prerequisite_ids:
        return True

    # BFS/DFS traversal starting from all proposed prerequisites
    visited: set[int] = set()
    queue: list[int] = list(proposed_prerequisite_ids)

    while queue:
        curr = queue.pop(0)
        if curr == target_movie_id:
            return True

        if curr not in visited:
            visited.add(curr)
            # Fetch prerequisites of curr
            # Ensure we don't look up target_movie_id's old prerequisites if curr == target_movie_id
            prereqs = graph.get(curr, [])
            for p in prereqs:
                if p == target_movie_id:
                    return True
                if p not in visited:
                    queue.append(p)

    return False


def get_transitive_prerequisites(
    target_movie_id: int,
    graph: dict[int, list[int]]
) -> set[int]:
    """Finds all transitive prerequisite movie IDs that must be watched before `target_movie_id`.

    Strictly excludes `target_movie_id` itself.
    """
    transitive_ids: set[int] = set()
    stack: list[int] = list(graph.get(target_movie_id, []))

    while stack:
        curr = stack.pop()
        if curr == target_movie_id:
            continue
        if curr not in transitive_ids:
            transitive_ids.add(curr)
            for p in graph.get(curr, []):
                if p not in transitive_ids and p != target_movie_id:
                    stack.append(p)

    return transitive_ids


def topological_sort_prerequisites(
    prerequisite_ids: set[int],
    graph: dict[int, list[int]],
    movie_metadata: dict[int, dict[str, Any]]
) -> list[int]:
    """Orders `prerequisite_ids` so that every movie appears strictly AFTER all of its prerequisites.

    (i.e., prerequisites appear before the movies that require them).

    Uses Kahn's Algorithm on the subgraph induced by `prerequisite_ids`, with deterministic
    tie-breaking based on (release_year, id).
    """
    if not prerequisite_ids:
        return []

    # In-degree represents the count of prerequisites this movie has within the prerequisite subgraph
    in_degree: dict[int, int] = {mid: 0 for mid in prerequisite_ids}
    # Dependents adjacency list: if p is a prereq of m, dependents[p] contains m
    dependents: dict[int, list[int]] = {mid: [] for mid in prerequisite_ids}

    for mid in prerequisite_ids:
        for p in graph.get(mid, []):
            if p in prerequisite_ids:
                in_degree[mid] += 1
                dependents[p].append(mid)

    # Deterministic priority helper
    def sort_key(mid: int) -> tuple[int, int]:
        meta = movie_metadata.get(mid, {})
        year = meta.get("release_year", 0)
        return (year, mid)

    # Initial zero-in-degree nodes (movies with no remaining prerequisites in the subgraph)
    zero_in_degree: list[int] = [mid for mid, deg in in_degree.items() if deg == 0]
    zero_in_degree.sort(key=sort_key)

    ordered_ids: list[int] = []

    while zero_in_degree:
        # Pick the movie with earliest release year
        curr = zero_in_degree.pop(0)
        ordered_ids.append(curr)

        # For every movie that depended on curr, reduce its in-degree
        for dep in dependents.get(curr, []):
            in_degree[dep] -= 1
            if in_degree[dep] == 0:
                zero_in_degree.append(dep)
                zero_in_degree.sort(key=sort_key)

    if len(ordered_ids) != len(prerequisite_ids):
        raise ValueError("Circular dependency detected within the prerequisite subgraph")

    return ordered_ids
