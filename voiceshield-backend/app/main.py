import logging
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.redis_client import redis_client
from app.routes.security import router as security_router
from app.routes import voice


# ======================================================
# LOGGING SETUP
# ======================================================
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("voiceshield")

app = FastAPI(
    title="VoiceShield API",
    description="Security intelligence layer for AI voice agents",
    version="1.0.0"
)


# ======================================================
# REQUEST TIMING & STRUCTURED LOGGING MIDDLEWARE
# ======================================================
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} - {response.status_code} ({duration}ms)"
        )
        response.headers["X-Process-Time-Ms"] = str(duration)
        return response
    except Exception as exc:
        duration = round((time.time() - start_time) * 1000, 2)
        logger.error(
            f"{request.method} {request.url.path} - ERROR: {exc} ({duration}ms)"
        )
        raise exc


# ======================================================
# CORS CONFIGURATION
# ======================================================
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    allowed_origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# ROUTERS
# ======================================================

# Security analysis endpoint
app.include_router(security_router)

# Voice analysis endpoints
# POST /voice/analyze
# GET  /voice/calls
app.include_router(voice.router)


# ======================================================
# ROOT & HEALTH CHECK ENDPOINTS
# ======================================================

@app.get("/")
def root():
    return {
        "message": "VoiceShield API is running",
        "service": "VoiceShield",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Liveness probe: verifies the web service is responding."""
    return {
        "status": "healthy",
        "service": "VoiceShield"
    }


@app.get("/health/ready")
def readiness_check():
    """Readiness probe: validates database, redis, and service dependencies."""
    components = {}

    # Check database
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        components["database"] = "connected"
    except Exception as e:
        components["database"] = f"unhealthy: {str(e)[:60]}"

    # Check redis
    try:
        redis_client.ping()
        components["redis"] = "connected"
    except Exception as e:
        components["redis"] = f"unhealthy: {str(e)[:60]}"

    all_ready = all(status == "connected" for status in components.values())

    return {
        "status": "ready" if all_ready else "degraded",
        "service": "VoiceShield",
        "components": components
    }