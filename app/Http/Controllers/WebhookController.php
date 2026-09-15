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
        Log::info("Webhook recibido de {$provider}", [
            'method' => $request->method(),
            'url' => $request->url(),
            'payload' => $request->all(),
        ]);

        try {
            $pago = app(PaymentService::class)->procesarWebhook($provider, $request);

            if ($pago) {
                Log::info("Webhook procesado exitosamente", [
                    'provider' => $provider,
                    'payment_id' => $pago->id,
                    'status' => $pago->status,
                ]);
            }
        } catch (PaymentException $e) {
            Log::warning('Webhook de pago ignorado', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Webhook de pago error inesperado', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return response()->json(['success' => true]);
    }
}