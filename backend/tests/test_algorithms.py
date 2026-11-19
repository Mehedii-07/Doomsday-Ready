import pytest
from app.core.graph import (
    has_circular_dependency,
    get_transitive_prerequisites,
    topological_sort_prerequisites,
)
from app.core.dp import solve_bundle_booking


# MCU Seed Graph Representation:
# 1: Iron Man (None)
# 2: Cap 1 (None)
# 3: Avengers (1, 2)
# 4: Civil War (3)
# 5: Thor: Ragnarok (None)
# 6: Infinity War (4, 5)
# 7: Endgame (6)
# 8: Doomsday (7)
MCU_GRAPH = {
    1: [],
    2: [],
    3: [1, 2],
    4: [3],
    5: [],
    6: [4, 5],
    7: [6],
    8: [7],
}

MCU_METADATA = {
    1: {"release_year": 2008, "title": "Iron Man"},
    2: {"release_year": 2011, "title": "Captain America: The First Avenger"},
    3: {"release_year": 2012, "title": "The Avengers"},
    4: {"release_year": 2016, "title": "Captain America: Civil War"},
    5: {"release_year": 2017, "title": "Thor: Ragnarok"},
    6: {"release_year": 2018, "title": "Avengers: Infinity War"},
    7: {"release_year": 2019, "title": "Avengers: Endgame"},
    8: {"release_year": 2026, "title": "Avengers: Doomsday"},
}


class TestGraphAlgorithms:
    def test_cycle_detection_direct_self_loop(self):
        """Self-referencing movie creates immediate cycle."""
        assert has_circular_dependency(1, [1], MCU_GRAPH) is True
        assert has_circular_dependency(7, [7], MCU_GRAPH) is True

    def test_cycle_detection_indirect_cycle(self):
        """Making Endgame (7) a prerequisite of Iron Man (1) must be rejected."""
        # Endgame depends on Infinity War (6) -> Civil War (4) -> Avengers (3) -> Iron Man (1)
        assert has_circular_dependency(1, [7], MCU_GRAPH) is True
        # Cap 1 (2) having Endgame (7) as prereq must also form a cycle
        assert has_circular_dependency(2, [7], MCU_GRAPH) is True

    def test_cycle_detection_valid_dependency(self):
        """Valid additions do not create a cycle."""
        # Thor: Ragnarok (5) depending on Iron Man (1) is a valid DAG addition
        assert has_circular_dependency(5, [1], MCU_GRAPH) is False

    def test_transitive_prerequisites_doomsday(self):
        """Doomsday (8) has all 7 preceding MCU movies as transitive prerequisites."""
        prereqs = get_transitive_prerequisites(8, MCU_GRAPH)
        assert prereqs == {1, 2, 3, 4, 5, 6, 7}
        assert 8 not in prereqs

    def test_transitive_prerequisites_civil_war(self):
        """Civil War (4) has The Avengers (3), Iron Man (1), and Cap 1 (2)."""
        prereqs = get_transitive_prerequisites(4, MCU_GRAPH)
        assert prereqs == {1, 2, 3}

    def test_transitive_prerequisites_ragnarok(self):
        """Thor: Ragnarok (5) has no prerequisites."""
        prereqs = get_transitive_prerequisites(5, MCU_GRAPH)
        assert prereqs == set()

    def test_topological_sort_doomsday_order(self):
        """Verify topological order respects dependencies for Doomsday."""
        prereqs = get_transitive_prerequisites(8, MCU_GRAPH)
        order = topological_sort_prerequisites(prereqs, MCU_GRAPH, MCU_METADATA)

        assert len(order) == 7
        # Ensure Iron Man (1) and Cap 1 (2) appear before The Avengers (3)
        assert order.index(1) < order.index(3)
        assert order.index(2) < order.index(3)
        # The Avengers (3) before Civil War (4)
        assert order.index(3) < order.index(4)
        # Thor: Ragnarok (5) and Civil War (4) before Infinity War (6)
        assert order.index(5) < order.index(6)
        assert order.index(4) < order.index(6)
        # Infinity War (6) before Endgame (7)
        assert order.index(6) < order.index(7)


class TestDynamicProgrammingBooking:
    def test_starplex_bundles_group_6(self):
        """Starplex IMAX: [1, 3, 4] for group 6 -> 2 bundles (3x2)."""
        res = solve_bundle_booking(6, [1, 3, 4])
        assert res["possible"] is True
        assert res["total_bundles"] == 2
        assert res["breakdown"] == {"3": 2}
        assert sum(int(size) * count for size, count in res["breakdown"].items()) == 6

    def test_metro_bundles_group_11(self):
        """Metro Cinema: [2, 5] for group 11 -> 4 bundles (5x1 + 2x3)."""
        res = solve_bundle_booking(11, [2, 5])
        assert res["possible"] is True
        assert res["total_bundles"] == 4
        assert res["breakdown"] == {"5": 1, "2": 3}
        assert sum(int(size) * count for size, count in res["breakdown"].items()) == 11

    def test_grand_premiere_bundles_group_44(self):
        """Grand Premiere Hall: [6, 9, 20] for group 44 -> 4 bundles (20x1 + 9x2 + 6x1)."""
        res = solve_bundle_booking(44, [6, 9, 20])
        assert res["possible"] is True
        assert res["total_bundles"] == 4
        assert res["breakdown"] == {"20": 1, "9": 2, "6": 1}
        assert sum(int(size) * count for size, count in res["breakdown"].items()) == 44

    def test_indie_screen_impossible_group_7(self):
        """Indie Screen: [4, 6] for group 7 -> Impossible (odd sum from even components)."""
        res = solve_bundle_booking(7, [4, 6])
        assert res["possible"] is False
        assert res["message"] == "Not possible"
        assert res["total_bundles"] is None
        assert res["breakdown"] is None

    def test_large_group_size(self):
        """DP performance check for groupSize=10000."""
        res = solve_bundle_booking(10000, [6, 9, 20])
        assert res["possible"] is True
        assert sum(int(size) * count for size, count in res["breakdown"].items()) == 10000
