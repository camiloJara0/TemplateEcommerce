<?php

namespace App\Enums;

enum ShippingStatusEnum: string
{
    case PENDIENTE = 'pendiente';
    case EN_PREPARACION = 'en_preparacion';
    case DESPACHADO = 'despachado';
    case EN_TRANSITO = 'en_transito';
    case ENTREGADO = 'entregado';

    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE => 'Pendiente',
            self::EN_PREPARACION => 'En preparación',
            self::DESPACHADO => 'Despachado',
            self::EN_TRANSITO => 'En tránsito',
            self::ENTREGADO => 'Entregado',
        };
    }
}