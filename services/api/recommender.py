from typing import List, Dict, Any

# Local OTT Content Catalog (CPU-friendly, zero external dependencies)
OTT_CATALOG = [
    {
        "title": "Cyberpunk 2099: Cyber City",
        "genres": ["Sci-Fi", "Action"],
        "duration_mins": 142,
        "content_type": "Movie",
        "popularity_score": 9.2,
        "description": "High-octane futuristic action thriller with immersive visual effects."
    },
    {
        "title": "Shadow Protocol",
        "genres": ["Action", "Thriller"],
        "duration_mins": 128,
        "content_type": "Movie",
        "popularity_score": 8.9,
        "description": "An elite operative races against time to dismantle an international network."
    },
    {
        "title": "The Quantum Initiative",
        "genres": ["Sci-Fi", "Drama"],
        "duration_mins": 55,
        "content_type": "Series",
        "popularity_score": 8.7,
        "description": "Deep science fiction series exploring parallel timelines."
    },
    {
        "title": "Office Laughs & Coffee Breaks",
        "genres": ["Comedy"],
        "duration_mins": 22,
        "content_type": "Series",
        "popularity_score": 9.0,
        "description": "Lightweight workplace comedy designed for quick, bite-sized viewing."
    },
    {
        "title": "Stand-Up Comedy Gold",
        "genres": ["Comedy"],
        "duration_mins": 45,
        "content_type": "Special",
        "popularity_score": 8.5,
        "description": "Hilarious non-stop stand-up comedy special featuring top comedians."
    },
    {
        "title": "Love in Venice",
        "genres": ["Romance", "Comedy"],
        "duration_mins": 105,
        "content_type": "Movie",
        "popularity_score": 8.2,
        "description": "Charming romantic comedy set against picturesque Venetian canals."
    },
    {
        "title": "Planet Earth Odyssey",
        "genres": ["Documentary"],
        "duration_mins": 50,
        "content_type": "Series",
        "popularity_score": 9.4,
        "description": "Breathtaking nature documentary revealing unexplored corners of the world."
    },
    {
        "title": "Tales of the Enchanted Kingdom",
        "genres": ["Animation", "Fantasy"],
        "duration_mins": 90,
        "content_type": "Movie",
        "popularity_score": 8.8,
        "description": "Visually stunning animated adventure suitable for all ages."
    },
    {
        "title": "Whispers in the Dark",
        "genres": ["Horror", "Thriller"],
        "duration_mins": 110,
        "content_type": "Movie",
        "popularity_score": 8.0,
        "description": "Tense psychological horror story filled with unexpected twists."
    },
    {
        "title": "The Crown & Empire",
        "genres": ["Drama"],
        "duration_mins": 60,
        "content_type": "Series",
        "popularity_score": 9.1,
        "description": "Historical drama detailing royal power struggles and political intrigue."
    }
]

def generate_recommendations(segment_info: dict, user_genres: List[str], max_items: int = 4) -> List[dict]:
    segment_name = segment_info.get("segment_name", "").lower()
    dominant_genres = segment_info.get("dominant_genres", [])
    
    # Combined target genres (user explicit preferences + segment dominant genres)
    target_genres = list(set([g.strip() for g in user_genres if g.strip()] + dominant_genres))
    if not target_genres:
        target_genres = ["Comedy", "Action", "Drama"]

    scored_catalog = []

    for item in OTT_CATALOG:
        score = 0.0
        reasons = []

        # 1. Genre overlap score
        matching_genres = set(item["genres"]).intersection(set(target_genres))
        if matching_genres:
            score += len(matching_genres) * 3.0
            reasons.append(f"Matches preferred genre: {', '.join(matching_genres)}")

        # 2. Segment specific duration & content type scoring
        if "short-session" in segment_name or "casual" in segment_name:
            if item["duration_mins"] <= 45:
                score += 4.0
                reasons.append("Optimal short session length (<45 mins)")
            elif item["duration_mins"] > 100:
                score -= 2.0
        elif "high-engagement" in segment_name:
            if item["duration_mins"] >= 90 or item["content_type"] == "Series":
                score += 4.0
                reasons.append("High-engagement immersive marathon content")
        elif "explorer" in segment_name or "variety" in segment_name:
            # Reward genre diversity
            if len(item["genres"]) >= 2:
                score += 3.5
                reasons.append("Multi-genre crossover title for variety seekers")

        # 3. Base popularity boost
        score += item["popularity_score"] * 0.2

        if not reasons:
            reasons.append("Top trending title in your audience segment")

        scored_catalog.append({
            "item": item,
            "score": score,
            "match_reason": " | ".join(reasons)
        })

    # Sort catalog by score descending
    scored_catalog.sort(key=lambda x: x["score"], reverse=True)

    results = []
    for entry in scored_catalog[:max_items]:
        itm = entry["item"]
        results.append({
            "title": itm["title"],
            "genres": itm["genres"],
            "duration_mins": itm["duration_mins"],
            "content_type": itm["content_type"],
            "match_reason": entry["match_reason"]
        })

    return results
