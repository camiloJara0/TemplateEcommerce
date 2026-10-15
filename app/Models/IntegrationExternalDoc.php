<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationExternalDoc extends Model
{
    protected $fillable = [
        'integration_id',
        'tipo',
        'external_id',
        'local_type',
        'local_id',
        'estado',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
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
