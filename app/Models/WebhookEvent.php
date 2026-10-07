<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    use HasFactory;

    public const ESTADO_RECIBIDO = 'recibido';
    public const ESTADO_PROCESADO = 'procesado';
    public const ESTADO_DUPLICADO = 'duplicado';
    public const ESTADO_IGNORADO = 'ignorado';
    public const ESTADO_ERROR = 'error';

    protected $fillable = [
        'provider',
        'event_id',
        'tipo',
        'estado',
        'firma_valida',
        'payload',
        'respuesta',
        'error',
        'payment_id',
        'order_id',
        'intentos',
        'http_status',
        'ip',
        'procesado_en',
    ];

    protected $casts = [
        'payload' => 'array',
        'respuesta' => 'array',
        'firma_valida' => 'boolean',
        'procesado_en' => 'datetime',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Extrae el identificador externo del evento desde cabeceras o payload.
     * Cada pasarela usa una convención distinta; se prueban las habituales.
     */
    public static function extraerEventId(?string $provider, array $headers, array $payload): ?string
    {
        foreach (['x-webhook-id', 'x-event-id', 'x-request-id', 'webhook-id'] as $header) {
            $valor = $headers[$header] ?? null;
            if (is_string($valor) && $valor !== '') {
                return substr($valor, 0, 191);
            }
        }

        $rutas = [
            'id',
            'event_id',
            'eventId',
            'webhook_id',
            'data.id',
            'data.event_id',
            'data.object.id',
            'data.object.event_id',
            'notification_id',
            'type',
        ];

        foreach ($rutas as $ruta) {
            $valor = data_get($payload, $ruta);
            if (is_string($valor) && $valor !== '') {
                return substr($valor, 0, 191);
            }
            if (is_numeric($valor)) {
                return (string) $valor;
            }
        }

        return null;
    }
}
