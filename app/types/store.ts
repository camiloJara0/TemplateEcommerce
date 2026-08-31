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

// ─── Page Builder: Tienda Config ─────────────────────────────────────────────

export interface HeroSection {
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
  title: string
  subtitle: string
  items: BenefitItem[]
}

export interface CategoriesSection {
  title: string
  subtitle: string
  show_all_link: boolean
}

export interface FeaturedSection {
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
  title: string
  subtitle: string
  items: TestimonialItem[]
}

export interface CtaSection {
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
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4'
  card_height: string
  items: CategoryCardItem[]
}

// ─── Secciones de Producto (14 secciones) ────────────────────────────────────

export interface ProductHeroSection {
  show: boolean
  layout: 'gallery-left' | 'gallery-right' | 'full-width'
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
  title: string
  subtitle: string
  items: ProductBenefitItem[]
  layout: 'horizontal' | 'vertical'
}

export interface ProductGallerySection {
  show: boolean
  style: 'grid' | 'masonry' | 'carousel'
  columns: number
  show_thumbnails: boolean
  enable_zoom: boolean
}

export interface ProductProblemSection {
  show: boolean
  headline: string
  problems: Array<{ icon: string, title: string, description: string }>
  solution_headline: string
  solution_items: Array<{ icon: string, title: string, description: string }>
}

export interface ProductTransformSection {
  show: boolean
  headline: string
  subtext: string
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
  show: boolean
  title: string
  subtitle: string
  layout: 'list' | 'grid' | 'alternating'
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
  show: boolean
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
  show: boolean
  headline: string
  subtext: string
  discount_label: string
  items: ProductBundleItem[]
  cta_label: string
}

export interface ProductCountdownSection {
  show: boolean
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
  show: boolean
  title: string
  subtitle: string
  layout: 'carousel' | 'grid' | 'masonry'
  items: ProductTestimonialItem[]
}

export interface ProductUgcItem {
  image: string | null
  author: string
  platform: string
  text: string
}

export interface ProductUgcSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'carousel' | 'grid'
  items: ProductUgcItem[]
}

export interface ProductWarrantySection {
  show: boolean
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
  title: string
  subtitle: string
  style: 'accordion' | 'tabs' | 'simple'
  items: ProductFaqItem[]
}

export interface ProductCtaSection {
  show: boolean
  headline: string
  subtext: string
  cta_primary: { label: string, url: string }
  cta_secondary: { label: string, url: string } | null
  bg_color: string
  text_color: string
}

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

// ─── Config Unificada ────────────────────────────────────────────────────────

export interface TiendaConfig {
  secciones: TiendaSecciones
  header: HeaderSection
  categories_home: CategoriesHomeSection
  producto: ProductoSecciones
  estilos: GlobalStyles
  brand: BrandConfig
  social: SocialLinks
  navbar: { links: NavbarLink[], show_search: boolean, show_cart: boolean, show_favorites: boolean }
  footer: { columns: FooterColumn[], copyright_text: string }
}

export type SectionKey = keyof TiendaSecciones

export const SECTION_META: Record<SectionKey, { label: string, icon: string }> = {
  hero: { label: 'Hero', icon: 'i-lucide-layout-template' },
  benefits: { label: 'Beneficios', icon: 'i-lucide-badge-check' },
  categories: { label: 'Categorías', icon: 'i-lucide-layers' },
  featured: { label: 'Destacados', icon: 'i-lucide-star' },
  deals: { label: 'Ofertas', icon: 'i-lucide-tag' },
  testimonials: { label: 'Testimonios', icon: 'i-lucide-message-square-quote' },
  cta: { label: 'CTA Final', icon: 'i-lucide-megaphone' },
}

export const PRODUCT_SECTION_META: Record<ProductSectionKey, { label: string, icon: string }> = {
  hero: { label: 'Hero Producto', icon: 'i-lucide-package' },
  benefits: { label: 'Beneficios', icon: 'i-lucide-badge-check' },
  gallery: { label: 'Galería', icon: 'i-lucide-images' },
  problem_solution: { label: 'Problema/Solución', icon: 'i-lucide-lightbulb' },
  transform: { label: 'Transformación', icon: 'i-lucide-arrow-right-left' },
  features: { label: 'Características', icon: 'i-lucide-settings' },
  comparison: { label: 'Comparativa', icon: 'i-lucide-table' },
  bundle: { label: 'Bundle Oferta', icon: 'i-lucide-package-plus' },
  countdown: { label: 'Countdown', icon: 'i-lucide-timer' },
  testimonials: { label: 'Testimonios', icon: 'i-lucide-message-square-quote' },
  ugc: { label: 'UGC Clientes', icon: 'i-lucide-camera' },
  warranty: { label: 'Garantía', icon: 'i-lucide-shield-check' },
  faq: { label: 'FAQ', icon: 'i-lucide-circle-help' },
  cta: { label: 'CTA Final', icon: 'i-lucide-megaphone' },
}

export const DEFAULT_TIENDA_CONFIG: TiendaConfig = {
  secciones: {
    hero: {
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
      ],
    },
    benefits: {
      title: 'Beneficios',
      subtitle: 'Por qué elegirnos',
      items: [
        { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas.' },
        { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos protegidos.' },
        { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas.' },
        { icon: 'i-lucide-headphones', title: 'Soporte real', description: 'Atención humana cuando la necesitas.' },
      ],
    },
    categories: { title: 'Categorías', subtitle: 'Encuentra rápido lo que buscas', show_all_link: true },
    featured: { title: 'Populares', subtitle: 'Lo que más eligen nuestros clientes', show_all_link: true },
    deals: {
      badge: 'Ofertas limitadas',
      headline: 'Hasta 30% en selección premium',
      subtext: 'Aprovecha descuentos reales en productos curados. Stock limitado y envío prioritario.',
      cta_label: 'Comprar ofertas',
      show_section: true,
    },
    testimonials: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Confianza construida pedido a pedido',
      items: [
        { name: 'María G.', role: 'Clienta frecuente', avatar: null, rating: 5, text: 'Excelente experiencia. El envío fue súper rápido y la calidad impecable.' },
        { name: 'Carlos R.', role: 'Compra recurrente', avatar: null, rating: 5, text: 'Lo mejor es la transparencia. Todo claro desde el primer momento.' },
        { name: 'Laura M.', role: 'Nueva clienta', avatar: null, rating: 5, text: 'Diseño increíble y atención al cliente de otro nivel.' },
      ],
    },
    cta: {
      headline: '¿Listo para tu próxima compra?',
      subtext: 'Descubre el catálogo completo y finaliza en minutos.',
      cta_primary: { label: 'Ir al catálogo', url: '/catalogo' },
      cta_secondary: { label: 'Crear cuenta', url: '/auth/register' },
    },
  },
  header: {
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
    hero: { show: true, layout: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true },
    benefits: {
      show: true,
      title: '¿Por qué elegir este producto?',
      subtitle: 'Diseñado para ti',
      layout: 'horizontal',
      items: [
        { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'En pedidos superiores a $99.000' },
        { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa' },
        { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días sin preguntas' },
      ],
    },
    gallery: { show: false, style: 'grid', columns: 2, show_thumbnails: true, enable_zoom: true },
    problem_solution: {
      show: false,
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
      show: false,
      headline: 'La transformación',
      subtext: 'Mira la diferencia',
      before: [{ label: 'Antes', description: 'Situación anterior' }],
      after: [{ label: 'Después', description: 'Situación mejorada' }],
    },
    features: {
      show: false,
      title: 'Características',
      subtitle: 'Todo lo que necesitas saber',
      layout: 'alternating',
      items: [
        { icon: 'i-lucide-zap', title: 'Rendimiento', description: 'Alto rendimiento probado', image: null },
        { icon: 'i-lucide-shield', title: 'Durabilidad', description: 'Materiales premium', image: null },
      ],
    },
    comparison: {
      show: false,
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
      show: false,
      headline: 'Lleva el pack completo',
      subtext: 'Ahorra comprando en bundle',
      discount_label: 'Ahorra 25%',
      items: [],
      cta_label: 'Agregar bundle al carrito',
    },
    countdown: {
      show: false,
      headline: 'Oferta por tiempo limitado',
      subtext: 'No dejes pasar esta oportunidad',
      end_date: '',
      bg_color: '#dc2626',
      text_color: '#ffffff',
    },
    testimonials: {
      show: false,
      title: 'Lo que dicen quienes ya lo compraron',
      subtitle: 'Opiniones verificadas',
      layout: 'carousel',
      items: [],
    },
    ugc: {
      show: false,
      title: 'Visto en Instagram',
      subtitle: 'Clientes reales usando nuestro producto',
      layout: 'carousel',
      items: [],
    },
    warranty: {
      show: false,
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
      title: 'Preguntas frecuentes',
      subtitle: 'Resolvemos tus dudas',
      style: 'accordion',
      items: [
        { question: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda 3-5 días hábiles.' },
        { question: '¿Puedo devolver el producto?', answer: 'Sí, tienes 30 días para devoluciones.' },
      ],
    },
    cta: {
      show: false,
      headline: '¿Listo para comprar?',
      subtext: 'Agrega al carrito y recíbelo en casa',
      cta_primary: { label: 'Comprar ahora', url: '/carrito' },
      cta_secondary: null,
      bg_color: '#6366f1',
      text_color: '#ffffff',
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
}
