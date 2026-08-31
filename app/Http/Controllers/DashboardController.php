<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\ApiResponse;

class DashboardController extends Controller
{
    public function resumen()
    {
        $hoy = now()->startOfDay();
        $mes = now()->startOfMonth();

        $ventasHoy = Order::where('status', '!=', 'cancelado')
            ->where('created_at', '>=', $hoy)
            ->sum('total');

        $ventasMes = Order::where('status', '!=', 'cancelado')
            ->where('created_at', '>=', $mes)
            ->sum('total');

        $pedidosHoy = Order::where('created_at', '>=', $hoy)->count();
        $pedidosMes = Order::where('created_at', '>=', $mes)->count();

        $agotados = Product::where('stock', '<=', 0)->count();
        $stockBajo = Product::where('stock', '>', 0)
            ->where('stock', '<=', config('ecommerce.low_stock_threshold', 5))
            ->count();

        return ApiResponse::success([
            'ventas_hoy' => round((float) $ventasHoy, 2),
            'ventas_mes' => round((float) $ventasMes, 2),
            'pedidos_hoy' => $pedidosHoy,
            'pedidos_mes' => $pedidosMes,
            'clientes' => User::where('estado', 'activo')->count(),
            'productos' => Product::count(),
            'productos_agotados' => $agotados,
            'productos_stock_bajo' => $stockBajo,
            'currency' => config('ecommerce.currency', 'COP'),
        ]);
    }

    public function ventasPorDia(Request $request)
    {
        $dias = (int) $request->get('dias', 30);

        $ventas = Order::where('status', '!=', 'cancelado')
            ->where('created_at', '>=', now()->subDays($dias))
            ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('SUM(total) as total'))
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->map(fn ($fila) => [
                'fecha' => $fila->fecha,
                'total' => round((float) $fila->total, 2),
            ]);

        return ApiResponse::success($ventas);
    }

    public function ventasPorCategoria()
    {
        $ventas = Order::where('status', '!=', 'cancelado')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->select(
                'categories.name as categoria',
                DB::raw('SUM(order_items.quantity) as unidades'),
                DB::raw('SUM(order_items.subtotal) as total')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->get();

        return ApiResponse::success($ventas);
    }

    public function topProductos(Request $request)
    {
        $limite = (int) $request->get('limite', 10);

        $top = Order::where('status', '!=', 'cancelado')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->select(
                'order_items.product_id',
                'order_items.name',
                DB::raw('SUM(order_items.quantity) as unidades'),
                DB::raw('SUM(order_items.subtotal) as total')
            )
            ->groupBy('order_items.product_id', 'order_items.name')
            ->orderByDesc('unidades')
            ->limit($limite)
            ->get()
            ->map(fn ($fila) => [
                'product_id' => $fila->product_id,
                'name' => $fila->name,
                'unidades' => (int) $fila->unidades,
                'total' => round((float) $fila->total, 2),
            ]);

        return ApiResponse::success($top);
    }

    public function usuariosRegistrados(Request $request)
    {
        $dias = (int) $request->get('dias', 30);

        $registros = User::where('created_at', '>=', now()->subDays($dias))
            ->select(DB::raw('DATE(created_at) as fecha'), DB::raw('COUNT(*) as total'))
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        return ApiResponse::success($registros);
    }
}