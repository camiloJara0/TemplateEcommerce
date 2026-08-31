<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Services\ShippingService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function crear(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'carrier' => 'required|in:' . implode(',', array_keys(config('shipping.class_map', []))),
        ]);

        $order = \App\Models\Order::findOrFail($validated['order_id']);

        try {
            $shipment = app(ShippingService::class)->crearEnvio($order, $validated['carrier']);
        } catch (\App\Services\Shipping\ShippingException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'SHIPPING_ERROR');
        }

        return ApiResponse::success($shipment->load('order'), 'Envío creado', 201);
    }

    public function index(Request $request)
    {
        $envios = Shipment::with(['order:id,numero', 'shippingMethod'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $envios->items(),
            'pagination' => [
                'total' => $envios->total(),
                'per_page' => $envios->perPage(),
                'current_page' => $envios->currentPage(),
                'last_page' => $envios->lastPage(),
            ],
        ]);
    }

    public function show(Shipment $shipment)
    {
        return ApiResponse::success($shipment->load('order', 'shippingMethod'));
    }

    public function actualizarEstado(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'estado' => 'required|in:en_preparacion,despachado,en_transito,entregado',
        ]);

        try {
            $shipment = app(ShippingService::class)->actualizarEstado($shipment, $validated['estado']);
        } catch (\App\Services\Shipping\ShippingException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'SHIPPING_ERROR');
        }

        return ApiResponse::success($shipment->load('order'), 'Estado de envío actualizado');
    }

    public function cotizar(Request $request)
    {
        $validated = $request->validate([
            'carrier' => 'nullable|in:' . implode(',', array_keys(config('shipping.class_map', []))),
            'weight' => 'nullable|numeric|min:0',
        ]);

        $cotizacion = app(ShippingService::class)->cotizar(
            $validated,
            $validated['carrier'] ?? null
        );

        return ApiResponse::success($cotizacion, 'Cotización de envío');
    }

    public function tracking(string $trackingNumber)
    {
        try {
            $resultado = app(ShippingService::class)->consultarTracking($trackingNumber);
        } catch (\App\Services\Shipping\ShippingException $e) {
            return ApiResponse::error($e->getMessage(), 404, 'NOT_FOUND');
        }

        return ApiResponse::success($resultado);
    }
}