<?php

namespace App\Services;

use App\Enums\MovementTypeEnum;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAlert;
use App\Models\StockMovement;

class InventoryService
{
    public function registrarMovimiento(
        Product|ProductVariant $modelo,
        MovementTypeEnum $tipo,
        int $delta,
        ?string $razon = null,
        $referencia = null
    ): StockMovement {
        if ($delta === 0) {
            throw new \InvalidArgumentException('El movimiento debe tener cantidad distinta de cero');
        }

        $nuevoStock = $modelo->stock + $delta;

        if ($nuevoStock < 0) {
            throw new \DomainException('Stock insuficiente');
        }

        $movimiento = StockMovement::create([
            'product_id' => $modelo instanceof ProductVariant ? $modelo->product_id : $modelo->id,
            'product_variant_id' => $modelo instanceof ProductVariant ? $modelo->id : null,
            'cantidad' => $delta,
            'tipo' => $tipo->value,
            'razon' => $razon,
            'usuario_id' => auth()->id(),
            'referencia_type' => $referencia ? get_class($referencia) : null,
            'referencia_id' => $referencia ? $referencia->getKey() : null,
        ]);

        $modelo->update(['stock' => $nuevoStock]);

        if ($modelo instanceof ProductVariant) {
            $modelo->product()->update([
                'stock' => $modelo->product->variants()->sum('stock'),
            ]);
        }

        $this->verificarAlertas($modelo);

        return $movimiento;
    }

    public function entrada(Product|ProductVariant $modelo, int $cantidad, ?string $razon = null, $referencia = null): StockMovement
    {
        return $this->registrarMovimiento($modelo, MovementTypeEnum::ENTRADA, $cantidad, $razon, $referencia);
    }

    public function salida(Product|ProductVariant $modelo, int $cantidad, ?string $razon = null, $referencia = null): StockMovement
    {
        return $this->registrarMovimiento($modelo, MovementTypeEnum::SALIDA, -$cantidad, $razon, $referencia);
    }

    public function devolucion(Product|ProductVariant $modelo, int $cantidad, ?string $razon = null, $referencia = null): StockMovement
    {
        return $this->registrarMovimiento($modelo, MovementTypeEnum::DEVOLUCION, $cantidad, $razon, $referencia);
    }

    public function ajustar(Product|ProductVariant $modelo, int $nuevoStock, ?string $razon = null, $referencia = null): ?StockMovement
    {
        $delta = $nuevoStock - $modelo->stock;

        if ($delta === 0) {
            return null;
        }

        return $this->registrarMovimiento($modelo, MovementTypeEnum::AJUSTE, $delta, $razon, $referencia);
    }

    public function verificarAlertas(Product|ProductVariant $modelo): array
    {
        $columna = $modelo instanceof ProductVariant ? 'product_variant_id' : 'product_id';

        $alerta = StockAlert::where('active', true)
            ->where($columna, $modelo->id)
            ->first();

        if (!$alerta || $modelo->stock > $alerta->min_stock) {
            return [];
        }

        app(NotificationService::class)->alertaStock([
            'nombre' => $modelo->name ?? $modelo->product?->name,
            'sku' => $modelo->sku,
            'stock' => $modelo->stock,
            'min_stock' => $alerta->min_stock,
        ]);

        return [$alerta];
    }
}