<?php

namespace Tests\Feature;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;
use Tests\Support\FakePaymentProvider;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use WithRoles;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();

        config()->set('payments.default', 'fake');
        config()->set('payments.class_map.fake', FakePaymentProvider::class);
    }

    private function crearPedido(?int $userId): Order
    {
        return Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $userId,
            'subtotal' => 100000,
            'total' => 119000,
            'currency' => 'COP',
            'status' => OrderStatusEnum::NUEVO->value,
            'payment_status' => PaymentStatusEnum::PENDIENTE->value,
        ]);
    }

    public function test_iniciar_pago_aprueba_y_sincroniza_pedido(): void
    {
        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $order = $this->crearPedido($cliente->id);

        $this->postJson('/api/v1/pedidos/' . $order->id . '/pagar', [
            'provider' => 'fake',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', PaymentStatusEnum::APROBADO->value)
            ->assertJsonPath('data.transaction_id', 'txn_' . $order->id);

        $order->refresh();

        $this->assertSame(PaymentStatusEnum::APROBADO->value, $order->payment_status);
        $this->assertSame(OrderStatusEnum::PAGADO->value, $order->status);
    }

    public function test_reembolsar_pago_como_admin(): void
    {
        $cliente = $this->clientUser();
        $order = $this->crearPedido($cliente->id);

        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'fake',
            'transaction_id' => 'txn_' . $order->id,
            'amount' => 119000,
            'currency' => 'COP',
            'status' => PaymentStatusEnum::APROBADO->value,
        ]);

        $this->actingAs($this->adminUser(), 'sanctum');

        $this->postJson('/api/v1/admin/pagos/' . $payment->id . '/reembolsar', [
            'amount' => 119000,
            'reason' => 'Devolución del cliente',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', 'completado');

        $this->assertSame(PaymentStatusEnum::REEMBOLSADO->value, $payment->fresh()->status);
        $this->assertSame(PaymentStatusEnum::REEMBOLSADO->value, $order->fresh()->payment_status);
    }

    public function test_webhook_actualiza_pago(): void
    {
        $cliente = $this->clientUser();
        $order = $this->crearPedido($cliente->id);

        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'fake',
            'transaction_id' => 'txn_999',
            'amount' => 119000,
            'currency' => 'COP',
            'status' => PaymentStatusEnum::PENDIENTE->value,
        ]);

        $this->postJson('/api/webhooks/pagos/fake', [
            'transaction_id' => 'txn_999',
        ])->assertStatus(200);

        $this->assertSame(PaymentStatusEnum::APROBADO->value, $payment->fresh()->status);
        $this->assertSame(OrderStatusEnum::PAGADO->value, $order->fresh()->status);
    }

    public function test_provider_no_soportado_devuelve_error(): void
    {
        config()->set('payments.class_map.fake', 'App\\NoExiste\\FakeProvider');

        $cliente = $this->clientUser();
        $this->actingAs($cliente, 'sanctum');

        $order = $this->crearPedido($cliente->id);

        $this->postJson('/api/v1/pedidos/' . $order->id . '/pagar', [
            'provider' => 'fake',
        ])->assertStatus(422)->assertJson(['type' => 'PAYMENT_ERROR']);
    }
}