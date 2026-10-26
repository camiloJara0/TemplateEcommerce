<?php

namespace App\Services;

use App\Enums\OrderErpEstadoEnum;
use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\IntegrationExternalDoc;
use App\Models\IntegrationSyncRun;
use App\Models\Order;
use App\Services\Integration\IntegrationException;
use App\Services\Integration\Normalizers\OrderNormalizer;

/**
 * Salida de ventas de la tienda → sistema de facturación/ERP (HU-045).
 *
 * - `encolar`: al aprobarse el pago, marca el pedido como pendiente de envío.
 * - `enviar`: llama al proveedor y deja el estado del pedido (aceptado/error).
 * - Cola persistente: si el externo está caído, la pedido queda en error
 *   transitorio y la siguiente sincronización lo reintenta (RN-16).
 * - `reintentar`: reintento manual desde la ficha del pedido.
 */
class VentaErpService
{
    /**
     * Integraciones activas, configuradas y con capability 'ventas'.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Integration>
     */
    public function integracionesConVentas(): \Illuminate\Support\Collection
    {
        $credentialService = app(IntegrationCredentialService::class);

        return Integration::query()
            ->where('estado', 'activa')
            ->where('activa', true)
            ->get()
            ->filter(function (Integration $integration) use ($credentialService) {
                $meta = config("integrations.providers.{$integration->provider}", []);

                return in_array('ventas', $meta['capabilities'] ?? [], true)
                    && $credentialService->estaConfigurado($integration);
            })
            ->values();
    }

    /**
     * Marca el pedido como pendiente de envío cuando hay un ERP de ventas
     * activo (llamado al aprobarse el pago). Nunca reencola pedidos ya
     * aceptados.
     */
    public function encolar(Order $order): void
    {
        if ($order->integration_erp_estado === OrderErpEstadoEnum::ACEPTADO->value) {
            return;
        }

        if ($order->payment_status !== PaymentStatusEnum::APROBADO->value) {
            return;
        }

        $candidatas = $this->integracionesConVentas();

        if ($candidatas->isEmpty()) {
            return;
        }

        $order->update([
            'integration_erp_estado' => OrderErpEstadoEnum::PENDIENTE_ENVIO->value,
            'integration_erp_id' => $candidatas->count() === 1 ? $candidatas->first()->id : null,
            'integration_erp_error' => null,
            'integration_erp_error_transitorio' => false,
        ]);
    }

    /**
     * Pedidos en cola para una integración: pendientes de envío y errores
     * transitorios (los permanentes solo se reenvían a mano).
     */
    public function cola(Integration $integration): \Illuminate\Database\Eloquent\Builder
    {
        return Order::query()
            ->where('payment_status', PaymentStatusEnum::APROBADO->value)
            ->where('status', '!=', OrderStatusEnum::CANCELADO->value)
            ->where(function ($q) use ($integration) {
                $q->where('integration_erp_estado', OrderErpEstadoEnum::PENDIENTE_ENVIO->value)
                    ->orWhere(function ($q2) {
                        $q2->where('integration_erp_estado', OrderErpEstadoEnum::ERROR->value)
                            ->where('integration_erp_error_transitorio', true);
                    });
            })
            ->where(function ($q) use ($integration) {
                $q->whereNull('integration_erp_id')
                    ->orWhere('integration_erp_id', $integration->id);
            })
            ->orderBy('id');
    }

    /**
     * Envía un pedido al ERP. Actualiza el estado del pedido en ambos casos
     * y lanza IntegrationException si falla (el llamador lo cuenta/reporta).
     *
     * @return array{external_id: string, estado: string}
     */
    public function enviar(
        Integration $integration,
        Order $order,
        ?IntegrationSyncRun $run = null
    ): array {
        $credentialService = app(IntegrationCredentialService::class);
        $provider = $credentialService->proveedor($integration);
        $credenciales = $credentialService->obtener($integration);

        // Reclamo de la cola: la integración queda asociada al pedido.
        if ($order->integration_erp_id !== $integration->id) {
            $order->update(['integration_erp_id' => $integration->id]);
        }

        $documento = app(OrderNormalizer::class)->normalizar($this->documentoDesdePedido($order));

        try {
            $resultado = $provider->crearVenta($credenciales, $documento);
        } catch (\Throwable $e) {
            $descripcion = $provider->describirError($e);

            $order->update([
                'integration_erp_estado' => OrderErpEstadoEnum::ERROR->value,
                'integration_erp_error' => $descripcion['mensaje'],
                'integration_erp_error_transitorio' => $descripcion['transitorio'],
            ]);

            IntegrationEvent::create([
                'integration_id' => $integration->id,
                'sync_run_id' => $run?->id,
                'tipo' => 'venta.error',
                'severidad' => 'error',
                'mensaje' => "Error enviando el pedido {$order->numero}: {$descripcion['mensaje']}",
                'payload' => [
                    'order_id' => $order->id,
                    'numero' => $order->numero,
                    'transitorio' => $descripcion['transitorio'],
                ],
            ]);

            throw $e instanceof IntegrationException
                ? $e
                : new IntegrationException($descripcion['mensaje'], $descripcion['transitorio']);
        }

        $order->update([
            'integration_erp_estado' => $resultado['estado'] === 'enviado'
                ? OrderErpEstadoEnum::ENVIADO->value
                : OrderErpEstadoEnum::ACEPTADO->value,
            'integration_erp_externo_id' => $resultado['external_id'],
            'integration_erp_error' => null,
            'integration_erp_error_transitorio' => false,
            'integration_erp_enviado_en' => now(),
        ]);

        // Documento externo: idempotencia y trazabilidad (único por tipo+numero).
        IntegrationExternalDoc::updateOrCreate(
            [
                'integration_id' => $integration->id,
                'tipo' => 'venta',
                'external_id' => $order->numero,
            ],
            [
                'local_type' => Order::class,
                'local_id' => $order->id,
                'estado' => $order->integration_erp_estado,
                'payload' => array_merge($documento, [
                    'respuesta_externa' => $resultado,
                ]),
            ]
        );

        IntegrationEvent::create([
            'integration_id' => $integration->id,
            'sync_run_id' => $run?->id,
            'tipo' => 'venta.enviada',
            'severidad' => 'info',
            'mensaje' => "Pedido {$order->numero} aceptado por el ERP ({$resultado['external_id']})",
            'payload' => [
                'order_id' => $order->id,
                'numero' => $order->numero,
                'external_id' => $resultado['external_id'],
            ],
        ]);

        return $resultado;
    }

    /**
     * Reintento manual del envío al ERP (HU-045 CA5). Resetea el error y
     * reintenta de inmediato.
     *
     * @return array{success: bool, estado: string, mensaje: string}
     */
    public function reintentar(Order $order): array
    {
        if ($order->integration_erp_estado === OrderErpEstadoEnum::ACEPTADO->value) {
            return [
                'success' => true,
                'estado' => OrderErpEstadoEnum::ACEPTADO->value,
                'mensaje' => 'El pedido ya fue aceptado por el ERP.',
            ];
        }

        $integration = $this->resolverIntegracionDelPedido($order);

        if (!$integration) {
            throw new IntegrationException(
                'No hay una integración activa con capacidad de ventas para reenviar este pedido.'
            );
        }

        $order->update([
            'integration_erp_estado' => OrderErpEstadoEnum::PENDIENTE_ENVIO->value,
            'integration_erp_error' => null,
            'integration_erp_error_transitorio' => false,
        ]);

        $this->enviar($integration, $order->fresh());

        return [
            'success' => true,
            'estado' => (string) $order->fresh()->integration_erp_estado,
            'mensaje' => 'Pedido reenviado al ERP.',
        ];
    }

    private function resolverIntegracionDelPedido(Order $order): ?Integration
    {
        if ($order->integration_erp_id) {
            $integration = Integration::find($order->integration_erp_id);

            if ($integration
                && $integration->estado === 'activa'
                && in_array('ventas', config("integrations.providers.{$integration->provider}.capabilities", []), true)
                && app(IntegrationCredentialService::class)->estaConfigurado($integration)
            ) {
                return $integration;
            }
        }

        return $this->integracionesConVentas()->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function documentoDesdePedido(Order $order): array
    {
        $order->loadMissing(['items', 'user']);

        return [
            'numero' => $order->numero,
            'fecha' => optional($order->paid_at ?? $order->created_at)->toDateString(),
            'moneda' => $order->currency,
            'subtotal' => (float) $order->subtotal,
            'impuestos' => (float) $order->tax,
            'descuento' => (float) $order->discount,
            'envio' => (float) $order->shipping_cost,
            'total' => (float) $order->total,
            'cliente' => [
                'nombre' => $order->billing_nombre ?? $order->user?->nombre,
                'nit' => $order->billing_nit,
                'razon_social' => $order->billing_razon_social,
            ],
            'items' => $order->items->map(fn ($item) => [
                'sku' => $item->sku ?: ('PED-' . $item->id),
                'cantidad' => (int) $item->quantity,
                'precio_unitario' => (float) $item->price,
                'nombre' => $item->name,
            ])->all(),
        ];
    }
}
