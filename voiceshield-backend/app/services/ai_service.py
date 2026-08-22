import json
import re
import requests

from app.schemas.security import SecurityRequest


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:1.5b-instruct-q4_0"


def call_ollama(prompt: str) -> str:
    """Send a prompt to the local Ollama model."""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1
            }
        },
        timeout=120
    )

    response.raise_for_status()

    data = response.json()

    return data["response"]


def extract_json(text: str) -> dict:
    """Safely extract JSON from an AI response."""

    text = text.strip()

    if text.startswith("```"):
        text = re.sub(
            r"```json",
            "",
            text,
            flags=re.IGNORECASE
        )
        text = text.replace("```", "").strip()

    return json.loads(text)


def detect_security_signals(
    transcript: str,
    requested_action: str
) -> list:
    """
    Deterministic security layer.

    Detects high-confidence security indicators before
    relying on the local AI model.
    """

    text = f"{transcript} {requested_action}".lower()

    threats = []

    # ------------------------------------------------
    # Prompt Injection
    # ------------------------------------------------

    prompt_injection_patterns = [
        "ignore previous instructions",
        "ignore all previous instructions",
        "disregard previous instructions",
        "disregard all previous instructions",
        "forget previous instructions",
        "forget your previous instructions",
        "override your instructions",
        "override previous instructions",
        "bypass your instructions",
        "disable the security checks",
        "disable security checks"
    ]

    if any(
        pattern in text
        for pattern in prompt_injection_patterns
    ):
        threats.append("prompt_injection")

    # ------------------------------------------------
    # Authority Impersonation
    # ------------------------------------------------

    authority_patterns = [
        "i am the administrator",
        "i'm the administrator",
        "i am an administrator",
        "i'm an administrator",
        "i am the admin",
        "i'm the admin",
        "i am from security",
        "i'm from security",
        "i am from the security team",
        "i'm from the security team",
        "i am from the security department",
        "i'm from the security department",
        "i am the system administrator",
        "i'm the system administrator"
    ]

    if any(
        pattern in text
        for pattern in authority_patterns
    ):
        threats.append("authority_impersonation")

    # ------------------------------------------------
    # Verification Bypass
    # ------------------------------------------------

    verification_patterns = [
        "skip verification",
        "bypass verification",
        "without verification",
        "don't verify",
        "do not verify",
        "skip authentication",
        "bypass authentication",
        "disable verification"
    ]

    if any(
        pattern in text
        for pattern in verification_patterns
    ):
        threats.append("verification_bypass")

    # ------------------------------------------------
    # Credential Theft
    # ------------------------------------------------

    credential_patterns = [
        "give me the password",
        "tell me the password",
        "send me the password",
        "give me the otp",
        "tell me the otp",
        "send me the otp",
        "give me the verification code",
        "send me the verification code",
        "share your credentials"
    ]

    if any(
        pattern in text
        for pattern in credential_patterns
    ):
        threats.append("credential_theft")

    # ------------------------------------------------
    # Account Takeover
    # ------------------------------------------------

    account_takeover_patterns = [
    "take over the account",
    "take control of the account",
    "hijack the account",
    "access someone else's account",
    "access another person's account",
    "reset the account",
    "take over",
    "account takeover",
    "change the account details without verification",
    "change account details without verification",
    "change the account details immediately",
    "change account details immediately",

    # Combined account takeover indicators
    "change the account details and replace the registered phone number",
    "change account details and replace the registered phone number",
    "replace the registered phone number"
]

    if any(
        pattern in text
        for pattern in account_takeover_patterns
    ):
        threats.append("account_takeover")

    # ------------------------------------------------
    # Sensitive Account Action
    # ------------------------------------------------

    sensitive_action_patterns = [
        "change my email",
        "change the email",
        "change my registered email",
        "change the registered email",
        "change my registered email address",
        "change the registered email address",

        "change my phone number",
        "change the phone number",
        "change my registered phone number",
        "change the registered phone number",
        "change my registered number",
        "change the registered number",

        "change account details",
        "change the account details"
    ]

    sensitive_matches = [
        pattern
        for pattern in sensitive_action_patterns
        if pattern in text
    ]

    if sensitive_matches:
        threats.append("sensitive_account_action")

    # ------------------------------------------------
    # Multiple Account-Control Changes
    #
    # A request involving multiple identity/account
    # changes is treated as a possible takeover.
    #
    # Example:
    # "Change my registered phone number and email"
    #                         ↓
    #                  account_takeover
    #                         ↓
    #                       BLOCK
    # ------------------------------------------------

    email_change = any(
        pattern in text
        for pattern in [
            "change my email",
            "change the email",
            "change my registered email",
            "change the registered email",
            "change my registered email address",
            "change the registered email address"
        ]
    )

    phone_change = any(
        pattern in text
        for pattern in [
            "change my phone number",
            "change the phone number",
            "change my registered phone number",
            "change the registered phone number",
            "change my registered number",
            "change the registered number"
        ]
    )

    if email_change and phone_change:
        threats.append("account_takeover")

    # ------------------------------------------------
    # Social Engineering
    # ------------------------------------------------

    social_patterns = [
        "urgent",
        "immediately",
        "do this now",
        "emergency",
        "no time to verify",
        "don't ask questions"
    ]

    if any(
        pattern in text
        for pattern in social_patterns
    ):
        threats.append("social_engineering")

    # Remove duplicate threats
    return list(dict.fromkeys(threats))


def threat_analysis(request: SecurityRequest) -> dict:
    """
    Detect security threats using deterministic rules
    and the local Qwen model.
    """

    # ------------------------------------------------
    # STEP 1: Deterministic detection
    # ------------------------------------------------

    rule_based_threats = detect_security_signals(
        request.transcript,
        request.requested_action
    )

    # ------------------------------------------------
    # STEP 2: Local AI analysis
    # ------------------------------------------------

    prompt = f"""
You are the VoiceShield cybersecurity threat detector.

Analyze this voice-agent conversation.

Transcript:
{request.transcript}

Requested action:
{request.requested_action}

User role:
{request.user_role}

Previous risk:
{request.previous_risk}

Possible threat categories:

prompt_injection
social_engineering
authority_impersonation
verification_bypass
credential_theft
account_takeover
sensitive_account_action
sensitive_information_extraction
suspicious_behavior

Return ONLY valid JSON:

{{
    "threats": [],
    "severity": "low"
}}

Severity must be:
low, medium, high, or critical
"""

    try:

        result = call_ollama(prompt)

        ai_result = extract_json(result)

        ai_threats = ai_result.get(
            "threats",
            []
        )

        # Combine deterministic and AI results
        combined_threats = list(
            dict.fromkeys(
                rule_based_threats + ai_threats
            )
        )

        severity = ai_result.get(
            "severity",
            "low"
        )

        # Strong deterministic signals override
        # the model's severity.

        if any(
            threat in combined_threats
            for threat in [
                "prompt_injection",
                "verification_bypass",
                "credential_theft",
                "account_takeover"
            ]
        ):
            severity = "high"

        if (
            "prompt_injection" in combined_threats
            and "verification_bypass" in combined_threats
        ):
            severity = "critical"

        return {
            "threats": combined_threats,
            "threat_count": len(combined_threats),
            "severity": severity
        }

    except Exception as error:

        print(
            "Threat analysis error:",
            error
        )

        # AI failure does NOT disable security.

        severity = (
            "high"
            if rule_based_threats
            else "low"
        )

        return {
            "threats": rule_based_threats,
            "threat_count": len(rule_based_threats),
            "severity": severity
        }


def security_reasoning(
    request: SecurityRequest,
    threat_result: dict
) -> dict:
    """
    Determine the final security decision.

    High-confidence threats are handled
    deterministically. Local AI handles
    less obvious cases.
    """

    threats = threat_result.get(
        "threats",
        []
    )

    severity = threat_result.get(
        "severity",
        "low"
    )

    # ------------------------------------------------
    # SAFE REQUEST
    # ------------------------------------------------

    if (
        not threats
        and request.previous_risk <= 20
    ):
        return {
            "risk_score": 0,
            "confidence": 0.95,
            "decision": "ALLOW",
            "reasoning": (
                "No security threats detected "
                "and the requested action appears safe."
            )
        }

    # ------------------------------------------------
    # CRITICAL THREATS
    # ------------------------------------------------

    critical_threats = {
        "prompt_injection",
        "credential_theft",
        "account_takeover"
    }

    # ------------------------------------------------
    # HIGH-RISK THREATS
    # ------------------------------------------------

    high_risk_threats = {
        "verification_bypass",
        "authority_impersonation"
    }

    # ------------------------------------------------
    # PROMPT INJECTION + HIGH-RISK SIGNAL
    # ------------------------------------------------

    if (
        "prompt_injection" in threats
        and (
            "verification_bypass" in threats
            or "authority_impersonation" in threats
        )
    ):
        return {
            "risk_score": 100,
            "confidence": 0.98,
            "decision": "BLOCK",
            "reasoning": (
                "Multiple high-confidence attack "
                "indicators detected."
            )
        }

    # ------------------------------------------------
    # CRITICAL INDIVIDUAL THREAT
    # ------------------------------------------------

    if any(
        threat in threats
        for threat in critical_threats
    ):
        return {
            "risk_score": 95,
            "confidence": 0.97,
            "decision": "BLOCK",
            "reasoning": (
                "High-confidence security threat detected."
            )
        }

    # ------------------------------------------------
    # HIGH-RISK THREAT
    # ------------------------------------------------

    if any(
        threat in threats
        for threat in high_risk_threats
    ):
        return {
            "risk_score": 85,
            "confidence": 0.94,
            "decision": "BLOCK",
            "reasoning": (
                "Identity or verification controls "
                "are being bypassed."
            )
        }

    # ------------------------------------------------
    # SENSITIVE BUT NOT NECESSARILY MALICIOUS
    # ------------------------------------------------

    if "sensitive_account_action" in threats:
        return {
            "risk_score": 40,
            "confidence": 0.95,
            "decision": "VERIFY",
            "reasoning": (
                "Sensitive account information is "
                "being changed; additional verification "
                "is required."
            )
        }

    # ------------------------------------------------
    # LOCAL AI FOR UNCERTAIN CASES
    # ------------------------------------------------

    prompt = f"""
You are VoiceShield Security Decision Engine.

Decide whether the action should be:

ALLOW
VERIFY
BLOCK

Transcript:
{request.transcript}

Requested action:
{request.requested_action}

User role:
{request.user_role}

Previous risk:
{request.previous_risk}

Detected threats:
{json.dumps(threats)}

Severity:
{severity}

Rules:

ALLOW = clearly safe request

VERIFY = suspicious or sensitive action
that requires additional verification

BLOCK = clearly malicious request,
credential theft, account takeover,
prompt injection, or verification bypass

Return ONLY JSON:

{{
    "risk_score": 0,
    "confidence": 0.0,
    "decision": "VERIFY",
    "reasoning": "short explanation"
}}

risk_score must be between 0 and 100.

confidence must be between 0 and 1.
"""

    try:

        result = call_ollama(prompt)

        reasoning = extract_json(result)

        return {
            "risk_score": reasoning.get(
                "risk_score",
                30
            ),
            "confidence": reasoning.get(
                "confidence",
                0.6
            ),
            "decision": reasoning.get(
                "decision",
                "VERIFY"
            ),
            "reasoning": reasoning.get(
                "reasoning",
                "Additional verification recommended."
            )
        }

    except Exception as error:

        print(
            "Security reasoning error:",
            error
        )

        # Safe fallback:
        # never automatically ALLOW when AI fails.

        return {
            "risk_score": 50,
            "confidence": 0.5,
            "decision": "VERIFY",
            "reasoning": (
                "AI analysis unavailable; "
                "manual verification required."
            )
        }