<?php

namespace Tests\Feature;

use App\Models\NotificationLog;
use App\Models\PushSubscription;
use App\Models\User;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use WithRoles;

    public function test_registro_genera_notificacion(): void
    {
        $this->postJson('/api/v1/register', [
            'nombre' => 'Nuevo Usuario',
            'email' => 'nuevo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201);

        $usuario = User::where('email', 'nuevo@example.com')->first();

        $this->assertDatabaseHas('notification_logs', [
            'user_id' => $usuario->id,
            'type' => 'registro',
            'channel' => 'database',
            'status' => 'enviado',
        ]);
    }

    public function test_usuario_lista_sus_notificaciones(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        NotificationLog::create([
            'user_id' => $cliente->id,
            'type' => 'pedido_creado',
            'channel' => 'database',
            'subject' => 'Pedido confirmado',
            'body' => 'Tu pedido fue confirmado',
            'status' => 'enviado',
            'sent_at' => now(),
        ]);

        $this->getJson('/api/v1/notificaciones')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.type', 'pedido_creado');
    }

    public function test_subscribir_y_desuscribir_push(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $endpoint = 'https://fcm.googleapis.com/example/endpoint-123';

        $this->postJson('/api/v1/notificaciones/push/subscribir', [
            'endpoint' => $endpoint,
            'auth' => 'auth-token',
            'p256dh' => 'p256-key',
        ])->assertStatus(201);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $cliente->id,
            'endpoint' => $endpoint,
        ]);

        $this->postJson('/api/v1/notificaciones/push/desuscribir', [
            'endpoint' => $endpoint,
        ])->assertStatus(200);

        $this->assertSame(0, PushSubscription::where('user_id', $cliente->id)->count());
    }
}