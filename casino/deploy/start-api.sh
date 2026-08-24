#!/bin/sh
set -eu

if [ -z "${DB_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export DB_URL="$DATABASE_URL"
fi

if [ -z "${DB_URL:-}" ]; then
  echo 'Missing DB_URL or DATABASE_URL' >&2
  exit 1
fi
if [ -z "${APP_KEY:-}" ]; then
  echo 'Missing APP_KEY' >&2
  exit 1
fi
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo 'Missing ADMIN_PASSWORD' >&2
  exit 1
fi

export APP_ENV=production
export APP_DEBUG=false
export DB_CONNECTION=pgsql
export SESSION_DRIVER=database
export CACHE_STORE=database
export QUEUE_CONNECTION=sync
export BROADCAST_CONNECTION=log
export CRASH_BROADCAST_IMMEDIATE=true
export DEFAULT_TENANT_SLUG="${DEFAULT_TENANT_SLUG:-crashx}"
export ADMIN_PANEL_PATH="${ADMIN_PANEL_PATH:-operator-console}"

if [ -n "${VERCEL_PROJECT_PRODUCTION_URL:-}" ]; then
  export APP_URL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
  export FRONTEND_URL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
  export CORS_ALLOWED_ORIGINS="https://${VERCEL_PROJECT_PRODUCTION_URL}"
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
php artisan migrate --seed --force
php artisan optimize

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
