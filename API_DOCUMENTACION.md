# Documentación API — Plantilla Ecommerce

Base URL: `http://localhost:8000/api` · Prefijo: `/api/v1`
Formato respuesta: `{ "success": bool, "message": string|null, "data": mixed }`
Errores de validación: `422` con `{ success: false, errors: {...} }`

Autenticación: cabecera `Authorization: Bearer {token}`. Los tokens expiran a las
16 horas (`POST /login` devuelve `expires_in`).

---

## 1. Autenticación (pública)

| Método | Ruta | Body |
|--------|------|------|
| POST | `/v1/register` | `nombre`, `email`, `password`, `password_confirmation` (min 8) |
| POST | `/v1/login` | `email`, `password` → `{ access_token, token_type, expires_in, user }` |
| POST | `/v1/logout` | — (autenticado) |
| POST | `/v1/enviar-codigo` | `email` (existe) → envía código de 6 dígitos |
| POST | `/v1/verificar-codigo-cambio` | `email`, `codigo` (6 dígitos) → permite cambiar contraseña |

## 2. Perfil y direcciones (cliente)

| Método | Ruta | Body |
|--------|------|------|
| GET | `/v1/perfil` | — |
| PUT | `/v1/perfil` | `nombre`, `telefono`, `foto`, `idioma` (opcionales) |
| GET/POST | `/v1/direcciones` | POST: `label`, `pais`, `ciudad`, `direccion`, `codigo_postal`, `telefono`, `es_principal` |
| PUT/DELETE | `/v1/direcciones/{id}` | mismos campos (parcial) |

## 3. Catálogo (público)

| Método | Ruta | Params |
|--------|------|--------|
| GET | `/v1/productos` | `busqueda`, `categoria_id`, `marca_id`, `tag`(slug), `precio_min`, `precio_max`, `destacado`(1), `orden`(`precio_asc`, `precio_desc`, `mas_vendidos`), `per_page` |
| GET | `/v1/productos/{slug}` | — |
| GET | `/v1/productos/{id}/relacionados` | — |
| GET | `/v1/productos/{id}/resenas` | reseñas públicas aprobadas |
| GET | `/v1/categorias`, `/v1/marcas`, `/v1/etiquetas` | — |
| GET | `/v1/metodos-envio` | métodos de envío activos |

## 4. Carrito

| Método | Ruta | Body |
|--------|------|------|
| GET | `/v1/carrito` | query `session_id` (invitado) |
| POST | `/v1/carrito/items` | `session_id`(opc), `product_id`, `product_variant_id`(opc), `quantity`(opc, min 1) |
| PUT | `/v1/carrito/items/{item}` | `quantity` (min 1) |
| DELETE | `/v1/carrito/items/{item}` | — |
| DELETE | `/v1/carrito` | `session_id`(opc) |

## 5. Checkout

| Método | Ruta | Body |
|--------|------|------|
| POST | `/v1/checkout/preview` | `session_id`(opc), `address_id`(opc), `shipping_method_id`(opc), `coupon_code`(opc) → `{ subtotal, discount, shipping, tax, total, currency }` |
| POST | `/v1/pedidos` | `session_id`(opc), `address_id`**, `shipping_method_id`**, `coupon_code`(opc), `notes` → pedido creado |
| POST | `/v1/pedidos/{id}/pagar` | `provider` (`stripe`, `mercadopago`, `paypal`, `wompi`), `reference`(opc) |
| GET | `/v1/pedidos` | pedidos del usuario (paginado, `per_page`) |
| GET | `/v1/pedidos/{id}` | detalle + items + historial + pagos |
| POST | `/v1/cupones/aplicar` | `code`, `subtotal`, `shipping`(opc) → validación del cupón |

## 6. Reseñas (cliente autenticado)

| Método | Ruta | Body |
|--------|------|------|
| POST | `/v1/productos/{id}/resenas` | `rating` (1-5 entero), `comment` (máx 2000). Requiere compra **entregada** del producto |

## 7. Favoritos (cliente)

| Método | Ruta | Body |
|--------|------|------|
| GET | `/v1/favoritos` | — |
| POST | `/v1/favoritos` | `product_id` |
| DELETE | `/v1/favoritos/{producto}` | — |
| POST | `/v1/favoritos/{item}/mover-al-carrito` | — |

## 8. Notificaciones (cliente)

| Método | Ruta | Body |
|--------|------|------|
| GET | `/v1/notificaciones` | — |
| POST | `/v1/notificaciones/push/subscribir` | `endpoint`, `keys`(p256dh, auth) |
| POST | `/v1/notificaciones/push/desuscribir` | `endpoint` |

## 9. Seguimiento público de envíos

| Método | Ruta |
|--------|------|
| GET | `/v1/envios/tracking/{trackingNumber}` | — |

## 10. Configuración pública de la tienda (landing)

| Método | Ruta |
|--------|------|
| GET | `/v1/configuracion/publica` | → `store_name`, `store_tagline`, `logo`, `currency`, `tax_rate`, `default_language`, `support_email`, `support_phone`, `color_primario`, `color_secundario`, `color_fondo`, `meta_title`, `meta_description`, `meta_keywords`, `og_image` |

---

# Panel administrativo `/v1/admin` (requiere token + permiso)

## Productos, categorías, marcas, etiquetas

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| POST | `/v1/admin/productos` | `productos.crear` | `name`, `sku`, `price`, `category_id`, `brand_id`, `description`, `price_discount`, `weight`, `stock`, `is_featured`, `estado`(`activo`/`inactivo`), `images[]`(urls), `tags[]`(ids), `variants[]`(`sku`,`price`,`price_discount`,`stock`,`image`,`attribute_values[]`) |
| PUT | `/v1/admin/productos/{id}` | `productos.editar` | mismos campos (parcial) |
| DELETE | `/v1/admin/productos/{id}` | `productos.eliminar` | — |
| POST/PUT/DELETE | `/v1/admin/categorias{/id}` | `productos.categorias.*` | `name`, `parent_id`, `description`, `image`, `sort_order`, `is_active` |
| POST/PUT/DELETE | `/v1/admin/marcas{/id}` | `productos.marcas.*` | `name`, `description`, `image`, `is_active` |
| POST/PUT/DELETE | `/v1/admin/etiquetas{/id}` | `productos.etiquetas.*` | `name`, `slug` |

## Inventario

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| GET | `/v1/admin/inventario/movimientos` | `inventario.ver` | — |
| POST | `/v1/admin/inventario/movimientos` | `inventario.movimientos.crear` | `product_id`, `product_variant_id`(opc), `tipo`(`entrada`/`salida`/`ajuste`), `cantidad` (entero), `razon` |
| GET | `/v1/admin/inventario/alertas` | `inventario.alertas.ver` | — |
| POST | `/v1/admin/inventario/alertas` | `inventario.alertas.crear` | `product_id`, `min_stock`, `active` |

## Pedidos y pagos

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| GET | `/v1/admin/pedidos` | `pedidos.ver` | `status`, `payment_status`, `busqueda`, `per_page` |
| POST | `/v1/admin/pedidos/{id}/estado` | `pedidos.gestionar` | `estado`(`nuevo`,`pagado`,`preparando`,`enviado`,`entregado`,`cancelado`,`devuelto`), `comentario`(opc) |
| POST | `/v1/admin/pagos/{id}/reembolsar` | `pagos.gestionar` | `amount`, `reason` |

## Envíos

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| GET | `/v1/admin/envios` | `envios.ver` | — |
| POST | `/v1/admin/envios` | `envios.crear` | `order_id`, `carrier`(`servientrega`,`coordinadora`,`dhl`,`fedex`,`interrapidisimo`), `weight`, `address_id` |
| GET | `/v1/admin/envios/cotizar` | `envios.ver` | `carrier`, `weight`, `destino` (ciudad) |
| GET | `/v1/admin/envios/{id}` | `envios.ver` | — |
| PUT | `/v1/admin/envios/{id}/estado` | `envios.gestionar` | `estado`(`en_preparacion`,`despachado`,`en_transito`,`entregado`) |

## Cupones

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| GET | `/v1/admin/cupones` | `cupones.ver` | — |
| POST | `/v1/admin/cupones` | `cupones.crear` | `code`(máx 50), `type`(`percent`/`fixed`/`free_shipping`), `value`, `min_subtotal`, `max_discount`, `usage_limit`, `per_user_limit`, `starts_at`, `expires_at`, `active` |
| PUT | `/v1/admin/cupones/{id}` | `cupones.editar` | mismos (parcial) |
| DELETE | `/v1/admin/cupones/{id}` | `cupones.eliminar` | — |

## Reseñas (moderación)

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/v1/admin/resenas` | `reviews.moderar` |
| POST | `/v1/admin/resenas/{id}/aprobar` | `reviews.moderar` |
| POST | `/v1/admin/resenas/{id}/rechazar` | `reviews.moderar` |
| DELETE | `/v1/admin/resenas/{id}` | `reviews.moderar` |

## Dashboard y reportes

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/v1/admin/dashboard/resumen` | `reportes.ver` | KPIs: ventas_hoy, pedidos_mes, clientes, stock_bajo |
| GET | `/v1/admin/dashboard/ventas-por-dia` | `reportes.ver` | `dias`(opc) |
| GET | `/v1/admin/dashboard/ventas-por-categoria` | `reportes.ver` | — |
| GET | `/v1/admin/dashboard/top-productos` | `reportes.ver` | `limite`(opc) |
| GET | `/v1/admin/dashboard/usuarios-registrados` | `reportes.ver` | — |
| GET | `/v1/admin/reportes/ventas` | `reportes.ver` | `desde`(YYYY-MM-DD), `hasta`, `formato`(`csv`/`pdf`/`excel`) |
| GET | `/v1/admin/reportes/inventario` | `reportes.ver` | `busqueda`, `formato` |
| GET | `/v1/admin/reportes/clientes` | `reportes.ver` | `formato` |
| GET | `/v1/admin/reportes/productos` | `reportes.ver` | `formato` |

## Configuración de la tienda

| Método | Ruta | Permiso | Body |
|--------|------|---------|------|
| GET | `/v1/admin/configuracion` | `configuracion.ver` | — (agrupada: general/colores/seo) |
| PUT | `/v1/admin/configuracion` | `configuracion.editar` | `store_name`, `store_tagline`, `logo`, `currency`(3 letras), `tax_rate`(0-1), `default_language`, `support_email`, `support_phone`, `color_primario`, `color_secundario`, `color_fondo`, `meta_title`, `meta_description`, `meta_keywords`, `og_image` |

---

# Webhooks (sin autenticación)

| Método | Ruta |
|--------|------|
| POST | `/v1/webhooks/pagos/{provider}` | notificaciones del proveedor de pagos |

# Estados y valores aceptados (resumen)

- **Estado producto**: `activo`, `inactivo`
- **Estado pedido**: `nuevo`, `pagado`, `preparando`, `enviado`, `entregado`, `cancelado`, `devuelto`
- **Payment status**: `pendiente`, `pagado`, `fallido`, `reembolsado`
- **Shipping status**: `pendiente`, `en_preparacion`, `despachado`, `en_transito`, `entregado`
- **Tipo cupón**: `percent` (%), `fixed` (monto), `free_shipping`
- **Provider pago**: `stripe`, `mercadopago`, `paypal`, `wompi`
- **Carrier envío**: `servientrega`, `coordinadora`, `dhl`, `fedex`, `interrapidisimo`
- **Tipo movimiento stock**: `entrada`, `salida`, `ajuste`
- **Formato reporte**: `csv`, `pdf`, `excel`
- **Rating reseña**: entero 1–5
- **Moneda**: código ISO 3 letras (`COP`, `USD`, …)