
#!/bin/bash
set -euo pipefail

# --- swap, because this server has little RAM ---
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# --- Docker ---
apt-get update
apt-get install -y docker.io docker-compose-v2 curl
systemctl enable --now docker
usermod -aG docker ubuntu

# --- app folder ---
install -d -o ubuntu -g ubuntu /home/ubuntu/pulsefit
cd /home/ubuntu/pulsefit

cat > docker-compose.yml <<'EOF'
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    command: ["mongod", "--wiredTigerCacheSizeGB", "0.25"]
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    image: abusufiyan70/pulsefit-server:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongo:27017/pulsefit
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:?set it in .env}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?set it in .env}
      CLIENT_URL: ${CLIENT_URL:?set it in .env}
      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      mongo:
        condition: service_healthy

  client:
    image: abusufiyan70/pulsefit-client:${IMAGE_TAG:-latest}
    restart: unless-stopped
    depends_on:
      server:
        condition: service_healthy

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      DOMAIN: ${DOMAIN:?set it in .env}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      client:
        condition: service_healthy

volumes:
  mongo_data:
  uploads_data:
  caddy_data:
  caddy_config:
EOF

cat > Caddyfile <<'EOF'
{$DOMAIN} {
	reverse_proxy client:8080
}
EOF

PUBLIC_IP=$(curl -s https://checkip.amazonaws.com | tr -d '\n')
DOMAIN="${PUBLIC_IP//./-}.sslip.io"

cat > .env <<EOF
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
DOMAIN=${DOMAIN}
CLIENT_URL=https://${DOMAIN}
GEMINI_API_KEY=
EOF
chmod 600 .env

cat > deploy.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd ~/pulsefit
export IMAGE_TAG="${1:-latest}"
docker compose pull
docker compose up -d --wait
docker compose ps
echo "Deployed tag: $IMAGE_TAG"
EOF
chmod +x deploy.sh

chown -R ubuntu:ubuntu /home/ubuntu/pulsefit

# --- start the app and load the demo data ---
docker compose up -d --wait
docker compose exec -T server node scripts/seed.js