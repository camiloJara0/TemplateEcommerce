<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    public const ESTADO_ACTIVO = 'Activo';
    public const ESTADO_INACTIVO = 'Inactivo';
    public const ESTADO_CANCELADO = 'Cancelado';

    protected $fillable = [
        'correo',
        'nombre',
        'user_id',
        'estado',
        'origen',
        'token_aprobacion',
        'fecha_confirmacion',
        'fecha_baja',
    ];

    protected $casts = [
        'fecha_confirmacion' => 'datetime',
        'fecha_baja' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipients()
    {
        return $this->hasMany(NewsletterCampaignRecipient::class, 'subscriber_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', self::ESTADO_ACTIVO);
    }

    public function cancelado(): bool
    {
        return $this->estado === self::ESTADO_CANCELADO;
    }
}
