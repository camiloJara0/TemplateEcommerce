<?php

namespace App\Enums;

enum OrderErpEstadoEnum: string
{
    case PENDIENTE_ENVIO = 'pendiente_envio';
    case ENVIADO = 'enviado';
    case ACEPTADO = 'aceptado';
    case ERROR = 'error';

    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE_ENVIO => 'Pendiente de envío al ERP',
            self::ENVIADO => 'Enviado al ERP',
            self::ACEPTADO => 'Aceptado por el ERP',
            self::ERROR => 'Error al enviar al ERP',
        };
    }
}
