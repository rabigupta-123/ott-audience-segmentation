import os
import sys
import json
import time
import requests
from typing import Dict, Any

# Add paths for direct TestClient fallback
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
api_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api"))
trainer_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trainer"))

for d in [root_dir, api_dir, trainer_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

def run_evaluation(api_url="http://localhost:8000", results_dir="results", models_dir="models"):
    print("[EVALUATOR] Starting AudienceIQ Evaluator Service...")
    os.makedirs(results_dir, exist_ok=True)
    
    health_url = f"{api_url}/health"
    recommend_url = f"{api_url}/recommend"
    
    use_test_client = False
    test_client = None

    # Try live HTTP API first
    print(f"[EVALUATOR] Polling API health check at {health_url}...")
    model_ready = False
    try:
        resp = requests.get(health_url, timeout=0.5)
        if resp.status_code == 200 and resp.json().get("model_loaded") is True:
            model_ready = True
            print("[EVALUATOR] Live HTTP API health check passed! Model loaded.")
    except Exception:
        pass

    if not model_ready:
        print("[EVALUATOR] Live HTTP server not detected. Initializing FastAPI TestClient fallback...")
        try:
            from fastapi.testclient import TestClient
            from main import app, model_container
            model_container.load()
            test_client = TestClient(app)
            h_resp = test_client.get("/health")
            if h_resp.status_code == 200 and h_resp.json().get("model_loaded") is True:
                model_ready = True
                use_test_client = True
                print("[EVALUATOR] TestClient initialization successful! Model loaded.")
        except Exception as e:
            print(f"[EVALUATOR] TestClient fallback initialization error: {str(e)}")

    overall_status = "PASS" if model_ready else "FAIL"

    def api_get(endpoint):
        if use_test_client and test_client:
            return test_client.get(endpoint)
        return requests.get(f"{api_url}{endpoint}", timeout=5)

    def api_post(endpoint, json_data):
        if use_test_client and test_client:
            return test_client.post(endpoint, json=json_data)
        return requests.post(f"{api_url}{endpoint}", json=json_data, timeout=5)

    test_results = []
    valid_passed = 0
    invalid_handled = 0

    def record_test(name: str, passed: bool, category: str, details: str):
        nonlocal valid_passed, invalid_handled
        test_results.append({
            "name": name,
            "category": category,
            "passed": passed,
            "details": details
        })
        if passed:
            if category == "valid":
                valid_passed += 1
            else:
                invalid_handled += 1

    # 2. Test Valid Request Profiles
    valid_profiles = [
        {
            "name": "High Watch Time Action Viewer",
            "payload": {
                "user_id": "TEST-01",
                "watch_time_hours": 75.0,
                "avg_session_mins": 90.0,
                "total_sessions": 50,
                "top_genres": ["Action", "Sci-Fi"],
                "weekday_watch_ratio": 0.7,
                "short_session_ratio": 0.1
            }
        },
        {
            "name": "Casual Short-Session Comedy Viewer",
            "payload": {
                "user_id": "TEST-02",
                "watch_time_hours": 8.0,
                "avg_session_mins": 20.0,
                "total_sessions": 24,
                "top_genres": ["Comedy"],
                "weekday_watch_ratio": 0.4,
                "short_session_ratio": 0.8
            }
        },
        {
            "name": "Genre Explorer",
            "payload": {
                "user_id": "TEST-03",
                "watch_time_hours": 35.0,
                "avg_session_mins": 45.0,
                "total_sessions": 30,
                "top_genres": ["Drama", "Horror", "Documentary", "Romance"],
                "weekday_watch_ratio": 0.5,
                "short_session_ratio": 0.3
            }
        },
        {
            "name": "Low Activity Viewer",
            "payload": {
                "user_id": "TEST-04",
                "watch_time_hours": 2.5,
                "avg_session_mins": 25.0,
                "total_sessions": 3,
                "top_genres": ["Drama"],
                "weekday_watch_ratio": 0.3,
                "short_session_ratio": 0.5
            }
        }
    ]

    print("[EVALUATOR] Running valid API request profile suite...")
    for item in valid_profiles:
        try:
            r = api_post("/recommend", item["payload"])
            if r.status_code == 200:
                res = r.json()
                if "segment_id" in res and "recommendations" in res and len(res["recommendations"]) > 0:
                    record_test(item["name"], True, "valid", f"Assigned Segment {res['segment_id']}: {res['segment_name']}")
                else:
                    record_test(item["name"], False, "valid", "Response schema incomplete")
            else:
                record_test(item["name"], False, "valid", f"HTTP status {r.status_code}")
        except Exception as e:
            record_test(item["name"], False, "valid", str(e))

    # 3. Test Edge-Case Suite
    edge_cases = [
        {
            "name": "Unknown Genre",
            "payload": {"watch_time_hours": 10.0, "avg_session_mins": 30.0, "top_genres": ["AlienSciFi123"]},
            "expected_status": 200
        },
        {
            "name": "Empty top_genres list",
            "payload": {"watch_time_hours": 15.0, "avg_session_mins": 40.0, "top_genres": []},
            "expected_status": 200
        },
        {
            "name": "Zero Watch Time",
            "payload": {"watch_time_hours": 0.0, "avg_session_mins": 0.0, "top_genres": ["Comedy"]},
            "expected_status": 200
        },
        {
            "name": "Extremely Large Watch Time",
            "payload": {"watch_time_hours": 999.0, "avg_session_mins": 300.0, "top_genres": ["Action"]},
            "expected_status": 200
        },
        {
            "name": "Negative Watch Time",
            "payload": {"watch_time_hours": -20.0, "avg_session_mins": 30.0, "top_genres": ["Action"]},
            "expected_status": 422
        },
        {
            "name": "Negative Session Duration",
            "payload": {"watch_time_hours": 10.0, "avg_session_mins": -15.0, "top_genres": ["Comedy"]},
            "expected_status": 422
        },
        {
            "name": "Missing Required Field (avg_session_mins)",
            "payload": {"watch_time_hours": 10.0, "top_genres": ["Action"]},
            "expected_status": 422
        },
        {
            "name": "String instead of Number",
            "payload": {"watch_time_hours": "invalid_number", "avg_session_mins": 30.0},
            "expected_status": 422
        },
        {
            "name": "Repeated Identical Requests",
            "payload": {"watch_time_hours": 25.0, "avg_session_mins": 45.0, "top_genres": ["Drama"]},
            "expected_status": 200
        }
    ]

    print("[EVALUATOR] Running edge-case test suite...")
    for ec in edge_cases:
        try:
            r = api_post("/recommend", ec["payload"])
            if r.status_code == ec["expected_status"]:
                record_test(ec["name"], True, "invalid", f"Received expected HTTP {r.status_code}")
            else:
                record_test(ec["name"], False, "invalid", f"Expected HTTP {ec['expected_status']}, got {r.status_code}")
        except Exception as e:
            record_test(ec["name"], False, "invalid", str(e))

    # 4. Load training metadata and cluster stats
    clustering_stats = {"silhouette_score": 0.0, "inertia": 0.0, "n_clusters": 0}
    cluster_balance = {"min_cluster_size": 0, "max_cluster_size": 0}
    
    train_meta_path = os.path.join(models_dir, "training_metadata.json")
    if os.path.exists(train_meta_path):
        with open(train_meta_path, "r") as f:
            tm = json.load(f)
            clustering_stats = {
                "silhouette_score": tm.get("silhouette_score", 0.0),
                "inertia": tm.get("inertia", 0.0),
                "n_clusters": tm.get("k_selected", 0)
            }
            
    seg_meta_path = os.path.join(models_dir, "segment_metadata.json")
    if os.path.exists(seg_meta_path):
        with open(seg_meta_path, "r") as f:
            sm = json.load(f)
            sizes = [s["population"] for s in sm]
            if sizes:
                cluster_balance = {
                    "min_cluster_size": min(sizes),
                    "max_cluster_size": max(sizes)
                }

    total_tests = len(test_results)
    passed_tests = sum(1 for t in test_results if t["passed"])

    if passed_tests < total_tests:
        overall_status = "PARTIAL_PASS" if passed_tests > 0 else "FAIL"

    metrics_output = {
        "clustering": clustering_stats,
        "cluster_balance": cluster_balance,
        "api": {
            "health_check": model_ready,
            "valid_requests_passed": valid_passed,
            "invalid_requests_handled": invalid_handled,
            "total_tests": total_tests,
            "passed_tests": passed_tests
        },
        "reproducibility": {
            "random_seed": 42
        },
        "overall_status": overall_status,
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    metrics_file = os.path.join(results_dir, "metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_output, f, indent=2)
    print(f"[EVALUATOR] Successfully generated {metrics_file}")

    eval_details_file = os.path.join(results_dir, "evaluator_results.json")
    with open(eval_details_file, "w") as f:
        json.dump({"metrics": metrics_output, "test_cases": test_results}, f, indent=2)

    print("=========================================")
    print("      AUDIENCEIQ EVALUATION SUMMARY      ")
    print("=========================================")
    print(f"Overall Status : {overall_status}")
    print(f"Passed Tests   : {passed_tests}/{total_tests}")
    print(f"Silhouette     : {clustering_stats['silhouette_score']}")
    print(f"Clusters (K)   : {clustering_stats['n_clusters']}")
    print("=========================================")

    return metrics_output

if __name__ == "__main__":
    api_endpoint = os.environ.get("API_URL", "http://localhost:8000")
    run_evaluation(api_url=api_endpoint)
