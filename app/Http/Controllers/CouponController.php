<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Services\CouponService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $cupones = Coupon::withCount('users')
            ->when($request->active !== null, fn ($q, $v) => $q->where('active', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $cupones->items(),
            'pagination' => [
                'total' => $cupones->total(),
                'per_page' => $cupones->perPage(),
                'current_page' => $cupones->currentPage(),
                'last_page' => $cupones->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|in:percent,fixed,free_shipping',
            'value' => 'required|numeric|min:0',
            'min_subtotal' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'active' => 'nullable|boolean',
        ]);

        $cupon = Coupon::create([
            'code' => strtoupper($validated['code']),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_subtotal' => $validated['min_subtotal'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'per_user_limit' => $validated['per_user_limit'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'active' => $validated['active'] ?? true,
        ]);

        return ApiResponse::success($cupon, 'Cupón creado', 201);
    }

    public function update(Request $request, Coupon $cupon)
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:coupons,code,' . $cupon->id,
            'type' => 'sometimes|in:percent,fixed,free_shipping',
            'value' => 'sometimes|numeric|min:0',
            'min_subtotal' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'active' => 'nullable|boolean',
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $cupon->update($validated);

        return ApiResponse::success($cupon, 'Cupón actualizado');
    }

    public function destroy(Coupon $cupon)
    {
        $cupon->delete();

        return ApiResponse::success(null, 'Cupón eliminado');
    }

    public function aplicar(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'subtotal' => 'required|numeric|min:0',
            'shipping' => 'nullable|numeric|min:0',
        ]);

        try {
            $resultado = app(CouponService::class)->aplicarACarrito(
                $validated['code'],
                (float) $validated['subtotal'],
                (float) ($validated['shipping'] ?? 0),
                $request->user()
            );
        } catch (\DomainException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'COUPON_ERROR');
        }

        return ApiResponse::success($resultado, 'Cupón aplicado');
    }
}