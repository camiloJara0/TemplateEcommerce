<?php

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusEnum;
use App\Enums\ShippingStatusEnum;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function crearDesdeCarrito(Cart $cart, array $datos): Order
    {
        if ($cart->items()->count() === 0) {
            throw new \DomainException('El carrito está vacío');
        }

        $resumen = app(CheckoutService::class)->resumen(
            $cart,
            $datos['address_id'] ?? null,
            $datos['shipping_method_id'] ?? null,
            $datos['coupon_code'] ?? null
        );

        $numero = 'ORD-' . now()->format('ymd') . '-' . strtoupper(Str::random(6));

        DB::beginTransaction();
        try {
            $order = Order::create([
                'numero' => $numero,
                'user_id' => $cart->user_id ?: auth()->id(),
                'address_id' => $resumen['address']['id'] ?? null,
                'shipping_method_id' => $resumen['shipping_method']['id'] ?? null,
                'coupon_id' => $resumen['coupon']['id'] ?? null,
                'subtotal' => $resumen['subtotal'],
                'discount' => $resumen['discount'],
                'shipping_cost' => $resumen['shipping'],
                'tax' => $resumen['tax'],
                'total' => $resumen['total'],
                'currency' => $resumen['currency'],
                'status' => OrderStatusEnum::NUEVO->value,
                'payment_status' => PaymentStatusEnum::PENDIENTE->value,
                'shipping_status' => ShippingStatusEnum::PENDIENTE->value,
                'notes' => $datos['notes'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                $nombre = $item->product->name;

                if ($item->variant) {
                    $nombre .= ' (' . $item->variant->combinacion() . ')';
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'name' => $nombre,
                    'sku' => $item->variant?->sku ?: $item->product->sku,
                    'price' => $item->precioEfectivo(),
                    'quantity' => $item->quantity,
                    'subtotal' => $item->precioEfectivo() * $item->quantity,
                ]);

                app(InventoryService::class)->salida(
                    $item->variant ?: $item->product,
                    $item->quantity,
                    'Venta pedido ' . $numero,
                    $order
                );
            }

            $this->registrarHistorial($order, OrderStatusEnum::NUEVO, 'Pedido creado');

            if ($order->user_id) {
                $usuario = User::find($order->user_id);
                if ($usuario) {
                    app(NotificationService::class)->pedidoCreado(
                        $usuario,
                        $order->numero,
                        (float) $order->total
                    );
                }
            }

            if (!empty($resumen['coupon']['id']) && $order->user_id) {
                $coupon = \App\Models\Coupon::find($resumen['coupon']['id']);
                if ($coupon) {
                    app(CouponService::class)->registrarUso(
                        $coupon,
                        User::find($order->user_id),
                        $order->id,
                        $resumen['discount']
                    );
                }
            }

            $cart->items()->delete();

            DB::commit();

            return $order->load('items');
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function transicionar(
        Order $order,
        OrderStatusEnum $nuevoEstado,
        ?string $comentario = null,
        ?User $usuario = null
    ): Order {
        $actual = OrderStatusEnum::tryFrom($order->status);

        if ($actual === $nuevoEstado) {
            return $order;
        }

        if ($actual && !in_array($nuevoEstado, $this->transicionesPermitidas($actual))) {
            throw new \DomainException(
                "No se permite pasar de '{$actual->label()}' a '{$nuevoEstado->label()}'"
            );
        }

        $order->update(['status' => $nuevoEstado->value]);
        $this->registrarHistorial($order, $nuevoEstado, $comentario, $usuario);

        return $order;
    }

    public function registrarHistorial(
        Order $order,
        OrderStatusEnum $estado,
        ?string $comentario = null,
        ?User $usuario = null
    ): OrderStatusHistory {
        return OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $estado->value,
            'user_id' => $usuario?->id ?: auth()->id(),
            'comment' => $comentario,
        ]);
    }

    protected function transicionesPermitidas(OrderStatusEnum $actual): array
    {
        return match ($actual) {
            OrderStatusEnum::NUEVO => [OrderStatusEnum::PAGADO, OrderStatusEnum::CANCELADO],
            OrderStatusEnum::PAGADO => [OrderStatusEnum::PREPARANDO, OrderStatusEnum::CANCELADO],
            OrderStatusEnum::PREPARANDO => [OrderStatusEnum::ENVIADO, OrderStatusEnum::CANCELADO],
            OrderStatusEnum::ENVIADO => [OrderStatusEnum::ENTREGADO, OrderStatusEnum::DEVUELTO],
            OrderStatusEnum::ENTREGADO => [OrderStatusEnum::DEVUELTO],
            default => [],
        };
    }
}