#!/bin/sh
set -eu

# Normalize common PostgreSQL URL variable names used by Vercel/Neon.
if [ -z "${DB_URL:-}" ]; then
  for candidate in "${DATABASE_URL:-}" "${DATABASE_URL_UNPOOLED:-}" "${POSTGRES_URL_NON_POOLING:-}" "${POSTGRES_URL:-}" "${NEON_DATABASE_URL:-}"; do
    if [ -n "$candidate" ]; then
      export DB_URL="$candidate"
      break
    fi
  done
fi

if [ -z "${DB_URL:-}" ]; then
  echo 'Missing PostgreSQL URL. Set DB_URL, DATABASE_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, POSTGRES_URL, or NEON_DATABASE_URL.' >&2
  exit 1
fi
if [ -z "${APP_KEY:-}" ]; then echo 'Missing APP_KEY' >&2; exit 1; fi
if [ -z "${ADMIN_PASSWORD:-}" ]; then echo 'Missing ADMIN_PASSWORD' >&2; exit 1; fi

export APP_ENV=production APP_DEBUG=false DB_CONNECTION=pgsql SESSION_DRIVER=database CACHE_STORE=database QUEUE_CONNECTION=sync BROADCAST_CONNECTION=log CRASH_BROADCAST_IMMEDIATE=true
export DEFAULT_TENANT_SLUG="${DEFAULT_TENANT_SLUG:-crashx}"
export ADMIN_PANEL_PATH="${ADMIN_PANEL_PATH:-operator-console}"

if [ -n "${VERCEL_PROJECT_PRODUCTION_URL:-}" ]; then
  export APP_URL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
  export FRONTEND_URL="https://${VERCEL_PROJECT_PRODUCTION_URL}"
  export CORS_ALLOWED_ORIGINS="https://${VERCEL_PROJECT_PRODUCTION_URL}"
elif [ -n "${VERCEL_URL:-}" ]; then
  export APP_URL="https://${VERCEL_URL}"
  export FRONTEND_URL="https://${VERCEL_URL}"
  export CORS_ALLOWED_ORIGINS="https://${VERCEL_URL}"
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
php artisan migrate --seed --force
php artisan optimize
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
