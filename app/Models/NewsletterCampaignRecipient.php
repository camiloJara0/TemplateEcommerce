<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaignRecipient extends Model
{
    use HasFactory;

    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_ENVIADO = 'enviado';
    public const ESTADO_FALLIDO = 'fallido';

    protected $fillable = [
        'campaign_id',
        'subscriber_id',
        'correo',
        'estado',
        'error',
        'enviado_en',
    ];

    protected $casts = [
        'enviado_en' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(NewsletterCampaign::class, 'campaign_id');
    }

    public function subscriber()
    {
        return $this->belongsTo(NewsletterSubscriber::class, 'subscriber_id');
    }
}
