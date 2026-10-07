<?php

namespace App\Http\Controllers;

use App\Models\WebhookEvent;
use App\Services\Payment\PaymentException;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(string $provider, Request $request)
    {
        $headers = $this->cabeceras($request);
        $payload = $request->all();

        Log::info("Webhook recibido de {$provider}", [
            'method' => $request->method(),
            'url' => $request->url(),
            'payload' => $payload,
        ]);

        $evento = $this->registrar($provider, $headers, $payload, $request->ip());

        return $this->procesar($evento, $request, true);
    }

    /**
     * Reprocesa un evento fallido desde el panel de trazabilidad.
     */
    public function reintentar(WebhookEvent $evento)
    {
        if ($evento->estado === WebhookEvent::ESTADO_PROCESADO) {
            return response()->json([
                'success' => false,
                'message' => 'El evento ya fue procesado correctamente',
                'type' => 'WEBHOOK_ALREADY_PROCESSED',
            ], 409);
        }

        $evento->increment('intentos');
        $evento->update(['estado' => WebhookEvent::ESTADO_RECIBIDO, 'error' => null]);

        $recreado = Request::create(
            "/api/webhooks/pagos/{$evento->provider}",
            'POST',
            $evento->payload,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => $evento->ip]
        );

        return $this->procesar($evento->fresh(), $recreado, false);
    }

    protected function procesar(WebhookEvent $evento, Request $request, bool $esRecepcion)
    {
        try {
            $pago = app(PaymentService::class)->procesarWebhook($evento->provider, $request);

            $evento->update([
                'estado' => WebhookEvent::ESTADO_PROCESADO,
                'payment_id' => $pago?->id,
                'order_id' => $pago?->order_id,
                'respuesta' => $pago ? [
                    'payment_id' => $pago->id,
                    'order_id' => $pago->order_id,
                    'status' => $pago->status,
                    'amount' => $pago->amount,
                ] : null,
                'error' => null,
                'http_status' => 200,
                'procesado_en' => now(),
            ]);

            Log::info('Webhook procesado exitosamente', [
                'provider' => $evento->provider,
                'event_id' => $evento->event_id,
                'payment_id' => $pago?->id,
                'status' => $pago?->status,
            ]);
        } catch (PaymentException $e) {
            $ignorado = $this->esIgnorable($e);

            $evento->update([
                'estado' => $ignorado ? WebhookEvent::ESTADO_IGNORADO : WebhookEvent::ESTADO_ERROR,
                'error' => $this->limitar($e->getMessage()),
                'http_status' => $ignorado ? 200 : 422,
                'procesado_en' => now(),
            ]);

            Log::warning('Webhook de pago ignorado', [
                'provider' => $evento->provider,
                'event_id' => $evento->event_id,
                'error' => $e->getMessage(),
            ]);

            if (!$ignorado && $esRecepcion) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
            }
        } catch (\Throwable $e) {
            $evento->update([
                'estado' => WebhookEvent::ESTADO_ERROR,
                'error' => $this->limitar($e->getMessage()),
                'http_status' => 500,
                'procesado_en' => now(),
            ]);

            Log::error('Webhook de pago error inesperado', [
                'provider' => $evento->provider,
                'event_id' => $evento->event_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($esRecepcion) {
                return response()->json(['success' => false, 'message' => 'Error interno al procesar el webhook'], 500);
            }
        }

        if ($esRecepcion) {
            return response()->json(['success' => true]);
        }

        $evento->refresh();

        $fallido = $evento->estado === WebhookEvent::ESTADO_ERROR;

        return response()->json([
            'success' => !$fallido,
            'message' => $fallido
                ? 'El reintento volvió a fallar: ' . ($evento->error ?? 'error desconocido')
                : 'Evento reprocesado correctamente',
            'data' => $evento,
        ], $fallido ? 422 : 200);
    }

    /**
     * Registra (o reutiliza) la trazabilidad del evento entrante.
     * Un evento ya procesado no se reprocesa: solo se cuenta el intento.
     */
    protected function registrar(string $provider, array $headers, array $payload, ?string $ip): WebhookEvent
    {
        $eventId = WebhookEvent::extraerEventId($provider, $headers, $payload);

        $existente = $eventId
            ? WebhookEvent::where('provider', $provider)->where('event_id', $eventId)->first()
            : null;

        if ($existente) {
            $yaProcesado = $existente->estado === WebhookEvent::ESTADO_PROCESADO;

            $existente->increment('intentos');
            $existente->update([
                'payload' => $payload,
                'http_status' => 200,
            ]);

            if ($yaProcesado) {
                return $existente;
            }

            $existente->update(['estado' => WebhookEvent::ESTADO_RECIBIDO]);

            return $existente;
        }

        return WebhookEvent::create([
            'provider' => $provider,
            'event_id' => $eventId,
            'tipo' => $this->extraerTipo($payload),
            'estado' => WebhookEvent::ESTADO_RECIBIDO,
            'payload' => $payload,
            'ip' => $ip,
            'http_status' => 200,
        ]);
    }

    protected function extraerTipo(array $payload): ?string
    {
        $tipo = data_get($payload, 'type')
            ?? data_get($payload, 'event_type')
            ?? data_get($payload, 'topic')
            ?? data_get($payload, 'data.object.type');

        return is_string($tipo) ? mb_substr($tipo, 0, 120) : null;
    }

    protected function cabeceras(Request $request): array
    {
        $headers = [];

        foreach ($request->headers->all() as $clave => $valores) {
            $headers[$clave] = is_array($valores) ? ($valores[0] ?? null) : $valores;
        }

        return $headers;
    }

    /**
     * Eventos de prueba o de pagos que no nos conciernen no deben romper el flujo.
     */
    protected function esIgnorable(PaymentException $e): bool
    {
        $mensaje = mb_strtolower($e->getMessage());

        foreach (['no encontrado', 'ignorado', 'no soportado', 'firma inv', 'evento no'] as $corte) {
            if (str_contains($mensaje, $corte)) {
                return true;
            }
        }

        return false;
    }

    protected function limitar(string $texto, int $limite = 1000): string
    {
        return mb_strlen($texto) > $limite ? mb_substr($texto, 0, $limite - 1) . '…' : $texto;
    }
}
