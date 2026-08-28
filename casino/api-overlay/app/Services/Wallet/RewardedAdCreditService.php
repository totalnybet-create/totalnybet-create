<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class RewardedAdCreditService
{
    public function credit(User $user, string $provider, string $eventId): array
    {
        $rewardMinor = max(1, (int) env('REWARDED_AD_CHIPS', 500)) * 100;
        $dailyLimit = max(1, (int) env('REWARDED_AD_DAILY_LIMIT', 5));
        $cooldown = max(0, (int) env('REWARDED_AD_COOLDOWN_SECONDS', 900));

        return DB::transaction(function () use ($user, $provider, $eventId, $rewardMinor, $dailyLimit, $cooldown): array {
            $wallet = Wallet::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $rewards = WalletTransaction::query()->where('wallet_id', $wallet->id)->where('type', 'rewarded_ad');

            $duplicate = (clone $rewards)->where('meta->provider', $provider)->where('meta->event_id', $eventId)->exists();
            if ($duplicate) throw new RuntimeException('reward_already_claimed');

            if ((clone $rewards)->where('created_at', '>=', now()->startOfDay())->count() >= $dailyLimit) {
                throw new RuntimeException('daily_limit_reached');
            }

            $last = (clone $rewards)->latest('created_at')->first();
            if ($last && $cooldown > 0 && $last->created_at->addSeconds($cooldown)->isFuture()) {
                throw new RuntimeException('cooldown_active');
            }

            $balance = (int) $wallet->balance_minor + $rewardMinor;
            WalletTransaction::query()->create([
                'wallet_id' => $wallet->id,
                'type' => 'rewarded_ad',
                'amount_minor' => $rewardMinor,
                'balance_after_minor' => $balance,
                'meta' => ['label' => 'Rewarded video', 'provider' => $provider, 'event_id' => $eventId],
            ]);
            $wallet->balance_minor = $balance;
            $wallet->save();

            return ['balance_minor' => $balance, 'reward_minor' => $rewardMinor];
        });
    }
}
