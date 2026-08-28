<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Wallet\RewardedAdCreditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

final class RewardedAdController extends Controller
{
    public function __invoke(Request $request, RewardedAdCreditService $credits): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required','string','max:80'],
            'event_id' => ['required','string','max:191'],
            'verified' => ['required','accepted'],
        ]);

        try {
            $result = $credits->credit($request->user(), $data['provider'], $data['event_id']);
            return response()->json(['ok' => true] + $result);
        } catch (RuntimeException $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 409);
        }
    }
}
