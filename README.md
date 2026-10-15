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
- **Integrated Churn Intelligence**: Computes real-time viewer churn probabilities and triggers targeted re-engagement campaigns in `POST /churn/predict` and `POST /recommend`.
- **Platform-Wide Attrition Analytics**: Slices 5,000 viewer streams into low, medium, and high risk tiers in `GET /churn/analytics`.
- **Explainable Match Reasons**: Every title returned carries a human-readable `match_reason` explaining why it fits the viewer's behavioral segment.
- **15% Centroid Gap Rule**: Identifies boundary users when $\frac{d_2 - d_1}{d_1} \le 0.15$, returning secondary cohort attributions and confidence notes.
- **Strict Pydantic V2 Validation**: Prevents invalid telemetry types, negative durations, or missing fields with `HTTP 422` handlers.

### 🛡️ Audience Churn & Retention Engine (`services/api/churn_predictor.py`)
- **Multi-Factor Probabilistic Risk Scoring**: Combines Logistic Recency Decay, Session Fragility, Watch Time Velocity Deficit, and Cohort Sensitivity into an actionable 0-100% risk score.
- **Automated Retention Playbooks**: Automatically generates campaign IDs, objectives, targeted channels (Push, In-App Hero, Email Digest), and projected retention lift percentages.
- **Cohort ARR Protection Matrix**: Calculates monthly at-risk subscriber revenue and projects retained annual recurring revenue ($69,650/yr ARR saved).

### 🖥️ Modern SaaS Web Dashboard (`frontend`)
- **Retention & Churn Studio View**: Dedicated command center featuring platform risk KPIs, interactive live telemetry sliders, animated churn risk gauges, cohort breakdown bars, and dispatchable retention campaigns.
- **Dashboard Bento View**: Highlights total telemetry records (5,000), discovered cohorts, silhouette score, and viewer distribution pie & bar charts.
- **Audience Segments & 2D PCA View**: Interactive Recharts 2D PCA scatter plot (500 sampled user vectors) and Behavioral DNA Radar Chart.
- **User Analyzer & Live Simulator**: Interactive sliders for watch time, session duration, and short-session ratio with debounced (~450ms) auto-execution, `AbortController` cancellation, and real-time Churn Risk indicator badges.
- **Official Model Card & Benchmark Matrix**: Displays dataset lineage, feature schema, preprocessing assumptions, bootstrap curves, and 15/15 unit & integration test results.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Keyboard shortcut modal for navigating views, launching churn simulations, and loading demo user profiles.

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
    "short_session_ratio": 0.35,
    "limit": 10
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
      "title": "Toy Story",
      "year": 1995,
      "genres": ["Adventure", "Animation", "Children", "Comedy", "Fantasy"],
      "duration_mins": 88,
      "content_type": "Movie",
      "rating": 3.92,
      "rating_count": 215,
      "weighted_rating": 3.83,
      "score": 0.8124,
      "match_percentage": 94,
      "reasons": ["Matches Comedy", "Highly rated (WR 3.8)", "Multi-genre crossover"],
      "match_reason": "Matches Comedy | Highly rated (WR 3.8) | Multi-genre crossover",
      "source": "MovieLens ml-latest-small"
    }
  ],
  "recommendation_strategy": "Offer curated multi-genre discovery carousels and genre crossover recommendations.",
  "churn_risk": {
    "churn_risk_score": 0.284,
    "churn_risk_percentage": 28.4,
    "risk_level": "LOW",
    "primary_driver": "Active or recent engagement (2.0 days elapsed)",
    "retention_playbook": {
      "campaign_id": "CMP-VIP-LOYALTY",
      "campaign_title": "VIP Superfan Loyalty Showcase"
    }
  }
}
```

### 3. Predict Viewer Churn Risk & Retention Playbook
`POST /churn/predict`

**Request Payload:**
```json
{
  "user_id": "USR-AT-RISK-42",
  "watch_time_hours": 3.5,
  "total_sessions": 2,
  "avg_session_mins": 14.0,
  "weekday_watch_ratio": 0.8,
  "recency_days": 24.0,
  "short_session_ratio": 0.85,
  "top_genres": ["Comedy"]
}
```

**Response Payload:**
```json
{
  "user_id": "USR-AT-RISK-42",
  "churn_risk_score": 0.784,
  "churn_risk_percentage": 78.4,
  "risk_level": "HIGH",
  "primary_driver": "Recency & Inactivity (24.0 days elapsed since last session. Severe inactivity window.)",
  "risk_factors": [
    {
      "name": "Recency & Inactivity",
      "score": 0.896,
      "severity": "high",
      "description": "24.0 days elapsed since last session. Severe inactivity window."
    },
    {
      "name": "Session Fragility",
      "score": 0.770,
      "severity": "high",
      "description": "85% sessions truncated under 20 mins; avg session 14.0m."
    },
    {
      "name": "Consumption Volume Deficit",
      "score": 0.612,
      "severity": "medium",
      "description": "Cumulative watch time of 3.5 hrs across 2 sessions."
    },
    {
      "name": "Catalog Variety Breadth",
      "score": 0.750,
      "severity": "high",
      "description": "1 preferred genre tracked. Narrow interest profile."
    }
  ],
  "retention_playbook": {
    "campaign_id": "CMP-DORM-WINBACK",
    "campaign_title": "48-Hour Critical Win-Back Trigger",
    "objective": "Re-ignite inactive subscriber before 30-day billing cycle lapse",
    "primary_channel": "High-Priority Push Notification + Personalized Email",
    "recommended_action": "Trigger automated 'We picked this for you' drop spotlighting newly premiered Comedy blockbusters with direct-to-play deep link.",
    "incentive_offer": "Exclusive 7-Day 4K HDR Pass & Zero-Ad Weekend Streaming Token",
    "projected_retention_lift": "+38.4% 14-day subscriber retention probability"
  },
  "segment_id": 1,
  "segment_name": "Casual Short-Session Comedy Viewers"
}
```

### 4. Platform-Wide Churn & Cohort Vulnerability Analytics
`GET /churn/analytics`

Returns platform-wide attrition distributions across all 5,000 viewer activity streams:
- `overall_avg_churn_risk`: `36.4%`
- `risk_distribution`: counts and percentages for `low_risk`, `medium_risk`, `high_risk`
- `cohort_breakdowns`: breakdown per K-Means cluster (0, 1, 2) with average risk and risk distributions
- `revenue_impact`: monthly at-risk subscriber revenue and projected annual recurring revenue saved ($69,650/yr)

---

## 📚 Real Dataset Attribution & Transparent Bayesian Ranking

### MovieLens Dataset Provenance & Attribution
All content catalog ratings and counts are sourced from the **GroupLens MovieLens ml-latest-small** research dataset (University of Minnesota):
- **Source**: F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context. *ACM Transactions on Interactive Intelligent Systems (TiiS)* 5, 4.
- **License**: Strictly non-commercial research and educational use. Zero runtime third-party API dependencies.
- **Titles**: 598 catalog titles, 596 rated titles across 9 standard OTT genres (`Action`, `Comedy`, `Drama`, `Thriller`, `Sci-Fi`, `Romance`, `Documentary`, `Animation`, `Horror`).
- **Unrated Titles**: Explicitly display `"Not rated"` with no artificial default numbers.

### Bayesian Weighted Rating (WR)
```
WR = (v / (v + m)) * R + (m / (v + m)) * C
```
- **$R$**: Title's empirical mean rating.
- **$v$**: Title's user rating count.
- **$C = 3.64$**: Catalog-wide baseline mean rating.
- **$m = 105.0$**: Minimum-votes threshold (80th percentile of catalog rating counts).

### Candidate Scoring Formula & Transparent Weights
```
Score = (w_genre * genre_match) + (w_rating * normalized(WR)) + (w_segment * segment_fit)
```
- **$w_{genre} = 0.45$ (45%)**: Jaccard-style overlap of user top genres with title genres.
- **$w_{rating} = 0.30$ (30%)**: Normalized Bayesian WR in range $[0.0, 1.0]$.
- **$w_{segment} = 0.25$ (25%)**: Session length fit (e.g. short sessions favor duration $\le 45$m) and dominant cohort genres.

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
