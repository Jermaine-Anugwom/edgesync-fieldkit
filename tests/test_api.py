from fastapi.testclient import TestClient

from edgesync.api import app

client = TestClient(app)


def test_health() -> None:
    assert client.get("/health").json()["status"] == "ready"


def test_sync_endpoint() -> None:
    response = client.post(
        "/sync",
        json={
            "events": [
                {
                    "record_id": "R-1",
                    "device_id": "D-1",
                    "sequence": 1,
                    "payload": {"state": "checked"},
                }
            ]
        },
    )
    assert response.status_code == 200
    assert response.json()["applied"][0]["status"] == "applied"


def test_offline_preserves_pending_event() -> None:
    response = client.post(
        "/sync",
        json={
            "online": False,
            "events": [
                {
                    "record_id": "R-1",
                    "device_id": "D-1",
                    "sequence": 1,
                    "payload": {"state": "checked"},
                }
            ],
        },
    )
    assert response.json()["pending"][0]["status"] == "queued"
