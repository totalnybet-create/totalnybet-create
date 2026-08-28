# Production checklist

1. Provision persistent PostgreSQL and set DB_URL.
2. Generate APP_KEY and a strong ADMIN_PASSWORD in the hosting secret store.
3. Set public APP_URL, FRONTEND_URL and CORS_ALLOWED_ORIGINS to the same HTTPS origin where possible.
4. Keep NEXT_PUBLIC_CRASH_REAL_MONEY=false.
5. Run API migrations/seeding once and verify /api/v1/health.
6. Verify registration, login, session persistence, wallet balance and transaction history.
7. Verify a new account receives 2500 virtual chips.
8. Verify rewarded-video grant: +500 chips only after server verification, max 5/day, 15-minute cooldown, duplicate provider event rejected.
9. Verify there are no deposit, withdrawal or chip-to-cash paths.
10. Perform mobile smoke test before promoting the deployment.
