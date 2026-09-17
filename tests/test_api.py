import os
import sys
import pytest
from fastapi.testclient import TestClient

api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "api"))
trainer_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "trainer"))

for d in [api_dir, trainer_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

from main import app, model_container

@pytest.fixture(scope="module")
def client():
    model_container.load()
    return TestClient(app)

def test_api_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True

def test_recommend_valid(client):
    payload = {
        "user_id": "TEST-100",
        "watch_time_hours": 45.0,
        "avg_session_mins": 60.0,
        "top_genres": ["Action", "Sci-Fi"]
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "segment_id" in res
    assert "recommendations" in res
    assert len(res["recommendations"]) > 0

def test_recommend_negative_value_validation(client):
    payload = {
        "watch_time_hours": -5.0,
        "avg_session_mins": 30.0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "validation_error"
