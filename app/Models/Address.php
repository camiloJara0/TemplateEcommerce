<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'label',
        'pais',
        'ciudad',
        'direccion',
        'codigo_postal',
        'telefono',
        'es_principal',
    ];

    protected $casts = [
        'es_principal' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}