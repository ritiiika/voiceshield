# VoiceShield — DevOps & Cloud Deployment Guide

This guide covers everything you need to run, test, containerize, and deploy VoiceShield locally and to the cloud.

---

## 🏗️ Architecture Overview

```
                      [ Internet / Caller Client ]
                                   │
                                   ▼
             ┌───────────────────────────────────────────┐
             │       Nginx Reverse Proxy / Ingress       │
             └─────────────────────┬─────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
    ┌───────────────────────────┐       ┌───────────────────────────┐
    │   voiceshield-dashboard   │       │      voiceshield-api      │
    │  (React + Vite on Nginx)  │       │     (FastAPI Python 3.11) │
    │         Port 3000         │       │         Port 8000         │
    └───────────────────────────┘       └─────────────┬─────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
          ┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
          │    Supabase PostgreSQL    │ │     Redis Cloud / Cache   │ │   Ollama / Qwen2.5 LLM    │
          │  Call & Threat Analytics  │ │    Historical Risk Memory │ │  Security Reasoning Engine │
          └───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

---

## 🚀 Quickstart: Local Docker Deployment

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ensure your `voiceshield-backend/.env` is configured with valid `DATABASE_URL` and `REDIS_URL`

### 1. Start All Services (Backend + Dashboard)
From the root repository directory:
```bash
docker compose up --build -d
```

### 2. Verify Container Health
```bash
docker compose ps
```
Both `voiceshield-api` and `voiceshield-dashboard` will show `(healthy)`.

### 3. Access Services
- **SOC Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Liveness Probe**: [http://localhost:8000/health](http://localhost:8000/health)
- **Readiness Probe**: [http://localhost:8000/health/ready](http://localhost:8000/health/ready)

### 4. Full Offline Mode (Local Redis + Local Ollama)
If you want to run completely locally without cloud Redis or an external Ollama server:
```bash
docker compose --profile local-redis --profile local-ai up --build -d
```

### 5. Stop Containers
```bash
docker compose down
```

---

## 🔄 CI/CD Pipeline & GitHub Container Registry (GHCR)

The automated workflow is located at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Pipeline Stages
1. **Lint & Code Style Check**: Runs `ruff` on the Python codebase.
2. **Unit & Security Tests**: Runs `pytest` executing 11+ deterministic security and endpoint checks.
3. **Container Security Scan**: Runs Aqua Security `trivy` to detect container CVEs.
4. **Build & Publish to GHCR**: Builds multi-platform Docker images and publishes to GitHub Container Registry:
   ```
   ghcr.io/<your-github-username>/voiceshield/voiceshield-api:latest
   ghcr.io/<your-github-username>/voiceshield/voiceshield-api:sha-<commit>
   ```
5. **Continuous Deployment**: Optional automated trigger for Render or cloud host webhooks.

### Pushing Changes to Trigger CI/CD
```bash
git add .
git commit -m "feat: add Docker, CI/CD pipeline, and cloud deployment configs"
git push origin main
```
View the live workflow progress in your GitHub repository under **Actions**.

---

## ☁️ Cloud Deployment Options

### Option A: Render (Recommended for 1-Click Deployment)
VoiceShield includes a native [`render.yaml`](render.yaml) blueprint.

1. Push your repository to GitHub.
2. Log in to [Render](https://render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your `voiceshield` repository.
5. In the Environment Variables settings, fill in:
   - `DATABASE_URL`: Your Supabase connection string
   - `REDIS_URL`: Your Redis Cloud connection string
   - `OLLAMA_URL`: URL to your Ollama or LLM service (see below)
6. Click **Apply**. Render will automatically build the container and deploy the API with zero downtime.

---

### Option B: Deploying the Container from GHCR to a Cloud VM (AWS EC2 / DigitalOcean / Hetzner)

1. SSH into your cloud virtual machine:
   ```bash
   ssh ubuntu@your-server-ip
   ```
2. Pull and run the published image from GitHub Container Registry:
   ```bash
   # Log in to GHCR
   echo $CR_PAT | docker login ghcr.io -u <your-username> --password-stdin

   # Pull the latest image
   docker pull ghcr.io/<your-username>/voiceshield/voiceshield-api:latest

   # Run container
   docker run -d \
     --name voiceshield-api \
     -p 8000:8000 \
     --restart unless-stopped \
     -e DATABASE_URL="your-supabase-url" \
     -e REDIS_URL="your-redis-url" \
     -e OLLAMA_URL="http://your-ollama-host:11434/api/generate" \
     ghcr.io/<your-username>/voiceshield/voiceshield-api:latest
   ```

---

## 🧠 Handling Ollama & the Qwen Model in the Cloud

VoiceShield uses a hybrid security model:
1. **Deterministic Rule Engine**: High-confidence detection (prompt injection, authority impersonation, credential harvesting) runs instantly on CPU with zero latency.
2. **Qwen 2.5 LLM**: Runs for edge cases via Ollama.

### In the Cloud, choose one of these setups:
- **Cloud VM with GPU (RunPod / Vast.ai / AWS EC2 g4dn)**:
  Run Ollama on the server alongside VoiceShield:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ollama run qwen2.5:1.5b-instruct-q4_0
  ```
  Set `OLLAMA_URL=http://localhost:11434/api/generate` in your `.env`.

- **Separate Ollama Remote Server**:
  Expose Ollama behind an authenticated reverse proxy or Cloudflare Tunnel:
  Set `OLLAMA_URL=https://ollama.yourdomain.com/api/generate`.

- **Deterministic Fallback (Zero Extra Cost)**:
  If Ollama is unreachable, VoiceShield's built-in fallback automatically takes over safely, flagging ambiguous requests with `VERIFY` without crashing.

---

## 🔍 Monitoring & Health Verification

### 1. Live Endpoint Checks
```bash
# Liveness Probe (Web process check)
curl http://localhost:8000/health

# Readiness Probe (Database & Redis connection check)
curl http://localhost:8000/health/ready
```

### 2. Live Container Logs
```bash
# Stream API logs
docker compose logs -f voiceshield-api

# Stream Dashboard logs
docker compose logs -f voiceshield-dashboard
```

Structured JSON logging captures:
- Request method, path, status code
- Processing time in milliseconds (`X-Process-Time-Ms`)
- Exception stack traces (sanitized without logging raw voice audio or caller credentials)

---

## ☸️ Kubernetes Deployment (Local Minikube / kind)

VoiceShield includes production-grade Kubernetes manifests inside the `k8s/` directory.

### Architecture in Kubernetes:
- **Namespace:** `voiceshield`
- **ConfigMap & Secret:** Externalized configuration (`voiceshield-config`, `voiceshield-secret`)
- **Redis Cache:** In-cluster ClusterIP service on `voiceshield-redis:6379` with `redis-cli ping` probes
- **FastAPI Backend (2–5 Pods):** Monitored by HTTP liveness (`/health`) and readiness (`/health/ready`) probes, auto-scaled via HPA based on 70% CPU target
- **SOC Dashboard (Nginx):** Exposed via NodePort `30080` (or Port Forward), internally proxying to `voiceshield-api:8000`

### 1. Start Minikube & Enable Metrics Server
```bash
minikube start --driver=docker
minikube addons enable metrics-server
```

### 2. Load Local Images into Cluster
```bash
minikube image load voiceshield-voiceshield-api:latest
minikube image load voiceshield-voiceshield-dashboard:latest
minikube image load redis:7-alpine
```

### 3. Deploy Stack
```bash
kubectl apply -k k8s/
```

### 4. Verify Resources
```bash
kubectl get pods,svc,hpa -n voiceshield
```

### 5. Access Dashboard
```bash
minikube service voiceshield-dashboard -n voiceshield
# Or port-forward directly:
kubectl port-forward svc/voiceshield-dashboard -n voiceshield 3000:80
```
