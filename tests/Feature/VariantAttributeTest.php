<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Models\VariantAttribute;
use Tests\TestCase;

class VariantAttributeTest extends TestCase
{
    use WithRoles;

    public function test_admin_lista_y_gestiona_atributos_y_valores(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $this->getJson('/api/v1/admin/variant-attributes')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');

        $atributo = $this->postJson('/api/v1/admin/variant-attributes', ['name' => 'Color'])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Color');

        $atributoId = $atributo->json('data.id');

        $valor = $this->postJson("/api/v1/admin/variant-attributes/{$atributoId}/values", ['value' => 'Negro'])
            ->assertStatus(201)
            ->assertJsonPath('data.value', 'Negro');

        $valorId = $valor->json('data.id');

        $this->postJson("/api/v1/admin/variant-attributes/{$atributoId}/values", ['value' => 'Negro'])
            ->assertStatus(422);

        $this->putJson("/api/v1/admin/variant-attributes/{$atributoId}", ['name' => 'Talla'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Talla');

        $this->putJson("/api/v1/admin/variant-values/{$valorId}", ['value' => 'Blanco'])
            ->assertStatus(200)
            ->assertJsonPath('data.value', 'Blanco');

        $this->getJson('/api/v1/admin/variant-attributes')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Talla')
            ->assertJsonCount(1, 'data.0.values');

        $this->deleteJson("/api/v1/admin/variant-values/{$valorId}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->deleteJson("/api/v1/admin/variant-attributes/{$atributoId}")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('variant_attributes', ['id' => $atributoId]);
    }

    public function test_cliente_no_puede_gestionar_atributos(): void
    {
        $this->actingAsSanctum($this->clientUser());

        $this->getJson('/api/v1/admin/variant-attributes')->assertStatus(403);
        $this->postJson('/api/v1/admin/variant-attributes', ['name' => 'Color'])->assertStatus(403);
    }

    public function test_no_elimina_atributo_o_valor_en_uso_por_variantes(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $categoria = Category::create(['name' => 'Ropa']);
        $atributo = VariantAttribute::create(['name' => 'Color']);
        $valor = $atributo->values()->create(['value' => 'Negro']);

        Product::create([
            'name' => 'Camiseta',
            'sku' => 'SKU-VAL-001',
            'price' => 50000,
            'category_id' => $categoria->id,
            'stock' => 0,
        ])->variants()->create([
            'sku' => 'SKU-VAL-001-N',
            'price' => 50000,
            'stock' => 5,
        ])->attributeValues()->attach($valor->id);

        $this->deleteJson("/api/v1/admin/variant-attributes/{$atributo->id}")
            ->assertStatus(409)
            ->assertJsonPath('type', 'ATTRIBUTION_IN_USE');

        $this->deleteJson("/api/v1/admin/variant-values/{$valor->id}")
            ->assertStatus(409)
            ->assertJsonPath('type', 'VALUE_IN_USE');
    }

    public function test_producto_con_variantes_tags_e_imagenes_existentes(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $categoria = Category::create(['name' => 'Ropa']);
        $tag = Tag::create(['name' => 'Verano']);
        $atributo = VariantAttribute::create(['name' => 'Color']);
        $negro = $atributo->values()->create(['value' => 'Negro']);
        $blanco = $atributo->values()->create(['value' => 'Blanco']);

        $this->postJson('/api/v1/admin/productos', [
            'name' => 'Camiseta Deportiva',
            'category_id' => $categoria->id,
            'sku' => 'SKU-CAM-001',
            'price' => 60000,
            'existing_image_urls' => [
                'https://cdn.example.com/camiseta.jpg',
                'https://cdn.example.com/camiseta-2.jpg',
            ],
            'tags' => [$tag->id],
            'variants' => [
                ['sku' => 'SKU-CAM-001-N', 'price' => 60000, 'stock' => 10, 'attribute_values' => [$negro->id]],
                ['sku' => 'SKU-CAM-001-B', 'price' => 60000, 'stock' => 5, 'attribute_values' => [$blanco->id]],
            ],
        ])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Camiseta Deportiva')
            ->assertJsonCount(2, 'data.images')
            ->assertJsonCount(2, 'data.variants')
            ->assertJsonCount(1, 'data.tags');

        $producto = Product::where('sku', 'SKU-CAM-001')->firstOrFail();

        $this->assertEquals(15, $producto->stock, 'El stock del producto suma el de sus variantes');
        $this->assertCount(1, $producto->tags);
        $this->assertCount(2, $producto->images);
    }

    public function test_actualizar_producto_puede_limpiar_tags_imagenes_y_variantes(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $categoria = Category::create(['name' => 'Ropa']);
        $tag = Tag::create(['name' => 'Verano']);
        $atributo = VariantAttribute::create(['name' => 'Color']);
        $negro = $atributo->values()->create(['value' => 'Negro']);

        $this->postJson('/api/v1/admin/productos', [
            'name' => 'Camiseta Deportiva',
            'category_id' => $categoria->id,
            'sku' => 'SKU-CAM-002',
            'price' => 60000,
            'existing_image_urls' => ['https://cdn.example.com/camiseta.jpg'],
            'tags' => [$tag->id],
            'variants' => [
                ['sku' => 'SKU-CAM-002-N', 'price' => 60000, 'stock' => 10, 'attribute_values' => [$negro->id]],
            ],
        ])->assertStatus(201);

        $producto = Product::where('sku', 'SKU-CAM-002')->firstOrFail();
        $this->assertEquals(10, $producto->stock);

        $this->putJson("/api/v1/admin/productos/{$producto->id}", [
            'existing_image_urls' => ['https://cdn.example.com/keep.jpg'],
            'tags' => [],
            'variants' => [],
            'stock' => 3,
        ])
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.images')
            ->assertJsonCount(0, 'data.tags')
            ->assertJsonCount(0, 'data.variants')
            ->assertJsonPath('data.stock', 3);

        $producto->refresh();
        $this->assertCount(0, $producto->tags);
        $this->assertCount(1, $producto->images);
        $this->assertEquals('https://cdn.example.com/keep.jpg', $producto->images->first()->url);
        $this->assertCount(0, $producto->variants);
        $this->assertEquals(3, $producto->stock);
    }

    public function test_admin_ve_marcas_y_etiquetas_con_conteo(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $categoria = Category::create(['name' => 'Ropa']);
        $marca = \App\Models\Brand::create(['name' => 'Nike']);
        $tag = Tag::create(['name' => 'Verano']);

        $producto = Product::create([
            'name' => 'Camiseta',
            'sku' => 'SKU-MAR-001',
            'price' => 50000,
            'category_id' => $categoria->id,
            'brand_id' => $marca->id,
            'stock' => 1,
        ]);
        $producto->tags()->attach($tag->id);

        $this->getJson('/api/v1/admin/marcas')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.products_count', 1);

        $this->getJson('/api/v1/admin/etiquetas')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.products_count', 1);
    }
}
