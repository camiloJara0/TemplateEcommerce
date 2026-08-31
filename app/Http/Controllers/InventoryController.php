<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAlert;
use App\Models\StockMovement;
use App\Services\InventoryService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function movimientos(Request $request)
    {
        $movimientos = StockMovement::with(['product:id,name,slug', 'variant:id,sku,product_id', 'usuario:id,nombre,email'])
            ->when($request->product_id, fn ($q, $v) => $q->where('product_id', $v))
            ->when($request->product_variant_id, fn ($q, $v) => $q->where('product_variant_id', $v))
            ->when($request->tipo, fn ($q, $v) => $q->where('tipo', $v))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success($movimientos);
    }

    public function registrarMovimiento(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|in:entrada,salida,ajuste,devolucion',
            'product_id' => 'nullable|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'cantidad' => 'required|integer',
            'razon' => 'nullable|string|max:255',
        ]);

        if (!$validated['product_id'] && !$validated['product_variant_id']) {
            return ApiResponse::error('Debe indicar product_id o product_variant_id', 422);
        }

        if ($validated['tipo'] !== 'ajuste' && $validated['cantidad'] <= 0) {
            return ApiResponse::error('La cantidad debe ser mayor a cero', 422);
        }

        $variantId = $validated['product_variant_id'] ?? null;
        $productId = $validated['product_id'] ?? null;

        $objetivo = $variantId
            ? ProductVariant::findOrFail($variantId)
            : Product::findOrFail($productId);

        $service = app(InventoryService::class);
        $razon = $validated['razon'] ?? null;

        try {
            $movimiento = match ($validated['tipo']) {
                'entrada' => $service->entrada($objetivo, $validated['cantidad'], $razon),
                'salida' => $service->salida($objetivo, $validated['cantidad'], $razon),
                'devolucion' => $service->devolucion($objetivo, $validated['cantidad'], $razon),
                'ajuste' => $service->ajustar($objetivo, $validated['cantidad'], $razon),
            };
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        if (!$movimiento) {
            return ApiResponse::success(null, 'El stock ya estaba en ese valor');
        }

        return ApiResponse::success($movimiento->load('product:id,name,slug', 'variant:id,sku'), 'Movimiento registrado', 201);
    }

    public function alertas()
    {
        $alertas = StockAlert::with(['product:id,name,slug,stock', 'variant:id,sku,product_id,stock'])
            ->where('active', true)
            ->get()
            ->map(function (StockAlert $alerta) {
                $stock = $alerta->variant_id ? $alerta->variant?->stock : $alerta->product?->stock;

                return [
                    'id' => $alerta->id,
                    'product' => $alerta->product ? [
                        'id' => $alerta->product->id,
                        'name' => $alerta->product->name,
                    ] : null,
                    'variant' => $alerta->variant ? [
                        'id' => $alerta->variant->id,
                        'sku' => $alerta->variant->sku,
                    ] : null,
                    'stock_actual' => $stock,
                    'min_stock' => $alerta->min_stock,
                    'critica' => $stock !== null && $stock <= $alerta->min_stock,
                ];
            });

        return ApiResponse::success($alertas);
    }

    public function configurarAlerta(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'min_stock' => 'required|integer|min:0',
            'active' => 'nullable|boolean',
        ]);

        $productId = $validated['product_id'] ?? null;
        $variantId = $validated['product_variant_id'] ?? null;

        if (!$productId && !$variantId) {
            return ApiResponse::error('Debe indicar product_id o product_variant_id', 422);
        }

        $alerta = StockAlert::updateOrCreate(
            array_filter([
                'product_id' => $productId,
                'product_variant_id' => $variantId,
            ]),
            [
                'min_stock' => $validated['min_stock'],
                'active' => $validated['active'] ?? true,
            ]
        );

        return ApiResponse::success($alerta, 'Alerta configurada');
    }
}