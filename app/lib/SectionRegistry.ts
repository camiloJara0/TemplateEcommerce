import type { SectionKey, SectionDefinition } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

// ─── Section Definitions ─────────────────────────────────────────────────────

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    type: '_header',
    label: 'Header',
    icon: 'i-lucide-panel-top',
    category: 'layout',
    isSpecial: true,
    variants: [
      { key: 'animation', label: 'Animación', description: 'Header con animaciones de entrada', icon: 'i-lucide-sparkles' },
      { key: 'video', label: 'Video', description: 'Fondo con video a pantalla completa', icon: 'i-lucide-play-circle' },
    ],
    defaultConfig: {},
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'i-lucide-layout-template',
    category: 'hero',
    variants: [
      { key: 'classic', label: 'Clásico', description: 'Texto a la izquierda, estadísticas a la derecha', icon: 'i-lucide-columns-2' },
      { key: 'centered', label: 'Centrado', description: 'Texto centrado con fondo completo', icon: 'i-lucide-align-center' },
      { key: 'split', label: 'Dividido', description: 'Texto a la izquierda, imagen grande a la derecha', icon: 'i-lucide-panel-right' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.hero,
  },
  {
    type: 'benefits',
    label: 'Beneficios',
    icon: 'i-lucide-badge-check',
    category: 'content',
    variants: [
      { key: 'icons', label: 'Íconos', description: 'Tarjetas compactas con ícono y texto', icon: 'i-lucide-badge-check' },
      { key: 'steps', label: 'Pasos', description: 'Pasos numerados con línea conectora', icon: 'i-lucide-list-ordered' },
      { key: 'cards', label: 'Tarjetas', description: 'Tarjetas elevadas con efectos hover', icon: 'i-lucide-square-stack' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.benefits,
  },
  {
    type: 'categories',
    label: 'Categorías',
    icon: 'i-lucide-layers',
    category: 'layout',
    variants: [
      { key: 'grid', label: 'Cuadrícula', description: 'Tarjetas en cuadrícula responsiva', icon: 'i-lucide-layout-grid' },
      { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal', icon: 'i-lucide-gallery-horizontal' },
      { key: 'pills', label: 'Píldoras', description: 'Botones horizontales con ícono', icon: 'i-lucide-pill' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.categories,
  },
  {
    type: '_categories_home',
    label: 'Categorías Home',
    icon: 'i-lucide-layout-grid',
    category: 'layout',
    isSpecial: true,
    variants: [
      { key: 'grid', label: 'Cuadrícula', description: 'Tarjetas en cuadrícula responsiva', icon: 'i-lucide-layout-grid' },
      { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal', icon: 'i-lucide-gallery-horizontal' },
      { key: 'pills', label: 'Píldoras', description: 'Botones horizontales con ícono', icon: 'i-lucide-pill' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.categories_home,
  },
  {
    type: 'featured',
    label: 'Destacados',
    icon: 'i-lucide-star',
    category: 'content',
    variants: [
      { key: 'grid', label: 'Cuadrícula', description: 'Grid de productos destacados', icon: 'i-lucide-layout-grid' },
      { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal de productos', icon: 'i-lucide-gallery-horizontal' },
      { key: 'large-cards', label: 'Tarjetas grandes', description: 'Pocas tarjetas grandes con imagen', icon: 'i-lucide-maximize-2' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.featured,
  },
  {
    type: 'deals',
    label: 'Ofertas',
    icon: 'i-lucide-tag',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Banner de ofertas con productos', icon: 'i-lucide-tag' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.deals,
  },
  {
    type: 'testimonials',
    label: 'Testimonios',
    icon: 'i-lucide-message-square-quote',
    category: 'social',
    variants: [
      { key: 'cards', label: 'Tarjetas', description: 'Grid de tarjetas con estrellas', icon: 'i-lucide-square' },
      { key: 'spotlight', label: 'Destacado', description: 'Un testimonio grande con navegación', icon: 'i-lucide-quote' },
      { key: 'masonry', label: 'Masonry', description: 'Grid asimétrico tipo Pinterest', icon: 'i-lucide-layout-dashboard' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.testimonials,
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: 'i-lucide-mail',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Formulario de suscripción', icon: 'i-lucide-mail' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.newsletter,
  },
  {
    type: 'brand_logos',
    label: 'Marcas',
    icon: 'i-lucide-heart',
    category: 'social',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Logos de marcas en fila', icon: 'i-lucide-heart' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.brand_logos,
  },
  {
    type: 'gallery_feed',
    label: 'Galería',
    icon: 'i-lucide-instagram',
    category: 'media',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Grid de imágenes tipo Instagram', icon: 'i-lucide-instagram' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.gallery_feed,
  },
  {
    type: 'stats',
    label: 'Estadísticas',
    icon: 'i-lucide-bar-chart-3',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Números con íconos', icon: 'i-lucide-bar-chart-3' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.stats,
  },
  {
    type: 'video',
    label: 'Video',
    icon: 'i-lucide-play-circle',
    category: 'media',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Video con thumbnail y play button', icon: 'i-lucide-play-circle' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.video,
  },
  {
    type: 'map',
    label: 'Mapa',
    icon: 'i-lucide-map-pin',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Mapa con información de contacto', icon: 'i-lucide-map-pin' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.map,
  },
  {
    type: 'richtext',
    label: 'Texto enriquecido',
    icon: 'i-lucide-file-text',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Bloque de texto con imagen opcional', icon: 'i-lucide-file-text' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.richtext,
  },
  {
    type: 'cta',
    label: 'CTA Final',
    icon: 'i-lucide-megaphone',
    category: 'conversion',
    variants: [
      { key: 'banner', label: 'Banner', description: 'Centrado con fondo decorativo', icon: 'i-lucide-megaphone' },
      { key: 'split', label: 'Dividido', description: 'Dos columnas con imagen', icon: 'i-lucide-columns-2' },
      { key: 'gradient', label: 'Gradiente', description: 'Fondo gradiente con efectos', icon: 'i-lucide-sun' },
    ],
    defaultConfig: DEFAULT_TIENDA_CONFIG.secciones.cta,
  },
  {
    type: 'urgency_banner',
    label: 'Banner Urgencia',
    icon: 'i-lucide-alert-triangle',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Banner horizontal con efecto shimmer', icon: 'i-lucide-alert-triangle' },
    ],
    defaultConfig: {},
  },
  {
    type: 'countdown_offer',
    label: 'Oferta Countdown',
    icon: 'i-lucide-timer',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Countdown de oferta en vivo', icon: 'i-lucide-timer' },
    ],
    defaultConfig: {},
  },
  {
    type: 'stock_counter',
    label: 'Contador Stock',
    icon: 'i-lucide-package',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Contador de stock con estilos variantes', icon: 'i-lucide-package' },
    ],
    defaultConfig: {},
  },
  {
    type: 'sticky_add_to_cart',
    label: 'Carrito Fijo',
    icon: 'i-lucide-shopping-cart',
    category: 'conversion',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Barra fija inferior para agregar al carrito', icon: 'i-lucide-shopping-cart' },
    ],
    defaultConfig: {},
  },
  {
    type: 'faq',
    label: 'Preguntas Frecuentes',
    icon: 'i-lucide-help-circle',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Acordeón de preguntas frecuentes', icon: 'i-lucide-help-circle' },
    ],
    defaultConfig: {},
  },
  {
    type: 'timeline',
    label: 'Línea de Tiempo',
    icon: 'i-lucide-git-branch',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Línea de tiempo vertical alternada', icon: 'i-lucide-git-branch' },
    ],
    defaultConfig: {},
  },
  {
    type: 'blog_grid',
    label: 'Blog Grid',
    icon: 'i-lucide-layout-grid',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Grid de blog estilo revista', icon: 'i-lucide-layout-grid' },
    ],
    defaultConfig: {},
  },
  {
    type: 'article_featured',
    label: 'Artículos Destacados',
    icon: 'i-lucide-newspaper',
    category: 'content',
    variants: [
      { key: 'default', label: 'Estándar', description: 'Artículos destacados tipo prensa', icon: 'i-lucide-newspaper' },
    ],
    defaultConfig: {},
  },
]

// ─── Registry Functions ──────────────────────────────────────────────────────

const definitionsMap = new Map(SECTION_DEFINITIONS.map(d => [d.type, d]))

export function getSectionDefinition(type: SectionKey): SectionDefinition | undefined {
  return definitionsMap.get(type)
}

export function getAvailableSectionTypes(): SectionDefinition[] {
  return SECTION_DEFINITIONS
}

export function getSectionTypesByCategory(category: string): SectionDefinition[] {
  return SECTION_DEFINITIONS.filter(d => d.category === category)
}

export function getDefaultConfigForSection(type: SectionKey): Record<string, any> {
  const def = definitionsMap.get(type)
  return def?.defaultConfig ? { ...def.defaultConfig } : {}
}
