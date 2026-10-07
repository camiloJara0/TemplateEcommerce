<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->only([
            'usuario',
            'accion',
            'fecha',
        ]);

        $auditlogs = Auditoria::with('usuario')
            ->when($filtros['usuario'] ?? null, function ($query, $usuario) {
                $query->whereHas('usuario', function ($q) use ($usuario) {
                    $q->where('nombre', 'like', "%{$usuario}%");
                });
            })
            ->when($filtros['accion'] ?? null, function ($query, $accion) {
                $query->where('accion', 'like', "%{$accion}%");
            })
            ->when($filtros['fecha'] ?? null, function ($query, $fecha) {
                $query->whereDate('created_at', $fecha);
            })
            ->paginate($request->get('per_page', 12));

        return ApiResponse::success([
            'items' => $auditlogs->items(),
            'pagination' => [
                'total' => $auditlogs->total(),
                'per_page' => $auditlogs->perPage(),
                'current_page' => $auditlogs->currentPage(),
                'last_page' => $auditlogs->lastPage(),
            ],
        ]);
    }

    public function filtros()
    {
        $usuario = DB::table('audit_logs')
            ->join('users', 'audit_logs.usuario_id', '=', 'users.id')
            ->select('users.nombre')
            ->distinct()
            ->pluck('nombre');
        $accion = DB::table('audit_logs')->select('accion')->distinct()->pluck('accion');

        return response()->json([
            'success' => true,
            'data' => [
                'usuarios' => $usuario,
                'acciones' => $accion,
            ]
        ]);
    }

}