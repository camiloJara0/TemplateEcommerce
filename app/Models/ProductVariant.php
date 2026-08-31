<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'price_discount',
        'stock',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_discount' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(
            VariantAttributeValue::class,
            'product_variant_attribute_value',
            'variant_id',
            'attribute_value_id'
        );
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function precioEfectivo()
    {
        return $this->price_discount ?: $this->price;
    }

    public function combinacion(): string
    {
        return $this->attributeValues()
            ->with('attribute')
            ->get()
            ->map(fn ($v) => $v->attribute->name . ': ' . $v->value)
            ->implode(' / ');
    }
}