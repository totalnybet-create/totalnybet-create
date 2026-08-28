<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Services\Wallet\RewardedAdCreditService;
use App\Services\Wallet\WalletProvisionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialCasinoWalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_wallet_receives_play_money_starting_chips(): void
    {
        putenv('STARTING_VIRTUAL_CHIPS=2500');
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        app(WalletProvisionService::class)->provision($user);
        $wallet = $user->fresh()->wallet;

        $this->assertSame('CHIP', $wallet->currency);
        $this->assertSame(250000, $wallet->balance_minor);
        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'type' => 'welcome_chips',
            'amount_minor' => 250000,
        ]);
    }

    public function test_rewarded_event_cannot_be_credited_twice(): void
    {
        putenv('STARTING_VIRTUAL_CHIPS=2500');
        putenv('REWARDED_AD_CHIPS=500');
        putenv('REWARDED_AD_COOLDOWN_SECONDS=0');
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app(WalletProvisionService::class)->provision($user);

        $service = app(RewardedAdCreditService::class);
        $service->credit($user, 'test-provider', 'evt-1');
        $this->assertSame(300000, $user->fresh()->wallet->balance_minor);

        $this->expectException(\RuntimeException::class);
        $service->credit($user, 'test-provider', 'evt-1');
    }
}
