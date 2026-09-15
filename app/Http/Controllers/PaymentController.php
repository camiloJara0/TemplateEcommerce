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
            'reference' => 'nullable|string|max:10000',
        ]);

        $datos = $request->only(['provider', 'reference']);
        $referenceJson = $validated['reference'] ?? null;
        if ($referenceJson) {
            $decoded = json_decode($referenceJson, true);
            if (is_array($decoded)) {
                $datos = array_merge($datos, $decoded);
            }
        }

        try {
            $pago = app(PaymentService::class)->iniciarPago(
                $order,
                $validated['provider'],
                $datos,
            );
        } catch (PaymentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'PAYMENT_ERROR');
        }

        return ApiResponse::success($pago->load('order'), 'Pago procesado');
    }

    public function adminIndex(Request $request)
    {
        $query = Payment::with(['order:id,numero,user_id,total,status,payment_status']);

        if ($request->provider) {
            $query->where('provider', $request->provider);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->desde) {
            $query->where('created_at', '>=', $request->desde);
        }

        if ($request->hasta) {
            $query->where('created_at', '<=', $request->hasta . ' 23:59:59');
        }

        $pagos = $query->latest()->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $pagos->items(),
            'pagination' => [
                'total' => $pagos->total(),
                'per_page' => $pagos->perPage(),
                'current_page' => $pagos->currentPage(),
                'last_page' => $pagos->lastPage(),
            ],
        ]);
    }

    public function show(Payment $pago)
    {
        $pago->load(['order' => function ($q) {
            $q->with(['user:id,nombre,email', 'address', 'shippingMethod', 'items']);
        }, 'refunds']);

        return ApiResponse::success($pago);
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

    public function cancelar(Payment $pago)
    {
        if (!in_array($pago->status, ['pendiente'])) {
            return ApiResponse::error('Solo se pueden cancelar pagos pendientes', 422, 'PAYMENT_ERROR');
        }

        $rapydId = $pago->transaction_id ?? $pago->reference;

        try {
            if ($rapydId && $pago->provider === 'rapyd') {
                $providerService = app(PaymentService::class)->proveedor('rapyd');
                $providerService->cancelPayment($rapydId);
            }

            $pago->update(['status' => 'rechazado']);
            app(PaymentService::class)->sincronizarEstadoPedido($pago->order, 'rechazado');
        } catch (PaymentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'PAYMENT_ERROR');
        }

        return ApiResponse::success($pago->fresh(), 'Pago cancelado');
    }
}
