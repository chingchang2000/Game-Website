#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="https://github.com/chingchang2000/Game-Website.git"
APP_DIR="/opt/arcadeforge"
SERVICE_NAME="arcadeforge"
SERVICE_USER="arcadeforge"
ENV_FILE="/etc/arcadeforge.env"
PORT="${ARCADEFORGE_PORT:-3100}"
HOST="${ARCADEFORGE_HOST:-127.0.0.1}"
PROXY_ALLOWLIST_VALUE="${PROXY_ALLOWLIST:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Kør installeren med sudo:"
  echo "  sudo bash carsten-install.sh"
  exit 1
fi

echo "[1/7] Installerer systempakker..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y git curl ca-certificates

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)"
fi

if [[ "${node_major}" -lt 20 ]]; then
  echo "[2/7] Installerer Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  echo "[2/7] Node.js $(node --version) er allerede installeret."
fi

echo "[3/7] Opretter service-bruger og henter ArcadeForge..."
if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${SERVICE_USER}"
fi

if [[ -d "${APP_DIR}/.git" ]]; then
  git -C "${APP_DIR}" fetch origin main
  git -C "${APP_DIR}" checkout main
  git -C "${APP_DIR}" reset --hard origin/main
else
  rm -rf "${APP_DIR}"
  git clone --branch main --depth 1 "${REPO_URL}" "${APP_DIR}"
fi
chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}"

echo "[4/7] Installerer Node-afhængigheder..."
cd "${APP_DIR}"
sudo -u "${SERVICE_USER}" npm install --omit=dev --no-audit --no-fund

echo "[5/7] Skriver server-indstillinger..."
if [[ ! -f "${ENV_FILE}" ]]; then
  {
    printf 'NODE_ENV=production\n'
    printf 'HOST=%s\n' "${HOST}"
    printf 'PORT=%s\n' "${PORT}"
    printf 'PROXY_ALLOWLIST=%s\n' "${PROXY_ALLOWLIST_VALUE}"
  } > "${ENV_FILE}"
  chmod 640 "${ENV_FILE}"
  chown root:"${SERVICE_USER}" "${ENV_FILE}"
else
  echo "Beholder eksisterende ${ENV_FILE}."
fi

echo "[6/7] Opretter systemd-service..."
cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=ArcadeForge Game Website
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=-${ENV_FILE}
ExecStart=/usr/bin/node ${APP_DIR}/server.js
Restart=on-failure
RestartSec=3
TimeoutStopSec=15
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"

echo "[7/7] Tester ArcadeForge..."
sleep 2
if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null; then
  echo
  echo "✅ ArcadeForge kører på Carsten."
  echo "Intern adresse til NexusHost/Nginx/Cloudflare: http://127.0.0.1:${PORT}"
  echo
  echo "Nyttige kommandoer:"
  echo "  sudo systemctl status ${SERVICE_NAME}"
  echo "  sudo journalctl -u ${SERVICE_NAME} -f"
  echo "  sudo bash ${APP_DIR}/carsten-update.sh"
  echo
  echo "Hvis du bruger NexusHost: opret siden med backend 127.0.0.1 og port ${PORT}."
  echo "Hvis du bruger Cloudflare Tunnel: service URL skal være http://127.0.0.1:${PORT}"
else
  echo "❌ Servicen startede ikke korrekt."
  systemctl --no-pager --full status "${SERVICE_NAME}" || true
  journalctl -u "${SERVICE_NAME}" -n 80 --no-pager || true
  exit 1
fi
