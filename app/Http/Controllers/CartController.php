<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function mostrar(Request $request)
    {
        $cart = $this->obtenerCarrito($request);
        $cart->load('items.product.images', 'items.variant.attributeValues.attribute');

        return ApiResponse::success($this->serializar($cart));
    }

    public function agregar(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $cart = $this->obtenerCarrito($request);

        try {
            $item = app(CartService::class)->agregar(
                $cart,
                $validated['id'],
                $validated['product_variant_id'] ?? null,
                $validated['quantity'] ?? 1
            );
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        $cart->refresh();
        $cart->load('items.product.images', 'items.variant.attributeValues.attribute');

        return ApiResponse::success($this->serializar($cart), 'Producto agregado al carrito', 201);
    }

    public function actualizar(Request $request, CartItem $item)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if (!$this->perteneceAlCarrito($request, $item)) {
            return ApiResponse::error('Item no encontrado', 404, 'NOT_FOUND');
        }

        try {
            app(CartService::class)->actualizar($item, $validated['quantity']);
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        $cart = $this->obtenerCarrito($request);
        $cart->load('items.product.images', 'items.variant.attributeValues.attribute');

        return ApiResponse::success($this->serializar($cart), 'Cantidad actualizada');
    }

    public function eliminar(Request $request, CartItem $item)
    {
        if (!$this->perteneceAlCarrito($request, $item)) {
            return ApiResponse::error('Item no encontrado', 404, 'NOT_FOUND');
        }

        $item->delete();

        $cart = $this->obtenerCarrito($request);
        $cart->load('items.product.images', 'items.variant.attributeValues.attribute');

        return ApiResponse::success($this->serializar($cart), 'Producto eliminado del carrito');
    }

    public function vaciar(Request $request)
    {
        $cart = $this->obtenerCarrito($request);
        app(CartService::class)->vaciar($cart);

        return ApiResponse::success($this->serializar($cart->load('items')), 'Carrito vaciado');
    }

    private function obtenerCarrito(Request $request): Cart
    {
        if (auth()->check() && $request->get('session_id')) {
            app(CartService::class)->aCarritoAutenticado($request->get('session_id'));
        }

        return app(CartService::class)->obtener($request->get('session_id'));
    }

    private function perteneceAlCarrito(Request $request, CartItem $item): bool
    {
        $cart = $this->obtenerCarrito($request);

        return $item->cart_id === $cart->id;
    }

    private function serializar(Cart $cart): array
    {
        return [
            'cart_id' => $cart->id,
            'session_id' => $cart->session_id,
            'items' => $cart->items->map(fn (CartItem $item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'name' => $item->product?->name,
                'slug' => $item->product?->slug,
                'sku' => $item->variant?->sku ?: $item->product?->sku,
                'price' => (float) $item->precioEfectivo(),
                'quantity' => $item->quantity,
                'subtotal' => (float) round($item->precioEfectivo() * $item->quantity, 2),
                'image' => $item->product?->images->first()?->url,
                'brand' => $item->product?->brand->first()?->name,
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'combinacion' => $item->variant->combinacion(),
                ] : null,
            ]),
            'count' => $cart->items->sum('quantity'),
            'subtotal' => (float) round($cart->subtotal(), 2),
            'currency' => config('ecommerce.currency', 'COP'),
        ];
    }
}