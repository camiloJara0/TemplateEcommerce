<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

class CartService
{
    public function obtener(?string $sessionId = null): Cart
    {
        if (auth()->check()) {
            return Cart::firstOrCreate(['user_id' => auth()->id()]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId ?: Str::uuid()->toString()]);
    }

    public function agregar(Cart $cart, int $productId, ?int $variantId, int $cantidad = 1): CartItem
    {
        $producto = Product::activos()->findOrFail($productId);

        $variante = null;
        if ($variantId) {
            $variante = ProductVariant::where('id', $variantId)
                ->where('product_id', $productId)
                ->firstOrFail();
        }

        $disponible = $variante ? $variante->stock : $producto->stock;

        if ($disponible <= 0) {
            throw new \DomainException('Producto sin stock disponible');
        }

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($item) {
            $nuevaCantidad = $item->quantity + $cantidad;

            if ($nuevaCantidad > $disponible) {
                throw new \DomainException('Stock insuficiente para la cantidad solicitada');
            }

            $item->update(['quantity' => $nuevaCantidad]);

            return $item->fresh();
        }

        if ($cantidad > $disponible) {
            throw new \DomainException('Stock insuficiente para la cantidad solicitada');
        }

        return CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $productId,
            'product_variant_id' => $variantId,
            'quantity' => $cantidad,
        ]);
    }

    public function actualizar(CartItem $item, int $cantidad): CartItem
    {
        if ($cantidad <= 0) {
            throw new \InvalidArgumentException('La cantidad debe ser mayor a cero');
        }

        $disponible = $item->variant?->stock ?? $item->product?->stock ?? 0;

        if ($cantidad > $disponible) {
            throw new \DomainException('Stock insuficiente para la cantidad solicitada');
        }

        $item->update(['quantity' => $cantidad]);

        return $item;
    }

    public function vaciar(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function aCarritoAutenticado(?string $sessionId = null): ?Cart
    {
        if (!auth()->check() || !$sessionId) {
            return null;
        }

        $invitado = Cart::where('session_id', $sessionId)->first();

        if (!$invitado || $invitado->items()->count() === 0) {
            return null;
        }

        $miCarrito = Cart::firstOrCreate(['user_id' => auth()->id()]);

        foreach ($invitado->items as $item) {
            try {
                $this->agregar($miCarrito, $item->product_id, $item->product_variant_id, $item->quantity);
            } catch (\Exception $e) {
                continue;
            }
        }

        $invitado->delete();

        return $miCarrito;
    }
}