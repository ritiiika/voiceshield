# ────────────────────────────────────────────────
# Stage 1: Build React + Vite app
# ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Pass build-time API base if needed
ARG VITE_API_BASE=""
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npm run build


# ────────────────────────────────────────────────
# Stage 2: Minimal Nginx web server
# ────────────────────────────────────────────────
FROM nginx:alpine AS runtime

LABEL org.opencontainers.image.title="voiceshield-dashboard" \
      org.opencontainers.image.description="VoiceShield SOC & Threat Intelligence Dashboard" \
      org.opencontainers.image.version="1.0.0"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
