<?php

namespace App\Services;

use App\Enums\CouponTypeEnum;
use App\Models\Coupon;
use App\Models\User;
use App\Models\Cart;

class CouponService
{
    public function validar(string $code, ?float $subtotal = null, ?User $user = null, ?Cart $cart = null): Coupon
    {
        $coupon = Coupon::where('code', $code)->activos()->first();

        if (!$coupon) {
            throw new \DomainException('Cupón no válido');
        }

        $ahora = now();

        if ($coupon->starts_at && $ahora->lt($coupon->starts_at)) {
            throw new \DomainException('El cupón aún no está vigente');
        }

        if ($coupon->expires_at && $ahora->gt($coupon->expires_at)) {
            throw new \DomainException('El cupón ha expirado');
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw new \DomainException('El cupón alcanzó su límite de usos');
        }

        if ($subtotal !== null && (float) $coupon->min_subtotal > 0 && $subtotal < (float) $coupon->min_subtotal) {
            throw new \DomainException('El subtotal no alcanza el mínimo para este cupón');
        }


        if ($coupon->category_id !== null) {
            $aplica = $cart->items->contains(function ($item) use ($coupon) {
                return $item->product->category_id == $coupon->category_id;
            });
            if (!$aplica){
                throw new \DomainException('El producto no cumple con la categoria del cupon');
            }
        }
    
        if ($coupon->brand_id !== null) {
            $aplica = $cart->items->contains(function ($item) use ($coupon) {
                return $item->product->brand_id == $coupon->brand_id;
            });
            if (!$aplica){
                throw new \DomainException('El producto no cumple con la marca del cupon');
            }
        }
    
        if ($coupon->product_id !== null) {
            $aplica = $cart->items->contains(function ($item) use ($coupon) {
                return $item->product->id == $coupon->product_id;
            });
            if (!$aplica){
                throw new \DomainException('Este producto no aplica para el cupon');
            }
        }

        if ($user) {
            $usos = $coupon->users()->where('user_id', $user->id)->count();

            if ($coupon->per_user_limit !== null && $usos >= $coupon->per_user_limit) {
                throw new \DomainException('Ya utilizaste este cupón');
            }
        }

        return $coupon;
    }

    public function calcularDescuento(Coupon $coupon, float $subtotal, float $shipping = 0.0): array
    {
        $tipo = CouponTypeEnum::tryFrom($coupon->type) ?? CouponTypeEnum::PERCENT;
        logger()->info('Subtotal descuento', [
            'subtotal' => $subtotal,
            'coupon_type' => $coupon->type,
            'coupon_value' => $coupon->value,
        ]);
        $descuento = match ($tipo) {
            CouponTypeEnum::PERCENT => $subtotal * ((float) $coupon->value / 100),
            CouponTypeEnum::FIXED => min((float) $coupon->value, $subtotal),
            CouponTypeEnum::FREE_SHIPPING => $shipping,
        };

        if ($coupon->max_discount !== null) {
            $descuento = min($descuento, (float) $coupon->max_discount);
        }

        return [
            'discount' => round($descuento, 2),
            'free_shipping' => $tipo === CouponTypeEnum::FREE_SHIPPING,
            'type' => $tipo->value,
        ];
    }

    public function registrarUso(Coupon $coupon, User $user, int $orderId, float $discount): void
    {
        $coupon->increment('used_count');

        $coupon->users()->attach($user->id, [
            'order_id' => $orderId,
            'discount_applied' => $discount,
            'used_at' => now(),
        ]);
    }

    public function aplicarACarrito(string $code, float $subtotal, float $shipping = 0.0, ?User $user = null, string $session_id): array {
        $cart = Cart::where('session_id', $session_id)->with(['items','items.product'])->first();
        $coupon = $this->validar($code, $subtotal, $user, $cart);
        $itemsElegibles = $this->obtenerItemsElegibles($coupon, $cart);

        $subtotalElegible = $itemsElegibles->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        $resultado = $this->calcularDescuento($coupon,$subtotalElegible,$shipping);

        return array_merge($resultado, [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
            ]
        ]);
    }

    private function obtenerItemsElegibles(Coupon $coupon, Cart $cart)
    {
        return $cart->items->filter(function ($item) use ($coupon) {

            if ($coupon->product_id !== null && $item->product_id != $coupon->product_id) {
                return false;
            }

            if ($coupon->category_id !== null && $item->product->category_id != $coupon->category_id) {
                return false;
            }

            if ($coupon->brand_id !== null && $item->product->brand_id != $coupon->brand_id) {
                return false;
            }

            return true;
        });
    }
}