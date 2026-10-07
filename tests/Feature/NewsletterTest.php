<?php

namespace Tests\Feature;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterTest extends TestCase
{
    use WithRoles;

    private function suscriptorActivo(string $correo = 'lector@test.com'): NewsletterSubscriber
    {
        return NewsletterSubscriber::create([
            'correo' => $correo,
            'nombre' => 'Lector',
            'estado' => NewsletterSubscriber::ESTADO_ACTIVO,
            'token_aprobacion' => 'token-' . uniqid(),
            'origen' => 'web',
            'fecha_confirmacion' => now(),
        ]);
    }

    public function test_alta_confirmacion_y_baja_de_suscripcion(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/newsletter', ['correo' => 'nuevo@test.com'])
            ->assertStatus(201)
            ->assertJsonPath('data.estado', 'Inactivo');

        $token = NewsletterSubscriber::where('correo', 'nuevo@test.com')->value('token_aprobacion');

        $this->postJson('/api/v1/confirmarNewsletter', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('data.estado', 'Activo');

        $this->getJson('/api/v1/newsletter/baja/' . $token)
            ->assertOk()
            ->assertJsonPath('data.cancelado', false);

        $this->postJson('/api/v1/newsletter/baja', ['token' => $token])->assertOk();

        $this->assertDatabaseHas('newsletter_subscribers', [
            'correo' => 'nuevo@test.com',
            'estado' => NewsletterSubscriber::ESTADO_CANCELADO,
        ]);
    }

    public function test_vista_previa_de_campana_usa_el_mismo_diseño_que_el_envio(): void
    {
        Mail::fake();
        $this->actingAs($this->adminUser(), 'sanctum');

        $payload = [
            'titulo' => 'Ofertas de temporada',
            'asunto' => 'Hasta 40% de descuento',
            'contenido' => 'Descubre nuestras mejores ofertas de la temporada.',
            'estado' => 'Borrador',
        ];

        $this->postJson('/api/v1/admin/newsletter_campaign', $payload)
            ->assertStatus(201)
            ->assertJsonPath('data.titulo', 'Ofertas de temporada');

        $preview = $this->postJson('/api/v1/admin/newsletter_campaign/vista-previa', $payload);
        $preview->assertOk();

        $html = $preview->json('data.html');
        $this->assertIsString($html);
        $this->assertNotSame('', $html);
        $this->assertStringContainsString('<html', $html);
        $this->assertStringContainsString('Ofertas de temporada', $html);
        $this->assertStringContainsString('Descubre nuestras mejores ofertas', $html);
        $this->assertStringContainsString('Cancelar suscripci', $html);

        // La vista previa no debe persistir campañas
        $this->assertSame(1, NewsletterCampaign::count());
    }

    public function test_envio_de_campana_registra_destinatarios(): void
    {
        Mail::fake();
        $admin = $this->adminUser();
        $this->suscriptorActivo();
        $this->suscriptorActivo('otro@test.com');
        $this->suscriptorActivo('inactivo@test.com')->update([
            'estado' => NewsletterSubscriber::ESTADO_INACTIVO,
        ]);

        $campaign = NewsletterCampaign::create([
            'titulo' => 'Newsletter semanal',
            'asunto' => 'Novedades de la semana',
            'contenido' => 'Hola, estas son las novedades de la semana.',
            'estado' => NewsletterCampaign::ESTADO_BORRADOR,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/newsletter_campaign/{$campaign->id}/enviar")
            ->assertOk();

        $campaign->refresh();
        $this->assertSame(NewsletterCampaign::ESTADO_ENVIADA, $campaign->estado);
        $this->assertSame(2, $campaign->destinatarios);
        $this->assertSame(2, $campaign->enviados);
        $this->assertSame(0, $campaign->fallidos);

        $this->assertDatabaseHas('newsletter_campaign_recipients', [
            'campaign_id' => $campaign->id,
            'correo' => 'lector@test.com',
            'estado' => 'enviado',
        ]);

        // Una campaña enviada ya no se puede editar
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/newsletter_campaign/{$campaign->id}", $payload = [
                'titulo' => 'Otro título',
                'asunto' => 'Otro asunto',
                'contenido' => 'Otro contenido',
            ])
            ->assertStatus(409);
    }

    public function test_eventos_de_webhook_quedan_registrados_y_consultables(): void
    {
        Mail::fake();
        $this->actingAs($this->adminUser(), 'sanctum');

        // Provider desconocido: se ignora (200) pero deja trazabilidad del evento
        $this->postJson('/api/webhooks/pagos/desconocido', [
            'event_id' => 'evt_test_1',
            'type' => 'payment.updated',
        ])->assertOk();

        $this->assertDatabaseHas('webhook_events', [
            'provider' => 'desconocido',
            'event_id' => 'evt_test_1',
            'estado' => 'ignorado',
        ]);

        $this->getJson('/api/v1/admin/webhooks/events')
            ->assertOk()
            ->assertJsonPath('data.resumen.total', 1);

        $this->getJson('/api/v1/admin/webhooks/events/proveedores')
            ->assertOk()
            ->assertJsonStructure(['data' => ['providers', 'estados']]);
    }
}
