<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $pedidos = Order::with(['items', 'address'])
            ->mios(auth()->id())
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => OrderResource::collection($pedidos->items()),
            'pagination' => [
                'total' => $pedidos->total(),
                'per_page' => $pedidos->perPage(),
                'current_page' => $pedidos->currentPage(),
                'last_page' => $pedidos->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'nullable|string',
            'address_id' => 'required|exists:addresses,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'coupon_code' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:500',
        ]);

        // Merge guest cart into auth cart BEFORE resolving the cart
        if (auth()->check() && !empty($validated['session_id'])) {
            app(CartService::class)->aCarritoAutenticado($validated['session_id']);
        }

        $cart = app(CartService::class)->obtener($validated['session_id'] ?? null);

        try {
            $order = app(OrderService::class)->crearDesdeCarrito($cart, $validated);
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        return ApiResponse::success(
            new OrderResource($order->load(['items', 'address', 'statusHistories'])),
            'Pedido creado',
            201
        );
    }

    public function show(Request $request, Order $order)
    {
        $puedeVer = $order->user_id === auth()->id()
            || auth()->user()->tienePermiso('pedidos.ver');

        if (!$puedeVer) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        $order->load(['items', 'address', 'statusHistories', 'payments']);

        return ApiResponse::success(new OrderResource($order));
    }

    public function adminIndex(Request $request)
    {
        $pedidos = Order::with(['items', 'address', 'payments', 'user:id,nombre,email'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->payment_status, fn ($q, $v) => $q->where('payment_status', $v))
            ->when($request->busqueda, fn ($q, $v) => $q->where('numero', 'like', "%{$v}%"))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => OrderResource::collection($pedidos->items()),
            'pagination' => [
                'total' => $pedidos->total(),
                'per_page' => $pedidos->perPage(),
                'current_page' => $pedidos->currentPage(),
                'last_page' => $pedidos->lastPage(),
            ],
        ]);
    }

    public function cambiarEstado(Request $request, Order $order)
    {
        $validated = $request->validate([
            'estado' => 'required|in:nuevo,pagado,preparando,enviado,entregado,cancelado,devuelto',
            'comentario' => 'nullable|string|max:500',
        ]);

        try {
            $order = app(OrderService::class)->transicionar(
                $order,
                OrderStatusEnum::from($validated['estado']),
                $validated['comentario'] ?? null,
                $request->user()
            );
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        return ApiResponse::success(
            new OrderResource($order->load(['items', 'statusHistories'])),
            'Estado actualizado'
        );
    }
}