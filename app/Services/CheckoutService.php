<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Cart;
use App\Models\ShippingMethod;

class CheckoutService
{
    public function resumen(Cart $cart, ?int $addressId = null, ?int $shippingMethodId = null, ?string $couponCode = null): array
    {
        $address = $addressId ? Address::find($addressId) : null;
        $metodo = $shippingMethodId ? ShippingMethod::activos()->find($shippingMethodId) : null;

        $subtotal = round($cart->subtotal(), 2);
        $shipping = $metodo ? round((float) $metodo->cost, 2) : 0.0;
        $discount = 0.0;
        $coupon = null;

        if ($couponCode) {
            try {
                $cupon = app(CouponService::class)->aplicarACarrito(
                    $couponCode,
                    $subtotal,
                    $shipping,
                    auth()->user()
                );

                $discount = $cupon['discount'];

                if (!empty($cupon['free_shipping'])) {
                    $shipping = 0.0;
                }

                $coupon = $cupon['coupon'];
            } catch (\DomainException $e) {
                throw new \DomainException($e->getMessage());
            }
        }

        $tasaImpuesto = store_tax_rate();
        $baseImponible = max($subtotal - $discount, 0);
        $tax = round($baseImponible * $tasaImpuesto, 2);
        $total = round($baseImponible + $shipping + $tax, 2);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'total' => $total,
            'currency' => store_currency(),
            'tax_rate' => $tasaImpuesto,
            'coupon' => $coupon,
            'shipping_method' => $metodo ? [
                'id' => $metodo->id,
                'name' => $metodo->name,
                'cost' => (float) $metodo->cost,
                'estimated_days' => $metodo->estimated_days,
            ] : null,
            'address' => $address ? [
                'id' => $address->id,
                'label' => $address->label,
                'pais' => $address->pais,
                'ciudad' => $address->ciudad,
                'direccion' => $address->direccion,
                'codigo_postal' => $address->codigo_postal,
            ] : null,
        ];
    }
}