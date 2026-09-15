<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StripeProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'stripe';
    }

    protected function credencialesRequeridas(): array
    {
        return ['secret_key'];
    }

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        $respuesta = Http::withBasicAuth($this->configurar()['secret_key'], '')
            ->asForm()
            ->post('https://api.stripe.com/v1/payment_intents', [
                'amount' => (int) round($order->total * 100),
                'currency' => strtolower($order->currency),
                'description' => "Pedido {$order->numero}",
                'metadata' => ['order_id' => $order->id],
            ]);

        if ($respuesta->failed()) {
            throw new PaymentException('Stripe: ' . $respuesta->body());
        }

        $body = $respuesta->json();

        return [
            'transaction_id' => $body['id'],
            'reference' => $body['client_secret'] ?? null,
            'status' => $this->mapearEstado($body['status'] ?? ''),
            'payload' => $body,
        ];
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        $this->requireConfig();

        if (!$payment->transaction_id) {
            throw new PaymentException('Sin transacción que reembolsar');
        }

        $respuesta = Http::withBasicAuth($this->configurar()['secret_key'], '')
            ->asForm()
            ->post('https://api.stripe.com/v1/refunds', [
                'payment_intent' => $payment->transaction_id,
                'amount' => (int) round($amount * 100),
                'reason' => $reason ?: 'requested_by_customer',
            ]);

        if ($respuesta->failed()) {
            throw new PaymentException('Stripe refund: ' . $respuesta->body());
        }

        $body = $respuesta->json();

        return [
            'transaction_id' => $body['id'],
            'status' => ($body['status'] ?? '') === 'succeeded' ? 'completado' : 'pendiente',
            'payload' => $body,
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $tipo = $payload['type'] ?? null;
        $objeto = $payload['data']['object'] ?? [];
        $transactionId = $objeto['id'] ?? null;

        if ($tipo === 'payment_intent.succeeded') {
            return ['transaction_id' => $transactionId, 'status' => PaymentStatusEnum::APROBADO->value, 'payload' => $payload];
        }

        if ($tipo === 'payment_intent.payment_failed' || $tipo === 'payment_intent.canceled') {
            return ['transaction_id' => $transactionId, 'status' => PaymentStatusEnum::RECHAZADO->value, 'payload' => $payload];
        }

        return ['transaction_id' => $transactionId, 'status' => null, 'payload' => $payload];
    }

    // ── Test Connection ────────────────────────────────────────

    public function testConnection(): array
    {
        if (!$this->configValida()) {
            return ['success' => false, 'message' => 'Credenciales no configuradas (secret_key)'];
        }

        try {
            $respuesta = Http::withBasicAuth($this->configurar()['secret_key'], '')
                ->get('https://api.stripe.com/v1/balance');

            if ($respuesta->failed()) {
                $body = $respuesta->json();
                $msg = $body['error']['message'] ?? 'Error desconocido';
                return ['success' => false, 'message' => "Error Stripe: {$msg}"];
            }

            $body = $respuesta->json();
            $available = $body['available'][0]['amount'] ?? 0;
            $currency = $body['available'][0]['currency'] ?? 'usd';
            $formatted = number_format($available / 100, 2);

            return [
                'success' => true,
                'message' => "Conexión exitosa. Saldo disponible: {$formatted} " . strtoupper($currency),
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }

    private function mapearEstado(string $estadoStripe): string
    {
        return match ($estadoStripe) {
            'succeeded' => PaymentStatusEnum::APROBADO->value,
            'canceled', 'requires_payment_method' => PaymentStatusEnum::RECHAZADO->value,
            default => PaymentStatusEnum::PENDIENTE->value,
        };
    }
}