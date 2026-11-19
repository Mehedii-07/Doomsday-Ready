import pytest
from fastapi.testclient import TestClient


def test_get_all_cinemas_seeded(client: TestClient):
    """Initial seeded dataset contains 4 cinemas."""
    response = client.get("/api/cinemas")
    assert response.status_code == 200
    cinemas = response.json()
    assert len(cinemas) == 4
    names = [c["name"] for c in cinemas]
    assert "Starplex IMAX" in names
    assert "Metro Cinema" in names
    assert "Grand Premiere Hall" in names
    assert "Indie Screen" in names


def test_booking_grand_premiere_hall_44(client: TestClient):
    """Grand Premiere Hall: [6, 9, 20] for groupSize=44 -> 4 bundles (20:1, 9:2, 6:1)."""
    cinemas = client.get("/api/cinemas").json()
    grand_premiere = next(c for c in cinemas if c["name"] == "Grand Premiere Hall")

    response = client.get(f"/api/cinemas/{grand_premiere['id']}/booking?groupSize=44")
    assert response.status_code == 200
    data = response.json()

    assert data["possible"] is True
    assert data["total_bundles"] == 4
    assert data["breakdown"] == {"20": 1, "9": 2, "6": 1}
    assert data["message"] == "4 bundles: 20 × 1, 9 × 2, 6 × 1"
    assert data["group_size"] == 44

    # Also test snake_case query parameter alias ?group_size=44
    res2 = client.get(f"/api/cinemas/{grand_premiere['id']}/booking?group_size=44")
    assert res2.status_code == 200
    assert res2.json()["total_bundles"] == 4


def test_booking_starplex_imax_6(client: TestClient):
    """Starplex IMAX: [1, 3, 4] for groupSize=6 -> 2 bundles (3x2)."""
    cinemas = client.get("/api/cinemas").json()
    starplex = next(c for c in cinemas if c["name"] == "Starplex IMAX")

    response = client.get(f"/api/cinemas/{starplex['id']}/booking?groupSize=6")
    assert response.status_code == 200
    data = response.json()

    assert data["possible"] is True
    assert data["total_bundles"] == 2
    assert data["breakdown"] == {"3": 2}


def test_booking_metro_cinema_11(client: TestClient):
    """Metro Cinema: [2, 5] for groupSize=11 -> 4 bundles (5x1 + 2x3)."""
    cinemas = client.get("/api/cinemas").json()
    metro = next(c for c in cinemas if c["name"] == "Metro Cinema")

    response = client.get(f"/api/cinemas/{metro['id']}/booking?groupSize=11")
    assert response.status_code == 200
    data = response.json()

    assert data["possible"] is True
    assert data["total_bundles"] == 4
    assert data["breakdown"] == {"5": 1, "2": 3}


def test_booking_indie_screen_7_impossible(client: TestClient):
    """Indie Screen: [4, 6] for groupSize=7 -> Not possible."""
    cinemas = client.get("/api/cinemas").json()
    indie = next(c for c in cinemas if c["name"] == "Indie Screen")

    response = client.get(f"/api/cinemas/{indie['id']}/booking?groupSize=7")
    assert response.status_code == 200
    data = response.json()

    assert data["possible"] is False
    assert data["message"] == "Not possible"
    assert data["total_bundles"] is None
    assert data["breakdown"] is None


def test_booking_validation_errors(client: TestClient):
    """Group size validation limits (1-10000)."""
    cinemas = client.get("/api/cinemas").json()
    cid = cinemas[0]["id"]

    # groupSize < 1
    res = client.get(f"/api/cinemas/{cid}/booking?groupSize=0")
    assert res.status_code == 422

    # groupSize > 10000
    res = client.get(f"/api/cinemas/{cid}/booking?groupSize=10001")
    assert res.status_code == 422

    # non-existent cinema ID
    res = client.get("/api/cinemas/99999/booking?groupSize=10")
    assert res.status_code == 404
