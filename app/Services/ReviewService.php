<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;

class ReviewService
{
    public function puedeResenar(User $user, Product $product): bool
    {
        return Order::where('user_id', $user->id)
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
            ->whereIn('status', ['entregado', 'devuelto'])
            ->exists();
    }

    public function crear(User $user, Product $product, int $rating, ?string $comment, ?int $orderId = null): Review
    {
        if (!$this->puedeResenar($user, $product)) {
            throw new \DomainException('Solo puedes reseñar productos de compras entregadas');
        }

        $existente = Review::where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->where('order_id', $orderId)
            ->first();

        if ($existente) {
            throw new \DomainException('Ya reseñaste este producto en este pedido');
        }

        $review = Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'order_id' => $orderId,
            'rating' => $rating,
            'comment' => $comment,
            'status' => 'pendiente',
        ]);

        return $review;
    }

    public function aprobar(Review $review): Review
    {
        $review->update(['status' => 'aprobado']);
        $this->recalcularRating($review->product_id);

        return $review->fresh();
    }

    public function rechazar(Review $review): Review
    {
        $review->update(['status' => 'rechazado']);
        $this->recalcularRating($review->product_id);

        return $review->fresh();
    }

    public function eliminar(Review $review): void
    {
        $productId = $review->product_id;
        $review->delete();
        $this->recalcularRating($productId);
    }

    public function recalcularRating(int $productId): void
    {
        $promedio = Review::where('product_id', $productId)
            ->aprobadas()
            ->avg('rating');

        $total = Review::where('product_id', $productId)
            ->aprobadas()
            ->count();

        Product::where('id', $productId)->update([
            'rating_avg' => round((float) $promedio, 2),
            'reviews_count' => $total,
        ]);
    }
}