<?php

namespace Tests\Feature;

use App\Models\Auditoria;
use App\Models\Brand;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuditTest extends TestCase
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

    public function test_crear_producto_registra_auditoria(): void
    {
        $admin = $this->adminUser();
        $this->actingAs($admin, 'sanctum');

        Product::create([
            'name' => 'Producto Audit',
            'sku' => 'SKU-AUD-' . Str::random(4),
            'price' => 15000,
            'stock' => 10,
            'estado' => 'activo',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'usuario_id' => $admin->id,
            'accion' => 'crear',
            'modulo' => 'productos',
        ]);
    }

    public function test_actualizar_producto_registra_auditoria(): void
    {
        $admin = $this->adminUser();
        $this->actingAs($admin, 'sanctum');

        $producto = Product::create([
            'name' => 'Producto Original',
            'sku' => 'SKU-AUD2-' . Str::random(4),
            'price' => 15000,
            'stock' => 10,
            'estado' => 'activo',
        ]);

        $producto->update(['price' => 18000]);

        $this->assertDatabaseHas('audit_logs', [
            'usuario_id' => $admin->id,
            'accion' => 'editar',
            'modulo' => 'productos',
        ]);
    }

    public function test_crear_cupon_registra_auditoria(): void
    {
        $admin = $this->adminUser();
        $this->actingAs($admin, 'sanctum');

        Coupon::create([
            'code' => 'AUDIT10',
            'type' => 'percent',
            'value' => 10,
            'min_subtotal' => 0,
            'usage_limit' => 5,
            'per_user_limit' => 1,
            'active' => true,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'usuario_id' => $admin->id,
            'accion' => 'crear',
            'modulo' => 'cupones',
        ]);
    }

    public function test_crear_setting_registra_auditoria(): void
    {
        $admin = $this->adminUser();
        $this->actingAs($admin, 'sanctum');

        Setting::establecer('store_name', 'Audit Store', 'general');

        $this->assertDatabaseHas('audit_logs', [
            'usuario_id' => $admin->id,
            'accion' => 'crear',
            'modulo' => 'config',
        ]);
    }

    public function test_auditoria_solo_se_registra_con_usuario_autenticado(): void
    {
        Setting::establecer('store_name', 'Sin Usuario', 'general');

        $this->assertDatabaseCount('audit_logs', 0);
    }
}