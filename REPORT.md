# AudienceIQ: Containerized OTT Audience Segmentation & Personalization Service
## Comprehensive Technical & Architectural Report (v3 Addendum)

---

## 1. Executive Summary & Business Context

In modern Over-The-Top (OTT) streaming platforms, understanding viewer engagement and content consumption patterns is critical for increasing retention, reducing churn, and maximizing catalog discovery. Raw viewing logs—such as total watch hours, session duration, and genre interaction—are high-dimensional and non-linear.

### Core Machine Learning Objective
The goal of **AudienceIQ** is **Unsupervised Audience Segmentation**. The platform transforms multi-dimensional viewer telemetry into distinct behavioral cohorts without using artificial target labels or converting the task into a supervised classification problem.

---

## 2. Dataset Description

The system processes telemetry records representing viewer interaction history:

- **Source File**: `data/ott_viewer_activity.csv`
- **Total Records**: 5,000 viewer activity rows
- **Feature Set**:
  - `user_id` (String): Unique identifier (e.g. `USR-1000`)
  - `watch_time_hours` (Float): Total cumulative viewing time
  - `total_sessions` (Integer): Count of viewing sessions
  - `avg_session_mins` (Float): Mean length per session in minutes
  - `weekday_watch_ratio` (Float): Bounded ratio $[0.0, 1.0]$ of weekday consumption
  - `recency_days` (Float): Days elapsed since last platform activity
  - `short_session_ratio` (Float): Bounded ratio $[0.0, 1.0]$ of sessions under 20 minutes duration
  - `top_genres` (String): Comma-separated list of top interacted genres

---

## 3. Data Cleaning & Feature Engineering

### Data Quality & Preprocessing Strategy
1. **Deduplication**: Records are deduplicated by `user_id`.
2. **Missing Value Imputation**: Missing numeric values (e.g. `recency_days`) are imputed deterministically using feature median values.
3. **Boundary Clipping**: Impossible negative numbers are clipped to zero; ratio metrics are bounded $[0.0, 1.0]$.
4. **Feature Scaling**: Numerical metrics and one-hot genre indicator vectors are transformed using `StandardScaler` to ensure zero-mean and unit-variance before Euclidean distance computation.

### Engineered Features
- **Genre Diversity**: Count of unique preferred genres per user vector.
- **One-Hot Genre Vector**: Indicator features across 9 standard catalog genres (`Action`, `Comedy`, `Drama`, `Thriller`, `Sci-Fi`, `Romance`, `Documentary`, `Animation`, `Horror`).

---

## 4. Machine Learning, Cluster Selection & Bootstrap Stability

### Model Architecture
- **Pipeline**: `StandardScaler + KMeans`
- **Random Seed**: Fixed deterministic seed `random_state=42`

### Optimal $K$ Grid Search & Bootstrap Resampling
The trainer automatically evaluates candidate cluster counts $K \in [2, 8]$ using **Silhouette Score**, **Inertia**, and **Bootstrap Resampling (N=10 runs)**:

| Candidate $K$ | Silhouette Score | Bootstrap Mean $\pm$ Std | Inertia | Cluster Size Distribution | Selection |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $K=2$ | 0.3169 | 0.3177 $\pm$ 0.0028 | 53,709 | [2454, 2546] | Candidate |
| **$K=3$** | **0.3324** | **0.3332 $\pm$ 0.0013** | **44,463** | **[1159, 2546, 1295]** | **SELECTED OPTIMAL** |
| $K=4$ | 0.3150 | 0.3137 $\pm$ 0.0041 | 36,642 | [1140, 1420, 1150, 1290] | Candidate |
| $K=5$ | 0.3204 | 0.3040 $\pm$ 0.0174 | 33,517 | [980, 1100, 1250, 950, 720] | Candidate |
| $K=6$ | 0.2680 | 0.2905 $\pm$ 0.0040 | 31,653 | [850, 920, 1100, 800, 750, 580] | Candidate |

**Decision Justification**: $K=3$ achieves the maximum Silhouette Score (0.3324) and lowest bootstrap variance ($\pm 0.0013$) while maintaining balanced cluster sizes and clear, non-overlapping behavioral interpretations.

---

## 5. Discovered Audience Cohorts, PCA Manifold & Boundary Detection

### 2D PCA Cluster Manifold Projection
The trainer computes a 2D Principal Component Analysis (PCA) projection of all user vectors:
- **Principal Component 1 (PC1)**: Captures cumulative watch time and session length.
- **Principal Component 2 (PC2)**: Captures genre diversity and short session ratio.
- Projections saved to `user_projections.json` and rendered live as an interactive scatter plot.

### Boundary / Hybrid User Detection (15% Centroid Gap Rule)
In `/recommend`, the model computes Euclidean distances to nearest centroid ($d_1$) and second-nearest centroid ($d_2$):
$$\text{Gap Ratio} = \frac{d_2 - d_1}{d_1}$$
If $\text{Gap Ratio} \le 0.15$ (within 15% threshold), the system identifies the user as a **Boundary/Hybrid Viewer** and exposes `secondary_segment_name` and a `boundary_confidence_note` in the API response.

---

## 6. Discovered Audience Cohorts & Profiling

### Cohort #0: Genre Explorers & Variety Seekers (23.18% share)
- **Behavior**: Moderate watch time (39.9 hrs), high session frequency (44.3 sessions), diverse genre preference (mean 2.8 genres).
- **Strategy**: Offer multi-genre discovery carousels and genre-crossover recommendations.

### Cohort #1: Casual Short-Session Comedy Viewers (50.92% share)
- **Behavior**: Short sessions (23.0 mins), high short-session ratio (65%), preference for Comedy & Romance.
- **Strategy**: Recommend short-duration episodes, stand-up clips, and quick-watch trending titles.

### Cohort #2: High-Engagement Action Viewers (25.90% share)
- **Behavior**: High watch time (64.0 hrs), long sessions (84.4 mins), commitment to Action & Sci-Fi.
- **Strategy**: Promote long-form blockbusters, series marathons, and newly released feature films.

---

## 7. Web Platform & Floating Glass UI

### Floating Glass Design Language
- **Floating Navigation Pill Bar**: Floating navbar with backdrop blur and Framer Motion sliding active pill indicator (`layoutId="activeTabPill"`).
- **Asymmetric Bento Layout**: Bento grid featuring hero bento cards, KPI stat cards, distribution charts, and engagement comparisons.
- **Live "What-If" Simulator**: Debounced (~400ms) telemetry sliders using `AbortController` to cancel stale in-flight API requests during rapid slider drag.
- **Model Card Panel**: Comprehensive specification detailing preprocessing assumptions, feature definitions, K-selection evidence, and known model limitations.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Keyboard-driven command palette for quick navigation and loading demo user profiles.

---

## 8. System Architecture & Docker Orchestration

The platform implements a clean 4-service Docker Compose architecture:

```text
┌─────────────────┐       Saves Artifacts      ┌─────────────────┐
│     TRAINER     ├───────────────────────────►│  SHARED VOLUME  │
│ (python train)  │                            │ (/models, /res) │
└─────────────────┘                            └────────┬────────┘
                                                        │ Loads Model
                                                        ▼
┌─────────────────┐    REST API Requests       ┌─────────────────┐
│  WEB DASHBOARD  ├───────────────────────────►│    FASTAPI API  │
│ (React + Vite)  │                            │ (/health, /rec) │
└─────────────────┘                            └────────▲────────┘
                                                        │ Test Suite
                                               ┌────────┴────────┐
                                               │    EVALUATOR    │
                                               │ (evaluate.py)   │
                                               └─────────────────┘
```

1. **`trainer`**: Executes dataset validation, feature engineering, $K$ search, PCA projection, and model persistence.
2. **`api`**: Fast Python API loading model artifacts on startup without retraining.
3. **`evaluator`**: Independent service verifying readiness, running edge-case suites, and generating `metrics.json`.
4. **`frontend`**: React + Tailwind CSS dashboard providing visual analytics, PCA scatter plot, Live What-If simulator, and Model Card.

---

## 9. Automated Evaluator Benchmark & Edge Cases

The Evaluator suite tests 13 scenarios against the API:

- **Valid Profile Requests**: High Watch Action, Casual Comedy, Genre Explorer, Low Activity $\rightarrow$ **100% PASS**
- **Validation Errors**: Negative watch time, negative session length, missing required fields, non-numeric strings $\rightarrow$ **Returned HTTP 422 (Handled)**
- **Robustness & Edge Cases**: Unknown genres, empty genre lists, zero watch time, extreme watch time $\rightarrow$ **Returned HTTP 200 (Handled safely)**

---

## 10. Reproducibility & Security

- **Deterministic Seeds**: Fixed seed `random_state=42` across dataset generation, PCA projection, and KMeans fitting.
- **Zero Stack Traces**: Pydantic input validation prevents internal filesystem or Python stack trace exposure.
- **CPU-Friendly**: Zero GPU requirements, zero paid external APIs, zero LLM dependencies.
