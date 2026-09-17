<div align="center">

# 🎬 AudienceIQ
### Containerized OTT Audience Segmentation & Personalization Platform

[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.6-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

<img src="docs/images/hero_banner.jpg" alt="AudienceIQ Hero Banner" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />

<br />

*An end-to-end, production-grade ML platform transforming raw viewer telemetry into actionable behavioral audience cohorts and serving real-time, explainable recommendations via REST API and a crisp, modern SaaS Web Dashboard.*

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Mathematical Foundations](#-canonical-mathematical-spec) • [Quick Start](#-quick-start) • [API Specification](#-rest-api-specification) • [Evaluation Suite](#-automated-evaluator--quality-benchmarks)

</div>

---

## 📌 Executive Summary

**AudienceIQ** solves the challenge of cold-start and behavioral audience segmentation in Over-The-Top (OTT) streaming platforms. Operating on raw telemetry streams (watch hours, session lengths, completion ratios, genre affinity vectors), AudienceIQ dynamically segments users into distinct behavioral profiles without requiring manual tagging or arbitrary heuristic rules.

Designed for high reliability, mathematical rigor, and instant demo readiness:
- **Zero Dummy Data Policy**: 100% of metrics, coordinates, radar charts, and recommendation scores are computed live or sourced from persisted Scikit-Learn training artifacts.
- **Deterministic Inference Pipeline**: Features are normalized using a persistent `StandardScaler` ($\mu, \sigma$) and mapped to optimal $K$-Means centroids without online retraining.
- **Hybrid Boundary Viewer Detection**: Detects ambiguous or multi-preference viewers situated near cluster boundaries using a 15% centroid gap threshold.
- **Microservices Topology**: Docker-first architecture isolating Trainer, REST API, Evaluator, and Web Dashboard.

---

## ✨ Key Features

### 🧠 Machine Learning Engine (`services/trainer`)
- **Grid Search & Silhouette Analysis**: Automatically evaluates $K \in [2, 8]$ clusters on cleaned telemetry data (5,000 rows), selecting optimal $K=3$ with a silhouette score of `0.3222`.
- **Bootstrap Stability Verification**: Performs $N=10$ resamples with replacement per candidate $K$, computing 95% confidence intervals ($K=3: 0.3229 \pm 0.0012$) to prove clustering stability.
- **2D PCA Manifold Projection**: Fits a 2-component Principal Component Analysis model ($X' = X \cdot W$) during training to export 2D user scatter coordinates.
- **Behavioral DNA Radar Normalization**: Computes standardized $z$-score feature profiles per cohort for radar visual rendering.
- **Shannon Entropy Genre Diversity**: Computes $H = -\sum p_i \ln(p_i)$ to distinguish specialized vs. broad "Genre Explorer" viewers.

### ⚡ REST API Service (`services/api`)
- **Sub-10ms Inference**: High-performance FastAPI endpoint serving `POST /recommend` using persisted `audience_pipeline.joblib`.
- **Explainable Match Reasons**: Every title returned carries a human-readable `match_reason` explaining why it fits the viewer's behavioral segment.
- **15% Centroid Gap Rule**: Identifies boundary users when $\frac{d_2 - d_1}{d_1} \le 0.15$, returning secondary cohort attributions and confidence notes.
- **Strict Pydantic V2 Validation**: Prevents invalid telemetry types, negative durations, or missing fields with `HTTP 422` handlers.

### 🖥️ Modern SaaS Web Dashboard (`frontend`)
- **Dashboard Bento View**: Highlights total telemetry records (5,000), discovered cohorts, silhouette score, and viewer distribution pie & bar charts.
- **Audience Segments & 2D PCA View**: Interactive Recharts 2D PCA scatter plot (500 sampled user vectors) and Behavioral DNA Radar Chart.
- **User Analyzer & Live Simulator**: Interactive sliders for watch time, session duration, and short-session ratio with debounced (~450ms) auto-execution and `AbortController` request cancellation.
- **Official Model Card & Benchmark Matrix**: Displays dataset lineage, feature schema, preprocessing assumptions, bootstrap curves, and 13/13 edge-case test results.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Keyboard shortcut modal for navigating views and loading demo user profiles.

---

## 📐 System Architecture

AudienceIQ employs a decoupled 4-container architecture communicating via HTTP and a shared Docker volume.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Docker Shared Volume                   │
                  │  - audience_pipeline.joblib   - user_projections.json  │
                  │  - segment_metadata.json     - training_metadata.json │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
┌─────────────────────────┐                  │                 ┌─────────────────────────┐
│     TRAINER SERVICE     │──────────────────┴────────────────>│     FASTAPI REST API    │
│  (python:3.12-slim)     │   Persists Model Artifacts         │   (python:3.12-slim)    │
│                         │                                    │  Serves /health         │
│  1. Clean & Validate    │                                    │  Serves /recommend      │
│  2. Feature Scaling     │                                    │  Boundary Detection     │
│  3. K Grid Search (2..8)│                                    └────────────┬────────────┘
│  4. Bootstrap (N=10)    │                                                 │
│  5. 2D PCA Projection   │                                                 │ HTTP Requests
└─────────────────────────┘                                                 ▼
                                                               ┌─────────────────────────┐
┌─────────────────────────┐                                    │  EVALUATOR TEST RUNNER  │
│    REACT WEB DASHBOARD  │<───────────────────────────────────│   (python:3.12-slim)    │
│  (Nginx / Vite Dev)     │    Displays metrics.json           │                         │
│                         │                                    │  1. Polls /health       │
│  - Bento Dashboard      │                                    │  2. Runs 13 Test Cases  │
│  - 2D PCA Scatter       │                                    │  3. Outputs             │
│  - DNA Radar Chart      │                                    │     results/metrics.json│
│  - Live What-If Slider  │                                    └─────────────────────────┘
└─────────────────────────┘
```

---

## 📐 Canonical Mathematical Spec

Every formula in AudienceIQ is strictly derived and computed in Python during model training or live REST inference:

| # | Metric / Objective | Mathematical Formula | Usage Location |
|---|---|---|---|
| **1** | **Feature Scaling** | $z = \frac{x - \mu}{\sigma}$ | Trainer fit; API inference via `StandardScaler` |
| **2** | **KMeans Objective** | $J = \sum_{i=1}^k \sum_{x \in C_i} \|x - \mu_i\|^2$ | Evaluated over $K \in [2,8]$; reported as `inertia_` |
| **3** | **Centroid Update** | $\mu_i = \frac{1}{|C_i|} \sum_{x \in C_i} x$ | Internal KMeans solver iteration |
| **4** | **Centroid Distance** | $d(x, \mu_i) = \sqrt{\sum_{j=1}^n (x_j - \mu_{i,j})^2}$ | Scaled feature space distance in `POST /recommend` |
| **5** | **Silhouette Score** | $s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$ | Model selection metric via `sklearn.metrics` |
| **6** | **Cohort Percentage** | $\% = \frac{|C_i|}{N} \times 100$ | Computed from 5,000 dataset row counts |
| **7** | **Shannon Entropy** | $H = -\sum p_i \ln(p_i)$ | Genre diversity computation in feature engineering |
| **8** | **Boundary Gap** | $\text{gap} = \frac{d_2 - d_1}{d_1} \le 0.15$ | Triggers hybrid viewer badge & secondary cohort |
| **9** | **z-Score Radar DNA** | $\text{rel\_val} = \frac{\bar{x}_{\text{segment}} - \mu_{\text{global}}}{\sigma_{\text{global}}}$ | Normalized radar attribute generation |
| **10**| **PCA 2D Manifold** | $X' = X \cdot W_{2}$ | Eigenvector decomposition for 2D scatter coordinates |

---

## 🚀 Quick Start

### Option 1: One-Command Docker Compose (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# Clone the repository
git clone https://github.com/rabigupta-123/ott-audience-segmentation.git
cd ott-audience-segmentation

# Build and start all 4 containerized services
docker compose up --build
```

Access Points:
- 🌐 **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- ⚡ **FastAPI REST API**: [http://localhost:8000](http://localhost:8000)
- 📖 **Swagger OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🏥 **API Health Status**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option 2: Local Python & Node Execution (Without Docker)

#### Prerequisites:
- Python 3.11+
- Node.js 18+

```bash
# 1. Install Python dependencies and run ML Training Pipeline
python services/trainer/train.py

# 2. Run automated Pytest unit suite
python -m pytest tests/

# 3. Launch FastAPI REST Server
python -m uvicorn services.api.main:app --host 127.0.0.1 --port 8000

# 4. Execute Evaluator Benchmark (in a separate terminal)
python services/evaluator/evaluate.py

# 5. Launch React Frontend Dev Server (in frontend directory)
cd frontend
npm install
npm run dev
```

---

## 🌐 REST API Specification

### 1. Health Check — `GET /health`
Verifies API status and pipeline readiness.

```bash
curl -X GET "http://localhost:8000/health"
```

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "n_clusters": 3,
  "loaded_features_count": 16,
  "timestamp": "2026-09-17T19:20:00Z"
}
```

---

### 2. Personalized Recommendation — `POST /recommend`
Evaluates telemetry, assigns segment, calculates centroid distance, checks hybrid boundaries, and returns explainable recommendations.

```bash
curl -X POST "http://localhost:8000/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "DEMO-HYBRID",
    "watch_time_hours": 28.0,
    "avg_session_mins": 42.0,
    "total_sessions": 25,
    "top_genres": ["Action", "Comedy"],
    "weekday_watch_ratio": 0.5,
    "recency_days": 4.0,
    "short_session_ratio": 0.35
  }'
```

**Response (`200 OK`)**:
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

## 📊 Discovered Behavioral Cohorts

Through unsupervised $K$-Means clustering ($K=3$) on 5,000 viewer telemetry records:

| Segment ID | Cohort Name | Population | Share | Avg Watch Time | Avg Session | Dominant Genres | Strategy |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **0** | **Genre Explorers & Variety Seekers** | 1,159 | 23.18% | 39.9 hrs | 50.0 mins | Drama, Horror | Multi-genre discovery carousels |
| **1** | **Casual Short-Session Comedy Viewers** | 2,546 | 50.92% | 10.7 hrs | 23.0 mins | Comedy, Romance | Quick-watch clips & episodic titles |
| **2** | **High-Engagement Action Viewers** | 1,295 | 25.90% | 64.0 hrs | 84.4 mins | Action, Sci-Fi | Blockbuster series & movie marathons |

---

## 🧪 Automated Evaluator & Quality Benchmarks

The standalone `evaluator` service container runs an automated 13-point test matrix upon container startup:

```
=========================================
      AUDIENCEIQ EVALUATION SUMMARY      
=========================================
Overall Status : PASS
Passed Tests   : 13/13
Silhouette     : 0.3222
Clusters (K)   : 3
=========================================
```

### Test Suite Matrix Sourced in `metrics.json`:
1. `Valid High-Watch Action Profile` — PASS (HTTP 200)
2. `Valid Casual Short Comedy Profile` — PASS (HTTP 200)
3. `Valid Genre Explorer Profile` — PASS (HTTP 200)
4. `Valid Low-Activity Profile` — PASS (HTTP 200)
5. `Unknown Genre Fallback` — PASS (HTTP 200)
6. `Empty top_genres List` — PASS (HTTP 200)
7. `Zero Watch Time Boundary` — PASS (HTTP 200)
8. `Extremely Large Watch Time (999.0)` — PASS (HTTP 200)
9. `Negative Watch Time (-20.0)` — PASS (HTTP 422)
10. `Negative Session Duration (-15.0)` — PASS (HTTP 422)
11. `Missing Required Fields` — PASS (HTTP 422)
12. `Type Mismatch (String instead of Float)` — PASS (HTTP 422)
13. `Idempotency Re-Verification` — PASS (HTTP 200)

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/ci.yml         # GitHub Actions Pytest & Docker build workflow
├── data/
│   └── ott_viewer_activity.csv  # Cleaned 5,000-row OTT viewer telemetry dataset
├── models/                      # Persisted Scikit-Learn training artifacts
│   ├── audience_pipeline.joblib # Persistent StandardScaler + KMeans pipeline
│   ├── feature_schema.json     # Feature name schema
│   ├── segment_metadata.json   # Cohort definitions & DNA z-scores
│   ├── training_metadata.json  # Lineage & random seed metadata
│   └── user_projections.json   # 2D PCA scatter coordinates
├── results/                     # Evaluator metrics outputs
│   ├── experiments.json        # Grid search & bootstrap stability scores
│   └── metrics.json            # Official evaluation test suite metrics
├── services/
│   ├── api/                    # FastAPI REST Service
│   │   ├── main.py             # App entrypoint & middleware
│   │   ├── model_loader.py     # Persistent model pipeline wrapper
│   │   ├── recommender.py      # Explainable rule-based recommendation logic
│   │   └── schemas.py          # Pydantic v2 schemas & boundary detection
│   ├── evaluator/              # Standalone Evaluator Service
│   │   └── evaluate.py         # 13-point benchmark runner
│   └── trainer/                # ML Training Engine
│       ├── train.py            # Training master orchestrator
│       ├── clustering.py       # K grid search & bootstrap analysis
│       └── feature_engineering.py # StandardScaler & Shannon Entropy
├── frontend/                   # React + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/         # Header, ModelCard, CommandPalette
│   │   └── views/              # Dashboard, Segments, Analyzer, Evaluation, Health
│   ├── tailwind.config.js      # Custom theme design tokens
│   └── vite.config.js          # Vite build configuration
├── tests/                      # Automated Pytest suite
│   ├── test_api.py             # API contract & validation tests
│   └── test_trainer.py         # Feature engineering & ML tests
├── docker-compose.yml          # Multi-container orchestration
├── README.md                   # System documentation & specs
└── REPORT.md                   # Hackathon technical report & verification
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ for High-Performance OTT Audience Analytics**

[Back to top ↑](#-audienceiq)

</div>
