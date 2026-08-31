<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Product;
use App\Models\ShippingMethod;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use WithRoles;

    public function test_flujo_completo_hasta_pedido_confirmado(): void
    {
        $admin = $this->adminUser();
        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/v1/admin/productos', [
            'name' => 'Café Especial',
            'sku' => 'SKU-CAF-' . Str::random(3),
            'price' => 32000,
            'stock' => 25,
        ]);

        $productId = $response->json('data.id');

        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $direccion = Address::create([
            'user_id' => $cliente->id,
            'ciudad' => 'Bogotá',
            'direccion' => 'Cra 10 # 20-30',
            'codigo_postal' => '110111',
            'es_principal' => true,
        ]);

        $metodoEnvio = ShippingMethod::create([
            'name' => 'Envío estándar',
            'cost' => 10000,
            'estimated_days' => 5,
            'active' => true,
        ]);

        $this->postJson('/api/v1/carrito/items', [
            'product_id' => $productId,
            'quantity' => 2,
        ])->assertStatus(201);

        $preview = $this->postJson('/api/v1/checkout/preview', [
            'address_id' => $direccion->id,
            'shipping_method_id' => $metodoEnvio->id,
        ])->assertStatus(200)->json('data');

        $this->assertEquals(64000.0, $preview['subtotal'], '2 cafés de 32000');
        $this->assertEquals(10000.0, $preview['shipping']);

        $pedido = $this->postJson('/api/v1/pedidos', [
            'address_id' => $direccion->id,
            'shipping_method_id' => $metodoEnvio->id,
        ])->assertStatus(201)->json('data');

        $this->assertEquals('nuevo', $pedido['status']);
        $this->assertEquals(64000.0, $pedido['subtotal']);
        $this->assertCount(1, $pedido['items']);
        $this->assertEquals(2, $pedido['items'][0]['quantity']);

        $this->assertSame(23, Product::find($productId)->stock, 'Stock descontado por la venta');
        $this->assertDatabaseHas('stock_movements', [
            'referencia_type' => \App\Models\Order::class,
            'tipo' => 'salida',
            'cantidad' => -2,
        ]);

        $this->getJson('/api/v1/pedidos')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 1);
    }

    public function test_maquina_de_estados_valida_transiciones(): void
    {
        $admin = $this->adminUser();
        $cliente = $this->clientUser();

        $producto = Product::create([
            'name' => 'Libro',
            'sku' => 'SKU-LIB-' . Str::random(3),
            'price' => 45000,
            'stock' => 5,
            'estado' => 'activo',
        ]);

        $order = \App\Models\Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $cliente->id,
            'subtotal' => 45000,
            'total' => 53550,
            'currency' => 'COP',
            'status' => 'nuevo',
        ]);

        $this->actingAs($admin, 'sanctum');

        // transición inválida: nuevo -> enviado
        $this->postJson('/api/v1/admin/pedidos/' . $order->id . '/estado', [
            'estado' => 'enviado',
        ])->assertStatus(422);

        // transición válida: nuevo -> pagado -> preparando -> enviado -> entregado
        foreach (['pagado', 'preparando', 'enviado', 'entregado'] as $estado) {
            $this->postJson('/api/v1/admin/pedidos/' . $order->id . '/estado', [
                'estado' => $estado,
                'comentario' => 'Cambio a ' . $estado,
            ])->assertStatus(200)->assertJsonPath('data.status', $estado);
        }

        $this->assertSame('entregado', $order->fresh()->status);
        $this->assertDatabaseCount('order_status_histories', 4);
    }

    public function test_cliente_solo_ve_sus_pedidos(): void
    {
        $admin = $this->adminUser();
        $cliente = $this->clientUser();

        $order = \App\Models\Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $cliente->id,
            'subtotal' => 10000,
            'total' => 11900,
            'currency' => 'COP',
            'status' => 'nuevo',
        ]);

        $otro = $this->clientUser();
        $this->actingAs($otro, 'sanctum');

        $this->getJson('/api/v1/pedidos/' . $order->id)
            ->assertStatus(403);
    }
}