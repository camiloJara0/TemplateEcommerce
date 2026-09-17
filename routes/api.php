<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// ===== Rutas públicas de autenticación =====
Route::post('/v1/register', [UserController::class, 'register'])->middleware('throttle:5,1');
Route::post('/v1/login', [UserController::class, 'login'])->middleware('throttle:10,1');
Route::post('/v1/enviar-codigo', [UserController::class, 'enviarCodigo'])->middleware('throttle:3,5');
Route::post('/v1/verificar-codigo-cambio', [UserController::class, 'verificarCodigoCambio'])->middleware('throttle:5,1');

// ===== Catálogo público =====
Route::prefix('v1')->middleware('throttle:120,1')->group(function () {
    Route::get('/productos', [ProductController::class, 'index']);
    Route::get('/productos/{producto:slug}', [ProductController::class, 'show']);
    Route::get('/productos/{producto:slug}/detalle', [ProductController::class, 'detalle']);
    Route::get('/productos/{producto}/relacionados', [ProductController::class, 'relacionados']);
    Route::get('/categorias', [CategoryController::class, 'index']);
    Route::get('/marcas', [BrandController::class, 'index']);
    Route::get('/etiquetas', [TagController::class, 'index']);
    Route::get('/metodos-envio', [CheckoutController::class, 'metodosEnvio']);

    // Configuración pública de la tienda (nombre, colores, SEO) para la landing
    Route::get('/configuracion/publica', [SettingsController::class, 'publico']);
    Route::get('/configuracion/tienda', [SettingsController::class, 'tienda']);
    Route::get('/configuracion/completa', [SettingsController::class, 'completa']);
    // VAPID public key for Web Push
    Route::get('/configuracion/vapid-public-key', [SettingsController::class, 'vapidPublicKey']);

    // Rapyd payment methods by country (public for checkout)
    Route::get('/pagos/rapyd/metodos/{country}', function (string $country) {
        $currency = request()->query('currency', 'COP');
        $provider = app(\App\Services\PaymentService::class)->proveedor('rapyd');
        $methods = $provider->listPaymentMethodsByCountry($country, $currency);
        return \App\Support\ApiResponse::success(['methods' => $methods]);
    });

    // Rapyd required fields for a payment method type (public for checkout)
    Route::get('/pagos/rapyd/campos-requeridos/{type}', function (string $type) {
        $provider = app(\App\Services\PaymentService::class)->proveedor('rapyd');
        $fields = $provider->getRequiredFields($type);
        return \App\Support\ApiResponse::success(['fields' => $fields]);
    });

    // PayU PSE banks list (public for checkout)
    Route::get('/pagos/payu/bancos-pse', function () {
        $provider = app(\App\Services\PaymentService::class)->proveedor('payu');
        return \App\Support\ApiResponse::success(['banks' => $provider->bancosPse()]);
    });

    // Carrito (logueado o invitado con session_id)
    Route::get('/carrito', [CartController::class, 'mostrar']);
    Route::post('/carrito/items', [CartController::class, 'agregar']);
    Route::put('/carrito/items/{item}', [CartController::class, 'actualizar']);
    Route::delete('/carrito/items/{item}', [CartController::class, 'eliminar']);
    Route::delete('/carrito', [CartController::class, 'vaciar']);

    // Resumen de compra
    Route::post('/checkout/preview', [CheckoutController::class, 'preview']);

    // Reseñas públicas aprobadas
    Route::get('/productos/{producto}/resenas', [ReviewController::class, 'index']);

    // Seguimiento público de envíos
    Route::get('/envios/tracking/{trackingNumber}', [ShipmentController::class, 'tracking']);
});

// ===== Webhook de pagos (sin autenticación) =====
Route::post('/webhooks/pagos/{provider}', [WebhookController::class, 'handle']);

// ===== Proveedor de pago activo (público, para checkout) =====
Route::get('/v1/pagos/provider', function () {
    $default = config('payments.default');
    return \App\Support\ApiResponse::success([
        'provider' => $default,
        'available' => array_keys(config('payments.class_map', [])),
    ]);
});

// ===== Cliente autenticado =====
Route::middleware(['auth:sanctum', 'check.token.expiration'])->prefix('v1')->group(function () {
    Route::get('/perfil', [UserController::class, 'perfil']);
    Route::put('/perfil', [UserController::class, 'actualizarPerfil']);
    Route::post('/logout', [UserController::class, 'logout']);

    Route::get('/direcciones', [AddressController::class, 'index']);
    Route::post('/direcciones', [AddressController::class, 'store']);
    Route::put('/direcciones/{direccion}', [AddressController::class, 'update']);
    Route::delete('/direcciones/{direccion}', [AddressController::class, 'destroy']);

    Route::post('/pedidos', [OrderController::class, 'store']);
    Route::get('/pedidos', [OrderController::class, 'index']);
    Route::get('/pedidos/{order}', [OrderController::class, 'show']);

    Route::post('/pedidos/{order}/pagar', [PaymentController::class, 'iniciar']);

    // Cupones (cliente puede validar y aplicar)
    Route::post('/cupones/aplicar', [CouponController::class, 'aplicar']);

    // Reseñas de compras verificadas
    Route::post('/productos/{producto}/resenas', [ReviewController::class, 'store']);

    // Favoritos
    Route::get('/favoritos', [WishlistController::class, 'index']);
    Route::post('/favoritos', [WishlistController::class, 'store']);
    Route::delete('/favoritos/{producto}', [WishlistController::class, 'destroy']);
    Route::post('/favoritos/{item}/mover-al-carrito', [WishlistController::class, 'moverAlCarrito']);

    // Notificaciones
    Route::get('/notificaciones', [NotificationController::class, 'index']);
    Route::post('/notificaciones/push/subscribir', [NotificationController::class, 'subscribe']);
    Route::post('/notificaciones/push/desuscribir', [NotificationController::class, 'unsubscribe']);
});

// ===== Panel administrativo =====
Route::middleware(['auth:sanctum', 'check.token.expiration'])->prefix('v1/admin')->group(function () {
    // Productos
    Route::get('/productos', [ProductController::class, 'index']);
    Route::post('/productos', [ProductController::class, 'store'])->middleware('permission:productos.crear');
    Route::put('/productos/{producto}', [ProductController::class, 'update'])->middleware('permission:productos.editar');
    Route::delete('/productos/{producto}', [ProductController::class, 'destroy'])->middleware('permission:productos.eliminar');

    // Usuarios
    Route::get('/usuarios', [UserController::class, 'usuarios']);

    // Categorías
    Route::post('/categorias', [CategoryController::class, 'store'])->middleware('permission:productos.categorias.crear');
    Route::put('/categorias/{categoria}', [CategoryController::class, 'update'])->middleware('permission:productos.categorias.editar');
    Route::delete('/categorias/{categoria}', [CategoryController::class, 'destroy'])->middleware('permission:productos.categorias.eliminar');

    // Marcas
    Route::post('/marcas', [BrandController::class, 'store'])->middleware('permission:productos.marcas.crear');
    Route::put('/marcas/{marca}', [BrandController::class, 'update'])->middleware('permission:productos.marcas.editar');
    Route::delete('/marcas/{marca}', [BrandController::class, 'destroy'])->middleware('permission:productos.marcas.eliminar');

    // Etiquetas
    Route::post('/etiquetas', [TagController::class, 'store'])->middleware('permission:productos.etiquetas.crear');
    Route::put('/etiquetas/{tag}', [TagController::class, 'update'])->middleware('permission:productos.etiquetas.editar');
    Route::delete('/etiquetas/{tag}', [TagController::class, 'destroy'])->middleware('permission:productos.etiquetas.eliminar');

    // Inventario
    Route::get('/inventario/movimientos', [InventoryController::class, 'movimientos'])->middleware('permission:inventario.ver');
    Route::post('/inventario/movimientos', [InventoryController::class, 'registrarMovimiento'])->middleware('permission:inventario.movimientos.crear');
    Route::get('/inventario/alertas', [InventoryController::class, 'alertas'])->middleware('permission:inventario.alertas.ver');
    Route::post('/inventario/alertas', [InventoryController::class, 'configurarAlerta'])->middleware('permission:inventario.alertas.crear');

    // Pedidos
    Route::get('/pedidos', [OrderController::class, 'adminIndex'])->middleware('permission:pedidos.ver');
    Route::post('/pedidos/{order}/estado', [OrderController::class, 'cambiarEstado'])->middleware('permission:pedidos.gestionar');

    // Pagos
    Route::get('/pagos', [PaymentController::class, 'adminIndex'])->middleware('permission:pagos.ver');
    Route::get('/pagos/{pago}', [PaymentController::class, 'show'])->middleware('permission:pagos.ver');
    Route::post('/pagos/{pago}/reembolsar', [PaymentController::class, 'reembolsar'])->middleware('permission:pagos.gestionar');
    Route::post('/pagos/{pago}/cancelar', [PaymentController::class, 'cancelar'])->middleware('permission:pagos.gestionar');

    // Envíos
    Route::get('/envios', [ShipmentController::class, 'index'])->middleware('permission:envios.ver');
    Route::post('/envios', [ShipmentController::class, 'crear'])->middleware('permission:envios.crear');
    Route::get('/envios/cotizar', [ShipmentController::class, 'cotizar'])->middleware('permission:envios.ver');
    Route::get('/envios/{shipment}', [ShipmentController::class, 'show'])->middleware('permission:envios.ver');
    Route::put('/envios/{shipment}/estado', [ShipmentController::class, 'actualizarEstado'])->middleware('permission:envios.gestionar');

    // Cupones
    Route::get('/cupones', [CouponController::class, 'index'])->middleware('permission:cupones.ver');
    Route::post('/cupones', [CouponController::class, 'store'])->middleware('permission:cupones.crear');
    Route::put('/cupones/{cupon}', [CouponController::class, 'update'])->middleware('permission:cupones.editar');
    Route::delete('/cupones/{cupon}', [CouponController::class, 'destroy'])->middleware('permission:cupones.eliminar');

    // Reseñas (moderación)
    Route::get('/resenas', [ReviewController::class, 'adminIndex'])->middleware('permission:reviews.moderar');
    Route::post('/resenas/{review}/aprobar', [ReviewController::class, 'aprobar'])->middleware('permission:reviews.moderar');
    Route::post('/resenas/{review}/rechazar', [ReviewController::class, 'rechazar'])->middleware('permission:reviews.moderar');
    Route::delete('/resenas/{review}', [ReviewController::class, 'destroy'])->middleware('permission:reviews.moderar');

    // Dashboard
    Route::get('/dashboard/resumen', [DashboardController::class, 'resumen'])->middleware('permission:reportes.ver');
    Route::get('/dashboard/ventas-por-dia', [DashboardController::class, 'ventasPorDia'])->middleware('permission:reportes.ver');
    Route::get('/dashboard/ventas-por-categoria', [DashboardController::class, 'ventasPorCategoria'])->middleware('permission:reportes.ver');
    Route::get('/dashboard/top-productos', [DashboardController::class, 'topProductos'])->middleware('permission:reportes.ver');
    Route::get('/dashboard/usuarios-registrados', [DashboardController::class, 'usuariosRegistrados'])->middleware('permission:reportes.ver');

    // Reportes y exportaciones
    Route::get('/reportes/ventas', [ReportController::class, 'ventas'])->middleware('permission:reportes.ver');
    Route::get('/reportes/inventario', [ReportController::class, 'inventario'])->middleware('permission:reportes.ver');
    Route::get('/reportes/clientes', [ReportController::class, 'clientes'])->middleware('permission:reportes.ver');
    Route::get('/reportes/productos', [ReportController::class, 'productos'])->middleware('permission:reportes.ver');

    // Configuración de la tienda
    Route::get('/configuracion', [SettingsController::class, 'index'])->middleware('permission:configuracion.ver');
    Route::put('/configuracion', [SettingsController::class, 'actualizar'])->middleware('permission:configuracion.editar');
    Route::get('/configuracion/tienda', [SettingsController::class, 'obtenerTienda'])->middleware('permission:configuracion.ver');
    Route::put('/configuracion/tienda', [SettingsController::class, 'actualizarTienda'])->middleware('permission:configuracion.editar');

    // Configuración de pagos
    Route::get('/configuracion/pagos', [SettingsController::class, 'obtenerPagos'])->middleware('permission:configuracion.ver');
    Route::put('/configuracion/pagos', [SettingsController::class, 'actualizarPagos'])->middleware('permission:configuracion.editar');

    // Upload de imágenes para page builder
    Route::post('/upload', [UploadController::class, 'store']);
    Route::delete('/upload', [UploadController::class, 'destroy']);
});