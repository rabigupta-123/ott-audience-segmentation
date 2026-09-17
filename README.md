# AudienceIQ: Containerized OTT Audience Segmentation & Personalization Service

**AudienceIQ** is an AI-powered OTT viewer activity segmentation and personalized content recommendation platform featuring a **Floating Glass UI Design System**. Built with **Python (FastAPI, Scikit-Learn)**, **Docker Compose**, an **Automated Evaluator Service**, and a **React + Tailwind CSS Web Dashboard**.

---

## Architecture & Features Overview

- **`trainer`**: Executes dataset validation, feature engineering, $K=2..8$ evaluation with **Bootstrap Stability (N=10)**, computes **2D PCA Projections**, and saves model artifacts to a shared volume.
- **`api`**: Fast Python REST API serving `/health` and `/recommend` endpoints (loads persisted models without retraining). Supports **Hybrid Viewer Boundary Detection (15% Centroid Gap Rule)**.
- **`evaluator`**: Independent service polling API readiness, executing 13+ edge-case test suites, and outputting `results/metrics.json`.
- **`frontend`**: Modern Floating Glass React dashboard featuring:
  - **Asymmetric Bento Dashboard**
  - **Audience Segments & 2D PCA Cluster Scatter Plot**
  - **Segment Behavioral DNA Radar Chart**
  - **Live "What-If" Simulator** with debounced `AbortController` API requests
  - **Official Model Card** & Bootstrap Evidence Table
  - **Command Palette (`⌘K` / `Ctrl+K`)**
  - **System Health Monitor & Architecture Diagram**

---

## One-Command Startup (Docker Compose)

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# 1. Clone or navigate to the repository
cd audienceiq

# 2. Start all containerized services
docker compose up --build
```

---

## Service Endpoints & Access URLs

| Component | URL | Description |
| :--- | :--- | :--- |
| **Web Dashboard** | [http://localhost:3000](http://localhost:3000) | Floating Glass React SaaS Dashboard |
| **REST API** | [http://localhost:8000](http://localhost:8000) | FastAPI Backend Endpoint |
| **Swagger OpenAPI Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API Documentation |
| **API Health Check** | [http://localhost:8000/health](http://localhost:8000/health) | Live Model & System Status |

---

## Quick Local Execution (Without Docker)

If running directly on Python 3.11+:

```bash
# 1. Generate dataset & train ML model with PCA & Bootstrap stability
python services/trainer/train.py

# 2. Run automated unit test suite
python -m pytest tests/

# 3. Start REST API server
python -m uvicorn services.api.main:app --host 127.0.0.1 --port 8000

# 4. Run Evaluator benchmark
python services/evaluator/evaluate.py
```

---

## Sample API Requests

### Health Check (`GET /health`)
```bash
curl -X GET "http://localhost:8000/health"
```
**Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "n_clusters": 3,
  "loaded_features_count": 16,
  "timestamp": "2026-09-17T18:40:00Z"
}
```

### Recommendation Request with Boundary Detection (`POST /recommend`)
```bash
curl -X POST "http://localhost:8000/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "DEMO-HYBRID",
    "watch_time_hours": 28.0,
    "avg_session_mins": 42.0,
    "top_genres": ["Action", "Comedy"],
    "weekday_watch_ratio": 0.5,
    "recency_days": 4.0,
    "short_session_ratio": 0.35
  }'
```
**Response**:
```json
{
  "user_id": "DEMO-HYBRID",
  "segment_id": 0,
  "segment_name": "Genre Explorers & Variety Seekers",
  "segment_description": "Enthusiastic viewers exploring multiple distinct genres across diverse catalog offerings.",
  "distance_to_centroid": 1.2541,
  "secondary_segment_id": 1,
  "secondary_segment_name": "Casual Short-Session Comedy Viewers",
  "boundary_confidence_note": "User exhibits hybrid characteristics between 'Genre Explorers & Variety Seekers' and 'Casual Short-Session Comedy Viewers' (Centroid Gap: 8.2%)",
  "recommendations": [
    {
      "title": "Cyberpunk 2099: Cyber City",
      "genres": ["Sci-Fi", "Action"],
      "duration_mins": 142,
      "content_type": "Movie",
      "match_reason": "Matches preferred genre: Action | Multi-genre crossover title for variety seekers"
    }
  ],
  "recommendation_strategy": "Offer curated multi-genre discovery carousels and genre crossover recommendations."
}
```

---

## Hackathon Demonstration Flow

1. **Dashboard View**: Open [http://localhost:3000](http://localhost:3000) to present total users (5,000), discovered segments (3), silhouette score (0.3324), and cohort distribution.
2. **Audience Segments & PCA View**: Show discovered cohorts, dominant genres, **2D PCA Scatter Projection**, and **Behavioral DNA Radar Chart**.
3. **User Analyzer & Live Simulator View**: Drag live sliders or select **Demo Profiles** (*e.g. Demo User 03: Hybrid Boundary*) to demonstrate real-time debounced API re-inference and **Hybrid Viewer Boundary Badges**.
4. **Model Evaluation & Model Card**: Show actual `metrics.json` outputs, Silhouette & Bootstrap stability curve ($K=2..8$), feature schema, preprocessing assumptions, and 13/13 edge-case pass matrix.
5. **Command Palette**: Press `⌘K` / `Ctrl+K` to search views and load demo profiles instantly.
6. **System Health & Architecture**: Demonstrate multi-container health checks, shared volume architecture, and live `/health` inspector.
