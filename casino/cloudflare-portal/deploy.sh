#!/usr/bin/env bash
set -euo pipefail

: "${NEXT_PUBLIC_API_URL:?Set NEXT_PUBLIC_API_URL to the deployed casino API URL}"

ROOT="$(pwd)"
WORK="$ROOT/.portal-build"
rm -rf "$WORK"
git clone --depth 1 https://github.com/scriptcasino/free-casino-script-portal.git "$WORK"
cd "$WORK"
git fetch --depth 1 origin 2ddcd09a7693fb4bcf856ba934c6c0836094d763
git checkout 2ddcd09a7693fb4bcf856ba934c6c0836094d763
rm -rf .git

export NEXT_PUBLIC_REALTIME_ENABLED=false
export NEXT_PUBLIC_CRASH_REAL_MONEY=false
export NEXT_PUBLIC_TENANT_SLUG=crashx
export NEXT_PUBLIC_SITE_NAME="CrashX"

npm ci
npx wrangler@latest deploy --yes
