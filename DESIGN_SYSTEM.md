# Design System — CommerceOS

## Fuente de verdad

| Qué | Dónde |
|-----|--------|
| Tokens (color, radius, shadow, motion, type) | `app/assets/css/main.css` |
| Overrides Nuxt UI | `app/app.config.ts` |
| Guía de uso UX | `UX_GUIDE.md` |

## Tokens principales

### Marca
- `--color-brand-50` … `--color-brand-950` — primario (indigo Linear)
- `--color-accent-50` … `--color-accent-950` — acentos / highlights
- `--color-secondary-*` — slate de apoyo

### Semántica
- success · warning · error · info (escalas parciales + mapeo en `app.config` a emerald/amber/rose/sky)

### Superficie y elevación
- `--shadow-soft` — cards en reposo  
- `--shadow-lifted` — hover / dropdowns  
- `--shadow-glow` — CTA primario  
- Radios: `xs` 4px → `2xl` 24px · `pill`

### Motion
- Fast 150ms · Base 200ms · Slow 300ms
- Easing: `--ease-out`, `--ease-in-out`, `--ease-spring`

### Z-index
dropdown 50 · sticky 40 · modal 50 · toast 70 · tooltip 80

## Utilidades CSS

| Clase | Uso |
|-------|-----|
| `.glass` / `.glass-strong` | Navbars, overlays sutiles |
| `.surface` | Card base |
| `.surface-interactive` | Card clickeable con lift |
| `.page-container` | Ancho máximo + padding |
| `.section-padding` | Ritmo vertical marketing |
| `.text-gradient` | Títulos hero |
| `.hover-lift` | Microinteracción hover |
| `.cta-glow` | Énfasis en CTA principal |
| `.page-title` / `.page-subtitle` | Headers de página |
| `.admin-content` | Padding del panel |
| `.animate-fade-up` etc. | Entradas suaves |

## Tema Nuxt UI

```ts
// app.config.ts (resumen)
ui: {
  colors: {
    primary: 'brand',
    neutral: 'slate',
    success: 'emerald',
    // …
  },
  button: { /* rounded-xl, focus ring brand */ },
  card: { /* rounded-2xl, shadow-soft */ },
  // input, modal, table, tabs, badge, …
}
```

## Modo oscuro

- Preferencias: `light` | `dark` | `system` (`useThemeMode`)
- Persistido por `@nuxtjs/color-mode` (incluido en Nuxt UI)
- Toggle: `NavigationThemeToggle`

## Rebranding en 3 pasos

1. Sustituir escala `--color-brand-*` (y opcionalmente accent).
2. Ajustar `app.name` / `app.tagline` en `app.config.ts`.
3. Si la API envía `color_primario`, mapearlo a CSS variables en runtime (composable futuro `useStoreTheme`).

## Tipografía

- UI: Inter (cargada en `app.vue`)
- Features: `cv02`, `cv03`, `cv04`, `cv11`
- Números tabulares en precios y KPIs (`tabular-nums`)
