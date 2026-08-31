<?php

namespace App\Enums;

enum PaymentStatusEnum: string
{
    case PENDIENTE = 'pendiente';
    case APROBADO = 'aprobado';
    case RECHAZADO = 'rechazado';
    case REEMBOLSADO = 'reembolsado';

    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE => 'Pendiente',
            self::APROBADO => 'Aprobado',
            self::RECHAZADO => 'Rechazado',
            self::REEMBOLSADO => 'Reembolsado',
        };
    }
}