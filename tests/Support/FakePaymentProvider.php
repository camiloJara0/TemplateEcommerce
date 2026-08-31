<?php

namespace Tests\Support;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentProvider;
use Illuminate\Http\Request;

class FakePaymentProvider implements PaymentProvider
{
    public function name(): string
    {
        return 'fake';
    }

    public function charge(Order $order, array $data): array
    {
        return [
            'transaction_id' => 'txn_' . $order->id,
            'reference' => 'ref_' . $order->id,
            'status' => PaymentStatusEnum::APROBADO->value,
            'payload' => ['fake' => true],
        ];
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        return [
            'transaction_id' => 'rfn_' . $payment->id,
            'status' => 'completado',
            'payload' => ['fake' => true],
        ];
    }

    public function handleWebhook(Request $request): array
    {
        return [
            'transaction_id' => $request->input('transaction_id'),
            'status' => PaymentStatusEnum::APROBADO->value,
            'payload' => $request->all(),
        ];
    }
}