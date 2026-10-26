<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'numero',
        'numero_factura',
        'fecha_emision',
        'paid_at',
        'user_id',
        'address_id',
        'shipping_method_id',
        'coupon_id',
        'subtotal',
        'discount',
        'shipping_cost',
        'tax',
        'total',
        'currency',
        'status',
        'payment_status',
        'shipping_status',
        'notes',
        'billing_nombre',
        'billing_nit',
        'billing_razon_social',
        'billing_direccion',
        'integration_erp_estado',
        'integration_erp_externo_id',
        'integration_erp_error',
        'integration_erp_error_transitorio',
        'integration_erp_enviado_en',
        'integration_erp_id',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'fecha_emision' => 'datetime',
        'paid_at' => 'datetime',
        'integration_erp_error_transitorio' => 'boolean',
        'integration_erp_enviado_en' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function shipment()
    {
        return $this->hasOne(Shipment::class)->latestOfMany();
    }

    public function scopeMios($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}