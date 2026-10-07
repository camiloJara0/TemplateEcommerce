<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaign extends Model
{
    use HasFactory;

    public const ESTADO_BORRADOR = 'Borrador';
    public const ESTADO_PROGRAMADA = 'Programada';
    public const ESTADO_ENVIADA = 'Enviada';

    protected $fillable = [
        'titulo',
        'asunto',
        'contenido',
        'estado',
        'fecha_programada',
        'fecha_envio',
        'created_by',
        'cupon_id',
        'destinatarios',
        'enviados',
        'fallidos',
    ];

    protected $casts = [
        'fecha_programada' => 'datetime',
        'fecha_envio' => 'datetime',
        'destinatarios' => 'integer',
        'enviados' => 'integer',
        'fallidos' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(NewsletterCampaignItem::class, 'campaign_id');
    }

    public function media()
    {
        return $this->hasMany(NewsletterCampaignMedia::class, 'campaign_id');
    }

    public function cupon()
    {
        return $this->belongsTo(Coupon::class, 'cupon_id');
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients()
    {
        return $this->hasMany(NewsletterCampaignRecipient::class, 'campaign_id');
    }
}
