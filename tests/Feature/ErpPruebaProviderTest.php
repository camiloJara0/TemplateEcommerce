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

    private const URL_BASE = 'http://127.0.0.1:8001';
    private const API_KEY = 'test-key-123';

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

    /**
     * Integración del proveedor; con $credenciales=true guarda la URL base
     * y la API key en la BD (cifradas), igual que el panel.
     */
    private function integracionErpPrueba(string $estado = 'activa', bool $credenciales = true): Integration
    {
        $integration = Integration::create([
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

        if ($credenciales) {
            app(IntegrationCredentialService::class)->guardar($integration, [
                'base_url' => self::URL_BASE,
                'api_key' => self::API_KEY,
            ]);
        }

        return $integration;
    }

    public function test_alta_desde_el_panel_registra_url_y_api_key_cifradas_en_bd(): void
    {
        $this->actingAsSanctum($this->adminUser());

        // El formulario del panel envía nombre + credenciales en una sola alta.
        $response = $this->postJson('/api/v1/admin/integraciones', [
            'nombre' => 'ERP Prueba',
            'provider' => 'erp_prueba',
            'credenciales' => [
                'base_url' => self::URL_BASE,
                'api_key' => self::API_KEY,
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.estado', 'inactiva')
            ->assertJsonPath('data.configurado', true);

        $integration = Integration::findOrFail($response->json('data.id'));

        // Cifradas en BD: el valor plano jamás aparece almacenado ni expuesto.
        $this->assertStringNotContainsString(self::API_KEY, (string) $integration->credenciales);

        $credenciales = app(IntegrationCredentialService::class)->obtener($integration);
        $this->assertSame(self::URL_BASE, $credenciales['base_url']);
        $this->assertSame(self::API_KEY, $credenciales['api_key']);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/activar')
            ->assertStatus(200)
            ->assertJsonPath('data.estado', 'activa');
    }

    public function test_alta_sin_credenciales_queda_sin_credenciales_y_no_se_activa(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $response = $this->postJson('/api/v1/admin/integraciones', [
            'nombre' => 'ERP Prueba',
            'provider' => 'erp_prueba',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.estado', 'sin_credenciales')
            ->assertJsonPath('data.configurado', false);

        $this->postJson('/api/v1/admin/integraciones/' . $response->json('data.id') . '/activar')
            ->assertStatus(422)
            ->assertJson(['type' => 'SIN_CREDENCIALES']);

        $this->postJson('/api/v1/admin/integraciones/' . $response->json('data.id') . '/probar')
            ->assertStatus(422)
            ->assertJson(['type' => 'SIN_CREDENCIALES']);
    }

    public function test_sistemas_y_no_expone_la_api_key_guardada(): void
    {
        $this->actingAsSanctum($this->adminUser());
        $integration = $this->integracionErpPrueba('activa');

        $sistemas = $this->getJson('/api/v1/admin/integraciones/sistemas');
        $sistemas->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.key', 'erp_prueba');

        // El formulario del proveedor pide base_url y api_key…
        $this->assertArrayHasKey('base_url', $sistemas->json('data.1.fields'));
        $this->assertArrayHasKey('api_key', $sistemas->json('data.1.fields'));

        // …pero el VALOR guardado nunca aparece en ninguna respuesta.
        $detalle = $this->getJson('/api/v1/admin/integraciones/' . $integration->id);
        $detalle->assertStatus(200);

        foreach ([$sistemas, $detalle] as $response) {
            $this->assertStringNotContainsString(self::API_KEY, $response->getContent());
        }
    }

    public function test_probar_conexion_envia_url_y_x_api_key_guardadas_en_bd(): void
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
            return $request->url() === self::URL_BASE . '/api/productsERP'
                && $request->hasHeader('X-API-KEY', self::API_KEY);
        });
    }

    public function test_probar_conexion_falla_con_403(): void
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
            '*/comprasERP' => Http::response(['success' => true, 'data' => []], 200),
            '*/ventasERP' => Http::response(['success' => true, 'data' => []], 200),
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
}
