import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import math

ALL_GENRES = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Documentary", "Animation", "Horror"]

def calculate_shannon_entropy(genres_list: list) -> float:
    """
    Computes Shannon Entropy H = - sum(p_i * log(p_i)) for genre distribution.
    Provides a mathematically rigorous measure of genre diversity.
    """
    if not genres_list:
        return 0.0
    counts = pd.Series(genres_list).value_counts()
    total = len(genres_list)
    entropy = 0.0
    for count in counts:
        p_i = count / total
        if p_i > 0:
            entropy -= p_i * math.log(p_i)
    return round(float(entropy), 4)

class OTTFeatureEngineer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = []

    def clean_raw_data(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        
        # 1. Deduplicate by user_id
        df = df.drop_duplicates(subset=["user_id"]).reset_index(drop=True)
        
        # 2. Impute & clean numerical values
        numeric_cols = ["watch_time_hours", "total_sessions", "avg_session_mins", "weekday_watch_ratio", "recency_days", "short_session_ratio"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
                median_val = df[col].median() if not df[col].dropna().empty else 0.0
                df[col] = df[col].fillna(median_val)
                df[col] = df[col].clip(lower=0.0)

        if "weekday_watch_ratio" in df.columns:
            df["weekday_watch_ratio"] = df["weekday_watch_ratio"].clip(upper=1.0)
        if "short_session_ratio" in df.columns:
            df["short_session_ratio"] = df["short_session_ratio"].clip(upper=1.0)

        # 3. Clean categorical top_genres
        df["top_genres"] = df["top_genres"].fillna("").astype(str)

        return df

    def transform_single_dict(self, input_dict: dict) -> np.ndarray:
        """
        Transforms a single API JSON request into a scaled feature vector z = (x - mu) / sigma.
        """
        wt = max(0.0, float(input_dict.get("watch_time_hours", 0.0)))
        sessions = max(1.0, float(input_dict.get("total_sessions", 5.0)))
        avg_session = max(0.0, float(input_dict.get("avg_session_mins", 30.0)))
        weekday_ratio = min(1.0, max(0.0, float(input_dict.get("weekday_watch_ratio", 0.5))))
        recency = max(0.0, float(input_dict.get("recency_days", 3.0)))
        short_ratio = min(1.0, max(0.0, float(input_dict.get("short_session_ratio", 0.3))))

        user_genres = input_dict.get("top_genres", [])
        if isinstance(user_genres, str):
            user_genres = [g.strip() for g in user_genres.split(",") if g.strip()]
        
        # Shannon Entropy H = - sum(p_i * log(p_i))
        shannon_diversity = calculate_shannon_entropy(user_genres)

        # One-hot genre vector
        genre_vec = [1.0 if g in user_genres else 0.0 for g in ALL_GENRES]

        raw_vec = np.array([
            wt,
            sessions,
            avg_session,
            weekday_ratio,
            recency,
            short_ratio,
            shannon_diversity
        ] + genre_vec).reshape(1, -1)

        scaled_vec = self.scaler.transform(raw_vec)
        return scaled_vec

    def fit_transform(self, df: pd.DataFrame):
        df_clean = self.clean_raw_data(df)

        base_features = df_clean[[
            "watch_time_hours", 
            "total_sessions", 
            "avg_session_mins", 
            "weekday_watch_ratio", 
            "recency_days", 
            "short_session_ratio"
        ]].copy()

        # Compute Shannon Entropy for each user
        genre_lists = df_clean["top_genres"].apply(lambda s: [g.strip() for g in str(s).split(",") if g.strip()])
        base_features["genre_diversity"] = genre_lists.apply(calculate_shannon_entropy)

        # One-hot genre features
        for g in ALL_GENRES:
            base_features[f"genre_{g}"] = genre_lists.apply(lambda gl: 1.0 if g in gl else 0.0)

        self.feature_names = list(base_features.columns)

        X_raw = base_features.values
        # Feature scaling z = (x - mu) / sigma
        X_scaled = self.scaler.fit_transform(X_raw)

        return df_clean, X_scaled, self.feature_names
