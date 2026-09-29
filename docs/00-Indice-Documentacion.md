# CommerceOS — Documentación del Sistema

**Plataforma de comercio electrónico tipo Shopify · Plantilla SaaS reutilizable**

| Campo | Valor |
|---|---|
| Proyecto | CommerceOS (`template_front` + `template_back`) |
| Versión del documento | 1.0 |
| Fecha de elaboración | 24/09/2026 |
| Estado actual | MVP funcional en evolución (ver §Estado) |
| Alcance | Documentación funcional, técnica, de usuario, planificación y roadmap |

---

## Índice de documentos

| # | Documento | Audiencia | Contenido |
|---|---|---|---|
| 0 | **[Este índice](00-Indice-Documentacion.md)** | Todos | Mapa de navegación, fuentes, convenciones |
| 1 | **[SRS — Requerimientos del Software](01-SRS-Requerimientos.md)** | PM, Arquitecto, QA | Requerimientos funcionales (53 RF) y no funcionales (18 RNF) con estado de implementación |
| 2 | **[Manual Técnico](02-Manual-Tecnico.md)** | Desarrolladores, DevOps | Arquitectura, estructura de código, base de datos, API (110 endpoints), DevOps, seguridad |
| 3 | **[Manual de Usuario](03-Manual-Usuario.md)** | Super Admin, Admin de tienda, Cliente | Procedimientos paso a paso, campos, validaciones, troubleshooting |
| 4 | **[Plan Scrum](04-Plan-Scrum.md)** | Equipo ágil, Trello | Historias de usuario, tareas técnicas, casos de prueba, estado ✅🟡🔴 |
| 5 | **[Roadmap Estratégico](05-Roadmap-Estrategico.md)** | Dirección, Product Owner | 4 fases: MVP → Crecimiento → SaaS → Ecosistema |

---

## 1. Fuentes de información

Todo lo documentado fue verificado contra el código fuente, no contra supuestos:

| Fuente | Ubicación | Uso |
|---|---|---|
| Requerimientos originales | `Documentacion.md` | Alcance deseado (productos, tienda, pagos, envíos, config, pedidos, reportes, perfil) |
| Contrato API previo | `API_DOCUMENTACION.md` | Referencia (contiene endpoints no existentes → ver §Discrepancias) |
| Arquitectura previa | `ARCHITECTURE.md`, `UX_GUIDE.md`, `DESIGN_SYSTEM.md` | Convenciones de frontend |
| Secciones del constructor | `docs/SECTIONS.md` | Catálogo de 45 secciones |
| Flujos | `FLUJO_APP.md` | Roles, flujo admin, flujo cliente |
| Planes previos | `microservicios_plan.md`, `plan_migracion_detallado.md`, `PAYU_IMPLEMENTATION_PLAN.md` | Roadmap de fases 3–4 |
| **Código backend** | `template_back/` (Laravel 9, 23 migraciones, 117 rutas) | Fuente de verdad de API y BD |
| **Código frontend** | `template_front/` (Nuxt 4, 191 componentes `.vue`, 19 stores) | Fuente de verdad de UI |
| **Esquema real de BD** | `information_schema` de MariaDB (37 tablas) | Fuente de verdad de datos |
| **Suite de pruebas** | `php artisan test` → **70 pasan / 8 fallan** | Estado de calidad |

---

## 2. Convenciones de estado

### Requerimientos funcionales

| Estado | Significado |
|---|---|
| ✅ **Implementado** | Funciona de extremo a extremo (API + UI + persistencia) y está cubierto por pruebas |
| 🟡 **Parcial** | Existe la funcionalidad base pero le faltan casos de uso, validaciones o cobertura de UI |
| 🔴 **Pendiente** | No existe en el código |

### Tareas (Plan Scrum)

| Marcador | Significado |
|---|---|
| ✅ | Completada y verificada |
| 🟡 | Parcialmente implementada |
| 🔴 | Pendiente |

### Prioridad

**Alta** → bloquea el lanzamiento o el flujo de compra · **Media** → valor de adopción/operación · **Baja** → diferenciador o refinamiento.

---

## 3. Estado global del proyecto (resumen ejecutivo)

### Lo que ya funciona

- **Storefront completo**: home con constructor de secciones, catálogo con filtros, ficha de producto con variantes y reseñas, carrito (invitado y logueado), checkout en 3 pasos, pago con 6 pasarelas configurables, seguimiento de envío, cuenta de usuario.
- **Panel administrativo**: 18 pantallas — dashboard, productos (CRUD con variantes/imágenes/etiquetas), categorías, marcas, etiquetas, atributos de variante, inventario, pedidos, pagos, envíos, cupones, reseñas, usuarios, reportes + export, configuración, editor de tienda, plantillas.
- **Constructor visual**: 24 secciones de home + 14 de producto + 7 de nosotros + estilos globales/navbar/footer, con 16 plantillas predefinidas, undo/redo y previsualización en vivo.
- **API REST**: 110 endpoints bajo `/api/v1` con autenticación Sanctum, permisos por rol y respuestas uniformes.
- **Base de datos**: 37 tablas, 44 claves foráneas, auditoría automática.
- **Offline-first**: outbox con sincronización en background, IndexedDB, Web Push.

### Deuda técnica crítica (detalle en SRS §GAP y Manual Técnico §8)

1. **`.env copy` con secretos reales commiteado en git** (APP_KEY, DB_PASSWORD, MAIL_PASSWORD, VAPID_PRIVATE_KEY).
2. `GET /admin/productos` y `GET /admin/usuarios` **sin middleware de permiso** (cualquier usuario autenticado).
3. Rutas de carrito **sin autenticación** (solo throttle).
4. Dashboard admin con datos fabricados (`Math.random()`), ignora el servicio real.
5. 8 tests fallando (carrito `id` vs `product_id`, `Order::shipments()` inexistente).
6. CORS con `allowed_origins: *`.
7. Sin CI de backend; CI de frontend sin `build` ni tests.
8. Dos editores de tienda duplicados (`/admin/tienda` y `/admin/preview`).

---

## 4. Ecosistema de documentos existentes

| Documento | Tamaño | Observación |
|---|---|---|
| `Documentacion.md` | 7 KB | Requerimientos manuscritos. **Fuente primaria del alcance.** |
| `API_DOCUMENTACION.md` | 10 KB | Contrato parcialmente desincronizado con `routes/api.php` |
| `docs/SECTIONS.md` | 41 KB | Referencia exhaustiva de las secciones del constructor |
| `microservicios_plan.md` | 102 KB | Arquitectura objetivo (9 bounded contexts, API Gateway, multi-tenant) |
| `plan_migracion_detallado.md` | 43 KB | Fases de migración a microservicios |
| `PAYU_IMPLEMENTATION_PLAN.md` | 22 KB | Integración PayU (provider no conectado aún) |
| `README.md` | 2 KB | ⚠️ Es el starter stock de Nuxt UI, no documenta este proyecto |

---

## 5. Entornos y comandos

| Propósito | Frontend | Backend |
|---|---|---|
| Instalar | `pnpm install` | `composer install` |
| Desarrollo | `pnpm run dev` | `php artisan serve` |
| Verificar | `pnpm run lint` · `pnpm run typecheck` | `php -l` · `php artisan test` |
| Construir | `pnpm run build` | — |
| Base de datos | — | MySQL/MariaDB · `php artisan migrate --seed` |

> La API se declara en `nuxt.config.ts → runtimeConfig.public.apiBase` pero `app/composables/Api.ts` la tiene **hardcodeada** en `http://localhost:8000/api/v1`. Ver Manual Técnico §7.
