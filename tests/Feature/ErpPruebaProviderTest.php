<?php

namespace Tests\Feature;

use App\Models\Integration;
use App\Models\Product;
use App\Services\IntegrationCredentialService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ErpPruebaProviderTest extends TestCase
{
    use WithRoles;

    protected function setUp(): void
    {
        parent::setUp();

        // La URL y la API key del ERP de prueba VIVEN EN EL BACKEND (.env);
        // se pisan aquí para que el test no dependa del entorno del dev.
        config([
            'integrations.providers.erp_prueba.base_url' => 'http://127.0.0.1:8001',
            'integrations.providers.erp_prueba.api_key' => 'test-key-123',
        ]);
    }

    private function payloadProductos(): array
    {
        return [
            'success' => true,
            'data' => [
                [
                    'id' => 1,
                    'nombre' => 'Arroz Blanco 500g',
                    'sku' => 'PRO-1',
                    'stock' => 150,
                    'descripcion' => 'Arroz blanco de grano largo.',
                    'categoria' => 'Abarrotes',
                    'marca' => 'Diana',
                    'precios' => [
                        ['tipo' => 'minorista', 'precio' => 3.5],
                        ['tipo' => 'mayorista', 'precio' => 3.1],
                    ],
                ],
                [
                    'id' => 2,
                    'nombre' => 'Azúcar Refinada 1kg',
                    'sku' => 'PRO-2',
                    'stock' => 120,
                    'descripcion' => 'Azúcar refinada.',
                    'categoria' => 'Abarrotes',
                    'marca' => 'Incauca',
                    'precios' => [
                        ['tipo' => 'minorista', 'precio' => 5.2],
                        ['tipo' => 'mayorista', 'precio' => 4.8],
                    ],
                ],
            ],
        ];
    }

    private function payloadInventario(): array
    {
        return [
            'success' => true,
            'data' => [
                ['product_id' => 1, 'sku' => 'PRO-1', 'stock' => 23],
                ['product_id' => 2, 'sku' => 'PRO-2', 'stock' => 45],
            ],
        ];
    }

    private function integracionErpPrueba(string $estado = 'activa'): Integration
    {
        return Integration::create([
            'nombre' => 'ERP Prueba Externo',
            'provider' => 'erp_prueba',
            'estado' => $estado,
            'activa' => $estado === 'activa',
            'config_sincronizacion' => [
                'frecuencia_minutos' => 60,
                'direccion' => 'externo_manda',
                'productos' => true,
                'inventario' => true,
            ],
        ]);
    }

    public function test_se_configura_desde_el_backend_sin_credenciales_en_el_panel(): void
    {
        $this->actingAsSanctum($this->adminUser());

        // Sin credenciales en el panel: la config viene del backend (.env).
        $response = $this->postJson('/api/v1/admin/integraciones', [
            'nombre' => 'ERP Prueba',
            'provider' => 'erp_prueba',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.estado', 'inactiva')
            ->assertJsonPath('data.configurado', true);

        // Se puede activar sin guardar nada en el panel.
        $this->postJson('/api/v1/admin/integraciones/' . $response->json('data.id') . '/activar')
            ->assertStatus(200)
            ->assertJsonPath('data.estado', 'activa');
    }

    public function test_sistemas_no_expone_la_api_key_del_backend(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $response = $this->getJson('/api/v1/admin/integraciones/sistemas');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.key', 'erp_prueba');

        $this->assertStringNotContainsString('test-key-123', $response->getContent());
        $this->assertStringNotContainsString('api_key', $response->getContent());
    }

    public function test_probar_conexion_envia_url_y_x_api_key_del_backend(): void
    {
        $this->actingAsSanctum($this->adminUser());
        $integration = $this->integracionErpPrueba('inactiva');

        Http::fake([
            '*/productsERP' => Http::response($this->payloadProductos(), 200),
        ]);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/probar')
            ->assertStatus(200)
            ->assertJsonPath('data.success', true);

        Http::assertSent(function ($request) {
            return $request->url() === 'http://127.0.0.1:8001/api/productsERP'
                && $request->hasHeader('X-API-KEY', 'test-key-123');
        });
    }

    public function test_probar_conexion_falla_con_401(): void
    {
        $this->actingAsSanctum($this->adminUser());
        $integration = $this->integracionErpPrueba('inactiva');

        Http::fake([
            '*/productsERP' => Http::response(['success' => false, 'message' => 'API_KEY inválida'], 403),
        ]);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/probar')
            ->assertStatus(422)
            ->assertJson(['type' => 'CONEXION_FALLIDA']);
    }

    public function test_sincroniza_productos_e_inventario_desde_el_erp_externo(): void
    {
        $integration = $this->integracionErpPrueba();

        Http::fake([
            '*/productsERP' => Http::response($this->payloadProductos(), 200),
            '*/inventarioERP' => Http::response($this->payloadInventario(), 200),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id])
            ->assertExitCode(0);

        $this->assertSame(2, Product::count());

        $arroz = Product::where('sku', 'PRO-1')->first();
        $this->assertNotNull($arroz);
        $this->assertSame('Arroz Blanco 500g', $arroz->name);
        $this->assertSame(3.5, (float) $arroz->price, 'Se toma el precio minorista');
        $this->assertSame('Abarrotes', $arroz->category?->name);
        $this->assertSame('Diana', $arroz->brand?->name);
        $this->assertSame(23, $arroz->stock, 'El inventario externo manda');

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $run->estado);
        $this->assertSame(2, $run->creados);
        $this->assertSame(4, $run->procesados, '2 productos + 2 de inventario');
        $this->assertSame(0, $run->errores);

        $movimiento = \App\Models\StockMovement::where('product_id', $arroz->id)
            ->where('razon', 'sincronizacion')
            ->first();
        $this->assertNotNull($movimiento);
        $this->assertSame(\App\Models\IntegrationSyncRun::class, $movimiento->referencia_type);

        // Segunda corrida: idempotente por hash (mismo contenido → omitidos).
        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'inicial']);

        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(0, $segundoRun->creados);
        $this->assertSame(2, $segundoRun->omitidos);
    }

    public function test_sin_url_o_api_key_en_el_backend_no_esta_configurado(): void
    {
        config([
            'integrations.providers.erp_prueba.base_url' => null,
            'integrations.providers.erp_prueba.api_key' => null,
        ]);

        $integration = $this->integracionErpPrueba('sin_credenciales');

        $this->assertFalse(
            app(IntegrationCredentialService::class)->estaConfigurado($integration)
        );

        $this->actingAsSanctum($this->adminUser());
        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/activar')
            ->assertStatus(422)
            ->assertJson(['type' => 'SIN_CREDENCIALES']);
    }
}
