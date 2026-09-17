import type { Language } from './api'

export interface PublicStoreConfig {
  store_name: string
  store_tagline?: string | null
  logo?: string | null
  currency: string
  tax_rate: number
  default_language?: Language
  support_email?: string | null
  support_phone?: string | null
  color_primario?: string
  color_secundario?: string
  color_fondo?: string
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  og_image?: string | null
}

export interface StoreConfigPayload {
  store_name?: string
  store_tagline?: string
  logo?: string
  currency?: string
  tax_rate?: number
  default_language?: Language
  support_email?: string
  support_phone?: string
  color_primario?: string
  color_secundario?: string
  color_fondo?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  og_image?: string
}

export interface AdminStoreConfig {
  general: {
    store_name: string
    store_tagline?: string | null
    logo?: string | null
    currency: string
    tax_rate: number
    default_language?: Language
    support_email?: string | null
    support_phone?: string | null
  }
  colores: {
    color_primario?: string
    color_secundario?: string
    color_fondo?: string
  }
  seo: {
    meta_title?: string | null
    meta_description?: string | null
    meta_keywords?: string | null
    og_image?: string | null
  }
}

// ─── Section Variants ────────────────────────────────────────────────────────

export type HeroVariant = 'classic' | 'centered' | 'split' | 'video' | 'slider' | 'countdown' | 'parallax'
export type CategoriesHomeVariant = 'grid' | 'carousel' | 'pills'
export type BenefitsVariant = 'icons' | 'steps' | 'cards'
export type TestimonialsVariant = 'cards' | 'spotlight' | 'masonry'
export type FeaturedVariant = 'grid' | 'carousel' | 'large-cards'
export type CtaVariant = 'banner' | 'split' | 'gradient'
export type HeaderVariant = 'animation' | 'video'

export interface SectionVariantMeta {
  key: string
  label: string
  description: string
  thumbnail: string
}

// ─── Page Builder: Tienda Config ─────────────────────────────────────────────

export interface HeroSection {
  variant?: HeroVariant
  badge?: string | null
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary?: { label: string, url: string } | null
  background_image?: string | null
  show_stats: boolean
  stats: Array<{ value: string, label: string }>
}

export interface BenefitItem {
  icon: string
  title: string
  description: string
}

export interface BenefitsSection {
  variant?: BenefitsVariant
  title: string
  subtitle: string
  items: BenefitItem[]
}

export interface CategoriesSection {
  variant?: CategoriesHomeVariant
  title: string
  subtitle: string
  show_all_link: boolean
}

export interface FeaturedSection {
  variant?: FeaturedVariant
  title: string
  subtitle: string
  show_all_link: boolean
}

export interface DealsSection {
  badge: string
  headline: string
  subtext: string
  cta_label: string
  show_section: boolean
}

export interface TestimonialItem {
  name: string
  role: string
  avatar?: string | null
  rating: number
  text: string
}

export interface TestimonialsSection {
  variant?: TestimonialsVariant
  title: string
  subtitle: string
  items: TestimonialItem[]
}

export interface CtaSection {
  variant?: CtaVariant
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary?: { label: string, url: string } | null
}

export interface TiendaSecciones {
  hero: HeroSection
  benefits: BenefitsSection
  categories: CategoriesSection
  featured: FeaturedSection
  deals: DealsSection
  testimonials: TestimonialsSection
  newsletter: NewsletterSection
  brand_logos: BrandLogosSection
  gallery_feed: GalleryFeedSection
  stats: StatsSection
  video: VideoSection
  map: MapSection
  richtext: RichTextSection
  cta: CtaSection
}

export interface GlobalStyles {
  tipografia: { font_family: string, heading_weight: number, base_size: number }
  colores: { primario: string, secundario: string, fondo: string, accent: string }
  paleta: {
    texto_principal_claro: string
    texto_principal_oscuro: string
    texto_secundario_claro: string
    texto_secundario_oscuro: string
    texto_muted_claro: string
    texto_muted_oscuro: string
    borde_claro: string
    borde_oscuro: string
    superficie_claro: string
    superficie_oscuro: string
    fondo_alt_claro: string
    fondo_alt_oscuro: string
    marca_claro: string
    marca_oscuro: string
    marca_hover_claro: string
    marca_hover_oscuro: string
    acento_claro: string
    acento_oscuro: string
    texto_sobre_marca_claro: string
    texto_sobre_marca_oscuro: string
  }
  fondos: {
    fondo_principal: string
    fondo_principal_dark: string
    fondo_imagenes: string
    fondo_imagenes_dark: string
    fondo_componentes: string
    fondo_componentes_dark: string
    tipo_fondo: 'solid' | 'gradient'
    gradiente_from: string
    gradiente_via: string
    gradiente_to: string
    gradiente_direccion: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l'
  }
  borders: { radius_global: string, radius_buttons: string, radius_cards: string }
  spacing: { section_padding: string, container_max: string }
}

export interface BrandConfig {
  name: string
  tagline: string
  logo?: string | null
  favicon?: string | null
}

export interface SocialLinks {
  instagram?: string | null
  facebook?: string | null
  twitter?: string | null
  youtube?: string | null
}

export interface NavbarLink {
  label: string
  url: string
  visible: boolean
}

export interface FooterLink {
  label: string
  url: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

// ─── Header Animado (HomePage) ───────────────────────────────────────────────

export interface HeaderSection {
  variant?: HeaderVariant
  show: boolean
  background_image: string | null
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary: { label: string, url: string } | null
  overlay_color: string
  overlay_opacity: number
  animation: 'fade' | 'slide-up' | 'zoom'
  text_align: 'left' | 'center' | 'right'
  height: string
}

// ─── Categorías HomePage (Apple/Nike style) ──────────────────────────────────

export interface CategoryCardItem {
  image: string | null
  name: string
  description: string
  url: string
  overlay_opacity: number
  text_color: string
}

export interface CategoriesHomeSection {
  variant?: CategoriesHomeVariant
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4'
  card_height: string
  items: CategoryCardItem[]
}

// ─── Secciones de Producto (14 secciones) ────────────────────────────────────
// Secciones GLOBALES: se configuran UNA vez en el tienda editor, aplican a TODOS los productos.
// Secciones INDIVIDUALES: se configuran por producto en ProductForm, se activan con product_ids.

export type ProductSectionType = 'hero' | 'benefits' | 'gallery' | 'problem_solution' | 'transform' | 'features' | 'comparison' | 'bundle' | 'countdown' | 'testimonials' | 'ugc' | 'warranty' | 'faq' | 'cta'

export const GLOBAL_PRODUCT_SECTIONS: ProductSectionType[] = ['hero', 'benefits', 'gallery', 'warranty', 'faq', 'cta']
export const INDIVIDUAL_PRODUCT_SECTIONS: ProductSectionType[] = ['problem_solution', 'transform', 'features', 'comparison', 'bundle', 'countdown', 'testimonials', 'ugc']

export function isGlobalSection(type: ProductSectionType): boolean {
  return GLOBAL_PRODUCT_SECTIONS.includes(type)
}

export function isIndividualSection(type: ProductSectionType): boolean {
  return INDIVIDUAL_PRODUCT_SECTIONS.includes(type)
}

// ─── Secciones Globales (show: boolean) ──────────────────────────────────────

export interface ProductHeroSection {
  show: boolean
  order: number
  variant: 'gallery-left' | 'gallery-right' | 'full-width'
  gallery_style: 'grid' | 'stacked' | 'zoom'
  show_breadcrumbs: boolean
  show_share: boolean
  sticky_add_to_cart: boolean
}

export interface ProductBenefitItem {
  icon: string
  title: string
  description: string
}

export interface ProductBenefitsSection {
  show: boolean
  order: number
  variant: 'horizontal' | 'vertical'
  title: string
  subtitle: string
  items: ProductBenefitItem[]
}

export interface ProductGallerySection {
  show: boolean
  order: number
  variant: 'grid' | 'masonry' | 'carousel' | 'spotlight'
  columns: number
  show_thumbnails: boolean
  enable_zoom: boolean
}

export interface ProductWarrantySection {
  show: boolean
  order: number
  variant: 'cards' | 'icons' | 'minimal'
  headline: string
  items: Array<{ icon: string, title: string, description: string }>
  cta_label: string
  cta_url: string
}

export interface ProductFaqItem {
  question: string
  answer: string
}

export interface ProductFaqSection {
  show: boolean
  order: number
  variant: 'accordion' | 'tabs' | 'simple'
  title: string
  subtitle: string
  items: ProductFaqItem[]
}

export interface ProductCtaSection {
  show: boolean
  order: number
  variant: 'banner' | 'split' | 'gradient'
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary: { label: string, url: string } | null
  bg_color: string
  text_color: string
}

// ─── Secciones Individuales (product_ids: number[]) ──────────────────────────

export interface ProductProblemSection {
  product_ids: number[]
  order: number
  headline: string
  problems: Array<{ icon: string, title: string, description: string }>
  solution_headline: string
  solution_items: Array<{ icon: string, title: string, description: string }>
}

export interface ProductTransformSection {
  product_ids: number[]
  order: number
  variant: 'side-by-side' | 'overlay' | 'cards'
  headline: string
  subtext: string
  before_image: string | null
  after_image: string | null
  before: Array<{ label: string, description: string }>
  after: Array<{ label: string, description: string }>
}

export interface ProductFeatureItem {
  icon: string
  title: string
  description: string
  image: string | null
}

export interface ProductFeaturesSection {
  product_ids: number[]
  order: number
  variant: 'list' | 'grid' | 'alternating'
  title: string
  subtitle: string
  items: ProductFeatureItem[]
}

export interface ProductComparisonColumn {
  label: string
  is_ours: boolean
}

export interface ProductComparisonRow {
  feature: string
  values: string[]
}

export interface ProductComparisonSection {
  product_ids: number[]
  order: number
  variant: 'table' | 'cards' | 'visual'
  headline: string
  subtext: string
  columns: ProductComparisonColumn[]
  rows: ProductComparisonRow[]
}

export interface ProductBundleItem {
  product_id: number | null
  name: string
  original_price: number
  bundle_price: number
  image: string | null
}

export interface ProductBundleSection {
  product_ids: number[]
  order: number
  variant: 'grid' | 'split' | 'carousel'
  headline: string
  subtext: string
  discount_label: string
  items: ProductBundleItem[]
  cta_label: string
}

export interface ProductCountdownSection {
  product_ids: number[]
  order: number
  variant: 'minimal' | 'urgent' | 'elegant'
  headline: string
  subtext: string
  end_date: string
  bg_color: string
  text_color: string
}

export interface ProductTestimonialItem {
  name: string
  role: string
  avatar: string | null
  rating: number
  text: string
}

export interface ProductTestimonialsSection {
  product_ids: number[]
  order: number
  variant: 'carousel' | 'grid' | 'masonry' | 'spotlight'
  title: string
  subtitle: string
  items: ProductTestimonialItem[]
}

export interface ProductUgcItem {
  image: string | null
  author: string
  platform: string
  text: string
}

export interface ProductUgcSection {
  product_ids: number[]
  order: number
  variant: 'carousel' | 'grid' | 'masonry'
  title: string
  subtitle: string
  items: ProductUgcItem[]
}

// ─── Agregados ──────────────────────────────────────────────────────────────

export type ProductGlobalSectionKey = 'hero' | 'benefits' | 'gallery' | 'warranty' | 'faq' | 'cta'
export type ProductIndividualSectionKey = 'problem_solution' | 'transform' | 'features' | 'comparison' | 'bundle' | 'countdown' | 'testimonials' | 'ugc'

export interface ProductoSecciones {
  hero: ProductHeroSection
  benefits: ProductBenefitsSection
  gallery: ProductGallerySection
  problem_solution: ProductProblemSection
  transform: ProductTransformSection
  features: ProductFeaturesSection
  comparison: ProductComparisonSection
  bundle: ProductBundleSection
  countdown: ProductCountdownSection
  testimonials: ProductTestimonialsSection
  ugc: ProductUgcSection
  warranty: ProductWarrantySection
  faq: ProductFaqSection
  cta: ProductCtaSection
}

export type ProductSectionKey = keyof ProductoSecciones

/** Returns true if the section is active for the given product */
export function isProductSectionActive(
  sections: ProductoSecciones,
  key: ProductSectionKey,
  productId?: number
): boolean {
  const section = sections[key] as unknown as Record<string, unknown>
  if ('show' in section) return section.show as boolean
  if ('product_ids' in section && productId != null) {
    return (section.product_ids as number[]).includes(productId)
  }
  return false
}

// ─── Nuevas secciones Home ────────────────────────────────────────────────────

export interface NewsletterSection {
  show: boolean
  headline: string
  subtext: string
  placeholder: string
  button_label: string
  bg_color: string
  text_color: string
  layout: 'centered' | 'split'
  image: string | null
}

export interface BrandLogosSection {
  show: boolean
  title: string
  items: Array<{ name: string, logo: string | null, url: string | null }>
  style: 'grayscale' | 'color' | 'minimal'
}

export interface GalleryFeedSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry'
  items: Array<{ image: string, url: string | null, caption: string | null }>
}

export interface StatsSection {
  show: boolean
  layout: 'grid-3' | 'grid-4' | 'horizontal'
  bg_color: string
  text_color: string
  items: Array<{ value: string, label: string, icon: string }>
}

export interface VideoSection {
  show: boolean
  headline: string
  subtext: string
  video_url: string | null
  thumbnail: string | null
  aspect_ratio: '16:9' | '4:3' | '21:9'
}

export interface MapSection {
  show: boolean
  headline: string
  subtext: string
  address: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  hours: string | null
  map_style: 'standard' | 'satellite' | 'terrain'
}

export interface RichTextSection {
  show: boolean
  layout: 'full' | 'split-left' | 'split-right'
  headline: string
  content: string
  image: string | null
  cta_label: string | null
  cta_url: string | null
  bg_color: string | null
  text_color: string | null
}

// ─── Secciones Sobre Nosotros ─────────────────────────────────────────────────

export interface AboutHeroSection {
  show: boolean
  headline: string
  subtext: string
  background_image: string | null
  overlay_opacity: number
  text_align: 'left' | 'center' | 'right'
}

export interface MissionVisionSection {
  show: boolean
  mission_title: string
  mission_text: string
  mission_image: string | null
  vision_title: string
  vision_text: string
  vision_image: string | null
  layout: 'side-by-side' | 'stacked' | 'alternating'
}

export interface ValueItem {
  icon: string
  title: string
  description: string
  image: string | null
}

export interface ValuesSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'list'
  items: ValueItem[]
}

export interface TeamMember {
  name: string
  role: string
  avatar: string | null
  bio: string
  social_links: { instagram?: string, linkedin?: string, twitter?: string }
}

export interface TeamSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4'
  members: TeamMember[]
}

export interface TimelineEvent {
  year: string
  title: string
  description: string
  icon: string
  image: string | null
}

export interface TimelineSection {
  show: boolean
  title: string
  subtitle: string
  events: TimelineEvent[]
}

export interface AboutMapSection {
  show: boolean
  headline: string
  address: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  hours: string | null
}

export interface AboutCtaSection {
  show: boolean
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary: { label: string, url: string } | null
  bg_color: string | null
  text_color: string | null
}

export interface NosotrosSecciones {
  hero: AboutHeroSection
  mission_vision: MissionVisionSection
  values: ValuesSection
  team: TeamSection
  timeline: TimelineSection
  map: AboutMapSection
  cta: AboutCtaSection
}

export type AboutSectionKey = keyof NosotrosSecciones

// ─── Dynamic Page Sections ───────────────────────────────────────────────────

export interface PageSection {
  id: string
  type: SectionKey
  order: number
  visible: boolean
  variant: string
  config: Record<string, any>
}

export interface SectionDefinition {
  type: SectionKey
  label: string
  icon: string
  category: 'hero' | 'content' | 'conversion' | 'social' | 'layout' | 'media'
  variants: Array<{ key: string, label: string, description: string, icon: string }>
  defaultConfig: Record<string, any>
  isSpecial?: boolean
}

// ─── Config Unificada ────────────────────────────────────────────────────────

export interface TiendaConfig {
  secciones: TiendaSecciones
  header: HeaderSection
  categories_home: CategoriesHomeSection
  producto: ProductoSecciones
  nosotros: NosotrosSecciones
  estilos: GlobalStyles
  brand: BrandConfig
  social: SocialLinks
  navbar: { links: NavbarLink[], show_search: boolean, show_cart: boolean, show_favorites: boolean }
  footer: { columns: FooterColumn[], copyright_text: string }
  page_sections: PageSection[]
}

export type SectionKey = keyof TiendaSecciones | '_header' | '_categories_home' | 'urgency_banner' | 'countdown_offer' | 'stock_counter' | 'sticky_add_to_cart' | 'faq' | 'timeline' | 'blog_grid' | 'article_featured'

export const SECTION_META: Record<SectionKey, { label: string, icon: string }> = {
  _header: { label: 'Header', icon: 'i-lucide-panel-top' },
  _categories_home: { label: 'Categorías Home', icon: 'i-lucide-layout-grid' },
  hero: { label: 'Hero', icon: 'i-lucide-layout-template' },
  benefits: { label: 'Beneficios', icon: 'i-lucide-badge-check' },
  categories: { label: 'Categorías', icon: 'i-lucide-layers' },
  featured: { label: 'Destacados', icon: 'i-lucide-star' },
  deals: { label: 'Ofertas', icon: 'i-lucide-tag' },
  testimonials: { label: 'Testimonios', icon: 'i-lucide-message-square-quote' },
  newsletter: { label: 'Newsletter', icon: 'i-lucide-mail' },
  brand_logos: { label: 'Marcas', icon: 'i-lucide-heart' },
  gallery_feed: { label: 'Galería', icon: 'i-lucide-instagram' },
  stats: { label: 'Estadísticas', icon: 'i-lucide-bar-chart-3' },
  video: { label: 'Video', icon: 'i-lucide-play-circle' },
  map: { label: 'Mapa', icon: 'i-lucide-map-pin' },
  richtext: { label: 'Texto enriquecido', icon: 'i-lucide-file-text' },
  cta: { label: 'CTA Final', icon: 'i-lucide-megaphone' },
  urgency_banner: { label: 'Banner Urgencia', icon: 'i-lucide-alert-triangle' },
  countdown_offer: { label: 'Oferta Countdown', icon: 'i-lucide-timer' },
  stock_counter: { label: 'Contador Stock', icon: 'i-lucide-package' },
  sticky_add_to_cart: { label: 'Carrito Fijo', icon: 'i-lucide-shopping-cart' },
  faq: { label: 'Preguntas Frecuentes', icon: 'i-lucide-help-circle' },
  timeline: { label: 'Línea de Tiempo', icon: 'i-lucide-git-branch' },
  blog_grid: { label: 'Blog Grid', icon: 'i-lucide-layout-grid' },
  article_featured: { label: 'Artículos Destacados', icon: 'i-lucide-newspaper' },
}

export const ABOUT_SECTION_META: Record<AboutSectionKey, { label: string, icon: string }> = {
  hero: { label: 'Hero', icon: 'i-lucide-layout-template' },
  mission_vision: { label: 'Misión y Visión', icon: 'i-lucide-eye' },
  values: { label: 'Valores', icon: 'i-lucide-heart' },
  team: { label: 'Equipo', icon: 'i-lucide-users' },
  timeline: { label: 'Historia', icon: 'i-lucide-clock' },
  map: { label: 'Ubicación', icon: 'i-lucide-map-pin' },
  cta: { label: 'CTA', icon: 'i-lucide-megaphone' },
}

export const PRODUCT_SECTION_META: Record<ProductSectionKey, { label: string, icon: string, type: ProductSectionType }> = {
  hero: { label: 'Hero Producto', icon: 'i-lucide-package', type: 'hero' },
  benefits: { label: 'Beneficios', icon: 'i-lucide-badge-check', type: 'benefits' },
  gallery: { label: 'Galería', icon: 'i-lucide-images', type: 'gallery' },
  problem_solution: { label: 'Problema/Solución', icon: 'i-lucide-lightbulb', type: 'problem_solution' },
  transform: { label: 'Transformación', icon: 'i-lucide-arrow-right-left', type: 'transform' },
  features: { label: 'Características', icon: 'i-lucide-settings', type: 'features' },
  comparison: { label: 'Comparativa', icon: 'i-lucide-table', type: 'comparison' },
  bundle: { label: 'Bundle Oferta', icon: 'i-lucide-package-plus', type: 'bundle' },
  countdown: { label: 'Countdown', icon: 'i-lucide-timer', type: 'countdown' },
  testimonials: { label: 'Testimonios', icon: 'i-lucide-message-square-quote', type: 'testimonials' },
  ugc: { label: 'UGC Clientes', icon: 'i-lucide-camera', type: 'ugc' },
  warranty: { label: 'Garantía', icon: 'i-lucide-shield-check', type: 'warranty' },
  faq: { label: 'FAQ', icon: 'i-lucide-circle-help', type: 'faq' },
  cta: { label: 'CTA Final', icon: 'i-lucide-megaphone', type: 'cta' },
}

/** Section variant options for the variant picker */
export const PRODUCT_SECTION_VARIANTS: Record<string, { key: string, label: string, description: string }[]> = {
  hero: [
    { key: 'gallery-left', label: 'Galería izquierda', description: 'Galería a la izquierda, info a la derecha' },
    { key: 'gallery-right', label: 'Galería derecha', description: 'Info a la izquierda, galería a la derecha' },
    { key: 'full-width', label: 'Ancho completo', description: 'Galería y info en layout completo' },
  ],
  gallery: [
    { key: 'grid', label: 'Cuadrícula', description: 'Imágenes en grilla responsive' },
    { key: 'masonry', label: 'Masonry', description: 'Imágenes en columnas irregulares' },
    { key: 'carousel', label: 'Carrusel', description: 'Slider con navegación' },
    { key: 'spotlight', label: 'Spotlight', description: 'Imagen principal con thumbnails' },
  ],
  comparison: [
    { key: 'table', label: 'Tabla', description: 'Comparación en tabla clásica' },
    { key: 'cards', label: 'Tarjetas', description: 'Tarjetas lado a lado con checks' },
    { key: 'visual', label: 'Visual', description: 'Comparación visual con gradiente' },
  ],
  bundle: [
    { key: 'grid', label: 'Cuadrícula', description: 'Productos en grilla con precio bundle' },
    { key: 'split', label: 'Dividido', description: 'Lista a la izquierda, resumen a la derecha' },
    { key: 'carousel', label: 'Carrusel', description: 'Slider horizontal de productos' },
  ],
  countdown: [
    { key: 'minimal', label: 'Minimal', description: 'Limpio y elegante' },
    { key: 'urgent', label: 'Urgente', description: 'Colores rojos, animación pulse' },
    { key: 'elegant', label: 'Elegante', description: 'Fondo oscuro, tipografía refinada' },
  ],
  testimonials: [
    { key: 'carousel', label: 'Carrusel', description: 'Slider con controles' },
    { key: 'grid', label: 'Cuadrícula', description: 'Tarjetas en grilla' },
    { key: 'masonry', label: 'Masonry', description: 'Columnas irregulares' },
    { key: 'spotlight', label: 'Destacado', description: 'Testimonio grande con quote' },
  ],
  ugc: [
    { key: 'carousel', label: 'Carrusel', description: 'Scroll horizontal de contenido' },
    { key: 'grid', label: 'Cuadrícula', description: 'Grid de contenido de usuario' },
    { key: 'masonry', label: 'Masonry', description: 'Columnas irregulares' },
  ],
  warranty: [
    { key: 'cards', label: 'Tarjetas', description: 'Tarjetas con iconos grandes' },
    { key: 'icons', label: 'Iconos', description: 'Iconos en fila horizontal' },
    { key: 'minimal', label: 'Mínimo', description: 'Línea simple con iconos pequeños' },
  ],
  faq: [
    { key: 'accordion', label: 'Accordion', description: 'Preguntas expandibles' },
    { key: 'tabs', label: 'Tabs', description: 'Pestañas con contenido' },
    { key: 'simple', label: 'Simple', description: 'Tarjetas estáticas' },
  ],
  cta: [
    { key: 'banner', label: 'Banner', description: 'Banner centrado con gradiente' },
    { key: 'split', label: 'Dividido', description: 'Texto a la izquierda, imagen derecha' },
    { key: 'gradient', label: 'Gradiente', description: 'Fondo gradiente vibrante' },
  ],
}

/** Mock product data for section previews in the tienda editor */
export const MOCK_PRODUCT_FOR_PREVIEW = {
  id: 1,
  name: 'Producto de ejemplo',
  slug: 'producto-ejemplo',
  sku: 'SKU-001',
  price: 99900,
  price_discount: 79900,
  description: 'Este es un producto de ejemplo utilizado para previsualizar las secciones de la página de producto.',
  stock: 25,
  images: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
  ],
  brand: 'Marca Ejemplo',
  rating: 4,
  reviews_count: 128,
  slug_url: '/producto/producto-ejemplo',
}

export const DEFAULT_TIENDA_CONFIG: TiendaConfig = {
  secciones: {
    hero: {
      variant: 'classic',
      badge: 'Nueva colección 2026',
      headline: 'Compra con la claridad que mereces',
      subtext: 'Productos curados, checkout sin fricción y una experiencia tan limpia como el mejor software del mundo.',
      cta_primary: { label: 'Explorar catálogo', url: '/catalogo' },
      cta_secondary: { label: 'Ver ofertas', url: '/ofertas' },
      background_image: null,
      show_stats: true,
      stats: [
        { value: '4.9', label: 'Valoración media de clientes' },
        { value: '+12k', label: 'Pedidos este año' },
        { value: 'Productos de Calidad', label: 'Pedidos este año' },
      ],
    },
    benefits: {
      variant: 'icons',
      title: 'Beneficios',
      subtitle: 'Por qué elegirnos',
      items: [
        { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas.' },
        { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos protegidos.' },
        { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas.' },
        { icon: 'i-lucide-headphones', title: 'Soporte real', description: 'Atención humana cuando la necesitas.' },
      ],
    },
    categories: { variant: 'grid', title: 'Categorías', subtitle: 'Encuentra rápido lo que buscas', show_all_link: true },
    featured: { variant: 'grid', title: 'Populares', subtitle: 'Lo que más eligen nuestros clientes', show_all_link: true },
    deals: {
      badge: 'Ofertas limitadas',
      headline: 'Hasta 30% en selección premium',
      subtext: 'Aprovecha descuentos reales en productos curados. Stock limitado y envío prioritario.',
      cta_label: 'Comprar ofertas',
      show_section: true,
    },
    testimonials: {
      variant: 'cards',
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Confianza construida pedido a pedido',
      items: [
        { name: 'María G.', role: 'Clienta frecuente', avatar: null, rating: 5, text: 'Excelente experiencia. El envío fue súper rápido y la calidad impecable.' },
        { name: 'Carlos R.', role: 'Compra recurrente', avatar: null, rating: 5, text: 'Lo mejor es la transparencia. Todo claro desde el primer momento.' },
        { name: 'Laura M.', role: 'Nueva clienta', avatar: null, rating: 5, text: 'Diseño increíble y atención al cliente de otro nivel.' },
      ],
    },
    newsletter: {
      show: false,
      headline: 'Suscríbete a nuestro newsletter',
      subtext: 'Ofertas exclusivas, lanzamientos y descuentos directo a tu correo.',
      placeholder: 'Tu correo electrónico',
      button_label: 'Suscribirme',
      bg_color: '#6366f1',
      text_color: '#ffffff',
      layout: 'centered',
      image: null,
    },
    brand_logos: {
      show: false,
      title: 'Marcas que confían en nosotros',
      items: [
        { name: 'Nike', logo: null, url: null },
        { name: 'Apple', logo: null, url: null },
        { name: 'Samsung', logo: null, url: null },
        { name: 'Sony', logo: null, url: null },
      ],
      style: 'grayscale',
    },
    gallery_feed: {
      show: false,
      title: 'Síguenos en Instagram',
      subtitle: 'Etiquétanos @tienda para aparecer aquí',
      layout: 'grid-4',
      items: [],
    },
    stats: {
      show: false,
      layout: 'grid-4',
      bg_color: '#0f172a',
      text_color: '#ffffff',
      items: [
        { value: '+12,000', label: 'Clientes satisfechos', icon: 'i-lucide-users' },
        { value: '+5,000', label: 'Productos vendidos', icon: 'i-lucide-shopping-bag' },
        { value: '4.9', label: 'Valoración media', icon: 'i-lucide-star' },
        { value: '24h', label: 'Envío express', icon: 'i-lucide-truck' },
      ],
    },
    video: {
      show: false,
      headline: 'Mira cómo funciona',
      subtext: 'Un vistazo rápido a lo que nos hace diferentes.',
      video_url: null,
      thumbnail: null,
      aspect_ratio: '16:9',
    },
    map: {
      show: false,
      headline: 'Visítanos',
      subtext: 'Estamos en el corazón de la ciudad.',
      address: 'Calle Principal #123, Bogotá',
      latitude: 4.711,
      longitude: -74.0721,
      phone: '+57 300 000 0000',
      hours: 'Lun - Vie: 9:00 - 18:00',
      map_style: 'standard',
    },
    richtext: {
      show: false,
      layout: 'full',
      headline: 'Nuestra historia',
      content: 'Somos una tienda comprometida con la calidad y la satisfacción del cliente.',
      image: null,
      cta_label: null,
      cta_url: null,
      bg_color: null,
      text_color: null,
    },
    cta: {
      variant: 'banner',
      headline: '¿Listo para tu próxima compra?',
      subtext: 'Descubre el catálogo completo y finaliza en minutos.',
      cta_primary: { label: 'Ir al catálogo', url: '/catalogo' },
      cta_secondary: { label: 'Crear cuenta', url: '/auth/register' },
    },
  },
  header: {
    variant: 'animation',
    show: true,
    background_image: null,
    headline: 'Bienvenido a nuestra tienda',
    subtext: 'Descubre productos increíbles con la mejor experiencia de compra.',
    cta_primary: { label: 'Explorar ahora', url: '/catalogo' },
    cta_secondary: { label: 'Conocer más', url: '/nosotros' },
    overlay_color: '#000000',
    overlay_opacity: 0.4,
    animation: 'fade',
    text_align: 'center',
    height: '80vh',
  },
  categories_home: {
    variant: 'grid',
    show: true,
    title: 'Explora por categoría',
    subtitle: 'Encuentra exactamente lo que buscas',
    layout: 'grid-3',
    card_height: '280px',
    items: [
      { image: null, name: 'Tecnología', description: 'Lo último en innovate', url: '/categorias/tecnologia', overlay_opacity: 0.5, text_color: '#ffffff' },
      { image: null, name: 'Moda', description: 'Estilo y tendencia', url: '/categorias/moda', overlay_opacity: 0.5, text_color: '#ffffff' },
      { image: null, name: 'Hogar', description: 'Transforma tu espacio', url: '/categorias/hogar', overlay_opacity: 0.5, text_color: '#ffffff' },
    ],
  },
  producto: {
    hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true },
    benefits: {
      show: true,
      order: 1,
      variant: 'horizontal',
      title: '¿Por qué elegir este producto?',
      subtitle: 'Diseñado para ti',
      items: [
        { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'En pedidos superiores a $99.000' },
        { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa' },
        { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días sin preguntas' },
      ],
    },
    gallery: { show: false, order: 2, variant: 'grid', columns: 2, show_thumbnails: true, enable_zoom: true },
    problem_solution: {
      product_ids: [],
      order: 3,
      headline: '¿Cansado de...?',
      problems: [
        { icon: 'i-lucide-x-circle', title: 'Problema 1', description: 'Descripción del problema' },
        { icon: 'i-lucide-x-circle', title: 'Problema 2', description: 'Descripción del problema' },
      ],
      solution_headline: 'Nuestra solución',
      solution_items: [
        { icon: 'i-lucide-check-circle', title: 'Solución 1', description: 'Cómo lo resolvemos' },
        { icon: 'i-lucide-check-circle', title: 'Solución 2', description: 'Cómo lo resolvemos' },
      ],
    },
    transform: {
      product_ids: [],
      order: 4,
      variant: 'overlay',
      headline: 'La transformación',
      subtext: 'Mira la diferencia',
      before_image: null,
      after_image: null,
      before: [{ label: 'Antes', description: 'Situación anterior' }],
      after: [{ label: 'Después', description: 'Situación mejorada' }],
    },
    features: {
      product_ids: [],
      order: 5,
      variant: 'alternating',
      title: 'Características',
      subtitle: 'Todo lo que necesitas saber',
      items: [
        { icon: 'i-lucide-zap', title: 'Rendimiento', description: 'Alto rendimiento probado', image: null },
        { icon: 'i-lucide-shield', title: 'Durabilidad', description: 'Materiales premium', image: null },
      ],
    },
    comparison: {
      product_ids: [],
      order: 6,
      variant: 'table',
      headline: '¿Por qué nosotros?',
      subtext: 'Compara y decide',
      columns: [
        { label: 'Nuestro Producto', is_ours: true },
        { label: 'Competencia', is_ours: false },
      ],
      rows: [
        { feature: 'Calidad', values: ['Premium', 'Estándar'] },
        { feature: 'Garantía', values: ['1 año', '3 meses'] },
        { feature: 'Envío', values: ['Gratis', 'Pago'] },
      ],
    },
    bundle: {
      product_ids: [],
      order: 7,
      variant: 'grid',
      headline: 'Lleva el pack completo',
      subtext: 'Ahorra comprando en bundle',
      discount_label: 'Ahorra 25%',
      items: [],
      cta_label: 'Agregar bundle al carrito',
    },
    countdown: {
      product_ids: [],
      order: 8,
      variant: 'elegant',
      headline: 'Oferta por tiempo limitado',
      subtext: 'No dejes pasar esta oportunidad',
      end_date: '',
      bg_color: '#dc2626',
      text_color: '#ffffff',
    },
    testimonials: {
      product_ids: [],
      order: 9,
      variant: 'carousel',
      title: 'Lo que dicen quienes ya lo compraron',
      subtitle: 'Opiniones verificadas',
      items: [],
    },
    ugc: {
      product_ids: [],
      order: 10,
      variant: 'carousel',
      title: 'Visto en Instagram',
      subtitle: 'Clientes reales usando nuestro producto',
      items: [],
    },
    warranty: {
      show: false,
      order: 11,
      variant: 'cards',
      headline: 'Compra con confianza',
      items: [
        { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa de fábrica' },
        { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días para cambios' },
        { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Estamos siempre para ti' },
      ],
      cta_label: 'Ver políticas',
      cta_url: '/garantia',
    },
    faq: {
      show: false,
      order: 12,
      variant: 'accordion',
      title: 'Preguntas frecuentes',
      subtitle: 'Resolvemos tus dudas',
      items: [
        { question: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda 3-5 días hábiles.' },
        { question: '¿Puedo devolver el producto?', answer: 'Sí, tienes 30 días para devoluciones.' },
      ],
    },
    cta: {
      show: false,
      order: 13,
      variant: 'banner',
      headline: '¿Listo para comprar?',
      subtext: 'Agrega al carrito y recíbelo en casa',
      cta_primary: { label: 'Comprar ahora', url: '/carrito' },
      cta_secondary: null,
      bg_color: '#6366f1',
      text_color: '#ffffff',
    },
  },
  nosotros: {
    hero: {
      show: true,
      headline: 'Sobre nosotros',
      subtext: 'Conoce la historia detrás de nuestra tienda.',
      background_image: null,
      overlay_opacity: 0.4,
      text_align: 'center',
    },
    mission_vision: {
      show: true,
      mission_title: 'Nuestra Misión',
      mission_text: 'Ofrecer productos de la más alta calidad con una experiencia de compra excepcional, making each interaction memorable.',
      mission_image: null,
      vision_title: 'Nuestra Visión',
      vision_text: 'Ser la tienda en línea de referencia en Latinoamérica, reconocida por la innovación, la calidad y la satisfacción del cliente.',
      vision_image: null,
      layout: 'side-by-side',
    },
    values: {
      show: true,
      title: 'Nuestros Valores',
      subtitle: 'Los principios que guían cada decisión',
      layout: 'grid-3',
      items: [
        { icon: 'i-lucide-shield-check', title: 'Confianza', description: 'Transparencia absoluta en cada transacción.', image: null },
        { icon: 'i-lucide-sparkles', title: 'Calidad', description: 'Solo ofrecemos lo que compraríamos nosotros.', image: null },
        { icon: 'i-lucide-heart', title: 'Pasión', description: 'Amamos lo que hacemos y se nota.', image: null },
        { icon: 'i-lucide-headphones', title: 'Soporte', description: 'Atención real, humana y disponible.', image: null },
      ],
    },
    team: {
      show: false,
      title: 'Nuestro Equipo',
      subtitle: 'La gente que hace posible todo',
      layout: 'grid-3',
      members: [],
    },
    timeline: {
      show: false,
      title: 'Nuestra Historia',
      subtitle: 'Un recorrido que apenas comienza',
      events: [
        { year: '2020', title: 'El comienzo', description: 'Nacimos con la idea de hacer las cosas diferentes.', icon: 'i-lucide-rocket', image: null },
        { year: '2022', title: 'Crecimiento', description: 'Alcanzamos nuestros primeros 1,000 clientes.', icon: 'i-lucide-trending-up', image: null },
        { year: '2024', title: 'Consolidación', description: 'Expandimos nuestro catálogo y mejoramos la experiencia.', icon: 'i-lucide-award', image: null },
      ],
    },
    map: {
      show: false,
      headline: 'Encuéntranos',
      address: 'Calle Principal #123, Bogotá, Colombia',
      latitude: 4.711,
      longitude: -74.0721,
      phone: '+57 300 000 0000',
      hours: 'Lun - Vie: 9:00 - 18:00',
    },
    cta: {
      show: true,
      headline: '¿Listo para conocernos?',
      subtext: 'Explora nuestro catálogo y descubre por qué somos diferentes.',
      cta_primary: { label: 'Ver catálogo', url: '/catalogo' },
      cta_secondary: { label: 'Contactar', url: '/contacto' },
      bg_color: null,
      text_color: null,
    },
  },
  estilos: {
    tipografia: { font_family: 'Inter', heading_weight: 600, base_size: 16 },
    colores: { primario: '#6366f1', secundario: '#64748b', fondo: '#f8fafc', accent: '#d946ef' },
    paleta: {
      texto_principal_claro: '#0f172a',
      texto_principal_oscuro: '#f8fafc',
      texto_secundario_claro: '#475569',
      texto_secundario_oscuro: '#cbd5e1',
      texto_muted_claro: '#94a3b8',
      texto_muted_oscuro: '#64748b',
      borde_claro: '#e2e8f0',
      borde_oscuro: '#1e293b',
      superficie_claro: '#ffffff',
      superficie_oscuro: '#0f172a',
      fondo_alt_claro: '#f1f5f9',
      fondo_alt_oscuro: '#111827',
      marca_claro: '#6366f1',
      marca_oscuro: '#818cf8',
      marca_hover_claro: '#4f46e5',
      marca_hover_oscuro: '#a5b4fc',
      acento_claro: '#d946ef',
      acento_oscuro: '#e879f9',
      texto_sobre_marca_claro: '#ffffff',
      texto_sobre_marca_oscuro: '#ffffff',
    },
    fondos: {
      fondo_principal: '#ffffff',
      fondo_principal_dark: '#0f172a',
      fondo_imagenes: '#f1f5f9',
      fondo_imagenes_dark: '#1e293b',
      fondo_componentes: '#ffffff',
      fondo_componentes_dark: '#1e293b',
      tipo_fondo: 'solid',
      gradiente_from: '#6366f1',
      gradiente_via: '#8b5cf6',
      gradiente_to: '#d946ef',
      gradiente_direccion: 'to-br',
    },
    borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
    spacing: { section_padding: '5rem', container_max: '80rem' },
  },
  brand: { name: 'CommerceOS', tagline: 'Tu tienda, elevada.', logo: null, favicon: null },
  social: { instagram: null, facebook: null, twitter: null, youtube: null },
  navbar: {
    links: [
      { label: 'Inicio', url: '/', visible: true },
      { label: 'Catálogo', url: '/catalogo', visible: true },
      { label: 'Ofertas', url: '/ofertas', visible: true },
      { label: 'Nosotros', url: '/nosotros', visible: true },
    ],
    show_search: true,
    show_cart: true,
    show_favorites: true,
  },
  footer: {
    columns: [
      { title: 'Tienda', links: [{ label: 'Catálogo', url: '/catalogo' }, { label: 'Ofertas', url: '/ofertas' }, { label: 'Nosotros', url: '/nosotros' }] },
      { title: 'Soporte', links: [{ label: 'Centro de ayuda', url: '/ayuda' }, { label: 'Envíos', url: '/carrito' }, { label: 'Devoluciones', url: '/carrito' }] },
      { title: 'Legal', links: [{ label: 'Privacidad', url: '/privacidad' }, { label: 'Términos', url: '/terminos' }] },
    ],
    copyright_text: 'Todos los derechos reservados.',
  },
  page_sections: [
    { id: 'header-1', type: '_header', order: 0, visible: true, variant: 'animation', config: {} },
    { id: 'hero-1', type: 'hero', order: 1, visible: true, variant: 'classic', config: {} },
    { id: 'benefits-1', type: 'benefits', order: 2, visible: true, variant: 'icons', config: {} },
    { id: 'categories-home-1', type: '_categories_home', order: 3, visible: true, variant: 'grid', config: {} },
    { id: 'featured-1', type: 'featured', order: 4, visible: true, variant: 'grid', config: {} },
    { id: 'deals-1', type: 'deals', order: 5, visible: true, variant: 'default', config: {} },
    { id: 'testimonials-1', type: 'testimonials', order: 6, visible: true, variant: 'cards', config: {} },
    { id: 'cta-1', type: 'cta', order: 7, visible: true, variant: 'banner', config: {} },
  ],
}
