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

            $usuario = $pago->order->user;
            if ($usuario) {
                app(NotificationService::class)->pagoReembolsado($usuario, $pago->order, $monto);
            }
        }

        return $reembolso;
    }

    public function sincronizarEstadoPedido(Order $order, string $estadoPago): void
    {
        $order->update([
            'payment_status' => $estadoPago,
            'paid_at' => $estadoPago === PaymentStatusEnum::APROBADO->value
                ? ($order->paid_at ?? now())
                : $order->paid_at,
        ]);

        if ($estadoPago === PaymentStatusEnum::APROBADO->value && $order->status === OrderStatusEnum::NUEVO->value) {
            app(OrderService::class)->transicionar($order, OrderStatusEnum::PAGADO, 'Pago aprobado');

            $this->crearEnvioAutomatico($order);

            try {
                app(InvoiceService::class)->emitir($order->fresh());
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error(
                    "No se pudo emitir la factura del pedido {$order->numero}: " . $e->getMessage()
                );
            }
        }

        // Cola hacia el ERP de facturación (HU-045): el pedido queda
        // pendiente de envío y lo envía la siguiente sincronización.
        if ($estadoPago === PaymentStatusEnum::APROBADO->value) {
            try {
                app(VentaErpService::class)->encolar($order->fresh());
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning(
                    "No se pudo encolar el pedido {$order->numero} hacia el ERP: " . $e->getMessage()
                );
            }
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

        try {
            app(ShippingService::class)->crearEnvio($order, $this->resolverCarrier($order));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error(
                "No se pudo crear el envío automático del pedido {$order->numero}: " . $e->getMessage()
            );
        }
    }

    protected function resolverCarrier(Order $order): string
    {
        $disponibles = array_keys(config('shipping.class_map', []));
        $nombre = mb_strtolower(trim((string) ($order->shippingMethod?->name ?? '')));

        foreach ($disponibles as $clave) {
            if ($nombre !== '' && (str_contains($nombre, $clave) || str_contains($clave, $nombre))) {
                return $clave;
            }
        }

        return config('shipping.default', $disponibles[0] ?? 'servientrega');
    }
}