<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\WishlistItem;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use WithRoles;

    private function producto(int $stock = 10): Product
    {
        return Product::create([
            'name' => 'Producto Favorito',
            'sku' => 'SKU-WISH-' . \Illuminate\Support\Str::random(4),
            'price' => 30000,
            'stock' => $stock,
            'estado' => 'activo',
        ]);
    }

    public function test_agregar_y_listar_favoritos(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();

        $this->postJson('/api/v1/favoritos', [
            'product_id' => $producto->id,
        ])->assertStatus(201);

        $this->getJson('/api/v1/favoritos')
            ->assertStatus(200)
            ->assertJsonPath('data.0.product.id', $producto->id);
    }

    public function test_no_duplica_favoritos(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();

        $this->postJson('/api/v1/favoritos', ['product_id' => $producto->id])->assertStatus(201);
        $this->postJson('/api/v1/favoritos', ['product_id' => $producto->id])->assertStatus(201);

        $this->assertSame(1, WishlistItem::where('user_id', $cliente->id)->count());
    }

    public function test_eliminar_favorito(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();
        $this->postJson('/api/v1/favoritos', ['product_id' => $producto->id])->assertStatus(201);

        $this->deleteJson('/api/v1/favoritos/' . $producto->id)
            ->assertStatus(200);

        $this->assertSame(0, WishlistItem::where('user_id', $cliente->id)->count());
    }

    public function test_mover_favorito_al_carrito(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();
        $item = WishlistItem::create([
            'user_id' => $cliente->id,
            'product_id' => $producto->id,
        ]);

        $this->postJson('/api/v1/favoritos/' . $item->id . '/mover-al-carrito')
            ->assertStatus(200);

        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
        $this->assertDatabaseHas('cart_items', ['product_id' => $producto->id]);
    }
}