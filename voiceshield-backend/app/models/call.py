from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text
)

from app.database import Base


class CallAnalysis(Base):

    __tablename__ = "call_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    call_id = Column(
        String(100),
        nullable=False,
        index=True
    )

    caller_id = Column(
        String(100),
        nullable=False,
        index=True
    )

    transcript = Column(
        Text,
        nullable=False
    )

    requested_action = Column(
        String(100),
        nullable=False
    )

    threat_type = Column(
        String(100),
        nullable=False
    )

    risk_score = Column(
        Integer,
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    decision = Column(
        String(20),
        nullable=False
    )

    reasoning = Column(
        Text,
        nullable=True
    )

    agent_response = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )