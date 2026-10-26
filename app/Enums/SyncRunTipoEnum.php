<?php

namespace App\Enums;

enum SyncRunTipoEnum: string
{
    case PRODUCTOS = 'productos';
    case INVENTARIO = 'inventario';
    case COMPRAS = 'compras';
    case VENTAS = 'ventas';
    case INICIAL = 'inicial';
    case TODO = 'todo';

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTOS => 'Productos',
            self::INVENTARIO => 'Inventario',
            self::COMPRAS => 'Compras',
            self::VENTAS => 'Ventas',
            self::INICIAL => 'Importaci��n inicial',
            self::TODO => 'Completa',
        };
    }
}
