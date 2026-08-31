<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;
use App\Models\ShippingMethod;
use Illuminate\Support\Str;
use Tests\TestCase;

class ShippingTest extends TestCase
{
    use WithRoles;

    private function pedidoConDireccion(User $cliente): Order
    {
        $direccion = Address::create([
            'user_id' => $cliente->id,
            'ciudad' => 'Medellín',
            'direccion' => 'Cra 45 # 12-34',
            'codigo_postal' => '050001',
        ]);

        return Order::create([
            'numero' => 'ORD-' . Str::random(6),
            'user_id' => $cliente->id,
            'address_id' => $direccion->id,
            'subtotal' => 50000,
            'shipping_cost' => 10000,
            'tax' => 9500,
            'total' => 69500,
            'currency' => 'COP',
            'status' => 'pagado',
            'shipping_status' => 'pendiente',
        ]);
    }

    public function test_admin_crea_envio_con_tracking(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();
        $order = $this->pedidoConDireccion($cliente);

        $this->postJson('/api/v1/admin/envios', [
            'order_id' => $order->id,
            'carrier' => 'servientrega',
        ])->assertStatus(201)
            ->assertJsonPath('data.status', 'en_preparacion')
            ->assertJsonStructure(['data' => ['tracking_number']]);

        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'carrier' => 'servientrega',
        ]);

        $this->assertSame('en_preparacion', $order->fresh()->shipping_status);
    }

    public function test_actualiza_estado_envio(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');
        $cliente = $this->clientUser();
        $order = $this->pedidoConDireccion($cliente);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'carrier' => 'servientrega',
            'status' => 'en_preparacion',
        ]);

        $this->putJson('/api/v1/admin/envios/' . $shipment->id . '/estado', [
            'estado' => 'despachado',
        ])->assertStatus(200)->assertJsonPath('data.status', 'despachado');

        $this->assertSame('despachado', $order->fresh()->shipping_status);
    }

    public function test_tracking_publico_devuelve_datos(): void
    {
        $cliente = $this->clientUser();
        $order = $this->pedidoConDireccion($cliente);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'carrier' => 'servientrega',
            'tracking_number' => 'SERV-ABCDEF1234',
            'status' => 'en_transito',
        ]);

        $this->getJson('/api/v1/envios/tracking/' . $shipment->tracking_number)
            ->assertStatus(200)
            ->assertJsonPath('data.tracking_number', $shipment->tracking_number);
    }

    public function test_cotizacion_de_envio(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->getJson('/api/v1/admin/envios/cotizar?carrier=dhl&weight=2')
            ->assertStatus(200)
            ->assertJsonPath('data.carrier', 'dhl')
            ->assertJsonStructure(['data' => ['cost', 'estimated_days']]);
    }

    public function test_carrier_no_soportado(): void
    {
        $this->actingAs($this->adminUser(), 'sanctum');

        $this->getJson('/api/v1/admin/envios/cotizar?carrier=inexistente')
            ->assertStatus(422);
    }
}