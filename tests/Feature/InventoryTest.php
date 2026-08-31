<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockAlert;
use Illuminate\Support\Str;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use WithRoles;

    private function producto(int $stock = 10): Product
    {
        return Product::create([
            'name' => 'Inventario Test',
            'sku' => 'SKU-INV-' . Str::random(4),
            'price' => 10000,
            'stock' => $stock,
            'estado' => 'activo',
        ]);
    }

    private function adminHeaders(): array
    {
        $user = $this->adminUser();

        return ['Authorization' => 'Bearer ' . $user->createToken('test')->plainTextToken];
    }

    public function test_entrada_y_salida_actualizan_stock(): void
    {
        $producto = $this->producto(10);
        $this->actingAsSanctum($this->adminUser());

        $this->postJson('/api/v1/admin/inventario/movimientos', [
            'product_id' => $producto->id,
            'tipo' => 'entrada',
            'cantidad' => 5,
            'razon' => 'Compra a proveedor',
        ])->assertStatus(201);

        $this->assertSame(15, $producto->fresh()->stock);

        $this->postJson('/api/v1/admin/inventario/movimientos', [
            'product_id' => $producto->id,
            'tipo' => 'salida',
            'cantidad' => 3,
        ])->assertStatus(201);

        $this->assertSame(12, $producto->fresh()->stock);
    }

    public function test_salida_mayor_al_stock_rechazada(): void
    {
        $producto = $this->producto(2);
        $this->actingAsSanctum($this->adminUser());

        $this->postJson('/api/v1/admin/inventario/movimientos', [
            'product_id' => $producto->id,
            'tipo' => 'salida',
            'cantidad' => 5,
        ])->assertStatus(422);

        $this->assertSame(2, $producto->fresh()->stock);
    }

    public function test_ajuste_establece_stock_exacto(): void
    {
        $producto = $this->producto(10);
        $this->actingAsSanctum($this->adminUser());

        $this->postJson('/api/v1/admin/inventario/movimientos', [
            'product_id' => $producto->id,
            'tipo' => 'ajuste',
            'cantidad' => 7,
            'razon' => 'Inventario físico',
        ])->assertStatus(201);

        $this->assertSame(7, $producto->fresh()->stock);
    }

    public function test_alertas_de_stock_minimo(): void
    {
        $producto = $this->producto(15);
        $this->actingAsSanctum($this->adminUser());

        $this->postJson('/api/v1/admin/inventario/alertas', [
            'product_id' => $producto->id,
            'min_stock' => 20,
        ])->assertStatus(200);

        $this->assertDatabaseHas('stock_alerts', [
            'product_id' => $producto->id,
            'min_stock' => 20,
            'active' => 1,
        ]);

        $this->getJson('/api/v1/admin/inventario/alertas')
            ->assertStatus(200)
            ->assertJsonPath('data.0.critica', true);
    }
}