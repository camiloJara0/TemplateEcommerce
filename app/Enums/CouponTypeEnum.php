<?php

namespace App\Enums;

enum CouponTypeEnum: string
{
    case PERCENT = 'percent';
    case FIXED = 'fixed';
    case FREE_SHIPPING = 'free_shipping';

    public function label(): string
    {
        return match ($this) {
            self::PERCENT => 'Porcentaje',
            self::FIXED => 'Valor fijo',
            self::FREE_SHIPPING => 'Envío gratis',
        };
    }
}