<?php

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\Payment\PaymentException;
use App\Services\Payment\PaymentProvider;
use Illuminate\Http\Request;

class PaymentService
{
    public function proveedor(?string $nombre = null): PaymentProvider
    {
        $nombre = $nombre ?: config('payments.default');

        if (!$nombre) {
            throw new PaymentException('No se ha configurado un proveedor de pago (PAYMENT_PROVIDER)');
        }

        $clase = config("payments.class_map.{$nombre}");

        if (!$clase || !class_exists($clase)) {
            throw new PaymentException("Proveedor de pago '{$nombre}' no soportado");
        }

        return app($clase);
    }

    public function iniciarPago(Order $order, string $provider, array $datos = []): Payment
    {
        if ($order->payment_status === PaymentStatusEnum::APROBADO->value) {
            throw new PaymentException('El pedido ya está pagado');
        }

        $providerService = $this->proveedor($provider);

        $pago = Payment::create([
            'order_id' => $order->id,
            'provider' => $provider,
            'amount' => $order->total,
            'currency' => $order->currency,
            'status' => PaymentStatusEnum::PENDIENTE->value,
            'reference' => $datos['reference'] ?? null,
        ]);

        $resultado = $providerService->charge($order, $datos);

        $pago->update([
            'transaction_id' => $resultado['transaction_id'] ?? null,
            'reference' => $resultado['reference'] ?? ($resultado['payload']['client_secret'] ?? null),
            'status' => $resultado['status'] ?? PaymentStatusEnum::PENDIENTE->value,
            'payload' => $resultado['payload'] ?? null,
        ]);

        $this->sincronizarEstadoPedido($order, $pago->status);

        return $pago->fresh();
    }

    public function procesarWebhook(string $provider, Request $request): ?Payment
    {
        $providerService = $this->proveedor($provider);

        $resultado = $providerService->handleWebhook($request);

        $transactionId = $resultado['transaction_id'] ?? null;
        $estado = $resultado['status'] ?? null;

        if (!$transactionId || !$estado) {
            return null;
        }

        $pago = Payment::where('provider', $provider)
            ->where('transaction_id', $transactionId)
            ->first();

        if (!$pago) {
            throw new PaymentException('Pago no encontrado para la transacción recibida');
        }

        $pago->update([
            'status' => $estado,
            'payload' => $resultado['payload'] ?? $pago->payload,
        ]);

        $this->sincronizarEstadoPedido($pago->order, $estado);

        return $pago;
    }

    public function reembolsar(Payment $pago, float $monto, ?string $razon = null): Refund
    {
        if ($pago->status !== PaymentStatusEnum::APROBADO->value) {
            throw new PaymentException('Solo se pueden reembolsar pagos aprobados');
        }

        if ($monto <= 0 || $monto > (float) $pago->amount) {
            throw new PaymentException('Monto de reembolso inválido');
        }

        $providerService = $this->proveedor($pago->provider);

        $resultado = $providerService->refund($pago, $monto, $razon);

        $reembolso = Refund::create([
            'payment_id' => $pago->id,
            'amount' => $monto,
            'reason' => $razon,
            'status' => $resultado['status'] ?? 'pendiente',
            'transaction_id' => $resultado['transaction_id'] ?? null,
        ]);

        if ($reembolso->status === 'completado') {
            $pago->update(['status' => PaymentStatusEnum::REEMBOLSADO->value]);
            $this->sincronizarEstadoPedido($pago->order, PaymentStatusEnum::REEMBOLSADO->value);
        }

        return $reembolso;
    }

    public function sincronizarEstadoPedido(Order $order, string $estadoPago): void
    {
        $order->update(['payment_status' => $estadoPago]);

        if ($estadoPago === PaymentStatusEnum::APROBADO->value && $order->status === OrderStatusEnum::NUEVO->value) {
            app(OrderService::class)->transicionar($order, OrderStatusEnum::PAGADO, 'Pago aprobado');

            $this->crearEnvioAutomatico($order);
        }
    }

    protected function crearEnvioAutomatico(Order $order): void
    {
        if ($order->shipments()->exists()) {
            return;
        }

        if (!$order->shipping_method_id) {
            return;
        }

        $address = $order->address;
        $shippingMethod = $order->shippingMethod;

        \App\Models\Shipment::create([
            'order_id' => $order->id,
            'shipping_method_id' => $order->shipping_method_id,
            'carrier' => $shippingMethod?->name ?? 'default',
            'status' => 'pendiente',
            'destinatario' => $order->user->nombre ?? $order->user->name ?? '',
            'direccion' => $address?->direccion ?? $address?->address ?? '',
            'ciudad' => $address?->ciudad ?? $address?->city ?? '',
            'departamento' => $address?->departamento ?? $address?->state ?? '',
            'codigo_postal' => $address?->codigo_postal ?? $address?->zip ?? '',
        ]);

        $order->update(['shipping_status' => \App\Enums\ShippingStatusEnum::EN_PREPARACION->value]);
    }
}