<?php

namespace Tests\Feature;

use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\IntegrationExternalDoc;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\IntegrationCredentialService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ComprasSyncTest extends TestCase
{
    use WithRoles;

    private const URL_BASE = 'http://127.0.0.1:8001';
    private const API_KEY = 'test-key-123';

    private function integracionCompras(): Integration
    {
        $integration = Integration::create([
            'nombre' => 'ERP Compras Externo',
            'provider' => 'erp_prueba',
            'estado' => 'activa',
            'activa' => true,
            'config_sincronizacion' => [
                'frecuencia_minutos' => 60,
                'direccion' => 'externo_manda',
                'productos' => true,
                'inventario' => true,
                'compras' => true,
                'ventas' => true,
            ],
        ]);

        app(IntegrationCredentialService::class)->guardar($integration, [
            'base_url' => self::URL_BASE,
            'api_key' => self::API_KEY,
        ]);

        return $integration;
    }

    private function crearCatalogo(): void
    {
        Product::create(['name' => 'Arroz Blanco 500g', 'sku' => 'PRO-1', 'price' => 3.5, 'stock' => 20, 'estado' => 'activo']);
        Product::create(['name' => 'Azúcar Refinada 1kg', 'sku' => 'PRO-2', 'price' => 5.2, 'stock' => 30, 'estado' => 'activo']);
        Product::create(['name' => 'Aceite Vegetal 1L', 'sku' => 'PRO-3', 'price' => 8, 'stock' => 15, 'estado' => 'activo']);
    }

    public function test_sincroniza_compras_y_aplica_entrada_de_stock(): void
    {
        $integration = $this->integracionCompras();
        $this->crearCatalogo();

        Http::fake([
            '*/comprasERP' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'numero' => 'COM-1001',
                        'fecha' => '2026-10-01',
                        'proveedor' => 'Distribuidora Central',
                        'lineas' => [
                            ['sku' => 'PRO-1', 'cantidad' => 10, 'costo' => 2.5],
                            ['sku' => 'PRO-2', 'cantidad' => 5, 'costo' => 4.0],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'compras'])
            ->assertExitCode(0);

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $run->estado);
        $this->assertSame(1, $run->procesados);
        $this->assertSame(0, $run->errores);
        $this->assertSame(1, $run->resumen['compras_aplicadas']);
        $this->assertSame(0, $run->resumen['compras_pendientes']);

        $pro1 = Product::where('sku', 'PRO-1')->first();
        $pro2 = Product::where('sku', 'PRO-2')->first();
        $this->assertSame(30, $pro1->stock, 'Entrada de 10 sobre stock inicial 20');
        $this->assertSame(35, $pro2->stock, 'Entrada de 5 sobre stock inicial 30');

        $doc = IntegrationExternalDoc::where('integration_id', $integration->id)
            ->where('tipo', 'compra')
            ->where('external_id', 'COM-1001')
            ->first();
        $this->assertNotNull($doc);
        $this->assertSame('aplicada', $doc->estado);
        $this->assertCount(2, $doc->payload['lineas']);

        $movimiento = StockMovement::where('product_id', $pro1->id)
            ->where('razon', 'compra_externa')
            ->first();
        $this->assertNotNull($movimiento);
        $this->assertSame(10, (int) $movimiento->cantidad);
        $this->assertSame(IntegrationExternalDoc::class, $movimiento->referencia_type);
        $this->assertSame($doc->id, $movimiento->referencia_id);

        Http::assertSent(function ($request) {
            return $request->url() === self::URL_BASE . '/api/comprasERP'
                && $request->hasHeader('X-API-KEY', self::API_KEY);
        });
    }

    public function test_compra_con_sku_desconocido_queda_pendiente_sin_aplicar_stock(): void
    {
        $integration = $this->integracionCompras();
        $this->crearCatalogo();

        Http::fake([
            '*/comprasERP' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'numero' => 'COM-1002',
                        'fecha' => '2026-10-02',
                        'proveedor' => 'Distribuidora Central',
                        'lineas' => [
                            ['sku' => 'PRO-1', 'cantidad' => 10, 'costo' => 2.5],
                            ['sku' => 'PRO-999', 'cantidad' => 4, 'costo' => 1.0],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'compras'])
            ->assertExitCode(0);

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $run->estado, 'Un documento pendiente no es error del ERP');
        $this->assertSame(0, $run->errores);
        $this->assertSame(0, $run->resumen['compras_aplicadas']);
        $this->assertSame(1, $run->resumen['compras_pendientes']);

        // Sin aplicación parcial: ninguna de las líneas entra a stock.
        $pro1 = Product::where('sku', 'PRO-1')->first();
        $this->assertSame(20, $pro1->stock);
        $this->assertSame(0, StockMovement::where('razon', 'compra_externa')->count());

        $doc = IntegrationExternalDoc::where('integration_id', $integration->id)
            ->where('tipo', 'compra')
            ->where('external_id', 'COM-1002')
            ->first();
        $this->assertNotNull($doc);
        $this->assertSame('pendiente_resolucion', $doc->estado);
        $this->assertSame(['PRO-999'], $doc->payload['skus_pendientes']);

        $evento = IntegrationEvent::where('integration_id', $integration->id)
            ->where('tipo', 'compra.pendiente_resolucion')
            ->where('severidad', 'info')
            ->first();
        $this->assertNotNull($evento);
    }

    public function test_compra_ya_aplicada_se_omite_en_la_segunda_corrida(): void
    {
        $integration = $this->integracionCompras();
        $this->crearCatalogo();

        Http::fake([
            '*/comprasERP' => Http::response([
                'success' => true,
                'data' => [
                    [
                        'numero' => 'COM-1001',
                        'fecha' => '2026-10-01',
                        'proveedor' => 'Distribuidora Central',
                        'lineas' => [
                            ['sku' => 'PRO-1', 'cantidad' => 10, 'costo' => 2.5],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'compras']);

        $pro1 = Product::where('sku', 'PRO-1')->first();
        $this->assertSame(30, $pro1->stock);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'compras']);

        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $segundoRun->estado);
        $this->assertSame(1, $segundoRun->omitidos);
        $this->assertSame(0, $segundoRun->resumen['compras_aplicadas']);

        $pro1->refresh();
        $this->assertSame(30, $pro1->stock, 'La idempotencia evita entradas dobles');
        $this->assertSame(1, StockMovement::where('razon', 'compra_externa')->count());
    }
}
