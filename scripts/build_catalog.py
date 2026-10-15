"""
AudienceIQ Catalog Builder
Builds data/catalog.json from real-world MovieLens ml-latest-small dataset (GroupLens Research).
Outputs clean catalog with real ratings, rating counts, genres, durations, and years.
"""

import os
import re
import json
import io
import zipfile
import requests
import pandas as pd
import numpy as np

MOVIELENS_URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"

OTT_GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Thriller",
    "Sci-Fi",
    "Romance",
    "Documentary",
    "Animation",
    "Horror"
]

# Genre duration heuristics for realistic duration representation (minutes)
GENRE_DURATION_MAP = {
    "Animation": 88,
    "Comedy": 98,
    "Documentary": 78,
    "Horror": 95,
    "Romance": 105,
    "Action": 124,
    "Sci-Fi": 128,
    "Drama": 122,
    "Thriller": 115
}

def clean_movie_title(raw_title: str):
    """Extract clean title and 4-digit release year."""
    match = re.search(r'^(.*?)\s*\((\d{4})\)\s*$', raw_title)
    if match:
        title = match.group(1).strip()
        year = int(match.group(2))
    else:
        title = raw_title.strip()
        year = None

    # Handle standard MovieLens articles at the end: "Matrix, The" -> "The Matrix"
    for article in [", The", ", A", ", An"]:
        if title.endswith(article):
            art = article.replace(", ", "")
            title = f"{art} {title[:-len(article)]}"
            break

    return title, year

def estimate_duration(genres, movie_id: int):
    """Estimate realistic duration based on dominant genres and deterministic salt."""
    base = 105
    for g in genres:
        if g in GENRE_DURATION_MAP:
            base = GENRE_DURATION_MAP[g]
            break
    # Add deterministic jitter (-8 to +12 mins based on movie_id)
    jitter = ((movie_id * 17) % 21) - 8
    return max(42, base + jitter)

def build_catalog(output_path="data/catalog.json"):
    print("[CATALOG BUILDER] Fetching MovieLens ml-latest-small dataset from GroupLens...")
    resp = requests.get(MOVIELENS_URL, timeout=30)
    resp.raise_for_status()

    z = zipfile.ZipFile(io.BytesIO(resp.content))
    movies_df = pd.read_csv(z.open("ml-latest-small/movies.csv"))
    ratings_df = pd.read_csv(z.open("ml-latest-small/ratings.csv"))

    print(f"[CATALOG BUILDER] Downloaded {len(movies_df)} raw movies, {len(ratings_df)} user ratings.")

    # Calculate real per-title statistics: count (v) and mean rating (R)
    stats = ratings_df.groupby("movieId")["rating"].agg(["count", "mean"]).reset_index()
    merged = pd.merge(movies_df, stats, on="movieId", how="inner")

    # Stratified genre selection ensuring >= 500 titles with high quality & representation
    selected_movie_ids = set()
    for genre in OTT_GENRES:
        subset = merged[merged["genres"].str.contains(genre, na=False)].sort_values("count", ascending=False)
        # Take top 90 movies per genre by rating count
        for mid in subset.head(95)["movieId"]:
            selected_movie_ids.add(mid)

    # Also include the top overall most-rated movies regardless of genre
    top_overall = merged.sort_values("count", ascending=False).head(150)["movieId"]
    for mid in top_overall:
        selected_movie_ids.add(mid)

    filtered = merged[merged["movieId"].isin(selected_movie_ids)].copy()
    print(f"[CATALOG BUILDER] Filtered down to {len(filtered)} stratified, highly rated catalog titles.")

    catalog_entries = []
    ratings_for_stats = []

    for _, row in filtered.iterrows():
        mid = int(row["movieId"])
        raw_title = str(row["title"])
        clean_title, year = clean_movie_title(raw_title)

        genres = [g.strip() for g in str(row["genres"]).split("|") if g.strip() and g != "(no genres listed)"]
        v = int(row["count"])
        mean_r = round(float(row["mean"]), 2)
        ratings_for_stats.append(mean_r)

        duration = estimate_duration(genres, mid)
        content_type = "Special" if duration <= 45 else ("Series" if duration <= 60 else "Movie")

        catalog_entries.append({
            "title": clean_title,
            "year": year,
            "genres": genres,
            "duration": duration,
            "duration_mins": duration,
            "content_type": content_type,
            "rating": mean_r,
            "rating_count": v,
            "source": "MovieLens ml-latest-small (GroupLens Research)",
            "description": f"Real-world title from MovieLens catalog across {', '.join(genres[:3])}."
        })



    # Ensure parent directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(catalog_entries, f, indent=2)

    # Also write a copy to models/catalog.json and services/api/catalog.json for bundled access
    for alt_path in ["models/catalog.json", "services/api/catalog.json"]:
        alt_dir = os.path.dirname(alt_path)
        if os.path.exists(alt_dir):
            with open(alt_path, "w", encoding="utf-8") as f:
                json.dump(catalog_entries, f, indent=2)

    print(f"[CATALOG BUILDER] Successfully generated {output_path} with {len(catalog_entries)} titles.")

    # Rating distribution stats (confirming non-identical real ratings)
    ratings_arr = np.array(ratings_for_stats)
    print("\n--- CATALOG RATING METRICS (MovieLens ml-latest-small) ---")
    print(f"Total titles with ratings: {len(ratings_arr)}")
    print(f"Rating Min               : {ratings_arr.min():.2f}")
    print(f"Rating Max               : {ratings_arr.max():.2f}")
    print(f"Rating Mean              : {ratings_arr.mean():.2f}")
    print(f"Rating Std               : {ratings_arr.std():.2f}")
    print("----------------------------------------------------------")

    # Genre representation breakdown
    print("\n--- GENRE COVERAGE TABLE ---")
    for g in OTT_GENRES:
        count = sum(1 for e in catalog_entries if g in e["genres"])
        print(f"Genre {g:15s}: {count:4d} titles")
    print("----------------------------\n")

    # Spot-check 5 famous titles
    spot_check_titles = [
        "Toy Story",
        "Pulp Fiction",
        "Forrest Gump",
        "The Matrix",
        "The Shawshank Redemption"
    ]
    print("--- SPOT-CHECK: 5 TITLES VERIFICATION ---")
    for s_title in spot_check_titles:
        matched = [e for e in catalog_entries if e["title"] == s_title]
        if matched:
            m = matched[0]
            print(f"Title: {m['title']:<26} | Year: {m['year']} | Rating: {m['rating']:.2f} | Votes: {m['rating_count']:<4} | Genres: {m['genres']}")
        else:
            print(f"Title: {s_title} not found directly.")
    print("-----------------------------------------\n")

    return catalog_entries

if __name__ == "__main__":
    build_catalog()
