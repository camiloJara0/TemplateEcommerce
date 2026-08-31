<?php

namespace App\Services;

use App\Mail\NotificacionMail;
use App\Models\NotificationLog;
use App\Models\User;
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
        array $canales = []
    ): array {
        $canales = $canales ?: $this->canales;

        $resultados = [];

        foreach ($canales as $canal) {
            try {
                $ok = match ($canal) {
                    'mail' => $this->enviarMail($user, $asunto, $cuerpo, $detalles),
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

    public function enviarMail(User $user, string $asunto, string $cuerpo, array $detalles = []): bool
    {
        Mail::to($user->email)->send(new NotificacionMail($asunto, $cuerpo, $detalles));

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

    public function pedidoCreado(User $user, string $numero, float $total): array
    {
        return $this->notificar(
            $user,
            'pedido_creado',
            'Pedido ' . $numero . ' confirmado',
            'Tu pedido fue confirmado y estamos preparando tu envío.',
            ['Número' => $numero, 'Total' => '$' . number_format($total, 0, ',', '.')]
        );
    }

    public function pedidoEnviado(User $user, string $numero, string $tracking): array
    {
        return $this->notificar(
            $user,
            'pedido_enviado',
            'Tu pedido ' . $numero . ' está en camino',
            'Tu pedido fue despachado. Sigue su recorrido con el número de guía.',
            ['Número' => $numero, 'Guía' => $tracking]
        );
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
}