<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function seedRoles(): void
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    protected function adminUser(): User
    {
        $this->seedRoles();
        $user = User::factory()->create();
        $user->roles()->attach(\App\Models\Role::where('slug', 'admin')->first());

        return $user;
    }

    public function test_reporte_ventas(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = User::factory()->create();

        Order::create([
            'numero' => 'ORD-R1',
            'user_id' => $cliente->id,
            'subtotal' => 50000,
            'shipping_cost' => 8000,
            'tax' => 9500,
            'total' => 67500,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        $this->getJson('/api/v1/admin/reportes/ventas')
            ->assertStatus(200)
            ->assertJsonPath('data.totales.ingresos', 67500)
            ->assertJsonPath('data.totales.ventas', 1);
    }

    public function test_reporte_inventario(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        Product::create([
            'name' => 'Producto Reporte',
            'sku' => 'SKU-REP-' . Str::random(4),
            'price' => 10000,
            'stock' => 5,
            'estado' => 'activo',
        ]);

        $this->getJson('/api/v1/admin/reportes/inventario')
            ->assertStatus(200)
            ->assertJsonPath('data.totales.stock_total', 5)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_reporte_productos(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        Product::create([
            'name' => 'Producto Top',
            'sku' => 'SKU-TOP2-' . Str::random(4),
            'price' => 20000,
            'stock' => 9,
            'estado' => 'activo',
            'rating_avg' => 4.8,
            'reviews_count' => 12,
        ]);

        $this->getJson('/api/v1/admin/reportes/productos')
            ->assertStatus(200)
            ->assertJsonPath('data.items.0.nombre', 'Producto Top')
            ->assertJsonPath('data.items.0.rating', 4.8);
    }

    public function test_reporte_ventas_exporta_csv(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = User::factory()->create();

        Order::create([
            'numero' => 'ORD-R2',
            'user_id' => $cliente->id,
            'subtotal' => 50000,
            'shipping_cost' => 8000,
            'tax' => 9500,
            'total' => 67500,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        $respuesta = $this->get('/api/v1/admin/reportes/ventas?formato=csv');
        $respuesta->assertStatus(200);
        $this->assertStringContainsString('text/csv', $respuesta->headers->get('Content-Type'));
        $this->assertStringContainsString('.csv', $respuesta->headers->get('Content-Disposition'));
    }

    public function test_reporte_ventas_exporta_pdf(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $respuesta = $this->get('/api/v1/admin/reportes/ventas?formato=pdf');
        $respuesta->assertStatus(200);
        $this->assertStringContainsString('.pdf', $respuesta->headers->get('Content-Disposition'));
    }

    public function test_reporte_ventas_exporta_excel(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $respuesta = $this->get('/api/v1/admin/reportes/ventas?formato=excel');
        $respuesta->assertStatus(200);
        $this->assertStringContainsString('ms-excel', $respuesta->headers->get('Content-Type'));
    }

    public function test_reporte_clientes(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->seedRoles();
        $cliente = User::factory()->create();
        $cliente->roles()->attach(\App\Models\Role::where('slug', 'cliente')->first());

        $this->getJson('/api/v1/admin/reportes/clientes')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.items');
    }
}