<?php

namespace App\Enums;

enum RoleEnum: string
{
    case ADMIN = 'admin';
    case VENDEDOR = 'vendedor';
    case CLIENTE = 'cliente';
    case OPERADOR_LOGISTICA = 'operador_logistica';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrador',
            self::VENDEDOR => 'Vendedor',
            self::CLIENTE => 'Cliente',
            self::OPERADOR_LOGISTICA => 'Operador de logística',
        };
    }
}