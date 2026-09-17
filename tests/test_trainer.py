import os
import sys
import pytest
import pandas as pd

# Add services/trainer path
trainer_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "trainer"))
if trainer_dir not in sys.path:
    sys.path.insert(0, trainer_dir)

from feature_engineering import OTTFeatureEngineer
from clustering import evaluate_k_range, generate_segment_metadata, KMeans

def test_feature_engineering():
    df_raw = pd.DataFrame({
        "user_id": ["USR-1", "USR-2"],
        "watch_time_hours": [10.0, 50.0],
        "total_sessions": [5, 20],
        "avg_session_mins": [30.0, 80.0],
        "weekday_watch_ratio": [0.5, 0.8],
        "recency_days": [2.0, 1.0],
        "short_session_ratio": [0.4, 0.1],
        "top_genres": ["Action,Thriller", "Comedy"]
    })

    fe = OTTFeatureEngineer()
    df_clean, X_scaled, feature_names = fe.fit_transform(df_raw)

    assert len(df_clean) == 2
    assert X_scaled.shape[0] == 2
    assert len(feature_names) > 5

def test_k_range_evaluation():
    import numpy as np
    X_dummy = np.random.rand(100, 10)
    experiments, best_k = evaluate_k_range(X_dummy, min_k=2, max_k=4, seed=42)

    assert len(experiments) == 3
    assert best_k in [2, 3, 4]
    assert "silhouette_score" in experiments[0]
