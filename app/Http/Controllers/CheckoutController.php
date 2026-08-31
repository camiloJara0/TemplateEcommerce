<?php

namespace App\Http\Controllers;

use App\Services\CartService;
use App\Services\CheckoutService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function metodosEnvio()
    {
        $metodos = \App\Models\ShippingMethod::activos()->orderBy('cost')->get();

        return ApiResponse::success($metodos->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'description' => $m->description,
            'cost' => (float) $m->cost,
            'estimated_days' => $m->estimated_days,
        ]));
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'nullable|string',
            'address_id' => 'nullable|exists:addresses,id',
            'shipping_method_id' => 'nullable|exists:shipping_methods,id',
            'coupon_code' => 'nullable|string|max:50',
        ]);

        $cart = app(CartService::class)->obtener($validated['session_id'] ?? null);

        if ($cart->items()->count() === 0) {
            return ApiResponse::error('El carrito está vacío', 422);
        }

        try {
            $resumen = app(CheckoutService::class)->resumen(
                $cart,
                $validated['address_id'] ?? null,
                $validated['shipping_method_id'] ?? null,
                $validated['coupon_code'] ?? null
            );
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        $resumen['items'] = $cart->items()->with(['product:id,name', 'variant:id,sku'])->get()->map(fn ($item) => [
            'name' => $item->product->name,
            'sku' => $item->variant?->sku ?: $item->product->sku,
            'price' => (float) $item->precioEfectivo(),
            'quantity' => $item->quantity,
            'subtotal' => (float) round($item->precioEfectivo() * $item->quantity, 2),
        ]);

        return ApiResponse::success($resumen);
    }
}