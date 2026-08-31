<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

interface PaymentProvider
{
    public function name(): string;

    /**
     * @return array{transaction_id?: string, reference?: string, status: string, payload?: mixed}
     */
    public function charge(Order $order, array $data): array;

    /**
     * @return array{transaction_id?: string, status: string, payload?: mixed}
     */
    public function refund(Payment $payment, float $amount, ?string $reason = null): array;

    /**
     * @return array{transaction_id?: string, status: string|null, payload?: mixed}
     */
    public function handleWebhook(Request $request): array;
}