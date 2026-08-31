<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use WithRoles;

    private function producto(int $stock = 10): Product
    {
        return Product::create([
            'name' => 'Producto Cupón',
            'sku' => 'SKU-COUPON-' . \Illuminate\Support\Str::random(4),
            'price' => 100000,
            'stock' => $stock,
            'estado' => 'activo',
        ]);
    }

    public function test_admin_crea_cupon_percent(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->postJson('/api/v1/admin/cupones', [
            'code' => 'DESCUENTO10',
            'type' => 'percent',
            'value' => 10,
        ])->assertStatus(201)
            ->assertJsonPath('data.code', 'DESCUENTO10');

        $this->assertDatabaseHas('coupons', ['code' => 'DESCUENTO10']);
    }

    public function test_cliente_aplica_cupon_percent(): void
    {
        $this->actingAs($this->clientUser(), 'sanctum');

        Coupon::create([
            'code' => 'DESCUENTO10',
            'type' => 'percent',
            'value' => 10,
            'active' => true,
        ]);

        $this->postJson('/api/v1/cupones/aplicar', [
            'code' => 'DESCUENTO10',
            'subtotal' => 100000,
        ])->assertStatus(200)
            ->assertJsonPath('data.discount', 10000);
    }

    public function test_cupon_free_shipping_anula_envio(): void
    {
        $this->actingAs($this->clientUser(), 'sanctum');

        Coupon::create([
            'code' => 'ENVIOGRATIS',
            'type' => 'free_shipping',
            'value' => 0,
            'active' => true,
        ]);

        $this->postJson('/api/v1/cupones/aplicar', [
            'code' => 'ENVIOGRATIS',
            'subtotal' => 100000,
            'shipping' => 10000,
        ])->assertStatus(200)
            ->assertJsonPath('data.free_shipping', true)
            ->assertJsonPath('data.discount', 10000);
    }

    public function test_cupon_expirado_rechazado(): void
    {
        $this->actingAs($this->clientUser(), 'sanctum');

        Coupon::create([
            'code' => 'VENCIDO',
            'type' => 'percent',
            'value' => 10,
            'active' => true,
            'expires_at' => now()->subDay(),
        ]);

        $this->postJson('/api/v1/cupones/aplicar', [
            'code' => 'VENCIDO',
            'subtotal' => 100000,
        ])->assertStatus(422)->assertJson(['type' => 'COUPON_ERROR']);
    }

    public function test_cupon_no_alcanza_minimo(): void
    {
        $this->actingAs($this->clientUser(), 'sanctum');

        Coupon::create([
            'code' => 'MINIMO',
            'type' => 'fixed',
            'value' => 5000,
            'min_subtotal' => 50000,
            'active' => true,
        ]);

        $this->postJson('/api/v1/cupones/aplicar', [
            'code' => 'MINIMO',
            'subtotal' => 20000,
        ])->assertStatus(422)->assertJson(['type' => 'COUPON_ERROR']);
    }

    public function test_checkout_con_cupon_aplica_descuento(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $producto = $this->producto();

        $cart = Cart::create(['user_id' => $cliente->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $producto->id,
            'quantity' => 1,
        ]);

        Coupon::create([
            'code' => 'CHECKOUT10',
            'type' => 'percent',
            'value' => 10,
            'active' => true,
        ]);

        $this->postJson('/api/v1/checkout/preview', [
            'coupon_code' => 'CHECKOUT10',
        ])->assertStatus(200)
            ->assertJsonPath('data.subtotal', 100000)
            ->assertJsonPath('data.discount', 10000)
            ->assertJsonPath('data.total', 107100);
    }
}