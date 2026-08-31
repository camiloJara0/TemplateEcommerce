<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class PushService
{
    public function enviar(User $user, string $titulo, string $cuerpo, array $datos = []): bool
    {
        $publicKey = config('webpush.vapid_public_key');
        $privateKey = config('webpush.vapid_private_key');

        if (!$publicKey || !$privateKey) {
            Log::info('Push no enviado: faltan credenciales VAPID', [
                'usuario' => $user->id,
                'titulo' => $titulo,
            ]);

            return false;
        }

        try {
            $subscriptions = $user->pushSubscriptions()->get();

            if ($subscriptions->isEmpty()) {
                return false;
            }

            $webPush = app(\Minishlink\WebPush\WebPush::class);

            foreach ($subscriptions as $subscription) {
                $webPush->queueNotification(
                    \Minishlink\WebPush\Subscription::create([
                        'endpoint' => $subscription->endpoint,
                        'keys' => [
                            'auth' => $subscription->auth,
                            'p256dh' => $subscription->p256dh,
                        ],
                    ]),
                    json_encode([
                        'title' => $titulo,
                        'body' => $cuerpo,
                        'data' => $datos,
                    ])
                );
            }

            $webPush->flush();

            return true;
        } catch (\Exception $e) {
            Log::error('Error enviando push: ' . $e->getMessage());

            return false;
        }
    }
}