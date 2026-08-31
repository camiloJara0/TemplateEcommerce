<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentException;
use App\Services\PaymentService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function iniciar(Request $request, Order $order)
    {
        if ($order->user_id !== auth()->id() && !auth()->user()->tienePermiso('pagos.gestionar')) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        $validated = $request->validate([
            'provider' => 'required|in:' . implode(',', array_keys(config('payments.class_map', []))),
            'reference' => 'nullable|string|max:255',
        ]);

        try {
            $pago = app(PaymentService::class)->iniciarPago(
                $order,
                $validated['provider'],
                $request->only(['reference'])
            );
        } catch (PaymentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'PAYMENT_ERROR');
        }

        return ApiResponse::success($pago->load('order'), 'Pago procesado');
    }

    public function reembolsar(Request $request, Payment $pago)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            $reembolso = app(PaymentService::class)->reembolsar(
                $pago,
                $validated['amount'],
                $validated['reason'] ?? null
            );
        } catch (PaymentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'PAYMENT_ERROR');
        }

        return ApiResponse::success($reembolso->load('payment'), 'Reembolso procesado');
    }
}