<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'description',
        'sku',
        'price',
        'price_discount',
        'weight',
        'stock',
        'is_featured',
        'estado',
        'rating_avg',
        'reviews_count',
        'page_config',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_discount' => 'decimal:2',
        'weight' => 'decimal:2',
        'is_featured' => 'boolean',
        'rating_avg' => 'decimal:2',
        'reviews_count' => 'integer',
        'page_config' => 'array',
    ];

    protected static function booted()
    {
        static::saving(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name) . '-' . Str::lower(Str::random(4));
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function reviewsAprobadas()
    {
        return $this->hasMany(Review::class)->aprobadas();
    }

    public function precioEfectivo()
    {
        return $this->price_discount ?: $this->price;
    }

    public function tieneStock(): bool
    {
        if ($this->variants()->exists()) {
            return $this->variants()->sum('stock') > 0;
        }

        return $this->stock > 0;
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeDestacados($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeFiltros($query, array $filtros)
    {
        return $query
            ->when($filtros['busqueda'] ?? null, function ($q, $busqueda) {
                $q->where(function ($inner) use ($busqueda) {
                    $inner->where('name', 'like', "%{$busqueda}%")
                        ->orWhere('description', 'like', "%{$busqueda}%")
                        ->orWhere('sku', 'like', "%{$busqueda}%");
                });
            })
            ->when($filtros['categoria_id'] ?? null, fn ($q, $v) => $q->where('category_id', $v))
            ->when($filtros['marca_id'] ?? null, fn ($q, $v) => $q->where('brand_id', $v))
            ->when($filtros['tag'] ?? null, fn ($q, $v) => $q->whereHas('tags', fn ($t) => $t->where('slug', $v)))
            ->when($filtros['precio_min'] ?? null, fn ($q, $v) => $q->where('price', '>=', $v))
            ->when($filtros['precio_max'] ?? null, fn ($q, $v) => $q->where('price', '<=', $v))
            ->when($filtros['destacado'] ?? null, fn ($q) => $q->where('is_featured', true))
            ->when($filtros['orden'] ?? null, function ($q, $orden) {
                match ($orden) {
                    'precio_asc' => $q->orderBy('price', 'asc'),
                    'precio_desc' => $q->orderBy('price', 'desc'),
                    'mas_vendidos' => $q->orderBy('created_at', 'desc'),
                    default => $q->orderBy('created_at', 'desc'),
                };
            });
    }
}
