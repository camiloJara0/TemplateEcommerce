# Plantilla Ecommerce (Laravel 9 + Sanctum)

Template backend para tienda online, API REST en `/api/v1`, listo para conectar con
cualquier frontend (React, Vue, móvil, etc.).

## Requisitos

- PHP 8.1+
- Composer 2
- Base de datos MySQL/MariaDB

## Instalación

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configura en `.env`:

```
DB_CONNECTION=mysql
DB_DATABASE=template
DB_USERNAME=root
DB_PASSWORD=

# Proveedor de pagos (stripe | mercadopago | paypal | wompi)
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=

# Mail (por defecto array para no enviar correos reales)
MAIL_MAILER=array
```

Migra y siembra datos de demostración:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

La API queda en `http://localhost:8000/api`.

## Usuarios de demostración (seeder)

| Rol                 | Email                  | Contraseña |
|---------------------|------------------------|------------|
| Administrador       | admin@miTienda.com     | password   |
| Vendedor            | vendedor@miTienda.com  | password   |
| Operador logística  | logistica@miTienda.com | password   |
| Cliente             | cliente@correo.com     | password   |

## Configurar un negocio nuevo

1. **Tienda**: entra al panel admin y actualiza `/api/v1/admin/configuracion`
   (nombre, logo, moneda, impuestos, colores, SEO). Los cambios se reflejan al
   instante en cálculos de checkout y en `GET /api/v1/configuracion/publica`.
2. **Catálogo**: crea categorías, marcas, etiquetas y productos (con variantes,
   precios, descuentos, stock).
3. **Pagos**: configura las credenciales del proveedor en `.env`
   (`config/payments.php`) y el webhook `POST /api/v1/webhooks/pagos/{provider}`.
4. **Envíos**: define métodos de envío y proveedores (`config/shipping.php`).
5. **Promociones**: crea cupones (`%`, fijo o envío gratis) desde el panel.
6. **Reportes**: consulta ventas/inventario/clientes/productos y exporta a
   CSV/PDF/Excel desde `/api/v1/admin/reportes/*`.
7. **Integraciones (ERP)**: crea una integración desde el panel
   (`/admin/integraciones`) o `POST /api/v1/admin/integraciones`. Proveedores:
   - `erp_demo` — fixtures locales (`resources/fixtures/erp_demo/`), sin red.
   - `erp_prueba` — **ERP de prueba externo** (p. ej. `C:\Proyectos\PruebaAPI\ERP`
     en `http://127.0.0.1:8001`). Su URL y API key **no se piden en el panel**:
     vienen del backend vía `.env` (ver abajo).
   - Los reales (Odoo, Siigo…) se registran en `config/integrations.php`.
     Las credenciales de panel se cifran con `Crypt` y la API solo expone
     `configurado`.

   Configuración del ERP de prueba en `.env` del backend:

   ```
   ERP_PRUEBA_URL=http://127.0.0.1:8001
   ERP_PRUEBA_API_KEY=sk_prod_...
   # Opcionales (rutas por defecto):
   ERP_PRUEBA_RUTA_PRODUCTOS=/api/productsERP
   ERP_PRUEBA_RUTA_INVENTARIO=/api/inventarioERP
   ```

   El proveedor llama con header `X-API-KEY` a esos endpoints
   (`{success, data:[…]}`) y normaliza precios (`precios[].minorista`) e
   inventario (`product_id → producto_id`).

### Sincronización automática (integraciones)

El comando `integrations:sync` evalúa las integraciones activas vencidas
(frecuencia por integración, default 60 min) y sincroniza catálogo/inventario
con lock, idempotencia por hash y backoff + pausa tras errores:

```bash
php artisan integrations:sync                      # todas las vencidas
php artisan integrations:sync --integration=1      # una integración
php artisan integrations:sync --tipo=inicial       # lectura completa
```

Para que el cron del servidor lo ejecute cada minuto:

```bash
* * * * * cd /ruta/al/backend && php artisan schedule:run >> /dev/null 2>&1
```

(`Kernel::schedule` ya registra `integrations:sync` cada 15 minutos con
`withoutOverlapping`.)

## Roles y permisos

Se gestionan en `config/permissions.php` (sin tablas extra). Patrones: `*`
(todo), `productos.*` (todo el módulo), `pedidos.ver` (acción puntual).

| Permiso                  | admin | vendedor | operador logística |
|--------------------------|:-----:|:--------:|:------------------:|
| productos.*              |  ✓    |    ✓     |                    |
| inventario.*             |  ✓    |    ✓     |                    |
| pedidos.ver/gestionar    |  ✓    |    ✓     |         ✓          |
| envios.*                 |  ✓    |          |         ✓          |
| cupones.*                |  ✓    | cupones.ver |                 |
| reviews.moderar          |  ✓    |    ✓     |                    |
| reportes.ver             |  ✓    |          |                    |
| configuracion.*          |  ✓    |          |                    |
| pagos.gestionar          |  ✓    |          |                    |
| integraciones.*          |  ✓    |          |                    |

(admin tiene `*`, que cubre `integraciones.ver`, `integraciones.editar`,
`integraciones.sincronizar` e `integraciones.historial`).

## Estructura clave

- `routes/api.php` — todas las rutas (públicas, cliente, admin, webhooks).
- `app/Support/ApiResponse.php` — respuestas uniformes `{success, message, data}`.
- `app/Services/` — lógica de negocio (checkout, pagos, envíos, cupones, reviews,
  notificaciones, inventario, reportes).
- `app/Services/Payment/` y `app/Services/Shipping/` — adaptadores plug-and-play.
- `app/Models/Concerns/LogsActivity.php` — auditoría automática en todos los
  modelos de negocio (tabla `audit_logs`).
- `app/Support/helpers.php` — helpers `store_setting()`, `store_currency()`, etc.
- `database/seeders/` — `RoleSeeder`, `SettingsSeeder`, `DemoDataSeeder`.

## Documentación

- `API_DOCUMENTACION.md` — endpoints con payloads y valores aceptados
  (contexto para el frontend).
- `FLUJO_APP.md` — cómo funciona la app: administrador configura la tienda y el
  cliente compra desde una landing moderna.

## Tests

```bash
php artisan test
```

Suite completa (98 tests): autenticación, catálogo, carrito, checkout, pagos,
envíos, cupones, reviews, wishlist, notificaciones, inventario, dashboard,
reportes, configuración, auditoría e integraciones ERP (CRUD, credenciales,
sincronización e idempotencia).