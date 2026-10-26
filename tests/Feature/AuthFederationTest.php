<?php

namespace Tests\Feature;

use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\User;
use App\Services\IntegrationCredentialService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AuthFederationTest extends TestCase
{
    use WithRoles;

    private const URL_BASE = 'http://127.0.0.1:8001';
    private const API_KEY = 'test-key-federation';

    private function integracionFederada(bool $fallbackLocal = true, ?string $rol = null): Integration
    {
        $integration = Integration::create([
            'nombre' => 'ERP Prueba Federado',
            'provider' => 'erp_prueba',
            'estado' => 'activa',
            'activa' => true,
            'soporta_login' => true,
            'rol_login_federado' => $rol,
            'login_fallback_local' => $fallbackLocal,
            'config_sincronizacion' => [
                'frecuencia_minutos' => 60,
                'direccion' => 'externo_manda',
                'productos' => true,
                'inventario' => true,
                'compras' => true,
                'ventas' => true,
            ],
        ]);

        app(IntegrationCredentialService::class)->guardar($integration, [
            'base_url' => self::URL_BASE,
            'api_key' => self::API_KEY,
        ]);

        return $integration;
    }

    private function externoOk(string $nombre = 'usuariouno', string $email = 'usuariouno@erp.test'): void
    {
        Http::fake([
            self::URL_BASE . '/api/loginERP' => Http::response([
                'success' => true,
                'data' => [
                    'nombre' => $nombre,
                    'email' => $email,
                    'estado' => 'activo',
                    'token' => 'ext-token-abc',
                ],
            ], 200),
            '*' => Http::response(['success' => false], 500),
        ]);
    }

    public function test_sin_integracion_el_login_local_no_cambia(): void
    {
        $this->seedRoles();
        User::factory()->create(['email' => 'local@demo.com']);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'local@demo.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['federado' => false]])
            ->assertJsonStructure(['data' => ['access_token', 'user']]);
    }

    public function test_login_federado_crea_usuario_local_con_rol_default_cliente(): void
    {
        $this->seedRoles();
        $this->integracionFederada();
        $this->externoOk();

        $response = $this->postJson('/api/v1/login', [
            'email' => 'usuariouno@erp.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['federado' => true]])
            ->assertJsonPath('data.user.email', 'usuariouno@erp.test');

        $user = User::where('email', 'usuariouno@erp.test')->firstOrFail();
        $this->assertTrue($user->roles()->where('slug', 'cliente')->exists());

        $this->assertDatabaseHas('integration_events', [
            'tipo' => 'login.federado',
            'severidad' => 'info',
        ]);
    }

    public function test_login_federado_usa_el_rol_configurado_en_la_integracion(): void
    {
        $this->seedRoles();
        $this->integracionFederada(rol: 'vendedor');
        $this->externoOk();

        $this->postJson('/api/v1/login', [
            'email' => 'usuariouno@erp.test',
            'password' => 'password123',
        ])->assertStatus(200);

        $user = User::where('email', 'usuariouno@erp.test')->firstOrFail();
        $this->assertTrue($user->roles()->where('slug', 'vendedor')->exists());
    }

    public function test_credenciales_rechazadas_en_el_externo_devuelven_401_sin_login_local(): void
    {
        $this->seedRoles();
        $this->integracionFederada();
        User::factory()->create(['email' => 'usuariouno@erp.test']);

        Http::fake([
            self::URL_BASE . '/api/loginERP' => Http::response([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ], 403),
            '*' => Http::response(['success' => false], 500),
        ]);

        // Password local válida: aun así NO debe caer al login local.
        $response = $this->postJson('/api/v1/login', [
            'email' => 'usuariouno@erp.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)->assertJson(['type' => 'INVALID_CREDENTIALS']);

        $this->assertDatabaseHas('integration_events', [
            'tipo' => 'login.federado_fallo',
            'severidad' => 'error',
        ]);
    }

    public function test_externo_caido_con_fallback_hace_login_local(): void
    {
        $this->seedRoles();
        $this->integracionFederada(fallbackLocal: true);
        User::factory()->create(['email' => 'local@demo.com']);

        Http::fake([
            self::URL_BASE . '/api/loginERP' => Http::response('Server error', 500),
            '*' => Http::response(['success' => false], 500),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'local@demo.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['federado' => false]]);

        $this->assertDatabaseHas('integration_events', [
            'tipo' => 'login.federado_indisponible',
            'severidad' => 'warning',
        ]);
    }

    public function test_externo_caido_sin_fallback_devuelve_503(): void
    {
        $this->seedRoles();
        $this->integracionFederada(fallbackLocal: false);
        User::factory()->create(['email' => 'local@demo.com']);

        Http::fake([
            self::URL_BASE . '/api/loginERP' => Http::response('Server error', 500),
            '*' => Http::response(['success' => false], 500),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'local@demo.com',
            'password' => 'password123',
        ]);

        // Aunque el password local sea válido, sin fallback se rechaza.
        $response->assertStatus(503)->assertJson(['type' => 'AUTH_SERVICE_UNAVAILABLE']);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_endpoint_info_de_login_federado(): void
    {
        $this->getJson('/api/v1/login/integracion')
            ->assertStatus(200)
            ->assertJson(['success' => true, 'data' => ['federado' => false]]);

        $this->integracionFederada();

        $this->getJson('/api/v1/login/integracion')
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'federado' => true,
                    'sistema' => 'ERP Prueba Federado',
                    'fallback_local' => true,
                ],
            ]);
    }

    public function test_usuario_local_existente_reutiliza_su_cuenta(): void
    {
        $this->seedRoles();
        $this->integracionFederada();
        $existente = User::factory()->create(['email' => 'usuariouno@erp.test']);
        $this->externoOk();

        $antes = User::count();

        $this->postJson('/api/v1/login', [
            'email' => 'usuariouno@erp.test',
            'password' => 'password123',
        ])->assertStatus(200)->assertJsonPath('data.user.id', $existente->id);

        $this->assertSame($antes, User::count());
    }

    public function test_usuario_local_inactivo_no_entra_federado(): void
    {
        $this->seedRoles();
        $this->integracionFederada();
        User::factory()->create(['email' => 'usuariouno@erp.test', 'estado' => 'inactivo']);
        $this->externoOk();

        $this->postJson('/api/v1/login', [
            'email' => 'usuariouno@erp.test',
            'password' => 'password123',
        ])->assertStatus(403)->assertJson(['type' => 'USER_INACTIVE']);
    }

    public function test_integracion_sin_credenciales_no_federal(): void
    {
        $this->seedRoles();
        Integration::create([
            'nombre' => 'Sin creds',
            'provider' => 'erp_prueba',
            'estado' => 'sin_credenciales',
            'activa' => true,
            'soporta_login' => true,
        ]);

        User::factory()->create(['email' => 'local@demo.com']);

        $this->postJson('/api/v1/login', [
            'email' => 'local@demo.com',
            'password' => 'password123',
        ])->assertStatus(200)
            ->assertJson(['data' => ['federado' => false]]);
    }
}
