from app.schemas.security import SecurityRequest, SecurityResponse

from app.services.ai_service import (
    threat_analysis,
    security_reasoning
)


def analyze_security(request: SecurityRequest) -> SecurityResponse:

    # Model 1
    threat_result = threat_analysis(request)

    # Model 2
    reasoning_result = security_reasoning(
        request,
        threat_result
    )

    threats = threat_result.get("threats", [])

    if threats:
        threat_type = threats[0]
    else:
        threat_type = "normal"

    return SecurityResponse(
    threat_type=threat_type,
    risk_score=reasoning_result.get("risk_score", 0),
    confidence=reasoning_result.get("confidence", 0),
    decision=reasoning_result.get("decision", "VERIFY"),
    reasons=threats,
    reasoning=reasoning_result.get(
        "reasoning",
        "Additional verification recommended."
    )
)