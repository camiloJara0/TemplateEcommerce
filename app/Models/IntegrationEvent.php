<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationEvent extends Model
{
    protected $fillable = [
        'integration_id',
        'sync_run_id',
        'tipo',
        'severidad',
        'mensaje',
        'mensaje_externo',
        'referencia_type',
        'referencia_id',
        'payload',
        'intentos',
        'reintentado_en',
    ];

    protected $casts = [
        'payload' => 'array',
        'reintentado_en' => 'datetime',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }

    public function syncRun()
    {
        return $this->belongsTo(IntegrationSyncRun::class, 'sync_run_id');
    }

    public function referencia()
    {
        return $this->morphTo();
    }
}
