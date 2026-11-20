# VoiceShield 🛡️ — AI Voice Agent Security & Threat Defense Platform

[![CI/CD Pipeline](https://github.com/ritiiika/voiceshield/actions/workflows/ci.yml/badge.svg)](https://github.com/ritiiika/voiceshield/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage%20Builds-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GHCR Registry](https://img.shields.io/badge/Container%20Registry-GHCR.io-black?logo=github&logoColor=white)](https://github.com/ritiiika/voiceshield/pkgs/container/voiceshield-api)
[![Security Scan](https://img.shields.io/badge/Security%20Scan-Trivy%20Passed-00C7B7?logo=aquasecurity&logoColor=white)](https://trivy.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Redis Cloud](https://img.shields.io/badge/Cache-Redis%20Cloud-DC382D?logo=redis&logoColor=white)](https://redis.io/)

VoiceShield is an enterprise-grade AI cybersecurity intelligence platform engineered to monitor, transcribe, analyze, and defend voice interactions against social engineering, credential harvesting, voice spoofing, and prompt injection attacks in real time.

Built with an automated **DevOps CI/CD pipeline**, containerized with **Docker & Docker Compose**, scanned with **Trivy**, and published to **GitHub Container Registry (GHCR)** for cloud deployment.

---

## 🚀 Live Deployments & Registry

| Service | Target Platform | Link / Image |
| :--- | :--- | :--- |
| **GitHub Repository** | Source Control & CI/CD | [github.com/ritiiika/voiceshield](https://github.com/ritiiika/voiceshield) |
| **Backend API** | Render Cloud | [voiceshield-zv5v.onrender.com](https://voiceshield-zv5v.onrender.com) |
| **Frontend SOC Dashboard** | Vercel Cloud | [voiceshield.vercel.app](https://vercel.com/ritiiikas-projects/voiceshield) |
| **API Container Image** | GitHub Container Registry | `ghcr.io/ritiiika/voiceshield/voiceshield-api:latest` |
| **API Documentation** | Swagger / OpenAPI | [voiceshield-zv5v.onrender.com/docs](https://voiceshield-zv5v.onrender.com/docs) |

---

## 🏗️ DevOps & Cloud Architecture

```
                                 [ Developer Push ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │         GitHub Actions CI/CD          │
                     │       (.github/workflows/ci.yml)      │
                     └───────────────────┬───────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│   1. Lint Job    │           │   2. Test Job    │           │ 3. Security Scan │
│   Ruff (E, F)    │           │  11 Unit Tests   │           │   Trivy Vulner-  │
│   Code Style     │           │  Pytest (Py3.12) │           │   ability Scan   │
└──────────────────┘           └──────────────────┘           └──────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │        4. Buildx Multi-Stage          │
                     │          Build & Publish              │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │    GitHub Container Registry (GHCR)   │
                     │ ghcr.io/ritiiika/voiceshield-api:lat. │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │      5. Automated Cloud Deploy        │
                     │   Render / Railway Webhook Trigger    │
                     └───────────────────────────────────────┘
```

### Runtime Container Stack (`docker-compose.yml`)

```
               ┌────────────────────────────────────────────────────────┐
               │              Inbound Web Client (Port 3000)            │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
             ┌────────────────────────────────────────────────────────────┐
             │ voiceshield-dashboard (Nginx:Alpine)                       │
             │ - Gzip compression & SPA HTML5 routing                     │
             │ - Reverse-Proxy: /voice/ & /security/ ─────────────┐       │
             └────────────────────────────────────────────────────┼───────┘
                                                                  │
                                      Internal Docker Network     ▼
             ┌────────────────────────────────────────────────────────────┐
             │ voiceshield-api (Python 3.12-slim / Uvicorn :8000)         │
             │ - Non-root security user (appuser)                         │
             │ - Structured Request Logging Middleware (X-Process-Time-Ms)│
             │ - Health Liveness (/health) & Readiness (/health/ready)    │
             └──────┬──────────────────────┬──────────────────────┬───────┘
                    │                      │                      │
                    ▼                      ▼                      ▼
         ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
         │ Supabase PostgreSQL│ │    Redis Cloud     │ │ Local/Remote Ollama│
         │ Database Storage   │ │ Threat Risk Memory │ │ Qwen AI Reasoning  │
         └────────────────────┘ └────────────────────┘ └────────────────────┘
```

---

## 🧰 Full DevOps & Cloud Technology Stack

### Cloud & DevOps Infrastructure
- **Containerization**: Docker, Docker Compose, Multi-stage builds (`python:3.12-slim`, `node:20-alpine`, `nginx:alpine`).
- **Container Hardening**: Non-root container execution (`appuser:appuser`), stripped build layers, `.dockerignore` sanitization.
- **CI/CD Automation**: GitHub Actions (`.github/workflows/ci.yml`) running matrix verification across linting, unit testing, vulnerability scanning, and automated deployment.
- **Security Scanning**: Aqua Security **Trivy** scanning for CVEs and HIGH/CRITICAL image vulnerabilities.
- **Container Registry**: **GitHub Container Registry (GHCR)** with semantic Git commit SHA and `latest` tagging.
- **Observability & Probes**:
  - Request timing middleware injects `X-Process-Time-Ms` response header.
  - Liveness probe at `GET /health`.
  - Readiness probe at `GET /health/ready` verifying live connectivity to Supabase and Redis Cloud.
- **Infrastructure as Code**:
  - `render.yaml`: Render Blueprint for 1-click cloud service deployment.
  - `Procfile`: PaaS specification for Railway / Heroku.
  - `docker-compose.yml`: Local full-stack replication with isolated bridge network.

### Backend Intelligence
- **Framework**: Python 3.12, FastAPI, Uvicorn (ASGI).
- **Speech-to-Text**: Faster-Whisper (CTranslate2, ONNX Runtime).
- **Agent Orchestration**: LangGraph, LangChain Core.
- **Threat Reasoning**: Qwen 2.5 Instruct via Ollama (with deterministic rule-based fallback).
- **Database & Cache**: Supabase PostgreSQL (SQLAlchemy ORM), Redis Cloud (Risk Memory & Telemetry).

### Frontend SOC Dashboard
- **Framework**: React 18, Vite.
- **UI & Visualization**: Tailwind CSS, Lucide React, Recharts (Threat Ratios & Risk Telemetry).
- **Reverse Proxy**: Nginx Alpine with custom `proxy_pass` configuration and gzip compression.

---

## ⚙️ Quick Start with Docker

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+ recommended)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/ritiiika/voiceshield.git
cd voiceshield
```

### 3. Configure Environment Variables
Copy the template to create your `.env`:
```bash
cp voiceshield-backend/.env.example .env
```
Fill in your database and cache credentials in `.env`:
```env
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-region.pooler.supabase.com:6543/postgres
REDIS_URL=redis://default:xxx@redis-12345.redns.redis-cloud.com:12345
OLLAMA_URL=http://host.docker.internal:11434/api/generate
MODEL_NAME=qwen2.5:1.5b-instruct-q4_0
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Launch Full Stack with Docker Compose
```bash
docker compose up -d --build
```

Verify running containers:
```bash
docker compose ps
```

Access the services:
- **SOC Intelligence Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Core API**: [http://localhost:8000](http://localhost:8000)
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 5. Pull Directly from GitHub Container Registry (GHCR)
```bash
docker pull ghcr.io/ritiiika/voiceshield/voiceshield-api:latest
docker run -d -p 8000:8000 --env-file .env ghcr.io/ritiiika/voiceshield/voiceshield-api:latest
```

---

## 🧪 Testing & Code Quality

### Run Unit & Security Test Suite
The automated test suite runs 11 verification tests covering deterministic attack signals, prompt injection defense, credential theft, and API status codes:

```bash
cd voiceshield-backend
pytest tests/test_unit.py tests/test_api_endpoints.py -v
```

### Run Static Analysis & Linter (Ruff)
```bash
ruff check voiceshield-backend/app voiceshield-backend/tests --select E,F --ignore E501
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth / Input |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Service root & version metadata | Public |
| `GET` | `/health` | Kubernetes/Docker liveness probe | Returns HTTP 200 `healthy` |
| `GET` | `/health/ready` | Readiness probe (validates DB & Redis) | Returns `connected` status |
| `POST` | `/voice/analyze` | Transcribes audio & evaluates voice security | Audio file (`multipart/form-data`) |
| `POST` | `/security/analyze` | Analyzes text transcript & caller role | JSON payload (`SecurityRequest`) |
| `GET` | `/voice/calls` | Fetches recent historical call intercepts | Query param `limit` (default 50) |

---

## 📁 Repository Structure

```
voiceshield/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD Pipeline (Lint, Test, Trivy, GHCR)
├── voiceshield-backend/
│   ├── app/
│   │   ├── models/              # SQLAlchemy Database Models (CallAnalysis)
│   │   ├── routes/              # FastAPI Endpoints (/voice, /security)
│   │   ├── schemas/             # Pydantic Request & Response Schemas
│   │   ├── services/            # AI Agent, Faster-Whisper, & Threat Reasoning
│   │   ├── database.py          # PostgreSQL Connection Pool & Session Management
│   │   ├── main.py              # Application Entrypoint, Middleware & Health Checks
│   │   └── redis_client.py      # Redis Cloud Risk Memory Client
│   ├── tests/
│   │   ├── test_unit.py         # 9 Threat Vector & Reasoning Unit Tests
│   │   └── test_api_endpoints.py# 2 API Integration Tests
│   ├── Dockerfile               # Multi-stage Python 3.12-slim Containerfile
│   ├── .dockerignore            # Docker build context exclusions
│   ├── pytest.ini               # Pytest Configuration
│   ├── Procfile                 # Railway / Heroku Deployment Spec
│   └── requirements.txt         # Pinned Python Dependencies
├── voiceshield-dashboard/
│   ├── src/
│   │   ├── components/          # Cyber SOC React UI Components
│   │   ├── services/            # Axios API Client & Mock Data
│   │   ├── App.jsx              # Main Dashboard Application
│   │   └── main.jsx             # React Virtual DOM Entrypoint
│   ├── Dockerfile               # Multi-stage Node.js -> Nginx Production Containerfile
│   ├── nginx.conf               # Nginx Reverse-Proxy & Gzip Configuration
│   └── package.json             # Frontend Dependencies & Scripts
├── docker-compose.yml           # Multi-Container Compose Orchestration
├── render.yaml                  # Render Infrastructure Blueprint
├── DEPLOYMENT.md                # Cloud & Operations Runbook
└── README.md                    # Project Documentation
```

---

## 👥 Contributors & Team

| Member | Registration No. | Core Contributions |
| :--- | :--- | :--- |
| **Ritika** | 12310039 | Full-Stack Integration, DevOps CI/CD Pipeline, Docker & Compose Architecture, FastAPI Backend, AI Threat Pipeline, Deployment Coordination |
| **Avantika Gupta** | 12320700 | Frontend SOC Dashboard Development, React/Vite Implementation, Risk Telemetry & Threat Visualization |
| **Harshit Singh** | — | Database Architecture, Supabase PostgreSQL Schema, Models & Data Integration |

---

## 📄 License & Disclaimer

VoiceShield is an academic/hackathon prototype designed to demonstrate AI-assisted cybersecurity threat detection. Security decisions should be combined with human-in-the-loop review in high-stakes environments.
