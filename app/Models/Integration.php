<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    use LogsActivity;

    protected $fillable = [
        'nombre',
        'provider',
        'estado',
        'credenciales',
        'soporta_login',
        'rol_login_federado',
        'config_sincronizacion',
        'ultimo_sincronizado',
        'ultimo_estado',
        'intentos_fallo',
        'activa',
    ];

    protected $casts = [
        'soporta_login' => 'boolean',
        'activa' => 'boolean',
        'config_sincronizacion' => 'array',
        'ultimo_sincronizado' => 'datetime',
    ];

    protected $hidden = [
        'credenciales',
    ];

    public function syncRuns()
    {
        return $this->hasMany(IntegrationSyncRun::class);
    }

    public function events()
    {
        return $this->hasMany(IntegrationEvent::class);
    }

    public function records()
    {
        return $this->hasMany(IntegrationRecord::class);
    }

    public function externalDocs()
    {
        return $this->hasMany(IntegrationExternalDoc::class);
    }

    public function fieldMaps()
    {
        return $this->hasMany(IntegrationFieldMap::class);
    }
}
