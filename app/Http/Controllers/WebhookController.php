<?php

namespace App\Http\Controllers;

use App\Services\Payment\PaymentException;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(string $provider, Request $request)
    {
        try {
            app(PaymentService::class)->procesarWebhook($provider, $request);
        } catch (PaymentException $e) {
            Log::warning('Webhook de pago ignorado', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json(['success' => true]);
    }
}