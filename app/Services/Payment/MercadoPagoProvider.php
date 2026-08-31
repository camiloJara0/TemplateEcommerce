<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MercadoPagoProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'mercadopago';
    }

    protected function credencialesRequeridas(): array
    {
        return ['access_token'];
    }

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        $respuesta = Http::withToken($this->configurar()['access_token'])
            ->asJson()
            ->post('https://api.mercadopago.com/checkout/preferences', [
                'external_reference' => $order->numero,
                'items' => [[
                    'title' => "Pedido {$order->numero}",
                    'quantity' => 1,
                    'currency_id' => $order->currency,
                    'unit_price' => (float) $order->total,
                ]],
                'notification_url' => url('/api/webhooks/pagos/mercadopago'),
            ]);

        if ($respuesta->failed()) {
            throw new PaymentException('MercadoPago: ' . $respuesta->body());
        }

        $body = $respuesta->json();

        return [
            'transaction_id' => $body['id'],
            'reference' => $body['init_point'] ?? null,
            'status' => PaymentStatusEnum::PENDIENTE->value,
            'payload' => $body,
        ];
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        $this->requireConfig();

        if (!$payment->transaction_id) {
            throw new PaymentException('Sin transacción que reembolsar');
        }

        $respuesta = Http::withToken($this->configurar()['access_token'])
            ->asJson()
            ->post("https://api.mercadopago.com/v1/payments/{$payment->transaction_id}/refunds", []);

        if ($respuesta->failed()) {
            throw new PaymentException('MercadoPago refund: ' . $respuesta->body());
        }

        $body = $respuesta->json();

        return [
            'transaction_id' => $body['id'] ?? null,
            'status' => ($body['status'] ?? '') === 'approved' ? 'completado' : 'pendiente',
            'payload' => $body,
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();

        if (isset($payload['type']) && $payload['type'] !== 'payment') {
            return ['transaction_id' => null, 'status' => null, 'payload' => $payload];
        }

        $transactionId = $payload['data']['id'] ?? null;

        if (!$transactionId) {
            return ['transaction_id' => null, 'status' => null, 'payload' => $payload];
        }

        $this->requireConfig();

        $consulta = Http::withToken($this->configurar()['access_token'])
            ->get("https://api.mercadopago.com/v1/payments/{$transactionId}");

        if ($consulta->failed()) {
            return ['transaction_id' => $transactionId, 'status' => null, 'payload' => $payload];
        }

        $pago = $consulta->json();

        $estado = match ($pago['status'] ?? '') {
            'approved' => PaymentStatusEnum::APROBADO->value,
            'rejected', 'cancelled' => PaymentStatusEnum::RECHAZADO->value,
            'refunded' => PaymentStatusEnum::REEMBOLSADO->value,
            default => PaymentStatusEnum::PENDIENTE->value,
        };

        return [
            'transaction_id' => $transactionId,
            'status' => $estado,
            'payload' => $pago,
        ];
    }
}