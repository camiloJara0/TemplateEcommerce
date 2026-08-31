<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use App\Services\ReviewService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, Product $producto)
    {
        $resenas = $producto->reviewsAprobadas()
            ->with('user:id,nombre')
            ->latest()
            ->paginate($request->get('per_page', 10));

        return ApiResponse::success([
            'items' => $resenas->items(),
            'pagination' => [
                'total' => $resenas->total(),
                'per_page' => $resenas->perPage(),
                'current_page' => $resenas->currentPage(),
                'last_page' => $resenas->lastPage(),
            ],
        ]);
    }

    public function store(Request $request, Product $producto)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        try {
            $review = app(ReviewService::class)->crear(
                $request->user(),
                $producto,
                $validated['rating'],
                $validated['comment'] ?? null,
                $validated['order_id'] ?? null
            );
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'REVIEW_ERROR');
        }

        return ApiResponse::success($review, 'Reseña enviada, pendiente de aprobación', 201);
    }

    public function adminIndex(Request $request)
    {
        $resenas = Review::with(['product:id,name', 'user:id,nombre'])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $resenas->items(),
            'pagination' => [
                'total' => $resenas->total(),
                'per_page' => $resenas->perPage(),
                'current_page' => $resenas->currentPage(),
                'last_page' => $resenas->lastPage(),
            ],
        ]);
    }

    public function aprobar(Review $review)
    {
        app(ReviewService::class)->aprobar($review);

        return ApiResponse::success($review->fresh(), 'Reseña aprobada');
    }

    public function rechazar(Review $review)
    {
        app(ReviewService::class)->rechazar($review);

        return ApiResponse::success($review->fresh(), 'Reseña rechazada');
    }

    public function destroy(Review $review)
    {
        app(ReviewService::class)->eliminar($review);

        return ApiResponse::success(null, 'Reseña eliminada');
    }
}