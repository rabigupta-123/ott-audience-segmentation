from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import sys
import json

# Ensure sys.path includes parent directories for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from schemas import (
    RecommendRequest, 
    RecommendResponse, 
    HealthResponse, 
    ErrorResponse,
    RecommendationItem
)
from model_loader import model_container
from recommender import generate_recommendations

app = FastAPI(
    title="AudienceIQ REST API",
    description="Containerized OTT Audience Segmentation & Personalization REST API",
    version="1.0.0"
)

# Enable CORS for Frontend React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_results_file(filename: str):
    possible_dirs = [
        "results",
        "/results",
        os.path.join(os.path.dirname(__file__), "..", "..", "results"),
        os.path.join(os.path.dirname(__file__), "results"),
        "models",
        "/models",
        os.path.join(os.path.dirname(__file__), "..", "..", "models")
    ]
    for d in possible_dirs:
        filepath = os.path.join(d, filename)
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                return json.load(f)
    return None

@app.on_event("startup")
def startup_event():
    print("[API STARTUP] Loading persisted ML pipeline artifacts...")
    loaded = model_container.load()
    if loaded:
        print("[API STARTUP] ML pipeline successfully loaded and ready for inference!")
    else:
        print("[API STARTUP] Warning: ML pipeline could not be loaded on startup. /health will report model_loaded=false.")

@app.get("/health", response_model=HealthResponse)
def get_health():
    if not model_container.is_loaded:
        model_container.load()

    return HealthResponse(
        status="ok",
        model_loaded=model_container.is_loaded,
        n_clusters=model_container.n_clusters if model_container.is_loaded else None,
        loaded_features_count=len(model_container.feature_names) if model_container.is_loaded else None,
        timestamp=datetime.now().isoformat()
    )

@app.get("/metrics")
def get_metrics():
    data = find_results_file("metrics.json")
    if not data:
        raise HTTPException(status_code=404, detail="metrics.json artifact not found. Please run evaluator.")
    return data

@app.get("/segments")
def get_segments():
    data = find_results_file("cluster_profiles.json") or find_results_file("segment_metadata.json")
    if not data:
        raise HTTPException(status_code=404, detail="segment metadata artifact not found. Please run trainer.")
    return data

@app.get("/experiments")
def get_experiments():
    data = find_results_file("experiments.json")
    if not data:
        raise HTTPException(status_code=404, detail="experiments.json artifact not found. Please run trainer.")
    return data

@app.get("/projections")
def get_projections():
    data = find_results_file("user_projections.json")
    if not data:
        raise HTTPException(status_code=404, detail="user_projections.json artifact not found. Please run trainer.")
    return data

@app.post("/recommend", response_model=RecommendResponse)
def post_recommend(payload: RecommendRequest):
    if not model_container.is_loaded:
        if not model_container.load():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML Model pipeline is currently unavailable. Please run the trainer service."
            )

    try:
        input_dict = payload.model_dump()
        cluster_id, segment_info, dist, sec_id, sec_name, boundary_note = model_container.predict(input_dict)
        
        # Generate recommendations using local content catalog
        recs_data = generate_recommendations(segment_info, payload.top_genres)
        recommendations = [RecommendationItem(**item) for item in recs_data]

        return RecommendResponse(
            user_id=payload.user_id or "USR-8192",
            segment_id=cluster_id,
            segment_name=segment_info.get("segment_name", f"Segment {cluster_id}"),
            segment_description=segment_info.get("description", "Standard behavioral audience group."),
            distance_to_centroid=dist,
            recommendations=recommendations,
            recommendation_strategy=segment_info.get("recommendation_strategy", "General audience recommendation."),
            secondary_segment_id=sec_id,
            secondary_segment_name=sec_name,
            boundary_confidence_note=boundary_note
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        print(f"[API ERROR] Recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An error occurred during recommendation prediction."
        )

# Exception handlers preventing stack trace leakage
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = "Validation failed for input request parameters."
    if errors:
        msg = f"{errors[0].get('loc', ['field'])[-1]}: {errors[0].get('msg', 'invalid value')}"

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "validation_error", "message": msg}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "api_error", "message": exc.detail}
    )
