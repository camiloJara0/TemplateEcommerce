<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WishlistItem;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index()
    {
        $items = WishlistItem::where('user_id', auth()->id())
            ->with('product:id,name,slug,price,price_discount,stock,rating_avg,reviews_count')
            ->latest()
            ->get();

        return ApiResponse::success($items->map(fn ($item) => [
            'id' => $item->id,
            'product' => $item->product ? [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'price' => (float) $item->product->price,
                'price_discount' => $item->product->price_discount !== null ? (float) $item->product->price_discount : null,
                'precio_efectivo' => (float) $item->product->precioEfectivo(),
                'stock' => (int) $item->product->stock,
                'rating_avg' => (float) $item->product->rating_avg,
                'reviews_count' => (int) $item->product->reviews_count,
                'imagen' => $item->product->images()->value('url'),
            ] : null,
            'created_at' => $item->created_at,
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $item = WishlistItem::firstOrCreate([
            'user_id' => auth()->id(),
            'product_id' => $validated['product_id'],
        ]);

        return ApiResponse::success($item, 'Agregado a favoritos', 201);
    }

    public function destroy(Product $producto)
    {
        WishlistItem::where('user_id', auth()->id())
            ->where('product_id', $producto->id)
            ->delete();

        return ApiResponse::success(null, 'Eliminado de favoritos');
    }

    public function moverAlCarrito(Request $request, WishlistItem $item)
    {
        if ($item->user_id !== auth()->id()) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        $cart = app(CartService::class)->obtener();

        try {
            app(CartService::class)->agregar($cart, $item->product_id, null, 1);
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        $item->delete();

        return ApiResponse::success($cart->load('items'), 'Producto movido al carrito');
    }
}