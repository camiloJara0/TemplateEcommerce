<?php

namespace App\Enums;

enum MovementTypeEnum: string
{
    case ENTRADA = 'entrada';
    case SALIDA = 'salida';
    case DEVOLUCION = 'devolucion';
    case AJUSTE = 'ajuste';

    public function sign(): int
    {
        return match ($this) {
            self::ENTRADA => 1,
            self::SALIDA => -1,
            self::DEVOLUCION => 1,
            self::AJUSTE => 0,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::ENTRADA => 'Entrada',
            self::SALIDA => 'Salida',
            self::DEVOLUCION => 'Devolución',
            self::AJUSTE => 'Ajuste',
        };
    }
}