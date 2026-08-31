<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use App\Services\Shipping\ShippingException;
use App\Services\Shipping\ShippingProvider;

class ShippingService
{
    public function proveedor(?string $nombre = null): ShippingProvider
    {
        $nombre = $nombre ?: config('shipping.default');

        $clase = config("shipping.class_map.{$nombre}");

        if (!$clase || !class_exists($clase)) {
            throw new ShippingException("Proveedor de envío '{$nombre}' no soportado");
        }

        return app($clase);
    }

    public function cotizar(array $datos, ?string $carrier = null): array
    {
        return $this->proveedor($carrier)->cotizar($datos);
    }

    public function crearEnvio(Order $order, string $carrier): Shipment
    {
        if (!$order->address) {
            throw new ShippingException('El pedido no tiene dirección de envío');
        }

        $peso = $order->items->sum(fn ($item) => (float) ($item->product->weight ?? 0) * $item->quantity);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'shipping_method_id' => $order->shipping_method_id,
            'carrier' => $carrier,
            'status' => 'pendiente',
            'destinatario' => $order->user->nombre ?? null,
            'direccion' => $order->address->direccion,
            'ciudad' => $order->address->ciudad,
            'departamento' => $order->address->departamento ?? null,
            'codigo_postal' => $order->address->codigo_postal,
            'weight' => $peso,
        ]);

        $this->proveedor($carrier)->crearEnvio($shipment);

        $order->update(['shipping_status' => 'en_preparacion']);

        return $shipment->fresh();
    }

    public function consultarTracking(string $trackingNumber): array
    {
        $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

        if (!$shipment) {
            throw new ShippingException('Envío no encontrado');
        }

        return $this->proveedor($shipment->carrier)->consultarTracking($trackingNumber);
    }

    public function actualizarEstado(Shipment $shipment, string $estado): Shipment
    {
        $permitidos = ['en_preparacion', 'despachado', 'en_transito', 'entregado'];

        if (!in_array($estado, $permitidos)) {
            throw new ShippingException('Estado de envío no válido');
        }

        $shipment->update([
            'status' => $estado,
            'delivered_at' => $estado === 'entregado' ? now() : $shipment->delivered_at,
        ]);

        $order = $shipment->order;
        $order->update(['shipping_status' => $estado]);

        if ($estado === 'despachado' && $order->user_id) {
            $usuario = \App\Models\User::find($order->user_id);
            if ($usuario) {
                app(NotificationService::class)->pedidoEnviado(
                    $usuario,
                    $order->numero,
                    $shipment->tracking_number ?? ''
                );
            }
        }

        return $shipment->fresh();
    }

    public function cancelar(Shipment $shipment): Shipment
    {
        $this->proveedor($shipment->carrier)->cancelarEnvio($shipment);

        $shipment->order->update(['shipping_status' => 'cancelado']);

        return $shipment->fresh();
    }
}