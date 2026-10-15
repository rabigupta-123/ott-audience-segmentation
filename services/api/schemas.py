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
    limit: Optional[int] = Field(12, ge=1, le=25, description="Number of recommendations to return (default 12, min 1, max 25)")

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
    duration: Optional[int] = None
    content_type: str = "Movie"
    match_reason: str
    year: Optional[int] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    weighted_rating: Optional[float] = None
    score: Optional[float] = None
    reasons: Optional[List[str]] = Field(default_factory=list)
    source: Optional[str] = "MovieLens ml-latest-small"
    badge: Optional[str] = None
    description: Optional[str] = None
    match_percentage: Optional[int] = None

class RiskFactorItem(BaseModel):
    name: str
    score: float
    severity: str
    description: str

class RetentionPlaybook(BaseModel):
    campaign_id: str
    campaign_title: str
    objective: str
    primary_channel: str
    recommended_action: str
    incentive_offer: str
    projected_retention_lift: str

class ChurnPredictRequest(BaseModel):
    user_id: Optional[str] = Field("USR-8192", description="Unique user identifier")
    watch_time_hours: float = Field(..., ge=0.0, le=1000.0, description="Total watch time in hours")
    total_sessions: Optional[float] = Field(5.0, ge=0.0, le=500.0, description="Total viewing sessions")
    avg_session_mins: float = Field(..., ge=0.0, le=500.0, description="Average session duration in minutes")
    top_genres: List[str] = Field(default_factory=list, description="List of preferred genres")
    weekday_watch_ratio: Optional[float] = Field(0.5, ge=0.0, le=1.0, description="Ratio of weekday viewing")
    recency_days: Optional[float] = Field(3.0, ge=0.0, le=365.0, description="Days since last activity")
    short_session_ratio: Optional[float] = Field(0.3, ge=0.0, le=1.0, description="Ratio of sessions under 20 mins")
    segment_id: Optional[int] = Field(None, description="Optional pre-assigned audience cohort ID")

    @field_validator('top_genres', mode='before')
    @classmethod
    def validate_genres(cls, v):
        if isinstance(v, str):
            return [g.strip() for g in v.split(',') if g.strip()]
        if isinstance(v, list):
            return [str(g).strip() for g in v if str(g).strip()]
        return []

class ChurnPredictResponse(BaseModel):
    user_id: str
    churn_risk_score: float
    churn_risk_percentage: float
    risk_level: str
    primary_driver: str
    risk_factors: List[RiskFactorItem]
    retention_playbook: RetentionPlaybook
    segment_id: Optional[int] = None
    segment_name: Optional[str] = None

class ChurnAnalyticsResponse(BaseModel):
    total_subscribers: int
    overall_avg_churn_risk: float
    risk_distribution: Dict[str, Any]
    cohort_breakdowns: List[Dict[str, Any]]
    top_risk_triggers: List[Dict[str, Any]]
    revenue_impact: Dict[str, Any]
    timestamp: str

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
    churn_risk: Optional[Dict[str, Any]] = None

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

