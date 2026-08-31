<?php

namespace Tests\Feature;

use App\Models\Product;
use Tests\TestCase;

class CartTest extends TestCase
{
    use WithRoles;

    private function producto(int $stock = 10): Product
    {
        return Product::create([
            'name' => 'Producto Test',
            'sku' => 'SKU-' . $stock . '-' . \Illuminate\Support\Str::random(4),
            'price' => 25000,
            'stock' => $stock,
            'estado' => 'activo',
        ]);
    }

    public function test_invitado_agrega_productos_con_session_id(): void
    {
        $producto = $this->producto();

        $session = 'sess-test-' . \Illuminate\Support\Str::random(8);

        $this->postJson('/api/v1/carrito/items', [
            'session_id' => $session,
            'product_id' => $producto->id,
            'quantity' => 2,
        ])->assertStatus(201)->assertJsonPath('data.count', 2);

        $this->getJson('/api/v1/carrito?session_id=' . $session)
            ->assertStatus(200)
            ->assertJsonPath('data.count', 2)
            ->assertJsonPath('data.subtotal', 50000)
            ->assertJsonPath('data.currency', 'COP');
    }

    public function test_no_excede_stock_disponible(): void
    {
        $producto = $this->producto(3);

        $this->postJson('/api/v1/carrito/items', [
            'session_id' => 'sess-limit',
            'product_id' => $producto->id,
            'quantity' => 5,
        ])->assertStatus(422);
    }

    public function test_carrito_de_usuario_autenticado(): void
    {
        $user = $this->actingAsSanctum($this->clientUser());
        $producto = $this->producto();

        $this->postJson('/api/v1/carrito/items', [
            'product_id' => $producto->id,
            'quantity' => 1,
        ])->assertStatus(201);

        $this->getJson('/api/v1/carrito')
            ->assertStatus(200)
            ->assertJsonPath('data.count', 1);
    }

    public function test_actualizar_y_eliminar_item(): void
    {
        $producto = $this->producto();

        $item = $this->postJson('/api/v1/carrito/items', [
            'session_id' => 'sess-edit',
            'product_id' => $producto->id,
            'quantity' => 1,
        ])->json('data.items.0');

        $this->putJson('/api/v1/carrito/items/' . $item['id'], [
            'session_id' => 'sess-edit',
            'quantity' => 3,
        ])->assertStatus(200)->assertJsonPath('data.count', 3);

        $this->deleteJson('/api/v1/carrito/items/' . $item['id'], ['session_id' => 'sess-edit'])
            ->assertStatus(200)
            ->assertJsonPath('data.count', 0);
    }

    public function test_el_carrito_migra_de_invitado_a_usuario(): void
    {
        $producto = $this->producto();
        $session = 'sess-migrar';

        $this->postJson('/api/v1/carrito/items', [
            'session_id' => $session,
            'product_id' => $producto->id,
            'quantity' => 2,
        ])->assertStatus(201);

        $this->actingAsSanctum($this->clientUser());

        $this->getJson('/api/v1/carrito?session_id=' . $session)
            ->assertStatus(200)
            ->assertJsonPath('data.count', 2);
    }
}