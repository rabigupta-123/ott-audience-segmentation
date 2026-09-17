import os
import sys
import json
import joblib
import numpy as np

# Ensure sys.path includes trainer directory so joblib can unpickle custom OTTFeatureEngineer
trainer_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trainer"))
if os.path.exists(trainer_dir) and trainer_dir not in sys.path:
    sys.path.insert(0, trainer_dir)

class ModelContainer:
    def __init__(self):
        self.is_loaded = False
        self.feature_engineer = None
        self.scaler = None
        self.model = None
        self.feature_names = []
        self.segment_metadata = []
        self.n_clusters = 0

    def load(self, models_dir="models"):
        possible_dirs = [
            models_dir,
            "/models",
            os.path.join(os.path.dirname(__file__), "..", "..", "models"),
            os.path.join(os.path.dirname(__file__), "models")
        ]
        
        target_dir = None
        for d in possible_dirs:
            if os.path.exists(os.path.join(d, "audience_pipeline.joblib")):
                target_dir = d
                break
                
        if not target_dir:
            print(f"[API MODEL LOADER] Warning: Could not find audience_pipeline.joblib in search paths: {possible_dirs}")
            self.is_loaded = False
            return False

        try:
            pipeline_path = os.path.join(target_dir, "audience_pipeline.joblib")
            pipeline_data = joblib.load(pipeline_path)
            
            self.feature_engineer = pipeline_data.get("feature_engineer")
            self.scaler = pipeline_data["scaler"]
            self.model = pipeline_data["model"]
            self.feature_names = pipeline_data.get("feature_names", [])
            self.n_clusters = pipeline_data.get("n_clusters", self.model.n_clusters)
            
            meta_path = os.path.join(target_dir, "segment_metadata.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.segment_metadata = json.load(f)
            else:
                self.segment_metadata = []

            self.is_loaded = True
            print(f"[API MODEL LOADER] Successfully loaded ML pipeline with K={self.n_clusters} clusters from {target_dir}.")
            return True
        except Exception as e:
            print(f"[API MODEL LOADER] Exception while loading model: {str(e)}")
            self.is_loaded = False
            return False

    def predict(self, payload_dict: dict):
        if not self.is_loaded or self.model is None:
            raise RuntimeError("ML model pipeline is not loaded.")

        if self.feature_engineer is not None:
            scaled_vec = self.feature_engineer.transform_single_dict(payload_dict)
        else:
            wt = float(payload_dict.get("watch_time_hours", 0.0))
            sess = float(payload_dict.get("total_sessions", 5.0))
            avg_sess = float(payload_dict.get("avg_session_mins", 30.0))
            wkday = float(payload_dict.get("weekday_watch_ratio", 0.5))
            recency = float(payload_dict.get("recency_days", 3.0))
            short_ratio = float(payload_dict.get("short_session_ratio", 0.3))
            
            genres = payload_dict.get("top_genres", [])
            if isinstance(genres, str):
                genres = [g.strip() for g in genres.split(",") if g.strip()]
            diversity = float(len(set(genres)))
            
            all_genres = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Documentary", "Animation", "Horror"]
            g_vec = [1.0 if g in genres else 0.0 for g in all_genres]
            raw_vec = np.array([wt, sess, avg_sess, wkday, recency, short_ratio, diversity] + g_vec).reshape(1, -1)
            scaled_vec = self.scaler.transform(raw_vec)

        # Compute Euclidean distances to ALL centroids
        centroids = self.model.cluster_centers_
        distances = [float(np.linalg.norm(scaled_vec[0] - c)) for c in centroids]
        
        # Sort cluster IDs by distance ascending
        sorted_indices = np.argsort(distances)
        primary_id = int(sorted_indices[0])
        d1 = distances[primary_id]

        primary_info = next((s for s in self.segment_metadata if s["segment_id"] == primary_id), {
            "segment_id": primary_id,
            "segment_name": f"Audience Cluster {primary_id}",
            "description": "Standard behavioral audience group.",
            "recommendation_strategy": "General popular content recommendations."
        })

        secondary_id = None
        secondary_name = None
        boundary_note = None

        if len(sorted_indices) > 1:
            sec_idx = int(sorted_indices[1])
            d2 = distances[sec_idx]
            
            # Boundary/hybrid detection rule: gap within 15% threshold
            gap_ratio = (d2 - d1) / d1 if d1 > 0 else 1.0
            if gap_ratio <= 0.15:
                sec_info = next((s for s in self.segment_metadata if s["segment_id"] == sec_idx), None)
                secondary_id = sec_idx
                secondary_name = sec_info["segment_name"] if sec_info else f"Cluster {sec_idx}"
                boundary_note = f"User exhibits hybrid characteristics between '{primary_info['segment_name']}' and '{secondary_name}' (Centroid Gap: {round(gap_ratio*100, 1)}%)"

        return primary_id, primary_info, round(d1, 4), secondary_id, secondary_name, boundary_note

model_container = ModelContainer()
