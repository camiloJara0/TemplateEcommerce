<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'cost',
        'estimated_days',
        'active',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function scopeActivos($query)
    {
        return $query->where('active', true);
    }
}