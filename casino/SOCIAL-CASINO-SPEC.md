# Social Casino mode

This deployment is play-money only.

## Economy
- Starting balance: 2500 virtual chips.
- Virtual chips have no cash value and cannot be withdrawn, sold or redeemed.
- Real-money mode remains disabled.

## Rewarded video
- Default reward: 500 virtual chips after a verified completed rewarded-video event.
- Daily limit: 5 rewarded grants per account.
- Cooldown: 15 minutes between grants.
- Rewards must be granted by the API, never directly by the browser.
- Provider callback / server-side verification must be idempotent using the provider event ID.

## Transaction ledger
Reward entries use type `rewarded_ad` and store provider, provider event ID, amount, account/user ID and timestamp. A provider event ID can be credited only once.

## Abuse controls
Authentication is required. The server validates daily limit and cooldown. Client-side completion alone is not sufficient proof. Rate limiting applies to reward claim endpoints.

## Product constraints
No deposits, withdrawals, cash prizes or conversion of chips to money. The advertising provider used in production must explicitly permit rewarded advertising in a simulated/social-casino product.