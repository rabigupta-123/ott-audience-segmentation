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
from recommender import compute_bayesian_wr, normalize_wr, generate_recommendations, catalog_instance

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
    # Verified minimum 10 recommendations
    assert len(res["recommendations"]) >= 10

def test_recommend_negative_value_validation(client):
    payload = {
        "watch_time_hours": -5.0,
        "avg_session_mins": 30.0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "validation_error"

def test_recommend_default_limit_at_least_12(client):
    """Verify that /recommend returns 12 titles by default."""
    payload = {
        "user_id": "TEST-DEFAULT-12",
        "watch_time_hours": 30.0,
        "avg_session_mins": 40.0,
        "top_genres": ["Comedy"]
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    res = response.json()
    recs = res["recommendations"]
    assert len(recs) == 12
    # Confirm no duplicates in titles
    titles = [r["title"] for r in recs]
    assert len(titles) == len(set(titles)), "Duplicate titles found in recommendations"

def test_recommend_custom_limit(client):
    """Verify that a custom valid limit returns precisely that number of titles."""
    for requested_limit in [5, 12, 18, 25]:
        payload = {
            "user_id": f"TEST-LIMIT-{requested_limit}",
            "watch_time_hours": 65.0,
            "avg_session_mins": 80.0,
            "top_genres": ["Action", "Sci-Fi"],
            "limit": requested_limit
        }
        response = client.post("/recommend", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert len(res["recommendations"]) == requested_limit

def test_recommend_limit_validation_under_min(client):
    """Verify that limit < 1 is rejected by Pydantic validation (HTTP 422)."""
    payload = {
        "watch_time_hours": 20.0,
        "avg_session_mins": 30.0,
        "limit": 0
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 422
    assert response.json()["error"] == "validation_error"

def test_recommend_limit_validation_over_max(client):
    """Verify that limit > 25 is rejected by Pydantic validation (HTTP 422)."""
    payload = {
        "watch_time_hours": 20.0,
        "avg_session_mins": 30.0,
        "limit": 26
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 422
    assert response.json()["error"] == "validation_error"

def test_bayesian_wr_formula():
    """Verify mathematical properties of the Bayesian Weighted Rating formula."""
    c = 3.64
    m = 100.0

    # 1. Zero votes -> returns catalog mean C
    assert compute_bayesian_wr(4.5, 0, c, m) == c
    assert compute_bayesian_wr(None, 100, c, m) == c

    # 2. When votes equal threshold m (v == m), WR is average of R and C
    wr_half = compute_bayesian_wr(4.0, 100, c, m)
    expected_half = (100 / 200) * 4.0 + (100 / 200) * c
    assert abs(wr_half - expected_half) < 1e-6

    # 3. High votes (v >> m) -> converges to title's mean rating R
    wr_high_votes = compute_bayesian_wr(4.5, 10000, c, m)
    assert abs(wr_high_votes - 4.5) < 0.02

    # 4. Low votes (v << m) -> pulled strongly toward catalog mean C
    wr_low_votes = compute_bayesian_wr(5.0, 2, c, m)
    assert wr_low_votes < 3.70

    # 5. Normalization is strictly bounded in [0.0, 1.0]
    assert 0.0 <= normalize_wr(1.5) <= 1.0
    assert 0.0 <= normalize_wr(5.0) <= 1.0

def test_fallback_filling_and_no_duplicates():
    """
    Verify fallback: when an obscure or unknown genre is provided,
    fallback correctly fills remaining slots via adjacent genres & top-rated titles.
    """
    segment_info = {
        "segment_id": 1,
        "segment_name": "Casual Short-Session Comedy Viewers",
        "dominant_genres": ["Comedy", "Romance"]
    }
    # Obscure user genre not in catalog
    recs = generate_recommendations(segment_info, ["CyberpunkSteampunkHybrid999"], limit=15)
    assert len(recs) == 15
    titles = [r["title"] for r in recs]
    assert len(titles) == len(set(titles)), "Duplicate recommendations encountered during fallback"

    # Verify fallback tags present in reasons
    all_reasons = " ".join([r["match_reason"] for r in recs])
    assert any(tag in all_reasons for tag in ["Aligned with", "Adjacent genre discovery", "Catalog top rated"])

def test_real_catalog_ratings_spot_check():
    """Spot check 5 titles against real-world MovieLens source dataset values."""
    catalog = catalog_instance.get_all()
    title_map = {item["title"]: item for item in catalog}

    expected_spot_checks = {
        "Toy Story": 3.92,
        "Pulp Fiction": 4.20,
        "Forrest Gump": 4.16,
        "The Matrix": 4.19,
        "The Shawshank Redemption": 4.43
    }

    for title, expected_r in expected_spot_checks.items():
        assert title in title_map, f"Spot-check title '{title}' not found in catalog"
        actual_r = title_map[title]["rating"]
        assert actual_r == expected_r, f"Mismatch for '{title}': expected {expected_r}, got {actual_r}"
        assert title_map[title]["rating_count"] > 100
        assert "MovieLens" in title_map[title]["source"]

def test_churn_predict_low_risk(client):
    """Verify that an active viewer with low recency and high engagement is scored LOW risk."""
    payload = {
        "user_id": "TEST-ACTIVE-01",
        "watch_time_hours": 85.0,
        "total_sessions": 30.0,
        "avg_session_mins": 75.0,
        "recency_days": 1.0,
        "short_session_ratio": 0.1,
        "top_genres": ["Action", "Sci-Fi"]
    }
    response = client.post("/churn/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "LOW"
    assert data["churn_risk_score"] < 0.35
    assert len(data["risk_factors"]) == 4
    assert "retention_playbook" in data
    assert data["retention_playbook"]["campaign_id"] == "CMP-VIP-LOYALTY"

def test_churn_predict_high_risk(client):
    """Verify that a dormant viewer with high inactivity and session fragility is scored HIGH risk."""
    payload = {
        "user_id": "TEST-DORMANT-02",
        "watch_time_hours": 2.5,
        "total_sessions": 2.0,
        "avg_session_mins": 14.0,
        "recency_days": 28.0,
        "short_session_ratio": 0.85,
        "top_genres": ["Comedy"]
    }
    response = client.post("/churn/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "HIGH"
    assert data["churn_risk_score"] >= 0.70
    assert "retention_playbook" in data
    assert "Win-Back" in data["retention_playbook"]["campaign_title"] or "Hook" in data["retention_playbook"]["campaign_title"]

def test_churn_predict_validation_error(client):
    """Verify that invalid negative values for churn prediction are rejected with HTTP 422."""
    payload = {
        "watch_time_hours": -10.0,
        "avg_session_mins": 30.0,
        "recency_days": -5.0
    }
    response = client.post("/churn/predict", json=payload)
    assert response.status_code == 422
    assert response.json()["error"] == "validation_error"

def test_churn_analytics_endpoint(client):
    """Verify that the platform-wide churn analytics endpoint returns valid cohort distributions."""
    response = client.get("/churn/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["total_subscribers"] == 5000
    assert "risk_distribution" in data
    assert "low_risk" in data["risk_distribution"]
    assert "high_risk" in data["risk_distribution"]
    assert len(data["cohort_breakdowns"]) == 3
    assert "revenue_impact" in data
    assert data["revenue_impact"]["avg_monthly_arpu"] == 14.99

def test_recommend_includes_churn_intelligence(client):
    """Verify that the standard /recommend endpoint includes integrated churn risk intelligence."""
    payload = {
        "user_id": "TEST-REC-CHURN",
        "watch_time_hours": 50.0,
        "avg_session_mins": 60.0,
        "top_genres": ["Drama", "Thriller"]
    }
    response = client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "churn_risk" in data
    assert data["churn_risk"] is not None
    assert "churn_risk_score" in data["churn_risk"]
    assert "risk_level" in data["churn_risk"]

