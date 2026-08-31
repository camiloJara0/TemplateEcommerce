# Plan de Desarrollo — Ecommerce Template Reutilizable

## Objetivo

Construir un **ecommerce template** reutilizable sobre **Laravel 9 + Sanctum (API)** que permita adaptarse a distintos negocios (ropa, tecnología, alimentos, repuestos, etc.) **sin rehacer la arquitectura**. La clave de la reutilización es:

- **Nombre genérico de entidades**: nada de "camiseta" ni "teléfono"; todo es `product`, `variant`, `category`.
- **Configuración por tienda** (moneda, impuestos, nombre, colores) en una tabla `settings`, no hardcodeada.
- **Adaptadores** para pagos (`PaymentProvider`), envíos (`ShippingProvider`) y notificaciones.
- **Estados como constantes/enums** centralizados, configurables por negocio.
- **Auditoría y permisos** por rol (ADMIN, VENDEDOR, CLIENTE, OPERADOR_LOGISTICA).

---

## Arquitectura base

```
app/
├── Http/
│   ├── Controllers/Api/V1/...   # Controladores por módulo
│   ├── Requests/...             # Form Requests validados
│   └── Resources/...            # API Resources (transformadores)
├── Models/                      # Eloquent models
├── Services/                    # Lógica de negocio por dominio
│   ├── Payment/                 # Interfaces + adaptadores
│   ├── Shipping/
│   └── Notification/
├── Enums/                       # Estados centralizados
├── Support/                     # Respuestas JSON uniformes, helpers
└── Providers/
```

### Convenciones del template
- Todas las respuestas usan el formato `{ success, message, data }`.
- Todas las rutas van bajo `/api/v1`.
- Cada tabla lleva `timestamps` y soft-deletes donde aplique.
- El `slug` se autogenera desde el nombre.
- Los IDs monetarios usan `decimal(18,2)` (o `bigint` en centavos, decisión de fase de pagos).

---

## Diseño de Base de Datos (versión reutilizable)

### Núcleo / Usuarios
| Tabla | Notas |
|---|---|
| `users` | Se amplía: `telefono`, `email_verified_at`, `ultimo_login` |
| `roles` / `permissions` / `role_user` / `permission_role` / `model_has_permissions` | Permisos por rol (Spatie o esquema custom) |
| `addresses` | Polimórfico `addressable` o clave `user_id` (direcciones de envío/facturación) |
| `verification_codes` | Recuperación de contraseña |
| `audit_logs` | Polimórfico `subject_type`/`subject_id` + usuario, acción, IP, módulo |

### Catálogo
| Tabla | Notas |
|---|---|
| `categories` | Self-referencing: `parent_id` (categorías/subcategorías) |
| `brands` | Marca de producto |
| `products` | Campos base del template (ver lista abajo) |
| `product_variants` | Combinaciones (Color/Talla/Tamaño) con SKU, precio y stock propio |
| `variant_attribute_values` / `variant_attributes` | Atributos dinámicos (sin atarse a Color/Talla) |
| `product_images` | Polimórfico genérico `imageable` |
| `tags` / `product_tag` | Etiquetas |
| `featured_products` o flag `is_featured` | Destacados |

**Campos de `products`**: `id, name, slug, description, sku, price, price_discount, weight, brand_id, category_id, status, is_featured, stock (denormalizado), timestamps, deleted_at`.

### Inventario
| Tabla | Notas |
|---|---|
| `stock_movements` | `product_id`, `variant_id?`, `quantity (+/-)`, `type (ENTRADA/SALIDA/DEVOLUCION/AJUSTE)`, `reason`, `user_id`, `reference_type?` |
| `stock_alerts` | Config de stock mínimo por producto + notificación |

### Compra
| Tabla | Notas |
|---|---|
| `carts` | `user_id nullable` + `session_id` (invitado) |
| `cart_items` | Producto, variante, cantidad |
| `coupons` | `type (PERCENT/FIXED/FREE_SHIPPING)`, `code`, `value`, `min_amount`, `valid_from/until`, `usage_limit`, `used_count` |
| `coupon_user` | Cupones usados por cliente |

### Pedidos / Pagos / Envío
| Tabla | Notas |
|---|---|
| `orders` | `user_id`, `coupon_id`, `subtotal`, `discount`, `shipping_cost`, `tax`, `total`, `status`, `payment_status`, `shipping_status` |
| `order_items` | Snapshot: nombre, SKU, precio, cantidad (no depende del catálogo actual) |
| `order_status_histories` | Historial de cambios de estado |
| `payments` | `order_id`, `provider`, `transaction_id`, `amount`, `status (PENDIENTE/APROBADO/RECHAZADO/REEMBOLSADO)` |
| `refunds` | `payment_id`, `amount`, `reason`, `status` |
| `shipments` | `order_id`, `carrier`, `tracking_number`, `status`, `last_updated` |
| `shipping_methods` | `name`, `cost`, `estimated_days`, `active` |

### Social / Extras
| Tabla | Notas |
|---|---|
| `reviews` | `user_id`, `product_id`, `rating`, `comment`, `status (pendiente/aprobado/rechazado)` |
| `wishlist_items` | `user_id`, `product_id`, `variant_id?` |
| `notifications` / `notification_logs` | En cola: correo, push, whatsapp (opcional) |
| `settings` | Config de tienda: nombre, logo, moneda, impuestos, colores, SEO (clave/valor) |

### Diagrama de relaciones clave
```
users 1—N addresses · 1—N orders · 1—N reviews · 1—N wishlist_items
products 1—N product_variants · 1—N product_images · N—N tags · N—1 categories · N—1 brands
products 1—N stock_movements · 1—N reviews
orders 1—N order_items · 1—1 payments · 1—1 shipments · N—1 coupons
carts (user_id|session_id) 1—N cart_items
```

---

## Fases de desarrollo (alcanzables por sesión de tokens)

> Cada fase es **independiente y verificable**: migraciones + modelos + servicios + rutas + tests básicos. El objetivo es que cada fase se complete en una sola sesión de trabajo.

### Fase 0 — Limpieza y fundación
**Entregable**: template limpio, listo para construir.
- [ ] Eliminar código heredado no relacionado (Equipo, Tarea, Reunion, AIService, etc. — confirmar con el usuario qué se conserva).
- [ ] Limpiar relaciones fantasma del modelo `User`.
- [ ] Crear `app/Support/ApiResponse.php` (helper `success()`/`error()`).
- [ ] Crear `app/Enums/` con constantes: `RoleEnum`, `OrderStatusEnum`, `PaymentStatusEnum`, `ShippingStatusEnum`, `MovementTypeEnum`, `CouponTypeEnum`.
- [ ] Registro de rutas base `/api/v1` + middleware de idioma.
- **Verificar**: `php artisan route:list`, login/register siguen funcionando.

### Fase 1 — Base de datos: usuarios, roles y auditoría
**Entregable**: esquema de seguridad reutilizable.
- [ ] Migraciones: `roles`, `permissions`, pivotes + `role` en `users`.
- [ ] Ampliar `users` (telefono, email_verified_at).
- [ ] Tabla `audit_logs` (polimórfica) + trait `LogsActivity` en modelos.
- [ ] Tabla `verification_codes` (recuperación) — migrar lo existente.
- [ ] Seeders: roles ADMIN/VENDEDOR/CLIENTE/OPERADOR_LOGISTICA + permisos base.
- **Verificar**: seed funciona, `php artisan migrate:fresh --seed`.

### Fase 2 — Catálogo de productos
**Entregable**: CRUD completo de catálogo.
- [ ] Migraciones: `categories`, `brands`, `products`, `product_images`, `tags`, pivotes.
- [ ] Modelos + relaciones + mutadores (`slug` automático).
- [ ] Migración `product_variants` + `variant_attributes` (atributos dinámicos).
- [ ] CRUD API: `ProductController`, `CategoryController`, `BrandController` (con `ApiResource`).
- [ ] Endpoints públicos: catálogo con filtros (categoría, marca, precio, etiqueta), búsqueda, destacados, relacionados.
- [ ] Manejo de imágenes (subida/eliminación).
- **Verificar**: crear producto con variantes e imágenes; listado filtrado.

### Fase 3 — Inventario
**Entregable**: control de stock con historial.
- [ ] Migración `stock_movements` + modelo y relación.
- [ ] Servicio `InventoryService`: `entry()`, `exit()`, `adjust()`, `return()`.
- [ ] `stock` denormalizado en `products`/`product_variants` (recalcular en cada movimiento).
- [ ] Tabla `stock_alerts` + comando/checks de stock mínimo.
- **Verificar**: movimiento ENTRADA/SALIDA actualiza stock; alerta se dispara al bajar del mínimo.

### Fase 4 — Carrito de compras
**Entregable**: carrito persistente (logueado e invitado).
- [ ] Migraciones: `carts`, `cart_items`.
- [ ] Modelos `Cart`, `CartItem` + cálculo de subtotal.
- [ ] Lógica de sesión para invitados (`session_id` del lado cliente).
- [ ] Endpoints: agregar/actualizar/eliminar item, obtener carrito, vaciar.
- [ ] Validaciones de stock disponible.
- **Verificar**: carrito de invitado sobrevive con `session_id`; al loguearse se migra.

### Fase 5 — Direcciones y Checkout
**Entregable**: flujo completo de datos de envío.
- [ ] Migración `addresses` + CRUD de direcciones por usuario.
- [ ] Endpoint checkout: valida carrito, calcula subtotal.
- [ ] Cálculo de envío por `shipping_methods` (peso/destino, fase 8 amplía).
- **Verificar**: crear dirección, generar resumen de pedido con envío.

### Fase 6 — Pedidos
**Entregable**: núcleo transaccional.
- [ ] Migraciones: `orders`, `order_items`, `order_status_histories`.
- [ ] Creación de pedido (snapshot de items, descuentos, impuestos).
- [ ] Máquina de estados: NUEVO → PAGADO → PREPARANDO → ENVIADO → ENTREGADO / CANCELADO / DEVUELTO (validar transiciones).
- [ ] Historial automático de estados + registro en auditoría.
- [ ] Descuento de stock al confirmar pedido.
- **Verificar**: crear pedido completo, transicionar estados, historial consistente.

### Fase 7 — Pagos (adaptadores)
**Entregable**: sistema de pagos plug-and-play.
- [ ] Tabla `payments` + `refunds`.
- [ ] Interfaz `PaymentProvider` + clase base.
- [ ] Adaptadores: `MercadoPagoProvider`, `StripeProvider`, `PayPalProvider`, `WompiProvider` (stubs configurados, al menos uno funcional).
- [ ] Servicio `PaymentService` (factoria de providers) + webhooks.
- [ ] Estados: PENDIENTE/APROBADO/RECHAZADO/REEMBOLSADO → reflejados en `orders.payment_status`.
- **Verificar**: cobro con un provider en sandbox, webhook actualiza estado.

### Fase 8 — Envíos y seguimiento
**Entregable**: seguimiento de envíos multi-carrier.
- [ ] Migraciones: `shipping_methods`, `shipments`.
- [ ] Cálculo de envío avanzado (peso × destino × método).
- [ ] Interfaz `ShippingProvider` (stubs para Servientrega, Coordinadora, DHL, FedEx, Interrapidisimo).
- [ ] Endpoint de tracking: NUEVO → EN_PREPARACION → DESPACHADO → EN_TRANSITO → ENTREGADO.
- **Verificar**: crear shipment con tracking, actualizar estado desde carrier (mock).

### Fase 9 — Cupones y promociones
**Entregable**: descuentos flexibles.
- [ ] Migraciones: `coupons`, `coupon_user`.
- [ ] Servicio `CouponService`: validar código, aplicar %/fijo/envío gratis, límites de uso y fechas.
- [ ] Integración en checkout (recalcular totales).
- **Verificar**: cupones de cada tipo aplican y persisten uso.

### Fase 10 — Reviews y calificaciones
**Entregable**: reseñas con moderación.
- [ ] Migración `reviews` + modelo.
- [ ] Endpoint cliente: crear review (solo compras verificadas).
- [ ] Endpoint admin: aprobar/rechazar/eliminar.
- [ ] Promedio de rating en producto.
- **Verificar**: reseña pendiente → aprobación → rating promedio actualizado.

### Fase 11 — Wishlist / Favoritos
**Entregable**: favoritos por usuario.
- [ ] Migración `wishlist_items` + modelo.
- [ ] Endpoints: agregar/eliminar/listar, mover a carrito.
- **Verificar**: flujo completo favorito → carrito.

### Fase 12 — Notificaciones
**Entregable**: notificaciones por correo y push.
- [ ] Tabla `notification_logs`.
- [ ] `NotificationService`: canal `mail` y canal `push` (web-push ya instalado).
- [ ] Eventos: registro, pedido realizado, pedido enviado, recuperación contraseña, alerta stock.
- [ ] Mails de template parametrizados.
- **Verificar**: envío en cola (log driver) de cada evento.

### Fase 13 — Dashboard administrativo
**Entregable**: KPIs y gráficas para admin.
- [ ] Endpoints de resumen: ventas hoy/mes, pedidos, clientes, productos agotados.
- [ ] Reportes agregados: ventas por día/categoría, top productos, usuarios registrados.
- [ ] Middleware `role:admin` en rutas de dashboard.
- **Verificar**: datos correctos contra seed de demo.

### Fase 14 — Reportes y exportación
**Entregable**: reportes exportables.
- [x] Reportes: ventas, inventario, clientes, productos.
- [x] Exportación CSV (nativo) + PDF (dompdf ya instalado) + Excel (maatwebsite o exportación manual).
- **Verificar**: generar los 3 formatos y descargarlos.

### Fase 15 — Configuración de tienda y SEO
**Entregable**: tienda configurable sin código.
- [x] Tabla `settings` (clave/valor) + CRUD protegido.
- [x] Campos: nombre, logo, moneda, impuestos, colores; SEO (meta title/description/keywords/OG).
- [x] Helper `store_setting()` y middleware de idioma/moneda.
- **Verificar**: cambiar moneda/impuestos se refleja en cálculos.

### Fase 16 — Permisos y auditoría completa
**Entregable**: control de acceso fino.
- [x] Middleware/policy por permiso: crear/editar productos, gestionar pedidos, ver reportes, gestionar usuarios.
- [x] Trazabilidad total: `audit_logs` en todos los módulos (quién, qué, cuándo, IP).
- **Verificar**: vendedor no accede a reportes; cada acción queda auditada.

### Fase 17 — Semillas de demostración, tests y documentación
**Entregable**: template listo para clonar y usar.
- [x] Seeders demo: usuarios por rol, categorías, productos con variantes, pedidos, cupones.
- [x] Tests de humo (Pest/PHPUnit): auth, catálogo, carrito, pedidos, pagos (mocks).
- [x] `README_PLANTILLA.md`: cómo configurar provider, cómo adaptar a un negocio (guía paso a paso).
- [x] `php artisan migrate:fresh --seed` y suite verde.
- **Verificar**: clonar repo → configurar `.env` → correr → template funcional.

---

## Cómo adaptar el template a un nuevo negocio (guía rápida)
1. Cambiar config en `settings` (nombre, moneda, impuestos, colores).
2. Crear categorías/brands desde el panel.
3. Activar el `PaymentProvider` y `ShippingProvider` deseados en config.
4. Crear roles/permisos extra si hace falta.
5. Sin tocar migraciones de estructura: los atributos de variantes son dinámicos.

## Decisiones tomadas
- [x] **Código heredado**: eliminado (Equipos, Tareas, Reuniones, AIService, Push/NotificaciónService, mails y vistas legacy, tests del proyecto anterior).
- [x] **Moneda**: COP por defecto; montos en columnas `decimal(18,2)` (no centavos).
- [ ] **Provider de pago**: pendiente de elegir (Fase 7).
- [x] **Permisos**: esquema custom más simple — tabla `roles` + pivote `role_user`; permisos definidos en `config/permissions.php` (con soporte de comodines `*` y `modulo.*`). Sin paquetes extra.

## Progreso
- [x] **Fase 0 — Limpieza y fundación**: código heredado eliminado, `app/Support/ApiResponse.php`, enums en `app/Enums/`, rutas `/api/v1` con perfil/logout, `UserController` refactorizado. Tests 8/8 OK.
- [x] **Fase 1 — Usuarios, roles y auditoría**: migraciones `roles`, `role_user`, campos `telefono`/`email_verified_at`, `audit_logs` (polimórfica) + trait `LogsActivity`, `verification_codes` + modelo `CodigoVerificacion`, modelos `Role`/`Auditoria`, seeders de roles, middleware `role`/`permission`, `config/permissions.php`. `migrate:fresh --seed` OK.
- [x] **Fase 2 — Catálogo de productos**: migraciones `categories`/`brands`/`products`/`product_images`/`tags`+pivote/`product_variants`/`variant_attributes`, modelos + relaciones, CRUD `ProductController`/`CategoryController`/`BrandController`/`TagController`, `ProductResource`/`CategoryResource`, catálogo público con filtros/búsqueda/destacados/relacionados. Tests 5/5 OK.
- [x] **Fase 3 — Inventario**: migración `stock_movements` + `stock_alerts`, `InventoryService` (entrada/salida/ajuste/devolución), `stock` denormalizado en `products`/`product_variants`, `InventoryController` (movimientos, alertas de stock mínimo). Tests 4/4 OK.
- [x] **Fase 4 — Carrito**: migraciones `carts`/`cart_items`, modelos `Cart`/`CartItem` + subtotal, soporte `session_id` para invitados, migración a carrito autenticado, endpoints agregar/actualizar/eliminar/obtener/vaciar con validación de stock. Tests 5/5 OK.
- [x] **Fase 5 — Direcciones y checkout**: migración `addresses` + CRUD por usuario, `shipping_methods`, `CheckoutService`/`CheckoutController` (preview calcula subtotal/envío/impuestos/total). Endpoints de direcciones y preview de checkout.
- [x] **Fase 6 — Pedidos**: migraciones `orders`/`order_items`/`order_status_histories`, `OrderService` (creación desde carrito con snapshot, descuento de stock, historial), máquina de estados validada (NUEVO→PAGADO→PREPARANDO→ENVIADO→ENTREGADO/CANCELADO/DEVUELTO), `OrderController`/`OrderResource`. Tests 3/3 OK.
- [x] **Fase 7 — Pagos**: migraciones `payments`/`refunds`, interfaz `PaymentProvider` + clase base, `PaymentService` (factoria + webhooks + reembolsos), adaptadores `StripeProvider`/`MercadoPagoProvider` (HTTP real) y `PayPalProvider`/`WompiProvider` (stubs que lanzan `PaymentException`), `PaymentController`/`WebhookController`. Estados reflejados en `orders.payment_status`. Tests 4/4 OK.
- [x] **Fase 8 — Envíos y seguimiento**: migración `shipments`, interfaz `ShippingProvider` + clase base + stubs (Servientrega, Coordinadora, DHL, FedEx, Interrapidisimo), `ShippingService` (factoria, cotizar, crearEnvio, tracking, estados), `ShipmentController` con tracking público y actualización de estado. Estados NUEVO→EN_PREPARACION→DESPACHADO→EN_TRANSITO→ENTREGADO reflejados en `orders.shipping_status`. Tests 5/5 OK.
- [x] **Fase 9 — Cupones y promociones**: migraciones `coupons`/`coupon_user`, modelo `Coupon`, `CouponService` (validar, %/fijo/envío gratis, límites de uso y fechas), `CouponController` (CRUD admin + aplicar cliente), integración en checkout (descuento, impuestos, total) y persistencia de uso en `OrderService`. Tests 6/6 OK.
- [x] **Fase 10 — Reviews y calificaciones**: migración `reviews` + `rating_avg`/`reviews_count` en `products`, `ReviewService` (solo compras entregadas, aprobar/rechazar, recálculo de promedio), `ReviewController` (cliente crea, admin modera, públicas solo aprobadas). Tests 4/4 OK.
- [x] **Fase 11 — Wishlist / Favoritos**: migración `wishlist_items`, modelo `WishlistItem`, `WishlistController` (agregar/eliminar/listar sin duplicados + mover a carrito). Tests 4/4 OK.
- [x] **Fase 12 — Notificaciones**: migraciones `notification_logs`/`push_subscriptions`, `NotificationService` (canales mail/database/push/log), `PushService` (web-push), mail `NotificacionMail` + template, eventos hookeados (registro, pedido creado, pedido enviado, recuperación, alerta stock), `NotificationController` (listar + suscribir/desuscribir push). Tests 3/3 OK.
- [x] **Fase 13 — Dashboard administrativo**: `DashboardController` (KPIs: ventas hoy/mes, pedidos, clientes, agotados, stock bajo; reportes: ventas por día/categoría, top productos, usuarios registrados), protegido con `permission:reportes.ver`. Tests 5/5 OK.
- [x] **Fase 14 — Reportes y exportación**: `ReportController` (ventas/inventario/clientes/productos con filtros y totales), `ExportService` (CSV nativo, PDF con dompdf + vista `pdf.reporte`, Excel manual sin librería), rutas admin con `permission:reportes.ver`. Tests 7/7 OK.
- [x] **Fase 15 — Configuración de tienda y SEO**: migración `settings`, modelo `Setting` (obtener/establecer), `SettingsController` (leer/actualizar admin + `configuracion/publica` para la landing), helpers `store_setting()`/`store_currency()`/`store_tax_rate()`, middleware `store.locale`, `CheckoutService` lee impuestos/moneda de settings. Tests 4/4 OK.
- [x] **Fase 16 — Permisos y auditoría completa**: trait `LogsActivity` aplicado a todos los modelos de negocio (productos, pedidos, pagos, envíos, cupones, reviews, configuración, etc.) → auditoría automática en `audit_logs` (quién, qué, módulo, IP) solo con usuario autenticado; `Auditoria::detectarModulo` ampliado con todos los módulos; vendedor sin acceso a reportes ni configuración. Tests 5/5 OK.
- [x] **Fase 17 — Semillas demo, tests y documentación**: `SettingsSeeder` + `DemoDataSeeder` (usuarios por rol, categorías, marcas, etiquetas, productos con variantes e imágenes, métodos de envío, cupones, pedidos, reseñas), `README_PLANTILLA.md`, `API_DOCUMENTACION.md`, `FLUJO_APP.md`. `migrate:fresh --seed` OK.
- [x] **Fases 0 a 17 implementadas**: suite completa en verde, **72 tests pasando** (`php artisan test`).

## Decisiones pendientes (para confirmar en fases restantes)
- [ ] Pagos: ¿cuál provider se integra de verdad primero (recomendado: Stripe sandbox o MercadoPago)?
- [ ] ¿Se usan soft-deletes en todos los módulos de catálogo?
