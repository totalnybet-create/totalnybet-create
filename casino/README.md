# Turnkey Casino Base

This branch pins two MIT-licensed upstream repositories as Git submodules, unchanged:

- `casino/api` → `scriptcasino/free-casino-script-api` @ `c6d8b87380523e122a45248c95d2ce3a4cf4ae99`
- `casino/portal` → `scriptcasino/free-casino-script-portal` @ `2ddcd09a7693fb4bcf856ba934c6c0836094d763`

The imported stack provides the player portal, registration/login/recovery, profile, wallet UI, deposit/withdraw views, transaction history, VIP, support, PostgreSQL/Redis backend, Laravel API, migrations/seeders and Filament operator admin.

## Start

Requirements: Git, Docker, Docker Compose, OpenSSL.

Clone with submodules or initialize them after checkout:

```bash
git clone --recurse-submodules -b casino-turnkey-base https://github.com/totalnybet-create/totalnybet-create.git casino-turnkey
cd casino-turnkey
bash casino/bootstrap.sh
```

Then open:

- Player portal: `http://localhost:3000`
- API health: `http://localhost/api/v1/health`
- Admin user: `crashx_internal_admin`
- Generated admin password: `casino/.runtime/admin-password.txt`
- Admin route: `{APP_URL}/{ADMIN_PANEL_PATH}/login` from `casino/api/.env`

## Important

The source retains its complete wallet/deposit/withdraw structure, but this integration intentionally builds the portal with `NEXT_PUBLIC_CRASH_REAL_MONEY=false`. No live payment gateway is enabled here. Real-money processing requires separate operator licensing, legal/compliance review, provider contracts and production security work.

The slot/game catalog can be added later without replacing this account/wallet/admin foundation.
