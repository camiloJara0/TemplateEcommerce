<?php

namespace Tests\Feature;

use App\Models\Integration;
use Tests\TestCase;

class IntegrationTest extends TestCase
{
    use WithRoles;

    private function payloadErpDemo(array $sobreescribir = []): array
    {
        return array_merge([
            'nombre' => 'ERP Principal',
            'provider' => 'erp_demo',
            'credenciales' => [
                'usuario' => 'admin',
                'clave' => 'secreta-123',
            ],
        ], $sobreescribir);
    }

    public function test_admin_crea_integracion_erp_demo(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $response = $this->postJson('/api/v1/admin/integraciones', $this->payloadErpDemo());

        $response->assertStatus(201)
            ->assertJsonPath('data.nombre', 'ERP Principal')
            ->assertJsonPath('data.provider', 'erp_demo')
            ->assertJsonPath('data.estado', 'inactiva')
            ->assertJsonPath('data.configurado', true);

        $this->assertDatabaseHas('integrations', ['nombre' => 'ERP Principal', 'provider' => 'erp_demo']);
    }

    public function test_respuesta_nunca_expone_credenciales(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $integration = Integration::create([
            'nombre' => 'ERP Privado',
            'provider' => 'erp_demo',
            'estado' => 'inactiva',
        ]);
        app(\App\Services\IntegrationCredentialService::class)
            ->guardar($integration, ['usuario' => 'admin', 'clave' => 'super-secreta']);

        $response = $this->getJson('/api/v1/admin/integraciones/' . $integration->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.configurado', true)
            ->assertJsonPath('data.credenciales_configuradas.usuario', true)
            ->assertJsonPath('data.credenciales_configuradas.clave', true);

        $contenido = $response->getContent();
        $this->assertStringNotContainsString('super-secreta', $contenido);
        $this->assertStringNotContainsString('credenciales":{', $contenido);
    }

    public function test_probar_conexion_ok(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $integration = Integration::create([
            'nombre' => 'ERP Demo',
            'provider' => 'erp_demo',
            'estado' => 'inactiva',
        ]);
        app(\App\Services\IntegrationCredentialService::class)
            ->guardar($integration, ['usuario' => 'admin', 'clave' => 'x']);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/probar')
            ->assertStatus(200)
            ->assertJsonPath('data.success', true);

        $this->assertDatabaseHas('integration_events', [
            'integration_id' => $integration->id,
            'tipo' => 'conexion.probada',
            'severidad' => 'info',
        ]);
    }

    public function test_probar_conexion_sin_credenciales_rechazado(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $integration = Integration::create([
            'nombre' => 'ERP Vacío',
            'provider' => 'erp_demo',
            'estado' => 'sin_credenciales',
        ]);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/probar')
            ->assertStatus(422)
            ->assertJson(['type' => 'SIN_CREDENCIALES']);
    }

    public function test_activar_requiere_credenciales(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $sinCreds = Integration::create([
            'nombre' => 'Sin Creds',
            'provider' => 'erp_demo',
            'estado' => 'sin_credenciales',
        ]);

        $this->postJson('/api/v1/admin/integraciones/' . $sinCreds->id . '/activar')
            ->assertStatus(422)
            ->assertJson(['type' => 'SIN_CREDENCIALES']);

        $conCreds = Integration::create([
            'nombre' => 'Con Creds',
            'provider' => 'erp_demo',
            'estado' => 'inactiva',
        ]);
        app(\App\Services\IntegrationCredentialService::class)
            ->guardar($conCreds, ['usuario' => 'admin', 'clave' => 'x']);

        $this->postJson('/api/v1/admin/integraciones/' . $conCreds->id . '/activar')
            ->assertStatus(200)
            ->assertJsonPath('data.estado', 'activa')
            ->assertJsonPath('data.activa', true);
    }

    public function test_desactivar_integracion(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $integration = Integration::create([
            'nombre' => 'Para Desactivar',
            'provider' => 'erp_demo',
            'estado' => 'activa',
            'activa' => true,
        ]);

        $this->postJson('/api/v1/admin/integraciones/' . $integration->id . '/desactivar')
            ->assertStatus(200)
            ->assertJsonPath('data.estado', 'inactiva')
            ->assertJsonPath('data.activa', false);
    }

    public function test_vendedor_no_tiene_acceso(): void
    {
        $this->actingAsSanctum($this->vendedorUser());

        $this->getJson('/api/v1/admin/integraciones')->assertStatus(403);
        $this->postJson('/api/v1/admin/integraciones', $this->payloadErpDemo())->assertStatus(403);
    }

    public function test_cliente_no_tiene_acceso(): void
    {
        $this->actingAsSanctum($this->clientUser());

        $this->getJson('/api/v1/admin/integraciones')->assertStatus(403);
    }

    public function test_listar_sistemas_disponibles(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $this->getJson('/api/v1/admin/integraciones/sistemas')
            ->assertStatus(200)
            ->assertJsonPath('data.0.key', 'erp_demo')
            ->assertJsonPath('data.1.key', 'erp_prueba')
            ->assertJsonCount(2, 'data');
    }

    public function test_listar_integraciones(): void
    {
        $this->actingAsSanctum($this->adminUser());

        Integration::create(['nombre' => 'Uno', 'provider' => 'erp_demo', 'estado' => 'sin_credenciales']);
        Integration::create(['nombre' => 'Dos', 'provider' => 'erp_demo', 'estado' => 'activa', 'activa' => true]);

        $this->getJson('/api/v1/admin/integraciones')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 2);
    }

    public function test_eliminar_integracion(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $integration = Integration::create([
            'nombre' => 'Temporal',
            'provider' => 'erp_demo',
            'estado' => 'inactiva',
        ]);

        $this->deleteJson('/api/v1/admin/integraciones/' . $integration->id)
            ->assertStatus(200);

        $this->assertDatabaseMissing('integrations', ['id' => $integration->id]);
    }
}
