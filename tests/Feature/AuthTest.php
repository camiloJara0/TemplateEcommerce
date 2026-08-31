<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_usuario_puede_registrarse(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'nombre' => 'Cliente Demo',
            'email' => 'cliente@demo.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.email', 'cliente@demo.com');

        $this->assertDatabaseHas('users', ['email' => 'cliente@demo.com']);
    }

    public function test_usuario_puede_iniciar_sesion(): void
    {
        $user = User::factory()->create(['email' => 'login@demo.com']);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'login@demo.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['data' => ['access_token']]);
    }

    public function test_login_con_credenciales_invalidas(): void
    {
        $user = User::factory()->create(['email' => 'no@demo.com']);

        $this->postJson('/api/v1/login', [
            'email' => 'no@demo.com',
            'password' => 'incorrecta',
        ])->assertStatus(403)->assertJson(['type' => 'INVALID_PASSWORD']);
    }

    public function test_acceso_a_perfil_autenticado(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/perfil')
            ->assertStatus(200)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_acceso_a_perfil_sin_autenticar(): void
    {
        $this->getJson('/api/v1/perfil')->assertStatus(401);
    }

    public function test_admin_tiene_acceso_total(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', RoleEnum::ADMIN->value)->first());

        $this->assertTrue($user->tienePermiso('reportes.ver'));
        $this->assertTrue($user->tienePermiso('*'));
    }

    public function test_vendedor_edita_productos_pero_no_reportes(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', RoleEnum::VENDEDOR->value)->first());

        $this->assertTrue($user->tienePermiso('productos.editar'));
        $this->assertTrue($user->tienePermiso('productos.eliminar'));
        $this->assertFalse($user->tienePermiso('reportes.ver'));
    }

    public function test_cliente_sin_permisos_de_panel(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', RoleEnum::CLIENTE->value)->first());

        $this->assertFalse($user->tienePermiso('reportes.ver'));
        $this->assertFalse($user->tienePermiso('productos.editar'));
    }
}