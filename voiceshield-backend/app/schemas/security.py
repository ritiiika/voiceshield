from pydantic import BaseModel
from typing import Optional


class SecurityRequest(BaseModel):
    call_id: str
    caller_id: str
    transcript: str
    requested_action: str
    user_role: str
    previous_risk: Optional[float] = 0.0
class SecurityResponse(BaseModel):
    threat_type: str
    risk_score: float
    confidence: float
    decision: str
    reasons: list[str]
    reasoning: str
