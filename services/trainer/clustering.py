import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import json
import math

ALL_GENRES = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Documentary", "Animation", "Horror"]

def calculate_shannon_entropy(genres_list: list) -> float:
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

def evaluate_k_range(X_scaled: np.ndarray, min_k=2, max_k=8, seed=42, n_bootstraps=10):
    experiments = []
    best_k = min_k
    best_score = -1.0
    
    np.random.seed(seed)
    n_samples = len(X_scaled)
    
    for k in range(min_k, max_k + 1):
        kmeans = KMeans(n_clusters=k, random_state=seed, n_init=10)
        labels = kmeans.fit_predict(X_scaled)
        
        sil_score = float(silhouette_score(X_scaled, labels))
        inertia = float(kmeans.inertia_)
        
        # Bootstrap stability analysis
        bootstrap_scores = []
        for b in range(n_bootstraps):
            indices = np.random.choice(n_samples, size=n_samples, replace=True)
            X_boot = X_scaled[indices]
            km_boot = KMeans(n_clusters=k, random_state=seed + b, n_init=5)
            boot_labels = km_boot.fit_predict(X_boot)
            if len(set(boot_labels)) > 1:
                b_sil = float(silhouette_score(X_boot, boot_labels))
                bootstrap_scores.append(b_sil)

        b_mean = float(np.mean(bootstrap_scores)) if bootstrap_scores else sil_score
        b_std = float(np.std(bootstrap_scores)) if bootstrap_scores else 0.0

        counts = pd.Series(labels).value_counts().to_dict()
        cluster_sizes = {int(cluster_id): int(count) for cluster_id, count in counts.items()}
        
        experiment = {
            "k": k,
            "silhouette_score": round(sil_score, 4),
            "inertia": round(inertia, 2),
            "bootstrap_mean_silhouette": round(b_mean, 4),
            "bootstrap_std_silhouette": round(b_std, 4),
            "cluster_sizes": cluster_sizes,
            "min_cluster_size": min(cluster_sizes.values()),
            "max_cluster_size": max(cluster_sizes.values())
        }
        experiments.append(experiment)
        
        if sil_score > best_score:
            best_score = sil_score
            best_k = k
            
    return experiments, best_k

def compute_pca_projections(X_scaled: np.ndarray, labels: np.ndarray, user_ids: list, sample_size=500, seed=42):
    pca = PCA(n_components=2, random_state=seed)
    projections_2d = pca.fit_transform(X_scaled)
    
    n = len(X_scaled)
    if n > sample_size:
        np.random.seed(seed)
        indices = np.random.choice(n, size=sample_size, replace=False)
    else:
        indices = list(range(n))

    user_projections = []
    for idx in indices:
        user_projections.append({
            "user_id": str(user_ids[idx]),
            "pc1": round(float(projections_2d[idx, 0]), 4),
            "pc2": round(float(projections_2d[idx, 1]), 4),
            "segment_id": int(labels[idx])
        })

    explained_variance = [round(float(var), 4) for var in pca.explained_variance_ratio_]
    return user_projections, explained_variance

def generate_segment_metadata(df_clean: pd.DataFrame, X_scaled: np.ndarray, model: KMeans, feature_names: list):
    labels = model.labels_
    df_clean["cluster_id"] = labels
    total_users = len(df_clean)
    
    # Calculate Shannon Entropy per user
    genre_lists = df_clean["top_genres"].apply(lambda s: [g.strip() for g in str(s).split(",") if g.strip()])
    df_clean["genre_diversity"] = genre_lists.apply(calculate_shannon_entropy)
    
    # Global feature means and stds for formula: relative_val = (seg_mean - global_mean) / global_std
    numeric_features = ["watch_time_hours", "avg_session_mins", "total_sessions", "short_session_ratio", "recency_days", "genre_diversity"]
    global_means = {f: float(df_clean[f].mean()) for f in numeric_features if f in df_clean.columns}
    global_stds = {f: float(df_clean[f].std()) if df_clean[f].std() > 0 else 1.0 for f in numeric_features if f in df_clean.columns}
    
    segments = []
    
    for cluster_id in range(model.n_clusters):
        cluster_df = df_clean[df_clean["cluster_id"] == cluster_id]
        pop = len(cluster_df)
        pct = round((pop / total_users) * 100, 2)
        
        avg_wt = float(cluster_df["watch_time_hours"].mean())
        avg_sess_mins = float(cluster_df["avg_session_mins"].mean())
        avg_sessions = float(cluster_df["total_sessions"].mean())
        short_ratio = float(cluster_df["short_session_ratio"].mean())
        recency = float(cluster_df["recency_days"].mean())
        shannon_diversity = float(cluster_df["genre_diversity"].mean())
        
        # DNA Radar Chart relative Z-score profile: relative_val = (seg_mean - global_mean) / global_std
        dna_profile = {}
        for f in numeric_features:
            if f in cluster_df.columns:
                mean_val = float(cluster_df[f].mean())
                z_score = (mean_val - global_means[f]) / global_stds[f]
                # Scaled to 0..100 range (50 is global mean)
                score = round(max(5.0, min(95.0, 50.0 + (z_score * 20.0))), 1)
                dna_profile[f] = score
        
        # Genre analysis for cluster
        all_cluster_genres = []
        for gl in genre_lists[df_clean["cluster_id"] == cluster_id]:
            all_cluster_genres.extend(gl)
            
        genre_series = pd.Series(all_cluster_genres).value_counts()
        dominant_genres = list(genre_series.head(2).index) if not genre_series.empty else ["Drama"]
        
        # Human readable naming logic based on actual metrics & Shannon entropy
        if avg_wt > 45.0 and avg_sess_mins > 60.0:
            name = f"High-Engagement {dominant_genres[0]} Viewers"
            desc = "Power viewers with high cumulative watch time, long viewing sessions, and heavy genre commitment."
            strategy = "Promote long-form content, deep series marathons, and newly released blockbusters."
        elif avg_wt < 10.0 and recency > 12.0:
            name = "Low-Activity At-Risk Viewers"
            desc = "Viewers with low watch time, infrequent visits, and high recency gap."
            strategy = "Deliver low-friction popular content, high-rated short titles, and re-engagement recommendations."
        elif short_ratio > 0.5:
            name = f"Casual Short-Session {dominant_genres[0]} Viewers"
            desc = "Viewers with quick, frequent sessions preferring light episodic or bite-sized entertainment."
            strategy = "Recommend short-duration episodes, comedy clips, and quick-watch trending titles."
        elif shannon_diversity > 0.8:
            name = "Genre Explorers & Variety Seekers"
            desc = "Enthusiastic viewers exploring multiple distinct genres across diverse catalog offerings."
            strategy = "Offer curated multi-genre discovery carousels and genre crossover recommendations."
        else:
            name = f"Frequent {dominant_genres[0]} Streamers"
            desc = "Steady audience members with consistent weekly streaming habits."
            strategy = "Suggest top-rated titles within preferred core genres."

        segment_info = {
            "segment_id": int(cluster_id),
            "segment_name": name,
            "description": desc,
            "population": int(pop),
            "percentage": pct,
            "avg_watch_time_hours": round(avg_wt, 1),
            "avg_session_mins": round(avg_sess_mins, 1),
            "avg_total_sessions": round(avg_sessions, 1),
            "short_session_ratio": round(short_ratio, 2),
            "recency_days": round(recency, 1),
            "shannon_genre_entropy": round(shannon_diversity, 4),
            "dominant_genres": dominant_genres,
            "recommendation_strategy": strategy,
            "centroid": model.cluster_centers_[cluster_id].tolist(),
            "dna_profile": dna_profile
        }
        segments.append(segment_info)
        
    return segments
