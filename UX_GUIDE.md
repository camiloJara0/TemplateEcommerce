# Guía UX/UI — CommerceOS

Referencia para diseñar pantallas nuevas con la misma calidad que Apple, Stripe, Linear y Shopify Polaris.

## 1. Principios

1. **Claridad sobre ornamentación** — cada elemento debe tener un propósito.
2. **Reconocimiento sobre recuerdo** — iconos + labels; estados visibles.
3. **Feedback inmediato** — loaders, toasts, skeletons (nunca pantallas mudas).
4. **Prevención de errores** — confirmaciones en acciones destructivas; validación inline.
5. **Consistencia** — mismos radios, sombras, tipografía y patrones de CTA.
6. **Conversión** — un CTA primario por vista; fricción mínima en checkout.

## 2. Jerarquía visual

| Nivel | Uso | Estilo |
|-------|-----|--------|
| Display | Hero | `text-4xl–6xl font-semibold tracking-tight` |
| Título página | Headers | `.page-title` |
| Subtítulo | Contexto | `.page-subtitle` |
| Cuerpo | Contenido | `text-sm/base text-slate-600` |
| Meta | Fechas, hints | `text-xs text-slate-400` |

## 3. Color y contraste

- **Primary (`brand`)**: CTAs, links activos, focus.
- **Neutral (`slate`)**: texto, bordes, superficies.
- **Estados**: success / warning / error / info solo para semántica.
- Contraste mínimo WCAG AA (4.5:1 texto normal).
- Dark mode: fondos `slate-950/900`, bordes sutiles, no grises “apagados” ilegibles.

## 4. Espaciado y layout

- Contenedor: `.page-container` (max 80rem).
- Secciones: `.section-padding`.
- Cards: padding `p-5 sm:p-6`, gap `gap-4 sm:gap-6`.
- Grid productos: 2 → 3 → 4 columnas.
- Admin content: `.admin-content`.

## 5. Componentes — cuándo usarlos

| Necesidad | Componente |
|-----------|------------|
| KPI | `DashboardStatCard` |
| Bloque con título | `DashboardMetricsCard` |
| Tabla | `DashboardDataTable` |
| Sin datos | `FeedbackEmptyState` |
| Error de carga | `FeedbackErrorState` |
| Carga | `FeedbackSkeletonLoader` (preferir skeleton a spinner) |
| Producto | `EcommerceProductCard` / `ProductGrid` |
| Carrito rápido | `EcommerceCartDrawer` |
| Form field | `UiBaseInput` / `UiBaseSelect` / `UiBaseTextarea` |

## 6. Microinteracciones

- Duración: **150–300 ms**, easing `ease-out` (tokens CSS).
- Hover cards: `.hover-lift` (−4px + sombra).
- Focus: anillo `brand-500` visible (teclado).
- Botones disabled: opacity 50% + `pointer-events-none`.
- Toasts para éxito/error de mutaciones.
- Confirmación (`UModal`) antes de eliminar / reembolsar / cancelar pedido.

## 7. Formularios

1. Labels siempre visibles (no solo placeholder).
2. Error debajo del campo, texto concreto.
3. `required` marcado; no bloquear pegar en password.
4. Submit con estado `loading` en el botón primario.
5. Una columna en mobile; máximo dos en desktop para formularios largos.

## 8. Tablas admin

- Header sticky opcional en listados largos.
- Acciones a la derecha (icon buttons + dropdown “más”).
- Filtros arriba: búsqueda + chips de estado + rango de fechas.
- Paginación al pie; exportar CSV/PDF como acción secundaria.
- Filas clickeables hacia el detalle cuando aplique.

## 9. Ecommerce — conversión

- **Home**: hero con un solo CTA primario + prueba social.
- **Catálogo**: filtros visibles en desktop; sheet en mobile; conteo de resultados.
- **Ficha**: precio efectivo grande; CTA “Agregar” sticky en mobile.
- **Carrito**: costos transparentes (subtotal → descuento → envío → tax → total).
- **Checkout**: pasos claros; guest checkout si el backend lo permite.

## 10. Accesibilidad checklist

- [ ] Contraste AA en texto e iconos informativos  
- [ ] Navegación completa por teclado  
- [ ] `aria-label` en icon-only buttons  
- [ ] Skip link al contenido (layout client)  
- [ ] Imágenes con `alt` descriptivo  
- [ ] No transmitir información solo con color  
- [ ] `prefers-reduced-motion` respetado  

## 11. Responsive breakpoints

| Token | Ancho | Enfoque |
|-------|-------|---------|
| default | 0+ | Mobile first |
| sm | 640 | Controles más holgados |
| md | 768 | 2 columnas contenido |
| lg | 1024 | Sidebar admin + filtros catálogo |
| xl | 1280 | Grids amplios |
| 3xl+ | 1920+ | Ultra-wide (tokens listos) |

## 12. Patrones de página nueva

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' }) // o 'client' | 'auth'
useSeoMeta({ title: 'Nombre pantalla' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Título</h1>
        <p class="page-subtitle">Contexto breve</p>
      </div>
      <UButton color="primary" label="Acción primaria" />
    </div>
    <!-- contenido con surface / MetricsCard / grids -->
  </div>
</template>
```

## 13. Anti-patrones

- Múltiples CTAs solid del mismo peso en un viewport.
- Spinners a pantalla completa cuando un skeleton basta.
- Modales anidados.
- Texto gris claro sobre fondo gris (fallo de contraste).
- Animaciones > 300 ms o bounce excesivo.
- Hardcodear colores hex en componentes (usar tokens / utilidades).
