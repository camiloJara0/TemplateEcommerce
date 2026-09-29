# 4 · Plan Scrum

**CommerceOS — tablero de trabajo reutilizable en Trello**
Versión 1.0 · 24/09/2026 · Ordenado por estado: ✅ → 🟡 → 🔴

---

## Índice

1. [Estructura del tablero](#1-estructura-del-tablero)
2. [Definición de terminado](#2-definición-de-terminado)
3. [Historias de usuario (HUs)](#3-historias-de-usuario-hus)
4. [Épicas y asignación](#4-épicas-y-asignación)
5. [Backlog técnico](#5-backlog-técnico)
6. [Casos de prueba](#6-casos-de-prueba)
7. [Riesgos](#7-riesgos)

---

## 1. Estructura del tablero

### Columnas Trello

| # | Columna | Contenido |
|---|---|---|
| 1 | 📋 **Backlog** | HU y tareas priorizadas pero no comprometidas |
| 2 | 📅 **Sprint Backlog** | Seleccionadas para el sprint en curso |
| 3 | 🔄 **En progreso** | En desarrollo (máx. 2 por persona) |
| 4 | 👀 **En revisión** | Pull request / QA funcional |
| 5 | 🧪 **Testing** | Verificación y pruebas automatizadas |
| 6 | ✅ **Hecho** | Aceptada por PO y desplegada |
| 7 | ⛔ **Bloqueadas** | Con dependencia externa (se documenta el bloqueo) |

### Plantilla de tarjeta

```
Título: [HU-001] Iniciar sesión con correo y contraseña
Etiquetas: epic:auth · prioridad:alta · estado:✅
Checklist: criterios de aceptación + tareas técnicas
Adjuntos: enlace a archivo/ruta relevante
Miembros: frontend / backend / QA
```

### Cadencia

| Evento | Duración | Participantes |
|---|---|---|
| Sprint | 2 semanas | todo el equipo |
| Daily | 15 min | equipo |
| Planning | 2 h | equipo + PO |
| Review | 1 h | equipo + PO + stakeholders |
| Retrospectiva | 45 min | equipo |

---

## 2. Definición de terminado

Una tarjeta solo pasa a **✅ Hecho** cuando:

- [ ] El código está implementado en `template_front` y/o `template_back`.
- [ ] `pnpm run lint` y `pnpm run typecheck` sin errores nuevos.
- [ ] `php -l` limpio y `php artisan test` sin regresiones (**objetivo: 78/78**, hoy 70/8).
- [ ] Los criterios de aceptación verificados en entorno local.
- [ ] Comportamiento responsive verificado (≥ 360 px).
- [ ] Validaciones y manejo de errores de servidor reflejados en la UI.
- [ ] Documentación actualizada (SRS estado del RF, Manual si cambia procedimiento).
- [ ] Revisión de código aprobada.

---

## 3. Historias de usuario (HUs)

> Formato **Como… Quiero… Para…** · El orden es ✅ completadas → 🟡 parciales → 🔴 pendientes.

### ✅ Completadas

---

#### HU-001 · Registro de cliente
| | |
|---|---|
| **Como** visitante **quiero** crear una cuenta con correo y contraseña **para** poder comprar y guardar mis datos |
| **Épica** | Autenticación |
| **Estado** | ✅ |
| **Criterios de aceptación** | 1. `POST /api/v1/register` crea usuario con rol `cliente`. 2. Validación: email válido, contraseña ≥ 8. 3. Throttle 5 req/min. 4. Tras registrarse se inicia sesión automáticamente. |
| **Tareas** | UI `/auth/register` · servicio `auth` · tests `AuthTest` |

#### HU-002 · Inicio de sesión con rol
| | |
|---|---|
| **Como** usuario **quiero** iniciar sesión con mi correo **para** acceder a mi área |
| **Épica** | Autenticación · **Estado** ✅ |
| **CA** | 1. Token Bearer de 16 h. 2. Persistencia en cookie `auth_token` (30 d) + IndexedDB. 3. Redirección por jerarquía de rol: Admin → `/admin`, Vendedor → `/admin/pedidos`, Cliente → `/`. 4. Throttle 10 req/min. |

#### HU-003 · Recuperación de contraseña por código
| | |
|---|---|
| **Como** usuario **quiero** recuperar mi contraseña con un código de 6 dígitos **para** recuperar el acceso sin soporte |
| **Épica** | Autenticación · **Estado** ✅ |
| **CA** | 1. Código enviado al correo. 2. 3 envíos / 5 min. 3. Código único, expirable y de un solo uso. 4. Definición de nueva contraseña tras verificar. |

#### HU-004 · Catálogo con búsqueda y filtros
| | |
|---|---|
| **Como** visitante **quiero** buscar y filtrar productos por categoría, marca y precio **para** encontrar lo que necesito rápido |
| **Épica** | Catálogo · **Estado** ✅ |
| **CA** | 1. `GET /productos` con `busqueda`, `categoria_id`, `marca_id`, `tag`, `precio_min/max`, `orden`. 2. Paginación de 24. 3. Búsqueda con sugerencias. 4. Estado vacío amigable. |

#### HU-005 · Ficha de producto con variantes
| | |
|---|---|
| **Como** cliente **quiero** ver variantes (color/talla) con precio y stock propios **para** elegir exactamente lo que quiero |
| **Épica** | Catálogo · **Estado** ✅ |
| **CA** | 1. Selector de variante con combinación visible. 2. Precio/descuento/stock/imagen por variante. 3. Reseñas aprobadas y relacionados. 4. SEO con JSON-LD. |

#### HU-006 · Carrito de compras
| | |
|---|---|
| **Como** cliente **quiero** agregar, modificar y quitar productos del carrito **para** preparar mi compra |
| **Épica** | Comercio · **Estado** ✅ |
| **CA** | 1. Funciona para invitado (`session_id`) y autenticado. 2. No supera el stock disponible. 3. Tasa de actualización 500 ms. 4. Cola offline con reintento. 5. Migración del carrito al iniciar sesión. |

#### HU-007 · Checkout en 3 pasos
| | |
|---|---|
| **Como** cliente **quiero** indicar dirección, envío y cupón **para** finalizar la compra |
| **Épica** | Comercio · **Estado** ✅ |
| **CA** | 1. Dirección obligatoria. 2. Método de envío obligatorio. 3. Totales recalculados por el servidor (`/checkout/preview`). 4. Cupón opcional validado. 5. Pedido nace `nuevo` / pago `pendiente`. |

#### HU-008 · Pago con pasarela activa
| | |
|---|---|
| **Como** cliente **quiero** pagar con la pasarela configurada **para** completar mi pedido |
| **Épica** | Pagos · **Estado** ✅ (parcial por proveedor) |
| **CA** | 1. Formulario según `PAYMENT_PROVIDER`. 2. Registro en `payments`. 3. Confirmación por webhook con firma verificada. 4. Pedido → `pagado`. |

#### HU-009 · Gestión de cupones (admin)
| | |
|---|---|
| **Como** administrador **quiero** crear cupones por porcentaje, monto fijo o envío gratis **para** promocionar ventas |
| **Épica** | Promociones · **Estado** ✅ |
| **CA** | 1. Código único. 2. Vigencia, límite total y por usuario. 3. Subtotal mínimo y tope de descuento. 4. CRUD con permisos `cupones.*`. |

#### HU-010 · CRUD de productos
| | |
|---|---|
| **Como** administrador **quiero** crear, editar, duplicar y eliminar productos **para** mantener el catálogo |
| **Épica** | Catálogo · **Estado** ✅ |
| **CA** | 1. SKU único. 2. Imágenes JPG/PNG/WEBP ≤ 2 MB con reordenamiento. 3. Stock recalculado desde variantes. 4. Borrado lógico. 5. Estado activo/inactivo. |

#### HU-011 · Variantes y atributos
| | |
|---|---|
| **Como** administrador **quiero** definir atributos y variantes reutilizables **para** vender el mismo producto en varias combinaciones |
| **Épica** | Catálogo · **Estado** ✅ |
| **CA** | 1. CRUD de atributos/valores con permisos propios. 2. Bloqueo de borrado en uso (409). 3. SKU único por variante. 4. Stock total = suma de variantes. 5. Tests `VariantAttributeTest` (6/6). |

#### HU-012 · Categorías, marcas y etiquetas
| | |
|---|---|
| **Como** administrador **quiero** clasificar productos con jerarquía, marcas y etiquetas **para** que el cliente filtre |
| **Épica** | Catálogo · **Estado** ✅ |
| **CA** | 1. Categoría con padre (borrar padre no borra hijas). 2. CRUD de marcas/etiquetas desde modales en `/admin/productos`. 3. Bloqueo de borrado de marca con productos. 4. `products_count` en el listado. |

#### HU-013 · Movimientos y alertas de inventario
| | |
|---|---|
| **Como** vendedor **quiero** registrar entradas, salidas y ajustes **para** que el stock sea confiable |
| **Épica** | Inventario · **Estado** ✅ |
| **CA** | 1. Tipos `entrada/salida/devolución/ajuste`. 2. No permite salida > stock. 3. Usuario y referencia trazados. 4. Alerta al caer bajo el mínimo. |

#### HU-014 · Gestión de pedidos (admin)
| | |
|---|---|
| **Como** administrador **quiero** filtrar pedidos y cambiar su estado con comentario **para** operar la venta |
| **Épica** | Pedidos · **Estado** ✅ (detalle parcial) |
| **CA** | 1. Filtros por estado, pago y búsqueda. 2. Cambio de estado con historial. 3. Permisos `pedidos.ver` / `pedidos.gestionar`. |

#### HU-015 · Seguimiento de envíos
| | |
|---|---|
| **Como** cliente **quiero** ver el número de guía y el estado del envío **para** saber cuándo llega mi pedido |
| **Épica** | Logística · **Estado** ✅ |
| **CA** | 1. Tracking público por número de guía. 2. Estados `pendiente → entregado`. 3. Visible en el detalle del pedido. |

#### HU-016 · Reseñas con moderación
| | |
|---|---|
| **Como** cliente **quiero** calificar un producto comprado **para** ayudar a otros compradores |
| **Épica** | Contenido · **Estado** ✅ |
| **CA** | 1. Solo pedido `entregado`. 2. Rating 1–5 y comentario ≤ 2 000. 3. Moderación admin (aprobar/rechazar). 4. `rating_avg`/`reviews_count` denormalizados. |

#### HU-017 · Favoritos
| | |
|---|---|
| **Como** cliente **quiero** guardar productos y moverlos al carrito **para** decidir con calma |
| **Épica** | Comercio · **Estado** ✅ |
| **CA** | 1. Sin duplicados (índice único). 2. Mover al carrito en un clic. 3. Persiste tras iniciar sesión. |

#### HU-018 · Constructor visual de páginas
| | |
|---|---|
| **Como** administrador **quiero** componer la tienda con secciones drag-and-drop **para** tener una web propia sin programar |
| **Épica** | Tienda · **Estado** ✅ |
| **CA** | 1. 24 secciones con variantes y preview. 2. Ordenar/ocultar/duplicar/eliminar. 3. Guardar con cola offline. 4. Undo/Redo. 5. Render en la tienda pública solo de `visible: true`. |

#### HU-019 · Plantillas de ejemplo
| | |
|---|---|
| **Como** administrador **quiero** aplicar una plantilla completa en un clic **para** arrancar rápido |
| **Épica** | Tienda · **Estado** ✅ |
| **CA** | 1. 16 plantillas filtrables. 2. Preview antes de aplicar. 3. Aplicación sobrescribe la configuración (advertencia visible). |

#### HU-020 · Configuración de tienda y estilos globales
| | |
|---|---|
| **Como** administrador **quiero** definir identidad, colores, SEO, navbar y footer **para** unificar la marca |
| **Épica** | Tienda · **Estado** ✅ |
| **CA** | 1. Persistencia por grupo en `settings`. 2. Colores aplicados en tiempo real (variables CSS). 3. `currency` ISO-3 y `tax_rate` 0–1 validados. 4. Navbar/footer dinámicos. |

#### HU-021 · Reportes con exportación
| | |
|---|---|
| **Como** administrador **quiero** exportar ventas, inventario, clientes y productos **para** analizar fuera del sistema |
| **Épica** | Analítica · **Estado** ✅ |
| **CA** | 1. 4 reportes. 2. Formatos CSV/PDF/Excel. 3. Rango de fechas en ventas. 4. Permisos `reportes.ver`. |

#### HU-022 · Perfil y direcciones
| | |
|---|---|
| **Como** cliente **quiero** actualizar mis datos y gestionar direcciones **para** agilizar la compra |
| **Épica** | Cuenta · **Estado** ✅ |
| **CA** | 1. `PUT /perfil` (nombre, teléfono, foto, idioma). 2. CRUD de direcciones con principal. 3. Dirección seleccionable en checkout. |

#### HU-023 · Notificaciones push e in-app
| | |
|---|---|
| **Como** cliente **quiero** recibir avisos del navegador **para** no perder novedades |
| **Épica** | Comunicación · **Estado** ✅ |
| **CA** | 1. Suscripción VAPID con permiso del navegador. 2. Service worker propio con background sync. 3. Centro de notificaciones in-app. |

#### HU-024 · Modo offline / PWA
| | |
|---|---|
| **Como** cliente **quiero** seguir navegando y encolando acciones sin conexión **para** no perder mi avance |
| **Épica** | Plataforma · **Estado** ✅ |
| **CA** | 1. Manifest + SW. 2. Outbox con reintentos y actualización optimista. 3. Sincronización cada 5 min y por background sync. 4. Aviso de estado de red. |

---

### 🟡 Parciales

---

#### HU-025 · Gestión de usuarios del panel
| | |
|---|---|
| **Como** administrador **quiero** crear, editar y eliminar usuarios del equipo **para** controlar el acceso |
| **Épica** | Usuarios · **Estado** 🟡 |
| **CA** | 1. Listado paginado ✅. 2. Crear con rol ✅. 3. **Editar usuario** 🔴 (no existe `PUT /admin/usuarios/{id}`). 4. **Eliminar usuario** 🔴. 5. Proteger `GET/POST` con permiso 🔴. |
| **Bloquea** | HU-026 |

#### HU-026 · Administración de roles y permisos
| | |
|---|---|
| **Como** administrador **quiero** crear roles y asignar permisos desde la UI **para** no depender de un despliegue |
| **Épica** | Usuarios · **Estado** 🔴 |
| **CA** | 1. CRUD de roles. 2. Matriz de permisos editable. 3. Cambio reflejado sin redeploy. 4. Auditoría de cambios. |
| **Hoy** | Solo `config/permissions.php` (file-based) + `RoleSeeder`. |

#### HU-027 · Dashboard con métricas reales
| | |
|---|---|
| **Como** administrador **quiero** ver ventas, clientes y ticket promedio reales **para** decidir con datos |
| **Épica** | Analítica · **Estado** 🟡 |
| **CA** | 1. Conectar `useAdminDashboardService` en todas las tarjetas 🔴 (hoy `Math.random()` en `salesByDay` y KPIs en 0). 2. Top productos, stock bajo y actividad ✅ reales. 3. Embudo y comparativas 🔴. |

#### HU-028 · Multi-pasarela con selector
| | |
|---|---|
| **Como** administrador **quiero** elegir la pasarela desde la UI y ofrecer varias al cliente **para** no cambiar el `.env` |
| **Épica** | Pagos · **Estado** 🟡 |
| **CA** | 1. 6 adaptadores configurados ✅. 2. UI para Rapyd/Stripe/MP/Wompi ✅. 3. Selector de proveedor 🔴. 4. Flujos PayPal y PayU 🔴. 5. Tabla `webhook_events` 🔴. |

#### HU-029 · Envíos con tarifas reales
| | |
|---|---|
| **Como** administrador **quiero** cotizar con el transportista real **para** cobrar envío correcto |
| **Épica** | Logística · **Estado** 🟡 |
| **CA** | 1. 5 adaptadores y estados ✅. 2. Cotización simulada ✅. 3. APIs reales (Servientrega, DHL…) 🔴. 4. `shipments.address_id` 🔴. 5. Relación `Order::shipments()` 🔴 (bug que rompe el pago). |

#### HU-030 · Notificaciones transaccionales por email
| | |
|---|---|
| **Como** cliente **quiero** recibir correos de pedido confirmado, enviado y reembolsado **para** tener constancia |
| **Épica** | Comunicación · **Estado** 🟡 |
| **CA** | 1. SMTP configurable ✅. 2. Log de notificaciones ✅. 3. Plantillas transaccionales 🔴. 4. Cola (`QUEUE_CONNECTION=database`) 🔴. 5. Endpoint de prueba de email 🔴 (no registrado). |

#### HU-031 · Facturación y documentos PDF
| | |
|---|---|
| **Como** administrador **quiero** descargar la factura y la etiqueta de envío en PDF **para** operar con proveedores |
| **Épica** | Logística · **Estado** 🔴 |
| **CA** | 1. `GET /admin/pedidos/{id}/pdf` 🔴. 2. `POST /admin/envios/{id}/etiqueta` 🔴. 3. Numeración fiscal 🔴. |
| **Nota** | `dompdf`, `mPDF` y `pdf-merger` ya instalados. |

#### HU-032 · Blog y contenidos
| | |
|---|---|
| **Como** administrador **quiero** publicar artículos **para** hacer SEO y comunicar novedades |
| **Épica** | Contenido · **Estado** 🔴 |
| **CA** | 1. Tablas/endpoints de artículos 🔴. 2. Panel de redacción 🔴. 3. Secciones `blog_grid` y `article_featured` existentes pero vacías 🔴. |

#### HU-033 · Newsletter y contacto
| | |
|---|---|
| **Como** visitante **quiero** suscribirme o enviar un mensaje **para** mantenerme informado |
| **Épica** | Marketing · **Estado** 🔴 |
| **CA** | 1. `POST /newsletter` 🔴. 2. `POST /contacto` 🔴. 3. Tablas correspondientes 🔴. 4. La sección UI existe y no persiste nada. |

#### HU-034 · SEO técnico completo
| | |
|---|---|
| **Como** administrador **quiero** sitemap, canonical y buenas prácticas SEO **para** posicionar la tienda |
| **Épica** | Marketing · **Estado** 🟡 |
| **CA** | 1. Metadatos y JSON-LD ✅. 2. `robots.txt` ✅. 3. Slug único ✅. 4. `sitemap.xml` 🔴. 5. Canonical/hreflang 🔴. 6. Páginas legales con navbar/footer 🔴. |

#### HU-035 · Centro de soporte
| | |
|---|---|
| **Como** cliente **quiero** abrir un ticket o consultar ayuda **para** resolver dudas |
| **Épica** | Soporte · **Estado** 🟡 |
| **CA** | 1. Datos de soporte en footer ✅. 2. Seguimiento de envíos ✅. 3. Tickets/chat 🔴. 4. `/ayuda` con contenido real 🔴 (hoy es un placeholder). |

#### HU-036 · Auditoría consultable
| | |
|---|---|
| **Como** administrador **quiero** consultar el historial de acciones **para** detectar incidencias |
| **Épica** | Plataforma · **Estado** 🟡 |
| **CA** | 1. Escritura automática en `audit_logs` ✅. 2. Endpoint y pantalla de consulta 🔴. 3. Retención configurable 🔴. |

#### HU-037 · API pública para terceros
| | |
|---|---|
| **Como** desarrollador externo **quiero** API keys y documentación OpenAPI **para** integrar la tienda |
| **Épica** | Plataforma · **Estado** 🟡 |
| **CA** | 1. 110 endpoints versionados ✅. 2. OpenAPI/Swagger 🔴. 3. API keys con límites 🔴. 4. Portal de desarrolladores 🔴. |

---

## 4. Épicas y asignación

| Épica | HUs | Responsable sugerido |
|---|---|---|
| Autenticación | 001, 002, 003 | Full-stack |
| Catálogo | 004, 005, 010, 011, 012 | Backend + Frontend |
| Comercio | 006, 007, 017 | Full-stack |
| Pagos | 008, 028 | Backend |
| Promociones | 009 | Full-stack |
| Inventario | 013 | Backend |
| Pedidos | 014 | Full-stack |
| Logística | 015, 029, 031 | Backend |
| Contenido | 016, 032 | Frontend + Backend |
| Tienda | 018, 019, 020 | Frontend |
| Analítica | 021, 027 | Full-stack |
| Cuenta | 022 | Full-stack |
| Comunicación | 023, 030 | Backend |
| Plataforma | 024, 036, 037 | Full-stack |
| Usuarios | 025, 026 | Full-stack |
| Marketing | 033, 034 | Frontend |
| Soporte | 035 | Frontend |

---

## 5. Backlog técnico

Ordenado por prioridad. **P1 = corregir antes de producción.**

### P1 · Seguridad y estabilidad (bloquean el lanzamiento)

| ID | Tarea | Estado |
|---|---|---|
| T-001 | Rotar secretos de `.env copy`, eliminar el archivo del historial (`git filter-repo`) y añadir `.env*` a `.gitignore` | 🔴 |
| T-002 | Añadir `permission:productos.ver` a `GET /admin/productos` | 🔴 |
| T-003 | Añadir `permission:usuarios.ver`/`usuarios.crear` a `GET/POST /admin/usuarios` | 🔴 |
| T-004 | Proteger `POST/DELETE /admin/upload` con permiso + validar tipo y tamaño | 🔴 |
| T-005 | Restringir CORS a orígenes concretos (`config/cors.php`) | 🔴 |
| T-006 | Verificar propiedad de carrito por `session_id`/`user_id` en `CartController` | 🔴 |
| T-007 | Corregir `Order::shipments()` inexistente en `PaymentService::crearEnvioAutomatico()` | 🔴 |
| T-008 | Alinear `CartController` (`id`) con tests y frontend (`product_id`) y pasar los 5 tests | 🔴 |
| T-009 | Añadir middleware de rol en `middleware/auth.ts` (front) | 🔴 |
| T-010 | Cabeceras de seguridad (CSP, X-Frame-Options, HSTS) | 🔴 |

### P2 · Calidad y CI

| ID | Tarea | Estado |
|---|---|---|
| T-011 | CI de backend: `composer install` + `php -l` + `php artisan test` | 🔴 |
| T-012 | Añadir `pnpm run build` al CI de frontend | 🔴 |
| T-013 | Corregir `CatalogTest` (payload de imágenes y shape de respuesta) | 🔴 |
| T-014 | Corregir `PaymentTest` (tras T-007) | 🔴 |
| T-015 | Tests unitarios de `OrderService`, `CouponService`, `InventoryService` | 🔴 |
| T-016 | E2E de compra completa (Playwright) | 🔴 |
| T-017 | `php artisan test` → 78/78 como gate de CI | 🔴 |
| T-018 | Escaneo de secretos y de dependencias en CI | 🔴 |

### P3 · Rendimiento

| ID | Tarea | Estado |
|---|---|---|
| T-019 | `CACHE_DRIVER=redis` + caché de `configuracion/publica` y taxonomías | 🔴 |
| T-020 | `QUEUE_CONNECTION=database` + worker con supervisor | 🔴 |
| T-021 | Auditoría de N+1 (`with()` eager loading en listados) | 🔴 |
| T-022 | Migrar `Api.ts` a `runtimeConfig.public.apiBase` + crear `.env` del front | 🔴 |
| T-023 | Índices faltantes y `FULLTEXT` en `products` | 🔴 |
| T-024 | Materializar KPIs del dashboard en tabla agregada | 🔴 |

### P4 · Deuda de producto

| ID | Tarea | Estado |
|---|---|---|
| T-025 | Consolidar `/admin/tienda` y `/admin/preview` en un solo editor | 🔴 |
| T-026 | Endpoint `GET /admin/pedidos/{id}` y detalle admin real | 🔴 |
| T-027 | Conectar dashboard real (`Math.random()` → servicio) | 🟡 |
| T-028 | `sitemap.xml` + canonical + páginas legales con layout correcto | 🔴 |
| T-029 | Limpieza de middleware sin uso (`EnsureRole`, `StoreLocale`, `Cors` comentado) | 🔴 |
| T-030 | README del proyecto (hoy es el starter stock de Nuxt UI) | 🔴 |

---

## 6. Casos de prueba

### 6.1 Automatizados (existente)

| Suite | Total | ✅ | 🔴 | Nota |
|---|---|---|---|---|
| AuthTest | — | ✅ | — | Registro, login, logout |
| AuditTest | — | ✅ | — | `audit_logs` con usuario |
| CouponTest | — | ✅ | — | Vigencia y límites |
| DashboardTest | — | ✅ | — | Endpoints de métricas |
| InventoryTest | — | ✅ | — | Salida > stock rechazada |
| NotificationTest | — | ✅ | — | Log y suscripciones |
| ReportTest | — | ✅ | — | Exportaciones |
| ReviewTest | — | ✅ | — | Moderación |
| SettingsTest | — | ✅ | — | Config por grupos |
| ShippingTest | — | ✅ | — | Estados de envío |
| WishlistTest | — | ✅ | — | Favoritos sin duplicados |
| **VariantAttributeTest** | 6 | 6 | 0 | CRUD, 403, 409, producto con variantes |
| CatalogTest | 5 | 3 | 2 | 🔴 payloads/shape desactualizados |
| CartTest | 4 | 1 | 3 | 🔴 `id` vs `product_id` |
| OrderFlowTest | 3 | 2 | 1 | 🔴 mismo conflicto |
| PaymentTest | 4 | 3 | 1 | 🔴 `Order::shipments()` |
| **Total** | **78** | **70** | **8** | |

### 6.2 Casos manuales prioritarios (QA)

| ID | Caso | Pasos esperados | Resultado esperado |
|---|---|---|---|
| C-001 | Compra completa invitado | Catalogo → producto → carrito → checkout → pago | Pedido `nuevo`, pago `pendiente` → `pagado` al webhook |
| C-002 | Compra con cupón | Aplicar cupón válido/inválido/vencido | Descuento correcto / errores claros |
| C-003 | Stock insuficiente | Agregar más del stock | Rechazo con mensaje |
| C-004 | Variante sin stock | Elegir variante agotada | Botón deshabilitado |
| C-005 | Retoque de precio con sesión vencida | Dejar 16 h abierto y guardar | Redirección a login con retorno |
| C-006 | Rol sin permiso | Login como `cliente` y abrir `/admin/productos` | 403 y sin menú lateral |
| C-007 | Borrar marca con productos | Intentar eliminar | Bloqueado con contador |
| C-008 | Borrar atributo en uso | Intentar eliminar | 409 + mensaje |
| C-009 | Guardar constructor sin conexión | Bloquear red y guardar | Cola offline + sincronización al volver |
| C-010 | Modo offline completo | Navegar, agregar al carrito, volver en línea | Outbox sincronizado sin duplicados |
| C-011 | Reseña sin pedido entregado | Intentar reseñar pedido `enviado` | Rechazo |
| C-012 | Exportar reportes | 4 reportes × 3 formatos | Archivo descargable y legible |
| C-013 | Tracking público | Consultar guía sin sesión | Historial de estados |
| C-014 | Rate limit login | 11 intentos en 1 min | 429 tras el límite |
| C-015 | Responsive 360 px | Home, ficha, carrito, checkout | Sin desbordes |

---

## 7. Riesgos

| Riesgo | Impacto | Prob. | Mitigación |
|---|---|---|---|
| Secretos filtrados en git | Crítico | **Alta (ya ocurrido)** | T-001: rotar + limpiar historial + escaneo en CI |
| Webhook de pago falla en producción | Alto | Media | T-007 + tabla `webhook_events` + reintentos |
| `sync` de cola bloquea respuestas | Alto | Alta | T-020: pasar a `database`/`redis` |
| Sin tests E2E → regresiones en checkout | Alto | Media | T-016 |
| Carro público explotable | Alto | Media | T-006 |
| Dos editores de tienda divergentes | Medio | Alta | T-025 |
| Stub de transportistas confunde al usuario | Medio | Alta | Comunicar "tarifa estimada" hasta conectar APIs |
| Documentación desincronizada (`API_DOCUMENTACION.md`) | Bajo | Alta | Este plan + Manual Técnico §6.12 como fuente |

---

*Vuelve al [índice](00-Indice-Documentacion.md) · Anterior: [Manual de Usuario](03-Manual-Usuario.md) · Siguiente: [Roadmap Estratégico](05-Roadmap-Estrategico.md)*
