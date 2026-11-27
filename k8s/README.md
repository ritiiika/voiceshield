# VoiceShield Kubernetes (K8s) Deployment Guide

This directory contains the production-ready Kubernetes manifests to run **VoiceShield** (Core FastAPI Backend, Cybersecurity SOC Dashboard, and Redis Cache) on a local cluster (**Minikube** or **kind**), with declarative ConfigMaps, Secrets, health probes (liveness & readiness), and Horizontal Pod Autoscaling (HPA).

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       User Browser / Client           |
                      +---------------------------------------+
                                          |
                                   NodePort :30080
                                          v
                      +---------------------------------------+
                      | Service: voiceshield-dashboard (:80)  |
                      +---------------------------------------+
                                          |
                        Deployment: voiceshield-dashboard
                                          | (Internal Reverse Proxy)
                                          v
                      +---------------------------------------+
                      |   Service: voiceshield-api (:8000)    |
                      +---------------------------------------+
                                          |
                        Deployment: voiceshield-api (2 to 5 Pods)
                               [Autoscaled via HPA]
                                          |
                                          v
                      +---------------------------------------+
                      |  Service: voiceshield-redis (:6379)   |
                      +---------------------------------------+
                                          |
                          Deployment: voiceshield-redis
```

---

## Manifest Inventory

| File | Resource Kind | Description |
|---|---|---|
| `00-namespace.yaml` | `Namespace` | Creates isolated `voiceshield` namespace |
| `01-configmap.yaml` | `ConfigMap` | Non-sensitive configs (`MODEL_NAME`, `OLLAMA_URL`, `LOG_LEVEL`, `CORS`) |
| `02-secret.yaml` | `Secret` | Sensitive credentials (`DATABASE_URL`, `REDIS_URL`, `OPENAI_API_KEY`) |
| `03-redis.yaml` | `Deployment` & `Service` | In-cluster Redis cache with `redis-cli ping` probes |
| `04-backend.yaml` | `Deployment` & `Service` | FastAPI Backend with `/health` liveness & `/health/ready` readiness probes |
| `05-dashboard.yaml` | `Deployment` & `Service` | Frontend Nginx SPA dashboard exposed via NodePort `30080` |
| `06-backend-hpa.yaml` | `HorizontalPodAutoscaler` | HPA scaling backend from 2 to 5 replicas based on 70% CPU target |
| `kustomization.yaml` | `Kustomization` | Unified deployment bundle (`kubectl apply -k k8s/`) |

---

## Quick Start (Minikube)

### 1. Start Minikube & Enable Metrics Server

```bash
# Start Minikube with the Docker driver
minikube start --driver=docker

# Enable metrics-server (required for HPA to collect CPU metrics)
minikube addons enable metrics-server
```

### 2. Load Local Docker Images into Minikube

If your images are built locally on your machine, load them into the Minikube runtime:

```bash
minikube image load voiceshield-voiceshield-api:latest
minikube image load voiceshield-voiceshield-dashboard:latest
minikube image load redis:7-alpine
```

*(Alternatively, use `eval $(minikube docker-env)` to build images directly inside the Minikube environment).*

### 3. Deploy the Full Stack

```bash
kubectl apply -k k8s/
```

### 4. Verify Pods, Services, and Probes

```bash
# Watch Pods transition from ContainerCreating to Running
kubectl get pods -n voiceshield -w

# Check services and allocated ports
kubectl get svc -n voiceshield

# Check Horizontal Pod Autoscaler status
kubectl get hpa -n voiceshield
```

Expected output:
```text
NAME                                     READY   STATUS    RESTARTS   AGE
voiceshield-api-74c8b679f6-abcd1         1/1     Running   0          45s
voiceshield-api-74c8b679f6-abcd2         1/1     Running   0          45s
voiceshield-dashboard-578d85f8cf-xyz12   1/1     Running   0          45s
voiceshield-redis-6d65c95786-qwer3       1/1     Running   0          45s
```

---

## Accessing the Dashboard

### Option A: Minikube Service URL (Direct)
```bash
minikube service voiceshield-dashboard -n voiceshield
```

### Option B: Port Forwarding
```bash
kubectl port-forward svc/voiceshield-dashboard -n voiceshield 3000:80
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Load Testing & Testing HPA Autoscaling

The Horizontal Pod Autoscaler (`voiceshield-api-hpa`) is configured with:
* **Target:** `70%` average CPU utilization
* **Min Replicas:** `2`
* **Max Replicas:** `5`

### 1. Watch HPA Status in One Terminal:
```bash
kubectl get hpa voiceshield-api-hpa -n voiceshield --watch
```

### 2. Launch a Simulated Load Generator Pod in Another Terminal:
```bash
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -n voiceshield -- /bin/sh -c "while sleep 0.01; do wget -q -O- http://voiceshield-api:8000/health; done"
```

### 3. Observe Scale-Out:
Within 30–60 seconds, CPU utilization will cross 70%, and HPA will automatically scale the backend from 2 replicas to 3, 4, or 5 replicas. Once the load generator is stopped (`Ctrl + C`), HPA will smoothly scale back down to 2 replicas after the stabilization window.

---

## Clean Up

To delete all resources from the cluster:
```bash
kubectl delete -k k8s/
```
