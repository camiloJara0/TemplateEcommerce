# 1 · Documento de Requerimientos del Software (SRS)

**CommerceOS — Plataforma de comercio electrónico tipo Shopify**
Versión 1.0 · 24/09/2026 · Fuente verificada: código fuente + `information_schema` + suite de pruebas

---

## 0. Contexto y alcance

CommerceOS es una **plantilla de ecommerce multi-nicho** (ropa, tecnología, alimentos, repuestos…) compuesta por:

- **Storefront** Nuxt 4 con constructor visual de páginas.
- **Panel administrativo** con 18 módulos operativos.
- **API REST** Laravel 9 con 110 endpoints y 37 tablas.

El objetivo de negocio es ofrecer una base reutilizable que permita poner en marcha una tienda online en días, no meses, con la misma plataforma evolucionando hacia SaaS multi-tenant.

### 0.1 Actores del sistema

| ID | Actor | Rol | Acceso |
|---|---|---|---|
| A1 | **Visitante** | Navega, busca, filtra, ve producto | Público, sin sesión |
| A2 | **Cliente** | Se registra, compra, reseña, gestiona perfil/pedidos/favoritos | Cliente (sin permisos de panel) |
| A3 | **Vendedor** | Gestiona catálogo, inventario, pedidos, reseñas y consulta cupones | `productos.*`, `inventario.*`, `pedidos.*`, `reviews.moderar`, `cupones.ver` |
| A4 | **Operador de logística** | Gestiona pedidos y envíos | `pedidos.*`, `envios.*` |
| A5 | **Administrador de tienda** | Control total del comercio y de la configuración | `*` |
| A6 | **Super administrador (futuro)** | Gestión multi-tienda, plataforma y facturación SaaS | Fase 3 — no existe |
| A7 | **Proveedor externo** | Pasarelas de pago, transportistas, webhooks | API pública / webhooks |
| A8 | **Desarrollador** | Integra la API, publica apps/temas | Fase 4 — no existe |

### 0.2 Matriz resumen de requerimientos

| ID | Requerimiento | Prioridad | Estado |
|---|---|---|---|
| RF-001 | Autenticación y sesiones | Alta | ✅ |
| RF-002 | Recuperación de contraseña por código | Alta | ✅ |
| RF-003 | Gestión de perfil personal | Media | ✅ |
| RF-004 | Gestión de usuarios (admin) | Alta | 🟡 |
| RF-005 | Roles y permisos | Alta | 🟡 |
| RF-006 | Configuración de tienda | Alta | ✅ |
| RF-007 | Constructor visual de páginas | Alta | ✅ |
| RF-008 | Plantillas de ejemplo | Media | ✅ |
| RF-009 | Personalización global (Navbar/Footer/estilos) | Alta | ✅ |
| RF-010 | Gestión de medios (upload) | Media | ✅ |
| RF-011 | Catálogo de productos | Alta | ✅ |
| RF-012 | Categorías jerárquicas | Alta | ✅ |
| RF-013 | Marcas | Media | ✅ |
| RF-014 | Etiquetas | Media | ✅ |
| RF-015 | Variantes de producto | Alta | ✅ |
| RF-016 | Atributos de variante | Alta | ✅ |
| RF-017 | Galería de imágenes de producto | Media | ✅ |
| RF-018 | Productos relacionados y destacados | Media | 🟡 |
| RF-019 | Búsqueda, filtros y ordenamiento | Alta | ✅ |
| RF-020 | Reseñas y calificaciones | Media | ✅ |
| RF-021 | Favoritos (wishlist) | Baja | ✅ |
| RF-022 | Movimientos de inventario | Alta | ✅ |
| RF-023 | Alertas de stock | Media | ✅ |
| RF-024 | Carrito de compras | Alta | ✅ |
| RF-025 | Checkout y cálculo de totales | Alta | ✅ |
| RF-026 | Cupones y promociones | Alta | ✅ |
| RF-027 | Impuestos y moneda | Alta | 🟡 |
| RF-028 | Direcciones de envío | Media | ✅ |
| RF-029 | Pedidos (cliente) | Alta | ✅ |
| RF-030 | Gestión de pedidos (admin) | Alta | 🟡 |
| RF-031 | Métodos de pago multi-pasarela | Alta | 🟡 |
| RF-032 | Webhooks de pago (entrante) | Alta | 🟡 |
| RF-033 | Reembolsos y cancelaciones | Media | 🟡 |
| RF-034 | Facturación / documentos PDF | Media | 🔴 |
| RF-035 | Métodos y cálculo de envíos | Alta | ✅ |
| RF-036 | Gestión de envíos y seguimiento | Alta | ✅ |
| RF-037 | Etiquetas de envío (PDF) | Baja | 🔴 |
| RF-038 | Notificaciones (in-app, push, email) | Media | 🟡 |
| RF-039 | Blog / contenidos | Baja | 🔴 |
| RF-040 | Newsletter y contacto | Baja | 🟡 |
| RF-041 | SEO técnico | Alta | 🟡 |
| RF-042 | Dashboard y analítica | Alta | 🟡 |
| RF-043 | Reportes y exportación | Alta | ✅ |
| RF-044 | Auditoría de acciones | Media | ✅ |
| RF-045 | API pública | Media | 🟡 |
| RF-046 | Integraciones externas (pasarelas/carriers) | Alta | 🟡 |
| RF-047 | Marketplace de temas | Baja | 🟡 |
| RF-048 | Marketplace de aplicaciones | Baja | 🔴 |
| RF-049 | Soporte al cliente | Media | 🟡 |
| RF-050 | Multi-tienda (SaaS multi-tenant) | Baja | 🔴 |
| RF-051 | Suscripciones y facturación SaaS | Baja | 🔴 |
| RF-052 | Seguridad de la plataforma | Alta | 🟡 |
| RF-053 | Offline / PWA | Media | ✅ |

---

## 1. Requerimientos funcionales

### 1.1 Autenticación, usuarios y autorización

---

#### RF-001 · Autenticación y sesiones

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A2, A3, A4, A5 |

**Descripción.** El sistema permite registro, inicio de cierre de sesión y cierre mediante tokens Bearer de Laravel Sanctum con expiración de 16 horas.

**Objetivo de negocio.** Identificar al usuario para personalizar la experiencia, proteger el panel y poder asociarle pedidos, direcciones y preferencias.

**Flujo principal (login).**
1. El usuario ingresa email y contraseña en `/auth/login`.
2. `POST /api/v1/login` valida credenciales (throttle 10 req/min).
3. El backend crea el token (`expires_in` = 16 h) y devuelve `{access_token, token_type, expires_in, user}`.
4. El frontend persiste el token en cookie `auth_token` (30 días), en `sessionStorage` e IndexedDB.
5. Se redirige según jerarquía de rol: SuperAdmin/Admin → `/admin`, Vendedor → `/admin/pedidos`, Cliente → `/`.

**Flujos alternativos.**
- *Registro*: `POST /api/v1/register` crea usuario con rol `cliente` (throttle 5 req/min).
- *Token expirado*: middleware `CheckTokenExpiration` rechaza con 401; el cliente limpia sesión y redirige a `/auth/login?redirect=…`.
- *Credenciales inválidas*: 422/401 con toast de error.

**Reglas de negocio.**
- Un token por sesión; `POST /api/v1/logout` lo revoca.
- El carrito del invitado se migra al usuario al iniciar sesión.
- El rol determina las rutas de destino (`store/auth.ts → getDefaultRoute()`).

**Validaciones.** `email` requerido y formato válido; `password` mínimo 8 caracteres.

**Dependencias.** Sanctum (`personal_access_tokens`), `User`, `Role`, middleware `Authenticate` + `CheckTokenExpiration`.

---

#### RF-002 · Recuperación de contraseña por código

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A2 |

**Descripción.** Flujo de recuperación basado en código de 6 dígitos enviado al correo, sin enlace de reset tradicional.

**Flujo principal.**
1. El usuario solicita recuperación en `/auth/recuperar`.
2. `POST /api/v1/enviar-codigo` (throttle 3 req/5 min) genera código en `verification_codes` con expiración.
3. El usuario ingresa el código y `POST /api/v1/verificar-codigo-cambio` lo valida.
4. Se permite definir la nueva contraseña.

**Reglas de negocio.** Un solo código activo por correo; el código se marca `usado` tras su uso.

**Validaciones.** Email existente; código de 6 dígitos; no expirado; no usado.

**Dependencias.** `CodigoVerificacion`, `NotificationService` (SMTP), tabla `verification_codes`.

⚠️ **Defecto detectado:** la columna `verification_codes.expira_en` tiene `ON UPDATE current_timestamp()` en MariaDB, de modo que **cualquier actualización de la fila reinicia la expiración**. Ver Manual Técnico §6.6.

---

#### RF-003 · Gestión de perfil personal

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | ✅ Implementado |
| **Actores** | A2, A3, A5 |

**Descripción.** El usuario consulta y actualiza sus datos personales.

**Flujo principal.** `/cuenta/perfil` → `GET /api/v1/perfil` → edición → `PUT /api/v1/perfil` con `nombre`, `telefono`, `foto`, `idioma`.

**Validaciones.** Email no editable masivamente; teléfono opcional.

**Gaps.** No existe endpoint de **cambio de contraseña autenticado** (`PUT /perfil/password`) ni de eliminación de cuenta. La UI muestra campos de rol en modo lectura.

---

#### RF-004 · Gestión de usuarios (admin)

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |
| **Actores** | A5 |

**Descripción.** El administrador lista y crea usuarios del panel.

**Flujo principal.** `/admin/usuarios` → `GET /api/v1/admin/usuarios` (paginado) → modal de invitación → `POST /api/v1/admin/usuarios`.

**Reglas de negocio.** El usuario creado recibe un rol del catálogo `roles`.

**Gaps (🔴).**
- **No existen** `PUT /admin/usuarios/{id}` ni `DELETE /admin/usuarios/{id}` → no se puede editar ni eliminar usuarios.
- **No existen** endpoints de roles: `GET /admin/roles`, `PUT /admin/roles/{id}/permisos`.
- `GET /admin/usuarios` **no tiene middleware de permiso** → cualquier usuario autenticado puede listar todos los usuarios (riesgo de seguridad, ver RF-052).

---

#### RF-005 · Roles y permisos

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |
| **Actores** | A5, A8 |

**Descripción.** Sistema de autorización basado en archivos de configuración, sin tablas de permisos.

**Implementación.**
- `config/permissions.php` define la matriz por rol: `admin: *`, `vendedor: productos.*, inventario.*, pedidos.ver, pedidos.gestionar, clientes.ver, reviews.moderar, cupones.ver`, `cliente: []`, `operador_logistica: pedidos.ver, pedidos.gestionar, envios.*`.
- `User::tienePermiso()` soporta comodines `*` (todo) y `modulo.*` (módulo completo).
- Middleware `EnsurePermission` aplica `permission:xxx.yyy` en cada ruta admin y responde `403 FORBIDDEN`.
- `RoleSeeder` materializa los 4 roles en las tablas `roles`/`role_user`.

**Reglas de negocio.** Los permisos son de solo lectura en tiempo de ejecución: para cambiar un rol se edita el archivo y se despliega.

**Gaps.** No hay UI ni API para administrar permisos; los roles no se pueden editar desde el panel. No hay roles personalizados ni super-admin diferenciado.

---

### 1.2 Configuración de tienda y personalización

---

#### RF-006 · Configuración de tienda

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Panel de configuración agrupada (general, colores, SEO, pagos, tienda) persistida en la tabla `settings`.

**Flujo principal.**
1. `/admin/configuracion` → `GET /api/v1/admin/configuracion`.
2. El formulario `StoreConfigForm` edita identidad, economía y SEO.
3. `PUT /api/v1/admin/configuracion` persiste por grupo (`general`, `colores`, `seo`).
4. El storefront consume `GET /api/v1/configuracion/publica` y aplica los valores **en tiempo real**.

**Campos.** `store_name`, `store_tagline`, `logo`, `currency` (ISO 3 letras), `tax_rate` (0–1), `default_language`, `support_email`, `support_phone`, `color_primario`, `color_secundario`, `color_fondo`, `meta_title`, `meta_description`, `meta_keywords`, `og_image`.

**Validaciones.** `currency` de 3 letras; `tax_rate` entre 0 y 1; email formato válido.

**Sub-recursos.** `GET/PUT /admin/configuracion/pagos` (credenciales de pasarelas vía `PaymentCredentialService`) y `GET/PUT /admin/configuracion/tienda` (constructor, ver RF-007).

**Dependencias.** `Setting` (clave-valor con `group`), helpers `store_setting()` / `store_currency()`.

---

#### RF-007 · Constructor visual de páginas

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Editor WYSIWYG drag-and-drop para componer la home, la página de producto, la página "nosotros" y los estilos globales, con previsualización en vivo y deshacer/rehacer.

**Objetivo de negocio.** Permitir a un no técnico crear una tienda con personalidad de marca sin tocar código — requisito explícito de `Documentacion.md`.

**Flujo principal (`/admin/tienda`).**
1. `GET /admin/configuracion/tienda` carga la configuración (`TiendaConfig`).
2. La barra lateral ofrece 4 pestañas: **Inicio**, **Producto**, **Nosotros**, **Global**.
3. En *Inicio* se lista `page_sections`: cada sección puede reordenarse, duplicarse, ocultarse, eliminarse o cambiar de variante de diseño.
4. "Agregar sección" abre un modal con las **24 definiciones** agrupadas por categoría (`layout`, `hero`, `content`, `conversion`, `social`, `media`), con búsqueda, descripción, variantes y preview SVG.
5. Al seleccionar una sección, su editor específico se abre abajo y la previsualización central se actualiza en tiempo real (modo claro/oscuro, clic para seleccionar).
6. `PUT /admin/configuracion/tienda` persiste el objeto completo; hay cola offline por si se pierde conexión.
7. La tienda pública lo renderiza con `ClientPageRenderer` resolviendo `(type, variant)` → componente Vue.

**Flujos alternativos.**
- *Aplicar plantilla* desde `/admin/plantillas` (RF-008).
- *Fullscreen* cambia el layout a `admin-editor` (sin sidebar).
- *Undo/Redo* sobre snapshots JSON de la configuración.
- *Vista previa de sección de producto* desde el propio formulario de producto.

**Reglas de negocio.**
- Solo las secciones `visible: true` se renderizan en la tienda.
- Las secciones marcadas como **individuales** (problema/solución, transformación, características, comparativa, bundle, countdown, testimonios, UGC) se configuran **por producto** en `products.page_config` con `product_ids`; las globales (hero, benefits, gallery, warranty, faq, cta) se configuran aquí.
- Migración automática de la configuración legada (`secciones`, `header`, `categories_home`) a `page_sections` (`usePageSections.migrateToPageSections`).

**Validaciones.** Cada sección exige `id`, `type`, `order`, `variant` y `config`; los campos al cambiar de variante se preservan según `COMMON_FIELDS`.

**Dependencias.** `SectionRegistry.ts` (24 definiciones), `PageBuilder.ts`, `sectionPreviews.ts` (1 228 líneas de SVG), `usePageConfig`, `useThemeConfig` (inyecta CSS vars), `SettingsController@obtenerTienda/actualizarTienda`.

**Gaps.** Existe un segundo editor duplicado en `/admin/preview` (9 pestañas) que debe consolidarse. No hay guardado por secciones (todo el objeto se envía junto), ni historial de versiones en servidor, ni publicación/despublicación.

---

#### RF-008 · Plantillas de ejemplo

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Galería de **16 plantillas** completas, filtrables por categoría, dificultad y búsqueda, con preview y aplicación en un clic.

**Catálogo.** `modern-store`, `luxury-boutique`, `flash-deals`, `multi-brand`, `fashion-editorial`, `streetwear`, `minimal-fashion`, `gourmet-restaurant`, `coffee-shop`, `bakery`, `tech-store`, `gadget-lab`, `sports-store`, `fitness-hub`, `minimal-clean`, `bold-colorful`.

**Flujo principal.** `/admin/plantillas` → filtrar → preview (`mode="template-preview"`) → "Aplicar" → `PUT /admin/configuracion/tienda` con la configuración de la plantilla.

**Reglas de negocio.** Aplicar una plantilla **sobrescribe** la configuración actual (operación destructiva sin confirmación versionada).

**Gaps.** No hay marketplace (descarga de terceros), ni guardado de la plantilla anterior, ni plantillas por vertical guardadas como favoritas.

---

#### RF-009 · Personalización global (Navbar, Footer, estilos)

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Pestaña *Global* del constructor con tres bloques:

- **Estilos** (`GlobalStylesEditor`, 411 líneas): tipografía, paleta de 20 colores (claro/oscuro), fondos sólidos o degradados, bordes y espaciados → `useThemeConfig` los convierte en variables CSS sobre `document.documentElement`.
- **Navbar**: enlaces (label, URL, visible) y toggles de búsqueda, carrito y favoritos.
- **Footer**: copyright y columnas con enlaces anidados.

**Flujo.** Editar → previsualización en vivo → Guardar → el layout `client.vue` renderiza el footer dinámico y `ClientNavbar` los enlaces.

**Validaciones.** Colores en formato hex; URLs de enlaces no validadas (riesgo de `javascript:` — ver RF-052).

---

#### RF-010 · Gestión de medios (upload)

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Subida y borrado de archivos de imagen para logos, secciones y productos.

**Endpoints.** `POST /api/v1/admin/upload` (multipart) y `DELETE /api/v1/admin/upload`; consume el composable `useImageUpload` y el componente `ImageUpload.vue`.

**Validaciones.** Extensiones/tamaño delegadas en el controlador.

⚠️ **Riesgo de seguridad:** ambas rutas solo exigen autenticación, **sin permiso de rol**, por lo que cualquier cliente autenticado puede subir y borrar archivos. Ver RF-052.

---

### 1.3 Catálogo de productos

---

#### RF-011 · Catálogo de productos

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A2, A3, A5 |

**Descripción.** CRUD completo de productos con formulario de 893 líneas que incluye datos básicos, imágenes, etiquetas, variantes y editor de secciones de página.

**Campos (tabla de `Documentacion.md` + migración real).**

| Campo | Tipo | Restricción |
|---|---|---|
| `name` | varchar(255) | requerido, máx. 255 |
| `slug` | varchar(255) | único, auto |
| `sku` | varchar(255) | único, requerido |
| `description` | text | opcional |
| `price` | decimal(18,2) | requerido, ≥ 0 |
| `price_discount` | decimal(18,2) | opcional |
| `weight` | decimal(10,2) | opcional |
| `stock` | int | default 0; se recalcula como suma de variantes |
| `category_id` / `brand_id` | FK | `SET NULL` si se borra la padre |
| `estado` | varchar | `activo` \| `inactivo` |
| `is_featured` | tinyint(1) | destacado en home |
| `page_config` | json | secciones individuales de la página de producto |
| `rating_avg` / `reviews_count` | decimal(3,2) / int | denormalizados desde reseñas |

**Flujo principal (crear).**
1. `/admin/productos` → "Nuevo producto".
2. Se completa el formulario (validación cliente con `useFormValidation`).
3. Si hay archivos `File`, se envía `multipart` con `_method=PUT` para actualizaciones.
4. `POST /admin/productos` (permiso `productos.crear`) valida y crea.
5. `sincronizarExtras()` sincroniza imágenes, etiquetas y variantes.
6. `ProductResource` devuelve el producto con relaciones.

**Flujos alternativos.** Duplicar, cambiar estado rápidamente, editar parcialmente (todas las reglas son `sometimes` en actualización).

**Reglas de negocio.**
- El stock del producto se calcula como **suma de sus variantes** cuando existen; si no, usa `stock` enviado.
- Borrado lógico (`SoftDeletes`) solo en productos.
- Los campos se envían como `FormData` cuando hay imágenes: `variants` y `tags` se envían como `''` para indicar "limpiar".

**Validaciones (backend, `ProductController@validar`).** `sku` único; `price` numérico ≥ 0; `images.*` sólo archivo `jpg|jpeg|png|webp` ≤ 2 MB; `existing_image_urls.*` string; `variants.*.sku` requerido y único por producto; `variants.*.attribute_values.*` existente en BD.

**Dependencias.** `Product`, `ProductImage`, `ProductVariant`, `Tag`, `Category`, `Brand`.

---

#### RF-012 · Categorías jerárquicas

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A5 |

**Descripción.** Árbol de categorías con categoría padre, orden, imagen y estado.

**Campos.** `name`, `slug` (único), `parent_id` (self-FK `SET NULL`), `description`, `image`, `sort_order`, `is_active`.

**Endpoints.** Público `GET /categorias`, `GET /categorias/{slug}`; admin CRUD + `PUT /admin/categorias/{id}/orden`.

**Reglas de negocio (según `Documentacion.md`).**
- Al eliminar una categoría padre **se elimina la relación** (la hija queda huérfana con `parent_id = NULL`, no se borra en cascada).
- La relación se usa en recomendaciones, búsqueda y filtros del catálogo.

**Gaps.** No existe endpoint de árbol público verificado en `routes/api.php` (`GET /categorias/arbol` no está registrado); el frontend consume `GET /categorias` y reconstruye la jerarquía.

---

#### RF-013 · Marcas · RF-014 · Etiquetas

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | ✅ Implementado (CRUD completo desde el header de productos) |

**Descripción.** Clasificaciones para filtrado y búsqueda. Marcas con `name`, `slug` único, `description`, `image`, `is_active`; etiquetas con `name` y `slug`.

**Flujo (reciente).** En `/admin/productos`, los botones **"Nueva marca"** y **"Nueva etiqueta"** abren modales (`BrandForm`, `TagForm`) sin salir de la pantalla; el listado admin (`GET /admin/marcas`, `GET /admin/etiquetas`) incluye `products_count` y **bloquea la eliminación si la marca tiene productos asociados**.

**Endpoints.** Público `GET /marcas`, `GET /marcas/{slug}`, `GET /etiquetas`; admin CRUD con permisos `productos.marcas.*` / `productos.etiquetas.*`.

---

#### RF-015 · Variantes de producto

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A2, A5 |

**Descripción.** Un producto puede tener múltiples variantes (SKU por combinación), cada una con precio, precio con descuento, stock e imagen propios.

**Modelo.** Tabla `product_variants` (`sku` único global, `price`, `price_discount`, `stock`, `image`) y pivot `product_variant_attribute_value`.

**Flujo en el formulario.** Se añaden variantes manualmente, se marcan los valores de atributo que la componen y la UI calcula la **combinación resultante** (p. ej. "Color: Negro · Talla: M"). Cada variante edita sus campos individuales.

**Reglas de negocio.**
- El stock total del producto = suma de variantes (reclculado en cada guardado).
- Al enviar `variants: []` se **eliminan todas** las variantes del producto.
- Si una variante no envía precio, hereda el del producto en la presentación (`ProductResource`).

**Validaciones.** `variants.*.sku` requerido y único; `attribute_values.*` deben existir en BD; `price` ≥ 0.

**Gaps.** No existe generación automática de variantes por combinación (matriz de atributos), ni regla de precios por atributo.

---

#### RF-016 · Atributos de variante

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A5 |

**Descripción.** Catálogo reutilizable de atributos (Color, Talla, Material) con valores, gestionable desde el formulario de producto.

**Endpoints (verificados en `route:list`).**

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/admin/variant-attributes` | `productos.atributos.ver` |
| POST | `/admin/variant-attributes` | `productos.atributos.crear` |
| PUT | `/admin/variant-attributes/{atributo}` | `productos.atributos.editar` |
| DELETE | `/admin/variant-attributes/{atributo}` | `productos.atributos.eliminar` |
| POST | `/admin/variant-attributes/{atributo}/values` | `productos.atributos.crear` |
| PUT | `/admin/variant-values/{valor}` | `productos.atributos.editar` |
| DELETE | `/admin/variant-values/{valor}` | `productos.atributos.eliminar` |

**Reglas de negocio.**
- No se puede eliminar un atributo **en uso** por variantes → `409 ATTRIBUTION_IN_USE`.
- No se puede eliminar un valor en uso → `409 VALUE_IN_USE`.
- Nombre de valor único dentro del mismo atributo.

**Validaciones.** `name`/`value` requeridos, máx. 100 caracteres, únicos.

**Cobertura.** Test `VariantAttributeTest` (6 pruebas) cubre CRUD, permisos, guards 409 y creación de producto con variantes.

---

#### RF-017 · Galería de imágenes de producto

**Estado ✅ · Prioridad Media.** Tabla `product_images` (`url`, `position`).

**Reglas.**
- `sincronizarExtras()` **solo** reemplaza la galería si la petición trae `existing_image_urls` o `images` → permite editar el producto sin tocar imágenes.
- Se aceptan URLs existentes (`existing_image_urls[]`) y archivos nuevos (`images[]`).
- El orden se persiste por `position`.

**Gaps.** No hay endpoint de reordenamiento (`PUT /admin/productos/{id}/orden-imagenes` no existe); el orden se envía en el array. No hay recorte ni optimización de imágenes (no se usa `intervention/image`).

---

#### RF-018 · Productos relacionados y destacados

**Estado 🟡 · Prioridad Media.**

- *Destacados*: campo `is_featured` + filtro `?destacado=1` → se usa en el home.
- *Relacionados*: `GET /productos/{producto}/relacionados` existe y se consume desde la ficha.

**Gap.** `Documentacion.md` exige "productos pueden relacionarse entre sí" como relación **editable** por el merchant; hoy los relacionados se calculan automáticamente (misma categoría/marca), no se seleccionan manualmente.

---

#### RF-019 · Búsqueda, filtros y ordenamiento

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |

**Descripción.** Catálogo público paginado con filtros combinables.

**Parámetros (verificados).** `GET /productos` acepta `busqueda`, `categoria_id`, `marca_id`, `tag`, `precio_min`, `precio_max`, `destacado`, `orden` (`precio_asc`, `precio_desc`, `mas_vendidos`), `per_page`, `page`.

**UI.** `/catalogo` con barra de búsqueda con sugerencias (`SearchBar`), filtros por categoría/marca/rango de precio, ordenamiento y paginación de 24 elementos; `GET /productos/{id}/detalle` para la variante ligera.

**Objetivo de negocio.** Reducir la fricción hasta la compra (requisito de `Documentacion.md`: clasificar por marcas, categorías y tags "para facilitar la búsqueda y la aplicación de filtros").

**Gaps.** Sin búsqueda full-text (MySQL `FULLTEXT`), sin facetas computadas, sin búsqueda tolerante a errores/tildes.

---

#### RF-020 · Reseñas y calificaciones

**Estado ✅ · Prioridad Media.**

- Cliente: `POST /productos/{producto}/resenas` con `rating` (1–5) y `comment` (≤ 2 000).
- Público: `GET /productos/{producto}/resenas` (solo aprobadas).
- Admin: `GET /admin/resenas`, `POST .../aprobar`, `POST .../rechazar`, `DELETE ...` (permiso `reviews.moderar`).
- `rating_avg` y `reviews_count` se denormalizan en `products`.

**Regla de negocio clave.** Solo se puede reseñar si el pedido está **entregado** (`ReviewService`).

**Validaciones.** Índice único `(product_id, user_id, order_id)` — pero **no protege** cuando `order_id` es NULL (ver Manual Técnico §6.7). `reviews.rating` no tiene `CHECK` 1–5 en BD.

---

#### RF-021 · Favoritos (wishlist)

**Estado ✅ · Prioridad Baja.** `GET/POST /favoritos`, `DELETE /favoritos/{producto}`, `POST /favoritos/{item}/mover-al-carrito`. Tabla `wishlist_items` con único `(user_id, product_id)`. UI en `/cuenta/favoritos` y en las tarjetas de producto.

---

### 1.4 Inventario

---

#### RF-022 · Movimientos de inventario

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A3, A5 |

**Descripción.** Libro de movimientos de stock con tipos `entrada`, `salida`, `devolución`, `ajuste`.

**Campos.** `product_id`, `product_variant_id` (opcional), `cantidad`, `tipo`, `razon`, `usuario_id`, referencia polimórfica (`referencia_type/id`, p. ej. el pedido que descontó stock).

**Endpoints.** `GET/POST /admin/inventario/movimientos` (`inventario.ver` / `inventario.movimientos.crear`).

**Reglas de negocio.**
- El checkout descuenta stock y genera el movimiento correspondiente.
- No se permite salida por encima del stock disponible (validado por `InventoryService`; testeado en `InventoryTest`).
- Todo movimiento queda vinculado al usuario que lo registró.

**UI.** `/admin/inventario` con filtros por tipo, fecha y producto.

---

#### RF-023 · Alertas de stock

**Estado ✅ · Prioridad Media.** Tabla `stock_alerts` (`min_stock`, `active`). `GET/POST /admin/inventario/alertas`. El dashboard y la barra lateral muestran el contador de stock bajo.

**Gap.** No hay notificación automática al cruzar el mínimo (solo visual en panel).

---

### 1.5 Carrito, checkout y promociones

---

#### RF-024 · Carrito de compras

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A1, A2 |

**Descripción.** Carrito persistente para invitados (por `session_id`) y autenticados (por `user_id`), con drawer lateral y página completa.

**Endpoints (verificados).**

| Método | Ruta | Auth | Throttle |
|---|---|---|---|
| GET | `/carrito` | pública | 120/min |
| POST | `/carrito/items` | pública | 120/min |
| PUT | `/carrito/items/{item}` | pública | 120/min |
| DELETE | `/carrito/items/{item}` | pública | 120/min |
| DELETE | `/carrito` (vaciar) | pública | 120/min |

**Flujo principal.**
1. Añadir producto (y opcionalmente variante) → `POST /carrito/items` con `session_id` para invitados.
2. El store `cart.ts` aplica rate-limit de 500 ms por clave y **cola offline** (`runMutation`) para seguir operando sin conexión.
3. Al iniciar sesión se migra el carrito del invitado.

**Reglas de negocio.**
- Índice único `(cart_id, product_id, product_variant_id)` → añadir dos veces incrementa cantidad.
- Nunca se permite exceder el stock disponible.
- Cálculo: `subtotal − descuento + envío + impuestos = total`.

**Validaciones.** `quantity` entero ≥ 1; producto/variante existentes.

⚠️ **Hallazgo:** las rutas de carrito **no llevan middleware de autenticación**; la seguridad depende de que el controlador verifique pertenencia por `session_id`/`user_id`. Además, `CartController` valida el campo `id` mientras los tests envían `product_id` (causa de 5 tests fallando).

---

#### RF-025 · Checkout y cálculo de totales

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |

**Descripción.** Checkout en `/checkout` en tres pasos: dirección → método de envío → cupón/notas, con previsualización de totales en vivo y creación del pedido.

**Endpoints.**
- `POST /checkout/preview` → `{subtotal, discount, shipping, tax, total, currency}`.
- `POST /pedidos` con `address_id`, `shipping_method_id`, `coupon_code`, `notes`.
- `GET /metodos-envio` para los métodos activos.

**Reglas de negocio.**
- El backend es la única fuente de verdad del cálculo; el frontend solo refleja.
- `tax_rate` y `currency` provienen de `GET /configuracion/publica` (se aplican **en tiempo real**, requisito de `Documentacion.md`).
- El pedido nace en estado `nuevo` con `payment_status = pendiente`.
- Se reservan/retiran stock y se registra el uso del cupón en la misma operación.

**Validaciones.** Dirección y método de envío obligatorios; cupón dentro de su vigencia y límites.

---

#### RF-026 · Cupones y promociones

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A2, A5 |

**Descripción.** Cupones de tipo `percent`, `fixed` o `free_shipping` con límites de uso.

**Campos.** `code` (único, máx. 50), `type`, `value`, `min_subtotal`, `max_discount`, `usage_limit`, `per_user_limit`, `used_count`, `starts_at`, `expires_at`, `active`.

**Endpoints.** Admin CRUD (`cupones.ver/crear/editar/eliminar`); cliente `POST /cupones/aplicar` (autenticado).

**Reglas de negocio.**
- Vigencia por fecha, límite global y límite por usuario.
- `used_count` se incrementa en el checkout; cada uso queda en `coupon_user` con `discount_applied`.
- El checkout valida el cupón antes de calcular el total.

**Validaciones.** Código único; `type` en enum; valores ≥ 0; fechas coherentes (`starts_at < expires_at`).

**Gaps.** Sin campañas (múltiples cupones encadenados), sin cupones por segmento de cliente, sin cupones por producto/categoría, sin cupón automático de bienvenida.

---

#### RF-027 · Impuestos y moneda

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Implementado.** Un `tax_rate` global (0–1) y una `currency` ISO-3 en `settings`, aplicados en `checkout/preview` y expuestos a la UI (`useFormat` formatea con `Intl.NumberFormat('es-CO')`).

**Gaps (🔴 respecto a Shopify).**
- **No multi-moneda**: un solo `currency` por tienda; no hay tipo de cambio ni precios por moneda.
- **No multi-impuesto**: no hay tasas por región, por categoría ni exenciones; no hay IVA incluido/excluido configurable por línea.
- No hay redondeo configurable ni impuestos sobre envío.

---

#### RF-028 · Direcciones de envío

**Estado ✅ · Prioridad Media.** CRUD en `/cuenta/perfil` y en el checkout (`AddressForm`). Campos `label`, `pais`, `ciudad`, `direccion`, `codigo_postal`, `telefono`, `es_principal`.

**Nota.** No existen tablas `provinces`/`districts`: la geografía es texto libre, por lo que **no hay validación ni cálculo de tarifa por destino real**.

---

### 1.6 Pedidos, pagos y envíos

---

#### RF-029 · Pedidos (cliente)

**Estado ✅ · Prioridad Alta.** `GET /pedidos` (lista paginada), `GET /pedidos/{id}` (detalle con items, historial, pagos y tracking). UI en `/cuenta/pedidos` e `/id`.

**Modelo de datos.** `orders`: `numero` (único), `subtotal`, `discount`, `shipping_cost`, `tax`, `total`, `currency`, `status`, `payment_status`, `shipping_status`, `notes`, FK a `user`, `address`, `shipping_method`.

**Estados de pedido (7):** `nuevo`, `pagado`, `preparando`, `enviado`, `entregado`, `cancelado`, `devuelto`.

**Historial.** Cada cambio queda en `order_status_histories` con usuario y comentario.

---

#### RF-030 · Gestión de pedidos (admin)

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Implementado.**
- `GET /admin/pedidos` con filtros `status`, `payment_status`, `busqueda`, `per_page`.
- `POST /admin/pedidos/{order}/estado` (`pedidos.gestionar`) con `estado` y `comentario` opcional → registra historial.

**UI.** `/admin/pedidos` con cambio de estado inline; detalle en `/admin/pedidos/{id}` **construido desde los datos del store local**.

**Gaps (🔴).**
- **No existe `GET /admin/pedidos/{id}`** → no hay endpoint de detalle admin; el frontend reutiliza la lista.
- Sin notas manuales del pedido, sin PDF de pedido, sin reembolso desde la vista de pedido, sin impresión de factura, sin gestión de devoluciones (solo el estado `devuelto`).

---

#### RF-031 · Métodos de pago multi-pasarela

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Descripción.** Arquitectura de adaptadores *plug-and-play* bajo `app/Services/Payment/`.

**Proveedores configurados (`config/payments.php`).** `stripe`, `mercadopago`, `paypal`, `wompi`, `payu`, `rapyd` — con `class_map` a su adaptador y credenciales por `.env`.

**Endpoints.**
- `GET /pagos/provider` → proveedor activo (`PAYMENT_PROVIDER`).
- `POST /pedidos/{order}/pagar` con `{provider, reference?}` → crea el pago.
- Ayudas públicas: `GET /pagos/rapyd/metodos/{country}`, `GET /pagos/rapyd/campos-requeridos/{type}`, `GET /pagos/payu/bancos-pse`.
- Admin: `GET /admin/pagos`, `GET /admin/pagos/{pago}`, `POST /admin/pagos/{pago}/reembolsar`, `POST /admin/pagos/{pago}/cancelar`.

**Frontend.** `/checkout/pago/{id}` detecta el proveedor activo y monta el formulario adecuado: `PaymentDynamicForm` (Rapyd, con campos dinámicos y PSE), Stripe.js Elements, Mercado Pago redirect, Wompi.

**Reglas de negocio.**
- El proveedor activo se fija en `.env` (`PAYMENT_PROVIDER`) y se puede consultar desde la UI.
- El estado del pedido pasa a `pagado` cuando el webhook confirma.
- `PaymentCredentialService` aísla las credenciales guardadas en `settings`.

**Gaps.**
- El plan `PAYU_IMPLEMENTATION_PLAN.md` **no está conectado** (falta `payu_transactions` y rutas).
- No hay selector de proveedor por tienda en la UI de checkout (solo el activo).
- No hay 3D Secure, no hay split de pagos, no hay monedas locales.

---

#### RF-032 · Webhooks de pago (entrante)

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Descripción.** `POST /api/webhooks/pagos/{provider}` (sin `/v1`, público) recibe las notificaciones de la pasarela y las delega en `PaymentService`.

**Reglas de negocio.** Verificación de firma (`WebhookProvider@verificarFirma`) e idempotencia.

**Gaps (🔴).**
- **No existe la tabla `webhook_events`** → no hay registro de eventos recibidos, ni reintentos, ni re-lectura fallida.
- El body se guarda en `payments.payload`; no hay *dead letter queue*.
- **No hay webhooks salientes** hacia apps de terceros (obligatorio para marketplace, Fase 4).

---

#### RF-033 · Reembolsos y cancelaciones

**Estado 🟡 · Prioridad Media.** `POST /admin/pagos/{pago}/reembolsar` con `amount` y `reason`; tabla `refunds` con `status` (`pendiente`); `POST /admin/pagos/{pago}/cancelar`.

**Gaps.** El reembolso no actualiza de forma verificada `orders.payment_status` en todos los caminos; no hay aprobación ni notificación al cliente; `refunds.transaction_id` sin índice.

---

#### RF-034 · Facturación / documentos PDF · RF-037 · Etiquetas de envío

**Estado 🔴 para facturación · 🔴 para etiquetas · Prioridad Media/Baja.**

**Existe la infraestructura pero no los endpoints:**
- `barryvdh/laravel-dompdf`, `mpdf/mpdf` y `nickvdyck/pdf-merger` están instalados.
- **No hay ruta** `GET /admin/pedidos/{id}/pdf` ni `POST /admin/envios/{id}/etiqueta`.
- No existe plantilla de factura ni numeración fiscal.

**Recomendación.** Prioridad Media en Fase 2: es requisito operativo real y la infraestructura ya está pagada.

---

#### RF-035 · Métodos y cálculo de envíos

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |

**Descripción.** Tabla `shipping_methods` (`name`, `description`, `cost`, `estimated_days`, `active`) expuesta en `GET /metodos-envio` y seleccionable en el checkout. El cálculo entra en `checkout/preview`.

**Tarifario.** `config/shipping.php` define carriers (`servientrega`, `coordinadora`, `dhl`, `fedex`, `interrapidisimo`) con credenciales y `class_map` a adaptadores.

**Gaps.** Los adaptadores son **stubs con datos simulados** (`BaseStubProvider`): la cotización real por peso/destino no está conectada.

---

#### RF-036 · Gestión de envíos y seguimiento

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Actores** | A2, A4, A5 |

**Descripción.** Ciclo de vida del envío con tracking público.

**Endpoints.**
- Admin: `GET /admin/envios`, `GET /admin/envios/{shipment}`, `GET /admin/envios/cotizar`, `POST /admin/envios`, `PUT /admin/envios/{shipment}/estado`.
- Público: `GET /envios/tracking/{trackingNumber}`.

**Estados (`ShippingStatusEnum`).** `pendiente`, `en_preparacion`, `despachado`, `en_transito`, `entregado`.

**Datos.** `shipments` guarda carrier, `tracking_number` único, estado y dirección **desnormalizada** (`destinatario`, `direccion`, `ciudad`, `departamento`, `codigo_postal`) más `payload` JSON del proveedor. Los eventos viven en `shipment_events`.

**Reglas de negocio.**
- Cambiar el estado del pedido a `enviado` está vinculado a la creación del envío.
- El cliente ve el tracking en `/cuenta/pedidos/{id}` y públicamente por número de guía.

**Gaps.** ⚠️ `PaymentService::crearEnvioAutomatico()` llama a `Order::shipments()`, relación **inexistente** → error 500 al confirmar pago (causa del test fallido). `shipments` no tiene `address_id` (sincronización manual).

---

### 1.7 Contenido, marketing y SEO

---

#### RF-038 · Notificaciones (in-app, push, email)

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | 🟡 Parcial |

**Implementado.**
- **In-app**: `GET /notificaciones`, `NotificationDropdown`, `/cuenta/notificaciones`.
- **Web Push**: `minishlink/web-push` + VAPID; `GET /configuracion/vapid-public-key`, `POST /notificaciones/push/subscribir` / `desuscribir`; banner `PushSubscribeBanner` y SW propio `public/sw.js`.
- **Email**: `NotificationService` con SMTP configurable y `POST /admin/configuracion/probar-email`... **no registrado** en rutas.
- **Log**: tabla `notification_logs` (`type`, `channel`, `subject`, `body`, `status`, `payload`, `sent_at`).

**Gaps.** No existe endpoint `PUT` para marcar como leída (el store lo hace localmente); no hay plantillas de email transaccionales (pedido confirmado, enviado, reembolsado); no hay cola (`QUEUE_CONNECTION=sync`); no hay SMS/WhatsApp operativos.

---

#### RF-039 · Blog / contenidos

**Estado 🔴 · Prioridad Baja.** Existen las secciones `blog_grid` y `article_featured` en el constructor y en `SectionRegistry`, pero **no hay tablas, endpoints ni panel** para artículos. Toda la sección renderiza datos vacíos.

---

#### RF-040 · Newsletter y contacto

**Estado 🟡 · Prioridad Baja.** Existe la sección `newsletter` (UI) pero **no hay** `POST /newsletter` ni `POST /contacto` registrados en `routes/api.php`, ni tablas `newsletters`/`contact_messages`. El formulario no persiste nada.

---

#### RF-041 · SEO técnico

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Implementado.**
- Metadatos por página con `useSeoMeta` (título, descripción, keywords, OG image) desde `GET /configuracion/publica`.
- JSON-LD `WebSite` en el home y datos estructurados en la ficha de producto.
- `robots.txt` presente; `htmlAttrs lang="es"`; `noindex` en rutas de auth, cuenta y carrito.
- Slug único por producto, categoría, marca y etiqueta → URLs limpias (`/producto/{slug}`).

**Gaps (🔴).**
- **No existe `sitemap.xml`** ni generación automática.
- No hay `canonical`, ni `hreflang`, ni manejo de 404/301.
- No hay vista previa de SERP en el panel de configuración.
- Las páginas legales (`/privacidad`, `/terminos`, `/ayuda`) caen al layout `default` **sin navbar ni footer**.

---

### 1.8 Analítica, reportes y auditoría

---

#### RF-042 · Dashboard y analítica

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Backend completo.** `GET /admin/dashboard/resumen`, `ventas-por-dia`, `ventas-por-categoria`, `top-productos`, `usuarios-registrados` (permiso `reportes.ver`), más `alertas`.

**Frontend con datos fabricados.** ⚠️ `pages/admin/index.vue` genera `salesByDay` con **`Math.random()`** y fija a `0` `ventas_hoy`, `clientes`, `ventas_mes`, `ticket_promedio` y `conversion`, **ignorando el servicio `useAdminDashboardService` que sí existe**. Usa datos reales solo para top productos, stock bajo y actividad.

**Gaps.** Sin embudo de conversión, sin tasa de rebote, sin analítica de marketing, sin comparativas inter-período.

---

#### RF-043 · Reportes y exportación

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |

**Descripción.** Cuatro reportes con exportación en tres formatos.

| Reporte | Endpoint | Formatos |
|---|---|---|
| Ventas (con rango de fechas) | `GET /admin/reportes/ventas?desde&hasta&formato` | csv / pdf / excel |
| Inventario | `GET /admin/reportes/inventario?busqueda&formato` | csv / pdf / excel |
| Clientes | `GET /admin/reportes/clientes?formato` | csv / pdf / excel |
| Productos | `GET /admin/reportes/productos?formato` | csv / pdf / excel |

**Implementación.** `ExportService` genera **XML Spreadsheet 2003** (no XLSX nativo, porque `laravel-excel` no está instalado); PDF con dompdf/mpdf. El frontend lo descarga como `Blob`.

**Requisito cubierto.** `Documentacion.md`: "visualizar información de pagos, inventario, productos, clientes, además de exportarse en Excel, pdf y csv" ✅.

**Gaps.** No hay reporte de **pagos** como tal (solo listado en `/admin/pagos`), ni programación/envío por email, ni gráficas exportables.

---

#### RF-044 · Auditoría de acciones

**Estado ✅ · Prioridad Media.** Trait `LogsActivity` en los modelos de negocio → tabla `audit_logs` con `usuario_id`, `accion`, `modulo`, `descripcion`, `ip` y objeto polimórfico `objeto_type/objeto_id` (índice compuesto).

**Reglas.** Solo registra cuando hay usuario autenticado (los tests lo verifican: `AuditTest` 5/5 ✅).

**Gaps.** No hay endpoint de consulta de auditoría en el panel; no hay retención configurable; no se auditan los login fallidos.

---

### 1.9 Plataforma e integraciones

---

#### RF-045 · API pública

**Estado 🟡 · Prioridad Media.**

**Existe.** 110 endpoints REST documentados en Manual Técnico §5, versionados por prefijo `/api/v1`, respuestas uniformes `{success, message, data}`, autenticación Bearer, throttling por ruta.

**Faltan (🔴).** No hay **API keys** para terceros, ni límites de uso por key, ni portal de desarrolladores, ni versionado de deprecación, ni SDKs, ni OpenAPI/Swagger (el esquema vive en Markdown).

---

#### RF-046 · Integraciones externas

**Estado 🟡 · Prioridad Alta.**

| Integración | Estado |
|---|---|
| Pasarelas (Stripe, MercadoPago, PayPal, Wompi, PayU, Rapyd) | Adaptadores definidos; Rapyd/Wompi/MP operativos en UI; PayU sin conectar |
| Transportistas (5) | Stubs con datos simulados |
| SMTP (email) | Configurable; sin plantillas transaccionales |
| Web Push (VAPID) | Operativo |
| WhatsApp | Menciones en config sin implementación |
| Cloud storage (S3/AWS) | Credenciales en `.env`, sin uso verificado |

---

#### RF-047 · Marketplace de temas

**Estado 🟡 · Prioridad Baja.** Hay 16 plantillas locales completas (`lib/templates/index.ts`, 2 539 líneas) con preview y aplicación, pero **no son descargables de terceros** ni hay catálogo externo. Calificaría como "temas incluidos", no como marketplace.

---

#### RF-048 · Marketplace de aplicaciones

**Estado 🔴 · Prioridad Baja (Fase 4).** No existe: sin registro de apps, sin scopes OAuth, sin webhooks salientes, ni UI de instalación.

---

#### RF-049 · Soporte al cliente

**Estado 🟡 · Prioridad Media.**

**Existe.** Datos de soporte en configuración (`support_email`, `support_phone`) que el footer y la página de ayuda exponen; seguimiento público de envíos; centro de notificaciones.

**Falta.** No hay tickets, chat, centro de ayuda con artículos, ni formulario de contacto persistente (`POST /contacto` no existe). `/ayuda` es un placeholder con un `<h2>`.

---

#### RF-050 · Multi-tienda (SaaS multi-tenant)

**Estado 🔴 · Prioridad Baja (Fase 3).** Todo es mono-tienda: `settings` es una tabla plana sin `tenant_id`, no hay resolución de dominio a tienda, ni aislamiento de datos, ni planes de suscripción. El plan objetivo está en `microservicios_plan.md` §6 (*Shared Database, Schema-per-Tenant*).

---

#### RF-051 · Suscripciones y facturación SaaS

**Estado 🔴 · Prioridad Baja (Fase 3).** No existe: ni planes, ni trials, ni facturación recurrente, ni límites por plan.

---

#### RF-052 · Seguridad de la plataforma

| Campo | Valor |
|---|---|
| **Prioridad** | Alta |
| **Estado** | 🟡 Parcial |

**Implementado.**
- Tokens Sanctum con expiración (16 h) + middleware `CheckTokenExpiration`.
- Autorización por permiso en cada ruta admin (`EnsurePermission`), 403 tipado.
- Throttling: login 10/min, registro y códigos 5/min, código 3/5min, resto 120/min.
- Validación estricta en servidor para todos los endpoints (`$request->validate`).
- Auditoría de escrituras con IP.
- Verificación de firma en webhooks de pago.
- Contraseñas con hash bcrypt.
- CORS con `fruitcake/laravel-cors`.

**Debilidades detectadas (🔴 detalladas en Manual Técnico §8).**

1. **Secretos commiteados**: `.env copy` está en git con `APP_KEY`, `DB_PASSWORD`, `MAIL_PASSWORD` y `VAPID_PRIVATE_KEY` con valor real.
2. **Endpoints sin permiso**: `GET /admin/productos`, `GET /admin/usuarios`, `POST/DELETE /admin/upload` solo exigen sesión.
3. **CORS `allowed_origins: '*'`**.
4. **Rutas de carrito públicas** sin verificación documentada de propiedad.
5. `Authenticate::redirectTo()` apunta a `route('login')`, inexistente en una API.
6. Sin Content-Security-Policy ni cabeceras de seguridad.
7. `reviews.rating` sin `CHECK` 1–5; sin protección contra fuerza bruta más allá del throttle.
8. El middleware `auth` del frontend **no valida rol**: cualquier usuario con cookie puede abrir `/admin/*` (la UI responde, pero la API rechaza).

---

#### RF-053 · Offline / PWA

| Campo | Valor |
|---|---|
| **Prioridad** | Media |
| **Estado** | ✅ Implementado |

**Implementado.**
- `@vite-pwa/nuxt` con manifest e inyección de service worker.
- SW propio `public/sw.js` con **background sync** del outbox (`SYNC_OUTBOX`).
- Store `offline.ts` (417 líneas): detección de red, cola de mutaciones con actualización optimista (`_localId`), reintento automático, export/import de la cola, sincronización cada 5 minutos y al recuperar conexión.
- Colecciones cacheadas en IndexedDB (`commerceos-offline`, stores `kv`, `outbox`, `meta`).
- `runMutation` distingue error de red (`isNetworkError`) de error de API y actúa en consecuencia.

**Gaps.** El bloque `runtimeCaching` de Workbox está **comentado** en `nuxt.config.ts` → no hay caché de respuestas API; los iconos PWA referenciados no existen en `public/`.

---

## 2. Requerimientos no funcionales

| ID | Categoría | Requerimiento | Prioridad | Estado |
|---|---|---|---|---|
| RNF-01 | **Escalabilidad** | La API debe soportar crecimiento horizontal: estado sin sesión (tokens Bearer), drivers de caché/cola/sesión configurables (`file` → `redis`), y separación lógica de dominios en `app/Services` lista para extraer a microservicios. | Alta | 🟡 Estado actual `CACHE_DRIVER=file`, `QUEUE_CONNECTION=sync`, sin redis en ejecución. |
| RNF-02 | **Seguridad** | Sin secretos en el repositorio; autorización verificada en cada endpoint; validación de entrada en servidor; HTTPS obligatorio en producción; cabeceras de seguridad; rotación de claves. | Alta | 🔴 `.env copy` commiteado; 3 endpoints sin permiso; CORS `*`. |
| RNF-03 | **Disponibilidad** | Objetivo 99,5% en horario comercial; degradación elegante (modo offline del cliente, respuestas tipadas). | Alta | 🟡 Sin health checks ni monitoreo. |
| RNF-04 | **Mantenibilidad** | Convención Laravel/Nuxt estricta, TypeScript estricto, linter (`eslint`) y `php -l`, capas separadas (pages → services → types), sin lógica de red en componentes. | Media | ✅ Lint delta ≤ 0 en los archivos del proyecto; `typecheck` sin errores propios. |
| RNF-05 | **Rendimiento** | TTFB < 500 ms en API; LCP < 2,5 s en storefront; paginación obligatoria en listados; consultas con `with()` eager loading; imágenes optimizadas. | Alta | 🟡 Falta caché de API, imágenes sin optimizar, dashboard sin índices de agregación. |
| RNF-06 | **Observabilidad** | Logs estructurados por canal, métricas de negocio y de sistema, trazabilidad de peticiones y alertas. | Alta | 🔴 Solo `laravel.log`; sin APM, sin métricas, sin alertas operativas. |
| RNF-07 | **Auditoría** | Toda escritura sobre entidades de negocio debe quedar registrada con usuario, IP, acción y objeto. | Media | ✅ Trait `LogsActivity` + `audit_logs` con índice polimórfico. |
| RNF-08 | **Accesibilidad** | WCAG 2.2 nivel AA: navegación por teclado, foco visible, contraste, `aria-label`, skip-link, respeto de `prefers-reduced-motion`. | Alta | 🟡 Skip-link, `.focus-ring`, `prefers-reduced-motion` y `aria-label` presentes; sin auditoría formal ni `aria-live` en todos los formularios. |
| RNF-09 | **Compatibilidad** | Últimas 2 versiones de Chrome, Firefox, Safari y Edge; responsive mobile-first con breakpoints hasta 3840 px. | Alta | ✅ Tailwind v4 + Nuxt UI, sin dependencias legacy. |
| RNF-10 | **Internacionalización** | Soporte de múltiples idiomas y locales. | Media | 🔴 `@nuxtjs/i18n` ausente; todo el texto hardcodeado en español; `users.idioma` existe pero no se consume. |
| RNF-11 | **Multiidioma (contenido)** | Traducción de contenidos de tienda y productos. | Baja | 🔴 Sin modelo de traducciones. |
| RNF-12 | **Multi-moneda** | Precios y transacciones en múltiples monedas con conversión. | Media | 🔴 Un solo `currency` global; `decimal(18,2)` preparado. |
| RNF-13 | **Respaldo y recuperación** | RPO ≤ 24 h, RTO ≤ 4 h; respaldos automáticos diarios de BD y archivos; restauración probada. | Alta | 🔴 Sin rutina de respaldo en el repo. |
| RNF-14 | **Protección de datos** | Minimización de datos, cifrado en tránsito, expiración de tokens, derechos de acceso/borrado del titular. | Alta | 🟡 Token expira; falta endpoint de borrado de cuenta y política de retención. |
| RNF-15 | **Cumplimiento normativo** | Adecuación a LGPD/Ley 1581 (Colombia): consentimiento, aviso de privacidad, tratamiento de datos. | Alta | 🟡 Textos de `privacidad`/`terminos` estáticos; sin consentimiento explícito en registro. |
| RNF-16 | **Arquitectura distribuida** | Separación en bounded contexts con API Gateway y comunicación sincrónica/asincrónica. | Baja | 🔴 Monolito actual; diseño objetivo en `microservicios_plan.md` (9 servicios). |
| RNF-17 | **Tolerancia a fallos** | Reintentos idempotentes en webhooks, colas con reintentos, circuit breakers en integraciones. | Alta | 🔴 Sin tabla de eventos de webhook ni dead-letter; colas `sync`. |
| RNF-18 | **Pruebas** | Cobertura mínima 70% en backend; E2E críticos de compra; CI que bloquee merges. | Alta | 🟡 78 tests feature (70 ✅ / 8 ❌); `tests/Unit` vacío; sin E2E; CI de frontend solo lint+typecheck, backend sin CI. |

---

## 3. Análisis de brecha frente al alcance tipo Shopify

### 3.1 Requerimientos de `Documentacion.md` → estado

| Requerimiento original | Estado | Evidencia |
|---|---|---|
| Atributos independientes por producto (modelo reutilizable) | ✅ | `variant_attributes` + `variant_attribute_values` reutilizables entre productos |
| Clasificar en marcas, categorías y tags para búsqueda/filtros | ✅ | 3 taxonomías + filtros combinados en `/catalogo` |
| Relacionar productos entre sí | 🟡 | `/relacionados` automático, sin selección manual |
| Productos destacados con orden/preferencia | 🟡 | `is_featured` existe; **sin campo de orden** |
| Personalizar la vista de cada producto con secciones | ✅ | 14 secciones individuales en `products.page_config` |
| Tienda personalizable | ✅ | Editor `/admin/tienda` con 4 pestañas |
| **30–50 componentes de personalización** | ✅ | 24 home + 14 producto + 7 nosotros + navbar/footer/estilos = **45+** |
| Plantillas de ejemplo editables | ✅ | 16 plantillas |
| Personalizar Navbar, Footer, estilos globales, home, producto y nosotros | ✅ | Pestaña *Global* + 3 editores |
| Pagos detallados + notificaciones push a cliente y admin | 🟡 | Pagos con detalle; push existe, falta template de email/push transaccional |
| Distintas APIs de pago configurables | 🟡 | 6 adaptadores; PayU sin conectar |
| Proceso de pago según API activa | ✅ | `GET /pagos/provider` + `PaymentDynamicForm` |
| Envíos detallados en admin + tracking en cliente | ✅ | `/admin/envios` + `/envios/tracking/{n}` |
| Configurar impuestos, moneda y SEO | ✅ | `tax_rate`, `currency`, `meta_*` |
| Ver pedidos de clientes | 🟡 | Listado sí; detalle admin sin endpoint propio |
| Reportes de pagos/inventario/productos/clientes + Excel/PDF/CSV | 🟡 | 4 reportes ✅; **reporte de pagos ausente** |
| Registro a Web Push | ✅ | `PushSubscribeBanner` + `push_subscriptions` |

### 3.2 Capacidades Shopify ausentes (brecha total)

| Capacidad | Estado | Fase sugerida |
|---|---|---|
| Multi-tienda / multi-tenant | 🔴 | Fase 3 |
| Multi-idioma y multi-moneda | 🔴 | Fase 2–3 |
| Motor de impuestos por jurisdicción | 🔴 | Fase 2 |
| Blog / páginas de contenido a medida | 🔴 | Fase 2 |
| Páginas ilimitadas más allá de home/producto/nosotros | 🟡 | Fase 2 |
| App Store / OAuth / webhooks salientes | 🔴 | Fase 4 |
| Theme Store público | 🔴 | Fase 4 |
| API keys + portal de desarrolladores | 🔴 | Fase 4 |
| Abandoned checkout / carritos abandonados | 🔴 | Fase 2 |
| Segmentación y automatizaciones de marketing | 🔴 | Fase 3 |
| Facturación fiscal / notas crédito | 🔴 | Fase 2 |
| Roles y permisos personalizables desde UI | 🔴 | Fase 2 |
| Dominios personalizados + SSL | 🔴 | Fase 3 |
| Colas, caché y workers | 🔴 | Fase 2 |
| Observabilidad y monitoreo | 🔴 | Fase 2 |

---

## 4. Problemas arquitectónicos detectados

| # | Problema | Impacto | Ubicación |
|---|---|---|---|
| P1 | **Doble editor de tienda** con lógica duplicada | Mantenimiento doble, divergencia de comportamiento | `pages/admin/tienda.vue` vs `pages/admin/preview.vue` |
| P2 | **API base hardcodeada** ignorando `runtimeConfig` | Imposible cambiar de entorno sin editar código | `composables/Api.ts`, `services/rapyd.ts` |
| P3 | **Contrato API desincronizado** con la documentación | Documentación engañosa, integraciones rotas | `API_DOCUMENTACION.md` declara rutas inexistentes |
| P4 | **Backend sin CI**; frontend sin `build` ni tests | Regresiones no detectadas | `.github/workflows/` (solo frontend, lint+typecheck) |
| P5 | **Sin capa de cola/caché** (`sync`, `file`) | Fotos bajo carga; email sincrónico bloquea respuestas | `.env` |
| P6 | **Modelos sin relaciones** (`Order::shipments/coupon/refunds`, `User::wishlist/carts`) | Errores 500 en tiempo de ejecución | `app/Models/Order.php` |
| P7 | **Dashboard con datos falsos** | Decisión de negocio sobre datos inventados | `pages/admin/index.vue` |
| P8 | **Migraciones sin FK** en `orders.coupon_id` y `coupon_user.order_id` | Datos huérfanos, JOINs sin índice | migración de `orders`/`coupons` |
| P9 | **Geografía inexistente** (sin provincias/distritos) | Envíos sin tarifa por destino | `addresses` con texto libre |
| P10 | **Componentes huérfanos** y servicios sin consumir | Ruido y deuda (`useMockData`, `CheckoutForm`, `ProfileForm`, `OrderSummary`, `UserTable`, `AppBreadcrumb`, 3 de `feedback`) | frontend |

---

*Continúa: [02-Manual-Tecnico.md](02-Manual-Tecnico.md) · Vuelve al [índice](00-Indice-Documentacion.md)*
