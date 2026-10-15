<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationSyncRun extends Model
{
    protected $fillable = [
        'integration_id',
        'tipo',
        'origen',
        'estado',
        'usuario_id',
        'iniciado_en',
        'finalizado_en',
        'procesados',
        'creados',
        'actualizados',
        'omitidos',
        'errores',
        'resumen',
    ];

    protected $casts = [
        'iniciado_en' => 'datetime',
        'finalizado_en' => 'datetime',
        'resumen' => 'array',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function events()
    {
        return $this->hasMany(IntegrationEvent::class, 'sync_run_id');
    }
}
