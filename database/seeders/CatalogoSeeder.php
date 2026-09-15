<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Tag;
use App\Models\User;
use App\Models\VariantAttribute;
use App\Models\VariantAttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogoSeeder extends Seeder
{
    private array $categoriasData = [
        ['Electrónica', 'Tecnología, gadgets y accesorios', [
            ['Celulares', 'Smartphones y accesorios'],
            ['Computadores', 'Laptops, PCs y componentes'],
            ['Audio', 'Audífonos, bocinas y micrófonos'],
            ['Gaming', 'Consolas, videojuegos y accesorios'],
        ]],
        ['Ropa', 'Moda para todos los estilos', [
            ['Camisetas', 'Camisetas, polos y remeras'],
            ['Pantalones', 'Jeans, joggers y pantalones formales'],
            ['Zapatos', 'Calzado deportivo y casual'],
            ['Accesorios', 'Gorras, cinturones y más'],
        ]],
        ['Hogar', 'Decoración y utilidades para el hogar', [
            ['Muebles', 'Sillas, mesas y estanterías'],
            ['Cocina', 'Utensilios y electrodomésticos de cocina'],
            ['Decoración', 'Cuadros, lámparas y ornamentos'],
        ]],
        ['Deportes', 'Equipamiento y ropa deportiva', [
            ['Fitness', 'Pesas, bandas y equipamiento de gimnasio'],
            ['Fútbol', 'Balones, uniformes y accesorios'],
            ['Ciclismo', 'Bicicletas, cascos y accesorios'],
        ]],
        ['Belleza', 'Cuidado personal y cosméticos', [
            ['Cuidado de la piel', 'Crema, protector solar y serums'],
            ['Maquillaje', 'Base, labiales y sombras'],
        ]],
        ['Mascotas', 'Todo para tu compañero peludo', [
            ['Alimentos', 'Comida seca y húmeda'],
            ['Accesorios', 'Correas, juguetes y camas'],
        ]],
        ['Libros', 'Best sellers y literatura variada', [
            ['Ficción', 'Novelas y narrativa'],
            ['No ficción', 'Autoayuda, historia y ciencia'],
        ]],
        ['Tecnología Smart', 'Dispositivos inteligentes del hogar', []],
        ['Juguetes', 'Juegos y juguetes para todas las edades', []],
        ['Vinos y Licores', 'Bebidas alcohólicas premium', []],
        ['Herramientas', 'Herramientas manuales y eléctricas', []],
        ['Bebé', 'Ropa, juguetes y artículos para bebés', []],
    ];

    private array $marcasData = [
        'Samsung', 'Apple', 'Xiaomi', 'Sony', 'LG',
        'Nike', 'Adidas', 'Under Armour', 'New Balance', 'Reebok',
        'IKEA', 'L G', 'Oster', 'Philips', 'Bosch',
        'LEGO', 'Hasbro', 'Mattel', 'Bandai', 'Fisher-Price',
        'L\'Oréal', 'Nivea', 'Neutrogena', 'The Ordinary', 'CeraVe',
        'Purina', 'Pedigree', 'Whiskas', 'Royal Canin', 'Kong',
        'Penguin Random House', 'Planeta', 'Norma', 'Alfaguara', 'Debolsillo',
        'Bose', 'JBL', 'Sennheiser', 'Audio-Technica', 'Marshall',
        'Garmin', 'Fitbit', 'Dyson', 'iRobot', 'TP-Link',
        'Bahco', 'DeWalt', 'Makita', 'Black+Decker', 'Stanley',
    ];

    private array $tagsData = ['Nuevo', 'Oferta', 'Destacado', 'Bestseller', 'Edición Limitada', 'Envío Gratis'];

    private array $nombresProductos = [
        // Electrónica - Celulares
        ['Samsung Galaxy S24 Ultra', 'Celulares', 'Samsung', 5499000, 4999000, 25, true],
        ['iPhone 15 Pro Max', 'Celulares', 'Apple', 6299000, null, 20, true],
        ['Xiaomi Redmi Note 13 Pro', 'Celulares', 'Xiaomi', 1299000, 1099000, 45, false],
        ['Samsung Galaxy A54', 'Celulares', 'Samsung', 1599000, 1399000, 35, false],
        ['iPhone SE 2024', 'Celulares', 'Apple', 2199000, null, 30, false],

        // Electrónica - Computadores
        ['MacBook Air M3', 'Computadores', 'Apple', 5999000, 5499000, 15, true],
        ['Laptop LG Gram 17', 'Computadores', 'LG', 4299000, 3899000, 10, false],
        ['Samsung Galaxy Book Pro', 'Computadores', 'Samsung', 3499000, null, 12, false],
        ['Xiaomi Mi Notebook Air', 'Computadores', 'Xiaomi', 2799000, 2499000, 18, false],

        // Electrónica - Audio
        ['Sony WH-1000XM5', 'Audio', 'Sony', 1599000, 1399000, 40, true],
        ['Bose QuietComfort Ultra', 'Audio', 'Bose', 1799000, null, 25, true],
        ['JBL Flip 6', 'Audio', 'JBL', 499000, 449000, 60, false],
        ['Marshall Stanmore III', 'Audio', 'Marshall', 1299000, null, 15, true],
        ['Audio-Technica ATH-M50x', 'Audio', 'Audio-Technica', 899000, 799000, 20, false],

        // Electrónica - Gaming
        ['PlayStation 5 Slim', 'Gaming', 'Sony', 2199000, null, 10, true],
        ['Xbox Series X', 'Gaming', 'Microsoft', 1999000, 1799000, 12, false],
        ['Nintendo Switch OLED', 'Gaming', 'Nintendo', 1499000, null, 20, true],
        ['Samsung Odyssey G9 49"', 'Gaming', 'Samsung', 3999000, 3499000, 8, false],

        // Ropa - Camisetas
        ['Nike Dri-FIT ADV', 'Camisetas', 'Nike', 189000, 159000, 100, false],
        ['Adidas Ultraboost Tee', 'Camisetas', 'Adidas', 179000, null, 80, false],
        ['Under Armour Tech 2.0', 'Camisetas', 'Under Armour', 169000, 139000, 90, false],
        ['New Balance Fresh Foam Tee', 'Camisetas', 'New Balance', 159000, null, 70, false],

        // Ropa - Pantalones
        ['Nike Sportswear Club Joggers', 'Pantalones', 'Nike', 259000, 229000, 60, true],
        ['Adidas Essentials Track Pants', 'Pantalones', 'Adidas', 239000, null, 55, false],
        ['Reebok Classics Sweatpants', 'Pantalones', 'Reebok', 219000, 189000, 45, false],

        // Ropa - Zapatos
        ['Nike Air Max 90', 'Zapatos', 'Nike', 699000, 599000, 30, true],
        ['Adidas Ultraboost 23', 'Zapatos', 'Adidas', 799000, null, 25, true],
        ['New Balance 574', 'Zapatos', 'New Balance', 549000, 499000, 35, false],
        ['Reebok Classic Leather', 'Zapatos', 'Reebok', 499000, 449000, 40, false],

        // Ropa - Accesorios
        ['Nike Sportswear Cap', 'Accesorios', 'Nike', 129000, null, 80, false],
        ['Adidas Trefoil Backpack', 'Accesorios', 'Adidas', 189000, 169000, 50, false],

        // Hogar - Muebles
        ['IKEA KALLAX Shelf', 'Muebles', 'IKEA', 499000, 449000, 20, false],
        ['IKEA MALM Desk', 'Muebles', 'IKEA', 699000, null, 15, true],
        ['IKEA POÄNG Chair', 'Muebles', 'IKEA', 599000, 549000, 25, false],

        // Hogar - Cocina
        ['Oster Blender 10 Velocidades', 'Cocina', 'Oster', 299000, 249000, 30, false],
        ['Philips Airfryer XXL', 'Cocina', 'Philips', 799000, 699000, 18, true],
        ['LG Microondas Smart Inverter', 'Cocina', 'LG', 499000, null, 22, false],

        // Hogar - Decoración
        ['Philips Hue Starter Kit', 'Decoración', 'Philips', 599000, 549000, 20, true],
        ['LG OLED Ambient TV', 'Decoración', 'LG', 4999000, 4499000, 5, false],

        // Deportes - Fitness
        ['Garmin Venu 3', 'Fitness', 'Garmin', 2199000, 1999000, 15, true],
        ['Fitbit Charge 6', 'Fitness', 'Fitbit', 799000, 699000, 25, false],

        // Deportes - Fútbol
        ['Adidas Al Rihla Pro', 'Fútbol', 'Adidas', 399000, null, 40, false],
        ['Nike Mercurial Superfly 9', 'Fútbol', 'Nike', 1199000, 999000, 12, true],

        // Deportes - Ciclismo
        ['Garmin Edge 540', 'Ciclismo', 'Garmin', 2499000, 2299000, 8, false],

        // Belleza
        ['L\'Oréal Paris Revitalift', 'Cuidado de la piel', 'L\'Oréal', 129000, 99000, 100, true],
        ['Nivea Sun Protect SPF50', 'Cuidado de la piel', 'Nivea', 69000, null, 150, false],
        ['The Ordinary Niacinamide 10%', 'Cuidado de la piel', 'The Ordinary', 89000, 79000, 80, false],
        ['CeraVe Moisturizing Cream', 'Cuidado de la piel', 'CeraVe', 119000, null, 90, true],
        ['Neutrogena Hydro Boost', 'Cuidado de la piel', 'Neutrogena', 99000, 89000, 70, false],

        // Mascotas
        ['Royal Canin Adult Dog', 'Alimentos', 'Royal Canin', 189000, 169000, 50, false],
        ['Kong Classic Toy', 'Accesorios', 'Kong', 79000, null, 100, true],
        ['Pedigree Adult Chicken', 'Alimentos', 'Pedigree', 99000, 89000, 120, false],

        // Libros
        ['Atomic Habits', 'Ficción', 'Penguin Random House', 79000, 69000, 200, true],
        ['El Alquimista', 'Ficción', 'Penguin Random House', 59000, null, 180, true],
        ['Sapiens', 'No ficción', 'Penguin Random House', 89000, 79000, 150, false],

        // Tecnología Smart
        ['Dyson V15 Detect', 'Tecnología Smart', 'Dyson', 2499000, 2299000, 10, true],
        ['TP-Link Deco XE75', 'Tecnología Smart', 'TP-Link', 899000, 799000, 20, false],

        // Juguetes
        ['LEGO Star Wars AT-AT', 'Juguetes', 'LEGO', 1299000, 1199000, 15, true],
        ['Hasbro Monopoly Plus', 'Juguetes', 'Hasbro', 129000, null, 50, false],

        // Herramientas
        ['Bosch GSR 18V-55', 'Herramientas', 'Bosch', 899000, 799000, 20, true],
        ['DeWalt DCD791', 'Herramientas', 'DeWalt', 799000, null, 15, false],

        // Bebé
        ['Fisher-Price Activity Center', 'Juguetes', 'Fisher-Price', 349000, 299000, 25, false],

        // Vinos
        ['Casillero del Diablo Reserva', 'Vinos y Licores', null, 69000, null, 80, false],
        ['Concha y Toro Late Harvest', 'Vinos y Licores', null, 89000, 79000, 60, false],
    ];

    private array $reviewsData = [
        ['Excelente producto, superó mis expectativas. La calidad es increíble.', 5],
        ['Muy buen producto, llegó a tiempo. Recomendado.', 4],
        ['Buen producto pero el empaque llegó un poco dañado.', 3],
        ['Perfecto para lo que necesitaba. Muy satisfecho.', 5],
        ['El producto es bueno pero el envío tardó más de lo esperado.', 3],
        ['Calidad premium, vale cada peso invertido.', 5],
        ['Funciona perfecto, lo uso a diario sin problemas.', 4],
        ['No esperaba tanto por este precio. Excelente compra.', 5],
        ['El producto está bien pero la descripción no era muy precisa.', 3],
        ['Llegó en perfecto estado. Muy conforme con la compra.', 4],
        ['Lo compré para un regalo y fue todo un éxito.', 5],
        ['Buena relación calidad-precio, lo recomiendo.', 4],
        ['Tuve un pequeño inconveniente pero se resolvió rápido.', 4],
        ['Producto original y de excelente calidad.', 5],
        ['Cumple con lo prometido, nada que criticar.', 4],
        ['El mejor que he probado en esta categoría.', 5],
        ['Regular, esperaba un poco más de calidad.', 3],
        ['Excepcional, lo volvería a comprar sin dudarlo.', 5],
        ['Muy práctico y fácil de usar.', 4],
        ['No me convenció del todo, pero funciona.', 3],
    ];

    public function run(): void
    {
        $this->crearCategorias();
        $this->crearMarcas();
        $this->crearEtiquetas();
        $this->crearAtributosVariant();
        $this->crearProductos();
        $this->crearReviews();
    }

    private function crearCategorias(): void
    {
        foreach ($this->categoriasData as $i => [$nombre, $descripcion, $subcats]) {
            $categoria = Category::updateOrCreate(
                ['slug' => Str::slug($nombre)],
                [
                    'name' => $nombre,
                    'description' => $descripcion,
                    'sort_order' => $i,
                    'is_active' => true,
                ]
            );

            foreach ($subcats as $j => [$subNombre, $subDesc]) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($subNombre)],
                    [
                        'name' => $subNombre,
                        'parent_id' => $categoria->id,
                        'description' => $subDesc,
                        'sort_order' => $j,
                        'is_active' => true,
                    ]
                );
            }
        }
    }

    private function crearMarcas(): void
    {
        foreach ($this->marcasData as $marca) {
            Brand::updateOrCreate(
                ['slug' => Str::slug($marca)],
                ['name' => $marca, 'is_active' => true]
            );
        }
    }

    private function crearEtiquetas(): void
    {
        foreach ($this->tagsData as $tag) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($tag)],
                ['name' => $tag]
            );
        }
    }

    private function crearAtributosVariant(): void
    {
        $colorAttr = VariantAttribute::updateOrCreate(['name' => 'Color']);
        $tallaAttr = VariantAttribute::updateOrCreate(['name' => 'Talla']);

        $colores = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Gris', 'Rosa', 'Dorado'];
        foreach ($colores as $color) {
            VariantAttributeValue::updateOrCreate(
                ['attribute_id' => $colorAttr->id, 'value' => $color]
            );
        }

        $tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        foreach ($tallas as $talla) {
            VariantAttributeValue::updateOrCreate(
                ['attribute_id' => $tallaAttr->id, 'value' => $talla]
            );
        }
    }

    private function crearProductos(): void
    {
        $etiquetas = Tag::pluck('id', 'name');
        $colorAttr = VariantAttribute::where('name', 'Color')->first();
        $tallaAttr = VariantAttribute::where('name', 'Talla')->first();
        $colores = $colorAttr ? $colorAttr->values->pluck('id', 'value')->toArray() : [];
        $tallas = $tallaAttr ? $tallaAttr->values->pluck('id', 'value')->toArray() : [];

        foreach ($this->nombresProductos as [$nombre, $subCategoria, $marcaNombre, $precio, $precioDesc, $stock, $featured]) {
            $subCat = Category::where('slug', Str::slug($subCategoria))->first();
            if (!$subCat) continue;

            $marca = $marcaNombre ? Brand::where('slug', Str::slug($marcaNombre))->first() : null;

            $producto = Product::updateOrCreate(
                ['sku' => 'SKU-' . Str::upper(Str::random(8))],
                [
                    'name' => $nombre,
                    'description' => "Descripción detallada del {$nombre}. Producto de alta calidad ideal para el uso diario. Fabricado con los mejores materiales y garantía de satisfacción.",
                    'category_id' => $subCat->id,
                    'brand_id' => $marca?->id,
                    'price' => $precio,
                    'price_discount' => $precioDesc,
                    'weight' => round(rand(100, 5000) / 1000, 2),
                    'stock' => $stock,
                    'is_featured' => $featured,
                    'estado' => 'activo',
                    'rating_avg' => round(rand(35, 50) / 10, 2),
                    'reviews_count' => 0,
                ]
            );

            // Imagen principal
            if (!$producto->images()->exists()) {
                ProductImage::create([
                    'product_id' => $producto->id,
                    'url' => 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=' . urlencode(Str::limit($nombre, 20)),
                    'position' => 0,
                ]);
                ProductImage::create([
                    'product_id' => $producto->id,
                    'url' => 'https://placehold.co/600x600/16213e/e0e0e0?text=' . urlencode(Str::limit($nombre, 20) . '+2'),
                    'position' => 1,
                ]);
                ProductImage::create([
                    'product_id' => $producto->id,
                    'url' => 'https://placehold.co/600x600/0f3460/e0e0e0?text=' . urlencode(Str::limit($nombre, 20) . '+3'),
                    'position' => 2,
                ]);
            }

            // Tags aleatorios
            $tagIds = $etiquetas->values()->random(min(3, $etiquetas->count()))->toArray();
            $producto->tags()->syncWithoutDetaching($tagIds);

            // Variantes para ropa, zapatos y accesorios
            $categoriasConVariantes = ['Camisetas', 'Pantalones', 'Zapatos', 'Accesorios'];
            if (in_array($subCategoria, $categoriasConVariantes) && !$producto->variants()->exists()) {
                $this->crearVariantes($producto, $subCategoria, $colores, $tallas);
            }

            // Stock movement
            if (!$producto->stockMovements()->exists()) {
                \App\Models\StockMovement::create([
                    'product_id' => $producto->id,
                    'tipo' => 'entrada',
                    'cantidad' => $stock,
                    'razon' => 'Inventario inicial (catálogo completo)',
                ]);
            }
        }
    }

    private function crearVariantes(Product $producto, string $subCategoria, array $colores, array $tallas): void
    {
        $variantesPorCategoria = [
            'Camisetas' => ['colores' => ['Negro', 'Blanco', 'Azul', 'Gris'], 'tallas' => ['S', 'M', 'L', 'XL']],
            'Pantalones' => ['colores' => ['Negro', 'Azul', 'Gris'], 'tallas' => ['S', 'M', 'L', 'XL']],
            'Zapatos' => ['colores' => ['Negro', 'Blanco', 'Rojo'], 'tallas' => ['38', '39', '40', '41', '42', '43']],
            'Accesorios' => ['colores' => ['Negro', 'Blanco', 'Azul', 'Rojo'], 'tallas' => ['Única']],
        ];

        $config = $variantesPorCategoria[$subCategoria] ?? null;
        if (!$config) return;

        foreach ($config['colores'] as $colorNombre) {
            foreach ($config['tallas'] as $tallaNombre) {
                $colorId = $colores[$colorNombre] ?? null;
                $tallaId = $tallas[$tallaNombre] ?? null;

                if (!$colorId) continue;

                $sku = $producto->sku . '-' . strtoupper(substr($colorNombre, 0, 2)) . '-' . strtoupper($tallaNombre);
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'product_id' => $producto->id,
                        'price' => $producto->price,
                        'price_discount' => $producto->price_discount,
                        'stock' => rand(5, 30),
                    ]
                );

                $attrValues = array_filter([$colorId, $tallaId]);
                foreach ($attrValues as $avId) {
                    $variant->attributeValues()->syncWithoutDetaching([$avId]);
                }
            }
        }
    }

    private function crearReviews(): void
    {
        $clientes = User::whereHas('roles', fn ($q) => $q->where('slug', 'cliente'))->get();
        $productos = Product::where('estado', 'activo')->inRandomOrder()->limit(30)->get();

        if ($clientes->isEmpty() || $productos->isEmpty()) return;

        foreach ($productos as $producto) {
            $numReviews = rand(2, 5);
            $clientesShuffled = $clientes->shuffle()->take($numReviews);

            foreach ($clientesShuffled as $cliente) {
                $review = $this->reviewsData[array_rand($this->reviewsData)];

                Review::updateOrCreate(
                    [
                        'product_id' => $producto->id,
                        'user_id' => $cliente->id,
                        'order_id' => null,
                    ],
                    [
                        'rating' => $review[1],
                        'comment' => $review[0],
                        'status' => 'aprobado',
                    ]
                );
            }

            // Actualizar contadores del producto
            $avg = $producto->reviews()->where('status', 'aprobado')->avg('rating');
            $count = $producto->reviews()->where('status', 'aprobado')->count();
            $producto->update([
                'rating_avg' => round($avg, 2),
                'reviews_count' => $count,
            ]);
        }
    }
}
