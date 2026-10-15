<?php

namespace App\Enums;

enum SyncRunTipoEnum: string
{
    case PRODUCTOS = 'productos';
    case INVENTARIO = 'inventario';
    case INICIAL = 'inicial';
    case TODO = 'todo';

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTOS => 'Productos',
            self::INVENTARIO => 'Inventario',
            self::INICIAL => 'Importación inicial',
            self::TODO => 'Todo',
        };
    }
}
