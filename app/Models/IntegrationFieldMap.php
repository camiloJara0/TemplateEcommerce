<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationFieldMap extends Model
{
    protected $fillable = [
        'integration_id',
        'dominio',
        'clave_externa',
        'valor_local',
    ];

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
}
