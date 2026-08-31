<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CodigoVerificacion extends Model
{
    use HasFactory;

    protected $table = 'verification_codes';

    protected $fillable = [
        'correo',
        'codigo',
        'expira_en',
        'usado',
    ];

    protected $casts = [
        'expira_en' => 'datetime',
        'usado' => 'boolean',
    ];

    public function scopeValido($query, string $correo, string $codigo)
    {
        return $query->where('correo', $correo)
            ->where('codigo', $codigo)
            ->where('usado', false)
            ->where('expira_en', '>', now());
    }
}
