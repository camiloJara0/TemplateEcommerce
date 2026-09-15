import type {
  TiendaConfig, HeroSection, BenefitsSection, CategoriesSection,
  FeaturedSection, TestimonialsSection, CtaSection, HeaderSection,
  CategoriesHomeSection, SectionVariantMeta,
  HeroVariant, CategoriesHomeVariant, BenefitsVariant,
  TestimonialsVariant, FeaturedVariant, CtaVariant, HeaderVariant,
} from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'
import { shallowRef, type Component } from 'vue'

// ─── Variant Definitions ─────────────────────────────────────────────────────

export const HERO_VARIANTS: SectionVariantMeta[] = [
  { key: 'classic', label: 'Clásico', description: 'Dos columnas: texto a la izquierda, estadísticas a la derecha', thumbnail: 'i-lucide-columns-2' },
  { key: 'centered', label: 'Centrado', description: 'Texto centrado con fondo a pantalla completa', thumbnail: 'i-lucide-align-center' },
  { key: 'split', label: 'Dividido', description: 'Texto a la izquierda, imagen grande a la derecha', thumbnail: 'i-lucide-panel-right' },
  { key: 'video', label: 'Video', description: 'Fondo con video a pantalla completa con overlay oscuro', thumbnail: 'i-lucide-play-circle' },
  { key: 'slider', label: 'Slider', description: 'Carrusel automático de slides con transiciones', thumbnail: 'i-lucide-images' },
  { key: 'countdown', label: 'Countdown', description: 'Hero con temporizador de cuenta regresiva en vivo', thumbnail: 'i-lucide-timer' },
  { key: 'parallax', label: 'Parallax', description: 'Efecto parallax con elementos flotantes decorativos', thumbnail: 'i-lucide-mountain-snow' },
]

export const CATEGORIES_VARIANTS: SectionVariantMeta[] = [
  { key: 'grid', label: 'Cuadrícula', description: 'Tarjetas de categorías en cuadrícula responsiva', thumbnail: 'i-lucide-layout-grid' },
  { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal con peek de siguientes categorías', thumbnail: 'i-lucide-gallery-horizontal' },
  { key: 'pills', label: 'Píldoras', description: 'Botones horizontales con ícono y texto', thumbnail: 'i-lucide-pill' },
]

export const BENEFITS_VARIANTS: SectionVariantMeta[] = [
  { key: 'icons', label: 'Íconos', description: 'Tarjetas compactas con ícono y texto', thumbnail: 'i-lucide-badge-check' },
  { key: 'steps', label: 'Pasos', description: 'Pasos numerados con línea conectora', thumbnail: 'i-lucide-list-ordered' },
  { key: 'cards', label: 'Tarjetas', description: 'Tarjetas elevadas con sombras y efectos hover', thumbnail: 'i-lucide-square-stack' },
]

export const TESTIMONIALS_VARIANTS: SectionVariantMeta[] = [
  { key: 'cards', label: 'Tarjetas', description: 'Grid de tarjetas con avatar, estrellas y texto', thumbnail: 'i-lucide-square' },
  { key: 'spotlight', label: 'Destacado', description: 'Un testimonio grande con navegación', thumbnail: 'i-lucide-quote' },
  { key: 'masonry', label: 'Masonry', description: 'Grid asimétrico tipo Pinterest', thumbnail: 'i-lucide-layout-dashboard' },
]

export const FEATURED_VARIANTS: SectionVariantMeta[] = [
  { key: 'grid', label: 'Cuadrícula', description: 'Grid de productos destacados', thumbnail: 'i-lucide-layout-grid' },
  { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal de productos destacados', thumbnail: 'i-lucide-gallery-horizontal' },
  { key: 'large-cards', label: 'Tarjetas grandes', description: 'Pocas tarjetas grandes con imagen y precio', thumbnail: 'i-lucide-maximize-2' },
]

export const CTA_VARIANTS: SectionVariantMeta[] = [
  { key: 'banner', label: 'Banner', description: 'Centrado con fondo decorativo', thumbnail: 'i-lucide-megaphone' },
  { key: 'split', label: 'Dividido', description: 'Dos columnas con imagen a un lado', thumbnail: 'i-lucide-columns-2' },
  { key: 'gradient', label: 'Gradiente', description: 'Fondo gradiente con efectos de luz', thumbnail: 'i-lucide-sun' },
]

export const HEADER_VARIANTS: SectionVariantMeta[] = [
  { key: 'animation', label: 'Animación', description: 'Header con animaciones de entrada', thumbnail: 'i-lucide-sparkles' },
  { key: 'video', label: 'Video', description: 'Fondo con video o imagen a pantalla completa', thumbnail: 'i-lucide-play-circle' },
]

export const URGENCY_BANNER_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Banner de urgencia horizontal con efecto shimmer', thumbnail: 'i-lucide-alert-triangle' },
]

export const COUNTDOWN_OFFER_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Countdown de oferta con countdown en vivo', thumbnail: 'i-lucide-timer' },
]

export const STOCK_COUNTER_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Contador de stock con estilos variantes', thumbnail: 'i-lucide-package' },
]

export const STICKY_ADD_TO_CART_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Barra fija inferior para agregar al carrito', thumbnail: 'i-lucide-shopping-cart' },
]

export const FAQ_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Acordeón de preguntas frecuentes con animación', thumbnail: 'i-lucide-help-circle' },
]

export const TIMELINE_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Línea de tiempo vertical alternada', thumbnail: 'i-lucide-git-branch' },
]

export const BLOG_GRID_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Grid de blog estilo revista', thumbnail: 'i-lucide-layout-grid' },
]

export const ARTICLE_FEATURED_VARIANTS: SectionVariantMeta[] = [
  { key: 'default', label: 'Estándar', description: 'Artículos destacados tipo prensa', thumbnail: 'i-lucide-newspaper' },
]

// ─── Variant Maps ────────────────────────────────────────────────────────────

export const VARIANT_MAP = {
  hero: HERO_VARIANTS,
  categories: CATEGORIES_VARIANTS,
  _categories_home: CATEGORIES_VARIANTS,
  benefits: BENEFITS_VARIANTS,
  testimonials: TESTIMONIALS_VARIANTS,
  featured: FEATURED_VARIANTS,
  cta: CTA_VARIANTS,
  _header: HEADER_VARIANTS,
  urgency_banner: URGENCY_BANNER_VARIANTS,
  countdown_offer: COUNTDOWN_OFFER_VARIANTS,
  stock_counter: STOCK_COUNTER_VARIANTS,
  sticky_add_to_cart: STICKY_ADD_TO_CART_VARIANTS,
  faq: FAQ_VARIANTS,
  timeline: TIMELINE_VARIANTS,
  blog_grid: BLOG_GRID_VARIANTS,
  article_featured: ARTICLE_FEATURED_VARIANTS,
} as const

export type SectionType = keyof typeof VARIANT_MAP

// ─── Config Preservation Rules ───────────────────────────────────────────────

const COMMON_FIELDS: Record<SectionType, string[]> = {
  hero: ['badge', 'headline', 'subtext', 'cta_primary', 'cta_secondary', 'background_image', 'show_stats', 'stats'],
  benefits: ['title', 'subtitle', 'items'],
  categories: ['title', 'subtitle', 'show_all_link'],
  _categories_home: ['show', 'title', 'subtitle', 'layout', 'card_height', 'items'],
  featured: ['title', 'subtitle', 'show_all_link'],
  testimonials: ['title', 'subtitle', 'items'],
  cta: ['headline', 'subtext', 'cta_primary', 'cta_secondary'],
  _header: ['show', 'background_image', 'headline', 'subtext', 'cta_primary', 'cta_secondary', 'overlay_color', 'overlay_opacity', 'text_align', 'height'],
  urgency_banner: ['headline', 'subtext', 'cta_label', 'cta_url', 'bg_color', 'text_color', 'show_close'],
  countdown_offer: ['headline', 'subtext', 'offer_end_date', 'cta_label', 'cta_url', 'bg_color', 'show_progress', 'stock_total', 'stock_sold'],
  stock_counter: ['headline', 'subtext', 'stock_total', 'stock_sold', 'low_stock_threshold', 'style'],
  sticky_add_to_cart: ['show', 'product_name', 'price', 'original_price', 'cta_label', 'show_discount_badge'],
  faq: ['title', 'subtitle', 'items'],
  timeline: ['title', 'subtitle', 'items'],
  blog_grid: ['title', 'subtitle', 'posts'],
  article_featured: ['title', 'subtitle', 'articles'],
}

// ─── PageBuilder Class ───────────────────────────────────────────────────────

export class PageBuilder {
  private config: TiendaConfig

  constructor(initialConfig?: TiendaConfig) {
    this.config = initialConfig ?? structuredClone(DEFAULT_TIENDA_CONFIG)
  }

  getSections(): TiendaConfig['secciones'] {
    return this.config.secciones
  }

  getHeader(): HeaderSection {
    return this.config.header
  }

  getCategoriesHome(): CategoriesHomeSection {
    return this.config.categories_home
  }

  getFullConfig(): TiendaConfig {
    return this.config
  }

  getVariant<K extends SectionType>(section: K): string {
    if (section === '_header') return (this.config.header as any).variant ?? 'animation'
    if (section === '_categories_home') return (this.config.categories_home as any).variant ?? 'grid'
    return (this.config.secciones as any)[section]?.variant ?? 'default'
  }

  getVariantsFor(section: SectionType): SectionVariantMeta[] {
    return VARIANT_MAP[section] ?? []
  }

  setVariant(section: SectionType, variantKey: string): void {
    const current = this.getVariant(section)
    if (current === variantKey) return

    if (section === '_header') {
      const old = { ...this.config.header }
      ;(this.config.header as any).variant = variantKey
      this.applyPreservedFields('_header', old, this.config.header)
      return
    }
    if (section === '_categories_home') {
      const old = { ...this.config.categories_home }
      ;(this.config.categories_home as any).variant = variantKey
      this.applyPreservedFields('_categories_home', old, this.config.categories_home)
      return
    }

    const sectionData = (this.config.secciones as any)[section]
    if (!sectionData) return
    const old = { ...sectionData }
    sectionData.variant = variantKey
    this.applyPreservedFields(section, old, sectionData)
  }

  private applyPreservedFields(section: SectionType, oldData: any, newData: any): void {
    const fields = COMMON_FIELDS[section] ?? []
    for (const field of fields) {
      if (oldData[field] !== undefined && newData[field] === undefined) {
        newData[field] = oldData[field]
      }
    }
  }

  updateSectionConfig(section: SectionType, config: any): void {
    if (section === '_header') {
      Object.assign(this.config.header, config)
      return
    }
    if (section === '_categories_home') {
      Object.assign(this.config.categories_home, config)
      return
    }
    Object.assign((this.config.secciones as any)[section], config)
  }

  getSectionPreviewData(section: SectionType): any {
    if (section === '_header') return this.config.header
    if (section === '_categories_home') return this.config.categories_home
    return (this.config.secciones as any)[section]
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let _instance: PageBuilder | null = null

export function usePageBuilder(config?: TiendaConfig): PageBuilder {
  if (!_instance) {
    _instance = new PageBuilder(config)
  } else if (config) {
    _instance = new PageBuilder(config)
  }
  return _instance
}

export function resetPageBuilder(): void {
  _instance = null
}
