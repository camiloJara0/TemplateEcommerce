# 3 · Manual de Usuario

**CommerceOS — guía de operación diaria**
Versión 1.0 · 24/09/2026

---

## Índice

1. [Primeros pasos](#1-primeros-pasos)
2. [Panel de Administrador](#2-panel-de-administrador)
3. [Módulo por módulo](#3-módulo-por-módulo)
4. [Constructor de tienda](#4-constructor-de-tienda)
5. [Cliente final](#5-cliente-final)
6. [Solución de problemas](#6-solución-de-problemas)
7. [Glosario de estados](#7-glosario-de-estados)

---

## 1. Primeros pasos

### 1.1 Acceso

| Rol | URL | Ruta por defecto al iniciar sesión |
|---|---|---|
| Administrador / Super Admin | `/auth/login` → `/admin` | Dashboard |
| Vendedor | `/auth/login` → `/admin/pedidos` | Pedidos |
| Operador de logística | `/auth/login` → `/admin/envios` | Envíos |
| Cliente | `/auth/login` → `/` | Tienda |

**Credenciales de demostración (seeder):** `admin@miTienda.com` / `password`.

**Cuenta de prueba de desarrollo:** `admin@commerceos.dev` / `password123`.

### 1.2 Recuperar la contraseña

1. En `/auth/recuperar` ingresa tu correo y pulsa **Enviar código**.
2. Revisa la bandeja de entrada: recibes un código de 6 dígitos.
3. Ingresa el código y define la nueva contraseña (mínimo 8 caracteres).

> ⚠️ Puedes solicitar el código **3 veces cada 5 minutos**. Si llega al límite, espera 5 minutos.

### 1.3 Cambiar de sesión

**Cerrar sesión:** avatar (esquina superior derecha) → **Cerrar sesión**. El token se revoca en el servidor.

### 1.4 Entender la interfaz del panel

```
┌────────────┬──────────────────────────────────────────────┐
│ Barra      │ Logo · Buscador · Alertas · Perfil · Estado  │
│ lateral    ├──────────────────────────────────────────────┤
│            │                                              │
│ Dashboard  │           Contenido principal                │
│ Productos  │           (listado, formulario,              │
│ Categorías │            editor, reportes)                 │
│ …          │                                              │
│            │                                              │
├────────────┴──────────────────────────────────────────────┤
│ Aviso de conectividad (modo offline) cuando aplica        │
└───────────────────────────────────────────────────────────┘
```

- El **menú lateral** solo muestra los módulos a los que tu rol tiene permiso.
- El **campanita** agrupa notificaciones; el avatar abre perfil y cierre de sesión.
- Todo formulario muestra validación en línea y mensajes de éxito/error con toast.

---

## 2. Panel de Administrador

### 2.1 Dashboard (`/admin`)

| KPI / widget | Origen |
|---|---|
| Resumen de ventas, ventas por día, top productos, stock bajo, actividad reciente | `GET /admin/dashboard/*` (permiso `reportes.ver`) |

**Lo que muestra hoy.** Top productos, stock bajo y actividad reciente con datos reales; las tarjetas de *ventas del día*, *clientes*, *ticket promedio* y *conversión* están en proceso de conexión al servicio real (ver SRS RF-042 — hoy se muestran con datos de ejemplo).

**Cómo usarlo.** Es de solo lectura: entra desde él para saltar a módulos con alertas (stock bajo → `/admin/inventario`).

### 2.2 Barra lateral

| Sección | Pantallas | Permisos requeridos |
|---|---|---|
| Catálogo | productos, categorías, marcas, etiquetas, atributos | `productos.*` |
| Operación | inventario, pedidos, envíos | `inventario.*`, `pedidos.*`, `envios.*` |
| Ventas | pagos, cupones, reseñas | `pagos.*`, `cupones.*`, `reviews.moderar` |
| Clientes | usuarios | `usuarios.*` ⚠️ (la lista hoy no exige permiso) |
| Análisis | reportes, dashboard | `reportes.ver` |
| Sistema | configuración, tienda, plantillas | `configuracion.*` |

---

## 3. Módulo por módulo

### 3.1 Productos (`/admin/productos`)

**Qué hace.** Alta, edición, duplicado, activación y borrado de productos con imágenes, etiquetas y variantes.

#### Crear un producto

1. Pulsa **Nuevo producto**.
2. **Datos básicos**
   | Campo | Requerido | Reglas |
   |---|---|---|
   | Nombre | ✅ | máx. 255 caracteres |
   | SKU | ✅ | único en toda la tienda |
   | Slug | automático | se genera desde el nombre; debe quedar único |
   | Descripción | — | texto largo |
   | Precio | ✅ | ≥ 0, dos decimales |
   | Precio con descuento | — | debe ser menor al precio base |
   | Peso | — | para cálculo de envío |
   | Categoría / Marca | — | si se elimina la marca/categoría, el producto queda sin clasificar |
   | Estado | ✅ | `Activo` (visible) / `Inactivo` (oculto) |
   | Destacado | — | aparece en la sección de destacados del home |
3. **Imágenes** — sube JPG/PNG/WEBP de hasta 2 MB. El primer ordenado es la portada; puedes reordenar arrastrando.
4. **Etiquetas** — selecciona existentes o crea una nueva con **Nueva etiqueta** (modal en la misma pantalla).
5. **Variantes** — pulsa **Añadir variante**: elige los valores de atributo (Color: Negro, Talla: M…), define SKU, precio, descuento e imagen de cada combinación.
   - El **stock total del producto se recalcula como la suma de sus variantes**.
   - Dejar la lista vacía **elimina todas las variantes** al guardar.
6. **Secciones de página** — configura las secciones individuales (problema/solución, características, comparativa…) de la ficha pública.
7. **Guardar**. Si hubo errores, el formulario resalta los campos con problema.

#### Editar / duplicar / eliminar

- **Editar** abre el mismo formulario en modo actualización: los campos vacíos **no borran** lo existente salvo que lo indiques (imágenes, etiquetas y variantes sí se sincronizan con lo que envías).
- **Duplicar** crea una copia inactiva con SKU nuevo.
- **Eliminar** es borrado lógico: el producto desaparece del listado y de la tienda, pero sus pedidos históricos conservan el nombre y el precio.
- **Cambio rápido de estado** con el interruptor de la fila.

#### Marcas y etiquetas desde el mismo listado

- **Nueva marca** / **Nueva etiqueta** abren un modal sin salir de la pantalla.
- Cada marca muestra su contador de productos.
- **No puedes eliminar una marca con productos asociados**: el sistema lo bloquea con un mensaje indicando cuántos productos la usan.

### 3.2 Categorías (`/admin/categorías`)

| Campo | Regla |
|---|---|
| Nombre | requerido |
| Slug | único |
| Categoría padre | opcional → permite jerarquía |
| Orden | define el orden en el menú |
| Imagen, descripción, estado | opcionales |

**Regla importante:** al eliminar una categoría padre **sus hijas no se borran**: quedan en la raíz (`sin categoría padre`).

### 3.3 Atributos de variante (`/admin/productos` → botón **Atributos**)

Gestiona el catálogo reutilizable de atributos (Color, Talla, Material) y sus valores.

1. **Nuevo atributo** → nombre (máx. 100, único).
2. Dentro del atributo → **Nuevo valor** (máx. 100, único por atributo).
3. Edita o borra valores.

**Protecciones:**
- No puedes borrar un atributo que usan variantes → `409` con mensaje.
- No puedes borrar un valor en uso → `409` con mensaje.
- Solución: reasigna las variantes primero y vuelve a intentarlo.

### 3.4 Inventario (`/admin/inventario`)

**Movimientos.** Libro de entradas, salidas, devoluciones y ajustes.

| Campo | Regla |
|---|---|
| Producto | requerido |
| Variante | opcional |
| Cantidad | entero ≠ 0 |
| Tipo | `entrada` · `salida` · `devolución` · `ajuste` |
| Motivo | recomendado; queda en la trazabilidad |

**Reglas:**
- No puedes registrar una **salida mayor al stock disponible**.
- Los cambios de estado de pedido que implican despacho generan movimientos automáticamente.
- Todo movimiento registra el usuario que lo hizo.

**Alertas.** Define un **stock mínimo** por producto: cuando el stock baja de ese umbral, el producto aparece en *Stock bajo* del dashboard y en el contador del menú lateral.

### 3.5 Pedidos (`/admin/pedidos`)

**Listado.** Filtros por estado, estado de pago y búsqueda (número o cliente).

**Cambio de estado** — desde la fila o desde el detalle:

| Estado | Cuándo usarlo |
|---|---|
| `nuevo` | recién creado, sin pagar |
| `pagado` | pago confirmado (también lo escribe el webhook) |
| `preparando` | en preparación/empaque |
| `enviado` | entregado al transportista (crea el envío) |
| `entregado` | confirmado por el cliente/transportista → **habilita la reseña** |
| `cancelado` | anulado; libera stock |
| `devuelto` | devolución gestionada |

Cada cambio escribe un registro en el **historial** con usuario, fecha y comentario opcional.

> ⚠️ El detalle del pedido se construye con los datos del listado (hoy no existe `GET /admin/pedidos/{id}`). Recarga la lista si necesitas la información más reciente.

### 3.6 Pagos (`/admin/pagos`)

- **Listado** con proveedor, monto, moneda y estado.
- **Reembolsar** → monto y motivo (crea un registro en `refunds` con estado `pendiente`).
- **Cancelar** → anula el pago pendiente.
- Ambas acciones requieren `pagos.gestionar`.

### 3.7 Envíos (`/admin/envios`)

1. **Cotizar** → eliges transportista y destino; el sistema devuelve tarifa y días estimados.
2. **Crear envío** → número de guía único, transportista, dirección del destinatario.
3. **Cambiar estado** → `pendiente` → `en_preparacion` → `despachado` → `en_transito` → `entregado`.
4. El cliente consulta el seguimiento en `/cuenta/pedidos/{id}` o públicamente con el número de guía.

> ℹ️ Los transportistas están en modo simulado: las tarifas no provienen todavía de las APIs reales de Servientrega/DHL/etc.

### 3.8 Cupones (`/admin/cupones`)

| Campo | Regla |
|---|---|
| Código | único, máx. 50 |
| Tipo | `percent` (%) · `fixed` (valor fijo) · `free_shipping` (envío gratis) |
| Valor | ≥ 0 |
| Subtotal mínimo | compra mínima para aplicar |
| Descuento máximo | tope para cupones porcentuales |
| Límite total / por usuario | contadores de uso |
| Vigencia | `desde` < `hasta` |
| Activo | sí/no |

**Cómo se usan:** el cliente escribe el código en el checkout → `POST /cupones/aplicar` valida vigencia y límites → el total se recalcula en el servidor. Cada uso queda registrado con el descuento aplicado.

### 3.9 Reseñas (`/admin/resenas`)

- **Aprobar** → la reseña es visible en la ficha del producto y actualiza `rating_avg`.
- **Rechazar** → queda oculta.
- **Eliminar** → retira la reseña y recalcula el promedio.
- Solo los clientes con pedido **entregado** pueden reseñar (regla del sistema).

### 3.10 Usuarios (`/admin/usuarios`)

- **Listado** paginado.
- **Invitar / crear** → nombre, correo y rol (`vendedor`, `operador_logistica`, `cliente`…).

> ⚠️ **Limitación actual:** no existe edición ni eliminación de usuarios, ni administración de permisos desde la UI. Los permisos viven en `config/permissions.php` y se ajustan desplegando el backend (ver SRS RF-004/RF-005).

### 3.11 Reportes (`/admin/reportes`)

| Reporte | Filtros | Formatos |
|---|---|---|
| Ventas | rango de fechas | CSV · PDF · Excel |
| Inventario | búsqueda | CSV · PDF · Excel |
| Clientes | — | CSV · PDF · Excel |
| Productos | — | CSV · PDF · Excel |

**Pasos:** selecciona reporte → aplica filtros → **Exportar** → elige formato → se descarga el archivo.

### 3.12 Configuración (`/admin/configuracion`)

**General.** Nombre, eslogan, logo, moneda (3 letras ISO), tasa de impuesto (0–1, p. ej. `0.19`), idioma, email y teléfono de soporte.

**Colores.** Paleta primaria/secundaria/fondo → la tienda los aplica en tiempo real.

**SEO.** `meta_title`, `meta_description`, `meta_keywords`, `og_image`.

**Pagos.** Credenciales de las pasarelas activas (Stripe, Mercado Pago, Wompi, Rapyd, PayPal, PayU).

**Tienda.** Abre el constructor (§4).

> ⚠️ El proveedor de pago efectivo lo fija la variable de entorno `PAYMENT_PROVIDER` del servidor, no la UI.

### 3.13 Perfil del administrador (`/admin/perfil`)

Edita nombre, teléfono, foto e idioma. Aquí también se cierra la sesión.

---

## 4. Constructor de tienda (`/admin/tienda`)

### 4.1 Interfaz

```
┌──────────────┬─────────────────────────────────────┬──────────┐
│ Secciones    │                                     │ Ajustes  │
│ (orden,      │      Previsualización en vivo       │ de la    │
│  ocultar,    │      (clic para seleccionar         │ sección  │
│  duplicar,   │       una sección)                  │          │
│  eliminar,   │                                     │          │
│  variante)   │                                     │          │
└──────────────┴─────────────────────────────────────┴──────────┘
```

**Pestañas superiores:** **Inicio** · **Producto** · **Nosotros** · **Global**.

### 4.2 Añadir una sección

1. Pulsa **Agregar sección**.
2. Se abre el catálogo con **24 definiciones** agrupadas por categoría: `layout`, `hero`, `content`, `conversion`, `social`, `media`; usa el buscador para filtrar.
3. Cada tarjeta muestra descripción, variantes de diseño y preview.
4. Al elegir, la sección se añade al final y su editor se abre abajo.
5. **Guardar** persiste toda la configuración (si estás sin conexión, queda en cola y se sincroniza al volver).

### 4.3 Reorganizar

En la lista lateral de secciones puedes, por cada sección:
- **Reordenar** (arrastrar o usar las flechas) — el orden es el de la tienda pública.
- **Ocultar** — sigue configurada pero no se renderiza.
- **Duplicar** — copia con la misma configuración.
- **Eliminar** — requiere confirmación.
- **Cambiar de variante** — se conservan los campos comunes (`COMMON_FIELDS`).

### 4.4 Global

- **Estilos**: tipografía, paleta de 20 colores (claro/oscuro), fondos sólidos o degradados, bordes y espaciados → se aplican como variables CSS en vivo.
- **Navbar**: enlaces (texto, URL, visible) y activación de buscador, carrito y favoritos.
- **Footer**: copyright y columnas con enlaces.

### 4.5 Plantillas (`/admin/plantillas`)

16 plantillas completas (`modern-store`, `luxury-boutique`, `tech-store`, `gourmet-restaurant`…), filtrables por categoría, dificultad y búsqueda.

**Previsualizar** → **Aplicar** → la configuración actual se **reemplaza por completo**.

> ⚠️ Aplicar una plantilla es destructivo y no guarda una copia de lo anterior. Antes de aplicar, copia manualmente o ten claro que no hay deshacer hacia la configuración previa.

### 4.6 Vista previa (`/admin/preview`)

Editor alternativo con 9 pestañas. Está previsto consolidarlo con `/admin/tienda`; usa `/admin/tienda` como pantalla principal.

---

## 5. Cliente final

### 5.1 Navegar y comprar

1. **Home** (`/`) — secciones dinámicas, destacados y novedades.
2. **Catálogo** (`/catalogo`) — buscador con sugerencias, filtros por categoría, marca y rango de precio, orden (`precio asc/desc`, `más vendidos`) y paginación de 24.
3. **Ficha de producto** (`/producto/{slug}`) — galería, precio/descuento, selector de variante, stock, reseñas, relacionados y secciones configuradas por el merchant.
4. **Añadir al carrito** → drawer lateral con cantidad y total; funciona **sin conexión** (se sincroniza al recuperar red).
5. **Carrito** (`/carrito`) → revisar cantidades, eliminar líneas, vaciar.
6. **Checkout** (`/checkout`) en 3 pasos:
   - **Dirección** — selecciona una guardada o crea una (`label`, país, ciudad, dirección, código postal, teléfono).
   - **Envío** — elige entre los métodos activos (coste y días estimados).
   - **Cupón y notas** — aplica código y agrega indicaciones.
   - El resumen recalcula `subtotal − descuento + envío + impuestos = total` **siempre en el servidor**.
7. **Pago** (`/checkout/pago/{id}`) — el formulario depende de la pasarela activa:
   - **Rapyd**: métodos por país (tarjeta, PSE, Nequi, efectivo…) con campos dinámicos.
   - **Stripe**: tarjeta con Stripe Elements.
   - **Mercado Pago**: redirige a su pantalla.
   - **Wompi**: tarjeta, Nequi o PSE.
8. El pedido queda en `nuevo` / pago `pendiente` hasta que la pasarela confirma por webhook → estado `pagado`.

### 5.2 Mi cuenta (`/cuenta`)

| Sección | Qué puedes hacer |
|---|---|
| **Perfil** | nombre, teléfono, foto, idioma; crear/editar/eliminar direcciones |
| **Pedidos** | lista, detalle con items, estados, historial y número de guía |
| **Favoritos** | guardar productos y **mover al carrito** en un clic |
| **Notificaciones** | centro de avisos in-app y activación de notificaciones push |

### 5.3 Reseñas

En la ficha de un producto comprado con pedido **entregado** aparece el formulario: estrellas 1–5 + comentario (máx. 2 000 caracteres). Pasa por moderación antes de publicarse.

### 5.4 Seguimiento de envío

Desde **Mis pedidos → detalle**, o públicamente con el número de guía en `GET /envios/tracking/{numero}`.

### 5.5 Cambiar mi contraseña

`/auth/recuperar` con tu correo → código de 6 dígitos → nueva contraseña.

> ℹ️ Hoy no existe un botón "cambiar contraseña" dentro de la cuenta; el flujo es por código de recuperación.

---

## 6. Solución de problemas

### Para el administrador

| Síntoma | Causa probable | Solución |
|---|---|---|
| "No tienes permisos" (403) | Tu rol no incluye ese módulo | Solicita al administrador que ajuste `config/permissions.php` y redespliegue |
| Sesión caducada de golpe | Token con 16 h de validez | Vuelve a iniciar sesión (te redirige con `?redirect=` al punto original) |
| No puedo eliminar una marca/categoría | Tiene productos asociados | Desasocia los productos primero o reasígnalos |
| No puedo borrar un atributo de variante | Está en uso por variantes | Reasigna esas variantes antes |
| "SKU duplicado" al guardar | El SKU ya existe en otro producto | Usa un SKU único |
| Las imágenes no suben | Formato o tamaño no admitido | JPG/PNG/WEBP ≤ 2 MB |
| El producto no aparece en la tienda | Estado `Inactivo` | Activa el producto desde el listado |
| El stock no cambia | El producto tiene variantes | Edita el stock de las **variantes**: el total se suma |
| Los cambios del constructor no se ven | Falta pulsar **Guardar** / secciones ocultas | Guarda y revisa el interruptor de visibilidad |
| Aplicé una plantilla y perdí mi diseño | Es destructivo | No hay deshacer; reconstruye o aplica otra plantilla |
| El webhook de pago no actualiza el pedido | Firma inválida o URL expuesta | Revisa credenciales y `POST /api/webhooks/pagos/{provider}` |
| La pasarela no aparece en checkout | `PAYMENT_PROVIDER` no coincide con `class_map` | Ajusta el `.env` y reinicia |
| Export no genera Excel | Se genera XML Spreadsheet 2003 | Ábrelo con Excel/LibreOffice; guarda como `.xlsx` si lo necesitas |
| Al confirmar el pago sale error 500 | Bug conocido en `PaymentService::crearEnvioAutomatico()` (relación `Order::shipments()` inexistente) | Pendiente de corrección (SRS RF-036) |
| El dashboard muestra ceros | Algunos KPIs aún no consumen el servicio real | Ver SRS RF-042 |

### Para el cliente

| Síntoma | Causa probable | Solución |
|---|---|---|
| No puedo iniciar sesión | Credenciales o token vencido | Verifica la contraseña o usa "Recuperar contraseña" |
| No llega el código de recuperación | Límite de envíos o spam | Espera 5 min; revisa spam (`3 envíos / 5 min`) |
| El cupón no aplica | Vigencia, mínimo de compra o límite alcanzado | Revisa las condiciones del cupón |
| No puedo reseñar | El pedido aún no está `entregado` | Espera a la entrega |
| El carrito no sincroniza | Sin conexión | Se guarda en cola local y se envía al volver la red |
| "429 Demasiadas peticiones" | Límite de 60 req/min | Espera un minuto |
| No veo el carrito guardado | Sesión en otro navegador/dispositivo | El carrito de invitado viaja por navegador; inicia sesión para persistirlo |

---

## 7. Glosario de estados

### Pedidos

| Estado | Significado |
|---|---|
| `nuevo` | Creado, pendiente de pago |
| `pagado` | Pago confirmado por la pasarela |
| `preparando` | En proceso de preparación/empaque |
| `enviado` | Entregado al transportista |
| `entregado` | Recibido por el cliente → habilita reseña |
| `cancelado` | Anulado (libera stock) |
| `devuelto` | Devolución gestionada |

### Pagos

`pendiente` · `pagado` · `fallido` · `reembolsado` · `cancelado`

### Envíos

`pendiente` · `en_preparacion` · `despachado` · `en_transito` · `entregado`

### Reseñas

`pendiente` (en moderación) · `aprobada` (visible) · `rechazada`

### Productos

`activo` (visible en la tienda) · `inactivo` (oculto) · eliminado (borrado lógico, conserva historial)

### Inventario (movimientos)

`entrada` · `salida` · `devolución` · `ajuste`

---

*Vuelve al [índice](00-Indice-Documentacion.md) · Anterior: [Manual Técnico](02-Manual-Tecnico.md) · Siguiente: [Plan Scrum](04-Plan-Scrum.md)*
