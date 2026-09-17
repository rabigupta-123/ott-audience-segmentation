from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

class RecommendRequest(BaseModel):
    user_id: Optional[str] = Field("USR-8192", description="Unique user identifier")
    watch_time_hours: float = Field(..., ge=0.0, le=1000.0, description="Total watch time in hours")
    total_sessions: Optional[float] = Field(5.0, ge=0.0, le=500.0, description="Total viewing sessions")
    avg_session_mins: float = Field(..., ge=0.0, le=500.0, description="Average session duration in minutes")
    top_genres: List[str] = Field(default_factory=list, description="List of preferred genres")
    weekday_watch_ratio: Optional[float] = Field(0.5, ge=0.0, le=1.0, description="Ratio of weekday viewing (0.0 to 1.0)")
    recency_days: Optional[float] = Field(3.0, ge=0.0, le=365.0, description="Days since last activity")
    short_session_ratio: Optional[float] = Field(0.3, ge=0.0, le=1.0, description="Ratio of sessions under 20 mins")

    @field_validator('top_genres', mode='before')
    @classmethod
    def validate_genres(cls, v):
        if isinstance(v, str):
            return [g.strip() for g in v.split(',') if g.strip()]
        if isinstance(v, list):
            return [str(g).strip() for g in v if str(g).strip()]
        return []

class RecommendationItem(BaseModel):
    title: str
    genres: List[str]
    duration_mins: int
    content_type: str
    match_reason: str

class RecommendResponse(BaseModel):
    user_id: str
    segment_id: int
    segment_name: str
    segment_description: str
    distance_to_centroid: float
    recommendations: List[RecommendationItem]
    recommendation_strategy: str
    secondary_segment_id: Optional[int] = None
    secondary_segment_name: Optional[str] = None
    boundary_confidence_note: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    n_clusters: Optional[int] = None
    loaded_features_count: Optional[int] = None
    timestamp: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
