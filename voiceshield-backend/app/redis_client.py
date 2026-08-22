import os
import redis
from dotenv import load_dotenv

load_dotenv()


# ======================================================
# REDIS CONNECTION
# ======================================================

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise ValueError("REDIS_URL is not set in the .env file")


redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)


# ======================================================
# GET PREVIOUS RISK
# ======================================================

def get_previous_risk(caller_id: str) -> float:

    key = f"voiceshield:risk:{caller_id}"

    value = redis_client.get(key)

    if value is None:
        return 0.0

    try:
        return float(value)

    except (ValueError, TypeError):
        return 0.0


# ======================================================
# SAVE CURRENT RISK
# ======================================================

def save_previous_risk(
    caller_id: str,
    risk_score: float
):

    key = f"voiceshield:risk:{caller_id}"

    redis_client.set(
        key,
        float(risk_score)
    )


# ======================================================
# TEST REDIS CONNECTION
# ======================================================

def test_redis_connection():

    try:

        redis_client.set(
            "voiceshield:test",
            "connected"
        )

        value = redis_client.get(
            "voiceshield:test"
        )

        print("Redis value:", value)
        print("Redis connection successful!")

        return True

    except Exception as e:

        print("Redis connection failed:", e)

        return False