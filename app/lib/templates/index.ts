import type { TiendaConfig, PageSection, SectionKey } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'
import type { Template, TemplateCategory, TemplateFilter } from './types'

export type { Template, TemplateCategory, TemplateFilter } from './types'

// ─── Template Helper ─────────────────────────────────────────────────────────

export function createTemplateConfig(overrides: Partial<TiendaConfig> & { page_sections?: PageSection[] }): TiendaConfig {
  return {
    ...JSON.parse(JSON.stringify(DEFAULT_TIENDA_CONFIG)),
    ...overrides,
    page_sections: overrides.page_sections ?? JSON.parse(JSON.stringify(DEFAULT_TIENDA_CONFIG.page_sections)),
  }
}

export function createPageSections(types: (SectionKey | [SectionKey, Record<string, any>])[]): PageSection[] {
  return types.map((entry, i) => {
    const [type, config] = Array.isArray(entry) ? entry : [entry, {}]
    return {
      id: `${type}-${i + 1}`,
      type,
      order: i,
      visible: true,
      variant: getDefaultVariantForType(type),
      config: config ?? getDefaultConfigForType(type),
    }
  })
}

function getDefaultVariantForType(type: SectionKey): string {
  const variants: Record<string, string> = {
    hero: 'classic', categories: 'grid', benefits: 'icons',
    featured: 'grid', testimonials: 'cards', cta: 'banner',
    _categories_home: 'grid', deals: 'default', newsletter: 'default',
    brand_logos: 'default', gallery_feed: 'default', stats: 'default',
    video: 'default', richtext: 'default', map: 'default',
    faq: 'accordion', timeline: 'default', blog_grid: 'default',
    article_featured: 'default', urgency_banner: 'default',
    countdown_offer: 'default', stock_counter: 'default',
  }
  return variants[type] ?? 'default'
}

function getDefaultConfigForType(type: SectionKey): Record<string, any> {
  return {}
}

// ─── Template Definitions ────────────────────────────────────────────────────

export const templates: Template[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // 1. MODERN STORE — Hero split + featured grid + testimonials cards + CTA
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'modern-store',
    name: 'Modern Store',
    description: 'Tienda moderna y personalizable con descubrimiento visual, prueba social y bloques editoriales para una experiencia de compra completa.',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-store',
    gradient: 'from-violet-600 to-blue-600',
    sections: ['Header', 'Hero Split', 'Categorías Visuales', 'Beneficios Icons', 'Destacados Grid', 'Galería Social', 'Testimonios Cards', 'Stats', 'Newsletter', 'CTA Banner', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Nueva Temporada 2026',
          headline: 'Moda que define tu estilo',
          subtext: 'Descubre las últimas tendencias en moda, accesorios y lifestyle con envío express a todo el país.',
          cta_primary: { label: 'Explorar colección', url: '/catalogo' },
          cta_secondary: { label: 'Ver ofertas', url: '/ofertas' },
          background_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '15k+', label: 'Clientes satisfechos' },
            { value: '4.9', label: 'Valoración media' },
            { value: '24h', label: 'Envío express' },
          ],
        },
        benefits: {
          variant: 'icons',
          title: '¿Por qué elegirnos?',
          subtitle: 'Tu tienda de confianza con los mejores beneficios',
          items: [
            { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'En pedidos superiores a $99.000 recibe sin costo adicional.' },
            { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos 100% protegidos en cada transacción.' },
            { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas, devolución 100% garantizada.' },
            { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Atención humana y personalizada cuando la necesites.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Lo Más Vendido',
          subtitle: 'Los favoritos de nuestros clientes este mes',
          show_all_link: true,
        },
        testimonials: {
          variant: 'cards',
          title: 'Lo que dicen nuestros clientes',
          subtitle: 'Miles de compradores satisfechos avalan nuestra calidad',
          items: [
            { name: 'María García', role: 'Clienta frecuente', avatar: null, rating: 5, text: 'Excelente experiencia. El envío fue súper rápido y la calidad impecable. Definitivamente volveré a comprar.' },
            { name: 'Carlos Rodríguez', role: 'Compra recurrente', avatar: null, rating: 5, text: 'Lo mejor es la transparencia. Todo claro desde el primer momento, sin sorpresas.' },
            { name: 'Laura Martínez', role: 'Nueva clienta', avatar: null, rating: 4, text: 'Diseño increíble y atención al cliente de otro nivel. Superó mis expectativas.' },
            { name: 'Andrés López', role: 'Comprador premium', avatar: null, rating: 5, text: 'La calidad de los materiales es excepcional. Se nota que importan los detalles.' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'Suscríbete a nuestro newsletter',
          subtext: 'Ofertas exclusivas, lanzamientos y descuentos directo a tu correo.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Suscribirme',
          bg_color: '#6366f1',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
        cta: {
          variant: 'banner',
          headline: '¿Listo para tu próxima compra?',
          subtext: 'Explora nuestro catálogo completo y encuentra lo que buscas.',
          cta_primary: { label: 'Ir al catálogo', url: '/catalogo' },
          cta_secondary: { label: 'Crear cuenta', url: '/auth/register' },
        },

        gallery_feed: {
          show: true,
          title: 'Así se vive la marca',
          subtitle: 'Inspiración real de nuestra comunidad.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=85', url: '/catalogo', caption: 'Everyday essentials' },
            { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85', url: '/catalogo', caption: 'City edit' },
            { image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=85', url: '/catalogo', caption: 'Weekend mood' },
            { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=85', url: '/catalogo', caption: 'New season' },
          ],
        },
        stats: {
          show: true,
          layout: 'horizontal',
          bg_color: '#f8fafc',
          text_color: '#0f172a',
          items: [
            { value: '15K+', label: 'Clientes activos', icon: 'i-lucide-users' },
            { value: '98%', label: 'Entregas a tiempo', icon: 'i-lucide-package-check' },
            { value: '4.9/5', label: 'Experiencia de compra', icon: 'i-lucide-star' },
            { value: '30 días', label: 'Cambios sencillos', icon: 'i-lucide-refresh-cw' },
          ],
        },
      },

        categories_home: {
          variant: 'grid',
          show: true,
          title: 'Compra por estilo',
          subtitle: 'Una selección visual para encontrar tu próximo favorito.',
          layout: 'grid-3',
          card_height: '320px',
          items: [
            { image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=85', name: 'Moda', description: 'Esenciales contemporáneos', url: '/categorias/moda', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85', name: 'Lifestyle', description: 'Pequeños lujos cotidianos', url: '/categorias/lifestyle', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=85', name: 'Hogar', description: 'Diseño que transforma espacios', url: '/categorias/hogar', overlay_opacity: 0.42, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'testimonials', 'newsletter', 'cta', '_categories_home', 'gallery_feed', 'stats']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 2. LUXURY — Hero centered + categories pills + featured carousel + testimonials spotlight + CTA split
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'luxury-boutique',
    name: 'Luxury Boutique',
    description: 'Boutique premium con narrativa editorial, curaduría visual, servicio privado y una experiencia de compra aspiracional.',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-gem',
    gradient: 'from-amber-600 to-rose-600',
    sections: ['Header Video', 'Hero Centrado', 'Categorías Pills', 'Destacados Carrusel', 'Editorial Premium', 'Galería Masonry', 'Testimonios Spotlight', 'FAQ', 'CTA Split', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: null,
        headline: 'Experiencia de Lujo',
        subtext: 'Productos exclusivos para clientes exigentes',
        cta_primary: { label: 'Explorar ahora', url: '/catalogo' },
        cta_secondary: { label: 'Conocer más', url: '/nosotros' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: 'Exclusividad Premium',
          headline: 'Elegancia en Cada Detalle',
          subtext: 'Descubre nuestra colección exclusiva de productos premium seleccionados para los más exigentes.',
          cta_primary: { label: 'Ver colección', url: '/catalogo' },
          cta_secondary: { label: 'Agendar cita', url: '/cita' },
          background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '500+', label: 'Productos exclusivos' },
            { value: '98%', label: 'Clientes satisfechos' },
            { value: '24/7', label: 'Asesoría personal' },
          ],
        },
        categories: {
          variant: 'pills',
          title: 'Categorías Exclusivas',
          subtitle: 'Explora por estilo y temporada',
          show_all_link: true,
        },
        featured: {
          variant: 'carousel',
          title: 'Selección Premium',
          subtitle: 'Lo mejor de nuestra colección reservado para ti',
          show_all_link: true,
        },
        testimonials: {
          variant: 'spotlight',
          title: 'Nuestros Clientes Dicen',
          subtitle: 'La opinión de quienes conocen la diferencia',
          items: [
            { name: 'Isabella Fernández', role: 'Clienta VIP', avatar: null, rating: 5, text: 'La calidad supera cualquier expectativa. Cada pieza es una obra de arte que refleja atención al detalle.' },
            { name: 'Sebastián Morales', role: 'Coleccionista', avatar: null, rating: 5, text: 'He comprado en las mejores boutiques del mundo y esta experiencia está a la altura. Impecable.' },
            { name: 'Valentina Torres', role: 'Empresaria', avatar: null, rating: 5, text: 'El servicio personalizado es incomparable. Saben exactamente lo que necesito antes de que yo lo sepa.' },
          ],
        },
        cta: {
          variant: 'split',
          headline: 'Tu Próxima Obra Maestra Te Espera',
          subtext: 'Reserva tu cita privada con nuestro equipo de estilo y descubre piezas que no encontrarás en ningún otro lugar.',
          cta_primary: { label: 'Agendar visita privada', url: '/cita' },
          cta_secondary: { label: 'Ver catálogo completo', url: '/catalogo' },
        },

        richtext: {
          show: true,
          layout: 'split-right',
          headline: 'El lujo empieza antes de abrir la caja',
          content: '<p>Seleccionamos cada pieza por su material, acabado y carácter.</p><p>Una experiencia pensada para comprar menos, elegir mejor y disfrutar cada detalle.</p>',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=85',
          cta_label: 'Conocer nuestra curaduría',
          cta_url: '/nosotros',
          bg_color: '#faf7f2',
          text_color: '#292524',
        },
        gallery_feed: {
          show: true,
          title: 'The Luxury Edit',
          subtitle: 'Detalles, texturas y piezas que definen nuestra estética.',
          layout: 'masonry',
          items: [
            { image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=85', url: '/catalogo', caption: 'Silhouettes' },
            { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=85', url: '/catalogo', caption: 'Private selection' },
            { image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=85', url: '/catalogo', caption: 'Signature pieces' },
            { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&q=85', url: '/catalogo', caption: 'After hours' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'testimonials', 'cta', 'richtext', 'gallery_feed', ['faq', { title: 'Servicio privado, respuestas claras', subtitle: 'Todo lo que necesitas saber antes de tu compra.', items: [{ question: '¿Ofrecen asesoría personalizada?', answer: 'Sí. Nuestro equipo puede ayudarte a elegir piezas según ocasión, estilo y presupuesto.' }, { question: '¿Cómo funciona el envío premium?', answer: 'Preparamos cada pedido con embalaje protegido y seguimiento durante todo el trayecto.' }, { question: '¿Puedo solicitar un cambio?', answer: 'Sí, dispones de un periodo de cambios indicado en las condiciones de cada producto.' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 3. FLASH DEALS — Hero countdown + deals + featured carousel + urgency banner + newsletter
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'flash-deals',
    name: 'Flash Deals',
    description: 'E-commerce orientado a conversión con ofertas temporales, escasez, inventario visible y contenido visual de producto.',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-zap',
    gradient: 'from-red-600 to-orange-600',
    sections: ['Header', 'Hero Countdown', 'Ofertas', 'Countdown Oferta', 'Destacados Carrusel', 'Stock Counter', 'Urgencia Banner', 'Galería Feed', 'Newsletter', 'CTA Banner', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'countdown',
          badge: 'OFERTAS DEL DÍA',
          headline: 'Hasta 70% de Descuento',
          subtext: 'Aprovecha nuestras ofertas relámpago por tiempo limitado. ¡No te quedes sin lo tuyo!',
          cta_primary: { label: 'Comprar ahora', url: '/ofertas' },
          cta_secondary: { label: 'Ver todas las ofertas', url: '/ofertas' },
          background_image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '70%', label: 'Descuento máximo' },
            { value: '1,200+', label: 'Productos en oferta' },
            { value: '48h', label: 'Tiempo restante' },
          ],
        },
        deals: {
          badge: 'OFERTAS FLASH',
          headline: 'Ofertas Flash por Tiempo Limitado',
          subtext: 'No te pierdas nuestras mejores ofertas, solo por hoy.',
          cta_label: 'Comprar ofertas',
          show_section: true,
        },
        featured: {
          variant: 'carousel',
          title: 'Los Más Buscados en Oferta',
          subtitle: 'Los productos con descuento que están por agotarse',
          show_all_link: true,
        },
        newsletter: {
          show: true,
          headline: 'No te pierdas ninguna oferta',
          subtext: 'Recibe alertas de ofertas flash directo a tu correo y sé el primero en enterarte.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Recibir alertas',
          bg_color: '#dc2626',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
        cta: {
          variant: 'banner',
          headline: 'Las ofertas se agotan rápido',
          subtext: 'Última oportunidad de llevar lo que necesitas con descuentos increíbles.',
          cta_primary: { label: 'Ver ofertas finales', url: '/ofertas' },
          cta_secondary: null,
        },

        gallery_feed: {
          show: true,
          title: 'Ofertas que están causando furor',
          subtitle: 'Productos reales, descuentos visibles y disponibilidad actualizada.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&q=85', url: '/ofertas', caption: 'Oferta del día' },
            { image: 'https://images.unsplash.com/photo-1601598851547-4302969d5c7a?w=600&q=85', url: '/ofertas', caption: 'Últimas unidades' },
            { image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=85', url: '/ofertas', caption: 'Best sellers' },
            { image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a5e4a4?w=600&q=85', url: '/ofertas', caption: 'Precio especial' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'deals', 'featured', 'urgency_banner', 'newsletter', 'cta', ['countdown_offer', { headline: 'Flash Sale: hasta 70% OFF', subtext: 'Una selección especial con precio promocional hasta que termine el contador.', offer_end_date: '2026-12-31T23:59:59', cta_label: 'Aprovechar descuento', cta_url: '/ofertas', bg_color: '#111827', show_progress: true, stock_total: 2400, stock_sold: 1840 }], ['stock_counter', { headline: 'Los favoritos están volando', subtext: 'Compra antes de que se agoten las unidades promocionales.', stock_total: 1200, stock_sold: 914, low_stock_threshold: 180, style: 'pulse' }], 'gallery_feed']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 4. MULTI-BRAND — Hero video + categories grid + brand logos + featured large-cards + stats + CTA gradient
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'multi-brand',
    name: 'Multi-Brand',
    description: 'Marketplace visual con navegación por categorías, marcas, comparación y contenido editorial para descubrir nuevos productos.',
    category: 'ecommerce',
    categoryLabel: 'E-commerce',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-shapes',
    gradient: 'from-cyan-600 to-teal-600',
    sections: ['Header Video', 'Hero Split', 'Categorías Grid', 'Marcas', 'Galería Trending', 'Destacados Large Cards', 'Stats', 'Editorial', 'FAQ', 'CTA Gradient', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: null,
        headline: 'Multi-Brand Marketplace',
        subtext: 'Las mejores marcas en un solo lugar',
        cta_primary: { label: 'Explorar marcas', url: '/marcas' },
        cta_secondary: { label: 'Nuestras tiendas', url: '/tiendas' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Multi-Brand Marketplace',
          headline: 'Encuentra tu Marca Favorita',
          subtext: 'Las mejores marcas internacionales y nacionales convergen en una sola plataforma. Calidad garantizada.',
          cta_primary: { label: 'Explorar marcas', url: '/marcas' },
          cta_secondary: { label: 'Ver catálogo', url: '/catalogo' },
          background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '200+', label: 'Marcas disponibles' },
            { value: '50k+', label: 'Productos' },
            { value: '15', label: 'Países' },
          ],
        },
        categories: {
          variant: 'grid',
          title: 'Explora por Categoría',
          subtitle: 'Encuentra exactamente lo que buscas entre nuestras categorías',
          show_all_link: true,
        },
        brand_logos: {
          show: true,
          title: 'Marcas que Confiamos',
          items: [
            { name: 'Nike', logo: null, url: '/marcas/nike' },
            { name: 'Apple', logo: null, url: '/marcas/apple' },
            { name: 'Samsung', logo: null, url: '/marcas/samsung' },
            { name: 'Sony', logo: null, url: '/marcas/sony' },
            { name: 'Adidas', logo: null, url: '/marcas/adidas' },
            { name: 'Zara', logo: null, url: '/marcas/zara' },
          ],
          style: 'grayscale',
        },
        featured: {
          variant: 'large-cards',
          title: 'Lo Más Popular',
          subtitle: 'Los productos que están marcando tendencia esta temporada',
          show_all_link: true,
        },
        stats: {
          show: true,
          layout: 'grid-4',
          bg_color: '#0f172a',
          text_color: '#ffffff',
          items: [
            { value: '50,000+', label: 'Clientes activos', icon: 'i-lucide-users' },
            { value: '200+', label: 'Marcas premium', icon: 'i-lucide-crown' },
            { value: '4.8', label: 'Satisfacción media', icon: 'i-lucide-star' },
            { value: '24h', label: 'Envío express', icon: 'i-lucide-truck' },
          ],
        },
        cta: {
          variant: 'gradient',
          headline: 'Descubre Todo lo que Tenemos para Ti',
          subtext: 'Más de 200 marcas te esperan. Explora, compara y elige con confianza.',
          cta_primary: { label: 'Explorar marketplace', url: '/catalogo' },
          cta_secondary: { label: 'Vender en nuestra plataforma', url: '/vendedores' },
        },

        gallery_feed: {
          show: true,
          title: 'Trending Now',
          subtitle: 'Una mirada rápida a las marcas que están definiendo la temporada.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85', url: '/marcas', caption: 'Tech essentials' },
            { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85', url: '/marcas', caption: 'Performance' },
            { image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85', url: '/marcas', caption: 'Premium accessories' },
            { image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=85', url: '/marcas', caption: 'Iconic style' },
          ],
        },
        richtext: {
          show: true,
          layout: 'split-left',
          headline: 'Un marketplace pensado para comparar mejor',
          content: '<p>Reunimos marcas, categorías y estilos en una experiencia de compra coherente.</p><p>Filtra, compara y descubre alternativas sin saltar entre decenas de tiendas.</p>',
          image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&q=85',
          cta_label: 'Explorar marketplace',
          cta_url: '/catalogo',
          bg_color: '#f0fdfa',
          text_color: '#134e4a',
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'brand_logos', 'featured', 'stats', 'cta', 'gallery_feed', ['faq', { title: 'Compra entre marcas con confianza', subtitle: 'Información rápida para comparar y decidir.', items: [{ question: '¿Los productos son originales?', answer: 'Trabajamos con un catálogo curado y procesos de verificación para ofrecer productos de procedencia confiable.' }, { question: '¿Puedo comparar productos?', answer: 'Sí. Puedes revisar diferentes opciones y sus características antes de decidir.' }, { question: '¿Las garantías dependen de la marca?', answer: 'Las condiciones pueden variar según fabricante y producto; se muestran durante el proceso de compra.' }] }], 'richtext']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 5. FASHION EDITORIAL — Hero parallax + gallery feed + featured large-cards + testimonials masonry + CTA gradient
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'fashion-editorial',
    name: 'Fashion Editorial',
    description: 'Fashion store de estética editorial con narrativa visual, capítulos de colección, comunidad y captación premium.',
    category: 'moda',
    categoryLabel: 'Moda',
    difficulty: 'avanzado',
    difficultyLabel: 'Avanzado',
    icon: 'i-lucide-scissors',
    gradient: 'from-fuchsia-600 to-pink-600',
    sections: ['Header Video', 'Hero Parallax', 'Capítulos Visuales', 'Galería Feed', 'Editorial', 'Destacados Large Cards', 'Testimonios Masonry', 'Newsletter', 'CTA Gradient', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        headline: 'Fashion House',
        subtext: 'Donde el estilo encuentra su lugar',
        cta_primary: { label: 'Explorar ahora', url: '/catalogo' },
        cta_secondary: { label: 'Conocer más', url: '/nosotros' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'parallax',
          badge: 'Nueva Colección Primavera',
          headline: 'Define Tu Estilo',
          subtext: 'Moda contemporánea para espacios atrevidos. Piezas únicas que cuentan tu historia sin palabras.',
          cta_primary: { label: 'Ver colección', url: '/catalogo' },
          cta_secondary: { label: 'Agendar cita de estilo', url: '/cita' },
          background_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: 'Nueva', label: 'Colección Primavera' },
            { value: '100%', label: 'Materiales sostenibles' },
            { value: '500+', label: 'Looks inspiradores' },
          ],
        },
        gallery_feed: {
          show: true,
          title: 'Síguenos en Instagram',
          subtitle: 'Etiquétanos @fashionhouse para aparecer aquí',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', url: null, caption: 'Look del día' },
            { image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', url: null, caption: 'Street style' },
            { image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', url: null, caption: 'Nueva colección' },
            { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', url: null, caption: 'Tendencias 2026' },
          ],
        },
        featured: {
          variant: 'large-cards',
          title: 'Colección Actual',
          subtitle: 'Piezas seleccionadas por nuestros estilistas para esta temporada',
          show_all_link: true,
        },
        testimonials: {
          variant: 'masonry',
          title: 'Lo Que Dicen Nuestros Clientes',
          subtitle: 'Opiniones de quienes ya viven nuestra moda',
          items: [
            { name: 'Sofia Herrera', role: 'Influencer de moda', avatar: null, rating: 5, text: 'Cada prenda tiene una historia. La calidad del tejido y el corte son impecables. Mi marca de confianza.' },
            { name: 'Camila Vargas', role: 'Diseñadora de interiores', avatar: null, rating: 5, text: 'Me encanta que cada pieza sea única. El estilo editorial realmente se nota en cada detalle.' },
            { name: 'Daniela Ospina', role: 'Emprendedora', avatar: null, rating: 4, text: 'Ropa que transmite personalidad. Los colores y texturas son exactly lo que buscaba.' },
            { name: 'Valentina Restrepo', role: 'Fotógrafa', avatar: null, rating: 5, text: 'Perfecta para sesiones de fotos. Cada pieza es una obra de arte que quiero tener en mi clóset.' },
            { name: 'Isabella Moreno', role: 'Blogger de moda', avatar: null, rating: 5, text: 'La mejor colección que he visto este año. Diseño vanguardista con materiales de primera.' },
          ],
        },
        cta: {
          variant: 'gradient',
          headline: 'Tu Próximo Look Te Está Esperando',
          subtext: 'Explora la colección completa y encuentra las piezas que definirán tu estilo esta temporada.',
          cta_primary: { label: 'Ver colección completa', url: '/catalogo' },
          cta_secondary: { label: 'Seguir en Instagram', url: 'https://instagram.com/fashionhouse' },
        },

        richtext: {
          show: true,
          layout: 'split-left',
          headline: 'Diseñada como una revista, vivida como tu armario',
          content: '<p>Construimos cada colección alrededor de siluetas, texturas y combinaciones que funcionan juntas.</p><p>Descubre piezas pensadas para crear looks completos, no compras aisladas.</p>',
          image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1000&q=85',
          cta_label: 'Ver el lookbook',
          cta_url: '/lookbook',
          bg_color: '#18181b',
          text_color: '#ffffff',
        },
        newsletter: {
          show: true,
          headline: 'The Fashion Letter',
          subtext: 'Recibe editoriales, nuevos drops y acceso anticipado a la colección.',
          placeholder: 'Tu email',
          button_label: 'Entrar al círculo',
          bg_color: '#111111',
          text_color: '#ffffff',
          layout: 'split',
          image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=85',
        },
      },

        categories_home: {
          variant: 'grid',
          show: true,
          title: 'La colección, por capítulos',
          subtitle: 'Explora la temporada según tu estado de ánimo.',
          layout: 'grid-3',
          card_height: '380px',
          items: [
            { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85', name: 'Silhouettes', description: 'Cortes protagonistas', url: '/categorias/siluetas', overlay_opacity: 0.38, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=85', name: 'Neutrals', description: 'Paletas sofisticadas', url: '/categorias/neutros', overlay_opacity: 0.38, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=85', name: 'Statement', description: 'Piezas que hablan', url: '/categorias/statement', overlay_opacity: 0.38, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'gallery_feed', 'featured', 'testimonials', 'cta', 'richtext', '_categories_home', 'newsletter']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 6. STREETWEAR — Hero centered + categories grid + featured grid + FAQ + CTA banner
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Streetwear de drops limitados con estética urbana, señales de escasez, comunidad y contenido generado por estilo.',
    category: 'moda',
    categoryLabel: 'Moda',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-flame',
    gradient: 'from-neutral-800 to-neutral-950',
    sections: ['Header', 'Hero Centrado', 'Categorías Grid', 'Destacados Grid', 'Stock Counter', 'Urgencia Banner', 'Galería Street', 'FAQ', 'Newsletter', 'CTA Banner', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: 'DROP NUEVO',
          headline: 'STREET CULTURE',
          subtext: 'Ropa urbana para la nueva generación. Drops exclusivos, ediciones limitadas, estilo sin límites.',
          cta_primary: { label: 'Ver drop', url: '/catalogo' },
          cta_secondary: { label: 'Próximo drop', url: '/drops' },
          background_image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: 'LIMITED', label: 'Ediciones exclusivas' },
            { value: '5k+', label: 'Collectors' },
            { value: 'DROPS', label: 'Cada semana' },
          ],
        },
        categories: {
          variant: 'grid',
          title: 'Shop by Category',
          subtitle: 'Encuentra tu estilo urbano',
          show_all_link: true,
        },
        featured: {
          variant: 'grid',
          title: 'New Arrivals',
          subtitle: 'Lo que acaba de llegar — antes de que se agote',
          show_all_link: true,
        },
        newsletter: {
          show: true,
          headline: 'No te pierdas ningún drop',
          subtext: 'Únete a nuestra lista y sé el primero en enterarte de los lanzamientos exclusivos.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Unirme al crew',
          bg_color: '#18181b',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
        cta: {
          variant: 'banner',
          headline: 'El street style no espera',
          subtext: 'Los drops se agotan en minutos. Estilo urbano para quienes van primero.',
          cta_primary: { label: 'Comprar ahora', url: '/catalogo' },
          cta_secondary: null,
        },

        gallery_feed: {
          show: true,
          title: 'Seen on the streets',
          subtitle: 'La comunidad convierte cada drop en una historia diferente.',
          layout: 'masonry',
          items: [
            { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&q=85', url: '/catalogo', caption: 'Downtown' },
            { image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=700&q=85', url: '/catalogo', caption: 'New drop' },
            { image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=85', url: '/catalogo', caption: 'Street uniform' },
            { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=85', url: '/catalogo', caption: 'After dark' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'faq', 'newsletter', 'cta', ['urgency_banner', { headline: 'DROP #042 — últimas unidades', subtext: 'La cápsula actual no tendrá reposición.', cta_label: 'Ver disponibilidad', cta_url: '/catalogo', bg_color: '#18181b', text_color: '#ffffff', show_close: true }], 'gallery_feed', ['stock_counter', { headline: 'Stock del drop', subtext: 'Las piezas limitadas se actualizan en tiempo real.', stock_total: 500, stock_sold: 397, low_stock_threshold: 80, style: 'bar' }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 7. MINIMAL FASHION — Hero centered + benefits icons + featured grid + testimonials cards + CTA split
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'minimal-fashion',
    name: 'Minimal Fashion',
    description: 'Moda minimalista enfocada en esenciales, materiales, combinabilidad y una experiencia editorial sobria.',
    category: 'moda',
    categoryLabel: 'Moda',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-minus',
    gradient: 'from-stone-400 to-stone-600',
    sections: ['Header', 'Hero Centrado', 'Beneficios Icons', 'Destacados Grid', 'Editorial', 'Galería Minimal', 'Testimonios Cards', 'FAQ', 'CTA Split', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: null,
          headline: 'Less is More',
          subtext: 'Moda esencial para tu día a día. Piezas atemporales que combinan con todo y duran temporadas.',
          cta_primary: { label: 'Descubrir esenciales', url: '/catalogo' },
          cta_secondary: { label: 'Nuestra filosofía', url: '/nosotros' },
          background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '100%', label: 'Algodón orgánico' },
            { value: '30+', label: 'Piezas esenciales' },
            { value: '0', label: 'Excesos' },
          ],
        },
        benefits: {
          variant: 'icons',
          title: 'Filosofía Minimal',
          subtitle: 'Menos pero mejor — cada pieza tiene un propósito',
          items: [
            { icon: 'i-lucide-leaf', title: 'Sostenibilidad', description: 'Materiales orgánicos y procesos responsables con el medio ambiente.' },
            { icon: 'i-lucide-gem', title: 'Calidad superior', description: 'Telas premium que mantienen su forma y color lavado tras lavado.' },
            { icon: 'i-lucide-infinity', title: 'Diseño atemporal', description: 'Piezas que no pasan de moda, combinables en cualquier temporada.' },
            { icon: 'i-lucide-heart', title: 'Hecho con amor', description: 'Cada prenda confeccionada con atención al detalle y amor por el oficio.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Selección Editada',
          subtitle: 'Pocas piezas, gran impacto — lo esencial para tu clóset',
          show_all_link: true,
        },
        testimonials: {
          variant: 'cards',
          title: 'Opiniones Reales',
          subtitle: 'Lo que dicen quienes adoptaron el minimalismo',
          items: [
            { name: 'Ana Sofía Ramírez', role: 'Arquitecta', avatar: null, rating: 5, text: 'Finalmente ropa que combina con todo. La calidad se nota al instante. Mi clóset ahora tiene sentido.' },
            { name: 'Laura Castaño', role: 'Diseñadora gráfica', avatar: null, rating: 5, text: 'Menos pero mejor. Cada pieza es perfecta. No necesito más para sentirme bien.' },
            { name: 'Mariana Ossa', role: 'Emprendedora', avatar: null, rating: 5, text: 'La tela es increíble, los colores neutros son perfectos. Ropa que dura años, no semanas.' },
          ],
        },
        cta: {
          variant: 'split',
          headline: 'Simplifica Tu Estilo',
          subtext: 'Descubre que menos puede ser mucho más. Una colección editada para quienes valoran la esencia.',
          cta_primary: { label: 'Ver esenciales', url: '/catalogo' },
          cta_secondary: { label: 'Nuestra filosofía', url: '/nosotros' },
        },

        richtext: {
          show: true,
          layout: 'split-right',
          headline: 'Un armario construido con intención',
          content: '<p>Diseñamos una colección pequeña para que cada pieza pueda convivir con las demás.</p><p>Colores neutros, cortes limpios y materiales elegidos para acompañarte durante años.</p>',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=85',
          cta_label: 'Leer nuestra filosofía',
          cta_url: '/nosotros',
          bg_color: '#f5f5f4',
          text_color: '#292524',
        },
        gallery_feed: {
          show: true,
          title: 'Minimalismo en movimiento',
          subtitle: 'Texturas, capas y detalles de nuestra comunidad.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85', url: '/catalogo', caption: 'Layering' },
            { image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=85', url: '/catalogo', caption: 'Neutral tones' },
            { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=85', url: '/catalogo', caption: 'Everyday' },
            { image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=85', url: '/catalogo', caption: 'Quiet luxury' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'testimonials', 'cta', 'richtext', 'gallery_feed', ['faq', { title: 'Preguntas antes de elegir', subtitle: 'Guía rápida para comprar tus esenciales.', items: [{ question: '¿Cómo elegir mi talla?', answer: 'Consulta la guía de tallas de cada producto y compara las medidas con una prenda que ya te quede bien.' }, { question: '¿Los colores son combinables?', answer: 'La colección está construida alrededor de una paleta neutra para facilitar múltiples combinaciones.' }, { question: '¿Cómo cuidan los materiales?', answer: 'Cada producto incluye recomendaciones específicas de lavado y cuidado para prolongar su vida útil.' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 8. GOURMET RESTAURANT — Hero split + categories carousel + featured grid + richtext + map + CTA split
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gourmet-restaurant',
    name: 'Gourmet Restaurant',
    description: 'Experiencia gourmet digital que combina catálogo, narrativa gastronómica, ubicación, reservas y contenido visual.',
    category: 'gourmet',
    categoryLabel: 'Gourmet',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-utensils',
    gradient: 'from-amber-700 to-amber-900',
    sections: ['Header Video', 'Hero Split', 'Categorías Carousel', 'Destacados Grid', 'Texto Enriquecido', 'Galería Gastronómica', 'Mapa', 'Newsletter', 'Urgencia', 'CTA Split', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: null,
        headline: 'Gourmet Experience',
        subtext: 'Los mejores sabores en tu mesa',
        cta_primary: { label: 'Reservar mesa', url: '/reservas' },
        cta_secondary: { label: 'Ver menú', url: '/menu' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Menú Especial Temporada',
          headline: 'Sabor que enamora',
          subtext: 'Descubre nuestra selección de platos gourmet preparados con ingredientes frescos de origen local por nuestro chef estrella.',
          cta_primary: { label: 'Reservar mesa', url: '/reservas' },
          cta_secondary: { label: 'Ver menú completo', url: '/menu' },
          background_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '★★★', label: 'Estrellas Michelin' },
            { value: '25+', label: 'Años de experiencia' },
            { value: '100%', label: 'Ingredientes frescos' },
          ],
        },
        categories: {
          variant: 'carousel',
          title: 'Nuestros Menús',
          subtitle: 'Explora por tipo de experiencia gastronómica',
          show_all_link: true,
        },
        featured: {
          variant: 'grid',
          title: 'Platos Destacados',
          subtitle: 'Los favoritos de nuestros comensales esta temporada',
          show_all_link: true,
        },
        richtext: {
          show: true,
          layout: 'split-left',
          headline: 'Nuestra Cocina',
          content: 'Utilizamos ingredientes de origen local y técnicas tradicionales reinventadas para crear experiencias gastronómicas únicas. Cada plato cuenta una historia, cada sabor evoca un recuerdo. Nuestro chef ejecutivo combina la tradición culinaria con la innovación para sorprender en cada bocado.',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
          cta_label: 'Conocer al chef',
          cta_url: '/nosotros',
          bg_color: null,
          text_color: null,
        },
        map: {
          show: true,
          headline: 'Encuéntranos',
          subtext: 'Ven a visitarnos y vive la experiencia completa',
          address: 'Calle Gourmet #45-67, Zona Rosa, Bogotá',
          latitude: 4.672,
          longitude: -74.057,
          phone: '+57 300 123 4567',
          hours: 'Mar - Dom: 12:00 - 23:00',
          map_style: 'standard',
        },
        cta: {
          variant: 'split',
          headline: 'Reserva Tu Experiencia',
          subtext: 'Cada visita es una nueva aventura gastronómica. Reserva hoy y déjate sorprender.',
          cta_primary: { label: 'Reservar ahora', url: '/reservas' },
          cta_secondary: { label: 'Ver eventos privados', url: '/eventos' },
        },

        gallery_feed: {
          show: true,
          title: 'Una experiencia para todos los sentidos',
          subtitle: 'Platos, ingredientes y momentos capturados en nuestra cocina.',
          layout: 'masonry',
          items: [
            { image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=85', url: '/catalogo', caption: 'Signature dish' },
            { image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=85', url: '/nosotros', caption: 'The dining room' },
            { image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=700&q=85', url: '/catalogo', caption: 'Fresh ingredients' },
            { image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=700&q=85', url: '/reservas', caption: 'Dinner moments' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'La mesa tiene novedades',
          subtext: 'Recibe nuevos menús, experiencias especiales y fechas de eventos.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Quiero enterarme',
          bg_color: '#451a03',
          text_color: '#ffffff',
          layout: 'split',
          image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900&q=85',
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'richtext', 'map', 'cta', 'gallery_feed', 'newsletter', ['urgency_banner', { headline: 'Esta semana: menú de temporada', subtext: 'Cupos limitados para la experiencia de degustación.', cta_label: 'Reservar mesa', cta_url: '/reservas', bg_color: '#78350f', text_color: '#ffffff', show_close: false }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 9. COFFEE SHOP — Hero centered + benefits icons + featured grid + timeline + map + CTA banner
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'coffee-shop',
    name: 'Coffee Shop',
    description: 'Coffee shop cálido con descubrimiento por perfil de café, proceso de origen, productos y comunidad.',
    category: 'gourmet',
    categoryLabel: 'Gourmet',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-coffee',
    gradient: 'from-orange-700 to-yellow-800',
    sections: ['Header', 'Hero Centrado', 'Categorías Visuales', 'Beneficios Icons', 'Destacados Grid', 'Timeline', 'Galería de Origen', 'Mapa', 'Newsletter', 'CTA Banner', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: 'Recién hecho cada mañana',
          headline: 'Tu Taza Favorita Te Espera',
          subtext: 'Café de origen premium tostado artesanalmente. De la finca a tu taza, sin intermediarios.',
          cta_primary: { label: 'Ordenar ahora', url: '/catalogo' },
          cta_secondary: { label: 'Nuestros granos', url: '/granos' },
          background_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '100%', label: 'Café de origen' },
            { value: '12+', label: 'Variedades de grano' },
            { value: '4.9', label: 'Valoración media' },
          ],
        },
        benefits: {
          variant: 'icons',
          title: '¿Por qué nuestro café?',
          subtitle: 'Calidad que se nota en cada sorbo',
          items: [
            { icon: 'i-lucide-leaf', title: 'Origen directo', description: 'Compramos directamente a productores y pagamos precios justos.' },
            { icon: 'i-lucide-flame', title: 'Tueste artesanal', description: 'Cada lote se tuesta en small batch para máximo sabor y frescura.' },
            { icon: 'i-lucide-droplets', title: 'Notas únicas', description: 'Cada origen tiene notas de sabor únicas: frutas, chocolate, nueces.' },
            { icon: 'i-lucide-truck', title: 'Envío fresco', description: 'Tostamos y enviamos en 24 horas para que llegue en su punto máximo.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Nuestros Favoritos',
          subtitle: 'Cafés seleccionados para los paladares más exigentes',
          show_all_link: true,
        },
        map: {
          show: true,
          headline: 'Visítanos',
          subtext: 'Ven a disfrutar de una taza en nuestra cafetería',
          address: 'Calle del Café #12-34, Chapinero, Bogotá',
          latitude: 4.662,
          longitude: -74.052,
          phone: '+57 300 987 6543',
          hours: 'Lun - Vie: 7:00 - 20:00, Sáb - Dom: 8:00 - 18:00',
          map_style: 'standard',
        },
        cta: {
          variant: 'banner',
          headline: '¿Listo para tu próxima taza?',
          subtext: 'Prueba nuestro café premium y descubre por qué nuestros clientes vuelven siempre.',
          cta_primary: { label: 'Ordenar café', url: '/catalogo' },
          cta_secondary: { label: 'Visitar tienda', url: '/tiendas' },
        },

        gallery_feed: {
          show: true,
          title: 'De la finca a tu taza',
          subtitle: 'Conoce los lugares y momentos detrás de cada café.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=85', url: '/nosotros', caption: 'Origen' },
            { image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=85', url: '/catalogo', caption: 'Tostión' },
            { image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=85', url: '/catalogo', caption: 'Barra' },
            { image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=85', url: '/catalogo', caption: 'Slow mornings' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'Café, recetas y nuevos orígenes',
          subtext: 'Una carta mensual con lanzamientos, preparación y beneficios para suscriptores.',
          placeholder: 'Tu correo',
          button_label: 'Suscribirme',
          bg_color: '#422006',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
      },

        categories_home: {
          variant: 'carousel',
          show: true,
          title: 'Encuentra tu perfil de café',
          subtitle: 'Desde tu espresso de todos los días hasta microlotes especiales.',
          layout: 'grid-3',
          card_height: '300px',
          items: [
            { image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=85', name: 'Espresso', description: 'Intenso y clásico', url: '/categorias/espresso', overlay_opacity: 0.45, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=85', name: 'Filtrados', description: 'Notas limpias y florales', url: '/categorias/filtrados', overlay_opacity: 0.45, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85', name: 'Accesorios', description: 'Prepara mejor en casa', url: '/categorias/accesorios', overlay_opacity: 0.45, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'timeline', 'map', 'cta', '_categories_home', 'gallery_feed', 'newsletter']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 10. BAKERY — Hero split + categories pills + featured carousel + benefits steps + newsletter
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Panadería artesanal con catálogo visual, storytelling del proceso, productos frescos y visita física.',
    category: 'gourmet',
    categoryLabel: 'Gourmet',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-cake',
    gradient: 'from-pink-600 to-rose-700',
    sections: ['Header', 'Hero Split', 'Categorías Pills', 'Destacados Carrusel', 'Beneficios Steps', 'Storytelling', 'Galería Feed', 'Mapa', 'Newsletter', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Artesanal desde 1985',
          headline: 'Hecho con Amor',
          subtext: 'Panadería artesanal con recetas de familia. Cada pieza horneada con ingredientes naturales y mucho amor.',
          cta_primary: { label: 'Ver productos', url: '/catalogo' },
          cta_secondary: { label: 'Hacer un pedido', url: '/pedidos' },
          background_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '38', label: 'Años de tradición' },
            { value: '100%', label: 'Ingredientes naturales' },
            { value: '50+', label: 'Variedades diarias' },
          ],
        },
        categories: {
          variant: 'pills',
          title: 'Nuestras Especialidades',
          subtitle: 'Elige tu favorita y déjante consentir',
          show_all_link: true,
        },
        featured: {
          variant: 'carousel',
          title: 'Lo Más Pedido',
          subtitle: 'Nuestros productos estrella que enamoran paladares',
          show_all_link: true,
        },
        benefits: {
          variant: 'steps',
          title: 'Del Horno a Tu Mesa',
          subtitle: 'Así preparamos cada pieza con dedicación y cariño',
          items: [
            { icon: 'i-lucide-wheat', title: 'Seleccionamos ingredientes', description: 'Solo usamos harina premium, mantequilla de primera y frutas frescas.' },
            { icon: 'i-lucide-hand', title: 'Amasamos a mano', description: 'Cada masa se amasa artesanalmente para lograr la textura perfecta.' },
            { icon: 'i-lucide-flame', title: 'Horneamos con paciencia', description: 'Tiempo perfecto, temperatura ideal. Ni un segundo de más.' },
            { icon: 'i-lucide-heart', title: 'Decoramos con amor', description: 'Cada pieza es una obra de arte comestible que enamora a la vista.' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'Recibe recetas y ofertas',
          subtext: 'Suscríbete para recibir recetas exclusivas, ofertas especiales y noticias de nuestra panadería.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Suscribirme',
          bg_color: '#ec4899',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },

        richtext: {
          show: true,
          layout: 'split-left',
          headline: 'Hecho a mano, horneado cada día',
          content: '<p>Trabajamos masas, fermentaciones y rellenos en pequeñas tandas para conservar textura y frescura.</p><p>Lo que llega a tu mesa comienza mucho antes de abrir la vitrina.</p>',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=85',
          cta_label: 'Conocer nuestro proceso',
          cta_url: '/nosotros',
          bg_color: '#fff7ed',
          text_color: '#7c2d12',
        },
        gallery_feed: {
          show: true,
          title: 'Recién salido del horno',
          subtitle: 'Así se ve una mañana en nuestra panadería.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=85', url: '/catalogo', caption: 'Pan artesanal' },
            { image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', url: '/catalogo', caption: 'Croissants' },
            { image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=85', url: '/catalogo', caption: 'Pastelería' },
            { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85', url: '/catalogo', caption: 'Horneado diario' },
          ],
        },
        map: {
          show: true,
          headline: 'Pasa por algo recién horneado',
          subtext: 'Encuentra nuestra tienda y consulta horarios antes de venir.',
          address: 'Carrera 15 #82-20, Bogotá',
          latitude: 4.668,
          longitude: -74.055,
          phone: '+57 300 456 7890',
          hours: 'Lun - Sáb: 7:00 - 20:00',
          map_style: 'standard',
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'benefits', 'newsletter', 'richtext', 'gallery_feed', 'map']),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 11. TECH STORE — Hero split + benefits steps + featured grid + testimonials cards + blog grid + CTA gradient
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'tech-store',
    name: 'Tech Store',
    description: 'Tienda tecnológica orientada a decisión de compra, comparación, soporte, categorías y lanzamientos.',
    category: 'tecnologia',
    categoryLabel: 'Tecnología',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-cpu',
    gradient: 'from-blue-600 to-indigo-700',
    sections: ['Header Video', 'Hero Split', 'Categorías Visuales', 'Beneficios Steps', 'Destacados Grid', 'Testimonios Cards', 'Blog Grid', 'Urgencia', 'FAQ', 'CTA Gradient', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: null,
        headline: 'TechZone',
        subtext: 'La tecnología que necesitas',
        cta_primary: { label: 'Explorar tienda', url: '/catalogo' },
        cta_secondary: { label: 'Soporte técnico', url: '/soporte' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Nuevo Lanzamiento 2026',
          headline: 'Innovación sin Límites',
          subtext: 'Descubre la tecnología del futuro hoy. Los dispositivos más potentes y las.specs más impresionantes del mercado.',
          cta_primary: { label: 'Ver novedades', url: '/catalogo' },
          cta_secondary: { label: 'Comparar productos', url: '/comparar' },
          background_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '500+', label: 'Productos tech' },
            { value: '24h', label: 'Envío express' },
            { value: '2 años', label: 'Garantía extendida' },
          ],
        },
        benefits: {
          variant: 'steps',
          title: '¿Por qué TechZone?',
          subtitle: 'Tu tienda de confianza en tecnología — de la compra al soporte',
          items: [
            { icon: 'i-lucide-zap', title: 'Los specs más recientes', description: 'Siempre con la tecnología más actualizada del mercado.' },
            { icon: 'i-lucide-shield-check', title: 'Garantía extendida', description: '2 años de garantía en todos los productos con soporte técnico dedicado.' },
            { icon: 'i-lucide-truck', title: 'Envío express 24h', description: 'Recibe tu producto en menos de 24 horas en ciudades principales.' },
            { icon: 'i-lucide-headphones', title: 'Soporte técnico experto', description: 'Equipo de especialistas que resuelve cualquier duda técnica.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Lo Más Vendido',
          subtitle: 'Los productos tech con las mejores reseñas de expertos',
          show_all_link: true,
        },
        testimonials: {
          variant: 'cards',
          title: 'Opiniones de Expertos',
          subtitle: 'Lo que dicen los reviewers tech sobre nuestros productos',
          items: [
            { name: 'Roberto Sánchez', role: 'Reviewer Tech', avatar: null, rating: 5, text: 'La gama de productos es impresionante. Siempre encuentro lo último antes que en cualquier otro lado.' },
            { name: 'Patricia León', role: 'Ingeniera de software', avatar: null, rating: 5, text: 'El soporte post-venta es excepcional. Me ayudaron a configurar todo sin ningún problema.' },
            { name: 'Miguel Ángel Torres', role: 'Fotógrafo profesional', avatar: null, rating: 4, text: 'Precios competitivos y garantía real. He comprado 5 productos y todos impecables.' },
          ],
        },
        cta: {
          variant: 'gradient',
          headline: 'La Próxima Actualización Te Espera',
          subtext: 'No te quedes con lo viejo. Actualiza tu setup con la tecnología más reciente.',
          cta_primary: { label: 'Ver catálogo completo', url: '/catalogo' },
          cta_secondary: { label: 'Recibir ofertas tech', url: '/newsletter' },
        },

      },

        categories_home: {
          variant: 'grid',
          show: true,
          title: 'Explora el ecosistema',
          subtitle: 'Encuentra tecnología según la forma en que la utilizas.',
          layout: 'grid-3',
          card_height: '300px',
          items: [
            { image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85', name: 'Computación', description: 'Potencia para crear', url: '/categorias/computacion', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85', name: 'Mobile', description: 'Tecnología que te acompaña', url: '/categorias/mobile', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&q=85', name: 'Smart Home', description: 'Tu espacio, más inteligente', url: '/categorias/smart-home', overlay_opacity: 0.42, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'testimonials', 'blog_grid', 'cta', '_categories_home', ['urgency_banner', { headline: 'Lanzamiento exclusivo: unidades limitadas', subtext: 'Reserva antes de que el nuevo dispositivo llegue a stock general.', cta_label: 'Ver lanzamiento', cta_url: '/catalogo', bg_color: '#172554', text_color: '#ffffff', show_close: true }], ['faq', { title: 'Antes de comprar tecnología', subtitle: 'Resolvemos las preguntas que realmente importan.', items: [{ question: '¿Cómo elegir el equipo correcto?', answer: 'Compara rendimiento, compatibilidad, autonomía y el uso principal que tendrás para encontrar el modelo adecuado.' }, { question: '¿Incluyen garantía?', answer: 'Los productos cuentan con las condiciones de garantía indicadas en su ficha y según el fabricante.' }, { question: '¿Ofrecen soporte después de la compra?', answer: 'Sí. Nuestro equipo puede orientarte con configuración, compatibilidad y dudas de uso.' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 12. GADGET LAB — Hero centered + categories grid + featured carousel + FAQ + newsletter + CTA banner
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gadget-lab',
    name: 'Gadget Lab',
    description: 'Laboratorio de gadgets con descubrimiento visual, métricas de confianza, disponibilidad y contenido práctico.',
    category: 'tecnologia',
    categoryLabel: 'Tecnología',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-smartphone',
    gradient: 'from-violet-600 to-purple-700',
    sections: ['Header', 'Hero Centrado', 'Categorías Grid', 'Destacados Carrusel', 'Galería Gadgets', 'Stats', 'Stock Counter', 'FAQ', 'Newsletter', 'CTA Banner', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: 'Smart Devices',
          headline: 'Tu Mundo Conectado',
          subtext: 'Gadgets inteligentes para simplificar tu vida. De la Smart Home a los wearables, todo lo que necesitas.',
          cta_primary: { label: 'Explorar gadgets', url: '/catalogo' },
          cta_secondary: { label: 'Guía de compra', url: '/guia' },
          background_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '300+', label: 'Gadgets disponibles' },
            { value: '4.8', label: 'Satisfacción media' },
            { value: '48h', label: 'Envío gratis' },
          ],
        },
        categories: {
          variant: 'grid',
          title: 'Explora por Categoría',
          subtitle: 'Smartphones, wearables, smart home y más',
          show_all_link: true,
        },
        featured: {
          variant: 'carousel',
          title: 'Top Gadgets',
          subtitle: 'Los más populares de la semana — votados por la comunidad',
          show_all_link: true,
        },
        newsletter: {
          show: true,
          headline: 'Reviews y ofertas tech',
          subtext: 'Recibe las reviews más recientes y ofertas exclusivas de gadgets directo a tu correo.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Suscribirme',
          bg_color: '#7c3aed',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
        cta: {
          variant: 'banner',
          headline: 'Haz tu vida más inteligente',
          subtext: 'Los gadgets que necesitas para automatizar y mejorar cada aspecto de tu día.',
          cta_primary: { label: 'Comprar gadgets', url: '/catalogo' },
          cta_secondary: { label: 'Ver guía Smart Home', url: '/guia-smart-home' },
        },

        gallery_feed: {
          show: true,
          title: 'Gadgets en la vida real',
          subtitle: 'Pequeños dispositivos que hacen grandes diferencias.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85', url: '/catalogo', caption: 'Wearables' },
            { image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&q=85', url: '/catalogo', caption: 'Desk setup' },
            { image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=85', url: '/catalogo', caption: 'Retro tech' },
            { image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=85', url: '/catalogo', caption: 'Connected life' },
          ],
        },
        stats: {
          show: true,
          layout: 'grid-4',
          bg_color: '#faf5ff',
          text_color: '#581c87',
          items: [
            { value: '300+', label: 'Gadgets disponibles', icon: 'i-lucide-cpu' },
            { value: '4.8/5', label: 'Valoración media', icon: 'i-lucide-star' },
            { value: '24h', label: 'Despacho rápido', icon: 'i-lucide-zap' },
            { value: '2 años', label: 'Garantía seleccionada', icon: 'i-lucide-shield-check' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'faq', 'newsletter', 'cta', 'gallery_feed', 'stats', ['stock_counter', { headline: 'Gadgets más buscados', subtext: 'Los productos destacados pueden agotarse rápidamente.', stock_total: 850, stock_sold: 673, low_stock_threshold: 120, style: 'badge' }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 13. SPORTS STORE — Hero split + categories grid + benefits cards + featured carousel + testimonials masonry + CTA split
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'sports-store',
    name: 'Sports Store',
    description: 'Tienda deportiva centrada en rendimiento, disciplinas, promociones de temporada y contenido de entrenamiento.',
    category: 'deportes',
    categoryLabel: 'Deportes',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-dumbbell',
    gradient: 'from-green-600 to-emerald-700',
    sections: ['Header', 'Hero Split', 'Categorías Grid', 'Beneficios Cards', 'Countdown Oferta', 'Destacados Carrusel', 'Galería Training', 'Testimonios Masonry', 'FAQ', 'CTA Split', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Temporada Alta',
          headline: 'Rendimiento Máximo',
          subtext: 'Equípate con lo mejor para alcanzar tus metas deportivas. Desde corredores hasta levantadores de pesas.',
          cta_primary: { label: 'Ver equipamiento', url: '/catalogo' },
          cta_secondary: { label: 'Guía de entrenamiento', url: '/guias' },
          background_image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '10k+', label: 'Atletas equipados' },
            { value: '50+', label: 'Marcas deportivas' },
            { value: '24h', label: 'Envío express' },
          ],
        },
        categories: {
          variant: 'grid',
          title: 'Shop by Sport',
          subtitle: 'Encuentra el equipamiento perfecto para tu disciplina',
          show_all_link: true,
        },
        benefits: {
          variant: 'cards',
          title: 'Ventajas Exclusivas',
          subtitle: '¿Por qué comprar con nosotros? Porque tu rendimiento nos importa',
          items: [
            { icon: 'i-lucide-zap', title: 'Asesoría deportiva', description: 'Te ayudamos a elegir el equipamiento ideal para tu disciplina y nivel.' },
            { icon: 'i-lucide-truck', title: 'Envío prioritario', description: 'Entrega rápida para que no pares tu entrenamiento ni un día.' },
            { icon: 'i-lucide-shield-check', title: 'Garantía de rendimiento', description: 'Si el producto no cumple, lo cambiamos sin preguntas en 30 días.' },
            { icon: 'i-lucide-trophy', title: 'Club de atletas', description: 'Acceso a descuentos exclusivos, eventos y contenido premium.' },
          ],
        },
        featured: {
          variant: 'carousel',
          title: 'Más Vendidos',
          subtitle: 'Los favoritos de los atletas más exigentes',
          show_all_link: true,
        },
        testimonials: {
          variant: 'masonry',
          title: 'Atletas que Confían en Nosotros',
          subtitle: 'De principiantes a profesionales, todos eligen nuestra tienda',
          items: [
            { name: 'Juan David Pérez', role: 'Maratonista', avatar: null, rating: 5, text: 'LosTenis que compré superaron mis expectativas. Marqué mi mejor tiempo personal gracias al equipamiento correcto.' },
            { name: 'Natalia Gómez', role: 'Crossfitera', avatar: null, rating: 5, text: 'La variedad de equipamiento para crossfit es increíble. Todo de primera calidad.' },
            { name: 'Andrés Felipe Moreno', role: 'Ciclista profesional', avatar: null, rating: 5, text: 'Ropa técnica que aguanta los entrenamientos más duros. El mejor sitio para ciclistas serios.' },
            { name: 'Carolina Ríos', role: 'Yogui certificada', avatar: null, rating: 4, text: 'Accesorios de yoga de alta calidad. Las esterillas y bloques son perfectos.' },
          ],
        },
        cta: {
          variant: 'split',
          headline: 'Supera Tus Límites',
          subtext: 'Con el equipamiento adecuado, no hay meta que no puedas alcanzar. Equipa tu pasión.',
          cta_primary: { label: 'Comprar ahora', url: '/catalogo' },
          cta_secondary: { label: 'Guía de entrenamiento', url: '/guias' },
        },

        gallery_feed: {
          show: true,
          title: 'Train. Move. Repeat.',
          subtitle: 'Equipamiento probado en movimiento, no solo en una estantería.',
          layout: 'masonry',
          items: [
            { image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=85', url: '/catalogo', caption: 'Strength' },
            { image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=85', url: '/catalogo', caption: 'Training' },
            { image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=85', url: '/catalogo', caption: 'Running' },
            { image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d7a6?w=700&q=85', url: '/catalogo', caption: 'Recovery' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'categories', 'benefits', 'featured', 'testimonials', 'cta', ['countdown_offer', { headline: 'Training Week: -25% en equipamiento', subtext: 'Activa tu temporada con precios especiales en productos seleccionados.', offer_end_date: '2026-11-30T23:59:59', cta_label: 'Equiparme ahora', cta_url: '/ofertas', bg_color: '#052e16', show_progress: true, stock_total: 1000, stock_sold: 620 }], 'gallery_feed', ['faq', { title: 'Tu equipo, bien elegido', subtitle: 'Respuestas rápidas para comprar según tu disciplina.', items: [{ question: '¿Qué equipo necesito para empezar?', answer: 'Depende de tu disciplina, nivel y objetivo. Las categorías están organizadas para facilitar esa decisión.' }, { question: '¿Puedo cambiar una talla?', answer: 'Consulta las condiciones de cambio de cada producto antes de finalizar tu compra.' }, { question: '¿Tienen productos para entrenamiento en casa?', answer: 'Sí. Disponemos de opciones para fuerza, cardio, movilidad y recuperación en espacios reducidos.' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 14. FITNESS HUB — Hero countdown + benefits icons + featured grid + testimonials spotlight + newsletter + CTA gradient
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'fitness-hub',
    name: 'Fitness Hub',
    description: 'Hub fitness orientado a objetivos con categorías por entrenamiento, progreso, disponibilidad y comunidad.',
    category: 'deportes',
    categoryLabel: 'Deportes',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-heart-pulse',
    gradient: 'from-red-500 to-rose-600',
    sections: ['Header Video', 'Hero Countdown', 'Objetivos Visuales', 'Beneficios Icons', 'Destacados Grid', 'Stock Counter', 'Timeline', 'Testimonios Spotlight', 'Newsletter', 'CTA Gradient', 'Footer'],
    sectionCount: 11,
    config: createTemplateConfig({
      header: {
        variant: 'video',
        show: true,
        background_image: null,
        headline: 'FitLife',
        subtext: 'Tu cuerpo merece lo mejor',
        cta_primary: { label: 'Empezar ahora', url: '/catalogo' },
        cta_secondary: { label: 'Ver planes', url: '/planes' },
        overlay_color: '#000000',
        overlay_opacity: 0.4,
        animation: 'fade',
        text_align: 'center',
        height: '80vh',
      },
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'countdown',
          badge: 'Entrena Duro',
          headline: 'Transforma Tu Cuerpo',
          subtext: 'Suplementos y equipamiento de alto rendimiento para quienes buscan resultados reales. Oferta por tiempo limitado.',
          cta_primary: { label: 'Comprar suplementos', url: '/catalogo' },
          cta_secondary: { label: 'Ver rutinas', url: '/rutinas' },
          background_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '50%', label: 'Descuento especial' },
            { value: '200+', label: 'Productos fitness' },
            { value: '15k+', label: 'Atletas activos' },
          ],
        },
        benefits: {
          variant: 'icons',
          title: 'Elige FitLife',
          subtitle: 'Resultados que hablan por sí solos — tu transformación empieza aquí',
          items: [
            { icon: 'i-lucide-dumbbell', title: 'Equipamiento premium', description: 'Marcas reconocidas mundialmente por su calidad y durabilidad.' },
            { icon: 'i-lucide-flask-conical', title: 'Suplementos certificados', description: 'Todos nuestros suplementos están certificados y probados en laboratorio.' },
            { icon: 'i-lucide-video', title: 'Rutinas gratis', description: 'Accede a rutinas de entrenamiento creadas por expertos en fitness.' },
            { icon: 'i-lucide-users', title: 'Comunidad FitLife', description: 'Únete a miles de atletas que comparten sus progresos y motivación.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Top Supplementos',
          subtitle: 'Lo que los atletas profesionales eligen para maximizar su rendimiento',
          show_all_link: true,
        },
        testimonials: {
          variant: 'spotlight',
          title: 'Transformaciones Reales',
          subtitle: 'Historias reales de personas que cambiaron su vida con FitLife',
          items: [
            { name: 'Diego Alejandro Muñoz', role: 'Entrenador personal', avatar: null, rating: 5, text: 'Llevo 3 años usando sus suplementos y la diferencia es notable. Mis clientes siempre preguntan qué uso.' },
            { name: 'Laura Sofía Ramírez', role: 'Competidora de fitness', avatar: null, rating: 5, text: 'La calidad de los suplementos me dio el impulso que necesitaba para competir en nivel nacional.' },
            { name: 'Santiago Herrera', role: 'Deportista amateur', avatar: null, rating: 5, text: 'Empecé de cero y en 6 meses logré una transformación increíble. El soporte y productos son top.' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'Tips de fitness y ofertas',
          subtext: 'Recibe rutinas semanales, consejos de nutrición y ofertas exclusivas.',
          placeholder: 'Tu correo electrónico',
          button_label: 'Unirme',
          bg_color: '#ef4444',
          text_color: '#ffffff',
          layout: 'centered',
          image: null,
        },
        cta: {
          variant: 'gradient',
          headline: 'Tu Transformación Empieza Hoy',
          subtext: 'No esperes al lunes. El mejor momento para empezar es ahora.',
          cta_primary: { label: 'Empezar ahora', url: '/catalogo' },
          cta_secondary: { label: 'Ver plan de entrenamiento', url: '/planes' },
        },
      },

        categories_home: {
          variant: 'grid',
          show: true,
          title: 'Entrena según tu objetivo',
          subtitle: 'Encuentra productos pensados para cada etapa de tu rutina.',
          layout: 'grid-3',
          card_height: '320px',
          items: [
            { image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=85', name: 'Fuerza', description: 'Construye potencia', url: '/categorias/fuerza', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=85', name: 'Cardio', description: 'Muévete más lejos', url: '/categorias/cardio', overlay_opacity: 0.42, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85', name: 'Recovery', description: 'Recupera mejor', url: '/categorias/recovery', overlay_opacity: 0.42, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'testimonials', 'newsletter', 'cta', '_categories_home', ['stock_counter', { headline: 'Equipamiento de la semana', subtext: 'Productos con alta demanda y despacho prioritario.', stock_total: 700, stock_sold: 541, low_stock_threshold: 100, style: 'pulse' }], ['timeline', { title: 'Tu progreso empieza aquí', subtitle: 'Una experiencia de compra pensada alrededor de tu entrenamiento.', items: [{ year: '01', title: 'Elige tu objetivo', description: 'Define qué quieres mejorar y descubre una selección relevante.', icon: 'i-lucide-target', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=85' }, { year: '02', title: 'Equípate', description: 'Compara productos y elige el equipo que mejor encaje contigo.', icon: 'i-lucide-shopping-bag', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=85' }, { year: '03', title: 'Empieza a moverte', description: 'Recibe tu pedido y convierte la intención en una rutina real.', icon: 'i-lucide-activity', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d7a6?w=700&q=85' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 15. MINIMAL CLEAN — Hero centered + benefits icons + featured grid + testimonials cards + CTA banner
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Template universal de estética limpia con navegación sencilla, contenido editorial, confianza y descubrimiento visual.',
    category: 'general',
    categoryLabel: 'General',
    difficulty: 'basico',
    difficultyLabel: 'Básico',
    icon: 'i-lucide-layout-template',
    gradient: 'from-slate-500 to-slate-700',
    sections: ['Header', 'Hero Centrado', 'Beneficios Icons', 'Destacados Grid', 'Editorial', 'Galería Clean', 'Testimonios Cards', 'FAQ', 'CTA Banner', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'centered',
          badge: null,
          headline: 'Bienvenido a Tu Tienda',
          subtext: 'Productos curados con cuidado, envío rápido y una experiencia de compra tan limpia como nuestro diseño.',
          cta_primary: { label: 'Explorar catálogo', url: '/catalogo' },
          cta_secondary: { label: 'Conocer más', url: '/nosotros' },
          background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '4.9', label: 'Valoración media' },
            { value: '12k+', label: 'Clientes felices' },
            { value: '24h', label: 'Envío express' },
          ],
        },
        benefits: {
          variant: 'icons',
          title: 'Nuestras Ventajas',
          subtitle: '¿Por qué elegirnos? Porque tu experiencia importa',
          items: [
            { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas en todo el país.' },
            { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos 100% protegidos.' },
            { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas.' },
            { icon: 'i-lucide-headphones', title: 'Soporte real', description: 'Atención humana cuando la necesitas.' },
          ],
        },
        featured: {
          variant: 'grid',
          title: 'Destacados',
          subtitle: 'Lo mejor seleccionado para ti — calidad garantizada',
          show_all_link: true,
        },
        testimonials: {
          variant: 'cards',
          title: 'Opiniones de Clientes',
          subtitle: 'La confianza de miles de compradores satisfechos',
          items: [
            { name: 'Pedro Sánchez', role: 'Cliente frecuente', avatar: null, rating: 5, text: 'Excelente experiencia de compra. Todo rápido, claro y sin complicaciones. Volveré a comprar.' },
            { name: 'Marta Herrera', role: 'Nueva clienta', avatar: null, rating: 5, text: 'Me encantó la simplicidad. Encontré lo que buscabas en 2 minutos y llegó al día siguiente.' },
            { name: 'Jorge López', role: 'Comprador recurrente', avatar: null, rating: 4, text: 'Producto de calidad y envío impecable. Así debería ser siempre la experiencia online.' },
          ],
        },
        cta: {
          variant: 'banner',
          headline: '¿Listo para tu próxima compra?',
          subtext: 'Descubre el catálogo completo y disfruta de una experiencia de compra sin complicaciones.',
          cta_primary: { label: 'Ir al catálogo', url: '/catalogo' },
          cta_secondary: { label: 'Crear cuenta', url: '/auth/register' },
        },

        richtext: {
          show: true,
          layout: 'full',
          headline: 'Diseño que deja espacio para lo importante',
          content: '<p>Una experiencia de compra clara, con productos seleccionados y contenido que te ayuda a decidir.</p><p>Sin ruido visual. Sin pasos innecesarios.</p>',
          image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&q=85',
          cta_label: 'Conocer la tienda',
          cta_url: '/catalogo',
          bg_color: '#f8fafc',
          text_color: '#0f172a',
        },
        gallery_feed: {
          show: true,
          title: 'Simplemente bien elegido',
          subtitle: 'Una colección visual de productos y espacios.',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85', url: '/catalogo', caption: 'Objects' },
            { image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85', url: '/catalogo', caption: 'Essentials' },
            { image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&q=85', url: '/catalogo', caption: 'Spaces' },
            { image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=85', url: '/catalogo', caption: 'Details' },
          ],
        },
      },

      page_sections: createPageSections(['_header', 'hero', 'benefits', 'featured', 'testimonials', 'cta', 'richtext', 'gallery_feed', ['faq', { title: 'Todo claro antes de comprar', subtitle: 'Preguntas frecuentes sobre nuestra experiencia.', items: [{ question: '¿Cómo encuentro un producto rápido?', answer: 'Utiliza categorías, búsqueda y filtros para reducir el catálogo hasta encontrar exactamente lo que necesitas.' }, { question: '¿Cómo funcionan los cambios?', answer: 'Cada producto muestra sus condiciones de cambio y devolución para que puedas comprar con tranquilidad.' }, { question: '¿Puedo recibir ayuda?', answer: 'Sí. Nuestro equipo está disponible para resolver dudas sobre productos, pedidos y entregas.' }] }]]),
    }),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 16. BOLD & COLORFUL — Hero split + categories pills + featured large-cards + gallery feed + testimonials cards + CTA gradient
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'bold-colorful',
    name: 'Bold & Colorful',
    description: 'Template expresivo y configurable donde color, inspiración visual y personalización convierten la navegación en descubrimiento.',
    category: 'general',
    categoryLabel: 'General',
    difficulty: 'intermedio',
    difficultyLabel: 'Intermedio',
    icon: 'i-lucide-palette',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    sections: ['Header', 'Hero Split', 'Categorías por Color', 'Destacados Large Cards', 'Galería Feed', 'Stats', 'Testimonios Cards', 'Newsletter', 'CTA Gradient', 'Footer'],
    sectionCount: 10,
    config: createTemplateConfig({
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        hero: {
          variant: 'split',
          badge: 'Colección 2026',
          headline: 'Exprésate con Color',
          subtext: 'Colores que cuentan tu historia. Productos vibrantes para personas que no temen destacar.',
          cta_primary: { label: 'Explorar colores', url: '/catalogo' },
          cta_secondary: { label: 'Ver lookbook', url: '/lookbook' },
          background_image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80',
          show_stats: true,
          stats: [
            { value: '200+', label: 'Colores disponibles' },
            { value: '100%', label: 'Personalización' },
            { value: '4.9', label: 'Satisfacción' },
          ],
        },
        categories: {
          variant: 'pills',
          title: 'Explora por Color',
          subtitle: 'Elige tu tono favorito y encuentra productos que enamoran',
          show_all_link: true,
        },
        featured: {
          variant: 'large-cards',
          title: 'Selección Colorida',
          subtitle: 'Piezas que destacan y cuentan historias únicas',
          show_all_link: true,
        },
        gallery_feed: {
          show: true,
          title: 'Inspiración en Colores',
          subtitle: 'Mira cómo nuestros clientes usan los colores',
          layout: 'grid-4',
          items: [
            { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80', url: null, caption: '组合 vibrante' },
            { image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80', url: null, caption: 'Paleta pastel' },
            { image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', url: null, caption: 'Degradado neon' },
            { image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80', url: null, caption: 'Texturas de color' },
          ],
        },
        testimonials: {
          variant: 'cards',
          title: 'Voces del Mundo',
          subtitle: 'Personas de todo el mundo que aman el color',
          items: [
            { name: 'Luciana Fernández', role: 'Artista visual', avatar: null, rating: 5, text: 'Finalmente una tienda que entiende que los colores son expresión. Cada producto es una obra de arte.' },
            { name: 'Martín Castro', role: 'Diseñador de interiores', avatar: null, rating: 5, text: 'La variedad de tonos es impresionante. Encontré exactamente el color que necesitaba para mi proyecto.' },
            { name: 'Isabela Moreno', role: 'Influencer creativa', avatar: null, rating: 5, text: 'Mis seguidores preguntan siempre de dónde saco mis productos. La calidad del color es incomparable.' },
          ],
        },
        cta: {
          variant: 'gradient',
          headline: 'Añade Color a Tu Vida',
          subtext: 'Explora nuestra paleta infinita de productos y encuentra los colores que te representan.',
          cta_primary: { label: 'Explorar productos', url: '/catalogo' },
          cta_secondary: { label: 'Crear mi paleta', url: '/personalizar' },
        },

        stats: {
          show: true,
          layout: 'grid-4',
          bg_color: '#faf5ff',
          text_color: '#581c87',
          items: [
            { value: '200+', label: 'Combinaciones de color', icon: 'i-lucide-palette' },
            { value: '4.9/5', label: 'Valoración de clientes', icon: 'i-lucide-star' },
            { value: '100%', label: 'Diseño personalizable', icon: 'i-lucide-sliders-horizontal' },
            { value: '48h', label: 'Despacho express', icon: 'i-lucide-truck' },
          ],
        },
        newsletter: {
          show: true,
          headline: 'Color directo a tu inbox',
          subtext: 'Nuevos lanzamientos, combinaciones y promociones para quienes prefieren destacar.',
          placeholder: 'Tu correo',
          button_label: 'Quiero color',
          bg_color: '#7c3aed',
          text_color: '#ffffff',
          layout: 'split',
          image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&q=85',
        },
      },

        categories_home: {
          variant: 'carousel',
          show: true,
          title: 'Explora por energía',
          subtitle: 'Una forma más divertida de descubrir la colección.',
          layout: 'grid-3',
          card_height: '330px',
          items: [
            { image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=85', name: 'Vibrante', description: 'Colores protagonistas', url: '/categorias/vibrante', overlay_opacity: 0.35, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=85', name: 'Pastel', description: 'Suave pero memorable', url: '/categorias/pastel', overlay_opacity: 0.35, text_color: '#ffffff' },
            { image: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=85', name: 'Neón', description: 'Atrévete a destacar', url: '/categorias/neon', overlay_opacity: 0.35, text_color: '#ffffff' },
          ],
        },
      page_sections: createPageSections(['_header', 'hero', 'categories', 'featured', 'gallery_feed', 'testimonials', 'cta', '_categories_home', 'stats', 'newsletter']),
    }),
  },
]

// ─── Template Functions ──────────────────────────────────────────────────────

export function getTemplateCategories(): TemplateCategory[] {
  const grouped = new Map<string, Template[]>()
  for (const t of templates) {
    const list = grouped.get(t.category) ?? []
    list.push(t)
    grouped.set(t.category, list)
  }
  return Array.from(grouped.entries()).map(([key, items]) => ({
    key,
    label: items[0]?.categoryLabel ?? key,
    items,
  }))
}

export function getFilteredTemplates(filter: TemplateFilter): Template[] {
  return templates.filter(t => {
    if (filter.category && t.category !== filter.category) return false
    if (filter.difficulty && t.difficulty !== filter.difficulty) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    }
    return true
  })
}

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id)
}
