<?php

use App\Http\Controllers\Api\V1\RewardedAdController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    Route::post('/wallet/rewarded-ad', RewardedAdController::class)->middleware('throttle:wallet-write');
});
