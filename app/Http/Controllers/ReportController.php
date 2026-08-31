<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    protected array $permitidos = ['csv', 'pdf', 'excel'];

    public function ventas(Request $request)
    {
        $query = Order::where('status', '!=', 'cancelado')
            ->when($request->desde, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->hasta, fn ($q, $v) => $q->whereDate('created_at', '<=', $v));

        $ventas = $query->with('user:id,nombre')->latest()->get();

        $filas = $ventas->map(fn ($o) => [
            'numero' => $o->numero,
            'cliente' => $o->user?->nombre ?? 'Invitado',
            'fecha' => $o->created_at?->toDateString(),
            'subtotal' => (float) $o->subtotal,
            'descuento' => (float) $o->discount,
            'envio' => (float) $o->shipping_cost,
            'impuestos' => (float) $o->tax,
            'total' => (float) $o->total,
            'estado' => $o->status,
        ]);

        if ($request->get('formato')) {
            return $this->exportar(
                ['Número', 'Cliente', 'Fecha', 'Subtotal', 'Descuento', 'Envío', 'Impuestos', 'Total', 'Estado'],
                $filas,
                'reporte-ventas',
                $request->get('formato')
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $filas,
                'totales' => [
                    'ventas' => $ventas->count(),
                    'ingresos' => round($ventas->sum('total'), 2),
                    'impuestos' => round($ventas->sum('tax'), 2),
                ],
            ],
        ]);
    }

    public function inventario(Request $request)
    {
        $productos = Product::with('variants')
            ->when($request->busqueda, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->get();

        $filas = $productos->map(fn ($p) => [
            'id' => $p->id,
            'nombre' => $p->name,
            'sku' => $p->sku,
            'stock' => (int) $p->stock,
            'precio' => (float) $p->precioEfectivo(),
            'estado' => $p->estado,
            'variantes' => $p->variants->count(),
        ]);

        if ($request->get('formato')) {
            return $this->exportar(
                ['ID', 'Nombre', 'SKU', 'Stock', 'Precio', 'Estado', 'Variantes'],
                $filas,
                'reporte-inventario',
                $request->get('formato')
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $filas,
                'totales' => [
                    'productos' => $productos->count(),
                    'stock_total' => $productos->sum('stock'),
                    'agotados' => $productos->where('stock', '<=', 0)->count(),
                ],
            ],
        ]);
    }

    public function clientes(Request $request)
    {
        $clientes = User::whereHas('roles', fn ($q) => $q->where('slug', 'cliente'))
            ->withCount('orders as total_pedidos')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'nombre' => $u->nombre,
                'email' => $u->email,
                'telefono' => $u->telefono,
                'registro' => $u->created_at?->toDateString(),
                'pedidos' => $u->total_pedidos,
            ]);

        if ($request->get('formato')) {
            return $this->exportar(
                ['ID', 'Nombre', 'Email', 'Teléfono', 'Registro', 'Pedidos'],
                $clientes,
                'reporte-clientes',
                $request->get('formato')
            );
        }

        return response()->json([
            'success' => true,
            'data' => ['items' => $clientes],
        ]);
    }

    public function productos(Request $request)
    {
        $top = Product::orderByDesc('stock')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'nombre' => $p->name,
                'sku' => $p->sku,
                'stock' => (int) $p->stock,
                'precio' => (float) $p->precioEfectivo(),
                'rating' => (float) $p->rating_avg,
                'resenas' => (int) $p->reviews_count,
            ]);

        if ($request->get('formato')) {
            return $this->exportar(
                ['ID', 'Nombre', 'SKU', 'Stock', 'Precio', 'Rating', 'Reseñas'],
                $top,
                'reporte-productos',
                $request->get('formato')
            );
        }

        return response()->json([
            'success' => true,
            'data' => ['items' => $top],
        ]);
    }

    protected function exportar(array $encabezados, $filas, string $base, string $formato)
    {
        $formato = in_array($formato, $this->permitidos) ? $formato : 'csv';
        $nombre = ExportService::nombre($base);

        return match ($formato) {
            'pdf' => app(ExportService::class)->pdf('pdf.reporte', [
                'titulo' => ucfirst(str_replace('-', ' ', $base)),
                'encabezados' => $encabezados,
                'filas' => $filas->toArray(),
            ], $nombre),
            'excel' => app(ExportService::class)->excel($encabezados, $filas->toArray(), $nombre),
            default => app(ExportService::class)->csv($encabezados, $filas->toArray(), $nombre),
        };
    }
}