<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use WithRoles;

    public function test_admin_crea_categoria_y_marca(): void
    {
        $this->actingAsSanctum($this->adminUser());

        $this->postJson('/api/v1/admin/categorias', [
            'name' => 'Ropa',
        ])->assertStatus(201)->assertJsonPath('data.name', 'Ropa');

        $this->postJson('/api/v1/admin/marcas', [
            'name' => 'Nike',
        ])->assertStatus(201)->assertJsonPath('data.name', 'Nike');

        $this->assertDatabaseHas('categories', ['name' => 'Ropa']);
        $this->assertDatabaseHas('brands', ['name' => 'Nike']);
    }

    public function test_cliente_no_puede_crear_productos(): void
    {
        $this->actingAsSanctum($this->clientUser());

        $this->postJson('/api/v1/admin/productos', [
            'name' => 'Camiseta',
            'sku' => 'SKU-001',
            'price' => 50000,
        ])->assertStatus(403);
    }

    public function test_admin_crea_producto_con_variantes_imagenes_y_tags(): void
    {
        $admin = $this->actingAsSanctum($this->adminUser());

        $categoria = Category::create(['name' => 'Ropa']);
        $marca = Brand::create(['name' => 'Nike']);

        $tag = \App\Models\Tag::create(['name' => 'Verano']);

        $attribute = \App\Models\VariantAttribute::create(['name' => 'Color']);
        $negro = $attribute->values()->create(['value' => 'Negro']);
        $blanco = $attribute->values()->create(['value' => 'Blanco']);

        $response = $this->postJson('/api/v1/admin/productos', [
            'name' => 'Camiseta Deportiva',
            'category_id' => $categoria->id,
            'brand_id' => $marca->id,
            'sku' => 'SKU-CAM-001',
            'price' => 60000,
            'price_discount' => 50000,
            'weight' => 0.25,
            'is_featured' => true,
            'description' => 'Camiseta de algodón',
            'images' => ['https://cdn.example.com/camiseta.jpg', 'https://cdn.example.com/camiseta-2.jpg'],
            'tags' => [$tag->id],
            'variants' => [
                [
                    'sku' => 'SKU-CAM-001-N',
                    'price' => 60000,
                    'stock' => 10,
                    'attribute_values' => [$negro->id],
                ],
                [
                    'sku' => 'SKU-CAM-001-B',
                    'price' => 60000,
                    'stock' => 5,
                    'attribute_values' => [$blanco->id],
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Camiseta Deportiva')
            ->assertJsonCount(2, 'data.images')
            ->assertJsonCount(2, 'data.variants');

        $producto = Product::where('sku', 'SKU-CAM-001')->first();

        $this->assertNotNull($producto);
        $this->assertEquals(15, $producto->stock, 'El stock del producto suma el de sus variantes');
        $this->assertCount(1, $producto->tags);
    }

    public function test_catalogo_publico_filtra_y_busca(): void
    {
        $this->seedRoles();
        $categoria = Category::create(['name' => 'Tecnología']);
        Product::create([
            'name' => 'Audífonos Bluetooth',
            'sku' => 'SKU-AUD-001',
            'price' => 150000,
            'category_id' => $categoria->id,
            'stock' => 20,
            'estado' => 'activo',
        ]);

        $response = $this->getJson('/api/v1/productos?busqueda=bluetooth&categoria_id=' . $categoria->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.name', 'Audífonos Bluetooth');
    }

    public function test_producto_por_slug(): void
    {
        $this->seedRoles();
        Product::create([
            'name' => 'Zapatos Running',
            'slug' => 'zapatos-running',
            'sku' => 'SKU-ZAP-001',
            'price' => 220000,
            'stock' => 4,
            'estado' => 'activo',
        ]);

        $this->getJson('/api/v1/productos/zapatos-running')
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'zapatos-running');
    }
}