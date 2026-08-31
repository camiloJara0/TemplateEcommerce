<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categorias = Category::activas()
            ->with('children')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return ApiResponse::success(CategoryResource::collection($categorias));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $categoria = Category::create($validated);

        return ApiResponse::success(new CategoryResource($categoria->load('children')), 'Categoría creada', 201);
    }

    public function update(Request $request, Category $categoria)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (($validated['parent_id'] ?? null) === $categoria->id) {
            return ApiResponse::error('Una categoría no puede ser su propia padre', 422);
        }

        $categoria->update($validated);

        return ApiResponse::success(new CategoryResource($categoria->load('children')), 'Categoría actualizada');
    }

    public function destroy(Category $categoria)
    {
        $categoria->delete();

        return ApiResponse::success(null, 'Categoría eliminada');
    }
}