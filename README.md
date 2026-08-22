VoiceShield --- AI Voice Agent Security & Threat Defense Platform

VoiceShield is an AI-powered voice security and threat-defense platform
designed to analyze voice interactions, identify suspicious or high-risk
requests, and support security decisions through an interactive
SOC-style dashboard.

The project combines a React/Vite frontend with a FastAPI/Python backend
and an AI processing pipeline using speech-to-text, agent-based
reasoning, and Redis-backed risk memory.

🚀 Live Project

GitHub Repository: https://github.com/ritiiika/voiceshield

Vercel Project:
https://vercel.com/ritiiikas-projects/voiceshield

Backend (Render): https://voiceshield-zv5v.onrender.com

Note: The Vercel URL above is the Vercel project page. For a
public website link in a submission form, use the generated
*.vercel.app deployment URL from the Vercel dashboard.

👥 Team

Member                            Registration No. Contribution

Ritika                                12310039 Full-stack
integration,
backend/API
development, AI
processing pipeline,
security logic,
deployment and
project integration

🎯 Problem Statement

Voice-based interactions can be abused through social engineering,
authority impersonation, credential harvesting, urgency-based
manipulation, and other attack patterns.

VoiceShield aims to provide an additional security layer by:

Converting voice input into text.

Analyzing the request using an AI/agent pipeline.

Classifying potential threat categories.

Generating a risk score.

Producing an allow, verify, or block security decision.

Maintaining security/risk information for dashboard analysis.

Presenting the results through a SOC-style monitoring interface.

✨ Key Features

🎙️ Voice Threat Analysis

Upload or process voice samples.

Speech-to-text processing using Faster-Whisper.

Analyze the resulting transcript through the security/agent
pipeline.

🛡️ Security Decision Engine

The dashboard represents security decisions such as:

ALLOW --- request considered safe.

VERIFY --- additional verification is required.

BLOCK --- request is considered suspicious/high risk.

📊 Risk Scoring

Voice interactions can be represented using a numerical risk score from
0--100.

The dashboard includes:

Average risk

High-risk call count

Risk-score telemetry

Decision ratios

Threat-category classification

🔎 Threat Classification

The dashboard supports security-oriented categories such as:

Authority Impersonation

Urgency Pressure

Credential Harvesting

Financial Adjustment

Normal requests

🖥️ SOC Dashboard

The frontend provides a security operations style interface containing:

SOC overview

Live Voice Lab

Security Call Log

System Architecture view

Risk telemetry

Threat classification

Decision statistics

Active security policies

Recent voice intercept records

Search and filtering

CSV export functionality

🏗️ System Architecture

                         ┌─────────────────────┐
                         │      User / SOC      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + Vite        │
                         │ Security Dashboard   │
                         └──────────┬──────────┘
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │ FastAPI Backend     │
                         │ API / Security      │
                         │ Routes              │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐  ┌──────────────┐  ┌─────────────┐
             │ Faster-    │  │ LangGraph /  │  │ Redis       │
             │ Whisper    │  │ AI Agent     │  │ Risk Memory │
             │ STT        │  │ Pipeline     │  │             │
             └────────────┘  └──────────────┘  └─────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Security Decision   │
                         │ Risk + Threat Type  │
                         │ + Confidence        │
                         └─────────────────────┘

🧰 Technology Stack

Frontend

React

Vite

JavaScript / JSX

CSS

Tailwind CSS

Component-based UI architecture

Backend

Python

FastAPI

Uvicorn

Pydantic

SQLAlchemy

PostgreSQL / psycopg2

Redis

AI / Voice Processing

Faster-Whisper

LangChain

LangGraph

OpenAI integration

ONNX Runtime

CTranslate2

Deployment

GitHub --- source-code repository

Vercel --- frontend deployment/project

Render --- backend deployment

📁 Project Structure

voiceshield/
│
├── voiceshield-backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── redis_client.py
│   │
│   ├── dashboard/
│   ├── tests/
│   ├── test_audio/
│   ├── init_db.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── voiceshield-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md

⚙️ Local Setup

1. Clone the repository

git clone https://github.com/ritiiika/voiceshield.git
cd voiceshield

2. Backend setup

cd voiceshield-backend
python -m venv venv

Activate the virtual environment on Windows:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create your environment file:

.env

Use .env.example as the template.

Start the FastAPI server:

uvicorn app.main:app --reload

The backend will normally be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

3. Frontend setup

Open another terminal:

cd voiceshield-dashboard
npm install
npm run dev

The Vite development server will normally run at:

http://127.0.0.1:5173

🔐 Environment Variables

Do not commit real API keys, database passwords, or other secrets.

Create:

.env

and keep it excluded using .gitignore.

Use:

.env.example

to document the required environment-variable names without exposing
secret values.

Typical project configuration may include values for:

OPENAI_API_KEY
DATABASE_URL
REDIS_URL

Only add variables that are actually required by your current
implementation.

🧪 Testing

The backend repository contains test/evaluation files including:

test_agent.py
test_redis.py
test_transcription.py
tests/

The project also includes evaluation cases for checking the behavior of
the security/voice-analysis pipeline.

Before deployment, verify:

Backend starts successfully.

Frontend starts successfully.

Frontend can communicate with the backend.

Voice/audio processing works.

Risk analysis returns a decision.

Redis/database connectivity works where configured.

No secrets are present in the Git repository.

📡 Backend API

The backend is implemented using FastAPI and exposes API routes for the
VoiceShield application.

For a running local backend, interactive API documentation can be viewed
at:

http://127.0.0.1:8000/docs

For the deployed backend:

https://voiceshield-zv5v.onrender.com

Available endpoints may depend on the current backend implementation.
Use the FastAPI /docs page as the authoritative list of deployed API
routes.

📊 Dashboard Modules

SOC Overview

Provides a high-level view of:

Total inbound calls

Allowed calls

Verification-required calls

Blocked calls

Average risk

High-risk calls

Threat categories

Live Voice Lab

Used to test voice/audio input against the backend processing pipeline.

Security Call Log

Displays analyzed interactions with information such as:

Call ID

Caller

Requested action

Threat category

Risk score

Decision

Confidence

Timestamp

Risk Telemetry

Visualizes risk scores across recent voice-agent sessions and highlights
high-risk thresholds.

Active Policies

The dashboard represents policies for actions such as:

Authority spoofing

OTP exfiltration

Urgency pressure

Account changes

Informational queries

🛡️ Security Considerations

VoiceShield is a project/prototype for demonstrating AI-assisted voice
security analysis.

Important security practices:

Never commit .env.

Never publish API keys in .env.example.

Rotate any credential that has accidentally been exposed.

Use environment variables for deployment secrets.

Validate and sanitize uploaded audio/input.

Restrict production CORS configuration.

Use authentication/authorization for sensitive production endpoints.

Protect database and Redis credentials.

Review AI-generated security decisions before using them for
real-world enforcement.

☁️ Deployment

Frontend --- Vercel

The frontend is intended to be deployed through Vercel.

General deployment flow:

GitHub Repository
       │
       ▼
Vercel
       │
       ▼
React/Vite Dashboard

Backend --- Render

The backend is deployed through Render.

GitHub Repository
       │
       ▼
Render
       │
       ▼
FastAPI Backend

Backend deployment URL:

https://voiceshield-zv5v.onrender.com

📸 Dashboard Preview

The project dashboard provides a SOC-style interface with:

Active Sentinel defense status

Risk metrics

Threat classification

Decision ratio

Risk telemetry

Live Voice Threat Testing Lab

Recent Voice Intercept Log

👩‍💻 Individual Contributions

Ritika --- 12310039

Backend and full-stack project integration

FastAPI backend development

API and service integration

Voice-processing pipeline integration

Faster-Whisper transcription integration

LangGraph/LangChain agent pipeline integration

Redis/risk-memory integration

Database integration

Security decision/risk-analysis workflow

GitHub repository setup and project integration

Deployment coordination for backend and frontend

Avantika Gupta --- 12320700

Frontend dashboard development

React/Vite implementation

SOC dashboard layout

Reusable UI components

Risk and threat visualization

Call-log presentation

Dashboard navigation

Frontend API integration

User-facing project presentation and interface refinement

📌 Current Deployment Links

Component        Link

GitHub           https://github.com/ritiiika/voiceshield
Vercel Project   https://vercel.com/ritiiikas-projects/voiceshield
Render Backend   https://voiceshield-zv5v.onrender.com

⚠️ Disclaimer

VoiceShield is an academic/project prototype intended to demonstrate
AI-assisted voice security analysis and threat detection concepts.

Risk scores and security decisions produced by the system should not be
treated as guaranteed or fully autonomous security judgments in a real
production environment without appropriate validation, monitoring, and
human oversight.

📄 Submission Information

Project: VoiceShield --- AI Voice Agent Security & Threat Defense
Platform

Ritika
Registration No.: 12310039

Avantika Gupta
Registration No.: 12320700
