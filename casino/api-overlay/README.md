# API social-casino overlay

Files in this directory are copied over the pinned upstream Laravel API during the production image build. `routes/social-casino.php` must be required from `routes/api.php` by the build patch. Reward credit is durable in the existing wallet transaction ledger and protected by auth, daily limit, cooldown and provider event idempotency.

Production integration must replace the temporary `verified` request field with cryptographic/server-to-server verification supplied by the selected rewarded-ad provider. Do not trust a browser boolean in production.
