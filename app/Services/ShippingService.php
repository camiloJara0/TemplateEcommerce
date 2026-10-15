<?php

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Enums\ShippingStatusEnum;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShipmentEvent;
use App\Models\User;
use App\Services\Shipping\ShippingException;
use App\Services\Shipping\ShippingProvider;

class ShippingService
{
    protected const DESCRIPCIONES_EVENTOS = [
        'pendiente' => 'Envío registrado',
        'en_preparacion' => 'Paquete en preparación',
        'despachado' => 'Paquete despachado por la transportadora',
        'en_transito' => 'Paquete en tránsito hacia el destino',
        'entregado' => 'Paquete entregado al destinatario',
        'cancelado' => 'Envío cancelado',
    ];

    public function proveedor(?string $nombre = null): ShippingProvider
    {
        $nombre = $nombre ?: config('shipping.default');

        $clase = config("shipping.class_map.{$nombre}");

        if (!$clase || !class_exists($clase)) {
            throw new ShippingException("Proveedor de envío '{$nombre}' no soportado");
        }

        return app($clase);
    }

    public function carriersDisponibles(): array
    {
        return array_keys(config('shipping.class_map', []));
    }

    public function cotizar(array $datos, ?string $carrier = null): array
    {
        if ($carrier) {
            return $this->proveedor($carrier)->cotizar($datos);
        }

        $cotizaciones = [];

        foreach ($this->carriersDisponibles() as $nombre) {
            try {
                $cotizaciones[] = $this->proveedor($nombre)->cotizar($datos);
            } catch (\Throwable $e) {
                continue;
            }
        }

        usort($cotizaciones, fn ($a, $b) => $a['cost'] <=> $b['cost']);

        return $cotizaciones;
    }

    public function cotizarParaPedido(Order $order, ?string $carrier = null): array
    {
        if (!$order->address) {
            throw new ShippingException('El pedido no tiene dirección de envío');
        }

        $peso = $this->pesoReal($order);

        return $this->cotizar([
            'weight' => $peso,
            'ciudad' => $order->address->ciudad,
            'pais' => $order->address->pais,
        ], $carrier);
    }

    public function crearEnvio(Order $order, string $carrier): Shipment
    {
        if (!$order->address) {
            throw new ShippingException('El pedido no tiene dirección de envío');
        }

        if ($order->shipments()->exists()) {
            throw new ShippingException('El pedido ya tiene un envío asociado');
        }

        $direccion = $order->address;
        $peso = $this->pesoReal($order);

        $cotizacion = $this->cotizar([
            'weight' => $peso,
            'ciudad' => $direccion->ciudad,
            'pais' => $direccion->pais,
        ], $carrier);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'shipping_method_id' => $order->shipping_method_id,
            'carrier' => $carrier,
            'status' => 'pendiente',
            'destinatario' => $order->user?->nombre,
            'direccion' => $direccion->direccion,
            'ciudad' => $direccion->ciudad,
            'departamento' => $direccion->departamento ?? null,
            'codigo_postal' => $direccion->codigo_postal,
            'weight' => $peso,
            'cost' => $cotizacion['cost'] ?? null,
        ]);

        $this->proveedor($carrier)->crearEnvio($shipment);

        $this->registrarEvento($shipment, 'en_preparacion', $direccion->ciudad);

        $order->update(['shipping_status' => ShippingStatusEnum::EN_PREPARACION->value]);

        return $shipment->fresh();
    }

    public function consultarTracking(string $trackingNumber): array
    {
        $shipment = Shipment::where('tracking_number', $trackingNumber)
            ->with(['events', 'order:id,numero,shipping_status'])
            ->first();

        if (!$shipment) {
            throw new ShippingException('Envío no encontrado');
        }

        return [
            'tracking_number' => $shipment->tracking_number,
            'carrier' => $shipment->carrier,
            'status' => $shipment->status,
            'order_numero' => $shipment->order?->numero,
            'destinatario' => $shipment->destinatario,
            'ciudad' => $shipment->ciudad,
            'estimated_delivery' => $shipment->estimated_delivery?->toDateString(),
            'delivered_at' => $shipment->delivered_at?->toDateTimeString(),
            'updated_at' => $shipment->updated_at?->toDateTimeString(),
            'events' => $shipment->events
                ->sortByDesc('occurred_at')
                ->values()
                ->map(fn (ShipmentEvent $evento) => [
                    'status' => $evento->status,
                    'description' => $evento->description,
                    'location' => $evento->location,
                    'date' => $evento->occurred_at?->toDateTimeString(),
                ]),
        ];
    }

    public function actualizarEstado(Shipment $shipment, string $estado): Shipment
    {
        $permitidos = ['en_preparacion', 'despachado', 'en_transito', 'entregado'];

        if (!in_array($estado, $permitidos, true)) {
            throw new ShippingException('Estado de envío no válido');
        }

        if ($shipment->status === $estado) {
            return $shipment;
        }

        $shipment->update([
            'status' => $estado,
            'delivered_at' => $estado === 'entregado' ? now() : $shipment->delivered_at,
        ]);

        $this->registrarEvento($shipment, $estado, $shipment->ciudad);

        $order = $shipment->order;
        $order->update(['shipping_status' => $estado]);

        $this->sincronizarPedido($order, $estado);

        return $shipment->fresh();
    }

    public function cancelar(Shipment $shipment): Shipment
    {
        if (in_array($shipment->status, ['entregado', 'cancelado'], true)) {
            throw new ShippingException('No se puede cancelar un envío entregado o ya cancelado');
        }

        $this->proveedor($shipment->carrier)->cancelarEnvio($shipment);

        $this->registrarEvento($shipment, 'cancelado', $shipment->ciudad);

        $shipment->order->update(['shipping_status' => 'cancelado']);

        return $shipment->fresh();
    }

    public function registrarEvento(Shipment $shipment, string $estado, ?string $ubicacion = null): ShipmentEvent
    {
        return ShipmentEvent::create([
            'shipment_id' => $shipment->id,
            'status' => $estado,
            'description' => self::DESCRIPCIONES_EVENTOS[$estado] ?? ucfirst(str_replace('_', ' ', $estado)),
            'location' => $ubicacion,
            'occurred_at' => now(),
        ]);
    }

    protected function pesoReal(Order $order): float
    {
        return (float) $order->items->sum(
            fn ($item) => (float) ($item->product?->weight ?? 0) * $item->quantity
        );
    }

    protected function sincronizarPedido(Order $order, string $estadoShipment): void
    {
        try {
            $estadoPedido = OrderStatusEnum::tryFrom($order->status);

            if ($estadoShipment === 'despachado'
                && in_array($estadoPedido, [OrderStatusEnum::PAGADO, OrderStatusEnum::PREPARANDO], true)) {
                if ($estadoPedido === OrderStatusEnum::PAGADO) {
                    app(OrderService::class)->transicionar($order, OrderStatusEnum::PREPARANDO, 'Envío en preparación');
                }
                app(OrderService::class)->transicionar($order, OrderStatusEnum::ENVIADO, 'Despachado por la transportadora');
            }

            if ($estadoShipment === 'entregado' && $estadoPedido === OrderStatusEnum::ENVIADO) {
                app(OrderService::class)->transicionar($order, OrderStatusEnum::ENTREGADO, 'Entregado al destinatario');
            }
        } catch (\DomainException $e) {
            \Illuminate\Support\Facades\Log::warning(
                "No se pudo sincronizar el pedido {$order->numero} con el envío: " . $e->getMessage()
            );
        }
    }
}
