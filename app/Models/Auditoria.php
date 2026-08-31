<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class Auditoria extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'usuario_id',
        'accion',
        'modulo',
        'descripcion',
        'ip',
        'objeto_type',
        'objeto_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function objeto()
    {
        return $this->morphTo();
    }

    public static function registrar(
        $usuario,
        string $accion,
        string $descripcion,
        $objeto = null
    ): self {
        $usuarioEsModelo = is_object($usuario);

        return static::create([
            'usuario_id' => $usuarioEsModelo ? $usuario->getKey() : $usuario,
            'accion' => $accion,
            'modulo' => static::detectarModulo($objeto ?? $usuario),
            'descripcion' => $descripcion,
            'ip' => Request::ip(),
            'objeto_type' => is_object($objeto) ? get_class($objeto) : null,
            'objeto_id' => is_object($objeto) ? $objeto->getKey() : null,
        ]);
    }

    private static function detectarModulo($objeto): ?string
    {
        if (!is_object($objeto)) {
            return null;
        }

        return match (get_class($objeto)) {
            User::class => 'auth',
            Product::class, ProductVariant::class, Category::class, Brand::class, Tag::class, ProductImage::class => 'productos',
            Order::class, OrderItem::class, OrderStatusHistory::class => 'pedidos',
            Payment::class, Refund::class => 'pagos',
            Shipment::class, ShippingMethod::class => 'envios',
            Coupon::class => 'cupones',
            Review::class => 'reviews',
            Cart::class, CartItem::class => 'carrito',
            Address::class => 'clientes',
            Setting::class => 'config',
            default => class_basename($objeto),
        };
    }
}