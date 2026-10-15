<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationRecord extends Model
{
    protected $fillable = [
        'integration_id',
        'tipo',
        'external_id',
        'local_type',
        'local_id',
        'hash_contenido',
        'ultimo_sincronizado',
    ];

    protected $casts = [
        'ultimo_sincronizado' => 'datetime',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }

    public function local()
    {
        return $this->morphTo();
    }
}
