<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class WompiProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'wompi';
    }

    protected function credencialesRequeridas(): array
    {
        return ['private_key'];
    }

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        // TODO: integrar el API de transacciones de Wompi.
        throw new PaymentException('Wompi: integración pendiente de implementar en el template');
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        throw new PaymentException('Wompi: integración pendiente de implementar en el template');
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $evento = $payload['event'] ?? null;
        $datos = $payload['data']['transaction'] ?? [];

        $estado = match ($evento) {
            'transaction.updated' => match ($datos['status'] ?? null) {
                'APPROVED' => PaymentStatusEnum::APROBADO->value,
                'DECLINED', 'ERROR', 'VOIDED' => PaymentStatusEnum::RECHAZADO->value,
                default => PaymentStatusEnum::PENDIENTE->value,
            },
            default => null,
        };

        return [
            'transaction_id' => $datos['id'] ?? null,
            'status' => $estado,
            'payload' => $payload,
        ];
    }
}