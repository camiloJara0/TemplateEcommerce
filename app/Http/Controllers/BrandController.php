<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        $marcas = Brand::activas()->orderBy('name')->get();

        return ApiResponse::success($marcas->map(fn ($b) => [
            'id' => $b->id,
            'name' => $b->name,
            'slug' => $b->slug,
            'description' => $b->description,
            'image' => $b->image,
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $marca = Brand::create($validated);

        return ApiResponse::success($marca, 'Marca creada', 201);
    }

    public function update(Request $request, Brand $marca)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $marca->update($validated);

        return ApiResponse::success($marca, 'Marca actualizada');
    }

    public function destroy(Brand $marca)
    {
        $marca->delete();

        return ApiResponse::success(null, 'Marca eliminada');
    }
}