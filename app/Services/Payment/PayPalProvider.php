<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

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
}