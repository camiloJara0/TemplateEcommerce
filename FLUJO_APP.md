# FLUJO_APP.md — Cómo funciona la aplicación

Contexto para el equipo de frontend: El objetivo es crear una plantilla base reutilizable para ecommerce como una plataforma modular que permita adaptarse a distintos negocios (ropa, tecnología, alimentos, repuestos, etc.) sin rehacer la arquitectura.

Gestión de usuarios
Gestión de productos
Gestión de inventario
Carrito de compras
Pedidos
Pagos
Seguimiento de envíos
Panel administrativo
Reportes
Arquitectura escalable y modular
Módulos Principales


## 1. Roles y permisos

La app tiene 4 roles (config `config/permissions.php`):

- **admin** — acceso total: catálogo, inventario, pedidos, pagos, envíos, cupones,
  reseñas, reportes y configuración de la tienda.
- **vendedor** — catálogo, inventario, pedidos, reseñas, `cupones.ver`.
- **operador_logistica** — pedidos y envíos.
- **cliente** — compra en la tienda (sin permisos de panel).

Cada ruta admin está protegida con middleware `permission`; un rol sin el permiso
recibe `403 FORBIDDEN`.

## 2. Puesta en marcha de una tienda (flujo del administrador)

1. **Login como admin** (`admin@miTienda.com` / `password` en el seeder).
2. **Configurar la tienda** → `PUT /api/v1/admin/configuracion`:
   - Identidad: `store_name`, `store_tagline`, `logo`, `support_email`, `support_phone`.
   - Economía: `currency` (p. ej. `COP`) y `tax_rate` (0.19 = 19% IVA).
     Estos valores **se usan en tiempo real** en el checkout: el frontend los
     lee de `GET /api/v1/configuracion/publica` y el backend los aplica al
     calcular impuestos y totales.
   - Marca: `color_primario`, `color_secundario`, `color_fondo` → la landing
     los usa para el tema visual.
   - SEO: `meta_title`, `meta_description`, `meta_keywords`, `og_image` → para
     compartir en redes y posicionamiento.
3. **Configurar pagos** (`.env` + `config/payments.php`): elegir `stripe`,
   `mercadopago`, `paypal` o `wompi` y fijar credenciales. El provider se recibe
   en `POST /api/v1/pedidos/{id}/pagar`; los webhooks confirman el pago.
4. **Configurar envíos**: métodos de envío (económico/express/recoge en tienda)
   y proveedores (`config/shipping.php`).
5. **Cargar el catálogo**: categorías → marcas → etiquetas → productos (con
   imágenes, variantes, precio, descuento y stock).
6. **Crear promociones**: cupones de porcentaje, monto fijo o envío gratis.
7. **Operar el día a día**: gestionar pedidos (cambiar estado), moderar reseñas,
   monitorear stock/alertas y revisar reportes exportables (CSV/PDF/Excel).

## 3. Vista del cliente (landing moderna)

El frontend puede construir una landing con estos bloques:

1. **Cargar identidad y tema** → `GET /api/v1/configuracion/publica` al iniciar:
   nombre, logo, colores primario/secundario/fondo para el CSS (variables),
   datos de soporte y metadatos SEO.
2. **Hero + catálogo destacado** → `GET /api/v1/productos?destacado=1&per_page=8`.
3. **Categorías y filtros** → `GET /api/v1/categorias`, filtros de producto
   (`busqueda`, `marca_id`, `precio_min/max`, `orden`).
4. **Ficha de producto** → `GET /api/v1/productos/{slug}` con imágenes, variantes,
   precio efectivo (con descuento), rating promedio y reseñas
   (`GET /api/v1/productos/{id}/resenas`) + relacionados.
5. **Carrito** → agregar con `POST /api/v1/carrito/items`; funcionar igual para
   invitados (enviar `session_id`) y clientes logueados. Al hacer login se
   transfiere el carrito del invitado.
6. **Checkout** → `POST /api/v1/checkout/preview` para el resumen (subtotal,
   descuento por cupón, envío, impuestos, total) y `POST /api/v1/pedidos` para
   confirmar (con `address_id`, `shipping_method_id`, `coupon_code`).
7. **Pago** → `POST /api/v1/pedidos/{id}/pagar` con el provider; el webhook
   confirma y el estado del pedido pasa a `pagado`.
8. **Post-compra** → seguimiento con `GET /api/v1/envios/tracking/{numero}`,
   reseñar el producto comprado (solo si el pedido está **entregado**), marcar
   favoritos y recibir notificaciones (in-app + push).

## 4. Mecánica del carrito y checkout

- El carrito se identifica por `user_id` (logueado) o `session_id` (invitado).
- `checkout/preview` calcula: `subtotal − descuento + envío + impuestos = total`.
  El descuento viene de aplicar el cupón; los impuestos usan `tax_rate` de la
  configuración de la tienda y la moneda es `currency`.
- `POST /v1/pedidos` valida stock, registra movimientos de inventario, descuenta
  cupones (con límites de uso por usuario) y deja el pedido en `nuevo`.

## 5. Reportes y auditoría

- **Reportes** (`/v1/admin/reportes/*`): ventas (con fechas), inventario,
  clientes y productos. Se pueden exportar a CSV, PDF o Excel añadiendo
  `?formato=`.
- **Auditoría**: cada creación/edición/eliminación sobre los modelos de negocio
  (productos, pedidos, pagos, envíos, cupones, reseñas, configuración…) queda
  registrada en `audit_logs` con usuario, acción, módulo, IP y objeto — solo
  cuando hay un usuario autenticado.

## 6. Resumen de decisiones técnicas

- API REST stateless con Sanctum; tokens Bearer (16 h de vida).
- Respuestas uniformes `{success, message, data}`.
- Paginación con `per_page`; `data.pagination` devuelve total/página.
- Dinero en `decimal(18,2)`; moneda por defecto `COP`.
- Permisos por archivo de configuración (sin tablas).
- LogsActivity en los modelos ⇒ auditoría automática sin código extra.
- Settings en tabla `settings` con helpers `store_setting()` / `store_currency()`
  para usar configuración dinámica en cualquier parte del código.