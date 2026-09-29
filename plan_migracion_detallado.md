# Plan de Migración Detallado — CommerceOS Microservicios

> **Documento maestro de ejecución del proyecto.**
> Diseñado para ser ejecutado paso a paso por una IA de desarrollo sin pérdida de contexto.
> Stack: Laravel 11, PHP 8.3, PostgreSQL, Docker, Kubernetes, JWT (Sanctum), Redis, RabbitMQ, Meilisearch

---

## Tabla de Contenidos

1. [Contexto General](#1-contexto-general)
2. [Roadmap General](#2-roadmap-general)
3. [Desarrollo Detallado por Fase](#3-desarrollo-detallado-por-fase)
4. [Definición de Microservicios](#4-definición-de-microservicios)
5. [API Gateway](#5-api-gateway)
6. [Seguridad](#6-seguridad)
7. [Estrategia de Testing](#7-estrategia-de-testing)
8. [Estrategia de Despliegue](#8-estrategia-de-despliegue)
9. [Observabilidad](#9-observabilidad)
10. [Checklist Final](#10-checklist-final)

---

# 1. Contexto General

## 1.1 Descripción del Proyecto

CommerceOS es una plataforma ecommerce SaaS multi-tenant construida como monolito Laravel con frontend Nuxt 3. El sistema actualmente se encuentra en etapa de desarrollo, lo que facilita la migración ya que no existe deuda técnica ni dependencias de producción.

**Arquitectura actual:**
- Backend: Laravel monolito con 30 modelos, 22 controladores, 30 servicios, 100 endpoints
- Frontend: Nuxt 3 con 18 Pinia stores, 10 composables, 100 llamadas API
- Base de datos: PostgreSQL única con 23 tablas
- Autenticación: Sanctum Bearer tokens
- Sin eventos asíncronos, sin WebSockets, sin colas de mensajes

## 1.2 Objetivos del Negocio

| Objetivo | Descripción | KPI |
|----------|-------------|-----|
| Modularidad | Cada dominio opera como servicio independiente | Deploy individual sin afectar otros servicios |
| Escalabilidad | Escalar componentes de alta demanda independientemente | catalog-service con 3+ réplicas bajo carga |
| Independencia de Inventario | inventory-service como aplicación standalone | API propia + frontend independiente |
| API Pública de Catálogo | catalog-service consumible por proyectos externos | Documentación OpenAPI + API keys |
| Multi-tenant | Soporte para múltiples tiendas con activación modular | 1 tenant activo en 3 meses post-migración |
| Velocidad de Despliegue | Reducir tiempo de release de 15min a <2min por servicio | CI/CD pipeline por servicio |

## 1.3 Objetivos Técnicos

| Objetivo | Métrica |
|----------|---------|
| Latencia p95 < 100ms | Request gateway → servicio → respuesta |
| Disponibilidad 99.9% | Uptime por servicio individual |
| Cobertura de tests > 80% | Unit tests por servicio |
| Contratos de API validados | Pact tests entre servicios |
| Observabilidad completa | Logs + métricas + trazas en cada servicio |
| Deploy independiente | Cada servicio tiene su propio pipeline CI/CD |

## 1.4 Arquitectura Objetivo

**Stack tecnológico:**
- Runtime: PHP 8.3
- Framework: Laravel 11
- Base de datos: PostgreSQL 16
- Cache: Redis 7
- Eventos: RabbitMQ 3.13
- Search: Meilisearch 1.5
- Autenticación: Laravel Sanctum (JWT)
- Containerización: Docker + Docker Compose
- Orquestación: Kubernetes 1.29
- Observabilidad: Prometheus + Grafana + Loki

**10 Servicios Laravel:**
- api-gateway (:8000) → No DB (routing centralizado)
- identity-service (:8001) → identity_db
- catalog-service (:8002) → catalog_db
- cart-service (:8003) → cart_db
- order-service (:8004) → order_db
- payment-service (:8005) → payment_db
- inventory-service (:8006) → inventory_db
- engage-service (:8007) → engage_db
- notification-service (:8008) → notification_db
- platform-config-service (:8009) → config_db

## 1.5 Principios Arquitectónicos

| # | Principio | Descripción |
|---|-----------|-------------|
| P1 | Database per Service | Cada microservicio tiene su propia base de datos. Sin shared DB. |
| P2 | API First | Cada servicio define su contrato OpenAPI antes de implementar. |
| P3 | Event-Driven Communication | Comunicación asíncrona por defecto. Síncrono solo para queries necesarias. |
| P4 | Idempotency | Todos los endpoints de escritura son idempotentes via idempotency keys. |
| P5 | Circuit Breaker | Cada llamada cross-service usa circuit breaker (5s timeout, 5 errores). |
| P6 | Single Responsibility | Un servicio, un bounded context. Si crece demasiado, se divide. |
| P7 | Backward Compatibility | Versionamiento de API. Nunca romper contratos existentes. |
| P8 | Zero Trust | Todos los servicios validan JWT internamente. No confían en headers del gateway. |
| P9 | Infrastructure as Code | Todo despliegue es declarativo. Sin configuración manual. |
| P10 | Observability by Default | Cada servicio expone logs estructurados, métricas y health checks. |

## 1.6 Definición de Dominios Principales

| Dominio | Bounded Context | Entidades Principales |
|---------|----------------|----------------------|
| Identidad | Identity and Access | User, Role, Permission, Address, Token |
| Catálogo | Catalog | Product, Category, Brand, Tag, Variant, ProductImage |
| Carrito | Cart and Checkout | Cart, CartItem, Coupon, ShippingMethod |
| Pedido | Order and Fulfillment | Order, OrderItem, OrderStatusHistory, Shipment |
| Pago | Payment | Payment, Refund |
| Inventario | Inventory | StockMovement, StockAlert |
| Engagement | Engagement | Review, WishlistItem |
| Notificación | Notification | NotificationLog, PushSubscription |
| Plataforma | Platform Config | Setting, StoreConfig, TiendaConfig |

## 1.7 Alcance y Exclusiones

### En alcance
- Reestructurar el monolito Laravel en 10 microservicios Laravel (incluye API Gateway)
- Implementar autenticación JWT centralizada con Laravel Sanctum
- Comunicación HTTP/REST entre servicios
- Docker Compose para desarrollo local
- Kubernetes manifests para producción
- Pipeline CI/CD por servicio
- Observabilidad completa (logs, métricas)
- Frontend Nuxt 3 actualizado para consumir servicios via Gateway
- inventory-service como aplicación independiente
- catalog-service como API pública con documentación OpenAPI

### Fuera de alcance
- Migración de datos históricos (el sistema está en desarrollo)
- Rediseño del frontend Nuxt 3 (se actualizan endpoints, no UI)
- Integración con servicios de terceros nuevos
- Certificación PCI-DSS completa (solo aislamiento de pagos)
- Multi-region deployment
- Machine learning / recomendaciones
- Mobile apps nativas

---

# 2. Roadmap General

| Fase | Nombre | Objetivo | Dependencias | Duracion Est. | Resultado Esperado |
|------|--------|----------|-------------|---------------|-------------------|
| 0 | Infraestructura Base | Setup de herramientas compartidas | Ninguna | 1 semana | Docker Compose funcional, shared library, CI/CD base |
| 1 | API Gateway (Laravel) | Gateway central con routing y auth | Fase 0 | 2 semanas | Laravel Gateway con JWT, rate limiting, routing a microservicios |
| 2 | Identity Service | Servicio de autenticacion y usuarios | Fase 1 | 2 semanas | JWT auth, login/logout, RBAC, health checks |
| 3 | Catalog Service | API publica de catalogo | Fase 1 | 2 semanas | CRUD productos, busqueda Meilisearch, API keys |
| 4 | Cart Service | Carrito y checkout | Fase 2, Fase 3 | 2 semanas | Carrito guest+auth, cupones, preview checkout |
| 5 | Order Service | Pedidos y envios | Fase 2, Fase 4 | 2 semanas | State machine, historial, envios |
| 6 | Payment Service | Procesamiento de pagos | Fase 5 | 2 semanas | Providers de pago, webhooks, reembolsos |
| 7 | Inventory Service | Stock independiente | Fase 3 | 2 semanas | Movimientos, alertas, API standalone |
| 8 | Engagement Service | Reviews y favoritos | Fase 2, Fase 3 | 1 semana | Resenas con moderacion, wishlist |
| 9 | Notification Service | Notificaciones multi-canal | Fase 2 | 1 semana | Email, push, database log |
| 10 | Platform Config | Configuracion de tienda | Fase 0 | 1 semana | Settings, page builder config |
| 11 | Integration and Testing | Tests E2E y validacion | Todas | 2 semanas | Contract tests, load tests, E2E |
| 12 | Frontend Update | Actualizar Nuxt 3 | Fase 1 | 2 semanas | Frontend consume via Gateway |
| 13 | Production Deploy | Despliegue Kubernetes | Todas | 1 semana | K8s cluster, CI/CD completo |

**Duracion total estimada: 22 semanas (~5.5 meses)**

### Cronograma Visual

```
Semana:  1    3    5    9    13   17   21   27   33   38
         │    │    │    │    │    │    │    │    │    │
Fase 0:  ████
Fase 1:        ████████
Fase 2:              ████████
Fase 3:              ████████
Fase 4:                    ████████
Fase 5:                          ████████
Fase 6:                                ████████
Fase 7:                    ████████
Fase 8:                          ████
Fase 9:                    ████
Fase 10:       ████
Fase 11:                                      ████████
Fase 12:       ████████
Fase 13:                                            ████
```

---

# 3. Desarrollo Detallado por Fase

## Fase 0: Infraestructura Base

### Objetivo de la Fase
Establecer la infraestructura base compartida: Docker Compose para desarrollo local, shared library de codigo comun, y pipeline CI/CD base.

### Entregables
- `docker-compose.yml` con todos los servicios base
- Estructura de directorios para 10 servicios Laravel
- GitHub Actions workflow base
- Configuracion de Traefik para desarrollo local

### Tareas Especificas

#### Tarea 0.1: Configurar estructura de repositorio
- **Descripcion:** Crear la estructura de directorios para alojar los 10 microservicios Laravel
- **Pasos:**
  1. Crear directorio `api-gateway/` para el API Gateway
  2. Crear directorio `services/` con subdirectorios: `identity`, `catalog`, `cart`, `order`, `payment`, `inventory`, `engage`, `notification`, `platform-config`
  3. Crear directorio `shared/` para modelos, traits y utilidades compartidas
  4. Crear directorio `k8s/` para manifests de Kubernetes
  5. Crear directorio `.github/workflows/` para CI/CD
- **Criterio de finalizacion:** Estructura de directorios creada y documentada
- **Pruebas:** Verificar que todos los directorios existen

#### Tarea 0.2: Crear shared library Laravel
- **Descripcion:** Crear paquete compartido con utilidades comunes en PHP
- **Contenido:**
  - Traits: `HasTenant`, `ApiResponse`, `UuidTrait`
  - Enums: `OrderStatus`, `PaymentStatus`, `ShippingStatus`
  - Interfaces: `ApiResponse`, `PaginatedResponse`
  - Servicios: `ApiResponseService`, `PaginationService`
- **Criterio de finalizacion:** Paquete utilizable por todos los servicios
- **Pruebas:** Tests unitarios para cada utilidad

#### Tarea 0.3: Configurar Docker Compose base
- **Descripcion:** Crear `docker-compose.yml` con infraestructura compartida
- **Servicios a incluir:**
  - Redis 7 (cache)
  - RabbitMQ 3.13 (eventos)
  - Meilisearch 1.5 (busqueda)
  - PostgreSQL 16 (base de datos para cada servicio)
- **Criterio de finalizacion:** `docker-compose up -d` levanta todos los servicios
- **Pruebas:** Verificar que cada servicio esta accesible en su puerto

#### Tarea 0.4: Configurar proyecto base Laravel
- **Descripcion:** Crear configuracion base de Laravel para cada microservicio
- **Pasos:**
  1. Inicializar cada servicio con `composer create-project laravel/laravel`
  2. Configurar `bootstrap/app.php` base
  3. Configurar `routes/api.php` con health check
  4. Crear `Dockerfile` para cada servicio (PHP-FPM + Nginx)
- **Criterio de finalizacion:** Cada servicio compila y ejecuta sin errores
- **Pruebas:** `php artisan serve` exitoso en cada servicio

#### Tarea 0.5: Configurar pipeline CI/CD base
- **Descripcion:** Crear GitHub Actions workflow para CI/CD
- **Jobs a incluir:**
  - Lint (PHP-CS-Fixer + PHPStan)
  - Unit tests (PHPUnit)
  - Build Docker image
  - Push a registry (para merge a main)
- **Criterio de finalizacion:** Pipeline ejecuta exitosamente en PR
- **Pruebas:** Crear PR de prueba y verificar que CI pasa

### Criterios de Finalizacion de Fase
- [ ] Docker Compose levanta infraestructura base
- [ ] Shared library Laravel utilizable
- [ ] Cada servicio Laravel compila
- [ ] Pipeline CI/CD funcional
- [ ] Documentacion de setup inicial

### Pruebas Obligatorias
- **Unit tests:** Shared library con >90% cobertura
- **Integration tests:** Docker Compose health checks
- **Validacion manual:** `docker-compose up` sin errores

### Riesgos
| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Conflictos de puertos | Media | Definir mapa de puertos claro desde el inicio |
| Dependencias incompatibles | Baja | Usar versiones LTS de todas las dependencias |
| Docker Compose lento | Media | Usar volumes mount para desarrollo |

---

## Fase 1: API Gateway (Laravel)

### Objetivo de la Fase
Crear el API Gateway con Laravel 11 que centraliza el routing, autenticacion, rate limiting y proxy a los microservicios.

### Entregables
- `api-gateway` completo con Laravel 11
- Routing centralizado a todos los microservicios
- Autenticacion JWT centralizada
- Rate limiting por ruta y tenant
- CORS configurado
- Logging de requests

### Tareas Especificas

#### Tarea 1.1: Instalar y configurar Laravel 11
- **Descripcion:** Crear proyecto Laravel 11 para el API Gateway
- **Pasos:**
  1. Crear proyecto: `composer create-project laravel/laravel api-gateway`
  2. Configurar `.env` con variables de entorno
  3. Configurar CORS en `config/cors.php`
  4. Instalar dependencias: `laravel/sanctum`, `guzzlehttp/guzzle`
- **Criterio de finalizacion:** Laravel instalado y funcionando
- **Pruebas:** `php artisan serve` ejecuta sin errores

#### Tarea 1.2: Configurar routing centralizado
- **Descripcion:** Definir rutas para cada microservicio
- **Tabla de routing:**
  | Ruta Gateway | Microservicio Destino | Rate Limit |
  |-------------|----------------------|------------|
  | /api/v1/auth/* | identity-service:8001 | 10/min |
  | /api/v1/productos/* | catalog-service:8002 | 120/min |
  | /api/v1/categorias/* | catalog-service:8002 | 120/min |
  | /api/v1/carrito/* | cart-service:8003 | 60/min |
  | /api/v1/checkout/* | cart-service:8003 | 30/min |
  | /api/v1/pedidos/* | order-service:8004 | 30/min |
  | /api/v1/pagos/* | payment-service:8005 | 30/min |
  | /api/v1/admin/inventario/* | inventory-service:8006 | 60/min |
  | /api/v1/resenas/* | engage-service:8007 | 30/min |
  | /api/v1/favoritos/* | engage-service:8007 | 60/min |
  | /api/v1/notificaciones/* | notification-service:8008 | 60/min |
  | /api/v1/configuracion/* | platform-config-service:8009 | 120/min |
- **Criterio de finalizacion:** Todas las rutas funcionan correctamente
- **Pruebas:** Tests de routing para cada servicio

#### Tarea 1.3: Implementar middleware de autenticacion JWT
- **Descripcion:** Middleware que valida tokens JWT
- **Logica:**
  1. Extraer token del header `Authorization: Bearer {token}`
  2. Validar token con JWT secret
  3. Decodificar payload y extraer user info
  4. Inyectar headers: `X-User-Id`, `X-User-Roles`, `X-Tenant-Id`
  5. Para rutas publicas, skip de validacion
- **Criterio de finalizacion:** Autenticacion centralizada funcional
- **Pruebas:** Tests para rutas protegidas y publicas

#### Tarea 1.4: Implementar proxy a microservicios
- **Descripcion:** Servicio que proxea requests a microservicios
- **Implementacion:**
  ```php
  class MicroserviceProxy {
      public function forward(string $service, string $method, array $data = []): mixed {
          $url = config("services.{$service}.url");
          $response = Http::withHeaders($this->getHeaders())->$method($url, $data);
          return $response->json();
      }
  }
  ```
- **Criterio de finalizacion:** Proxy funcional con manejo de errores
- **Pruebas:** Tests de integracion con microservicios mock

#### Tarea 1.5: Implementar rate limiting
- **Descripcion:** Rate limiting por ruta y tenant
- **Configuracion:**
  - Global: 1000 requests/min
  - Per-tenant: 120 requests/min
  - Per-route: segun tabla de routing
- **Implementacion:** Laravel RateLimiter con Redis
- **Criterio de finalizacion:** Rate limiting activo
- **Pruebas:** Tests de rate limiting

#### Tarea 1.6: Configurar CORS
- **Descripcion:** CORS centralizado para el frontend
- **Configuracion:**
  - Origins: `http://localhost:3000`, `https://*.commerceos.com`
  - Methods: GET, POST, PUT, DELETE, OPTIONS
  - Headers: Authorization, Content-Type, X-Tenant-Id
- **Criterio de finalizacion:** CORS funcional
- **Pruebas:** Tests de CORS desde el frontend

#### Tarea 1.7: Implementar logging de requests
- **Descripcion:** Logging de todas las requests al Gateway
- **Implementacion:**
  - Middleware que loguea: method, path, status, duration, user_id, tenant_id
  - Formato JSON para Loki/ELK
- **Criterio de finalizacion:** Logging funcional
- **Pruebas:** Verificar logs en formato correcto

### Criterios de Finalizacion de Fase
- [ ] Laravel Gateway desplegado y funcionando
- [ ] Todas las rutas configuradas
- [ ] Autenticacion JWT centralizada
- [ ] Rate limiting activo
- [ ] CORS funcional
- [ ] Logging de requests activo
- [ ] Tests con >80% cobertura

### Pruebas Obligatorias
- **Unit tests:** Services, Middleware, Controllers
- **Integration tests:** Routing a cada microservicio
- **Validacion manual:** Login desde Postman/Insomnia

### Riesgos
| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Latencia adicional del Gateway | Media | Cache de respuestas, connection pooling |
| Single point of failure | Media | Deploy con replicacion, health checks |
| Configuracion erronea | Media | Tests de routing en CI/CD |

---

# 4. Definicion de Microservicios

## 4.1 identity-service (Puerto 8001)

**Responsabilidad:** Gestion de usuarios, autenticacion, autorizacion, roles, permisos, direcciones.

**APIs Principales:**
- POST /api/v1/register - Crear usuario
- POST /api/v1/login - Autenticar usuario
- POST /api/v1/logout - Cerrar sesion
- GET /api/v1/perfil - Obtener perfil
- PUT /api/v1/perfil - Actualizar perfil
- GET/POST/PUT/DELETE /api/v1/direcciones - CRUD direcciones
- GET /api/v1/admin/usuarios - Listar usuarios (admin)

**Base de Datos:** identity_db (users, roles, role_user, addresses, verification_codes, personal_access_tokens)

**Dependencias:** Redis (cache tokens), RabbitMQ (eventos)

**Eventos Publicados:** UserCreated, UserUpdated, UserDeleted

**Eventos Consumidos:** Ninguno

**Autenticacion:** JWT Access Token (16h) + Refresh Token (7d)

**Autorizacion:** RBAC (admin, vendedor, cliente) con permisos granulares

---

## 4.2 catalog-service (Puerto 8002)

**Responsabilidad:** Productos, categorias, marcas, etiquetas, variantes, atributos, imagenes. API publica independiente.

**APIs Principales:**
- GET /api/v1/productos - Listar productos (publico)
- GET /api/v1/productos/{slug} - Detalle producto
- GET /api/v1/categorias, /api/v1/marcas, /api/v1/etiquetas - Catalogos publicos
- POST/PUT/DELETE /api/v1/admin/productos - CRUD admin
- POST/PUT/DELETE /api/v1/admin/categorias, marcas, etiquetas - CRUD admin

**Base de Datos:** catalog_db (products, categories, brands, tags, product_tag, product_images, product_variants, variant_attributes, variant_attribute_values)

**Dependencias:** Meilisearch (busqueda), Redis (cache)

**Eventos Publicados:** ProductCreated, ProductUpdated, ProductDeleted, RatingUpdated

**Eventos Consumidos:** ReviewCreated (actualizar rating)

**Autenticacion:** JWT para admin, API keys para acceso externo

**Autorizacion:** Lectura publica, escritura requiere permisos productos.*

---

## 4.3 cart-service (Puerto 8003)

**Responsabilidad:** Carrito de compras (guest + auth), preview de checkout, cupones.

**APIs Principales:**
- GET /api/v1/carrito - Obtener carrito
- POST /api/v1/carrito/items - Agregar item
- PUT/DELETE /api/v1/carrito/items/{item} - Gestionar items
- POST /api/v1/checkout/preview - Preview checkout
- POST /api/v1/cupones/aplicar - Aplicar cupon
- CRUD /api/v1/admin/cupones - Gestionar cupones

**Base de Datos:** cart_db (carts, cart_items, coupons, coupon_user)

**Dependencias:** Redis (cache), catalog-service (precios via HTTP), identity-service (usuario via HTTP)

**Eventos Publicados:** CartUpdated

**Eventos Consumidos:** ProductPriceChanged

**Autenticacion:** JWT para auth, session_id para guest

---

## 4.4 order-service (Puerto 8004)

**Responsabilidad:** Creacion de pedidos, ciclo de vida (state machine), historial, envios.

**APIs Principales:**
- POST /api/v1/pedidos - Crear pedido
- GET /api/v1/pedidos - Listar pedidos usuario
- GET /api/v1/pedidos/{id} - Detalle pedido
- POST /api/v1/admin/pedidos/{id}/estado - Cambiar estado
- CRUD /api/v1/admin/envios - Gestionar envios
- GET /api/v1/envios/tracking/{trackingNumber} - Tracking publico

**Base de Datos:** order_db (orders, order_items, order_status_histories, shipments, shipping_methods)

**Dependencias:** cart-service, catalog-service, identity-service (HTTP), payment-service, inventory-service, notification-service (eventos)

**Eventos Publicados:** OrderCreated, OrderStatusChanged, OrderPaid, OrderCancelled

**Eventos Consumidos:** PaymentCompleted, PaymentFailed

**State Machine:** nuevo -> pagado -> preparando -> enviado -> entregado | cancelado | reembolsado

---

## 4.5 payment-service (Puerto 8005)

**Responsabilidad:** Procesamiento de pagos, webhooks, reembolsos.

**APIs Principales:**
- POST /api/v1/pedidos/{id}/pagar - Iniciar pago
- POST /api/v1/webhooks/pagos/{provider} - Webhook
- CRUD admin pagos y configuracion

**Base de Datos:** payment_db (payments, refunds)

**Dependencias:** platform-config-service (credenciales via HTTP), order-service (eventos)

**Eventos Publicados:** PaymentCompleted, PaymentFailed, RefundProcessed

**Eventos Consumidos:** OrderCreated

**Providers:** Stripe, MercadoPago, PayPal, Wompi

---

## 4.6 inventory-service (Puerto 8006)

**Responsabilidad:** Movimientos de stock, alertas de bajo inventario.

**APIs Principales:**
- GET/POST /api/v1/admin/inventario/movimientos - CRUD movimientos
- GET/POST /api/v1/admin/inventario/alertas - CRUD alertas

**Base de Datos:** inventory_db (stock_movements, stock_alerts)

**Dependencias:** catalog-service (HTTP), order-service, notification-service (eventos)

**Eventos Publicados:** StockLow, StockMovement

**Eventos Consumidos:** OrderPaid (deducir stock), OrderCancelled (devolver stock)

---

## 4.7 engage-service (Puerto 8007)

**Responsabilidad:** Resenas (con moderacion), wishlist/favoritos.

**APIs Principales:**
- GET /api/v1/productos/{id}/resenas - Resenas publicas
- POST /api/v1/productos/{id}/resenas - Crear resena
- CRUD /api/v1/favoritos - Gestionar favoritos
- CRUD admin /api/v1/admin/resenas - Moderar resenas

**Base de Datos:** engage_db (reviews, wishlist_items)

**Eventos Publicados:** ReviewCreated, ReviewApproved, MoveToCart

---

## 4.8 notification-service (Puerto 8008)

**Responsabilidad:** Notificaciones multi-canal (email, push, database).

**APIs Principales:**
- GET /api/v1/notificaciones - Listar notificaciones
- POST /api/v1/notificaciones/push/subscribir - Suscribir push
- POST /api/v1/notificaciones/push/desuscribir - Desuscribir push
- GET /api/v1/configuracion/vapid-public-key - Clave VAPID

**Base de Datos:** notification_db (notification_logs, push_subscriptions)

**Eventos Consumidos:** OrderCreated, OrderStatusChanged, PaymentCompleted, LowStockAlert, ReviewApproved

---

## 4.9 platform-config-service (Puerto 8009)

**Responsabilidad:** Configuracion de tienda, settings dinamicos, configuracion de pagos.

**APIs Principales:**
- GET /api/v1/configuracion/publica - Config publica
- GET /api/v1/configuracion/tienda, completa - Config tienda
- GET/PUT /api/v1/admin/configuracion - CRUD admin

**Base de Datos:** config_db (settings)

**Dependencias:** Redis (cache)

**Eventos Publicados:** ConfigUpdated
---

# 5. API Gateway

## 5.1 Arquitectura

Traefik v3 como API Gateway central con:
- Rate Limiter (global, per-tenant, per-route)
- Auth Middleware (JWT validation, tenant context, RBAC)
- Router (tabla de enrutamiento por servicio)
- Circuit Breaker (5s timeout, 5 errores, 30s reset)
- Request Transformer (header injection: X-Request-Id, X-Tenant-Id, X-User-Id)
- CORS Handler
- Load Balancer (round-robin)

## 5.2 Tabla de Enrutamiento

| Ruta Gateway | Servicio Destino | Rate Limit | Auth |
|-------------|-----------------|------------|------|
| /api/v1/auth/* | identity-service:8001 | 10/min | No |
| /api/v1/productos/* | catalog-service:8002 | 120/min | No (lectura), Si (admin) |
| /api/v1/categorias/* | catalog-service:8002 | 120/min | No (lectura), Si (admin) |
| /api/v1/marcas/* | catalog-service:8002 | 120/min | No (lectura), Si (admin) |
| /api/v1/etiquetas/* | catalog-service:8002 | 120/min | No (lectura), Si (admin) |
| /api/v1/carrito/* | cart-service:8003 | 60/min | No (guest), Si (auth) |
| /api/v1/checkout/* | cart-service:8003 | 30/min | Si |
| /api/v1/cupones/* | cart-service:8003 | 30/min | Si (aplicar), Admin (CRUD) |
| /api/v1/pedidos/* | order-service:8004 | 30/min | Si |
| /api/v1/admin/pedidos/* | order-service:8004 | 60/min | Si + admin |
| /api/v1/envios/* | order-service:8004 | 30/min | Si (tracking), Admin |
| /api/v1/pagos/* | payment-service:8005 | 30/min | No (webhooks), Si (pagar) |
| /api/v1/admin/pagos/* | payment-service:8005 | 60/min | Si + admin |
| /api/v1/admin/inventario/* | inventory-service:8006 | 60/min | Si + admin |
| /api/v1/resenas/* | engage-service:8007 | 30/min | No (lectura), Si (escritura) |
| /api/v1/favoritos/* | engage-service:8007 | 60/min | Si |
| /api/v1/notificaciones/* | notification-service:8008 | 60/min | Si |
| /api/v1/configuracion/* | platform-config-service:8009 | 120/min | No (publica), Si (admin) |
| /api/v1/admin/configuracion/* | platform-config-service:8009 | 30/min | Si + admin |

## 5.3 Políticas de Seguridad

**Autenticacion Centralizada:**
1. Gateway valida JWT contra identity-service una vez
2. Inyecta headers: X-User-Id, X-User-Roles, X-Tenant-Id
3. Servicios confian en headers del gateway (zero trust interno)

**Rate Limiting:** Global 1000/min, Per-tenant 120/min, Per-route configurable

**Circuit Breaker:** Timeout 5s, Error threshold 5, Reset timeout 30s, Half-open 1 req/30s

**CORS:** Origins: localhost:3000, *.commerceos.com | Methods: GET, POST, PUT, DELETE, OPTIONS

## 5.4 Manejo de JWT

**Estructura:**
`json
{
  "sub": 123,
  "tenant_id": "tenant_abc",
  "roles": ["admin"],
  "permissions": ["productos.*"],
  "iat": 1700000000,
  "exp": 1700057600,
  "iss": "commerceos-gateway"
}
`

**Flujo:** Extraer token -> Validar firma -> Verificar expiracion -> Consultar permisos frescos (cache 5min) -> Inyectar headers

## 5.5 Versionamiento

- URL versioning: /api/v1/, /api/v2/
- Backward compatibility: nunca romper contratos existentes
- Deprecation policy: 6 meses de soporte para versiones anteriores

---

# 6. Seguridad

## 6.1 JWT Access Token

- **Algoritmo:** RS256 (asymmetric)
- **Expiracion:** 16 horas
- **Emisor:** commerceos-gateway
- **Almacenamiento:** HttpOnly cookie + memory

## 6.2 Refresh Token

- **Expiracion:** 7 dias
- **Almacenamiento:** HttpOnly cookie, secure, same-site strict
- **Rotacion:** Nuevo refresh token en cada uso
- **Invalidacion:** Logout invalida todos los refresh tokens del usuario

## 6.3 Roles y Permisos

**Roles:** admin (acceso completo), vendedor (productos/pedidos/inventario), cliente (compras/pedidos/resenas)

**Permisos:** productos.crear, productos.editar, productos.eliminar, productos.categorias.*, productos.marcas.*, productos.etiquetas.*, inventario.ver, inventario.movimientos.crear, inventario.alertas.*, pedidos.ver, pedidos.gestionar, pagos.ver, pagos.gestionar, envios.ver, envios.crear, envios.gestionar, cupones.ver, cupones.crear, cupones.editar, cupones.eliminar, reviews.moderar, configuracion.ver, configuracion.editar, reportes.ver

## 6.4 Multi-Tenant

**Estrategia:** Database-per-tenant para datos transaccionales, Shared DB + tenant_id para catalogo

**Resolucion:** Header X-Tenant-Id | Subdomain tenant-abc.commerceos.com | Custom domain mitienda.com

| Servicio | Estrategia |
|----------|-----------|
| identity-service | DB per tenant |
| catalog-service | Shared DB + tenant_id |
| cart-service | DB per tenant |
| order-service | DB per tenant |
| payment-service | DB per tenant |
| inventory-service | DB per tenant |
| engage-service | Shared DB + tenant_id |
| notification-service | DB per tenant |
| platform-config-service | DB per tenant |

## 6.5 API Keys

Tabla api_keys: key, name, permissions, rate_limit, expires_at
Header: X-API-Key: {key}
Rate limiting por API key

## 6.6 Validacion entre Microservicios

- HTTP + JWT: cada servicio valida JWT internamente
- Headers de contexto: X-User-Id, X-User-Roles
- Cache de tokens validados en Redis (TTL 5min)
- Zero Trust: no confiar en headers del gateway

## 6.7 Proteccion de Endpoints

- Rate limiting por ruta/tenant/global
- Input Validation: Form Requests con validacion de Laravel
- SQL Injection: Eloquent ORM, parametros parametrizados
- XSS: Sanitizacion de outputs, CSP headers, HttpOnly cookies

## 6.8 Auditoria

**Eventos auditados:** Login/Logout, CRUD de recursos, cambios de estado, cambios de configuracion, accesos a datos sensibles

**Formato:** Logs estructurados JSON con timestamp, level, service, action, user_id, tenant_id, resource, resource_id, changes, ip, user_agent

## 6.9 Logs de Seguridad

**Eventos:** Login exitoso/fallido, token expirado/invalido, rate limit excedido, acceso no autorizado, cambio de contrasena, rotacion de API keys

**Retencion:** 90 dias en Loki, alertas para patrones sospechosos
---

# 7. Estrategia de Testing

## 7.1 Cobertura Minima Requerida

| Tipo | Cobertura Minima |
|------|-----------------|
| Unit tests | 80% |
| Integration tests | 70% |
| Contract tests | 100% de contratos |
| E2E tests | Flujos criticos |

## 7.2 Unit Tests

**Framework:** PHPUnit + Laravel Testing

**Por Servicio:** Services (logica de negocio), Controllers (manejo de requests), Middleware (logica transversal), Policies (autorizacion), Form Requests (validacion)

## 7.3 Contract Tests

**Framework:** Pact (contract testing), HTTP contracts con OpenAPI

**Contratos a definir:**
- identity-service <-> todos los servicios
- catalog-service <-> cart-service, order-service, inventory-service
- cart-service <-> order-service
- order-service <-> payment-service, inventory-service

## 7.4 Integration Tests

**Framework:** Laravel HTTP Testing, Http::fake(), Testcontainers (bases de datos)

**Flujos:**
1. Login -> Agregar al carrito -> Crear pedido -> Pagar
2. Crear producto -> Agregar stock -> Comprar -> Deducir stock
3. Crear resena -> Aprobar -> Actualizar rating

## 7.5 End-to-End Tests

**Framework:** Playwright (browser automation)

**Escenarios:** Flujo completo de compra, administracion de productos, gestion de pedidos, busqueda y filtrado

## 7.6 Smoke Tests

**Proposito:** Verificar que el sistema esta operativo despues de un deploy

**Endpoints criticos:** Health checks de cada servicio, login, listado productos, configuracion publica

## 7.7 Regression Tests

- Ejecutar suite completa en cada PR
- Ejecutar smoke tests despues de cada deploy
- Ejecutar E2E tests semanales

## 7.8 Performance Tests

**Framework:** k6 / Locust

| Escenario | Usuarios | Duracion | SLA |
|-----------|----------|----------|-----|
| Catalogo | 100 | 5min | p95 < 100ms |
| Checkout | 50 | 5min | p95 < 200ms |
| Pagos | 10 | 5min | p95 < 500ms |
| Busqueda | 200 | 5min | p95 < 150ms |

---

# 8. Estrategia de Despliegue

## 8.1 Docker

**Multi-stage build:** Builder (instala dependencias PHP) + Runtime (solo archivos necesarios, ~100MB por imagen)

**Dockerfile base:** php:8.3-fpm-alpine, composer install --no-dev, php artisan config:cache

## 8.2 Docker Compose (Desarrollo Local)

**Servicios:** 10 microservicios Laravel, 9 bases de datos PostgreSQL, Redis, RabbitMQ, Meilisearch

**Comandos:**
- docker-compose up -d (iniciar)
- docker-compose logs -f service (logs)
- docker-compose build --no-cache (reconstruir)

## 8.3 Kubernetes (Produccion)

**Estructura:** k8s/base/{service}/ (deployment, service, hpa, pdb), k8s/ingress/, k8s/observability/, k8s/databases/

**Por servicio:** Deployment (2+ replicas), Service (ClusterIP), HPA (autoscaling), PDB (disruption budget)

**Probes:** livenessProbe (/health/live), readinessProbe (/health/ready)

## 8.4 CI/CD

**Pipeline:** PHP-CS-Fixer Lint -> PHPStan Analysis -> PHPUnit Tests -> Build Docker Image -> Push to Registry -> Deploy to K8s -> Smoke Tests

**Herramientas:** GitHub Actions, Docker, Kubernetes

## 8.5 Variables de Entorno

**Por servicio:** DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, REDIS_URL, RABBITMQ_URL, JWT_SECRET, MEILISEARCH_HOST

**Kubernetes:** ConfigMap (valores no sensibles) + Secret (valores sensibles)

## 8.6 Secrets Management

- Desarrollo: .env files (no commiteados)
- Kubernetes: Secrets + External Secrets Operator
- Cloud: AWS Secrets Manager / GCP Secret Manager
- Rotacion: JWT secret cada 90 dias, DB passwords manual, API keys automatica

---

# 9. Observabilidad

## 9.1 Logging Centralizado

**Stack:** Fluent Bit (collect) -> Loki (store) -> Grafana (query/visualization)

**Formato JSON estandarizado:**
`json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error|debug",
  "service": "nombre-servicio",
  "trace_id": "correlation-id",
  "tenant_id": "tenant-id",
  "user_id": 123,
  "method": "POST",
  "path": "/api/v1/pedidos",
  "status": 201,
  "duration_ms": 45,
  "message": "descripcion del evento",
  "context": {}
}
`

## 9.2 Metricas (Prometheus)

**HTTP Metrics:** http_requests_total, http_request_duration_seconds, http_request_size_bytes, http_response_size_bytes

**Business Metrics:** orders_created_total, payments_processed_total, inventory_movements_total, reviews_created_total, active_carts_total

**Infrastructure Metrics:** db_connection_pool_active, cache_hit_ratio, queue_messages_pending, circuit_breaker_state

## 9.3 Trazabilidad Distribuida

**Stack:** OpenTelemetry SDK -> Jaeger (backend) -> Grafana (visualization)

**Propagacion:** TraceContext propagation via headers entre servicios

**Ejemplo de trace:**
`
[Gateway] POST /api/v1/pedidos (12ms)
  [identity-service] ValidateToken (2ms)
  [cart-service] GetCart (5ms)
    [catalog-service] GetProductPrices (3ms)
  [identity-service] GetAddresses (4ms)
  [order-service] CreateOrder (8ms)
    [catalog-service] GetProducts (3ms)
  [notification-service] QueueNotification (1ms)
Total: 45ms
`

## 9.4 Alertas

**Reglas:**
- HighErrorRate: rate(5..) > 5% por 5min -> critical
- HighLatency: p95 > 500ms por 5min -> warning
- CircuitBreakerOpen: estado open por 1min -> warning
- HighMemory: uso > 80% por 5min -> warning

**Canales:** Slack (tiempo real), Email (criticas), PagerDuty (incidentes)

## 9.5 Dashboards

| Dashboard | Contenido |
|-----------|-----------|
| Gateway Overview | Requests/s, latencia p50/p95/p99, errores, circuit breakers |
| Service Health | CPU, memoria, connections por servicio |
| Business KPIs | Pedidos/min, revenue, conversion, carritos abandonados |
| Inventory | Stock levels, movimientos/dia, alertas activas |
| Error Tracking | Errores por servicio, tipo, frecuencia, stack traces |

## 9.6 Health Checks

Cada servicio expone:
- GET /health -> { status: "healthy", version, uptime }
- GET /health/ready -> { status: "ready", db, cache }
- GET /health/live -> { status: "alive" }
---

# 10. Checklist Final

## 10.1 Checklist de Migracion

### Fase 0: Infraestructura
- [ ] Docker Compose levanta infraestructura base
- [ ] Shared library publicable
- [ ] Pipeline CI/CD funcional
- [ ] Documentacion de setup inicial

### Fase 1: API Gateway
- [ ] Routing a todos los microservicios
- [ ] Autenticacion JWT centralizada
- [ ] Rate limiting activo
- [ ] CORS funcional
- [ ] Logging de requests
- [ ] Health checks activos

### Fase 2: Identity Service
- [ ] Login/logout/register funcionan
- [ ] Perfil CRUD funcional
- [ ] Direcciones CRUD funcional
- [ ] Roles y permisos funcionan
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 3: Catalog Service
- [ ] CRUD productos funcional
- [ ] CRUD categorias funcional
- [ ] CRUD marcas y etiquetas funcional
- [ ] Variantes de producto funcionales
- [ ] Busqueda Meilisearch funcional
- [ ] API keys configuradas
- [ ] Documentacion OpenAPI publicada
- [ ] Tests con >80% cobertura

### Fase 4: Cart Service
- [ ] Carrito funcional para guest y auth
- [ ] Preview de checkout calcula correctamente
- [ ] Cupones funcionan con validacion
- [ ] Integracion HTTP con catalog-service
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 5: Order Service
- [ ] Pedidos con state machine funcional
- [ ] Envios funcionales
- [ ] Comunicacion asincrona con eventos
- [ ] Integraciones HTTP funcionales
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 6: Payment Service
- [ ] Pagos procesados correctamente
- [ ] Webhooks funcionales
- [ ] Reembolsos funcionales
- [ ] Configuracion de pagos funcional
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 7: Inventory Service
- [ ] Movimientos de stock funcionales
- [ ] Alertas de bajo inventario funcionales
- [ ] Integracion HTTP con order-service
- [ ] Integracion HTTP con catalog-service
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 8: Engagement Service
- [ ] Resenas con moderacion funcionales
- [ ] Favoritos funcionales
- [ ] Comunicacion asincrona con eventos
- [ ] Integraciones HTTP funcionales
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 9: Notification Service
- [ ] Notificaciones multi-canal funcionales
- [ ] Suscripciones push funcionales
- [ ] Consumo de eventos funcionando
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 10: Platform Config Service
- [ ] Configuracion funcional
- [ ] Cache de configuracion funcionando
- [ ] Health checks activos
- [ ] Tests con >80% cobertura

### Fase 11: Integration and Testing
- [ ] Contract tests pasan
- [ ] Integration tests pasan
- [ ] Load tests cumplen SLA
- [ ] E2E tests pasan
- [ ] Observabilidad validada

### Fase 12: Frontend Update
- [ ] Frontend conecta con Gateway
- [ ] Todos los composables funcionan
- [ ] Manejo de errores robusto
- [ ] Offline sync funcional
- [ ] Flujos completos validados

### Fase 13: Production Deploy
- [ ] Kubernetes cluster funcional
- [ ] Infraestructura de datos desplegada
- [ ] Microservicios desplegados
- [ ] CI/CD completo
- [ ] Monitoreo y alertas configurados
- [ ] Sistema validado en produccion

## 10.2 Checklist de Calidad

### Codigo
- [ ] Linting sin errores (PHP-CS-Fixer)
- [ ] Analisis estatico (PHPStan)
- [ ] Formato consistente (PHP-CS-Fixer)
- [ ] Sin dependencias deprecated

### Tests
- [ ] Unit tests >80% cobertura
- [ ] Integration tests pasan
- [ ] Contract tests pasan
- [ ] E2E tests pasan
- [ ] Load tests cumplen SLA

### Seguridad
- [ ] JWT rotation configurada
- [ ] Rate limiting activo
- [ ] Input validation completa
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] Secrets no expuestos

### Observabilidad
- [ ] Logs estructurados funcionando
- [ ] Metricas Prometheus activas
- [ ] Trazas distributed funcionando
- [ ] Alertas configuradas
- [ ] Dashboards accesibles

### Despliegue
- [ ] Docker images optimizadas
- [ ] Kubernetes manifests validos
- [ ] CI/CD pipeline funcional
- [ ] Rollback plan documentado
- [ ] Backup y restore probados

## 10.3 Checklist de Documentacion

### Tecnica
- [ ] API documentation (OpenAPI)
- [ ] Architecture decision records
- [ ] Runbook para operaciones
- [ ] Troubleshooting guide

### Operacional
- [ ] Deployment guide
- [ ] Environment variables documentadas
- [ ] Secrets management documentado
- [ ] Monitoring guide

### Desarrollo
- [ ] Contributing guide
- [ ] Development setup guide
- [ ] Testing guide
- [ ] Code review checklist

---

## Apéndice A: Comando de Inicio Rapido

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd template_front

# 2. Crear estructura de servicios
mkdir -p api-gateway services/{identity,catalog,cart,order,payment,inventory,engage,notification,platform-config}

# 3. Levantar infraestructura base
docker-compose up -d redis rabbitmq meilisearch postgres

# 4. Instalar dependencias de cada servicio
for service in api-gateway services/*/; do
  cd $service
  composer install
  cd ..
done

# 5. Ejecutar migraciones
for service in api-gateway services/*/; do
  cd $service
  php artisan migrate
  cd ..
done

# 6. Iniciar servicios
docker-compose up -d

# 7. Verificar health checks
curl http://localhost:8000/health  # API Gateway
curl http://localhost:8001/health  # Identity Service
curl http://localhost:8002/health  # Catalog Service

# 8. Acceder a Traefik dashboard
open http://localhost:8080
```

## Apéndice B: Comandos Utiles

```bash
# Ver logs de un servicio
docker-compose logs -f identity-service

# Reconstruir un servicio
docker-compose build --no-cache identity-service

# Ejecutar tests
cd services/identity && php artisan test

# Ejecutar lint
cd services/identity && ./vendor/bin/php-cs-fixer fix

# Ejecutar analisis estatico
cd services/identity && ./vendor/bin/phpstan analyse

# Ver metricas de Prometheus
open http://localhost:9090

# Ver dashboards de Grafana
open http://localhost:3000
```

## Apéndice C: Eventos del Sistema

| Evento | Emisor | Consumidor(es) | Datos |
|--------|--------|----------------|-------|
| OrderCreated | order-service | payment-service | orderId, userId, total, currency |
| OrderPaid | payment-service | order-service, inventory-service | orderId, paymentId, amount |
| OrderCancelled | order-service | inventory-service, notification-service | orderId, reason |
| OrderStatusChanged | order-service | notification-service | orderId, oldStatus, newStatus |
| PaymentCompleted | payment-service | order-service, notification-service | orderId, paymentId, amount |
| PaymentFailed | payment-service | notification-service, order-service | orderId, error |
| RefundProcessed | payment-service | order-service, notification-service | paymentId, refundId, amount |
| ReviewCreated | engage-service | catalog-service | productId, rating |
| ReviewApproved | engage-service | catalog-service, notification-service | productId, reviewId |
| StockLow | inventory-service | notification-service | productId, currentStock, minStock |
| StockMovement | inventory-service | (logging) | productId, type, qty |
| UserCreated | identity-service | (logging) | userId, email |
| ProductCreated | catalog-service | (logging) | productId, name |
| ConfigUpdated | platform-config-service | (logging) | key, value |

## Apéndice D: Dependencias entre Servicios

**Dependencias fuertes (sincronas HTTP):**
- cart-service -> catalog-service (precio para preview)
- order-service -> identity-service (direcciones del usuario)
- order-service -> catalog-service (denormalizar items)
- order-service -> cart-service (obtener items del carrito)
- Todos -> identity-service (validacion de token via API Gateway)
- Todos -> platform-config-service (settings)

**Dependencias debiles (asincronas/eventos):**
- order-service -> payment-service (evento OrderCreated)
- payment-service -> order-service (evento PaymentCompleted)
- order-service -> inventory-service (evento OrderPaid)
- order-service -> notification-service (evento OrderStatusChanged)
- payment-service -> notification-service (evento PaymentCompleted)
- inventory-service -> notification-service (evento LowStockAlert)
- engage-service -> catalog-service (evento ReviewCreated)

---

*Documento generado como plan maestro de ejecucion del proyecto de migracion a microservicios CommerceOS.*
*Ultima actualizacion: 2026-09-17*
