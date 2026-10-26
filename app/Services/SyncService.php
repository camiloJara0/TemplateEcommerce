<?php

namespace App\Services;

use App\Enums\IntegrationEstadoEnum;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\IntegrationExternalDoc;
use App\Models\IntegrationRecord;
use App\Models\IntegrationSyncRun;
use App\Models\Product;
use App\Models\VariantAttribute;
use App\Services\Integration\IntegrationException;
use App\Services\Integration\IntegrationProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncService
{
    public function __construct(
        private IntegrationCredentialService $credentialService
    ) {
    }

    /**
     * ¿Vence la frecuencia programada de la integración?
     */
    public function vence(Integration $integration): bool
    {
        if ($integration->estado !== IntegrationEstadoEnum::ACTIVA->value) {
            return false;
        }

        $frecuencia = (int) ($integration->config_sincronizacion['frecuencia_minutos']
            ?? config('integrations.sync.frecuencia_default_minutos', 60));

        if (!$integration->ultimo_sincronizado) {
            return true;
        }

        return $integration->ultimo_sincronizado->copy()->addMinutes($frecuencia)->isPast();
    }

    /**
     * Ejecuta un sync (por lotes, sin cola) y retorna el run.
     */
    public function sincronizar(
        Integration $integration,
        string $tipo = 'todo',
        string $origen = 'manual',
        ?int $usuarioId = null
    ): IntegrationSyncRun {
        $lock = Cache::lock("integrations:sync:{$integration->id}", 300);

        if (!$lock->get()) {
            throw new IntegrationException('La integración ya tiene una ejecución en curso.', true);
        }

        $maxAttempts = (int) config('integrations.sync.max_attempts', 4);

        $run = IntegrationSyncRun::create([
            'integration_id' => $integration->id,
            'tipo' => $tipo,
            'origen' => $origen,
            'estado' => 'iniciando',
            'usuario_id' => $usuarioId,
            'iniciado_en' => now(),
            'procesados' => 0,
            'creados' => 0,
            'actualizados' => 0,
            'omitidos' => 0,
            'errores' => 0,
        ]);

        $integration->update(['estado' => IntegrationEstadoEnum::SINCRONIZANDO->value]);

        try {
            $provider = $this->credentialService->proveedor($integration);
            $credenciales = $this->credentialService->obtener($integration);

            $run->update(['estado' => 'en_curso']);

            $capacidad = fn (string $clave): bool => in_array(
                $clave,
                config("integrations.providers.{$integration->provider}.capabilities", []),
                true
            );
            $habilitado = fn (string $clave): bool => (bool) ($integration->config_sincronizacion[$clave] ?? true);

            if (in_array($tipo, ['productos', 'inicial', 'todo'], true)
                && ($tipo !== 'todo' || ($habilitado('productos') && $capacidad('productos')))) {
                $this->sincronizarProductos($integration, $provider, $credenciales, $run, $tipo === 'inicial');
            }

            if (in_array($tipo, ['inventario', 'todo'], true)
                && ($tipo !== 'todo' || ($habilitado('inventario') && $capacidad('inventario')))) {
                $this->sincronizarInventario($integration, $provider, $credenciales, $run);
            }

            if (in_array($tipo, ['compras', 'todo'], true)
                && ($tipo === 'compras' || ($habilitado('compras') && $capacidad('compras')))) {
                $this->sincronizarCompras($integration, $provider, $credenciales, $run);
            }

            if (in_array($tipo, ['ventas', 'todo'], true)
                && ($tipo === 'ventas' || ($habilitado('ventas') && $capacidad('ventas')))) {
                $this->sincronizarVentas($integration, $run);
            }

            $exitosa = $run->errores === 0;
            $trabajos = $run->creados + $run->actualizados
                + (int) ($run->resumen['compras_aplicadas'] ?? 0)
                + (int) ($run->resumen['ventas_enviadas'] ?? 0);
            $fallida = $run->errores > 0 && $trabajos === 0;
            $estadoFinal = $exitosa ? 'exitosa' : ($fallida ? 'fallida' : 'parcial');

            $run->update([
                'estado' => $estadoFinal,
                'finalizado_en' => now(),
                'resumen' => array_merge($run->resumen ?? [], [
                    'procesados' => $run->procesados,
                    'creados' => $run->creados,
                    'actualizados' => $run->actualizados,
                    'omitidos' => $run->omitidos,
                    'errores' => $run->errores,
                ]),
            ]);

            $intentos = $estadoFinal === 'fallida' ? $integration->intentos_fallo + 1 : 0;

            $integration->update([
                'estado' => $intentos >= $maxAttempts
                    ? IntegrationEstadoEnum::PAUSADA_POR_ERRORES->value
                    : ($estadoFinal === 'fallida'
                        ? IntegrationEstadoEnum::CON_ERRORES->value
                        : IntegrationEstadoEnum::ACTIVA->value),
                'ultimo_sincronizado' => now(),
                'ultimo_estado' => $estadoFinal,
                'intentos_fallo' => $intentos,
            ]);

            return $run;
        } catch (\Throwable $e) {
            $this->registrarEvento($integration, $run, 'sync.fallida', $e, null, 'error');

            $run->update(['estado' => 'fallida', 'finalizado_en' => now()]);
            $intentos = $integration->intentos_fallo + 1;

            $integration->update([
                'estado' => $intentos >= $maxAttempts
                    ? IntegrationEstadoEnum::PAUSADA_POR_ERRORES->value
                    : IntegrationEstadoEnum::CON_ERRORES->value,
                'ultimo_estado' => 'fallida',
                'intentos_fallo' => $intentos,
            ]);

            return $run;
        } finally {
            $lock->release();
        }
    }

    private function sincronizarProductos(
        Integration $integration,
        IntegrationProvider $provider,
        array $credenciales,
        IntegrationSyncRun $run,
        bool $inicial
    ): void {
        $desde = $inicial ? null : $this->desdeIncremental($integration);
        $pagina = 1;

        while (true) {
            $respuesta = $provider->obtenerProductos($credenciales, $desde, $pagina);

            if (empty($respuesta['items'])) {
                break;
            }

            foreach ($respuesta['items'] as $registro) {
                if ($run->procesados >= $this->maxPorRun()) {
                    return;
                }

                try {
                    $normalizado = $provider->normalizarProducto($registro);
                    $this->aplicarProducto($integration, $normalizado, $run);
                } catch (\Throwable $e) {
                    $run->increment('errores');
                    $this->registrarEvento(
                        $integration,
                        $run,
                        'producto.error',
                        $e,
                        ['external_id' => $registro['id'] ?? null],
                        'error'
                    );
                }

                $run->increment('procesados');
            }

            $pagina++;

            if ($pagina > 500) {
                break;
            }
        }
    }

    private function sincronizarInventario(
        Integration $integration,
        IntegrationProvider $provider,
        array $credenciales,
        IntegrationSyncRun $run
    ): void {
        $desde = $this->desdeIncremental($integration);
        $pagina = 1;

        while (true) {
            $respuesta = $provider->obtenerInventario($credenciales, $desde, $pagina);

            if (empty($respuesta['items'])) {
                break;
            }

            foreach ($respuesta['items'] as $registro) {
                try {
                    $normalizado = $provider->normalizarInventario($registro);
                    $this->aplicarInventario($integration, $normalizado, $run);
                } catch (\Throwable $e) {
                    $run->increment('errores');
                    $this->registrarEvento(
                        $integration,
                        $run,
                        'inventario.error',
                        $e,
                        ['external_id' => $registro['producto_id'] ?? null],
                        'error'
                    );
                }

                $run->increment('procesados');
            }

            $pagina++;

            if ($pagina > 500) {
                break;
            }
        }
    }

    /**
     * Compras/entradas del ERP → inventario de la tienda (HU-044).
     *
     * Idempotencia por número de compra externo (integration_external_docs):
     * una compra ya aplicada se omite; si alguna línea apunta a un producto
     * inexistente, la compra queda como pendiente de resolver (no crea
     * productos huérfanos ni aplica stock parcial).
     */
    private function sincronizarCompras(
        Integration $integration,
        IntegrationProvider $provider,
        array $credenciales,
        IntegrationSyncRun $run
    ): void {
        $desde = $this->desdeIncremental($integration);
        $pagina = 1;
        $aplicadas = 0;
        $pendientes = 0;

        try {
            while (true) {
                $respuesta = $provider->obtenerCompras($credenciales, $desde, $pagina);

                if (empty($respuesta['items'])) {
                    break;
                }

                foreach ($respuesta['items'] as $registro) {
                    if ($run->procesados >= $this->maxPorRun()) {
                        return;
                    }

                    try {
                        $compra = $provider->normalizarCompra($registro);
                        $resultado = $this->aplicarCompra($integration, $compra, $run);

                        if ($resultado === 'aplicada') {
                            $aplicadas++;
                        } elseif ($resultado === 'pendiente') {
                            $pendientes++;
                        }
                    } catch (\Throwable $e) {
                        $run->increment('errores');
                        $this->registrarEvento(
                            $integration,
                            $run,
                            'compra.error',
                            $e,
                            ['external_id' => $registro['numero'] ?? $registro['id'] ?? null],
                            'error'
                        );
                    }

                    $run->increment('procesados');
                }

                $pagina++;

                if ($pagina > 500) {
                    break;
                }
            }
        } catch (\Throwable $e) {
            $run->increment('errores');
            $this->registrarEvento(
                $integration,
                $run,
                'compras.error',
                $e,
                null,
                'error'
            );
        } finally {
            $run->update([
                'resumen' => array_merge($run->resumen ?? [], [
                    'compras_aplicadas' => $aplicadas,
                    'compras_pendientes' => $pendientes,
                ]),
            ]);
        }
    }

    /**
     * @return string 'aplicada' | 'pendiente' | 'omitida'
     */
    private function aplicarCompra(Integration $integration, array $compra, IntegrationSyncRun $run): string
    {
        return DB::transaction(function () use ($integration, $compra, $run) {
            $doc = IntegrationExternalDoc::where('integration_id', $integration->id)
                ->where('tipo', 'compra')
                ->where('external_id', $compra['external_id'])
                ->lockForUpdate()
                ->first();

            if ($doc && $doc->estado === 'aplicada') {
                $run->increment('omitidos');

                return 'omitida';
            }

            // Resolver líneas contra el catálogo local por SKU.
            $lineas = [];
            $pendientes = [];
            foreach ($compra['lineas'] as $linea) {
                $producto = Product::where('sku', $linea['sku'])->first();
                if ($producto) {
                    $lineas[] = ['producto' => $producto, 'linea' => $linea];
                } else {
                    $pendientes[] = $linea['sku'];
                }
            }

            $datos = [
                'local_type' => null,
                'local_id' => null,
                'payload' => [
                    'numero' => $compra['external_id'],
                    'fecha' => $compra['fecha'],
                    'proveedor' => $compra['proveedor'],
                    'lineas' => $compra['lineas'],
                    'skus_pendientes' => $pendientes,
                ],
            ];

            if ($pendientes !== []) {
                $datos['estado'] = 'pendiente_resolucion';
                $doc = $doc ?: new IntegrationExternalDoc([
                    'integration_id' => $integration->id,
                    'tipo' => 'compra',
                    'external_id' => $compra['external_id'],
                ]);
                $doc->fill($datos);
                $doc->save();

                $this->registrarEvento(
                    $integration,
                    $run,
                    'compra.pendiente_resolucion',
                    new IntegrationException(
                        "Compra {$compra['external_id']} pendiente de resolver: sin producto para SKU "
                        . implode(', ', $pendientes) . '.',
                        false
                    ),
                    [
                        'external_id' => $compra['external_id'],
                        'skus_pendientes' => $pendientes,
                    ],
                    'info'
                );

                return 'pendiente';
            }

            $doc = $doc ?: new IntegrationExternalDoc([
                'integration_id' => $integration->id,
                'tipo' => 'compra',
                'external_id' => $compra['external_id'],
            ]);
            $datos['estado'] = 'aplicada';
            $doc->fill($datos);
            $doc->save();

            $inventory = app(InventoryService::class);
            foreach ($lineas as $item) {
                $inventory->entrada(
                    $item['producto'],
                    (int) $item['linea']['cantidad'],
                    'compra_externa',
                    $doc
                );
            }

            return 'aplicada';
        });
    }

    /**
     * Ventas de la tienda en cola → ERP (HU-045). La cola persistente vive
     * en VentaErpService (pendientes + errores transitorios).
     */
    private function sincronizarVentas(Integration $integration, IntegrationSyncRun $run): void
    {
        $service = app(VentaErpService::class);
        $enviadas = 0;

        try {
            foreach ($service->cola($integration)->get() as $order) {
                if ($run->procesados >= $this->maxPorRun()) {
                    return;
                }

                try {
                    $service->enviar($integration, $order, $run);
                    $enviadas++;
                } catch (\Throwable $e) {
                    $run->increment('errores');
                }

                $run->increment('procesados');
            }
        } catch (\Throwable $e) {
            $run->increment('errores');
            $this->registrarEvento(
                $integration,
                $run,
                'ventas.error',
                $e,
                null,
                'error'
            );
        } finally {
            $run->update([
                'resumen' => array_merge($run->resumen ?? [], [
                    'ventas_enviadas' => $enviadas,
                ]),
            ]);
        }
    }

    /**
     * Upsert idempotente de producto por external_id/sku (RN-33).
     */
    private function aplicarProducto(Integration $integration, array $p, IntegrationSyncRun $run): void
    {
        $hash = md5(json_encode(array_diff_key($p, ['updated_at' => true])));

        $record = IntegrationRecord::where('integration_id', $integration->id)
            ->where('tipo', 'producto')
            ->where('external_id', $p['external_id'])
            ->first();

        if ($record && $record->hash_contenido === $hash) {
            $record->update(['ultimo_sincronizado' => now()]);
            $run->increment('omitidos');

            return;
        }

        $producto = null;
        if ($record) {
            $producto = Product::find($record->local_id);
        }
        $producto = $producto ?: Product::where('sku', $p['sku'])->first();

        $categoriaId = null;
        if (!empty($p['category'])) {
            $categoriaId = Category::firstOrCreate(['name' => $p['category']])->id;
        }

        $marcaId = null;
        if (!empty($p['brand'])) {
            $marcaId = Brand::firstOrCreate(['name' => $p['brand']])->id;
        }

        $datos = [
            'category_id' => $categoriaId,
            'brand_id' => $marcaId,
            'name' => $p['name'],
            'slug' => $p['slug'],
            'description' => $p['description'],
            'sku' => $p['sku'],
            'price' => $p['price'],
            'price_discount' => $p['price_discount'],
            'weight' => $p['weight'],
            'estado' => $p['estado'],
        ];

        if ($producto) {
            $producto->update($datos);
            $run->increment('actualizados');
        } else {
            $datos['stock'] = $p['stock'];
            $producto = Product::create($datos);
            $run->increment('creados');
        }

        if (!empty($p['images'])) {
            $producto->images()->delete();
            foreach (array_values($p['images']) as $pos => $url) {
                $producto->images()->create(['url' => $url, 'position' => $pos]);
            }
        }

        $this->sincronizarVariantes($producto, $p['variantes']);

        if ($producto->variants()->exists()) {
            $producto->update(['stock' => $producto->variants()->sum('stock')]);
        } else {
            $producto->update(['stock' => $p['stock']]);
        }

        IntegrationRecord::updateOrCreate(
            [
                'integration_id' => $integration->id,
                'tipo' => 'producto',
                'external_id' => $p['external_id'],
            ],
            [
                'local_type' => Product::class,
                'local_id' => $producto->id,
                'hash_contenido' => $hash,
                'ultimo_sincronizado' => now(),
            ]
        );
    }

    private function sincronizarVariantes(Product $producto, array $variantes): void
    {
        $idsProcesados = [];

        foreach ($variantes as $v) {
            $variante = $producto->variants()->where('sku', $v['sku'])->first();

            if ($variante) {
                $variante->update([
                    'price' => $v['price'],
                    'price_discount' => $v['price_discount'],
                    'stock' => $v['stock'],
                ]);
            } else {
                $variante = $producto->variants()->create([
                    'sku' => $v['sku'],
                    'price' => $v['price'],
                    'price_discount' => $v['price_discount'],
                    'stock' => $v['stock'],
                ]);
            }

            $valoresIds = [];
            foreach ($v['atributos'] as $atributo) {
                $modeloAtributo = VariantAttribute::firstOrCreate(['name' => $atributo['nombre']]);
                $valor = $modeloAtributo->values()->firstOrCreate(['value' => $atributo['valor']]);
                $valoresIds[] = $valor->id;
            }

            $variante->attributeValues()->sync($valoresIds);
            $idsProcesados[] = $variante->id;
        }

        $producto->variants()
            ->when($idsProcesados, fn ($q) => $q->whereNotIn('id', $idsProcesados))
            ->delete();
    }

    /**
     * Ajuste de stock absoluto vía InventoryService (RN-25 referencia morph).
     */
    private function aplicarInventario(Integration $integration, array $inv, IntegrationSyncRun $run): void
    {
        $producto = null;

        if ($inv['external_id']) {
            $record = IntegrationRecord::where('integration_id', $integration->id)
                ->where('tipo', 'producto')
                ->where('external_id', $inv['external_id'])
                ->first();

            if ($record) {
                $producto = Product::find($record->local_id);
            }
        }

        if (!$producto && $inv['sku']) {
            $producto = Product::where('sku', $inv['sku'])->first();
        }

        if (!$producto) {
            throw new IntegrationException(
                "No se encontró el producto para el registro de inventario (sku: " . ($inv['sku'] ?? 'n/a') . ').',
                false
            );
        }

        app(InventoryService::class)->ajustar($producto, $inv['stock'], 'sincronizacion', $run);
    }

    private function desdeIncremental(Integration $integration): ?string
    {
        $ultimo = $integration->ultimo_sincronizado;

        return $ultimo ? $ultimo->copy()->subMinute()->toIso8601String() : null;
    }

    private function maxPorRun(): int
    {
        return (int) config('integrations.sync.max_per_run', 5000);
    }

    private function registrarEvento(
        Integration $integration,
        ?IntegrationSyncRun $run,
        string $tipo,
        \Throwable $e,
        ?array $payload = null,
        string $severidad = 'error'
    ): void {
        $descripcion = method_exists($e, 'esTransitorio')
            ? $e->getMessage()
            : IntegrationException::desdeThrowable($e)->getMessage();

        IntegrationEvent::create([
            'integration_id' => $integration->id,
            'sync_run_id' => $run?->id,
            'tipo' => $tipo,
            'severidad' => $severidad,
            'mensaje' => $descripcion,
            'payload' => $payload,
        ]);

        if ($severidad === 'error') {
            Log::warning("Integración {$integration->nombre}: {$tipo}", [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
