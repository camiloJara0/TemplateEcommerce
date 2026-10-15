<?php

namespace App\Services;

use App\Mail\ContactoAdminMail;
use App\Mail\PagoAprobadoMail;
use App\Mail\PagoReembolsadoMail;
use App\Mail\PedidoCanceladoMail;
use App\Mail\PedidoCreadoMail;
use App\Mail\PedidoEntregadoMail;
use App\Mail\PedidoEnviadoMail;
use App\Mail\ResenaAprobadaMail;
use App\Mail\NotificacionMail;
use App\Models\ContactMessage;
use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\Review;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    protected array $canales;

    public function __construct()
    {
        $this->canales = config('notifications.channels', ['database']);
    }

    public function notificar(
        User $user,
        string $tipo,
        string $asunto,
        string $cuerpo,
        array $detalles = [],
        array $canales = [],
        ?Mailable $mailable = null
    ): array {
        $canales = $canales ?: $this->canales;

        $resultados = [];

        foreach ($canales as $canal) {
            try {
                $ok = match ($canal) {
                    'mail' => $this->enviarMail($user, $asunto, $cuerpo, $detalles, $mailable),
                    'push' => app(PushService::class)->enviar($user, $asunto, $cuerpo, $detalles),
                    'database', 'log' => true,
                    default => false,
                };

                if ($ok && in_array($canal, ['database', 'mail', 'push', 'log'])) {
                    NotificationLog::create([
                        'user_id' => $user->id,
                        'type' => $tipo,
                        'channel' => $canal,
                        'subject' => $asunto,
                        'body' => $cuerpo,
                        'status' => $ok ? 'enviado' : 'fallido',
                        'payload' => $detalles,
                        'sent_at' => now(),
                    ]);
                }

                $resultados[$canal] = $ok;
            } catch (\Exception $e) {
                Log::error("Error notificando canal {$canal}: " . $e->getMessage());
                $resultados[$canal] = false;
            }
        }

        return $resultados;
    }

    public function enviarMail(
        User $user,
        string $asunto,
        string $cuerpo,
        array $detalles = [],
        ?Mailable $mailable = null
    ): bool {
        Mail::to($user->email)->send($mailable ?: new NotificacionMail($asunto, $cuerpo, $detalles));

        return true;
    }

    // ===== Eventos =====

    public function registro(User $user): array
    {
        return $this->notificar(
            $user,
            'registro',
            '¡Bienvenido a ' . config('app.name') . '!',
            'Tu cuenta fue creada exitosamente. Explora nuestro catálogo y haz tu primera compra.',
            ['Email' => $user->email]
        );
    }

    public function pedidoCreado(User $user, Order $order): array
    {
        return $this->notificar(
            $user,
            'pedido_creado',
            'Pedido ' . $order->numero . ' confirmado',
            'Recibimos tu pedido y estamos preparando tu envío.',
            $this->detallesPedido($order),
            [],
            new PedidoCreadoMail($order)
        );
    }

    public function pedidoPagado(User $user, Order $order): array
    {
        return $this->notificar(
            $user,
            'pedido_pagado',
            'Pago aprobado — Pedido ' . $order->numero,
            'Tu pago fue aprobado. Prepararemos tu envío a la brevedad.',
            $this->detallesPedido($order),
            [],
            new PagoAprobadoMail($order)
        );
    }

    public function pedidoEnviado(User $user, Order $order, ?Shipment $shipment = null): array
    {
        $guia = $shipment?->tracking_number ?? '';

        return $this->notificar(
            $user,
            'pedido_enviado',
            'Tu pedido ' . $order->numero . ' está en camino',
            'Tu pedido fue despachado. Sigue su recorrido con el número de guía.',
            array_merge($this->detallesPedido($order), $guia ? ['Guía' => $guia] : []),
            [],
            new PedidoEnviadoMail($order, $shipment)
        );
    }

    public function pedidoEntregado(User $user, Order $order): array
    {
        return $this->notificar(
            $user,
            'pedido_entregado',
            'Pedido ' . $order->numero . ' entregado',
            'Tu pedido fue entregado. ¡Gracias por comprar con nosotros!',
            $this->detallesPedido($order),
            [],
            new PedidoEntregadoMail($order)
        );
    }

    public function pedidoCancelado(User $user, Order $order): array
    {
        return $this->notificar(
            $user,
            'pedido_cancelado',
            'Pedido ' . $order->numero . ' cancelado',
            'Tu pedido fue cancelado. Si tienes dudas contáctanos.',
            $this->detallesPedido($order),
            [],
            new PedidoCanceladoMail($order)
        );
    }

    public function pagoReembolsado(User $user, Order $order, float $monto): array
    {
        return $this->notificar(
            $user,
            'pago_reembolsado',
            'Reembolso procesado — Pedido ' . $order->numero,
            'Se procesó el reembolso de tu pago.',
            array_merge(
                $this->detallesPedido($order),
                ['Reembolso' => '$' . number_format($monto, 0, ',', '.')]
            ),
            [],
            new PagoReembolsadoMail($order, $monto)
        );
    }

    public function resenaAprobada(Review $review): array
    {
        $user = $review->user;

        if (!$user) {
            return [];
        }

        return $this->notificar(
            $user,
            'resena_aprobada',
            'Tu reseña fue publicada',
            'Tu reseña sobre "' . ($review->product?->name ?? 'un producto') . '" ya es visible en la tienda.',
            ['Producto' => $review->product?->name ?? '—', 'Calificación' => $review->rating . '/5'],
            [],
            new ResenaAprobadaMail($review)
        );
    }

    public function contactoRecibido(ContactMessage $mensaje): void
    {
        $admins = User::whereHas('roles', fn ($q) => $q->where('slug', 'admin'))->get();

        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->send(new ContactoAdminMail($mensaje));
            } catch (\Exception $e) {
                Log::error('Error avisando contacto a admin: ' . $e->getMessage());
            }
        }
    }

    public function recuperacion(User $user): array
    {
        return $this->notificar(
            $user,
            'recuperacion',
            'Recuperación de contraseña',
            'Recibimos una solicitud para cambiar tu contraseña. Si no fuiste tú, ignora este mensaje.',
            ['Email' => $user->email]
        );
    }

    public function alertaStock(array $datos): array
    {
        $admin = User::whereHas('roles', fn ($q) => $q->where('slug', 'admin'))->get();

        $resultados = [];

        foreach ($admin as $usuario) {
            $resultados[] = $this->notificar(
                $usuario,
                'alerta_stock',
                'Stock bajo: ' . ($datos['nombre'] ?? 'producto'),
                'El stock está por debajo del mínimo configurado.',
                $datos
            );
        }

        return $resultados;
    }

    protected function detallesPedido(Order $order): array
    {
        return [
            'Número' => $order->numero,
            'Total' => '$' . number_format((float) $order->total, 0, ',', '.'),
        ];
    }
}
