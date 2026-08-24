# Cloudflare production deployment

Branch: `cloudflare-prod`

## 1. API (Cloudflare Containers)
- Git repository: `totalnybet-create/totalnybet-create`
- Production branch: `cloudflare-prod`
- Root directory: `casino/api-service`
- Deploy command: `npm install && npx wrangler deploy`
- Required secrets: `DATABASE_URL`, `APP_KEY`, `ADMIN_PASSWORD`
- Optional vars after first deploy: `API_URL`, `PORTAL_URL`

The API Worker is named `casino-api` and proxies requests to the Laravel container on port 8080.

## 2. Portal (Cloudflare Workers / Next.js)
- Git repository: `totalnybet-create/totalnybet-create`
- Production branch: `cloudflare-prod`
- Root directory: `casino/cloudflare-portal`
- Deploy command: `npm install && npm run deploy`
- Required build variable: `NEXT_PUBLIC_API_URL` set to the deployed `casino-api` URL.

The deploy wrapper clones the pinned upstream portal commit and lets current Wrangler auto-configure Next.js/OpenNext.

## 3. Verification
- API edge: `/_edge/health`
- Laravel API: `/api/v1/health`
- Public config: `/api/v1/site/config`
- Portal login: `/en/login`
- Portal signup: `/en/signup`

Real-money mode remains disabled for this build.
