<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SettingsTest extends TestCase
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

    public function test_configuracion_publica_retorna_datos_de_la_tienda(): void
    {
        Setting::establecer('store_name', 'Mi Tienda Test', 'general');
        Setting::establecer('currency', 'USD', 'general');
        Setting::establecer('tax_rate', 0.10, 'general');
        Setting::establecer('color_primario', '#FF0000', 'colores');

        $this->getJson('/api/v1/configuracion/publica')
            ->assertStatus(200)
            ->assertJsonPath('data.store_name', 'Mi Tienda Test')
            ->assertJsonPath('data.currency', 'USD')
            ->assertJsonPath('data.tax_rate', 0.1)
            ->assertJsonPath('data.color_primario', '#FF0000');
    }

    public function test_admin_puede_leer_y_actualizar_configuracion(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->getJson('/api/v1/admin/configuracion')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->putJson('/api/v1/admin/configuracion', [
            'store_name' => 'Tienda Actualizada',
            'currency' => 'COP',
            'tax_rate' => 0.16,
            'color_primario' => '#123456',
        ])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSame('Tienda Actualizada', Setting::obtener('store_name'));
        $this->assertSame(0.16, (float) Setting::obtener('tax_rate'));
        $this->assertSame('COP', config('ecommerce.currency'));
    }

    public function test_vendedor_sin_permiso_de_configuracion(): void
    {
        $this->seedRoles();
        $vendedor = User::factory()->create();
        $vendedor->roles()->attach(\App\Models\Role::where('slug', 'vendedor')->first());

        $this->actingAs($vendedor, 'sanctum');

        $this->getJson('/api/v1/admin/configuracion')
            ->assertStatus(403);
    }

    public function test_validacion_de_configuracion(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->putJson('/api/v1/admin/configuracion', [
            'tax_rate' => 2,
            'currency' => 'COP',
        ])
            ->assertStatus(422);
    }
}