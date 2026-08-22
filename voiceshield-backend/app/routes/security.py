from fastapi import APIRouter

from app.schemas.security import SecurityRequest, SecurityResponse
from app.services.security_service import analyze_security


router = APIRouter(
    prefix="/security",
    tags=["Security"]
)


@router.post(
    "/analyze",
    response_model=SecurityResponse
)
def analyze(request: SecurityRequest):

    return analyze_security(request)