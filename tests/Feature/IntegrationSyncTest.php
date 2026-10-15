<?php

namespace Tests\Feature;

use App\Models\Integration;
use App\Models\Product;
use App\Services\IntegrationCredentialService;
use Tests\TestCase;

class IntegrationSyncTest extends TestCase
{
    use WithRoles;

    private function integracionActiva(): Integration
    {
        $integration = Integration::create([
            'nombre' => 'ERP Sincronizado',
            'provider' => 'erp_demo',
            'estado' => 'activa',
            'activa' => true,
            'config_sincronizacion' => [
                'frecuencia_minutos' => 60,
                'direccion' => 'externo_manda',
                'productos' => true,
                'inventario' => true,
            ],
        ]);

        app(IntegrationCredentialService::class)
            ->guardar($integration, ['usuario' => 'admin', 'clave' => 'x']);

        return $integration;
    }

    public function test_sincronizacion_importa_catalogo_desde_fixture(): void
    {
        $integration = $this->integracionActiva();

        $this->artisan('integrations:sync', ['--integration' => $integration->id])
            ->assertExitCode(0);

        $this->assertSame(5, Product::count());

        $cafe = Product::where('sku', 'CAF-250')->first();
        $this->assertNotNull($cafe);
        $this->assertSame('Café Especial 250g', $cafe->name);
        $this->assertSame(25000.0, (float) $cafe->price);
        $this->assertSame(28000.0, (float) $cafe->price_discount);
        $this->assertSame('Bebidas', $cafe->category?->name);
        $this->assertSame('Montaña', $cafe->brand?->name);
        $this->assertSame('activo', $cafe->estado);
        $this->assertCount(1, $cafe->images);

        $descontinuado = Product::where('sku', 'CAF-500-OLD')->first();
        $this->assertSame('inactivo', $descontinuado->estado, 'Bajas externas marcan inactivo, no borran (RN-12)');

        $termo = Product::where('sku', 'MUG-NEG')->first();
        $this->assertSame(8, $termo->stock, 'Stock de variantes suma 5+3');
        $this->assertCount(2, $termo->variants);

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $run->estado);
        $this->assertSame(5, $run->creados);
        $this->assertSame(0, $run->errores);

        $this->assertSame(5, $integration->records()->where('tipo', 'producto')->count());
        $this->assertNotNull($integration->fresh()->ultimo_sincronizado);
        $this->assertSame('activa', $integration->fresh()->estado);
    }

    public function test_sincronizacion_es_idempotente(): void
    {
        $integration = $this->integracionActiva();

        $this->artisan('integrations:sync', ['--integration' => $integration->id]);
        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'inicial']);

        $this->assertSame(5, Product::count(), 'La segunda corrida no duplica productos');

        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(0, $segundoRun->creados);
        $this->assertSame(0, $segundoRun->actualizados);
        $this->assertSame(5, $segundoRun->omitidos, 'Registros sin cambios se omiten por hash');
        $this->assertSame('exitosa', $segundoRun->estado);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'todo']);
        $tercerRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(0, $tercerRun->procesados, 'El incremental no vuelve a traer registros vigentes');
    }

    public function test_inventario_sobrescribe_stock_y_registra_movimiento(): void
    {
        $integration = $this->integracionActiva();

        $this->artisan('integrations:sync', ['--integration' => $integration->id]);

        $te = Product::where('sku', 'TZA-1L')->first();
        $this->assertSame(28, $te->stock, 'El inventario externo manda (fixture: 28)');

        $filtros = Product::where('sku', 'FIL-V60')->first();
        $this->assertSame(57, $filtros->stock);

        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $te->id,
            'razon' => 'sincronizacion',
            'tipo' => 'ajuste',
            'cantidad' => -2,
        ]);

        $movimiento = \App\Models\StockMovement::where('product_id', $te->id)
            ->where('razon', 'sincronizacion')
            ->first();
        $this->assertSame(\App\Models\IntegrationSyncRun::class, $movimiento->referencia_type, 'RN-25: referencia morph al run');
    }

    public function test_integracion_inactiva_no_se_sincroniza(): void
    {
        $integration = Integration::create([
            'nombre' => 'ERP Inactiva',
            'provider' => 'erp_demo',
            'estado' => 'inactiva',
            'activa' => false,
        ]);

        $this->artisan('integrations:sync')->assertExitCode(0);

        $this->assertSame(0, $integration->syncRuns()->count());
        $this->assertSame(0, Product::count());
    }

    public function test_sincronizacion_manual_desde_endpoint_requiere_permiso(): void
    {
        $integration = $this->integracionActiva();

        $this->actingAsSanctum($this->clientUser());

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/sincronizar')
            ->assertStatus(403);
    }
}
