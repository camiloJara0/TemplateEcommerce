<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'price_discount' => $this->price_discount !== null ? (float) $this->price_discount : null,
            'precio_efectivo' => (float) $this->precioEfectivo(),
            'weight' => $this->weight !== null ? (float) $this->weight : null,
            'stock' => (int) $this->stock,
            'is_featured' => (bool) $this->is_featured,
            'estado' => $this->estado,
            'rating_avg' => (float) $this->rating_avg,
            'reviews_count' => (int) $this->reviews_count,
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
            ] : null),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => $img->url,
                'position' => $img->position,
            ])),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'price' => (float) $v->price,
                'price_discount' => $v->price_discount !== null ? (float) $v->price_discount : null,
                'precio_efectivo' => (float) $v->precioEfectivo(),
                'stock' => (int) $v->stock,
                'image' => $v->image,
                'combinacion' => $v->combinacion(),
                'attribute_values' => $v->attributeValues->map(fn ($av) => [
                    'id' => $av->id,
                    'attribute_id' => $av->attribute_id,
                    'attribute' => $av->attribute->name ?? null,
                    'value' => $av->value,
                ]),
            ])),
            'page_config' => $this->page_config,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}