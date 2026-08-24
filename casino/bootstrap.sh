#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API="$ROOT/api"
PORTAL="$ROOT/portal"
RUNTIME="$ROOT/.runtime"
mkdir -p "$RUNTIME"

cd "$(dirname "$ROOT")"
git submodule update --init --recursive

if [ ! -f "$API/.env" ]; then
  cp "$API/.env.example" "$API/.env"
fi

ADMIN_FILE="$RUNTIME/admin-password.txt"
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  if [ -f "$ADMIN_FILE" ]; then
    ADMIN_PASSWORD="$(cat "$ADMIN_FILE")"
  else
    ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
    printf '%s' "$ADMIN_PASSWORD" > "$ADMIN_FILE"
    chmod 600 "$ADMIN_FILE"
  fi
fi

# Install PHP dependencies without requiring host Composer.
docker run --rm \
  -v "$API:/app" \
  -w /app \
  composer:2 \
  composer install --no-interaction --prefer-dist

cd "$API"

# Keep the imported real-money flow disabled for this build while preserving the full wallet/deposit/withdraw code.
if grep -q '^APP_DEBUG=' .env; then sed -i.bak 's/^APP_DEBUG=.*/APP_DEBUG=false/' .env; fi
if grep -q '^FRONTEND_URL=' .env; then sed -i.bak 's#^FRONTEND_URL=.*#FRONTEND_URL=http://localhost:3000#' .env; fi
if grep -q '^CORS_ALLOWED_ORIGINS=' .env; then sed -i.bak 's#^CORS_ALLOWED_ORIGINS=.*#CORS_ALLOWED_ORIGINS=http://localhost:3000#' .env; fi
rm -f .env.bak

./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate --force
ADMIN_PASSWORD="$ADMIN_PASSWORD" ./vendor/bin/sail artisan migrate --seed --force
./vendor/bin/sail artisan tenant:create crashx "CrashX" --tagline="Casino Platform" --force || true

cd "$ROOT"
docker compose -f "$API/compose.yaml" -f "$ROOT/compose.portal.yml" up -d --build portal

cat <<EOF

Turnkey casino stack is running.
Portal: http://localhost:3000
API health: http://localhost/api/v1/health
Admin password file: $ADMIN_FILE
Admin user: crashx_internal_admin
Admin path: read ADMIN_PANEL_PATH from $API/.env

EOF
