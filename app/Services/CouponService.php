<?php

namespace App\Services;

use App\Enums\CouponTypeEnum;
use App\Models\Coupon;
use App\Models\User;

class CouponService
{
    public function validar(string $code, ?float $subtotal = null, ?User $user = null): Coupon
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

    public function aplicarACarrito(string $code, float $subtotal, float $shipping = 0.0, ?User $user = null): array
    {
        $coupon = $this->validar($code, $subtotal, $user);
        $resultado = $this->calcularDescuento($coupon, $subtotal, $shipping);

        return array_merge($resultado, ['coupon' => [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
        ]]);
    }
}