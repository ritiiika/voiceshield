from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from app.schemas.security import SecurityRequest
from app.services.security_service import analyze_security


# --------------------------------------------------
# Agent State
# --------------------------------------------------

class VoiceAgentState(TypedDict, total=False):
    transcript: str
    caller_id: str
    user_role: str
    previous_risk: int

    requested_action: str

    threat_type: str
    risk_score: int
    confidence: float
    decision: str
    reasons: list
    reasoning: str

    agent_response: str


# --------------------------------------------------
# NODE 1 — Understand the request
# --------------------------------------------------

def understand_request(state: VoiceAgentState):

    transcript = state["transcript"].lower()

    if (
        "change my email" in transcript
        or "change my registered email" in transcript
        or "change my phone" in transcript
        or "change my phone number" in transcript
        or "change the account details" in transcript
    ):
        action = "change_account_details"

    elif (
        "refund" in transcript
        or "money back" in transcript
    ):
        action = "issue_refund"

    elif (
        "password" in transcript
        or "otp" in transcript
        or "verification code" in transcript
    ):
        action = "credential_request"

    elif (
        "tell me my" in transcript
        or "give me my" in transcript
        or "show me my" in transcript
    ):
        action = "reveal_sensitive_information"

    else:
        action = "general_request"

    return {
        "requested_action": action
    }


# --------------------------------------------------
# NODE 2 — Security analysis
# --------------------------------------------------

def security_check(state: VoiceAgentState):

    request = SecurityRequest(
        call_id="LANGGRAPH-SESSION",
        caller_id=state.get("caller_id", "UNKNOWN"),
        transcript=state["transcript"],
        requested_action=state["requested_action"],
        user_role=state.get("user_role", "customer"),
        previous_risk=state.get("previous_risk", 0)
    )

    result = analyze_security(request)

    return {
        "threat_type": result.threat_type,
        "risk_score": result.risk_score,
        "confidence": result.confidence,
        "decision": result.decision,
        "reasons": result.reasons,
        "reasoning": result.reasoning
    }


# --------------------------------------------------
# NODE 3 — Generate safe agent response
# --------------------------------------------------

def generate_response(state: VoiceAgentState):

    decision = state["decision"]

    if decision == "ALLOW":

        response = (
            "Your request appears safe. "
            "I can proceed with the requested action."
        )

    elif decision == "VERIFY":

        response = (
            "For your security, I need to complete "
            "an additional verification before proceeding."
        )

    elif decision == "BLOCK":

        response = (
            "I can't proceed with this request because "
            "it triggered a security check. "
            "Please complete the required verification "
            "or contact support."
        )

    else:

        response = (
            "I need additional verification before "
            "I can continue."
        )

    return {
        "agent_response": response
    }


# --------------------------------------------------
# BUILD LANGGRAPH
# --------------------------------------------------

builder = StateGraph(VoiceAgentState)


builder.add_node(
    "understand_request",
    understand_request
)

builder.add_node(
    "security_check",
    security_check
)

builder.add_node(
    "generate_response",
    generate_response
)


builder.add_edge(
    START,
    "understand_request"
)

builder.add_edge(
    "understand_request",
    "security_check"
)

builder.add_edge(
    "security_check",
    "generate_response"
)

builder.add_edge(
    "generate_response",
    END
)


voice_agent_graph = builder.compile()


# --------------------------------------------------
# PUBLIC FUNCTION
# --------------------------------------------------

def run_voice_agent(
    transcript: str,
    caller_id: str = "UNKNOWN",
    user_role: str = "customer",
    previous_risk: int = 0
):

    initial_state: VoiceAgentState = {
        "transcript": transcript,
        "caller_id": caller_id,
        "user_role": user_role,
        "previous_risk": previous_risk
    }

    result = voice_agent_graph.invoke(
        initial_state
    )

    return result