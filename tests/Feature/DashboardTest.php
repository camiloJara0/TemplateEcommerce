<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use WithRoles;

    public function test_resumen_kpis(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();

        Order::create([
            'numero' => 'ORD-ABC123',
            'user_id' => $cliente->id,
            'subtotal' => 50000,
            'total' => 59500,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        $this->getJson('/api/v1/admin/dashboard/resumen')
            ->assertStatus(200)
            ->assertJsonPath('data.ventas_hoy', 59500)
            ->assertJsonPath('data.pedidos_mes', 1)
            ->assertJsonPath('data.clientes', 2);
    }

    public function test_ventas_por_dia(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();

        Order::create([
            'numero' => 'ORD-ABC124',
            'user_id' => $cliente->id,
            'subtotal' => 50000,
            'total' => 59500,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        $this->getJson('/api/v1/admin/dashboard/ventas-por-dia')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_top_productos(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();

        $producto = Product::create([
            'name' => 'Top Producto',
            'sku' => 'SKU-TOP-' . \Illuminate\Support\Str::random(4),
            'price' => 20000,
            'stock' => 10,
            'estado' => 'activo',
        ]);

        $order = Order::create([
            'numero' => 'ORD-ABC125',
            'user_id' => $cliente->id,
            'subtotal' => 40000,
            'total' => 47600,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $producto->id,
            'name' => $producto->name,
            'sku' => $producto->sku,
            'price' => 20000,
            'quantity' => 2,
            'subtotal' => 40000,
        ]);

        $this->getJson('/api/v1/admin/dashboard/top-productos')
            ->assertStatus(200)
            ->assertJsonPath('data.0.unidades', 2)
            ->assertJsonPath('data.0.name', 'Top Producto');
    }

    public function test_ventas_por_categoria(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();

        $categoria = \App\Models\Category::create(['name' => 'Categoría Test']);
        $producto = Product::create([
            'name' => 'Producto Cat',
            'sku' => 'SKU-CAT-' . \Illuminate\Support\Str::random(4),
            'price' => 20000,
            'stock' => 10,
            'estado' => 'activo',
            'category_id' => $categoria->id,
        ]);

        $order = Order::create([
            'numero' => 'ORD-ABC126',
            'user_id' => $cliente->id,
            'subtotal' => 20000,
            'total' => 23800,
            'currency' => 'COP',
            'status' => 'pagado',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $producto->id,
            'name' => $producto->name,
            'sku' => $producto->sku,
            'price' => 20000,
            'quantity' => 1,
            'subtotal' => 20000,
        ]);

        $this->getJson('/api/v1/admin/dashboard/ventas-por-categoria')
            ->assertStatus(200)
            ->assertJsonPath('data.0.categoria', 'Categoría Test');
    }

    public function test_vendedor_sin_permiso_de_reportes(): void
    {
        $vendedor = \App\Models\User::factory()->create();
        $vendedor->roles()->attach(\App\Models\Role::where('slug', 'vendedor')->first());

        $this->actingAs($vendedor, 'sanctum');

        $this->getJson('/api/v1/admin/dashboard/resumen')
            ->assertStatus(403);
    }
}