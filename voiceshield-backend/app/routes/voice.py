from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import tempfile
import os
import uuid

from app.database import get_db
from app.models.call import CallAnalysis
from app.services.agent_service import run_voice_agent
from app.services.transcription_service import transcribe_audio
from app.redis_client import get_previous_risk, save_previous_risk


router = APIRouter(
    prefix="/voice",
    tags=["Voice Analysis"]
)


@router.post("/analyze")
async def analyze_voice(
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Analyze an uploaded voice recording.

    Audio
      ↓
    Transcription
      ↓
    Redis → Previous Risk
      ↓
    LangGraph Agent
      ↓
    Request Understanding
      ↓
    Security Analysis
      ↓
    Decision
      ↓
    Redis → Save New Risk
      ↓
    Supabase → Save Analysis
      ↓
    Safe Agent Response
    """

    # --------------------------------------------------
    # STEP 1 — Save uploaded audio temporarily
    # --------------------------------------------------

    suffix = os.path.splitext(
        audio.filename or ".wav"
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        content = await audio.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:

        # --------------------------------------------------
        # STEP 2 — Transcribe audio
        # --------------------------------------------------

        transcript = transcribe_audio(temp_path)

        # --------------------------------------------------
        # STEP 3 — Get previous risk from Redis
        # --------------------------------------------------

        # Keep the same caller ID so Redis can maintain
        # risk history across multiple voice analyses.
        caller_id = "VOICE-UPLOAD-USER"

        previous_risk = get_previous_risk(
            caller_id
        )

        # --------------------------------------------------
        # STEP 4 — Run LangGraph voice agent
        # --------------------------------------------------

        agent_result = run_voice_agent(
            transcript=transcript,
            caller_id=caller_id,
            user_role="customer",
            previous_risk=previous_risk
        )

        # --------------------------------------------------
        # STEP 5 — Save latest risk to Redis
        # --------------------------------------------------

        save_previous_risk(
            caller_id,
            agent_result.get(
                "risk_score",
                0
            )
        )

        # --------------------------------------------------
        # STEP 6 — Generate unique call ID
        # --------------------------------------------------

        call_id = f"VOICE-{uuid.uuid4().hex[:8].upper()}"

        # --------------------------------------------------
        # STEP 7 — Save analysis to Supabase
        # --------------------------------------------------

        analysis = CallAnalysis(
            call_id=call_id,
            caller_id=caller_id,

            transcript=transcript,

            requested_action=agent_result.get(
                "requested_action",
                "general_request"
            ),

            threat_type=agent_result.get(
                "threat_type",
                "normal"
            ),

            risk_score=agent_result.get(
                "risk_score",
                0
            ),

            confidence=agent_result.get(
                "confidence",
                0.0
            ),

            decision=agent_result.get(
                "decision",
                "VERIFY"
            ),

            reasoning=agent_result.get(
                "reasoning",
                ""
            ),

            agent_response=agent_result.get(
                "agent_response",
                ""
            )
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # --------------------------------------------------
        # STEP 8 — Return complete result
        # --------------------------------------------------

        return {
            "transcript": transcript,

            "requested_action": agent_result.get(
                "requested_action"
            ),

            "security_analysis": {
                "threat_type": agent_result.get(
                    "threat_type"
                ),

                "risk_score": agent_result.get(
                    "risk_score"
                ),

                "confidence": agent_result.get(
                    "confidence"
                ),

                "decision": agent_result.get(
                    "decision"
                ),

                "reasons": agent_result.get(
                    "reasons",
                    []
                ),

                "reasoning": agent_result.get(
                    "reasoning",
                    ""
                )
            },

            "agent_response": agent_result.get(
                "agent_response"
            ),

            "database_id": analysis.id,

            "call_id": call_id,

            "caller_id": caller_id,

            "previous_risk": previous_risk
        }

    finally:

        # --------------------------------------------------
        # STEP 9 — Delete temporary audio
        # --------------------------------------------------

        if os.path.exists(temp_path):
            os.remove(temp_path)


# ======================================================
# GET HISTORICAL CALLS
# ======================================================

@router.get("/calls")
def get_calls(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Fetch historical voice analysis records
    from Supabase, newest first.
    """

    calls = (
        db.query(CallAnalysis)
        .order_by(CallAnalysis.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": call.id,
            "call_id": call.call_id,
            "caller_id": call.caller_id,
            "transcript": call.transcript,
            "requested_action": call.requested_action,
            "threat_type": call.threat_type,
            "risk_score": call.risk_score,
            "confidence": call.confidence,
            "decision": call.decision,
            "reasoning": call.reasoning,
            "agent_response": call.agent_response,
            "created_at": call.created_at
        }
        for call in calls
    ]