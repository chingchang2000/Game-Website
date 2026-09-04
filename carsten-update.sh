#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/arcadeforge"
SERVICE_NAME="arcadeforge"
SERVICE_USER="arcadeforge"
ENV_FILE="/etc/arcadeforge.env"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Kør updateren med sudo:"
  echo "  sudo bash carsten-update.sh"
  exit 1
fi

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "ArcadeForge er ikke installeret i ${APP_DIR}."
  echo "Kør carsten-install.sh først."
  exit 1
fi

echo "[1/4] Henter nyeste version fra GitHub..."
git -C "${APP_DIR}" fetch origin main
git -C "${APP_DIR}" checkout main
git -C "${APP_DIR}" reset --hard origin/main
chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}"

echo "[2/4] Opdaterer dependencies..."
cd "${APP_DIR}"
sudo -u "${SERVICE_USER}" npm install --omit=dev --no-audit --no-fund

echo "[3/4] Genstarter ArcadeForge..."
systemctl restart "${SERVICE_NAME}"

PORT="$(grep -E '^PORT=' "${ENV_FILE}" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
PORT="${PORT:-3100}"

echo "[4/4] Tester hjemmesiden..."
sleep 2
curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null
echo "✅ ArcadeForge er opdateret og kører."
