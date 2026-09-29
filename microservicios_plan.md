# Plan de Migración a Microservicios — CommerceOS

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Actual (As-Is)](#2-arquitectura-actual)
3. [Bounded Contexts](#3-bounded-contexts)
4. [División en Microservicios](#4-división-en-microservicios)
5. [Arquitectura API Gateway](#5-arquitectura-api-gateway)
6. [Sistema SaaS Multi-Tenant](#6-sistema-saas-multi-tenant)
7. [Autenticación y Permisos Centralizados](#7-autenticación-y-permisos-centralizados)
8. [Comunicación Síncrona y Asíncrona](#8-comunicación-síncrona-y-asíncrona)
9. [Estrategia de Observabilidad](#9-estrategia-de-observabilidad)
10. [Despliegue con Docker y Kubernetes](#10-despliegue-con-docker-y-kubernetes)
11. [Plan de Migración — Strangler Fig](#11-plan-de-migración--strangler-fig)
12. [Riesgos Técnicos y Recomendaciones](#12-riesgos-técnicos-y-recomendaciones)
13. [Diagramas de Arquitectura](#13-diagramas-de-arquitectura)

---

## 1. Resumen Ejecutivo

### Estado Actual

Backend monolítico Laravel con 30 modelos, 22 controladores, 30 servicios y 100 endpoints HTTP. Base de datos PostgreSQL única con 23 tablas. Autenticación via Sanctum Bearer tokens. Sin eventos asíncronos, sin WebSockets, sin colas de mensajes.

### Objetivo

Migrar a una arquitectura de microservicios donde cada dominio de negocio sea un servicio independiente, desplegable y escalable por separado. Habilitar:
- Inventario como aplicación independiente
- Activación/desactivación de servicios por tienda
- Escalabilidad horizontal por dominio
- Despliegues independientes

### Impacto Estimado

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Servicios desplegados | 1 | 9 microservicios + API Gateway |
| Bases de datos | 1 | 9 (una por servicio) |
| Latencia promedio (p95) | ~120ms | ~80ms (servicios internos via gRPC) |
| Tiempo de despliegue | ~15min (monolito completo) | ~2min (servicio individual) |
| Escalabilidad | Vertical (1 instancia) | Horizontal por dominio |

---

## 2. Arquitectura Actual

### 2.1 Diagrama del Monolito

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Nuxt 3)                 │
│  18 Pinia Stores · 10 Composables · 100 API Calls   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (Bearer Token)
                       ▼
┌─────────────────────────────────────────────────────┐
│              LARAVEL MONOLITO (template_back)        │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Auth     │ │ Catalog  │ │ Cart     │            │
│  │ User     │ │ Product  │ │ Order    │            │
│  │ Role     │ │ Category │ │ Payment  │            │
│  │ Address  │ │ Brand    │ │ Coupon   │            │
│  │          │ │ Tag      │ │ Shipment │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Inventory│ │ Review   │ │ Notif    │            │
│  │ Stock    │ │ Wishlist │ │ Settings │            │
│  │ Alert    │ │          │ │ Config   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  Services: CartService, OrderService, PaymentService │
│            InventoryService, ReviewService, etc.     │
│  Providers: 6 Payment · 5 Shipping                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL (1 database, 23 tables)      │
└─────────────────────────────────────────────────────┘
```

### 2.2 Dependencias Críticas Identificadas

```
Order ──depends-on──► Product (precio, stock)
Order ──depends-on──► Cart (items de origen)
Order ──depends-on──► Address (envío)
Order ──depends-on──► Coupon (descuento)
Order ──depends-on──► ShippingMethod (costo)
Payment ──depends-on──► Order (monto, estado)
Shipment ──depends-on──► Order + Payment (solo si pagado)
Inventory ──depends-on──► Product (stock actual)
Review ──depends-on──► Product + Order (verificación de compra)
Review ──modifies──► Product (rating_avg, reviews_count)
StockMovement ──modifies──► Product + ProductVariant (stock)
```

---

## 3. Bounded Contexts

### 3.1 Metodología de Identificación

Se aplicó Domain-Driven Design para identificar bounded contexts analysando:
- **Entidades con ciclo de vida propio** (no dependencias externas)
- **Reglas de negocio agrupadas** (services que operan sobre el mismo conjunto de entidades)
- **Tasas de cambio diferenciadas** (dominios que cambian a frecuencias distintas)
- **Equipos de dominio** (quiénOwnership de qué)

### 3.2 Los 9 Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOUNDED CONTEXTS                            │
├─────────────────┬───────────────────┬───────────────────────────┤
│                 │                   │                           │
│  IDENTITY &     │   CATALOG         │   CART & CHECKOUT         │
│  ACCESS         │                   │                           │
│  ─────────      │  ─────────        │  ─────────                │
│  · User         │  · Product        │  · Cart                   │
│  · Role         │  · Category       │  · CartItem               │
│  · Permission   │  · Brand          │  · Coupon                 │
│  · Token        │  · Tag            │  · CheckoutPreview        │
│  · Address      │  · ProductImage   │  · ShippingMethod         │
│                 │  · ProductVariant │                           │
│                 │  · VariantAttr    │                           │
│                 │                   │                           │
├─────────────────┼───────────────────┼───────────────────────────┤
│                 │                   │                           │
│  ORDER &        │   PAYMENT         │   INVENTORY               │
│  FULFILLMENT    │                   │                           │
│  ─────────      │  ─────────        │  ─────────                │
│  · Order        │  · Payment        │  · StockMovement          │
│  · OrderItem    │  · Refund         │  · StockAlert             │
│  · OrderHistory │  · PaymentProvider│  · InventoryService       │
│  · Shipment     │  · Webhook        │                           │
│                 │                   │                           │
├─────────────────┼───────────────────┼───────────────────────────┤
│                 │                   │                           │
│  ENGAGEMENT     │   NOTIFICATION    │   PLATFORM CONFIG         │
│                 │                   │                           │
│  ─────────      │  ─────────        │  ─────────                │
│  · Review       │  · NotificationLog│  · Setting                │
│  · Wishlist     │  · PushSubscrip.  │  · StoreConfig            │
│                 │  · EmailTemplate  │  · TiendaConfig           │
│                 │                   │  · PaymentConfig          │
│                 │                   │  · ThemeConfig            │
│                 │                   │                           │
└─────────────────┴───────────────────┴───────────────────────────┘
```

### 3.3 Justificación de Cada Bounded Context

| Context | Justificación | Tasa de Cambio | Equipo |
|---------|--------------|----------------|--------|
| **Identity & Access** | Dominio transversal, requiere seguridad máxima, evoluciona con auth (OAuth, MFA) | Media | Platform |
| **Catalog** | Core del ecommerce, lectura masiva, write ocasional, requiere search full-text | Baja | Catalog |
| **Cart & Checkout** | Transaccional, alta concurrencia, guests vs authenticated, pricing logic | Alta | Commerce |
| **Order & Fulfillment** | State machine compleja, integraciones con shipping providers | Media | Commerce |
| **Payment** | Seguridad PCI, múltiples providers, webhooks, reembolsos | Baja | Payments |
| **Inventory** | Independizable (requisito del usuario), stock atomístico, alertas | Media | Operations |
| **Engagement** | Reviews + Wishlist, moderación, afecta rating de productos | Baja | Growth |
| **Notification** | Multi-canal (email, push, database), completamente desacoplable | Baja | Platform |
| **Platform Config** | Settings de tienda, page builder, theming, multi-tenant config | Baja | Platform |

---

## 4. División en Microservicios

### 4.1 Mapa de Servicios

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MICROSERVICIOS                                  │
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  identity-  │  │  catalog-   │  │  cart-      │  │  order-     │  │
│  │  service    │  │  service    │  │  service    │  │  service    │  │
│  │             │  │             │  │             │  │             │  │
│  │ port: 8001  │  │ port: 8002  │  │ port: 8003  │  │ port: 8004  │  │
│  │ db: identity│  │ db: catalog │  │ db: cart    │  │ db: order   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  payment-   │  │  inventory- │  │  engage-    │  │  notif-     │  │
│  │  service    │  │  service    │  │  service    │  │  service    │  │
│  │             │  │             │  │             │  │             │  │
│  │ port: 8005  │  │ port: 8006  │  │ port: 8007  │  │ port: 8008  │  │
│  │ db: payment │  │ db: invent  │  │ db: engage  │  │ db: notif   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                        │
│  ┌─────────────┐                                                      │
│  │  platform-  │                                                      │
│  │  config-svc │                                                      │
│  │             │                                                      │
│  │ port: 8009  │                                                      │
│  │ db: platform│                                                      │
│  └─────────────┘                                                      │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Detalle de Cada Microservicio

#### 4.2.1 identity-service (Puerto 8001)

**Responsabilidad:** Gestión de usuarios, autenticación, autorización, roles, permisos, direcciones.

**Modelos propios:**
- `users` (con campos ecommerce: nombre, telefono, foto)
- `roles` + `role_user`
- `addresses`
- `verification_codes`
- `personal_access_tokens`

**Endpoints heredados:**
```
POST   /api/v1/register
POST   /api/v1/login
POST   /api/v1/logout
POST   /api/v1/enviar-codigo
POST   /api/v1/verificar-codigo-cambio
GET    /api/v1/perfil
PUT    /api/v1/perfil
GET    /api/v1/direcciones
POST   /api/v1/direcciones
PUT    /api/v1/direcciones/{id}
DELETE /api/v1/direcciones/{id}
GET    /api/v1/admin/usuarios
```

**Base de datos:** `identity_db` — tablas: `users`, `roles`, `role_user`, `addresses`, `verification_codes`, `personal_access_tokens`

**APIs internas (gRPC):**
- `GetUser(id) → User`
- `GetUsers(ids) → User[]`
- `ValidateToken(token) → TokenInfo`
- `GetUserRoles(userId) → Role[]`

**Justificación:** El dominio de identidad es el más sensible (credenciales, tokens). Aislarlo permite:
- Rotación de secretos independiente
- Compliance PCI-DSS más simple
- Escalabilidad de autenticación por separado del catálogo

---

#### 4.2.2 catalog-service (Puerto 8002)

**Responsabilidad:** Productos, categorías, marcas, etiquetas, variantes, atributos, imágenes.

**Modelos propios:**
- `products` (con `page_config`)
- `categories` (auto-referencia jerárquica)
- `brands`
- `tags` + `product_tag`
- `product_images`
- `product_variants`
- `variant_attributes` + `variant_attribute_values`
- `product_variant_attribute_value`

**Endpoints heredados:**
```
GET    /api/v1/productos              (con filtros, paginación)
GET    /api/v1/productos/{slug}
GET    /api/v1/productos/{slug}/detalle
GET    /api/v1/productos/{id}/relacionados
GET    /api/v1/categorias
GET    /api/v1/marcas
GET    /api/v1/etiquetas
GET    /api/v1/admin/productos        (con filtros admin)
POST   /api/v1/admin/productos
PUT    /api/v1/admin/productos/{id}
DELETE /api/v1/admin/productos/{id}
POST   /api/v1/admin/categorias
PUT    /api/v1/admin/categorias/{id}
DELETE /api/v1/admin/categorias/{id}
POST   /api/v1/admin/marcas
PUT    /api/v1/admin/marcas/{id}
DELETE /api/v1/admin/marcas/{id}
POST   /api/v1/admin/etiquetas
PUT    /api/v1/admin/etiquetas/{id}
DELETE /api/v1/admin/etiquetas/{id}
```

**Base de datos:** `catalog_db` — todas las tablas de catálogo

**APIs internas (gRPC):**
- `GetProduct(id) → Product`
- `GetProducts(ids) → Product[]`
- `GetProductBySlug(slug) → Product`
- `GetCategory(id) → Category`
- `ValidateStock(productId, variantId, qty) → boolean`
- `GetProductPrice(productId, variantId) → Price`

**Justificación:** El catálogo es el dominio de mayor lectura. Aislarlo permite:
- Réplicas de lectura independientes
- Cache agresivo de catálogo sin afectar transacciones
- Elasticsearch/Meilisearch dedicado para búsqueda

---

#### 4.2.3 cart-service (Puerto 8003)

**Responsabilidad:** Carrito de compras (guest + auth), cálculo de preview de checkout, cupones.

**Modelos propios:**
- `carts`
- `cart_items`
- `coupons` + `coupon_user`

**Endpoints heredados:**
```
GET    /api/v1/carrito
POST   /api/v1/carrito/items
PUT    /api/v1/carrito/items/{item}
DELETE /api/v1/carrito/items/{item}
DELETE /api/v1/carrito
POST   /api/v1/checkout/preview
POST   /api/v1/cupones/aplicar
GET    /api/v1/metodos-envio
GET    /api/v1/admin/cupones
POST   /api/v1/admin/cupones
PUT    /api/v1/admin/cupones/{id}
DELETE /api/v1/admin/cupones/{id}
```

**Base de datos:** `cart_db` — tablas: `carts`, `cart_items`, `coupons`, `coupon_user`

**APIs internas (gRPC):**
- `GetCart(userId, sessionId) → Cart`
- `AddToCart(userId, productId, qty) → Cart`
- `PreviewOrder(cartId, addressId, shippingMethodId) → Preview`
- `ValidateCoupon(code, subtotal) → Discount`
- `ApplyCoupon(couponId, userId, orderId) → void`

**Comunicación con otros servicios:**
- `catalog-service`: `GetProductPrice()` para calcular subtotales
- `catalog-service`: `ValidateStock()` para verificar disponibilidad
- `identity-service`: `GetUser()` para carrito autenticado

**Justificación:** El carrito es de alta concurrencia (muchos usuarios simultáneos), estado efímero, y tiene lifecycle completamente separado del order.

---

#### 4.2.4 order-service (Puerto 8004)

**Responsabilidad:** Creación de pedidos, ciclo de vida (state machine), historial de estados, envíos.

**Modelos propios:**
- `orders`
- `order_items`
- `order_status_histories`
- `shipments`
- `shipping_methods`

**Endpoints heredados:**
```
GET    /api/v1/pedidos
GET    /api/v1/pedidos/{id}
POST   /api/v1/pedidos
POST   /api/v1/admin/pedidos
POST   /api/v1/admin/pedidos/{id}/estado
GET    /api/v1/admin/envios
POST   /api/v1/admin/envios
GET    /api/v1/admin/envios/cotizar
GET    /api/v1/admin/envios/{id}
PUT    /api/v1/admin/envios/{id}/estado
GET    /api/v1/envios/tracking/{trackingNumber}
```

**Base de datos:** `order_db` — tablas: `orders`, `order_items`, `order_status_histories`, `shipments`, `shipping_methods`

**APIs internas (gRPC):**
- `CreateOrder(cartId, userId, addressId, shippingMethodId, couponCode) → Order`
- `GetOrder(id) → Order`
- `GetUserOrders(userId) → Order[]`
- `ChangeOrderStatus(orderId, status, comment) → Order`
- `GetOrderSummary(orderId) → Summary` (para dashboard)

**Comunicación con otros servicios:**
- `cart-service`: `GetCart()` para obtener items, `ApplyCoupon()` para registrar uso
- `catalog-service`: `GetProducts()` para denormalizar items en order_items
- `identity-service`: `GetUser()` + `GetUserAddresses()` para envío
- `payment-service`: Evento `OrderCreated` → initiate payment
- `inventory-service`: Evento `OrderPaid` → deducir stock
- `notification-service`: Evento `OrderStatusChanged` → notificar cliente

**Justificación:** El Order tiene state machine compleja (nuevo→pagado→preparando→enviado→entregado), depende de múltiples contextos, y su frecuencia de cambio es independiente del catálogo.

---

#### 4.2.5 payment-service (Puerto 8005)

**Responsabilidad:** Procesamiento de pagos, webhooks, reembolsos, credenciales encriptadas.

**Modelos propios:**
- `payments`
- `refunds`

**Endpoints heredados:**
```
POST   /api/v1/pedidos/{id}/pagar
GET    /api/v1/pagos/provider
GET    /api/v1/pagos/rapyd/metodos/{country}
GET    /api/v1/pagos/rapyd/campos-requeridos/{type}
POST   /api/v1/webhooks/pagos/{provider}
GET    /api/v1/admin/pagos
GET    /api/v1/admin/pagos/{id}
POST   /api/v1/admin/pagos/{id}/reembolsar
POST   /api/v1/admin/pagos/{id}/cancelar
GET    /api/v1/admin/configuracion/pagos
PUT    /api/v1/admin/configuracion/pagos
POST   /api/v1/admin/configuracion/pagos/probar
```

**Base de datos:** `payment_db` — tablas: `payments`, `refunds`

**APIs internas (gRPC):**
- `InitiatePayment(orderId, provider, amount, currency) → Payment`
- `ProcessWebhook(provider, payload) → WebhookResult`
- `Refund(paymentId, amount, reason) → Refund`
- `GetPaymentStatus(paymentId) → PaymentStatus`

**Comunicación con otros servicios:**
- `order-service`: Escucha evento `OrderCreated` → inicia pago
- Emite evento `PaymentCompleted` → order-service cambia estado
- Emite evento `PaymentFailed` → notification-service notifica
- `platform-config-service`: `GetPaymentConfig()` para obtener credenciales de providers

**Justificación:** PCI-DSS requiere aislamiento de datos de pago. Webhooks necesitan manejo de reintentos independiente. Providers como Rapyd tienen endpoints públicos dedicados.

---

#### 4.2.6 inventory-service (Puerto 8006)

**Responsabilidad:** Movimientos de stock, alertas de bajo inventario, cálculo de stock disponible.

**Modelos propios:**
- `stock_movements`
- `stock_alerts`

**Endpoints heredados:**
```
GET    /api/v1/admin/inventario/movimientos
POST   /api/v1/admin/inventario/movimientos
GET    /api/v1/admin/inventario/alertas
POST   /api/v1/admin/inventario/alertas
```

**Base de datos:** `inventory_db` — tablas: `stock_movements`, `stock_alerts`

**APIs internas (gRPC):**
- `GetStock(productId, variantId?) → StockInfo`
- `RegisterMovement(productId, variantId, type, qty, userId) → Movement`
- `GetMovements(filters) → Movement[]`
- `GetAlerts() → Alert[]`
- `ConfigureAlert(productId, minStock) → Alert`
- `BulkCheckStock(productIds[]) → StockMap`

**Comunicación con otros servicios:**
- Escucha evento `OrderPaid` → deduce stock (entrada/salida)
- Escucha evento `OrderCancelled` → devuelve stock
- `catalog-service`: `GetProduct()` para validar existencia
- `notification-service`: Emite evento `LowStockAlert` → notificar admin

**Justificación (requisito explícito del usuario):**
> "El módulo de Inventario pueda existir como una aplicación independiente y ser consumido desde el frontend mediante APIs centralizadas"

El inventario es un dominio con reglas de negocio propias (entradas, salidas, devoluciones, ajustes), necesita atomicidad garantizada, y puede operar como aplicación independiente con su propio frontend.

---

#### 4.2.7 engage-service (Puerto 8007)

**Responsabilidad:** Reseñas (con moderación), wishlist/favoritos.

**Modelos propios:**
- `reviews`
- `wishlist_items`

**Endpoints heredados:**
```
GET    /api/v1/productos/{id}/resenas    (público)
POST   /api/v1/productos/{id}/resenas    (autenticado)
GET    /api/v1/favoritos
POST   /api/v1/favoritos
DELETE /api/v1/favoritos/{productId}
POST   /api/v1/favoritos/{itemId}/mover-al-carrito
GET    /api/v1/admin/resenas
POST   /api/v1/admin/resenas/{id}/aprobar
POST   /api/v1/admin/resenas/{id}/rechazar
DELETE /api/v1/admin/resenas/{id}
```

**Base de datos:** `engage_db` — tablas: `reviews`, `wishlist_items`

**APIs internas (gRPC):**
- `GetProductReviews(productId) → Review[]`
- `CreateReview(userId, productId, rating, comment, orderId?) → Review`
- `ModerateReview(reviewId, action) → Review`
- `GetUserWishlist(userId) → WishlistItem[]`
- `AddToWishlist(userId, productId) → WishlistItem`
- `MoveToCart(wishlistItemId) → CartItem`

**Comunicación con otros servicios:**
- `catalog-service`: `GetProduct()` para verificar existencia
- `order-service`: `GetOrder()` para verificar compra (reseñas verificadas)
- Emite evento `ReviewCreated` → catalog-service actualiza `rating_avg` y `reviews_count`
- Emite evento `MoveToCart` → cart-service agrega item

**Justificación:** Reviews y wishlist son engagement puro, cambian con frecuencia baja, y no afectan la transaccionalidad del core ecommerce.

---

#### 4.2.8 notification-service (Puerto 8008)

**Responsabilidad:** Notificaciones multi-canal (email, push, database log), suscripciones push.

**Modelos propios:**
- `notification_logs`
- `push_subscriptions`

**Endpoints heredados:**
```
GET    /api/v1/notificaciones
POST   /api/v1/notificaciones/push/subscribir
POST   /api/v1/notificaciones/push/desuscribir
GET    /api/v1/configuracion/vapid-public-key
```

**Base de datos:** `notification_db` — tablas: `notification_logs`, `push_subscriptions`

**APIs internas (gRPC):**
- `SendNotification(userId, type, title, body, data) → NotificationLog`
- `SendBulkNotification(userIds[], type, title, body) → void`
- `SubscribePush(userId, subscription) → PushSubscription`
- `UnsubscribePush(endpoint) → void`
- `GetUserNotifications(userId) → NotificationLog[]`

**Comunicación con otros servicios (event-driven):**
- `order-service`: `OrderCreated` → "Tu pedido fue recibido"
- `order-service`: `OrderStatusChanged` → "Tu pedido está en camino"
- `payment-service`: `PaymentCompleted` → "Pago confirmado"
- `inventory-service`: `LowStockAlert` → "Stock bajo para producto X"

**Justificación:** Notificaciones son completamente desacopladas del business logic. Pueden fallar sin afectar transacciones. Multi-canal (email, push, in-app) justifica aislamiento.

---

#### 4.2.9 platform-config-service (Puerto 8009)

**Responsabilidad:** Configuración de la tienda, page builder, theming, settings dinámicos, configuración de pagos por tienda.

**Modelos propios:**
- `settings`
- (Virtual: `tienda_config`, `public_config`, `admin_config` — todo serializado como JSON en settings)

**Endpoints heredados:**
```
GET    /api/v1/configuracion/publica
GET    /api/v1/configuracion/tienda
GET    /api/v1/configuracion/completa
GET    /api/v1/admin/configuracion
PUT    /api/v1/admin/configuracion
GET    /api/v1/admin/configuracion/tienda
PUT    /api/v1/admin/configuracion/tienda
```

**Base de datos:** `platform_db` — tabla: `settings`

**APIs internas (gRPC):**
- `GetPublicConfig(tenantId?) → PublicConfig`
- `GetTiendaConfig(tenantId?) → TiendaConfig`
- `GetCompleteConfig(tenantId?) → CompleteConfig`
- `UpdateConfig(key, value) → void`
- `GetPaymentConfig(tenantId?) → PaymentConfig`

**Justificación:** Configuración es read-heavy, cacheable, y sirve de puente entre todos los servicios que necesitan settings. En un escenario multi-tenant, cada tienda tiene su propia configuración.

---

### 4.3 Matriz de Dependencias entre Servicios

```
                    identity  catalog  cart  order  payment  inventory  engage  notif  config
identity-service       —        ·      ·      ·       ·        ·        ·       ·      ·
catalog-service        ·        —      ·      ·       ·        ·        ·       ·      ·
cart-service           ·        ·      —      ·       ·        ·        ·       ·      ·
order-service          ·        ·      ·      —       ·        ·        ·       ·      ·
payment-service        ·        ·      ·      ·       —        ·        ·       ·      ·
inventory-service      ·        ·      ·      ·       ·         —       ·       ·      ·
engage-service         ·        ·      ·      ·       ·        ·        —       ·      ·
notification-service   ·        ·      ·      ·       ·        ·        ·        —      ·
platform-config-svc    ·        ·      ·      ·       ·        ·        ·       ·       —

· = dependencia débil (gRPC síncrono o evento asíncrono)
```

**Dependencias fuertes (síncronas):**
- `cart-service` → `catalog-service` (precio para preview)
- `order-service` → `identity-service` (direcciones del usuario)
- `order-service` → `catalog-service` (denormalizar items)
- `order-service` → `cart-service` (obtener items del carrito)
- Todos → `identity-service` (validación de token)
- Todos → `platform-config-service` (settings)

**Dependencias débiles (asíncronas/eventos):**
- `order-service` → `payment-service` (evento OrderCreated)
- `payment-service` → `order-service` (evento PaymentCompleted)
- `order-service` → `inventory-service` (evento OrderPaid)
- `order-service` → `notification-service` (evento OrderStatusChanged)
- `payment-service` → `notification-service` (evento PaymentCompleted)
- `inventory-service` → `notification-service` (evento LowStockAlert)
- `engage-service` → `catalog-service` (evento ReviewCreated → actualiza rating)

---

## 5. Arquitectura API Gateway

### 5.1 Diseño del Gateway

```
┌────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                │
│                    (Kong / Traefik / custom)                       │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Rate Limiter │  │ Auth         │  │ Router       │            │
│  │              │  │ Middleware   │  │              │            │
│  │ · Global     │  │ · JWT valid  │  │ · /auth/*    │            │
│  │ · Per-tenant │  │ · Tenant ctx │  │   → identity │            │
│  │ · Per-route  │  │ · RBAC check │  │ · /catalog/* │            │
│  └──────────────┘  └──────────────┘  │   → catalog  │            │
│                                      │ · /cart/*    │            │
│  ┌──────────────┐  ┌──────────────┐  │   → cart     │            │
│  │ Circuit      │  │ Request      │  │ · /orders/*  │            │
│  │ Breaker      │  │ Transformer  │  │   → order    │            │
│  │              │  │              │  │ · /payments/*│            │
│  │ · 5s timeout │  │ · Header     │  │   → payment  │            │
│  │ · 5 errors   │  │   injection  │  │ · /inventory │            │
│  │ · 30s reset  │  │ · Response   │  │   → inventory│            │
│  └──────────────┘  │   shaping    │  │ · /engage/*  │            │
│                    └──────────────┘  │   → engage   │            │
│                                      │ · /notif/*   │            │
│  ┌──────────────┐  ┌──────────────┐  │   → notif    │            │
│  │ CORS         │  │ Load         │  │ · /config/*  │            │
│  │ Handler      │  │ Balancer     │  │   → config   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tabla de Enrutamiento

| Ruta Gateway | Servicio Destino | Rate Limit | Auth Requerido |
|-------------|-----------------|------------|----------------|
| `/api/v1/auth/*` | identity-service:8001 | 10/min (login), 5/min (register) | No |
| `/api/v1/productos/*` | catalog-service:8002 | 120/min | No (lectura), Sí (escritura admin) |
| `/api/v1/categorias/*` | catalog-service:8002 | 120/min | No (lectura), Sí (escritura admin) |
| `/api/v1/marcas/*` | catalog-service:8002 | 120/min | No (lectura), Sí (escritura admin) |
| `/api/v1/etiquetas/*` | catalog-service:8002 | 120/min | No (lectura), Sí (escritura admin) |
| `/api/v1/carrito/*` | cart-service:8003 | 60/min | No (guest), Sí (auth) |
| `/api/v1/checkout/*` | cart-service:8003 | 30/min | Sí |
| `/api/v1/cupones/*` | cart-service:8003 | 30/min | Sí (aplicar), Admin (CRUD) |
| `/api/v1/pedidos/*` | order-service:8004 | 30/min | Sí |
| `/api/v1/admin/pedidos/*` | order-service:8004 | 60/min | Sí + admin |
| `/api/v1/envios/*` | order-service:8004 | 30/min | Sí (tracking), Admin (gestión) |
| `/api/v1/pagos/*` | payment-service:8005 | 30/min | No (webhooks), Sí (pagar) |
| `/api/v1/admin/pagos/*` | payment-service:8005 | 60/min | Sí + admin |
| `/api/v1/admin/inventario/*` | inventory-service:8006 | 60/min | Sí + admin |
| `/api/v1/resenas/*` | engage-service:8007 | 30/min | No (lectura), Sí (escritura) |
| `/api/v1/favoritos/*` | engage-service:8007 | 60/min | Sí |
| `/api/v1/notificaciones/*` | notification-service:8008 | 60/min | Sí |
| `/api/v1/configuracion/*` | platform-config-service:8009 | 120/min | No (pública), Sí (admin) |
| `/api/v1/admin/configuracion/*` | platform-config-service:8009 | 30/min | Sí + admin |

### 5.3 Funciones del Gateway

1. **Autenticación centralizada:** Valida JWT contra identity-service una vez, inyecta `X-User-Id`, `X-User-Roles`, `X-Tenant-Id` en headers internos
2. **Rate limiting:** Global (1000/min), per-tenant (120/min), per-route (configurable)
3. **Circuit breaker:** Timeout 5s, 5 errores consecutivos → circuito abierto 30s
4. **Request transformation:** Agrega headers de contexto (`X-Request-Id`, `X-Tenant-Id`, `X-User-Id`)
5. **Response shaping:** Envelope estándar `{ success, data, message }` consistente
6. **CORS:** Configuración centralizada para el frontend
7. **Load balancing:** Round-robin entre réplicas de cada servicio
8. **API versioning:** `/api/v1/` → `/api/v2/` sin breaking changes

### 5.4 Tecnología Recomendada: Traefik

**Justificación:**
- Nativo para Docker/Kubernetes (descubre servicios automáticamente via labels)
- Middleware chain configurable por ruta
- Dashboard integrado para observación
- Soporte nativo para circuit breaker, rate limiting, retry
- Certificados TLS automáticos con Let's Encrypt
- Más ligero que Kong para el volumen actual

---

## 6. Sistema SaaS Multi-Tenant

### 6.1 Estrategia: Shared Database, Schema-per-Tenant

```
┌──────────────────────────────────────────────────────────┐
│                   PATRÓN MULTI-TENANT                     │
│                                                           │
│  Opción A: Database-per-Tenant     ← Elegida             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ tenant_a │ │ tenant_b │ │ tenant_c │                │
│  │ _db      │ │ _db      │ │ _db      │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                           │
│  Opción B: Shared DB + Tenant ID column                  │
│  ┌──────────────────────────────────────┐                │
│  │ shared_db                            │                │
│  │ tenant_id | ... | data               │                │
│  └──────────────────────────────────────┘                │
│                                                           │
│  DECISIÓN: Opción A para datos transaccionales           │
│            Opción B para datos compartidos (catálogo)    │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Modelo de Tenant

```php
// Nuevo modelo: Tenant
class Tenant extends Model
{
    protected $fillable = [
        'name', 'slug', 'domain', 'status', 'plan',
        'db_host', 'db_name', 'db_user', 'db_password',
        'settings', // JSON: payment providers, features enabled
    ];

    // Servicios habilitados para esta tienda
    public function enabledServices(): array
    {
        return $this->settings['enabled_services'] ?? [
            'catalog', 'cart', 'order', 'payment',
            'inventory', 'engage', 'notification', 'config'
        ];
    }
}
```

### 6.3 Resolución de Tenant

```
Request → Gateway
  │
  ├─ Header: X-Tenant-Id: tenant_abc
  │  ó
  ├─ Subdomain: tenant-abc.commerceos.com
  │  ó
  ├─ Custom Domain: mitienda.com
  │
  ▼
Gateway → Resolve Tenant → Inject X-Tenant-Id header → Forward to service
```

### 6.4 Servicios Habilitados por Tienda

Cada tienda puede activar/desactivar módulos:

```json
{
  "tenant_id": "tenant_abc",
  "plan": "professional",
  "enabled_services": [
    "catalog", "cart", "order", "payment",
    "inventory", "engage", "notification", "config"
  ],
  "disabled_services": [],
  "features": {
    "inventory": { "independent_app": true },
    "payment": { "providers": ["stripe", "mercadopago"] },
    "notification": { "channels": ["email", "push", "database"] }
  }
}
```

### 6.5 Aislamiento de Datos

| Servicio | Estrategia | Justificación |
|----------|-----------|---------------|
| identity-service | DB per tenant | Credenciales sensibles, GDPR |
| catalog-service | Shared DB + tenant_id | Catálogo puede ser compartido, lectura masiva |
| cart-service | DB per tenant | Datos transaccionales, aislamiento |
| order-service | DB per tenant | Datos transaccionales, compliance |
| payment-service | DB per tenant | PCI-DSS, aislamiento de pagos |
| inventory-service | DB per tenant | Stock por tienda, atomicidad |
| engage-service | Shared DB + tenant_id | Reviews pueden ser públicos cross-tenant |
| notification-service | DB per tenant | Datos de usuario, preferencias |
| platform-config-service | DB per tenant | Configuración por tienda |

---

## 7. Autenticación y Permisos Centralizados

### 7.1 Arquitectura de Auth

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
│                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────┐    │
│  │ Frontend │────►│  Gateway │────►│ identity-service │    │
│  │          │     │          │     │                  │    │
│  │ POST     │     │ Valida   │     │ · Valida cred    │    │
│  │ /login   │     │ JWT      │     │ · Genera JWT     │    │
│  │          │◄────│          │◄────│ · Retorna token  │    │
│  └──────────┘     └──────────┘     └──────────────────┘    │
│                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────┐    │
│  │ Frontend │────►│  Gateway │────►│ identity-service │    │
│  │          │     │          │     │                  │    │
│  │ GET      │     │ Extrae   │     │ · Valida token   │    │
│  │ /api/... │     │ JWT de   │     │ · Retorna user   │    │
│  │ Bearer   │     │ Auth hdr │     │   + roles        │    │
│  │          │◄────│ Inyecta  │◄────│                  │    │
│  │          │     │ headers  │     └──────────────────┘    │
│  └──────────┘     └──────────┘                              │
│                       │                                      │
│                       ▼                                      │
│              X-User-Id: 123                                 │
│              X-User-Roles: admin,vendedor                   │
│              X-Tenant-Id: tenant_abc                        │
│              X-Permissions: productos.*, inventario.*       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Estructura del JWT

```json
{
  "sub": 123,
  "tenant_id": "tenant_abc",
  "roles": ["admin", "vendedor"],
  "permissions": ["productos.*", "inventario.*", "pedidos.*"],
  "iat": 1700000000,
  "exp": 1700057600,
  "iss": "commerceos-gateway"
}
```

### 7.3 Validación de Permisos

```
Gateway: Valida JWT → extrae roles + permissions → inyecta headers
Servicio: Recibe headers → verifica permiso específico para el endpoint
```

Cada microservicio tiene un middleware que:
1. Lee `X-User-Roles` y `X-Permissions` del gateway
2. Verifica si el usuario tiene el permiso requerido
3. Si es necesario, llama a `identity-service` para permisos frescos (cache TTL 5min)

### 7.4 Tabla de Permisos por Servicio

| Servicio | Permiso Requerido | Ejemplo |
|----------|------------------|---------|
| catalog-service (admin) | `productos.crear`, `productos.editar`, `productos.eliminar` | POST /admin/productos |
| catalog-service (public) | Ninguno | GET /productos |
| cart-service | Ninguno (guest) o autenticado | GET /carrito |
| order-service (customer) | Autenticado | GET /pedidos |
| order-service (admin) | `pedidos.ver`, `pedidos.gestionar` | POST /admin/pedidos/{id}/estado |
| payment-service (admin) | `pagos.ver`, `pagos.gestionar` | POST /admin/pagos/{id}/reembolsar |
| inventory-service | `inventario.ver`, `inventario.movimientos.crear` | POST /admin/inventario/movimientos |
| engage-service (moderation) | `reviews.moderar` | POST /admin/resenas/{id}/aprobar |
| platform-config (admin) | `configuracion.ver`, `configuracion.editar` | PUT /admin/configuracion |

---

## 8. Comunicación Síncrona y Asíncrona

### 8.1 Comunicación Síncrona (gRPC)

**Uso:** Llamadas directas donde la respuesta es necesaria inmediatamente.

```
┌──────────────┐   gRPC    ┌──────────────┐
│ cart-service │ ─────────►│ catalog-     │
│              │           │ service      │
│ "Dame el     │ ◄──────── │              │
│  precio del  │  Product  │              │
│  producto"   │  + price  │              │
└──────────────┘           └──────────────┘

┌──────────────┐   gRPC    ┌──────────────┐
│ order-service│ ─────────►│ identity-    │
│              │           │ service      │
│ "Dame las    │ ◄──────── │              │
│  direcciones │ Addresses │              │
│  del user"   │           │              │
└──────────────┘           └──────────────┘

┌──────────────┐   gRPC    ┌──────────────┐
│ TODOS        │ ─────────►│ identity-    │
│              │           │ service      │
│ "Valida este │ ◄──────── │              │
│  token"      │  TokenInfo│              │
│              │           │              │
└──────────────┘           └──────────────┘
```

**Protocolo:** gRPC con protobuf
**Ventajas:** Tipado fuerte, baja latencia (~1ms), streaming bidireccional
**Resiliencia:** Circuit breaker (5s timeout, 5 errores → circuito abierto 30s)

### 8.2 Comunicación Asíncrona (Eventos)

**Uso:** Acciones que no requieren respuesta inmediata y deben desacoplarse.

```
┌──────────────┐    Evento: OrderCreated     ┌──────────────┐
│ order-service│ ───────────────────────────► │ payment-     │
│              │                              │ service      │
│ Crea pedido  │    Evento: PaymentCompleted  │              │
│              │ ◄────────────────────────── │ Inicia pago  │
└──────────────┘                              └──────────────┘
       │
       │ Evento: OrderPaid
       ▼
┌──────────────┐    Evento: LowStockAlert    ┌──────────────┐
│ inventory-   │ ───────────────────────────► │ notification-│
│ service      │                              │ service      │
│ Deduce stock │                              │ Notifica     │
└──────────────┘                              └──────────────┘
```

**Broker de eventos:** RabbitMQ (elegido sobre Kafka por simplicidad operativa y volumen actual)

**Eventos definidos:**

| Evento | Emisor | Consumidor | Datos |
|--------|--------|-----------|-------|
| `OrderCreated` | order-service | payment-service | orderId, userId, total, currency |
| `OrderPaid` | payment-service | order-service, inventory-service | orderId, paymentId, amount |
| `OrderCancelled` | order-service | inventory-service, notification-service | orderId, reason |
| `OrderStatusChanged` | order-service | notification-service | orderId, oldStatus, newStatus |
| `PaymentCompleted` | payment-service | order-service, notification-service | orderId, paymentId, amount |
| `PaymentFailed` | payment-service | notification-service, order-service | orderId, error |
| `RefundProcessed` | payment-service | order-service, notification-service | paymentId, refundId, amount |
| `ReviewCreated` | engage-service | catalog-service | productId, rating |
| `ReviewApproved` | engage-service | catalog-service, notification-service | productId, reviewId |
| `StockLow` | inventory-service | notification-service | productId, currentStock, minStock |
| `StockMovement` | inventory-service | (logging) | productId, type, qty |

### 8.3 Patrón Outbox para Eventos

Para garantizar delivery at-least-once:

```php
// En el servicio emisor:
DB::beginTransaction();
$order = Order::create($data);
DB::table('outbox_events')->insert([
    'event_type' => 'OrderCreated',
    'aggregate_id' => $order->id,
    'payload' => json_encode($order->toArray()),
    'created_at' => now(),
]);
DB::commit();

// Proceso separado (polling o CDC):
// Lee outbox_events → publica en RabbitMQ → marca como procesado
```

### 8.4 Tabla de Decisión: Síncrono vs Asíncrono

| Escenario | Tipo | Justificación |
|-----------|------|---------------|
| Obtener precio de producto para preview | Síncrono (gRPC) | Respuesta inmediata necesaria |
| Validar token de autenticación | Síncrono (gRPC) | Bloqueante para request |
| Notificar cliente de cambio de estado | Asíncrono (evento) | No bloquea el flujo principal |
| Deducir stock después de pago | Asíncrono (evento) | Puede tolerar algunos ms de latencia |
| Actualizar rating de producto después de review | Asíncrono (evento) | Consistencia eventual aceptable |
| Crear envío después de pago aprobado | Semi-síncrono (evento con callback) | Requiere confirmación pero no bloquea |

---

## 9. Estrategia de Observabilidad

### 9.1 Las Tres Pilares

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILIDAD                                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    LOGS      │  │   MÉTRICAS   │  │ TRAZABILIDAD │         │
│  │              │  │              │  │              │         │
│  │ Structured   │  │ Prometheus   │  │ OpenTelemetry│         │
│  │ JSON logs    │  │ + Grafana    │  │ + Jaeger     │         │
│  │              │  │              │  │              │         │
│  │ · Request    │  │ · Latency    │  │ · Trace ID   │         │
│  │ · Error      │  │ · Throughput │  │ · Span chain │         │
│  │ · Audit      │  │ · Error rate │  │ · Service    │         │
│  │ · Business   │  │ · Saturation │  │   map        │         │
│  │              │  │ · Business   │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         ▼                 ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              ELK / Loki + Grafana                    │       │
│  │         Dashboard unificado de observabilidad        │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Logs Estructurados

Cada servicio genera logs en formato JSON estandarizado:

```json
{
  "timestamp": "2026-09-17T10:30:00Z",
  "level": "info",
  "service": "order-service",
  "version": "1.2.0",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "tenant_id": "tenant_abc",
  "user_id": 123,
  "method": "POST",
  "path": "/api/v1/pedidos",
  "status": 201,
  "duration_ms": 45,
  "message": "Order created successfully",
  "context": {
    "order_id": 456,
    "items_count": 3,
    "total": 150000
  }
}
```

**Stack tecnológico:**
- **Logging:** Fluent Bit (lightweight) → Elasticsearch / Loki
- **Query:** Kibana / Grafana Loki
- **Alertas:** Grafana Alerting

### 9.3 Métricas (Prometheus)

Métricas estándar por servicio:

```
# HTTP Metrics
http_requests_total{method, path, status, service}
http_request_duration_seconds{method, path, service}
http_request_size_bytes{method, path, service}
http_response_size_bytes{method, path, service}

# gRPC Metrics
grpc_server_handling_seconds{method, service}
grpc_server_started_total{method, service}
grpc_server_completed_total{method, service, code}

# Business Metrics
orders_created_total{tenant_id}
payments_processed_total{provider, status}
inventory_movements_total{type, tenant_id}
reviews_created_total{tenant_id}
active_carts_total{tenant_id}

# Infrastructure Metrics
db_connection_pool_active{service}
db_connection_pool_idle{service}
cache_hit_ratio{service}
queue_messages_pending{queue_name}
circuit_breaker_state{service}
```

### 9.4 Trazabilidad (Distributed Tracing)

```
Trace: Order Creation Flow
│
├── [Gateway] POST /api/v1/pedidos (12ms)
│   ├── [identity-service] ValidateToken (2ms)
│   ├── [cart-service] GetCart (5ms)
│   │   └── [catalog-service] GetProductPrices (3ms)
│   ├── [identity-service] GetAddresses (4ms)
│   ├── [order-service] CreateOrder (8ms)
│   │   └── [catalog-service] GetProducts (3ms)
│   └── [notification-service] QueueNotification (1ms)
│
└── Total: 45ms
```

**Stack:** OpenTelemetry SDK → Jaeger (backend) → Grafana Tempo

### 9.5 Health Checks

Cada servicio expone:
```
GET /health        → { status: "healthy", version: "1.2.0", uptime: 86400 }
GET /health/ready  → { status: "ready", db: "connected", cache: "connected" }
GET /health/live   → { status: "alive" }
```

### 9.6 Dashboards

| Dashboard | Contenido |
|-----------|-----------|
| **Gateway Overview** | Requests/s, latencia p50/p95/p99, errores, circuit breakers |
| **Service Health** | CPU, memoria, connections por servicio |
| **Business KPIs** | Pedidos/min, revenue, tasa de conversión, carritos abandonados |
| **Inventory** | Stock levels, movimientos/día, alertas activas |
| **Error Tracking** | Errores por servicio, tipo, frecuencia, stack traces |

---

## 10. Despliegue con Docker y Kubernetes

### 10.1 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                      KUBERNETES CLUSTER                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ namespace: ingress                                           │   │
│  │                                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │   │
│  │  │ Traefik Ingress │  │ cert-manager    │                   │   │
│  │  │ Controller      │  │ (Let's Encrypt) │                   │   │
│  │  └─────────────────┘  └─────────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ namespace: services                                          │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ identity│ │ catalog │ │ cart    │ │ order   │           │   │
│  │  │ 2 pods  │ │ 3 pods  │ │ 2 pods  │ │ 2 pods  │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ payment │ │ invent  │ │ engage  │ │ notif   │           │   │
│  │  │ 2 pods  │ │ 2 pods  │ │ 1 pod   │ │ 1 pod   │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  │                                                               │   │
│  │  ┌─────────┐                                                 │   │
│  │  │ config  │                                                 │   │
│  │  │ 1 pod   │                                                 │   │
│  │  └─────────┘                                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ namespace: data                                              │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ PG      │ │ RabbitMQ│ │ Redis   │ │ S3/MinIO│           │   │
│  │  │ (cloud) │ │ 1 node  │ │ 3 nodes │ │ 1 node  │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ namespace: observability                                     │   │
│  │                                                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │Prometheus│ │ Grafana │ │ Jaeger  │ │ Loki    │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Docker Compose (Desarrollo Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ── API Gateway ────────────────────────────────
  gateway:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - ./traefik.yml:/etc/traefik/traefik.yml
      - ./dynamic.yml:/etc/traefik/dynamic.yml
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - gateway-net

  # ── Microservicios ─────────────────────────────
  identity-service:
    build: ./services/identity
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=identity-db
      - DB_DATABASE=identity_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - identity-db
      - redis
    networks:
      - gateway-net
      - internal-net

  catalog-service:
    build: ./services/catalog
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=catalog-db
      - DB_DATABASE=catalog_db
      - MEILISEARCH_HOST=http://meilisearch:7700
    depends_on:
      - catalog-db
      - meilisearch
    networks:
      - gateway-net
      - internal-net

  cart-service:
    build: ./services/cart
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=cart-db
      - DB_DATABASE=cart_db
      - CACHE_DRIVER=redis
    depends_on:
      - cart-db
      - redis
    networks:
      - gateway-net
      - internal-net

  order-service:
    build: ./services/order
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=order-db
      - DB_DATABASE=order_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - order-db
      - rabbitmq
    networks:
      - gateway-net
      - internal-net

  payment-service:
    build: ./services/payment
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=payment-db
      - DB_DATABASE=payment_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - payment-db
      - rabbitmq
    networks:
      - gateway-net
      - internal-net

  inventory-service:
    build: ./services/inventory
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=inventory-db
      - DB_DATABASE=inventory_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - inventory-db
      - rabbitmq
    networks:
      - gateway-net
      - internal-net

  engage-service:
    build: ./services/engage
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=engage-db
      - DB_DATABASE=engage_db
    depends_on:
      - engage-db
    networks:
      - gateway-net
      - internal-net

  notification-service:
    build: ./services/notification
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=notification-db
      - DB_DATABASE=notification_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - notification-db
      - rabbitmq
    networks:
      - gateway-net
      - internal-net

  platform-config-service:
    build: ./services/platform-config
    environment:
      - DB_CONNECTION=pgsql
      - DB_HOST=config-db
      - DB_DATABASE=config_db
      - CACHE_DRIVER=redis
    depends_on:
      - config-db
      - redis
    networks:
      - gateway-net
      - internal-net

  # ── Bases de datos (una por servicio) ──────────
  identity-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: identity_db
      POSTGRES_USER: identity_user
      POSTGRES_PASSWORD: secret
    volumes:
      - identity-data:/var/lib/postgresql/data
    networks:
      - internal-net

  catalog-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: catalog_db
      POSTGRES_USER: catalog_user
      POSTGRES_PASSWORD: secret
    volumes:
      - catalog-data:/var/lib/postgresql/data
    networks:
      - internal-net

  cart-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cart_db
      POSTGRES_USER: cart_user
      POSTGRES_PASSWORD: secret
    volumes:
      - cart-data:/var/lib/postgresql/data
    networks:
      - internal-net

  order-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: order_db
      POSTGRES_USER: order_user
      POSTGRES_PASSWORD: secret
    volumes:
      - order-data:/var/lib/postgresql/data
    networks:
      - internal-net

  payment-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: payment_db
      POSTGRES_USER: payment_user
      POSTGRES_PASSWORD: secret
    volumes:
      - payment-data:/var/lib/postgresql/data
    networks:
      - internal-net

  inventory-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: inventory_db
      POSTGRES_USER: inventory_user
      POSTGRES_PASSWORD: secret
    volumes:
      - inventory-data:/var/lib/postgresql/data
    networks:
      - internal-net

  engage-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: engage_db
      POSTGRES_USER: engage_user
      POSTGRES_PASSWORD: secret
    volumes:
      - engage-data:/var/lib/postgresql/data
    networks:
      - internal-net

  notification-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: notification_db
      POSTGRES_USER: notification_user
      POSTGRES_PASSWORD: secret
    volumes:
      - notification-data:/var/lib/postgresql/data
    networks:
      - internal-net

  config-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: config_db
      POSTGRES_USER: config_user
      POSTGRES_PASSWORD: secret
    volumes:
      - config-data:/var/lib/postgresql/data
    networks:
      - internal-net

  # ── Infraestructura compartida ─────────────────
  redis:
    image: redis:7-alpine
    networks:
      - internal-net

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "15672:15672"
    networks:
      - internal-net

  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    networks:
      - internal-net

volumes:
  identity-data:
  catalog-data:
  cart-data:
  order-data:
  payment-data:
  inventory-data:
  engage-data:
  notification-data:
  config-data:

networks:
  gateway-net:
  internal-net:
    internal: true
```

### 10.3 Kubernetes Deployment (Producción)

**Estructura de directorios:**
```
k8s/
├── base/
│   ├── identity-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   ├── catalog-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml
│   │   └── pdb.yaml
│   └── ... (igual para cada servicio)
├── ingress/
│   ├── traefik.yaml
│   └── routes.yaml
├── observability/
│   ├── prometheus/
│   ├── grafana/
│   ├── jaeger/
│   └── loki/
├── databases/
│   ├── cloud-sql.yaml (GCP) o rds.yaml (AWS)
│   └── secrets.yaml
└── kustomization.yaml
```

**Ejemplo: order-service deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: services
spec:
  replicas: 2
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
        - name: order-service
          image: gcr.io/project-id/order-service:1.2.0
          ports:
            - containerPort: 8004
            - containerPort: 9090
          env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: order-db-secret
                  key: host
            - name: RABBITMQ_URL
              valueFrom:
                configMapKeyRef:
                  name: infra-config
                  key: rabbitmq-url
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8004
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8004
            initialDelaySeconds: 5
            periodSeconds: 10
```

**Horizontal Pod Autoscaler:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  namespace: services
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 10.4 Estrategia de Deployment

| Estrategia | Cuándo Usar | Ejemplo |
|-----------|-------------|---------|
| **Rolling Update** | Releases normales, sin breaking changes | Actualización de bug fix |
| **Blue/Green** | Breaking changes en API | Nueva versión de API gateway |
| **Canary** | Releases de alto riesgo | Cambios en payment-service |
| **Feature Flags** | Nuevas funcionalidades | Nuevo flujo de checkout |

---

## 11. Plan de Migración — Strangler Fig

### 11.1 Concepto

El patrón Strangler Fig envuelve gradualmente el monolito existente con nuevos servicios, migrando funcionalidad pieza por pieza hasta que el monolito se "estrangula" y puede ser eliminado.

```
Fase 1:                    Fase 2:                    Fase 3:
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   MONOLITO   │          │   MONOLITO   │          │  MONOLITO    │
│   ████████   │          │   ████       │          │  (empty)     │
│   ████████   │          │   ████       │          │              │
│   ████████   │          │   ████       │          │              │
│   ████████   │          └──────────────┘          └──────────────┘
└──────────────┘          ┌──────────────┐          ┌──────────────┐
                          │  identity-svc│          │  identity-svc│
                          │  catalog-svc │          │  catalog-svc │
                          └──────────────┘          │  cart-svc    │
                                                    │  order-svc   │
                                                    │  payment-svc │
                                                    │  inventory   │
                                                    │  engage      │
                                                    │  notif       │
                                                    │  config      │
                                                    └──────────────┘
```

### 11.2 Fases de Migración

#### Fase 0: Preparación (Semanas 1-4)

| Actividad | Detalle | Dependencias |
|-----------|---------|-------------|
| **Infraestructura base** | Docker Compose local, Kubernetes cluster (dev), CI/CD pipeline | Ninguna |
| **API Gateway** | Instalar Traefik, configurar routing al monolito (proxy pass) | Infra base |
| **Event bus** | RabbitMQ cluster, definir schema de eventos | Infra base |
| **Auth centralizada** | Crear identity-service con mismos endpoints de auth | Ninguna |
| **Shared library** | Paquete compartido: `ApiResponse`, tipos, utils comunes | Ninguna |
| **Feature flags** | Sistema de feature flags (LaunchDarkly / Unleash) | Infra base |

**Resultado:** Gateway proxy pass al monolito. Identity-service desplegado y funcionando. Monolito sigue sirviendo todo.

#### Fase 1: Identity & Auth (Semanas 5-8)

| Actividad | Detalle |
|-----------|---------|
| **Crear identity-service** | User, Role, Address, Token. Mismos endpoints. |
| **Migrar datos** | Script ETL: users + roles + addresses → identity_db |
| **Dual-write** | Monolito escribe en ambas DBs (identity_db + monolito) |
| **Gateway routing** | `/api/v1/auth/*`, `/api/v1/perfil`, `/api/v1/direcciones` → identity-service |
| **Validación** | Todos los servicios validan token via identity-service (gRPC) |
| **Corte** | Monolito deja de manejar auth, delega a identity-service |

**Validación:**
- [ ] Login/logout funciona via identity-service
- [ ] Perfil CRUD funciona
- [ ] Direcciones CRUD funciona
- [ ] Todos los servicios validan token correctamente
- [ ] Frontend no detecta cambios

#### Fase 2: Catalog (Semanas 9-14)

| Actividad | Detalle |
|-----------|---------|
| **Crear catalog-service** | Product, Category, Brand, Tag, Variant |
| **Migrar datos** | Script ETL de monolito → catalog_db |
| **Meilisearch** | Indexar productos para búsqueda full-text |
| **Gateway routing** | `/api/v1/productos/*`, `/api/v1/categorias/*` → catalog-service |
| **Dual-read** | Gateway lee de catalog-service, fallback a monolito |
| **Corte** | Monolito deja de servir catálogo |

**Validación:**
- [ ] Catálogo público funciona
- [ ] Búsqueda funciona (Meilisearch)
- [ ] Admin CRUD funciona
- [ ] Product detail con variantes funciona
- [ ] `loadProductDetail()` del frontend funciona

#### Fase 3: Inventory (Semanas 15-18) — **MÓDULO INDEPENDIENTE**

| Actividad | Detalle |
|-----------|---------|
| **Crear inventory-service** | StockMovement, StockAlert |
| **Migrar datos** | stock_movements + stock_alerts → inventory_db |
| **Frontend independiente** | Crear `/inventario` como app standalone |
| **API centralizada** | inventory-service expone APIs que otros servicios consumen |
| **Gateway routing** | `/api/v1/admin/inventario/*` → inventory-service |
| **Integración con catalog** | inventory-service llama a catalog-service para validar productos |

**Resultado:** Inventario como aplicación independiente, consumida por frontend centralizado.

#### Fase 4: Cart & Checkout (Semanas 19-22)

| Actividad | Detalle |
|-----------|---------|
| **Crear cart-service** | Cart, CartItem, Coupon |
| **Migrar datos** | carts + cart_items + coupons → cart_db |
| **Integración gRPC** | cart-service llama a catalog-service para precios |
| **Gateway routing** | `/api/v1/carrito/*`, `/api/v1/checkout/*` → cart-service |
| **Guest cart** | Mantener soporte para session_id carts |

#### Fase 5: Order & Payment (Semanas 23-30)

| Actividad | Detalle |
|-----------|---------|
| **Crear order-service** | Order, OrderItem, Shipment |
| **Crear payment-service** | Payment, Refund, Webhooks |
| **Event-driven** | OrderCreated → PaymentCompleted → StockDeduction |
| **Migrar datos** | orders + order_items + payments → respectivos DBs |
| **Webhooks** | Payment webhooks apuntan a payment-service directamente |
| **Gateway routing** | `/api/v1/pedidos/*`, `/api/v1/pagos/*` → respectivos servicios |

#### Fase 6: Engagement + Notifications + Config (Semanas 31-36)

| Actividad | Detalle |
|-----------|---------|
| **Crear engage-service** | Reviews, Wishlist |
| **Crear notification-service** | NotificationLog, PushSubscription |
| **Crear platform-config-service** | Settings, TiendaConfig |
| **Event-driven** | Reviews → actualiza rating en catalog |
| **Migrar datos** | Tablas restantes → respectivos DBs |
| **Corte final** | Monolito vacío → decomission |

#### Fase 7: Monolito Decommission (Semanas 37-40)

| Actividad | Detalle |
|-----------|---------|
| **Verificar** | Todos los endpoints funcionan via gateway → servicios |
| **Monolito OFF** | Apagar monolito, mantener DB como backup 30 días |
| **Cleanup** | Eliminar feature flags, dual-write logic |
| **Documentación** | Actualizar docs de arquitectura |

### 11.3 Cronograma Visual

```
Semana:  1    4    8    14   18   22   30   36   40
         │    │    │    │    │    │    │    │    │
Fase 0:  ████████
Fase 1:        ████████
Fase 2:              ████████████
Fase 3:                      ████████
Fase 4:                            ████████
Fase 5:                                  ████████████
Fase 6:                                            ████████████
Fase 7:                                                      ████
         │    │    │    │    │    │    │    │    │
         ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
        Prep  ID   Cat  Inv  Cart Ord  Eng  Done
```

### 11.4 Estrategia de Testing por Fase

| Tipo | Herramienta | Cuándo |
|------|------------|--------|
| **Unit tests** | PHPUnit | Cada servicio individualmente |
| **Contract tests** | Pact | Entre servicios antes de cada fase |
| **Integration tests** | Postman/Newman | Flujo completo cross-servicio |
| **Load tests** | k6 / Locust | Antes de cada corte de monolito |
| **E2E tests** | Cypress / Playwright | Frontend completo después de cada fase |
| **Chaos tests** | Chaos Monkey (opcional) | Fase 7, post-migración |

---

## 12. Riesgos Técnicos y Recomendaciones

### 12.1 Matriz de Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| 1 | **Data consistency entre servicios** | Alta | Crítico | Saga pattern + outbox + compensating transactions |
| 2 | **Latencia increase por llamadas cross-service** | Alta | Alto | gRPC, cache Redis, Circuit breaker |
| 3 | **Complejidad operacional** | Alta | Alto | K8s, monitoring centralizado, runbooks |
| 4 | **Distribución de transacciones** | Media | Crítico | Eventual consistency + idempotency keys |
| 5 | **Migración de datos fallida** | Media | Alto | Dual-write + rollback scripts + backups |
| 6 | **Contrato de API roto** | Media | Alto | Contract testing (Pact), versioning |
| 7 | **Servicio caído afecta cadena** | Media | Alto | Circuit breaker, bulkhead, retry con backoff |
| 8 | **Debugging dificultoso** | Alta | Medio | Distributed tracing (OpenTelemetry), correlation IDs |
| 9 | **Feature flags desactualizados** | Baja | Medio | Cleanup automático post-migración |
| 10 | **Frontend offline sync roto** | Media | Alto | Mantener URLs idénticas, testear offline path |

### 12.2 Recomendaciones Críticas

#### Recomendación 1: Mantener URLs idénticas

```yaml
# El frontend tiene 100 contratos de API. Las URLs NO deben cambiar.
# El Gateway actúa como proxy que traduce rutas internas.

# Externo (lo que ve el frontend):
GET /api/v1/productos

# Interno (lo que recibe el servicio):
GET /productos  → catalog-service:8002

# El Gateway mapea /api/v1/productos → catalog-service:8002/productos
```

**Justificación:** El frontend tiene soporte offline con IndexedDB que almacena URLs exactas. Cambiar URLs rompería el sync offline.

#### Recomendación 2: Empezar por lo más simple

```
Orden de extracción (menor acoplamiento primero):
1. platform-config-service  (sin dependencias, read-only)
2. notification-service     (event-driven, sin dependencias)
3. identity-service         (core auth, dependencia de todos)
4. catalog-service          (lectura masiva, bajo acoplamiento)
5. inventory-service        (requisito explícito del usuario)
6. engage-service           (bajo acoplamiento)
7. cart-service             (depende de catalog para precios)
8. order-service            (alto acoplamiento, state machine)
9. payment-service          (mayor complejidad, PCI-DSS)
```

#### Recomendación 3: No migrar la base de datos de golpe

```
Estrategia de migración de datos por servicio:

Fase 1: Dual-write (escribe en ambas DBs)
         ┌─────────┐
         │ Monolito │──► monolito_db
         │          │──► identity_db (nuevo)
         └─────────┘

Fase 2: Dual-read (lee de ambas, compara)
         ┌─────────┐
         │ Gateway  │──► monolito (fallback)
         │          │──► identity-service (primario)
         └─────────┘

Fase 3: Corte (solo nuevo servicio)
         ┌─────────┐
         │ Gateway  │──► identity-service
         └─────────┘
         Monolito apagado para ese dominio
```

#### Recomendación 4: Inventario como primer servicio independiente

Dado el requisito explícito del usuario:

```
El inventario debe:
1. Tener su propia API pública
2. Poder desplegarse independientemente
3. Ser consumido por otros servicios (eventos)
4. Tener frontend standalone

Plan específico:
- Semana 15: Crear inventory-service con API gRPC + REST
- Semana 16: Frontend standalone en /inventario
- Semana 17: Integrar con catalog-service (validar productos)
- Semana 18: Integrar con order-service (deducir stock on payment)
```

#### Recomendación 5: Contratos de API con Pact

```php
// Ejemplo de contract test para catalog-service
$provider->expects('GetProduct returns valid product')
    ->given('product with id 1 exists')
    ->uponReceiving('a request for product 1')
    ->with([
        'method' => 'GET',
        'path' => '/products/1',
    ])
    ->willRespondWith([
        'status' => 200,
        'body' => [
            'id' => 1,
            'name' => Matcher::type('string'),
            'price' => Matcher::greaterThan(0),
        ],
    ]);
```

#### Recomendación 6: Circuit Breaker en cada servicio

```
Configuración estándar:
- Timeout: 5 segundos
- Error threshold: 5 errores consecutivos
- Reset timeout: 30 segundos
- Half-open: permitir 1 request de prueba cada 30s

Efecto cascada mitigado:
order-service → catalog-service (circuit breaker ON)
order-service → identity-service (sigue funcionando)
order-service → notification-service (funciona async)
```

### 12.3 Anti-Patrones a Evitar

| Anti-Patrón | Por Qué | Alternativa |
|-------------|---------|-------------|
| **Distributed monolith** | Servicios acoplados, fallan juntos | Event-driven, autónomos |
| **Shared database** | Servicios comparten tablas | DB por servicio |
| **Synchronous chains** | A → B → C → D (latencia acumulada) | Async events para cadenas largas |
| **God service** | Un servicio hace todo | Mantener bounded contexts claros |
| **No idempotency** | Procesamiento duplicado de eventos | Idempotency keys en todos los endpoints |
| **Logging inconsistente** | No se puede rastrear requests | Structured JSON, correlation IDs |

---

## 13. Diagramas de Arquitectura

### 13.1 Arquitectura General (To-Be)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENTES                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Web App  │  │ Mobile   │  │ Inventario│  │ Future   │              │
│  │ (Nuxt 3) │  │ App      │  │ App      │  │ Clients  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │              │                     │
└───────┼──────────────┼──────────────┼──────────────┼─────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Traefik)                            │
│  Rate Limit · Auth · Routing · Circuit Breaker · CORS · Load Balance    │
└───────┬──────────────┬──────────────┬──────────────┬─────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MICROSERVICIOS                                   │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ identity │ │ catalog  │ │ cart     │ │ order    │                 │
│  │ :8001    │ │ :8002    │ │ :8003    │ │ :8004    │                 │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘                 │
│       │              │              │              │                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ payment  │ │inventory │ │ engage   │ │ notif    │                 │
│  │ :8005    │ │ :8006    │ │ :8007    │ │ :8008    │                 │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘                 │
│       │              │              │              │                     │
│  ┌──────────┐                                                      │
│  │ platform │                                                      │
│  │ config   │                                                      │
│  │ :8009    │                                                      │
│  └──────────┘                                                      │
│                                                                         │
└───────┬──────────────┬──────────────┬──────────────┬─────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     INFRAESTRUCTURA COMPARTIDA                          │
│                                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│ │ Redis    │ │RabbitMQ  │ │Meilisearch│ │ S3/MinIO │   │
│  │(9 DBs)   │ │ (cache)  │ │ (events) │ │ (search)  │ │ (files)  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     OBSERVABILIDAD                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │Prometheus│ │ Grafana  │ │ Jaeger   │ │ Loki     │                 │
│  │metrics   │ │dashboard │ │ traces   │ │ logs     │                 │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Flujo de Datos: Creación de Pedido

```
Cliente                Gateway          order-svc        cart-svc       catalog-svc      payment-svc      inventory-svc     notif-svc
  │                      │                │                │                │                │                │                │
  │  POST /pedidos       │                │                │                │                │                │                │
  │─────────────────────►│                │                │                │                │                │                │
  │                      │ Validate JWT   │                │                │                │                │                │
  │                      │───────────────►│                │                │                │                │                │
  │                      │                │                │                │                │                │                │
  │                      │ CreateOrder    │                │                │                │                │                │
  │                      │───────────────►│                │                │                │                │                │
  │                      │                │ GetCart        │                │                │                │                │
  │                      │                │───────────────►│                │                │                │                │
  │                      │                │ Cart items     │                │                │                │                │
  │                      │                │◄───────────────│                │                │                │                │
  │                      │                │                │                │                │                │                │
  │                      │                │ GetProducts (prices)           │                │                │                │
  │                      │                │───────────────────────────────►│                │                │                │
  │                      │                │ Products + prices              │                │                │                │
  │                      │                │◄───────────────────────────────│                │                │                │
  │                      │                │                │                │                │                │                │
  │                      │                │ Denormalize order_items        │                │                │                │
  │                      │                │ Save to order_db               │                │                │                │
  │                      │                │                │                │                │                │                │
  │                      │                │ Publish: OrderCreated          │                │                │                │
  │                      │                │───────┬──────────────────────────────────────►│                │                │
  │                      │                │       │                       │                │                │                │
  │                      │                │       │                       │ InitiatePayment│                │                │
  │                      │                │       │                       │───────────────►│                │                │
  │                      │                │       │                       │                │                │                │
  │                      │                │       │                       │ Process payment│                │                │
  │                      │                │       │                       │ (Stripe/Wompi) │                │                │
  │                      │                │       │                       │                │                │                │
  │                      │                │       │                       │ Publish: PaymentCompleted        │                │
  │                      │                │◄──────┼───────────────────────────────────────│                │                │
  │                      │                │       │                       │                │                │                │
  │                      │                │ Update order status: pagado   │                │                │                │
  │                      │                │                │                │                │                │                │
  │                      │                │ Publish: OrderPaid            │                │                │                │
  │                      │                │───────────────────────────────────────────────────────────────►│                │
  │                      │                │                │                │                │                │ Deduct stock  │
  │                      │                │                │                │                │                │ Save movement │
  │                      │                │                │                │                │                │                │
  │                      │                │ Publish: OrderStatusChanged    │                │                │                │
  │                      │                │───────────────────────────────────────────────────────────────────────────────────►│
  │                      │                │                │                │                │                │ Queue notification
  │                      │                │                │                │                │                │                │ Send email
  │                      │                │                │                │                │                │                │ Send push
  │                      │                │                │                │                │                │                │
  │  201 Created         │                │                │                │                │                │                │
  │◄─────────────────────│                │                │                │                │                │                │
  │  { order_id: 456 }   │                │                │                │                │                │                │
```

### 13.3 Dependencias de Base de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENCIAS DE DATOS                         │
│                                                                  │
│  identity_db ◄─────────────────────────────────────────────┐   │
│       │                                                     │   │
│       │ (user_id)                                          │   │
│       ▼                                                     │   │
│  catalog_db ◄── catalog-service owns                        │   │
│       │                                                     │   │
│       │ (product_id, price)                                 │   │
│       ▼                                                     │   │
│  cart_db ◄──── cart-service owns                            │   │
│       │                                                     │   │
│       │ (cart_id → order)                                   │   │
│       ▼                                                     │   │
│  order_db ◄──── order-service owns                          │   │
│       │                                                     │   │
│       │ (order_id)                                          │   │
│       ├──► payment_db ◄── payment-service owns              │   │
│       │                                                     │   │
│       ├──► inventory_db ◄── inventory-service owns          │   │
│       │    (product_id, stock)                              │   │
│       │                                                     │   │
│       └──► engage_db ◄──── engage-service owns              │   │
│            (product_id for reviews)                         │   │
│                                                             │   │
│  notification_db ◄── notification-service owns              │   │
│  config_db ◄──── platform-config-service owns               │   │
│                                                             │   │
│  ───── Todas las DBs son INDEPENDIENTES ─────              │   │
│  ───── Sin foreign keys cross-service ─────                 │   │
│  ───── Data consistency via events ─────                    │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Apéndice A: Comando de Inicio Rápido

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd template_back

# 2. Crear estructura de servicios
mkdir -p services/{identity,catalog,cart,order,payment,inventory,engage,notification,platform-config}

# 3. Levantar infraestructura base
docker-compose up -d redis rabbitmq meilisearch

# 4. Crear bases de datos
for svc in identity catalog cart order payment inventory engage notification config; do
  docker-compose up -d ${svc}-db
done

# 5. Levantar gateway
docker-compose up -d gateway

# 6. Verificar
curl http://localhost:8080/api/  # Traefik dashboard
```

## Apéndice B: Decisiones Arquitectónicas Registradas (ADR)

| # | Decisión | Alternativas | Justificación |
|---|----------|-------------|---------------|
| ADR-001 | gRPC para comunicación síncrona | REST, GraphQL | Baja latencia (~1ms vs ~10ms REST), tipado fuerte, streaming |
| ADR-002 | RabbitMQ como event broker | Kafka, NATS | Más simple para volumen actual, management UI, community |
| ADR-003 | DB per tenant para servicios transaccionales | Shared DB + tenant_id | Mejor aislamiento, más simple de shardear, GDPR compliance |
| ADR-004 | Traefik como API Gateway | Kong, Envoy | Nativo Docker/K8s, ligero, middleware chain |
| ADR-005 | OpenTelemetry para trazabilidad | Zipkin, Jaeger directo | Estándar CNCF, vendor-neutral, integración nativa |
| ADR-006 | Strangler Fig como estrategia de migración | Big bang, parallel run | Menor riesgo, rollback fácil, validación incremental |
| ADR-007 | PostgreSQL como DB principal | MySQL, MongoDB | JSON support nativo, extensibilidad, madurez |
| ADR-008 | Meilisearch para búsqueda de catálogo | Elasticsearch, Algolia | Más ligero, typo-tolerant, self-hosted, rápido |

---

*Documento generado el 2026-09-17. Requiere revisión de arquitecto antes de implementar.*
