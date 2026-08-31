<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_id',
        'shipping_method_id',
        'carrier',
        'tracking_number',
        'status',
        'destinatario',
        'direccion',
        'ciudad',
        'departamento',
        'codigo_postal',
        'weight',
        'estimated_delivery',
        'delivered_at',
        'payload',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'estimated_delivery' => 'date',
        'delivered_at' => 'datetime',
        'payload' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }
}