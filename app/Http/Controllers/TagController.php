<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        return ApiResponse::success(Tag::orderBy('name')->get(['id', 'name', 'slug']));
    }

    public function adminIndex()
    {
        $tags = Tag::withCount('products')->orderBy('name')->get();

        return ApiResponse::success($tags->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'slug' => $t->slug,
            'products_count' => (int) $t->products_count,
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'slug' => 'sometimes|nullable|string|max:255|unique:tags,slug',
        ]);

        $tag = Tag::create($validated);

        return ApiResponse::success($tag, 'Etiqueta creada', 201);
    }

    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:tags,name,' . $tag->id,
            'slug' => 'sometimes|nullable|string|max:255|unique:tags,slug,' . $tag->id,
        ]);

        $tag->update($validated);

        return ApiResponse::success($tag, 'Etiqueta actualizada');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return ApiResponse::success(null, 'Etiqueta eliminada');
    }
}