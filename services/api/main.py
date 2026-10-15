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
    RecommendationItem,
    ChurnPredictRequest,
    ChurnPredictResponse,
    ChurnAnalyticsResponse
)
from model_loader import model_container
from recommender import generate_recommendations
from churn_predictor import churn_engine

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
        
        # Generate recommendations using local content catalog with requested limit (default 12)
        limit = payload.limit if payload.limit is not None else 12
        recs_data = generate_recommendations(segment_info, payload.top_genres, limit=limit)
        recommendations = [RecommendationItem(**item) for item in recs_data]

        # Compute integrated churn risk intelligence
        churn_info = churn_engine.calculate_churn_risk(input_dict, segment_id=cluster_id)

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
            boundary_confidence_note=boundary_note,
            churn_risk=churn_info
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        print(f"[API ERROR] Recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An error occurred during recommendation prediction."
        )

@app.post("/churn/predict", response_model=ChurnPredictResponse)
def post_churn_predict(payload: ChurnPredictRequest):
    try:
        input_dict = payload.model_dump()
        seg_id = payload.segment_id
        seg_name = None

        # If segment_id is not supplied, infer it from model if loaded
        if seg_id is None and model_container.is_loaded:
            try:
                inferred_id, info, _, _, _, _ = model_container.predict(input_dict)
                seg_id = inferred_id
                seg_name = info.get("segment_name")
            except Exception:
                pass
        elif seg_id is not None and model_container.is_loaded:
            info = next((s for s in model_container.segment_metadata if s.get("segment_id") == seg_id), None)
            if info:
                seg_name = info.get("segment_name")

        churn_res = churn_engine.calculate_churn_risk(input_dict, segment_id=seg_id)
        return ChurnPredictResponse(
            user_id=payload.user_id or "USR-8192",
            churn_risk_score=churn_res["churn_risk_score"],
            churn_risk_percentage=churn_res["churn_risk_percentage"],
            risk_level=churn_res["risk_level"],
            primary_driver=churn_res["primary_driver"],
            risk_factors=churn_res["risk_factors"],
            retention_playbook=churn_res["retention_playbook"],
            segment_id=seg_id,
            segment_name=seg_name
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        print(f"[API ERROR] Churn prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during churn prediction."
        )

@app.get("/churn/analytics", response_model=ChurnAnalyticsResponse)
def get_churn_analytics():
    try:
        data = churn_engine.compute_cohort_analytics()
        return data
    except Exception as e:
        print(f"[API ERROR] Churn analytics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while compiling platform churn analytics."
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
