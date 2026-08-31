<?php

namespace App\Enums;

enum OrderStatusEnum: string
{
    case NUEVO = 'nuevo';
    case PAGADO = 'pagado';
    case PREPARANDO = 'preparando';
    case ENVIADO = 'enviado';
    case ENTREGADO = 'entregado';
    case CANCELADO = 'cancelado';
    case DEVUELTO = 'devuelto';

    public function label(): string
    {
        return match ($this) {
            self::NUEVO => 'Nuevo',
            self::PAGADO => 'Pagado',
            self::PREPARANDO => 'Preparando',
            self::ENVIADO => 'Enviado',
            self::ENTREGADO => 'Entregado',
            self::CANCELADO => 'Cancelado',
            self::DEVUELTO => 'Devuelto',
        };
    }
}