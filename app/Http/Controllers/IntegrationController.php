<?php

namespace App\Http\Controllers;

use App\Enums\IntegrationEstadoEnum;
use App\Models\Auditoria;
use App\Models\Integration;
use App\Models\IntegrationSyncRun;
use App\Models\Order;
use App\Services\Integration\IntegrationException;
use App\Services\IntegrationCredentialService;
use App\Services\SyncService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function __construct(
        private IntegrationCredentialService $credentialService
    ) {
    }

    public function sistemas()
    {
        $sistemas = [];
        foreach (config('integrations.providers', []) as $key => $meta) {
            $sistemas[] = [
                'key' => $key,
                'label' => $meta['label'] ?? $key,
                'description' => $meta['description'] ?? null,
                'version' => $meta['version'] ?? null,
                'capabilities' => $meta['capabilities'] ?? [],
                'supports_login' => (bool) ($meta['supports_login'] ?? false),
                'fields' => $meta['fields'] ?? [],
            ];
        }

        return ApiResponse::success($sistemas);
    }

    public function index()
    {
        $integraciones = Integration::latest()->get()->map(fn (Integration $i) => $this->serializar($i));

        return ApiResponse::success([
            'items' => $integraciones,
            'pagination' => [
                'total' => $integraciones->count(),
                'per_page' => $integraciones->count(),
                'current_page' => 1,
                'last_page' => 1,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $proveedores = array_keys(config('integrations.class_map', []));

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'provider' => 'required|string|in:' . implode(',', $proveedores),
            'soporta_login' => 'nullable|boolean',
            'rol_login_federado' => 'nullable|string|max:50',
            'login_fallback_local' => 'nullable|boolean',
            'config_sincronizacion' => 'nullable|array',
            'credenciales' => 'nullable|array',
        ]);

        $integration = Integration::create([
            'nombre' => $validated['nombre'],
            'provider' => $validated['provider'],
            'estado' => IntegrationEstadoEnum::SIN_CREDENCIALES->value,
            'soporta_login' => (bool) ($validated['soporta_login'] ?? false),
            'rol_login_federado' => $validated['rol_login_federado'] ?? null,
            'login_fallback_local' => (bool) ($validated['login_fallback_local'] ?? true),
            'config_sincronizacion' => $this->configSyncDefault($validated['config_sincronizacion'] ?? null, $validated['provider']),
            'activa' => true,
        ]);

        if (!empty($validated['credenciales'])) {
            $this->credentialService->guardar($integration, $validated['credenciales']);
        }

        // Estado inicial según configuración real: con credenciales
        // requeridas guardadas queda lista para activar.
        $integration->update([
            'estado' => $this->credentialService->estaConfigurado($integration)
                ? IntegrationEstadoEnum::INACTIVA->value
                : IntegrationEstadoEnum::SIN_CREDENCIALES->value,
        ]);

        Auditoria::registrar($request->user(), 'crear', "Creó la integración '{$integration->nombre}'", $integration);

        return ApiResponse::success($this->serializar($integration->fresh()), 'Integración creada', 201);
    }

    public function show(Integration $integration)
    {
        return ApiResponse::success($this->serializar($integration));
    }

    public function update(Request $request, Integration $integration)
    {
        $proveedores = array_keys(config('integrations.class_map', []));

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'provider' => 'sometimes|string|in:' . implode(',', $proveedores),
            'soporta_login' => 'nullable|boolean',
            'rol_login_federado' => 'nullable|string|max:50',
            'login_fallback_local' => 'nullable|boolean',
            'config_sincronizacion' => 'nullable|array',
            'credenciales' => 'nullable|array',
        ]);

        $datos = array_intersect_key($validated, array_flip([
            'nombre', 'provider', 'soporta_login', 'rol_login_federado', 'login_fallback_local',
        ]));
        $datos['rol_login_federado'] = $validated['rol_login_federado'] ?? $integration->rol_login_federado;

        if (array_key_exists('config_sincronizacion', $validated)) {
            $datos['config_sincronizacion'] = $this->configSyncDefault(
                $validated['config_sincronizacion'],
                $integration->provider
            );
        }

        $integration->update($datos);

        if (!empty($validated['credenciales'])) {
            $this->credentialService->guardar($integration, $validated['credenciales']);
        }

        if ($integration->estado === IntegrationEstadoEnum::SIN_CREDENCIALES->value
            && $this->credentialService->estaConfigurado($integration)) {
            $integration->update(['estado' => IntegrationEstadoEnum::INACTIVA->value]);
        }

        Auditoria::registrar($request->user(), 'editar', "Actualizó la integración '{$integration->nombre}'", $integration);

        return ApiResponse::success($this->serializar($integration->fresh()), 'Integración actualizada');
    }

    public function destroy(Request $request, Integration $integration)
    {
        $nombre = $integration->nombre;
        $integration->delete();

        Auditoria::registrar($request->user(), 'eliminar', "Eliminó la integración '{$nombre}'");

        return ApiResponse::success(null, 'Integración eliminada');
    }

    public function probar(Integration $integration)
    {
        if (!$this->credentialService->estaConfigurado($integration)) {
            return ApiResponse::error('La integración no tiene credenciales configuradas.', 422, 'SIN_CREDENCIALES');
        }

        $resultado = $this->credentialService->probarConexion($integration);

        $integration->events()->create([
            'tipo' => 'conexion.probada',
            'severidad' => $resultado['success'] ? 'info' : 'error',
            'mensaje' => $resultado['message'],
        ]);

        if (!$resultado['success']) {
            return ApiResponse::error($resultado['message'], 422, 'CONEXION_FALLIDA');
        }

        return ApiResponse::success($resultado, $resultado['message']);
    }

    public function activar(Request $request, Integration $integration)
    {
        if (!$this->credentialService->estaConfigurado($integration)) {
            return ApiResponse::error('Configura las credenciales antes de activar la integración.', 422, 'SIN_CREDENCIALES');
        }

        if (!$this->credentialService->proveedor($integration) instanceof \App\Services\Integration\IntegrationProvider) {
            return ApiResponse::error('El proveedor de la integración no es válido.', 422, 'PROVEEDOR_INVALIDO');
        }

        $integration->update([
            'estado' => IntegrationEstadoEnum::ACTIVA->value,
            'activa' => true,
            'intentos_fallo' => 0,
        ]);

        Auditoria::registrar($request->user(), 'editar', "Activó la integración '{$integration->nombre}'", $integration);

        return ApiResponse::success($this->serializar($integration->fresh()), 'Integración activada');
    }

    public function desactivar(Request $request, Integration $integration)
    {
        $integration->update([
            'estado' => IntegrationEstadoEnum::INACTIVA->value,
            'activa' => false,
        ]);

        Auditoria::registrar($request->user(), 'editar', "Desactivó la integración '{$integration->nombre}'", $integration);

        return ApiResponse::success($this->serializar($integration->fresh()), 'Integración desactivada');
    }

    public function ejecuciones(Request $request, Integration $integration)
    {
        $runs = IntegrationSyncRun::where('integration_id', $integration->id)
            ->when($request->estado, fn ($q, $v) => $q->where('estado', $v))
            ->latest('iniciado_en')
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 10));

        return ApiResponse::success([
            'items' => $runs->items(),
            'pagination' => [
                'total' => $runs->total(),
                'per_page' => $runs->perPage(),
                'current_page' => $runs->currentPage(),
                'last_page' => $runs->lastPage(),
            ],
        ]);
    }

    public function sincronizar(Request $request, Integration $integration, SyncService $syncService)
    {
        $validated = $request->validate([
            'tipo' => 'sometimes|in:productos,inventario,compras,ventas,inicial,todo',
        ]);

        if (!$this->credentialService->estaConfigurado($integration)) {
            return ApiResponse::error('Configura las credenciales antes de sincronizar.', 422, 'SIN_CREDENCIALES');
        }

        if ($integration->estado === IntegrationEstadoEnum::SINCRONIZANDO->value) {
            return ApiResponse::error('La integración ya tiene una ejecución en curso.', 422, 'EN_CURSO');
        }

        $tipo = $validated['tipo'] ?? 'todo';
        $capacidades = config("integrations.providers.{$integration->provider}.capabilities", []);

        if (in_array($tipo, ['compras', 'ventas'], true) && !in_array($tipo, $capacidades, true)) {
            return ApiResponse::error(
                "El proveedor '{$integration->provider}' no soporta la sincronización de {$tipo}.",
                422,
                'CAPABILIDAD_NO_SOPORTADA'
            );
        }

        try {
            $run = $syncService->sincronizar(
                $integration,
                $tipo,
                'manual',
                $request->user()->id
            );
        } catch (IntegrationException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'SYNC_NO_DISPONIBLE');
        }

        Auditoria::registrar($request->user(), 'editar', "Sincronizó la integración '{$integration->nombre}'", $integration);

        return ApiResponse::success([
            'run' => [
                'id' => $run->id,
                'tipo' => $run->tipo,
                'estado' => $run->estado,
                'procesados' => $run->procesados,
                'creados' => $run->creados,
                'actualizados' => $run->actualizados,
                'omitidos' => $run->omitidos,
                'errores' => $run->errores,
                'iniciado_en' => optional($run->iniciado_en)->toIso8601String(),
                'finalizado_en' => optional($run->finalizado_en)->toIso8601String(),
            ],
        ], 'Sincronización ejecutada', 201);
    }

    public function importacionInicial(Request $request, Integration $integration, SyncService $syncService)
    {
        $validated = $request->validate([
            'dry_run' => 'nullable|boolean',
        ]);

        if (!$this->credentialService->estaConfigurado($integration)) {
            return ApiResponse::error('Configura las credenciales antes de importar.', 422, 'SIN_CREDENCIALES');
        }

        if (filter_var($validated['dry_run'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $provider = $this->credentialService->proveedor($integration);
            $credenciales = $this->credentialService->obtener($integration);
            $respuesta = $provider->obtenerProductos($credenciales, null, 1);

            return ApiResponse::success([
                'preview' => [
                    'total_externos' => $respuesta['total'],
                    'registros_existentes' => $integration->records()->where('tipo', 'producto')->count(),
                    'proyectados' => max(0, $respuesta['total'] - $integration->records()->where('tipo', 'producto')->count()),
                ],
            ], 'Vista previa generada');
        }

        $run = $syncService->sincronizar($integration, 'inicial', 'manual', $request->user()->id);

        Auditoria::registrar($request->user(), 'editar', "Ejecutó la importación inicial de '{$integration->nombre}'", $integration);

        return ApiResponse::success([
            'run' => [
                'id' => $run->id,
                'estado' => $run->estado,
                'creados' => $run->creados,
                'actualizados' => $run->actualizados,
                'omitidos' => $run->omitidos,
                'errores' => $run->errores,
            ],
        ], 'Importación inicial ejecutada', 201);
    }

    private function configSyncDefault(?array $config, string $provider): array
    {
        $defaults = [
            'frecuencia_minutos' => (int) config('integrations.sync.frecuencia_default_minutos', 60),
            'direccion' => 'externo_manda',
            'productos' => true,
            'inventario' => true,
            'compras' => true,
            'ventas' => true,
        ];

        if (!is_array($config)) {
            $config = [];
        }

        $meta = config("integrations.providers.{$provider}", []);
        $capabilities = $meta['capabilities'] ?? [];

        foreach (['productos', 'inventario', 'compras', 'ventas'] as $clave) {
            if (!in_array($clave, $capabilities, true)) {
                unset($defaults[$clave]);
            }
        }

        return array_merge($defaults, array_intersect_key($config, $defaults));
    }

    /**
     * Documentos externos de compras (entrada) de la integración.
     */
    public function compras(Request $request, Integration $integration)
    {
        $docs = $integration->externalDocs()
            ->where('tipo', 'compra')
            ->when($request->estado, fn ($q, $v) => $q->where('estado', $v))
            ->latest('id')
            ->paginate($request->get('per_page', 10));

        $items = collect($docs->items())->map(fn ($doc) => [
            'id' => $doc->id,
            'external_id' => $doc->external_id,
            'estado' => $doc->estado,
            'fecha' => $doc->payload['fecha'] ?? null,
            'proveedor' => $doc->payload['proveedor'] ?? null,
            'skus_pendientes' => $doc->payload['skus_pendientes'] ?? [],
            'lineas' => count($doc->payload['lineas'] ?? []),
            'created_at' => optional($doc->created_at)->toIso8601String(),
        ]);

        return ApiResponse::success([
            'items' => $items,
            'pagination' => [
                'total' => $docs->total(),
                'per_page' => $docs->perPage(),
                'current_page' => $docs->currentPage(),
                'last_page' => $docs->lastPage(),
            ],
        ]);
    }

    /**
     * Cola de ventas (salida) hacia el ERP: pedidos de la integración con
     * su estado de envío.
     */
    public function ventas(Request $request, Integration $integration)
    {
        $query = Order::query()
            ->whereNotNull('integration_erp_estado')
            ->when(
                $request->queue === 'cola',
                fn ($q) => $q->where(function ($q2) use ($integration) {
                    $q2->whereIn('integration_erp_estado', ['pendiente_envio'])
                        ->orWhere(function ($q3) {
                            $q3->where('integration_erp_estado', 'error')
                                ->where('integration_erp_error_transitorio', true);
                        });
                })
            )
            ->when($request->estado, fn ($q, $v) => $q->where('integration_erp_estado', $v))
            ->when(
                $request->queue === 'cola',
                fn ($q) => $q->where(function ($q2) use ($integration) {
                    $q2->whereNull('integration_erp_id')->orWhere('integration_erp_id', $integration->id);
                }),
                fn ($q) => $q->where('integration_erp_id', $integration->id)
            )
            ->latest('id');

        $pedidos = $query->paginate($request->get('per_page', 10));

        return ApiResponse::success([
            'items' => collect($pedidos->items())->map(fn ($order) => [
                'order_id' => $order->id,
                'numero' => $order->numero,
                'estado' => $order->integration_erp_estado,
                'estado_label' => \App\Enums\OrderErpEstadoEnum::tryFrom($order->integration_erp_estado)?->label()
                    ?? $order->integration_erp_estado,
                'error' => $order->integration_erp_error,
                'error_transitorio' => (bool) $order->integration_erp_error_transitorio,
                'externo_id' => $order->integration_erp_externo_id,
                'enviado_en' => optional($order->integration_erp_enviado_en)->toIso8601String(),
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'created_at' => optional($order->created_at)->toIso8601String(),
            ]),
            'pagination' => [
                'total' => $pedidos->total(),
                'per_page' => $pedidos->perPage(),
                'current_page' => $pedidos->currentPage(),
                'last_page' => $pedidos->lastPage(),
            ],
        ]);
    }

    private function serializar(Integration $integration): array
    {
        $credenciales = $this->credentialService->obtener($integration);
        $meta = config("integrations.providers.{$integration->provider}", []);

        $campos = [];
        foreach (array_keys($meta['fields'] ?? []) as $campo) {
            $campos[$campo] = !empty($credenciales[$campo] ?? null);
        }

        $ultimoRun = $integration->syncRuns()->latest('iniciado_en')->orderByDesc('id')->first();

        return [
            'id' => $integration->id,
            'nombre' => $integration->nombre,
            'provider' => $integration->provider,
            'provider_info' => [
                'label' => $meta['label'] ?? $integration->provider,
                'description' => $meta['description'] ?? null,
                'version' => $meta['version'] ?? null,
                'capabilities' => $meta['capabilities'] ?? [],
                'supports_login' => (bool) ($meta['supports_login'] ?? false),
            ],
            'estado' => $integration->estado,
            'estado_label' => IntegrationEstadoEnum::tryFrom($integration->estado)?->label() ?? $integration->estado,
            'configurado' => $this->credentialService->estaConfigurado($integration),
            'credenciales_configuradas' => $campos,
            'soporta_login' => $integration->soporta_login,
            'rol_login_federado' => $integration->rol_login_federado,
            'login_fallback_local' => (bool) $integration->login_fallback_local,
            'config_sincronizacion' => $integration->config_sincronizacion,
            'ultimo_sincronizado' => optional($integration->ultimo_sincronizado)->toIso8601String(),
            'ultimo_estado' => $integration->ultimo_estado,
            'intentos_fallo' => $integration->intentos_fallo,
            'activa' => $integration->activa,
            'ultima_ejecucion' => $ultimoRun ? [
                'id' => $ultimoRun->id,
                'tipo' => $ultimoRun->tipo,
                'estado' => $ultimoRun->estado,
                'procesados' => $ultimoRun->procesados,
                'creados' => $ultimoRun->creados,
                'actualizados' => $ultimoRun->actualizados,
                'omitidos' => $ultimoRun->omitidos,
                'errores' => $ultimoRun->errores,
                'iniciado_en' => optional($ultimoRun->iniciado_en)->toIso8601String(),
                'finalizado_en' => optional($ultimoRun->finalizado_en)->toIso8601String(),
            ] : null,
            'created_at' => optional($integration->created_at)->toIso8601String(),
            'updated_at' => optional($integration->updated_at)->toIso8601String(),
        ];
    }
}
