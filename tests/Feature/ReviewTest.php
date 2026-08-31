<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use WithRoles;

    private function producto(int $stock = 10): Product
    {
        return Product::create([
            'name' => 'Producto Review',
            'sku' => 'SKU-REV-' . Str::random(4),
            'price' => 50000,
            'stock' => $stock,
            'estado' => 'activo',
        ]);
    }

    private function pedidoEntregado(User $cliente, Product $producto): Order
    {
        $direccion = Address::create([
            'user_id' => $cliente->id,
            'ciudad' => 'Bogotá',
            'direccion' => 'Calle 10',
        ]);

        $order = Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $cliente->id,
            'address_id' => $direccion->id,
            'subtotal' => 50000,
            'total' => 59500,
            'currency' => 'COP',
            'status' => 'entregado',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $producto->id,
            'name' => $producto->name,
            'sku' => $producto->sku,
            'price' => 50000,
            'quantity' => 1,
            'subtotal' => 50000,
        ]);

        return $order;
    }

    public function test_cliente_con_compra_entregada_puede_resenar(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();
        $order = $this->pedidoEntregado($cliente, $producto);

        $this->postJson('/api/v1/productos/' . $producto->id . '/resenas', [
            'rating' => 5,
            'comment' => 'Excelente producto',
            'order_id' => $order->id,
        ])->assertStatus(201)
            ->assertJsonPath('data.status', 'pendiente');

        $this->assertDatabaseHas('reviews', ['product_id' => $producto->id, 'rating' => 5]);
    }

    public function test_cliente_sin_compra_no_puede_resenar(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();

        $this->postJson('/api/v1/productos/' . $producto->id . '/resenas', [
            'rating' => 5,
        ])->assertStatus(422)->assertJson(['type' => 'REVIEW_ERROR']);
    }

    public function test_admin_aprueba_y_actualiza_rating_promedio(): void
    {
        $cliente = $this->clientUser();
        $producto = $this->producto();
        $order = $this->pedidoEntregado($cliente, $producto);

        $review = Review::create([
            'product_id' => $producto->id,
            'user_id' => $cliente->id,
            'order_id' => $order->id,
            'rating' => 4,
            'comment' => 'Buen producto',
            'status' => 'pendiente',
        ]);

        $this->actingAs($this->adminUser(), 'sanctum');

        $this->postJson('/api/v1/admin/resenas/' . $review->id . '/aprobar')
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'aprobado');

        $this->assertSame('4.00', $producto->fresh()->rating_avg);
        $this->assertSame(1, $producto->fresh()->reviews_count);
    }

    public function test_resenas_publicas_solo_aprobadas(): void
    {
        $cliente = $this->clientUser();
        $producto = $this->producto();
        $order = $this->pedidoEntregado($cliente, $producto);

        Review::create([
            'product_id' => $producto->id,
            'user_id' => $cliente->id,
            'order_id' => $order->id,
            'rating' => 5,
            'comment' => 'Aprobada',
            'status' => 'aprobado',
        ]);

        Review::create([
            'product_id' => $producto->id,
            'user_id' => $cliente->id,
            'rating' => 1,
            'comment' => 'Pendiente',
            'status' => 'pendiente',
        ]);

        $this->getJson('/api/v1/productos/' . $producto->id . '/resenas')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.comment', 'Aprobada');
    }
}