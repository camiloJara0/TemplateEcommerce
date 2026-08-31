<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Address;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Role;
use App\Models\ShippingMethod;
use App\Models\StockMovement;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->crearUsuarios();
        $this->crearCatalogo();
        $this->crearEnviosYCupones();
        $this->crearPedidos();
        $this->crearReviews();
    }

    private function crearUsuarios(): void
    {
        $roles = Role::pluck('id', 'slug');

        $cuentas = [
            ['admin@miTienda.com', 'Administrador', RoleEnum::ADMIN->value],
            ['vendedor@miTienda.com', 'Vendedor Demo', RoleEnum::VENDEDOR->value],
            ['logistica@miTienda.com', 'Operador Logística', RoleEnum::OPERADOR_LOGISTICA->value],
        ];

        foreach ($cuentas as [$email, $nombre, $slug]) {
            $usuario = User::updateOrCreate(
                ['email' => $email],
                [
                    'nombre' => $nombre,
                    'password' => Hash::make('password'),
                    'estado' => 'activo',
                    'email_verified_at' => now(),
                    'telefono' => '+57 300 000 0000',
                ]
            );
            $usuario->roles()->sync([$roles[$slug]]);
        }

        $clientes = [
            ['cliente@correo.com', 'Cliente Demo'],
            ['maria@correo.com', 'María López'],
            ['juan@correo.com', 'Juan Pérez'],
            ['carlos@correo.com', 'Carlos Gómez'],
        ];

        foreach ($clientes as $i => [$email, $nombre]) {
            $cliente = User::updateOrCreate(
                ['email' => $email],
                [
                    'nombre' => $nombre,
                    'password' => Hash::make('password'),
                    'estado' => 'activo',
                    'email_verified_at' => now(),
                    'telefono' => '+57 310 000 00' . str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                ]
            );
            $cliente->roles()->sync([$roles[RoleEnum::CLIENTE->value]]);

            if (!$cliente->addresses()->exists()) {
                Address::create([
                    'user_id' => $cliente->id,
                    'label' => 'Principal',
                    'pais' => 'Colombia',
                    'ciudad' => 'Bogotá',
                    'direccion' => 'Calle 123 # 45-67',
                    'codigo_postal' => '110111',
                    'telefono' => $cliente->telefono,
                    'es_principal' => true,
                ]);
            }
        }
    }

    private function crearCatalogo(): void
    {
        $categorias = [
            ['Electrónica', 'Tecnología, gadgets y accesorios'],
            ['Ropa', 'Moda para todos los estilos'],
            ['Hogar', 'Decoración y utilidades para tu casa'],
            ['Deportes', 'Equipamiento y ropa deportiva'],
        ];

        foreach ($categorias as $i => [$nombre, $desc]) {
            Category::updateOrCreate(['slug' => Str::slug($nombre)], [
                'name' => $nombre,
                'description' => $desc,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        $marcas = ['Samsung', 'Nike', 'LG', 'Sony', 'Adidas'];
        foreach ($marcas as $marca) {
            Brand::updateOrCreate(['slug' => Str::slug($marca)], [
                'name' => $marca,
                'is_active' => true,
            ]);
        }

        $etiquetas = ['Nuevo', 'Oferta', 'Destacado', 'Bestseller'];
        foreach ($etiquetas as $etiqueta) {
            Tag::updateOrCreate(['slug' => Str::slug($etiqueta)], [
                'name' => $etiqueta,
            ]);
        }

        $categoriaElectronica = Category::where('slug', 'electronica')->first();
        $categoriaRopa = Category::where('slug', 'ropa')->first();
        $marcaSamsung = Brand::where('slug', 'samsung')->first();
        $marcaNike = Brand::where('slug', 'nike')->first();
        $etiquetaNuevo = Tag::where('slug', 'nuevo')->first();
        $etiquetaOferta = Tag::where('slug', 'oferta')->first();

        $productos = [
            [
                'name' => 'Auriculares Inalámbricos Pro',
                'sku' => 'AUR-PRO-001',
                'price' => 299900,
                'price_discount' => 249900,
                'category' => $categoriaElectronica,
                'brand' => $marcaSamsung,
                'stock' => 50,
                'featured' => true,
                'tags' => [$etiquetaNuevo, $etiquetaOferta],
            ],
            [
                'name' => 'Teléfono Smart 5G',
                'sku' => 'SMRT-5G-002',
                'price' => 1899900,
                'category' => $categoriaElectronica,
                'brand' => $marcaSamsung,
                'stock' => 15,
                'featured' => true,
                'tags' => [$etiquetaNuevo],
            ],
            [
                'name' => 'Camiseta Deportiva Básica',
                'sku' => 'TSPRT-BSC-003',
                'price' => 89900,
                'category' => $categoriaRopa,
                'brand' => $marcaNike,
                'stock' => 100,
                'featured' => false,
                'tags' => [$etiquetaNuevo],
            ],
        ];

        foreach ($productos as $datos) {
            $tags = $datos['tags'];
            unset($datos['tags']);

            $producto = Product::updateOrCreate(['sku' => $datos['sku']], [
                'name' => $datos['name'],
                'slug' => Str::slug($datos['name']) . '-' . Str::lower(Str::random(4)),
                'description' => 'Descripción del producto ' . $datos['name'] . '. Ideal para el día a día.',
                'category_id' => $datos['category']->id,
                'brand_id' => $datos['brand']->id,
                'price' => $datos['price'],
                'price_discount' => $datos['price_discount'] ?? null,
                'weight' => 0.5,
                'stock' => $datos['stock'],
                'is_featured' => $datos['featured'],
                'estado' => 'activo',
                'rating_avg' => 4.5,
                'reviews_count' => 0,
            ]);

            $producto->tags()->sync(collect($tags)->pluck('id')->all());

            if (!$producto->images()->exists()) {
                ProductImage::create([
                    'product_id' => $producto->id,
                    'url' => 'https://placehold.co/600x600?text=' . urlencode($producto->name),
                    'position' => 0,
                ]);
            }

            if ($producto->sku === 'AUR-PRO-001' && !$producto->variants()->exists()) {
                ProductVariant::create([
                    'product_id' => $producto->id,
                    'sku' => $producto->sku . '-N',
                    'price' => $datos['price'],
                    'price_discount' => $datos['price_discount'] ?? null,
                    'stock' => 30,
                ]);
                ProductVariant::create([
                    'product_id' => $producto->id,
                    'sku' => $producto->sku . '-B',
                    'price' => $datos['price'],
                    'price_discount' => $datos['price_discount'] ?? null,
                    'stock' => 20,
                ]);
            }

            if (!$producto->stockMovements()->exists()) {
                StockMovement::create([
                    'product_id' => $producto->id,
                    'usuario_id' => null,
                    'tipo' => 'entrada',
                    'cantidad' => $datos['stock'],
                    'razon' => 'Inventario inicial (demo)',
                ]);
            }
        }
    }

    private function crearEnviosYCupones(): void
    {
        $metodos = [
            ['Económico', 'Envío estándar 5-7 días', 8900, 5],
            ['Express', 'Entrega en 24-48 horas', 18900, 2],
            ['Recoge en tienda', 'Sin costo de envío', 0, 0],
        ];

        foreach ($metodos as [$nombre, $desc, $costo, $dias]) {
            ShippingMethod::updateOrCreate(['name' => $nombre], [
                'description' => $desc,
                'cost' => $costo,
                'estimated_days' => $dias,
                'active' => true,
            ]);
        }

        $cupones = [
            ['BIENVENIDA10', 'percent', 10, 1],
            ['ENVIOGRATIS', 'free_shipping', 0, 1],
            ['AHORRA50K', 'fixed', 50000, 1],
        ];

        foreach ($cupones as [$codigo, $tipo, $valor, $usos]) {
            Coupon::updateOrCreate(['code' => $codigo], [
                'type' => $tipo,
                'value' => $valor,
                'min_subtotal' => 0,
                'usage_limit' => $usos,
                'per_user_limit' => 1,
                'used_count' => 0,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(3),
                'active' => true,
            ]);
        }
    }

    private function crearPedidos(): void
    {
        $clientes = User::whereHas('roles', fn ($q) => $q->where('slug', 'cliente'))->get();
        $productos = Product::all();
        $metodo = ShippingMethod::where('name', 'Económico')->first();
        $estados = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

        foreach ($clientes->take(3) as $index => $cliente) {
            $direccion = $cliente->addresses()->first();
            $producto = $productos->random();
            $subtotal = (float) $producto->precioEfectivo();
            $shipping = (float) $metodo->cost;
            $tax = round($subtotal * 0.19, 2);
            $total = round($subtotal + $shipping + $tax, 2);
            $estado = $estados[$index];

            $pedido = Order::create([
                'numero' => 'ORD-' . now()->format('Ymd') . '-' . Str::upper(Str::random(6)),
                'user_id' => $cliente->id,
                'address_id' => $direccion?->id,
                'shipping_method_id' => $metodo->id,
                'subtotal' => $subtotal,
                'discount' => 0,
                'shipping_cost' => $shipping,
                'tax' => $tax,
                'total' => $total,
                'currency' => 'COP',
                'status' => $estado,
                'payment_status' => $estado === 'cancelado' ? 'fallido' : ($estado === 'pendiente' ? 'pendiente' : 'pagado'),
                'shipping_status' => in_array($estado, ['enviado', 'entregado']) ? $estado : 'pendiente',
            ]);

            OrderItem::create([
                'order_id' => $pedido->id,
                'product_id' => $producto->id,
                'product_variant_id' => null,
                'name' => $producto->name,
                'sku' => $producto->sku,
                'price' => $subtotal,
                'quantity' => 1,
                'subtotal' => $subtotal,
            ]);

            OrderStatusHistory::create([
                'order_id' => $pedido->id,
                'status' => $estado,
                'comment' => 'Pedido demo',
                'user_id' => null,
            ]);
        }
    }

    private function crearReviews(): void
    {
        $entregados = Order::where('status', 'entregado')->get();

        foreach ($entregados as $index => $pedido) {
            Review::updateOrCreate(
                [
                    'product_id' => $pedido->items()->first()->product_id,
                    'user_id' => $pedido->user_id,
                    'order_id' => $pedido->id,
                ],
                [
                    'rating' => 4 + ($index % 2),
                    'comment' => 'Excelente producto, llegó a tiempo y cumple lo prometido.',
                    'status' => 'aprobado',
                ]
            );
        }
    }
}