<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PayPalProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'paypal';
    }

    protected function credencialesRequeridas(): array
    {
        return ['client_id', 'client_secret'];
    }

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        // TODO: integrar el API de órdenes de PayPal (v2/checkout/orders).
        throw new PaymentException('PayPal: integración pendiente de implementar en el template');
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        throw new PaymentException('PayPal: integración pendiente de implementar en el template');
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $tipo = $payload['event_type'] ?? null;
        $objeto = $payload['resource'] ?? [];

        $estado = match ($tipo) {
            'PAYMENT.CAPTURE.COMPLETED' => PaymentStatusEnum::APROBADO->value,
            'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED' => PaymentStatusEnum::RECHAZADO->value,
            default => null,
        };

        return [
            'transaction_id' => $objeto['id'] ?? null,
            'status' => $estado,
            'payload' => $payload,
        ];
    }

    // ── Test Connection ────────────────────────────────────────

    public function testConnection(): array
    {
        if (!$this->configValida()) {
            return ['success' => false, 'message' => 'Credenciales no configuradas (client_id, client_secret)'];
        }

        try {
            $config = $this->configurar();
            $mode = $config['mode'] ?? 'sandbox';
            $baseUrl = $mode === 'production'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';

            $respuesta = Http::asForm()->post("{$baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ], [
                'Authorization' => 'Basic ' . base64_encode("{$config['client_id']}:{$config['client_secret']}"),
            ]);

            if ($respuesta->failed()) {
                return ['success' => false, 'message' => 'Credenciales PayPal inválidas'];
            }

            $body = $respuesta->json();
            $token = $body['access_token'] ?? null;

            return $token
                ? ['success' => true, 'message' => "Conexión exitosa (modo {$mode})"]
                : ['success' => false, 'message' => 'No se obtuvo token de acceso'];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }
}