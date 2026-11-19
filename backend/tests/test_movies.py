import pytest
from fastapi.testclient import TestClient


def test_get_all_movies_seeded(client: TestClient):
    """Initial seeded dataset returns 8 movies."""
    response = client.get("/api/movies")
    assert response.status_code == 200
    movies = response.json()
    assert len(movies) == 8
    titles = [m["title"] for m in movies]
    assert "Avengers: Doomsday" in titles
    assert "Iron Man" in titles


def test_rewatch_order_doomsday(client: TestClient):
    """GET /api/movies/:id/rewatch-order for Avengers: Doomsday returns 7 prerequisites in order."""
    # Find Doomsday ID
    movies = client.get("/api/movies").json()
    doomsday = next(m for m in movies if m["title"] == "Avengers: Doomsday")

    response = client.get(f"/api/movies/{doomsday['id']}/rewatch-order")
    assert response.status_code == 200
    data = response.json()

    assert data["target_movie"]["title"] == "Avengers: Doomsday"
    assert data["total_count"] == 7
    assert data["watched_count"] == 0
    assert data["unwatched_count"] == 7
    assert data["remaining_runtime"] > 0
    assert data["unwatched_runtime"] == data["remaining_runtime"]

    order_titles = [m["title"] for m in data["rewatch_order"]]
    assert len(order_titles) == 7
    # Verify topological order
    assert order_titles.index("Iron Man") < order_titles.index("The Avengers")
    assert order_titles.index("Captain America: The First Avenger") < order_titles.index("The Avengers")
    assert order_titles.index("The Avengers") < order_titles.index("Captain America: Civil War")
    assert order_titles.index("Captain America: Civil War") < order_titles.index("Avengers: Infinity War")
    assert order_titles.index("Thor: Ragnarok") < order_titles.index("Avengers: Infinity War")
    assert order_titles.index("Avengers: Infinity War") < order_titles.index("Avengers: Endgame")


def test_rewatch_order_civil_war(client: TestClient):
    """Civil War rewatch order returns Iron Man, Cap 1, and The Avengers."""
    movies = client.get("/api/movies").json()
    civil_war = next(m for m in movies if m["title"] == "Captain America: Civil War")

    response = client.get(f"/api/movies/{civil_war['id']}/rewatch-order")
    assert response.status_code == 200
    data = response.json()

    assert data["total_count"] == 3
    order_titles = [m["title"] for m in data["rewatch_order"]]
    assert order_titles == ["Iron Man", "Captain America: The First Avenger", "The Avengers"]


def test_rewatch_order_ragnarok_empty(client: TestClient):
    """Thor: Ragnarok has 0 prerequisites."""
    movies = client.get("/api/movies").json()
    ragnarok = next(m for m in movies if m["title"] == "Thor: Ragnarok")

    response = client.get(f"/api/movies/{ragnarok['id']}/rewatch-order")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 0
    assert data["rewatch_order"] == []


def test_cycle_detection_endgame_to_iron_man_conflict(client: TestClient):
    """Updating Iron Man to require Avengers: Endgame must return 409 CIRCULAR_DEPENDENCY."""
    movies = client.get("/api/movies").json()
    iron_man = next(m for m in movies if m["title"] == "Iron Man")
    endgame = next(m for m in movies if m["title"] == "Avengers: Endgame")

    response = client.patch(
        f"/api/movies/{iron_man['id']}",
        json={"prerequisite_ids": [endgame["id"]]}
    )
    assert response.status_code == 409
    body = response.json()
    assert body == {"detail": "CIRCULAR_DEPENDENCY", "code": "CIRCULAR_DEPENDENCY"}


def test_cycle_detection_direct_self_loop(client: TestClient):
    """Updating a movie to require itself must return 409 CIRCULAR_DEPENDENCY."""
    movies = client.get("/api/movies").json()
    iron_man = next(m for m in movies if m["title"] == "Iron Man")

    response = client.patch(
        f"/api/movies/{iron_man['id']}",
        json={"prerequisite_ids": [iron_man["id"]]}
    )
    assert response.status_code == 409
    body = response.json()
    assert body == {"detail": "CIRCULAR_DEPENDENCY", "code": "CIRCULAR_DEPENDENCY"}


def test_toggle_watched_updates_stats(client: TestClient):
    """Marking a prerequisite as watched decreases remaining_runtime and increments watched_count."""
    movies = client.get("/api/movies").json()
    iron_man = next(m for m in movies if m["title"] == "Iron Man")
    civil_war = next(m for m in movies if m["title"] == "Captain America: Civil War")

    # Initial plan
    plan_before = client.get(f"/api/movies/{civil_war['id']}/rewatch-order").json()
    assert plan_before["watched_count"] == 0
    initial_runtime = plan_before["remaining_runtime"]

    # Toggle watched on Iron Man
    patch_res = client.patch(f"/api/movies/{iron_man['id']}", json={"watched": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["watched"] is True

    # Re-fetch plan
    plan_after = client.get(f"/api/movies/{civil_war['id']}/rewatch-order").json()
    assert plan_after["watched_count"] == 1
    assert plan_after["remaining_runtime"] == initial_runtime - iron_man["runtime"]


def test_create_movie_validations(client: TestClient):
    """Validation tests for movie creation."""
    # Duplicate title
    res = client.post(
        "/api/movies",
        json={"title": "Iron Man", "release_year": 2008, "runtime": 120}
    )
    assert res.status_code == 409

    # Runtime < 1
    res = client.post(
        "/api/movies",
        json={"title": "Short Movie", "release_year": 2024, "runtime": 0}
    )
    assert res.status_code == 422

    # Runtime > 300
    res = client.post(
        "/api/movies",
        json={"title": "Long Movie", "release_year": 2024, "runtime": 305}
    )
    assert res.status_code == 422

    # Non-existent prerequisite ID
    res = client.post(
        "/api/movies",
        json={"title": "Brand New Movie", "release_year": 2025, "runtime": 120, "prerequisite_ids": [99999]}
    )
    assert res.status_code == 404
