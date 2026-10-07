<?php

namespace App\Http\Controllers;

use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use App\Support\ApiResponse;

class WebhookEventController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->only(['provider', 'estado', 'fecha', 'busqueda']);

        $eventos = WebhookEvent::with(['payment:id,order_id,provider,status,amount', 'order:id,numero,status'])
            ->when($filtros['provider'] ?? null, fn ($q, $v) => $q->where('provider', $v))
            ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->where('estado', $v))
            ->when($filtros['fecha'] ?? null, fn ($q, $v) => $q->whereDate('created_at', $v))
            ->when($filtros['busqueda'] ?? null, function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('event_id', 'like', "%{$v}%")
                        ->orWhere('tipo', 'like', "%{$v}%")
                        ->orWhere('error', 'like', "%{$v}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $eventos->items(),
            'pagination' => [
                'total' => $eventos->total(),
                'per_page' => $eventos->perPage(),
                'current_page' => $eventos->currentPage(),
                'last_page' => $eventos->lastPage(),
            ],
            'resumen' => $this->resumen(),
        ]);
    }

    public function show(WebhookEvent $evento)
    {
        $evento->load(['payment:id,order_id,provider,status,amount,transaction_id', 'order:id,numero,status,total']);

        return ApiResponse::success([
            'evento' => $evento,
            'resumen' => $this->resumen(),
        ]);
    }

    public function reintentar(WebhookEvent $evento)
    {
        return app(WebhookController::class)->reintentar($evento);
    }

    public function proveedores()
    {
        return ApiResponse::success([
            'providers' => array_keys(config('payments.class_map', [])),
            'estados' => [
                WebhookEvent::ESTADO_RECIBIDO,
                WebhookEvent::ESTADO_PROCESADO,
                WebhookEvent::ESTADO_DUPLICADO,
                WebhookEvent::ESTADO_IGNORADO,
                WebhookEvent::ESTADO_ERROR,
            ],
        ]);
    }

    protected function resumen(): array
    {
        return WebhookEvent::selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN estado = "procesado" THEN 1 ELSE 0 END) as procesados,
                SUM(CASE WHEN estado = "error" THEN 1 ELSE 0 END) as errores,
                SUM(CASE WHEN estado = "ignorado" THEN 1 ELSE 0 END) as ignorados
            ')
            ->first()
            ->toArray();
    }
}
