# Arquitectura del frontend — CommerceOS

Plantilla ecommerce modular (Nuxt 4 + Nuxt UI 4 + Pinia + TypeScript).

## Principios

- **Atomic Design**: átomos (`ui/`), moléculas (`feedback/`, `ecommerce/`), organismos (`navigation/`, `dashboard/`), templates (`layouts/`), páginas (`pages/`).
- **Clean Architecture**: UI no conoce detalles de red; los **services** encapsulan HTTP; los **types** modelan el dominio.
- **SOLID**: componentes con una responsabilidad; composables reutilizables; extensible por tokens sin tocar vistas.
- **Mobile-first + accesible (WCAG AA)**.

## Estructura

```
app/
├── assets/css/main.css      # Design tokens + utilidades globales
├── app.config.ts            # Tema Nuxt UI (botones, cards, etc.)
├── app.vue                  # Root + SEO + color mode
├── components/
│   ├── ui/                  # Base* (Input, Select, Button, Textarea)
│   ├── feedback/            # Empty, Error, Success, Skeleton, Loading
│   ├── navigation/          # Navbar, Sidebar, MobileMenu, ThemeToggle
│   ├── ecommerce/           # ProductCard, Grid, CartDrawer, SearchBar…
│   └── dashboard/           # StatCard, Charts, Tables, ActivityFeed
├── composables/
│   ├── Api.ts               # Cliente HTTP + auth + toasts
│   ├── useFormat.ts         # Moneda, fechas, descuentos
│   ├── useThemeMode.ts      # light | dark | system
│   ├── useCartDrawer.ts     # Estado del drawer carrito
│   ├── useMockData.ts       # Datos demo (sustituir por API)
│   └── services/            # Capa de API por dominio
├── layouts/
│   ├── default.vue
│   ├── client.vue           # Storefront (navbar + footer + cart)
│   ├── admin.vue            # Panel (sidebar + topbar)
│   └── auth.vue             # Login / registro
├── pages/
│   ├── index.vue            # Home cliente
│   ├── catalogo/            # Catálogo con filtros
│   ├── admin/               # Dashboard admin
│   └── auth/                # Login
├── types/                   # Contratos de dominio
└── utils/                   # Helpers puros (orderStatus, etc.)
```

## Capas

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| Pages | Orquestación de vista, SEO, layout | `pages/admin/index.vue` |
| Layouts | Shell estructural | `layouts/client.vue` |
| Components | UI reutilizable sin side-effects de red | `ProductCard` |
| Composables | Estado/lógica compartida | `useFormat`, `useCartDrawer` |
| Services | Llamadas API tipadas | `catalogoService` |
| Types | Contratos | `Product`, `Order` |

## Design System

1. **Tokens** → `app/assets/css/main.css` (`@theme`)
2. **Componentes Nuxt UI** → `app/app.config.ts`
3. **Utilidades** → clases `.glass`, `.surface`, `.page-container`, animaciones

Rebranding: cambiar escala `--color-brand-*` y `ui.colors.primary` en `app.config.ts`.

## Rutas clave

| Ruta | Layout | Descripción |
|------|--------|-------------|
| `/` | client | Home ecommerce |
| `/catalogo` | client | Listado + filtros |
| `/admin` | admin | Dashboard KPIs |
| `/auth/login` | auth | Acceso |

## Datos

- Servicios listos en `composables/services/*` contra `http://localhost:8000/api/v1`.
- Vistas iniciales usan `useMockData()` para UI sin backend.
- Sustituir mocks por `await catalogoService.listarProductos()` / `adminDashboardService.resumen()`.

## Convenciones

- TypeScript estricto en props y services.
- Sin comentarios decorativos en código.
- Iconos: Iconify Lucide (`i-lucide-*`).
- Transiciones 150–300ms; respetar `prefers-reduced-motion`.
- Nombres de componentes por carpeta Nuxt: `EcommerceProductCard`, `DashboardStatCard`.

## Escalabilidad

- Nuevas pantallas admin: página en `pages/admin/*` + reutilizar `DashboardMetricsCard` / `DataTable`.
- Nuevos módulos API: service + types + página; no mezclar fetch en templates.
- Features store-wide (carrito, auth): Pinia store cuando el estado cruce layouts.
