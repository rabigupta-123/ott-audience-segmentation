import os
import sys
import json
import joblib
import pandas as pd
from datetime import datetime

# Ensure trainer directory is in python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from inspect_dataset import inspect_dataset
from feature_engineering import OTTFeatureEngineer
from clustering import evaluate_k_range, generate_segment_metadata, compute_pca_projections, KMeans

def run_training_pipeline(csv_path="data/ott_viewer_activity.csv", models_dir="models", results_dir="results"):
    print("[TRAINER] Starting AudienceIQ ML Training Pipeline...")
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)
    
    # 1. Inspect dataset
    print(f"[TRAINER] Inspecting dataset from {csv_path}...")
    dataset_stats = inspect_dataset(csv_path)
    
    # 2. Feature engineering
    print("[TRAINER] Performing feature engineering & scaling...")
    df_raw = pd.read_csv(csv_path)
    fe = OTTFeatureEngineer()
    df_clean, X_scaled, feature_names = fe.fit_transform(df_raw)
    
    print(f"[TRAINER] Cleaned dataset shape: {df_clean.shape}, Feature matrix shape: {X_scaled.shape}")
    
    # 3. Evaluate K range (2 to 8) with bootstrap stability
    print("[TRAINER] Evaluating candidate K=2..8 with Silhouette & Bootstrap Stability...")
    experiments, best_k = evaluate_k_range(X_scaled, min_k=2, max_k=8, seed=42, n_bootstraps=10)
    
    for exp in experiments:
        print(f"  - K={exp['k']}: Silhouette={exp['silhouette_score']} (Bootstrap: {exp['bootstrap_mean_silhouette']} ± {exp['bootstrap_std_silhouette']}), Inertia={exp['inertia']}")
        
    print(f"[TRAINER] Selected optimal K={best_k}")
    
    exp_path = os.path.join(results_dir, "experiments.json")
    with open(exp_path, "w") as f:
        json.dump(experiments, f, indent=2)
        
    # 4. Train final KMeans model
    final_model = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    final_model.fit(X_scaled)
    
    # 5. Compute PCA 2D User Projections
    projections, explained_var = compute_pca_projections(X_scaled, final_model.labels_, df_clean["user_id"].tolist(), sample_size=500, seed=42)
    
    proj_path = os.path.join(results_dir, "user_projections.json")
    with open(proj_path, "w") as f:
        json.dump({
            "explained_variance_ratio": explained_var,
            "sample_size": len(projections),
            "projections": projections
        }, f, indent=2)
    print(f"[TRAINER] Saved PCA 2D user projections ({len(projections)} points) to {proj_path}")

    # Copy user projections to models_dir as well
    with open(os.path.join(models_dir, "user_projections.json"), "w") as f:
        json.dump({
            "explained_variance_ratio": explained_var,
            "sample_size": len(projections),
            "projections": projections
        }, f, indent=2)

    # 6. Generate Segment Metadata & DNA Profiles
    segments = generate_segment_metadata(df_clean, X_scaled, final_model, feature_names)
    
    pipeline_artifact = {
        "feature_engineer": fe,
        "scaler": fe.scaler,
        "model": final_model,
        "feature_names": feature_names,
        "n_clusters": best_k
    }
    
    pipeline_path = os.path.join(models_dir, "audience_pipeline.joblib")
    joblib.dump(pipeline_artifact, pipeline_path)
    
    meta_path = os.path.join(models_dir, "segment_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(segments, f, indent=2)
        
    with open(os.path.join(results_dir, "cluster_profiles.json"), "w") as f:
        json.dump(segments, f, indent=2)
        
    schema_path = os.path.join(models_dir, "feature_schema.json")
    feature_schema = {
        "feature_names": feature_names,
        "num_features": len(feature_names),
        "required_inputs": [
            "watch_time_hours",
            "total_sessions",
            "avg_session_mins",
            "weekday_watch_ratio",
            "recency_days",
            "short_session_ratio",
            "top_genres"
        ]
    }
    with open(schema_path, "w") as f:
        json.dump(feature_schema, f, indent=2)
        
    training_metadata = {
        "trained_at": datetime.now().isoformat(),
        "original_rows": len(df_raw),
        "cleaned_rows": len(df_clean),
        "k_selected": best_k,
        "silhouette_score": next(e["silhouette_score"] for e in experiments if e["k"] == best_k),
        "inertia": next(e["inertia"] for e in experiments if e["k"] == best_k),
        "bootstrap_mean_silhouette": next(e["bootstrap_mean_silhouette"] for e in experiments if e["k"] == best_k),
        "pca_explained_variance": explained_var,
        "random_seed": 42
    }
    train_meta_path = os.path.join(models_dir, "training_metadata.json")
    with open(train_meta_path, "w") as f:
        json.dump(training_metadata, f, indent=2)

    with open(os.path.join(results_dir, "training_metadata.json"), "w") as f:
        json.dump(training_metadata, f, indent=2)
        
    print("[TRAINER] ML Pipeline training complete successfully!")
    return training_metadata

if __name__ == "__main__":
    run_training_pipeline()
