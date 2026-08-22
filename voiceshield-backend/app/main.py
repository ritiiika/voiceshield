from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.security import router as security_router
from app.routes import voice


app = FastAPI(
    title="VoiceShield API",
    description="Security intelligence layer for AI voice agents",
    version="1.0.0"
)


# ======================================================
# CORS CONFIGURATION
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
# ROOT ENDPOINT
# ======================================================

@app.get("/")
def root():
    return {
        "message": "VoiceShield API is running",
        "status": "online"
    }


# ======================================================
# HEALTH CHECK
# ======================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }