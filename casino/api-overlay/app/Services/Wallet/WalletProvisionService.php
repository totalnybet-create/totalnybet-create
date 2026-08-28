<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

final class WalletProvisionService
{
    public function provision(User $user): void
    {
        $chips = max(0, (int) env('STARTING_VIRTUAL_CHIPS', 2500));
        $balanceMinor = $chips * 100;

        DB::transaction(function () use ($user, $balanceMinor): void {
            $wallet = $user->wallet()->create([
                'currency' => 'CHIP',
                'balance_minor' => $balanceMinor,
            ]);

            if ($balanceMinor > 0) {
                WalletTransaction::query()->create([
                    'wallet_id' => $wallet->id,
                    'type' => 'welcome_chips',
                    'amount_minor' => $balanceMinor,
                    'balance_after_minor' => $balanceMinor,
                    'meta' => [
                        'label' => 'Welcome chips',
                        'play_money' => true,
                        'cash_value' => false,
                    ],
                ]);
            }
        });
    }
}
