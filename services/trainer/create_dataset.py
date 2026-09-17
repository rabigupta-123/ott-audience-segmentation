import os
import random
import pandas as pd
import numpy as np

def generate_ott_dataset(filename="data/ott_viewer_activity.csv", num_rows=5000, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    genres_pool = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Documentary", "Animation", "Horror"]

    # We will sample from 4 latent user archetypes to ensure distinct, meaningful clusters exist in data
    user_ids = [f"USR-{1000 + i}" for i in range(num_rows)]
    
    watch_time_hours = []
    total_sessions = []
    avg_session_mins = []
    weekday_ratio = []
    top_genres_list = []
    recency_days = []
    short_session_ratio = []
    
    for i in range(num_rows):
        archetype = np.random.choice(["binge_action", "casual_comedy", "genre_explorer", "low_activity"], p=[0.25, 0.30, 0.25, 0.20])
        
        if archetype == "binge_action":
            wt = np.random.normal(65, 15)
            sess = np.random.randint(25, 70)
            avg_sess = np.random.normal(85, 20)
            wkday = np.random.uniform(0.5, 0.8)
            rec = np.random.randint(1, 5)
            short_ratio = np.random.uniform(0.05, 0.2)
            g_count = np.random.choice([2, 3])
            g_choices = np.random.choice(["Action", "Thriller", "Sci-Fi"], size=g_count, replace=False).tolist()
            
        elif archetype == "casual_comedy":
            wt = np.random.normal(15, 6)
            sess = np.random.randint(15, 40)
            avg_sess = np.random.normal(25, 8)
            wkday = np.random.uniform(0.3, 0.6)
            rec = np.random.randint(1, 10)
            short_ratio = np.random.uniform(0.6, 0.9)
            g_count = np.random.choice([1, 2])
            g_choices = np.random.choice(["Comedy", "Animation", "Romance"], size=g_count, replace=False).tolist()

        elif archetype == "genre_explorer":
            wt = np.random.normal(40, 12)
            sess = np.random.randint(30, 60)
            avg_sess = np.random.normal(50, 12)
            wkday = np.random.uniform(0.4, 0.7)
            rec = np.random.randint(1, 7)
            short_ratio = np.random.uniform(0.2, 0.5)
            g_count = np.random.choice([3, 4, 5])
            g_choices = np.random.choice(genres_pool, size=g_count, replace=False).tolist()

        else: # low_activity
            wt = np.random.normal(4, 2.5)
            sess = np.random.randint(1, 8)
            avg_sess = np.random.normal(20, 10)
            wkday = np.random.uniform(0.2, 0.8)
            rec = np.random.randint(10, 45)
            short_ratio = np.random.uniform(0.3, 0.7)
            g_count = np.random.choice([1, 2])
            g_choices = np.random.choice(["Drama", "Documentary", "Comedy"], size=g_count, replace=False).tolist()

        # Ensure realistic boundary enforcement
        wt = max(0.5, round(wt, 1))
        sess = max(1, int(sess))
        avg_sess = max(5.0, round(avg_sess, 1))
        wkday = round(min(1.0, max(0.0, wkday)), 2)
        rec = max(1, int(rec))
        short_ratio = round(min(1.0, max(0.0, short_ratio)), 2)

        watch_time_hours.append(wt)
        total_sessions.append(sess)
        avg_session_mins.append(avg_sess)
        weekday_ratio.append(wkday)
        recency_days.append(rec)
        short_session_ratio.append(short_ratio)
        top_genres_list.append(",".join(g_choices))

    df = pd.DataFrame({
        "user_id": user_ids,
        "watch_time_hours": watch_time_hours,
        "total_sessions": total_sessions,
        "avg_session_mins": avg_session_mins,
        "weekday_watch_ratio": weekday_ratio,
        "recency_days": recency_days,
        "short_session_ratio": short_session_ratio,
        "top_genres": top_genres_list
    })

    # Introduce minor realistic anomalies (0.5% missing or slightly noisy data) for cleaner validation demonstration
    missing_indices = np.random.choice(df.index, size=15, replace=False)
    df.loc[missing_indices, "recency_days"] = np.nan

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    df.to_csv(filename, index=False)
    print(f"Dataset successfully created at {filename} with {len(df)} rows.")

if __name__ == "__main__":
    generate_ott_dataset()
