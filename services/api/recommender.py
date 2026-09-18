from typing import List, Dict, Any

# Local OTT Content Catalog with latest releases, ratings, and badges
OTT_CATALOG = [
    {
        "title": "Cyberpunk 2099: Neon Horizon",
        "genres": ["Sci-Fi", "Action"],
        "duration_mins": 142,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 9.6,
        "badge": "LATEST BLOCKBUSTER",
        "description": "High-octane futuristic action thriller with immersive visual effects and neural combat scenes."
    },
    {
        "title": "Dune: Arrakis Rising",
        "genres": ["Sci-Fi", "Adventure", "Drama"],
        "duration_mins": 155,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 9.8,
        "badge": "MUST WATCH 2026",
        "description": "Epic sci-fi saga detailing desert warfare, spice harvests, and galactic empire politics."
    },
    {
        "title": "Shadow Protocol: Omega",
        "genres": ["Action", "Thriller"],
        "duration_mins": 128,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 9.4,
        "badge": "NEW RELEASE",
        "description": "An elite operative races against time to dismantle a rogue global AI espionage network."
    },
    {
        "title": "Quantum Paradox 2025",
        "genres": ["Sci-Fi", "Drama", "Thriller"],
        "duration_mins": 55,
        "content_type": "Series",
        "release_year": 2025,
        "rating": 9.2,
        "badge": "CRITICS CHOICE",
        "description": "Mind-bending science fiction series exploring parallel timelines and temporal anomalies."
    },
    {
        "title": "Office Laughs & Coffee Breaks 2026",
        "genres": ["Comedy"],
        "duration_mins": 22,
        "content_type": "Series",
        "release_year": 2026,
        "rating": 9.1,
        "badge": "TRENDING COMEDY",
        "description": "Lightweight workplace comedy designed for quick, bite-sized episodic viewing."
    },
    {
        "title": "Stand-Up Comedy Gold: Uncensored",
        "genres": ["Comedy"],
        "duration_mins": 45,
        "content_type": "Special",
        "release_year": 2026,
        "rating": 8.9,
        "badge": "NEW SPECIAL",
        "description": "Hilarious non-stop stand-up comedy special featuring top global comedians."
    },
    {
        "title": "Love in Venice: Season 2",
        "genres": ["Romance", "Comedy"],
        "duration_mins": 105,
        "content_type": "Movie",
        "release_year": 2025,
        "rating": 8.8,
        "badge": "POPULAR ROMANCE",
        "description": "Charming romantic comedy set against picturesque Venetian canals and sunset dates."
    },
    {
        "title": "Planet Earth III: Deep Oceans",
        "genres": ["Documentary"],
        "duration_mins": 50,
        "content_type": "Series",
        "release_year": 2025,
        "rating": 9.7,
        "badge": "AWARD WINNER",
        "description": "Breathtaking nature documentary revealing unexplored deep ocean trenches and marine life."
    },
    {
        "title": "Anime Legends: Dragon Soul",
        "genres": ["Animation", "Action", "Fantasy"],
        "duration_mins": 95,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 9.5,
        "badge": "LATEST ANIME",
        "description": "Visually stunning animated fantasy adventure featuring martial arts and elemental powers."
    },
    {
        "title": "Whispers in the Dark: Reckoning",
        "genres": ["Horror", "Thriller"],
        "duration_mins": 110,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 8.7,
        "badge": "NEW HORROR",
        "description": "Tense psychological horror story filled with unexpected twists and dark mysteries."
    },
    {
        "title": "The Crown & Empire: Season 4",
        "genres": ["Drama", "History"],
        "duration_mins": 60,
        "content_type": "Series",
        "release_year": 2025,
        "rating": 9.3,
        "badge": "TOP RATED DRAMA",
        "description": "Historical drama detailing royal power struggles, secret alliances, and political intrigue."
    },
    {
        "title": "Speedster: Tokyo Drift 2026",
        "genres": ["Action", "Thriller"],
        "duration_mins": 118,
        "content_type": "Movie",
        "release_year": 2026,
        "rating": 9.0,
        "badge": "HIGH OCTANE",
        "description": "Adrenaline-fueled street racing action set in neon-lit Tokyo underground tracks."
    }
]

def generate_recommendations(segment_info: dict, user_genres: List[str], max_items: int = 4) -> List[dict]:
    segment_name = segment_info.get("segment_name", "").lower()
    dominant_genres = segment_info.get("dominant_genres", [])
    
    # 1. Normalize all genres to lowercase for robust case-insensitive matching (Fixes glitch!)
    user_genres_clean = [g.strip() for g in user_genres if g and isinstance(g, str)]
    user_genres_lower = set([g.lower() for g in user_genres_clean])
    dominant_genres_lower = set([g.lower() for g in dominant_genres])
    
    combined_target_lower = user_genres_lower.union(dominant_genres_lower)
    if not combined_target_lower:
        combined_target_lower = {"action", "sci-fi", "comedy", "drama"}

    scored_catalog = []

    for item in OTT_CATALOG:
        score = 0.0
        reasons = []

        item_genres_lower = set([g.lower() for g in item["genres"]])
        
        # 2. Direct user genre match (Highest priority)
        user_matches = item_genres_lower.intersection(user_genres_lower)
        if user_matches:
            score += len(user_matches) * 5.0
            reasons.append(f"Matches preferred genre: {', '.join([g.title() for g in user_matches])}")

        # 3. Segment dominant genre match
        segment_matches = item_genres_lower.intersection(dominant_genres_lower)
        if segment_matches and not user_matches:
            score += len(segment_matches) * 2.5
            reasons.append(f"Popular in {segment_info.get('segment_name', 'cohort')}")

        # 4. Segment specific duration & content type scoring
        if "short-session" in segment_name or "casual" in segment_name:
            if item["duration_mins"] <= 45:
                score += 4.0
                reasons.append("Optimal short session length (<45 mins)")
            elif item["duration_mins"] > 100:
                score -= 2.0
        elif "high-engagement" in segment_name:
            if item["duration_mins"] >= 90 or item["content_type"] == "Series":
                score += 4.5
                reasons.append("High-engagement immersive marathon title")
        elif "explorer" in segment_name or "variety" in segment_name:
            if len(item["genres"]) >= 2:
                score += 3.5
                reasons.append("Multi-genre crossover title for variety seekers")

        # 5. Latest Release & Rating Boost (Prioritizes 2026/2025 top movies!)
        release_year = item.get("release_year", 2024)
        year_boost = max(0, (release_year - 2024) * 1.5)
        rating_boost = item.get("rating", 8.0) * 0.4
        score += (year_boost + rating_boost)

        if not reasons:
            reasons.append(f"Top rated title ({release_year} Release)")

        # Calculate a realistic match percentage (75% to 99%)
        match_percentage = min(99, max(75, int(75 + (score * 1.2))))

        scored_catalog.append({
            "item": item,
            "score": score,
            "match_percentage": match_percentage,
            "match_reason": " | ".join(reasons)
        })

    # Sort catalog by score descending (Highest score & latest movies first)
    scored_catalog.sort(key=lambda x: (x["score"], x["item"].get("release_year", 0)), reverse=True)

    results = []
    for entry in scored_catalog[:max_items]:
        itm = entry["item"]
        results.append({
            "title": itm["title"],
            "genres": itm["genres"],
            "duration_mins": itm["duration_mins"],
            "content_type": itm["content_type"],
            "release_year": itm.get("release_year", 2026),
            "rating": itm.get("rating", 9.0),
            "badge": itm.get("badge", "LATEST RELEASE"),
            "description": itm.get("description", ""),
            "match_percentage": entry["match_percentage"],
            "match_reason": entry["match_reason"]
        })

    return results

