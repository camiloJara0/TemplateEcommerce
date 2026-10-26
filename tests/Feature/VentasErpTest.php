<?php

namespace Tests\Feature;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\IntegrationExternalDoc;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\IntegrationCredentialService;
use App\Services\VentaErpService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Tests\Support\FakePaymentProvider;
use Tests\TestCase;

class VentasErpTest extends TestCase
{
    use WithRoles;

    private const URL_BASE = 'http://127.0.0.1:8001';
    private const API_KEY = 'test-key-123';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('payments.default', 'fake');
        config()->set('payments.class_map.fake', FakePaymentProvider::class);
    }

    private function integracionVentas(): Integration
    {
        $integration = Integration::create([
            'nombre' => 'ERP Ventas Externo',
            'provider' => 'erp_prueba',
            'estado' => 'activa',
            'activa' => true,
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

    private function crearPedido(?int $userId): Order
    {
        $producto = Product::create([
            'name' => 'Producto de Venta',
            'sku' => 'VD-' . Str::random(4),
            'price' => 50000,
            'stock' => 100,
            'estado' => 'activo',
        ]);

        $order = Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $userId,
            'subtotal' => 50000,
            'total' => 59500,
            'currency' => 'COP',
            'status' => OrderStatusEnum::NUEVO->value,
            'payment_status' => PaymentStatusEnum::PENDIENTE->value,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $producto->id,
            'name' => $producto->name,
            'sku' => $producto->sku,
            'price' => 50000,
            'quantity' => 1,
            'subtotal' => 50000,
        ]);

        return $order;
    }

    private function pedidoAprobado(): Order
    {
        $order = $this->crearPedido($this->clientUser()->id);
        $order->update([
            'status' => OrderStatusEnum::PAGADO->value,
            'payment_status' => PaymentStatusEnum::APROBADO->value,
        ]);

        app(VentaErpService::class)->encolar($order->fresh());

        return $order->fresh();
    }

    private function payloadVentaOk(string $idExterno): array
    {
        return [
            'success' => true,
            'data' => ['id_externo' => $idExterno, 'estado' => 'aceptado'],
        ];
    }

    public function test_pago_aprobado_encola_la_venta_en_el_erp(): void
    {
        $integration = $this->integracionVentas();

        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');
        $order = $this->crearPedido($cliente->id);

        $this->postJson('/api/v1/pedidos/' . $order->id . '/pagar', ['provider' => 'fake'])
            ->assertStatus(200);

        $order->refresh();
        $this->assertSame(PaymentStatusEnum::APROBADO->value, $order->payment_status);
        $this->assertSame('pendiente_envio', $order->integration_erp_estado);
        $this->assertSame($integration->id, $order->integration_erp_id);
        $this->assertFalse((bool) $order->integration_erp_error_transitorio);
    }

    public function test_sincronizacion_envia_la_venta_y_no_la_repite(): void
    {
        $integration = $this->integracionVentas();
        $order = $this->pedidoAprobado();

        Http::fake([
            '*/ventasERP' => Http::response($this->payloadVentaOk('VTA-ABC123'), 200),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas'])
            ->assertExitCode(0);

        $order->refresh();
        $this->assertSame('aceptado', $order->integration_erp_estado);
        $this->assertSame('VTA-ABC123', $order->integration_erp_externo_id);
        $this->assertNull($order->integration_erp_error);
        $this->assertNotNull($order->integration_erp_enviado_en);

        $doc = IntegrationExternalDoc::where('integration_id', $integration->id)
            ->where('tipo', 'venta')
            ->where('external_id', $order->numero)
            ->first();
        $this->assertNotNull($doc);
        $this->assertSame('aceptado', $doc->estado);
        $this->assertSame(Order::class, $doc->local_type);
        $this->assertSame($order->id, $doc->local_id);
        $this->assertSame('VTA-ABC123', $doc->payload['respuesta_externa']['external_id']);

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('exitosa', $run->estado);
        $this->assertSame(1, $run->procesados);
        $this->assertSame(0, $run->errores);
        $this->assertSame(1, $run->resumen['ventas_enviadas']);

        $evento = IntegrationEvent::where('integration_id', $integration->id)
            ->where('tipo', 'venta.enviada')
            ->first();
        $this->assertNotNull($evento);

        $numero = $order->numero;
        Http::assertSent(function ($request) use ($numero) {
            return $request->url() === self::URL_BASE . '/api/ventasERP'
                && $request->hasHeader('X-API-KEY', self::API_KEY)
                && $request['numero'] === $numero;
        });

        // Segunda corrida: ya aceptado, no vuelve a la cola.
        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas']);

        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(0, $segundoRun->procesados);
        $this->assertSame(0, $segundoRun->resumen['ventas_enviadas']);
        $this->assertSame('exitosa', $segundoRun->estado);
        Http::assertSentCount(1);
    }

    public function test_error_500_del_erp_queda_como_error_transitorio(): void
    {
        $integration = $this->integracionVentas();
        $order = $this->pedidoAprobado();

        Http::fake([
            '*/ventasERP' => Http::response(['success' => false], 500),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas'])
            ->assertExitCode(0);

        $run = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame('fallida', $run->estado);
        $this->assertSame(1, $run->errores);
        $this->assertSame(0, $run->resumen['ventas_enviadas']);

        $order->refresh();
        $this->assertSame('error', $order->integration_erp_estado);
        $this->assertTrue((bool) $order->integration_erp_error_transitorio);
        $this->assertStringContainsString('HTTP 500', (string) $order->integration_erp_error);

        $evento = IntegrationEvent::where('integration_id', $integration->id)
            ->where('tipo', 'venta.error')
            ->where('severidad', 'error')
            ->first();
        $this->assertNotNull($evento);

        // Siguiente corrida: el error transitorio vuelve a la cola (RN-16).
        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas']);
        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(1, $segundoRun->procesados, 'Se reintentó automáticamente');
        Http::assertSentCount(2);
    }

    public function test_reintento_manual_reenvia_y_acepta_la_venta(): void
    {
        $integration = $this->integracionVentas();
        $order = $this->pedidoAprobado();

        // Estado de error previo (como si el ERP hubiera fallado).
        $order->update([
            'integration_erp_estado' => 'error',
            'integration_erp_error' => 'El ERP Prueba respondió HTTP 500 en /api/ventasERP.',
            'integration_erp_error_transitorio' => true,
        ]);

        Http::fake([
            '*/ventasERP' => Http::response($this->payloadVentaOk('VTA-FIXED9'), 200),
        ]);

        $this->actingAs($this->adminUser(), 'sanctum');
        $this->postJson('/api/v1/admin/pedidos/' . $order->id . '/erp-reintentar')
            ->assertStatus(200)
            ->assertJsonPath('data.success', true)
            ->assertJsonPath('data.estado', 'aceptado')
            ->assertJsonPath('data.order.integration_erp_externo_id', 'VTA-FIXED9');

        $order->refresh();
        $this->assertSame('aceptado', $order->integration_erp_estado);
        $this->assertSame('VTA-FIXED9', $order->integration_erp_externo_id);
        $this->assertFalse((bool) $order->integration_erp_error_transitorio);
    }

    public function test_reintento_manual_sobre_fallo_persistente_devuelve_422(): void
    {
        $this->integracionVentas();
        $order = $this->pedidoAprobado();

        $order->update([
            'integration_erp_estado' => 'error',
            'integration_erp_error' => 'Fallo previo.',
            'integration_erp_error_transitorio' => false,
        ]);

        Http::fake([
            '*/ventasERP' => Http::response(['success' => false], 500),
        ]);

        $this->actingAs($this->adminUser(), 'sanctum');
        $this->postJson('/api/v1/admin/pedidos/' . $order->id . '/erp-reintentar')
            ->assertStatus(422)
            ->assertJson(['type' => 'ERP_REINTENTO_FALLIDO']);

        $order->refresh();
        $this->assertSame('error', $order->integration_erp_estado);
        $this->assertTrue((bool) $order->integration_erp_error_transitorio, 'El nuevo fallo 500 es transitorio');
    }

    public function test_error_permanente_no_vuelve_a_la_cola(): void
    {
        $integration = $this->integracionVentas();
        $order = $this->pedidoAprobado();

        Http::fake([
            '*/ventasERP' => Http::response(['success' => false, 'message' => 'Documento inválido'], 422),
        ]);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas']);

        $order->refresh();
        $this->assertSame('error', $order->integration_erp_estado);
        $this->assertFalse((bool) $order->integration_erp_error_transitorio, '4xx es permanente (solo reintento manual)');
        $this->assertStringContainsString('HTTP 422', (string) $order->integration_erp_error);

        $this->artisan('integrations:sync', ['--integration' => $integration->id, '--tipo' => 'ventas']);
        $segundoRun = $integration->syncRuns()->orderByDesc('id')->first();
        $this->assertSame(0, $segundoRun->procesados, 'Los errores permanentes no se reencolan solos');
        Http::assertSentCount(1);
    }

    public function test_reintento_manual_requiere_permiso(): void
    {
        $this->integracionVentas();
        $order = $this->pedidoAprobado();

        Http::fake([
            '*/ventasERP' => Http::response($this->payloadVentaOk('VTA-NO'), 200),
        ]);

        $this->actingAs($this->clientUser(), 'sanctum');
        $this->postJson('/api/v1/admin/pedidos/' . $order->id . '/erp-reintentar')
            ->assertStatus(403);
    }
}
