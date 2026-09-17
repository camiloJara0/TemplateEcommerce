<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->only([
            'busqueda', 'categoria_id', 'marca_id', 'tag',
            'precio_min', 'precio_max', 'destacado', 'orden',
        ]);

        $productos = Product::activos()
            ->with(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])
            ->filtros($filtros)
            ->paginate($request->get('per_page', 12));

        return ApiResponse::success([
            'data' => ProductResource::collection($productos->items()),
            'pagination' => [
                'total' => $productos->total(),
                'per_page' => $productos->perPage(),
                'current_page' => $productos->currentPage(),
                'last_page' => $productos->lastPage(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $producto = Product::activos()
            ->with(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])
            ->where('slug', $slug)
            ->firstOrFail();

        return ApiResponse::success(new ProductResource($producto));
    }

    public function relacionados(Product $producto)
    {
        $relacionados = Product::activos()
            ->with(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])
            ->where('category_id', $producto->category_id)
            ->where('id', '!=', $producto->id)
            ->limit(config('ecommerce.related_limit', 8))
            ->get();

        return ApiResponse::success(ProductResource::collection($relacionados));
    }

    public function detalle(string $slug)
    {
        $producto = Product::activos()
            ->with(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])
            ->where('slug', $slug)
            ->firstOrFail();

        $relacionados = Product::activos()
            ->with(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])
            ->where('category_id', $producto->category_id)
            ->where('id', '!=', $producto->id)
            ->limit(config('ecommerce.related_limit', 8))
            ->get();

        $resenas = $producto->reviewsAprobadas()
            ->with('user:id,nombre')
            ->latest()
            ->paginate(10);

        return ApiResponse::success([
            'product' => new ProductResource($producto),
            'related' => ProductResource::collection($relacionados),
            'reviews' => [
                'items' => $resenas->items(),
                'pagination' => [
                    'total' => $resenas->total(),
                    'per_page' => $resenas->perPage(),
                    'current_page' => $resenas->currentPage(),
                    'last_page' => $resenas->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validar($request, true);

        $producto = Product::create([
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? null,
            'description' => $validated['description'] ?? null,
            'sku' => $validated['sku'],
            'price' => $validated['price'],
            'price_discount' => $validated['price_discount'] ?? null,
            'weight' => $validated['weight'] ?? null,
            'stock' => $validated['stock'] ?? 0,
            'is_featured' => $validated['is_featured'] ?? false,
            'estado' => $validated['estado'] ?? config('ecommerce.default_status', 'activo'),
            'page_config' => $validated['page_config'] ?? ($validated['page_config_json'] ? json_decode($validated['page_config_json'], true) : null),
        ]);

        $this->sincronizarExtras($producto, $validated);

        return ApiResponse::success(
            new ProductResource($producto->load(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])),
            'Producto creado',
            201
        );
    }

    public function update(Request $request, Product $producto)
    {
        $validated = $this->validar($request, false);

        $producto->update([
            'category_id' => $validated['category_id'] ?? $producto->category_id,
            'brand_id' => $validated['brand_id'] ?? $producto->brand_id,
            'name' => $validated['name'] ?? $producto->name,
            'slug' => $validated['slug'] ?? $producto->slug,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $producto->description,
            'sku' => $validated['sku'] ?? $producto->sku,
            'price' => $validated['price'] ?? $producto->price,
            'price_discount' => array_key_exists('price_discount', $validated) ? $validated['price_discount'] : $producto->price_discount,
            'weight' => array_key_exists('weight', $validated) ? $validated['weight'] : $producto->weight,
            'is_featured' => $validated['is_featured'] ?? $producto->is_featured,
            'estado' => $validated['estado'] ?? $producto->estado,
            'stock' => $validated['stock'] ?? $producto->stock,
            'page_config' => array_key_exists('page_config', $validated)
                ? $validated['page_config']
                : (isset($validated['page_config_json'])
                    ? json_decode($validated['page_config_json'], true)
                    : $producto->page_config),
        ]);

        $this->sincronizarExtras($producto, $validated);

        return ApiResponse::success(
            new ProductResource($producto->load(['category', 'brand', 'images', 'tags', 'variants.attributeValues.attribute'])),
            'Producto actualizado'
        );
    }

    public function destroy(Product $producto)
    {
        $producto->delete();

        return ApiResponse::success(null, 'Producto eliminado');
    }

    private function validar(Request $request, bool $creando): array
    {
        $reglas = [
            'name' => $creando ? 'required|string|max:255' : 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'description' => 'nullable|string',
            'sku' => $creando
                ? 'required|string|max:100|unique:products,sku'
                : 'sometimes|string|max:100|unique:products,sku,' . ($request->route('producto')?->id ?? 0),
            'price' => $creando ? 'required|numeric|min:0' : 'sometimes|numeric|min:0',
            'price_discount' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'estado' => 'nullable|in:activo,inactivo',
            'stock' => 'nullable|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'file|image|mimes:jpg,jpeg,png,webp|max:2048',
            'existing_image_urls' => 'nullable|array',
            'existing_image_urls.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'page_config' => 'nullable|array',
            'page_config_json' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.sku' => 'required|string|max:100',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.price_discount' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.image' => 'nullable|string',
            'variants.*.attribute_values' => 'nullable|array',
            'variants.*.attribute_values.*' => 'exists:variant_attribute_values,id',
        ];

        return $request->validate($reglas);
    }



    private function sincronizarExtras(Product $producto, array $datos): void
    {
        $producto->images()->delete();

        $existingUrls = $datos['existing_image_urls'] ?? [];
        $newFiles = $datos['images'] ?? [];
        $allImages = array_merge($existingUrls, $newFiles);

        foreach (array_values($allImages) as $pos => $imagen) {
            if (empty($imagen)) continue;

            if ($imagen instanceof UploadedFile) {
                $path = $imagen->store('products/images', 'public');
                $urlCompleta = asset('storage/' . $path);
            } else {
                $urlCompleta = $imagen;
            }

            $producto->images()->create([
                'url' => $urlCompleta,
                'position' => $pos,
            ]);
        }

        if (isset($datos['tags'])) {
            $producto->tags()->sync($datos['tags']);
        }

        $idsProcesados = [];

        foreach ($datos['variants'] ?? [] as $v) {

            $imagenVariante = null;

            if (!empty($v['image']) && $v['image'] instanceof UploadedFile) {
                $path = $v['image']->store('products/variants', 'public');
                $imagenVariante = asset('storage/' . $path);
            } elseif (!empty($v['image'])) {
                $imagenVariante = $v['image'];
            }

            if (!empty($v['id'])) {

                $variante = $producto->variants()->findOrFail($v['id']);

                $variante->update([
                    'sku' => $v['sku'],
                    'price' => $v['price'] ?? $variante->price,
                    'price_discount' => array_key_exists('price_discount', $v)
                        ? $v['price_discount']
                        : $variante->price_discount,
                    'stock' => $v['stock'] ?? $variante->stock,
                    'image' => $imagenVariante ?? $variante->image,
                ]);

            } else {

                $variante = $producto->variants()->create([
                    'sku' => $v['sku'],
                    'price' => $v['price'] ?? $producto->price,
                    'price_discount' => $v['price_discount'] ?? null,
                    'stock' => $v['stock'] ?? 0,
                    'image' => $imagenVariante,
                ]);
            }

            $variante->attributeValues()->sync($v['attribute_values'] ?? []);

            $idsProcesados[] = $variante->id;
        }

        if ($idsProcesados) {
            $producto->variants()
                ->whereNotIn('id', $idsProcesados)
                ->delete();
        }

        if ($producto->variants()->exists()) {
            $producto->update([
                'stock' => $producto->variants()->sum('stock')
            ]);
        }
    }
}