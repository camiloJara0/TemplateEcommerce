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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegir este producto?', subtitle: 'Diseñado para ti', items: [
          { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'En pedidos superiores a $99.000 sin costo adicional.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa de fábrica.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días sin preguntas.' },
        ]},
        gallery: { show: true, order: 2, variant: 'grid', columns: 2, show_thumbnails: true, enable_zoom: true },
        problem_solution: { product_ids: [], order: 3, headline: '¿Cansado de productos que no cumplen?', problems: [
          { icon: 'i-lucide-x-circle', title: 'Calidad inconsistente', description: 'Productos que se deterioran rápidamente.' },
          { icon: 'i-lucide-x-circle', title: 'Garantías limitadas', description: 'Coberturas que no cubren problemas reales.' },
        ], solution_headline: 'Nuestra solución', solution_items: [
          { icon: 'i-lucide-check-circle', title: 'Materiales premium', description: 'Componentes seleccionados para durabilidad.' },
          { icon: 'i-lucide-check-circle', title: 'Garantía real', description: '1 año de cobertura completa.' },
        ]},
        features: { product_ids: [], order: 4, variant: 'alternating', title: 'Características', subtitle: 'Lo que necesitas saber', items: [
          { icon: 'i-lucide-zap', title: 'Alto rendimiento', description: 'Diseñado para el máximo rendimiento diario.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
          { icon: 'i-lucide-shield', title: 'Durabilidad', description: 'Materiales premium que resisten el desgaste.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 5, variant: 'carousel', title: 'Lo que dicen quienes ya lo compraron', subtitle: 'Opiniones verificadas', items: [
          { name: 'María García', role: 'Clienta frecuente', avatar: null, rating: 5, text: 'Excelente producto, la calidad superó mis expectativas.' },
          { name: 'Carlos Rodríguez', role: 'Compra recurrente', avatar: null, rating: 5, text: 'Transparencia total desde el primer momento.' },
        ]},
        warranty: { show: true, order: 6, variant: 'cards', headline: 'Compra con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa de fábrica.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días para cambios.' },
          { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Estamos siempre para ti.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 7, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Resolvemos tus dudas', items: [
          { question: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda 3-5 días hábiles. Express en 24-48 horas.' },
          { question: '¿Puedo devolver el producto?', answer: 'Sí, tienes 30 días para devoluciones sin preguntas.' },
          { question: '¿Cómo funciona la garantía?', answer: '1 año de cobertura completa contra defectos de fabricación.' },
        ]},
        cta: { show: true, order: 8, variant: 'banner', headline: '¿Listo para comprar?', subtext: 'Agrega al carrito y recíbelo en casa', cta_primary: { label: 'Comprar ahora', url: '/carrito' }, cta_secondary: { label: 'Seguir comprando', url: '/catalogo' }, bg_color: '#6366f1', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Sobre nosotros', subtext: 'Conoce la historia detrás de Modern Store — tu tienda de confianza para moda y lifestyle.', background_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Hacer que la moda de calidad sea accesible para todos, ofreciendo una experiencia de compra excepcional con envío rápido y atención personalizada.', mission_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la tienda online de referencia en moda y lifestyle, reconocida por la calidad, la innovación y la satisfacción del cliente.', vision_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los principios que guían cada decisión', layout: 'grid-3', items: [
          { icon: 'i-lucide-shield-check', title: 'Confianza', description: 'Transparencia absoluta en cada transacción.', image: null },
          { icon: 'i-lucide-sparkles', title: 'Calidad', description: 'Solo ofrecemos lo que compraríamos nosotros.', image: null },
          { icon: 'i-lucide-heart', title: 'Pasión', description: 'Amamos lo que hacemos y se nota.', image: null },
          { icon: 'i-lucide-headphones', title: 'Soporte', description: 'Atención real, humana y disponible.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'La gente que hace posible todo', layout: 'grid-3', members: [] },
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'Un recorrido que apenas comienza', events: [
          { year: '2020', title: 'El comienzo', description: 'Nacimos con la idea de hacer las cosas diferentes.', icon: 'i-lucide-rocket', image: null },
          { year: '2022', title: 'Crecimiento', description: 'Alcanzamos nuestros primeros 15,000 clientes.', icon: 'i-lucide-trending-up', image: null },
          { year: '2024', title: 'Consolidación', description: 'Expandimos nuestro catálogo a más de 5,000 productos.', icon: 'i-lucide-award', image: null },
        ]},
        map: { show: false, headline: 'Encuéntranos', address: 'Calle Principal #123, Bogotá, Colombia', latitude: 4.711, longitude: -74.0721, phone: '+57 300 000 0000', hours: 'Lun - Vie: 9:00 - 18:00' },
        cta: { show: true, headline: '¿Listo para conocernos?', subtext: 'Explora nuestro catálogo y descubre por qué somos diferentes.', cta_primary: { label: 'Ver catálogo', url: '/catalogo' }, cta_secondary: { label: 'Contactar', url: '/contacto' }, bg_color: null, text_color: null },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 600, base_size: 16 },
        colores: { primario: '#6366f1', secundario: '#3b82f6', fondo: '#f8fafc', accent: '#8b5cf6' },
        paleta: { texto_principal_claro: '#0f172a', texto_principal_oscuro: '#f8fafc', texto_secundario_claro: '#475569', texto_secundario_oscuro: '#cbd5e1', texto_muted_claro: '#94a3b8', texto_muted_oscuro: '#64748b', borde_claro: '#e2e8f0', borde_oscuro: '#1e293b', superficie_claro: '#ffffff', superficie_oscuro: '#0f172a', fondo_alt_claro: '#f1f5f9', fondo_alt_oscuro: '#111827', marca_claro: '#6366f1', marca_oscuro: '#818cf8', marca_hover_claro: '#4f46e5', marca_hover_oscuro: '#a5b4fc', acento_claro: '#8b5cf6', acento_oscuro: '#a78bfa', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#0f172a', fondo_imagenes: '#f1f5f9', fondo_imagenes_dark: '#1e293b', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1e293b', tipo_fondo: 'solid', gradiente_from: '#6366f1', gradiente_via: '#3b82f6', gradiente_to: '#8b5cf6', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'spotlight', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Experiencia Premium', subtitle: 'Beneficios exclusivos para ti', items: [
          { icon: 'i-lucide-crown', title: 'Servicio personalizado', description: 'Asesoría privada con nuestro equipo de estilo.' },
          { icon: 'i-lucide-gift', title: 'Empaque de lujo', description: 'Cada pieza llega en presentación premium.' },
          { icon: 'i-lucide-truck', title: 'Envío VIP', description: 'Entrega prioritaria con seguimiento dedicado.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Detalles que importan', subtitle: 'La excelencia en cada aspecto', items: [
          { icon: 'i-lucide-gem', title: 'Materiales selectos', description: 'Solo los mejores materiales pasan nuestra selección.', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80' },
          { icon: 'i-lucide-eye', title: 'Acabado artesanal', description: 'Cada detalle revisado por expertos.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'spotlight', title: 'Lo que dicen nuestros clientes VIP', subtitle: 'Opiniones de coleccionistas y conocedores', items: [
          { name: 'Isabella Fernández', role: 'Clienta VIP', avatar: null, rating: 5, text: 'Cada pieza es una inversión en calidad y estilo que perdura.' },
          { name: 'Sebastián Morales', role: 'Coleccionista', avatar: null, rating: 5, text: 'La atención al detalle es excepcional. Un verdadero lujo.' },
        ]},
        warranty: { show: true, order: 4, variant: 'minimal', headline: 'Garantía de excelencia', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía extendida', description: '2 años de cobertura premium.' },
          { icon: 'i-lucide-headphones', title: 'Concierge personal', description: 'Asesor dedicado para cada cliente.' },
        ], cta_label: 'Ver condiciones', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Servicio privado', subtitle: 'Preguntas frecuentes de clientes premium', items: [
          { question: '¿Ofrecen asesoría personalizada?', answer: 'Sí. Nuestro equipo puede ayudarte a elegir piezas según ocasión, estilo y presupuesto.' },
          { question: '¿Cómo funciona el envío premium?', answer: 'Preparamos cada pedido con embalaje protegido y seguimiento durante todo el trayecto.' },
        ]},
        cta: { show: true, order: 6, variant: 'split', headline: 'Tu Experiencia Premium Te Espera', subtext: 'Reserva tu cita privada y descubre piezas exclusivas.', cta_primary: { label: 'Agendar cita', url: '/cita' }, cta_secondary: null, bg_color: '#292524', text_color: '#faf7f2' },
      },

      nosotros: {
        hero: { show: true, headline: 'Nuestra Filosofía', subtext: 'El lujo no es ostentación, es selección. Conoce la historia detrás de cada pieza que ofrecemos.', background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80', overlay_opacity: 0.45, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Misión', mission_text: 'Curar piezas excepcionales que trascienden las tendencias, ofreciendo una experiencia de compra tan exclusiva como los productos que seleccionamos.', mission_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80', vision_title: 'Visión', vision_text: 'Ser el referente de lujo accesible en Latinoamérica, donde cada cliente se sienta único y valorado.', vision_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Pilares', subtitle: 'Los valores que definen nuestra marca', layout: 'grid-3', items: [
          { icon: 'i-lucide-gem', title: 'Exclusividad', description: 'Piezas seleccionadas que no encontrarás en otro lugar.', image: null },
          { icon: 'i-lucide-eye', title: 'Curaduría', description: 'Cada producto pasa por un riguroso proceso de selección.', image: null },
          { icon: 'i-lucide-heart', title: 'Experiencia', description: 'Más que una compra, un momento memorable.', image: null },
          { icon: 'i-lucide-shield', title: 'Confianza', description: 'Garantía real y servicio personalizado.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los artífices de tu experiencia', layout: 'grid-3', members: [
          { name: 'Camila Restrepo', role: 'Directora Creativa', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: '15 años curando tendencias globales.' },
          { name: 'Alejandro Torres', role: 'Director de Experiencia', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Ex-LVMH, especialista en servicio premium.' },
        ]},
        timeline: { show: true, title: 'Nuestro Camino', subtitle: 'De la visión a la realidad', events: [
          { year: '2019', title: 'La visión', description: 'Nace la idea de crear una boutique digital con estándares de lujo.', icon: 'i-lucide-diamond', image: null },
          { year: '2021', title: 'Primer show-room', description: 'Abrimos nuestra primera experiencia física privada.', icon: 'i-lucide-store', image: null },
          { year: '2024', title: 'Expansión regional', description: 'Llegamos a 3 países con clientes fieles.', icon: 'i-lucide-globe', image: null },
        ]},
        map: { show: false, headline: 'Visítanos', address: 'Calle del Lujo #10-20, Zona T, Bogotá', latitude: 4.668, longitude: -74.056, phone: '+57 300 111 2233', hours: 'Lun - Sáb: 10:00 - 20:00' },
        cta: { show: true, headline: ' Vive la Experiencia', subtext: 'Agenda tu visita privada y descubre la diferencia.', cta_primary: { label: 'Agendar cita', url: '/cita' }, cta_secondary: { label: 'Ver colección', url: '/catalogo' }, bg_color: '#292524', text_color: '#faf7f2' },
      },

      estilos: {
        tipografia: { font_family: 'Playfair Display', heading_weight: 700, base_size: 16 },
        colores: { primario: '#b45309', secundario: '#be123c', fondo: '#faf7f2', accent: '#d4a574' },
        paleta: { texto_principal_claro: '#292524', texto_principal_oscuro: '#faf7f2', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#f5f5f4', fondo_alt_oscuro: '#292524', marca_claro: '#b45309', marca_oscuro: '#d97706', marca_hover_claro: '#92400e', marca_hover_oscuro: '#fbbf24', acento_claro: '#d4a574', acento_oscuro: '#e8c9a0', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#f5f5f4', fondo_imagenes_dark: '#292524', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#b45309', gradiente_via: '#92400e', gradiente_to: '#d4a574', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.5rem', radius_buttons: '0.5rem', radius_cards: '0.5rem' },
        spacing: { section_padding: '6rem', container_max: '76rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Beneficios de compra', subtitle: 'Ventajas que solo encontrarás aquí', items: [
          { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía real', description: 'Cobertura completa en todos los productos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días para devoluciones sin preguntas.' },
        ]},
        gallery: { show: true, order: 2, variant: 'grid', columns: 2, show_thumbnails: true, enable_zoom: true },
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Lo que dicen quienes compraron', subtitle: 'Opiniones reales de clientes', items: [
          { name: 'Carlos Pérez', role: 'Comprador ágil', avatar: null, rating: 5, text: 'Aproveché una oferta flash y llegó en menos de 24 horas. Increíble servicio.' },
          { name: 'María López', role: 'Compradora frecuente', avatar: null, rating: 5, text: 'Los descuentos son reales, no inflados. Siempre compro aquí.' },
          { name: 'Andrés Morales', role: 'Nuevo cliente', avatar: null, rating: 4, text: 'Las ofertas son legítimas. Me suscribí para no perderme ninguna.' },
        ]},
        faq: { show: true, order: 4, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo lo que necesitas saber sobre envíos y devoluciones', items: [
          { question: '¿Cuánto tarda el envío express?', answer: 'El envío express tarda 24-48 horas hábiles en ciudades principales.' },
          { question: '¿Puedo devolver un producto en oferta?', answer: 'Sí, todos los productos tienen las mismas condiciones de devolución, incluidos los en oferta.' },
          { question: '¿Las ofertas son por tiempo limitado?', answer: 'Sí, nuestras ofertas flash tienen una duración definida. Recibe alertas para no perderte ninguna.' },
        ]},
        cta: { show: true, order: 5, variant: 'banner', headline: 'Las ofertas se agotan rápido', subtext: 'No dejes pasar estas oportunidades', cta_primary: { label: 'Ver ofertas', url: '/ofertas' }, cta_secondary: { label: 'Seguir comprando', url: '/catalogo' }, bg_color: '#dc2626', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Flash Deals - Ofertas que no encontrarás en otro lado', subtext: 'Traemos los mejores descuentos directamente a ti, sin intermediarios ni precios inflados.', background_image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Ofrecer las mejores ofertas con descuentos reales, eliminando intermediarios para que el ahorro llegue directo al cliente.', mission_image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a5e4a4?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la plataforma de ofertas #1 en Latinoamérica, reconocida por la transparencia y los ahorros reales.', vision_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los pilares que nos definen', layout: 'grid-3', items: [
          { icon: 'i-lucide-piggy-bank', title: 'Ahorro', description: 'Descuentos reales que marcan la diferencia.', image: null },
          { icon: 'i-lucide-eye', title: 'Transparencia', description: 'Sin precios inflados ni sorpresas ocultas.', image: null },
          { icon: 'i-lucide-zap', title: 'Rapidez', description: 'Ofertas relámpago que aprovechan tu tiempo.', image: null },
          { icon: 'i-lucide-shield-check', title: 'Confianza', description: 'Garantía real en cada compra que realizas.', image: null },
        ]},
        cta: { show: true, headline: 'No te quedes sin tu oferta', subtext: 'Explora nuestras promociones actuales y ahorra hoy.', cta_primary: { label: 'Ver ofertas', url: '/ofertas' }, cta_secondary: { label: 'Suscribirme a alertas', url: '/newsletter' }, bg_color: '#dc2626', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 700, base_size: 16 },
        colores: { primario: '#dc2626', secundario: '#ea580c', fondo: '#fef2f2', accent: '#f97316' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fef2f2', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#fef2f2', fondo_alt_oscuro: '#292524', marca_claro: '#dc2626', marca_oscuro: '#ef4444', marca_hover_claro: '#b91c1c', marca_hover_oscuro: '#f87171', acento_claro: '#f97316', acento_oscuro: '#fb923c', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#fef2f2', fondo_imagenes_dark: '#292524', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#dc2626', gradiente_via: '#ea580c', gradiente_to: '#f97316', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.5rem', radius_buttons: '0.5rem', radius_cards: '0.5rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-right', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, show_brand: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué comprar aquí?', subtitle: 'Beneficios de nuestro marketplace', items: [
          { icon: 'i-lucide-badge-check', title: 'Marcas verificadas', description: 'Solo trabajamos con marcas originales y certificadas.' },
          { icon: 'i-lucide-truck', title: 'Envío garantizado', description: 'Logística propia para entregas seguras y a tiempo.' },
          { icon: 'i-lucide-headphones', title: 'Soporte multi-marca', description: 'Un solo canal de atención para todas tus marcas.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Variedad sin límites', subtitle: 'Compara, elige y compra entre las mejores marcas', items: [
          { icon: 'i-lucide-shapes', title: 'Multi-brand', description: 'Accede a cientos de marcas en una sola plataforma.', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80' },
          { icon: 'i-lucide-bar-chart-3', title: 'Comparación inteligente', description: 'Compara precios, especificaciones y reseñas al instante.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
        ]},
        comparison: { product_ids: [], order: 3, title: 'Compara marcas', subtitle: 'Encuentra la marca perfecta para ti', items: [] },
        testimonials: { product_ids: [], order: 4, variant: 'grid', title: 'Lo que dicen nuestros clientes', subtitle: 'Compradores de múltiples marcas', items: [
          { name: 'Sandra Gutiérrez', role: 'Compradora multi-marca', avatar: null, rating: 5, text: 'Puedo comparar todas las marcas que me gustan en un solo lugar. Ahorro tiempo y dinero.' },
          { name: 'Roberto Díaz', role: 'Amante de las marcas', avatar: null, rating: 5, text: 'La variedad es impresionante. Siempre encuentro lo que busco sin importar la marca.' },
          { name: 'Laura Fernández', role: 'Compradora exigente', avatar: null, rating: 4, text: 'El sistema de comparación me facilita mucho la decisión de compra.' },
        ]},
        faq: { show: true, order: 5, variant: 'accordion', title: 'Compra entre marcas con confianza', subtitle: 'Información rápida para comparar y decidir', items: [
          { question: '¿Los productos son originales?', answer: 'Trabajamos con un catálogo curado y procesos de verificación para ofrecer productos de procedencia confiable.' },
          { question: '¿Puedo comparar productos de diferentes marcas?', answer: 'Sí. Puedes revisar diferentes opciones y sus características antes de decidir.' },
          { question: '¿Las garantías dependen de la marca?', answer: 'Las condiciones pueden variar según fabricante y producto; se muestran durante el proceso de compra.' },
        ]},
        cta: { show: true, order: 6, variant: 'gradient', headline: 'Descubre Todo lo que Tenemos para Ti', subtext: 'Más de 200 marcas te esperan', cta_primary: { label: 'Explorar marketplace', url: '/catalogo' }, cta_secondary: { label: 'Vender en nuestra plataforma', url: '/vendedores' }, bg_color: '#0891b2', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Multi-Brand Marketplace - Las mejores marcas en un solo lugar', subtext: 'Reunimos lo mejor del mercado en una plataforma única para que encuentres todo lo que necesitas.', background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Reunir las mejores marcas del mundo en una sola plataforma, ofreciendo variedad, calidad y una experiencia de compra sin comparación.', mission_image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser el marketplace de referencia en Latinoamérica, conectando a los mejores proveedores con clientes que valoran la calidad.', vision_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los principios que nos guían', layout: 'grid-3', items: [
          { icon: 'i-lucide-sparkles', title: 'Curaduría', description: 'Cada marca pasa por un riguroso proceso de selección.', image: null },
          { icon: 'i-lucide-layout-grid', title: 'Variedad', description: 'Miles de productos de cientos de marcas.', image: null },
          { icon: 'i-lucide-gem', title: 'Calidad', description: 'Solo marcas que cumplen nuestros estándares.', image: null },
          { icon: 'i-lucide-lightbulb', title: 'Innovación', description: 'Siempre buscando las marcas del futuro.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los que hacen posible el marketplace', layout: 'grid-3', members: [
          { name: 'Daniela Rodríguez', role: 'Directora de Marcas', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: '10 años curando marcas globales.' },
          { name: 'Felipe Torres', role: 'Director de Operaciones', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Experto en logística multi-marca.' },
        ]},
        cta: { show: true, headline: 'Explora todas las marcas', subtext: 'Descubre un mundo de posibilidades en un solo lugar.', cta_primary: { label: 'Ver marcas', url: '/marcas' }, cta_secondary: { label: 'Explorar catálogo', url: '/catalogo' }, bg_color: '#0891b2', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 600, base_size: 16 },
        colores: { primario: '#0891b2', secundario: '#0d9488', fondo: '#ecfeff', accent: '#06b6d4' },
        paleta: { texto_principal_claro: '#134e4a', texto_principal_oscuro: '#ecfeff', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#134e4a', fondo_alt_claro: '#ecfeff', fondo_alt_oscuro: '#1e3a3a', marca_claro: '#0891b2', marca_oscuro: '#22d3ee', marca_hover_claro: '#0e7490', marca_hover_oscuro: '#67e8f9', acento_claro: '#06b6d4', acento_oscuro: '#22d3ee', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#134e4a', fondo_imagenes: '#ecfeff', fondo_imagenes_dark: '#1e3a3a', fondo_componentes: '#ffffff', fondo_componentes_dark: '#134e4a', tipo_fondo: 'solid', gradiente_from: '#0891b2', gradiente_via: '#0d9488', gradiente_to: '#06b6d4', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.5rem', radius_buttons: '0.5rem', radius_cards: '0.5rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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
      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'masonry', show_breadcrumbs: true, show_share: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Exclusividad Editorial', subtitle: 'Detalles que marcan la diferencia', items: [
          { icon: 'i-lucide-scissors', title: 'Edición limitada', description: 'Cada pieza producida en tiradas cortas para exclusividad.' },
          { icon: 'i-lucide-leaf', title: 'Materiales sostenibles', description: 'Textiles ecológicos y procesos responsables.' },
          { icon: 'i-lucide-sparkles', title: 'Diseño exclusivo', description: 'Piezas únicas diseñadas por nuestro equipo creativo.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Artesanal y editorial', subtitle: 'La fusión perfecta entre arte y moda', items: [
          { icon: 'i-lucide-palette', title: 'Estilo editorial', description: 'Cada colección es un capítulo de una historia visual.', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80' },
          { icon: 'i-lucide-hand', title: 'Toque artesanal', description: 'Detalles hechos a mano que cuentan una historia.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80' },
        ]},
        transform: { product_ids: [], order: 3, headline: 'Transforma tu estilo', subtitle: 'Antes y después de nuestro estilo editorial', items: [] },
        testimonials: { product_ids: [], order: 4, variant: 'masonry', title: 'Lo que dicen las influencers', subtitle: 'Opiniones de referentes de moda', items: [
          { name: 'Sofía Herrera', role: 'Influencer de moda', avatar: null, rating: 5, text: 'Cada prenda tiene una historia. La calidad del tejido y el corte son impecables.' },
          { name: 'Camila Vargas', role: 'Diseñadora de interiores', avatar: null, rating: 5, text: 'El estilo editorial realmente se nota en cada detalle. Mi marca de confianza.' },
          { name: 'Daniela Ospina', role: 'Emprendedora', avatar: null, rating: 4, text: 'Ropa que transmite personalidad. Los colores y texturas son exactamente lo que buscaba.' },
          { name: 'Isabella Moreno', role: 'Blogger de moda', avatar: null, rating: 5, text: 'La mejor colección que he visto. Diseño vanguardista con materiales de primera.' },
        ]},
        ugc: { show: true, order: 5, title: 'Street Style', subtitle: 'Etiquétanos @fashionhouse para aparecer aquí', items: [
          { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', url: null, caption: 'Look del día' },
          { image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', url: null, caption: 'Street style' },
          { image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', url: null, caption: 'Nueva colección' },
        ]},
        cta: { show: true, order: 6, variant: 'gradient', headline: 'Tu Próximo Look Te Está Esperando', subtext: 'Explora la colección completa', cta_primary: { label: 'Ver colección', url: '/catalogo' }, cta_secondary: { label: 'Seguir en Instagram', url: 'https://instagram.com/fashionhouse' }, bg_color: '#c026d3', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Fashion House - Donde el estilo encuentra su lugar', subtext: 'Creamos moda que cuenta historias y define tendencias con una visión editorial única.', background_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Crear moda que cuente historias, fusionando diseño vanguardista con materiales sostenibles para una moda con propósito.', mission_image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser referente de moda editorial en Latinoamérica, inspirando a una generación que valora la creatividad y la autenticidad.', vision_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que define nuestra identidad', layout: 'grid-3', items: [
          { icon: 'i-lucide-palette', title: 'Creatividad', description: 'Diseños que rompen esquemas y cuentan historias.', image: null },
          { icon: 'i-lucide-leaf', title: 'Sostenibilidad', description: 'Moda responsable con el planeta y las personas.', image: null },
          { icon: 'i-lucide-crown', title: 'Exclusividad', description: 'Piezas únicas para quienes se atreven a ser diferentes.', image: null },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Una familia de amantes de la moda con sentido.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los creativos detrás de cada colección', layout: 'grid-3', members: [
          { name: 'Camila Restrepo', role: 'Directora Creativa', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: '15 años curando tendencias globales.' },
          { name: 'Valentina Torres', role: 'Diseñadora Principal', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', bio: 'Ex-Gucci, especialista en texturas.' },
        ]},
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'De una revista a tu armario', events: [
          { year: '2018', title: 'La idea', description: 'Nacimos como una revista digital de moda.', icon: 'i-lucide-book-open', image: null },
          { year: '2020', title: 'Primera colección', description: 'Lanzamos nuestra primera colección cápsula.', icon: 'i-lucide-scissors', image: null },
          { year: '2024', title: 'Reconocimiento', description: 'Nos nominaron como mejor marca emergente.', icon: 'i-lucide-award', image: null },
        ]},
        cta: { show: true, headline: 'Conoce nuestra historia', subtext: 'Descubre la pasión detrás de cada prenda.', cta_primary: { label: 'Ver historia', url: '/nosotros' }, cta_secondary: { label: 'Explorar colección', url: '/catalogo' }, bg_color: '#c026d3', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Playfair Display', heading_weight: 700, base_size: 16 },
        colores: { primario: '#c026d3', secundario: '#ec4899', fondo: '#fdf4ff', accent: '#d946ef' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fdf4ff', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#fdf4ff', fondo_alt_oscuro: '#3b0764', marca_claro: '#c026d3', marca_oscuro: '#e879f9', marca_hover_claro: '#a21caf', marca_hover_oscuro: '#f0abfc', acento_claro: '#d946ef', acento_oscuro: '#e879f9', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#fdf4ff', fondo_imagenes_dark: '#3b0764', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#c026d3', gradiente_via: '#ec4899', gradiente_to: '#d946ef', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.25rem', radius_buttons: '0.25rem', radius_cards: '0.25rem' },
        spacing: { section_padding: '6rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'masonry', show_breadcrumbs: true, show_share: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Exclusividad Urbana', subtitle: 'Para quienes van primero', items: [
          { icon: 'i-lucide-flame', title: 'Drops limitados', description: 'Ediciones que no se repiten. Cuando se van, se van.' },
          { icon: 'i-lucide-sparkles', title: 'Ediciones exclusivas', description: 'Piezas que no encontrarás en ningún otro lugar.' },
          { icon: 'i-lucide-truck', title: 'Envío rápido', description: 'Recibe tu drop antes que nadie.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Street Culture', subtitle: 'Estilo urbano para la nueva generación', items: [
          { icon: 'i-lucide-music', title: 'Cultura urbana', description: 'Diseños inspirados en la calle, el graffiti y el hip-hop.', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=600&q=80' },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Un movimiento, no solo ropa. Únete al crew.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80' },
        ]},
        countdown: { show: true, order: 3, headline: 'Próximo drop en', subtext: 'Prepárate para la nueva caída', end_date: '2026-10-01T18:00:00', cta_label: 'Notificarme', bg_color: '#262626', text_color: '#ffffff' },
        testimonials: { product_ids: [], order: 4, variant: 'carousel', title: 'La comunidad habla', subtitle: 'Lo que dicen los collectors', items: [
          { name: 'Juan Camilo', role: 'Collector', avatar: null, rating: 5, text: 'Cada drop es una obra de arte. Las ediciones limitadas valen cada peso.' },
          { name: 'Santiago Ríos', role: 'Street culture fan', avatar: null, rating: 5, text: 'El estilo urbano más auténtico que he encontrado. Siempre van primero.' },
          { name: 'Laura Méndez', role: 'Compradora ágil', avatar: null, rating: 4, text: 'Los drops se agotan rápido pero vale la pena. Calidad brutal.' },
        ]},
        ugc: { show: true, order: 5, title: 'Seen on the Streets', subtitle: 'La comunidad convierte cada drop en una historia', items: [
          { image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&q=80', url: null, caption: 'Downtown' },
          { image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&q=80', url: null, caption: 'Street uniform' },
          { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80', url: null, caption: 'After dark' },
        ]},
        cta: { show: true, order: 6, variant: 'banner', headline: 'El street style no espera', subtext: 'Los drops se agotan en minutos', cta_primary: { label: 'Comprar ahora', url: '/catalogo' }, cta_secondary: { label: 'Próximo drop', url: '/drops' }, bg_color: '#262626', text_color: '#f97316' },
      },

      nosotros: {
        hero: { show: true, headline: 'STREET CULTURE - Ropa urbana para la nueva generación', subtext: 'Nacimos de la calle, crecimos con la comunidad. Moda urbana auténtica sin compromisos.', background_image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1200&q=80', overlay_opacity: 0.5, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Representar la cultura urbana con autenticidad, creando prendas que cuenten historias reales de la calle.', mission_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la marca streetwear de referencia en Latinoamérica, conectando culturas a través del estilo.', vision_image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que nos define como cultura', layout: 'grid-3', items: [
          { icon: 'i-lucide-fingerprint', title: 'Autenticidad', description: 'Sin copias, sin pretensiones. Real reconocerá real.', image: null },
          { icon: 'i-lucide-gem', title: 'Exclusividad', description: 'Ediciones limitadas para quienes van primero.', image: null },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Más que clientes, somos un crew.', image: null },
          { icon: 'i-lucide-lightbulb', title: 'Innovación', description: 'Siempre rompiendo reglas y creando tendencia.', image: null },
        ]},
        cta: { show: true, headline: 'Únete al crew', subtext: 'Sé parte del movimiento street culture.', cta_primary: { label: 'Ver drops', url: '/drops' }, cta_secondary: { label: 'Explorar tienda', url: '/catalogo' }, bg_color: '#262626', text_color: '#f97316' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 800, base_size: 16 },
        colores: { primario: '#262626', secundario: '#525252', fondo: '#0a0a0a', accent: '#f97316' },
        paleta: { texto_principal_claro: '#0a0a0a', texto_principal_oscuro: '#fafafa', texto_secundario_claro: '#525252', texto_secundario_oscuro: '#a3a3a3', texto_muted_claro: '#737373', texto_muted_oscuro: '#525252', borde_claro: '#262626', borde_oscuro: '#404040', superficie_claro: '#ffffff', superficie_oscuro: '#0a0a0a', fondo_alt_claro: '#171717', fondo_alt_oscuro: '#262626', marca_claro: '#262626', marca_oscuro: '#f97316', marca_hover_claro: '#f97316', marca_hover_oscuro: '#fb923c', acento_claro: '#f97316', acento_oscuro: '#fb923c', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#000000' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#0a0a0a', fondo_imagenes: '#171717', fondo_imagenes_dark: '#262626', fondo_componentes: '#ffffff', fondo_componentes_dark: '#171717', tipo_fondo: 'solid', gradiente_from: '#262626', gradiente_via: '#404040', gradiente_to: '#525252', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0rem', radius_buttons: '0rem', radius_cards: '0.25rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Esenciales de calidad', subtitle: 'Menos pero mejor', items: [
          { icon: 'i-lucide-leaf', title: 'Sostenibilidad', description: 'Materiales orgánicos y procesos responsables.' },
          { icon: 'i-lucide-gem', title: 'Calidad superior', description: 'Telas premium que mantienen su forma lavado tras lavado.' },
          { icon: 'i-lucide-infinity', title: 'Diseño atemporal', description: 'Piezas que no pasan de moda, combinables en cualquier temporada.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Clean & Minimal', subtitle: 'Diseño limpio para quienes valoran lo esencial', items: [
          { icon: 'i-lucide-minus', title: 'Minimalismo', description: 'Líneas limpias, colores neutros, siluetas perfectas.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80' },
          { icon: 'i-lucide-heart', title: 'Hecho con intención', description: 'Cada pieza tiene un propósito y un lugar en tu armario.', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'cards', title: 'Opiniones Reales', subtitle: 'Lo que dicen quienes adoptaron el minimalismo', items: [
          { name: 'Ana Sofía Ramírez', role: 'Arquitecta', avatar: null, rating: 5, text: 'Finalmente ropa que combina con todo. La calidad se nota al instante.' },
          { name: 'Laura Castaño', role: 'Diseñadora gráfica', avatar: null, rating: 5, text: 'Menos pero mejor. Cada pieza es perfecta.' },
          { name: 'Mariana Ossa', role: 'Emprendedora', avatar: null, rating: 5, text: 'La tela es increíble, los colores neutros son perfectos.' },
        ]},
        faq: { show: true, order: 4, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Guía rápida para comprar tus esenciales', items: [
          { question: '¿Cómo elegir mi talla?', answer: 'Consulta la guía de tallas de cada producto y compara las medidas con una prenda que ya te quede bien.' },
          { question: '¿Los colores son combinables?', answer: 'La colección está construida alrededor de una paleta neutra para facilitar múltiples combinaciones.' },
          { question: '¿Cómo cuidar los materiales?', answer: 'Cada producto incluye recomendaciones específicas de lavado y cuidado para prolongar su vida útil.' },
        ]},
        cta: { show: true, order: 5, variant: 'split', headline: 'Simplifica Tu Estilo', subtext: 'Descubre que menos puede ser mucho más', cta_primary: { label: 'Ver esenciales', url: '/catalogo' }, cta_secondary: { label: 'Nuestra filosofía', url: '/nosotros' }, bg_color: '#78716c', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Less is More - Moda esencial para tu día a día', subtext: 'Creemos que la verdadera elegancia está en la simplicidad y la calidad.', background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80', overlay_opacity: 0.35, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Crear esenciales atemporales con materiales de primera calidad, diseñados para durar más que una temporada.', mission_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser sinónimo de minimalismo de calidad, demostrando que menos es realmente más.', vision_image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que guía cada decisión', layout: 'grid-3', items: [
          { icon: 'i-lucide-minus', title: 'Simplicidad', description: 'Eliminamos lo innecesario para quedarnos con lo esencial.', image: null },
          { icon: 'i-lucide-gem', title: 'Calidad', description: 'Materiales y confección de nivel superior.', image: null },
          { icon: 'i-lucide-leaf', title: 'Sostenibilidad', description: 'Procesos responsables con el medio ambiente.', image: null },
          { icon: 'i-lucide-clock', title: 'Atemporalidad', description: 'Piezas que trascienden las tendencias.', image: null },
        ]},
        timeline: { show: true, title: 'Nuestro Camino', subtitle: 'De la idea a tu armario', events: [
          { year: '2019', title: 'El inicio', description: 'Nacimos con la idea de simplificar la moda.', icon: 'i-lucide-rocket', image: null },
          { year: '2021', title: 'Primera colección', description: 'Lanzamos 15 esenciales que se agotaron en semanas.', icon: 'i-lucide-shirt', image: null },
          { year: '2024', title: 'Crecimiento orgánico', description: 'Miles de clientes que valoran lo esencial.', icon: 'i-lucide-trending-up', image: null },
        ]},
        cta: { show: true, headline: 'Conoce nuestra filosofía', subtext: 'Descubre por qué menos es realmente más.', cta_primary: { label: 'Leer más', url: '/nosotros' }, cta_secondary: { label: 'Ver esenciales', url: '/catalogo' }, bg_color: '#78716c', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 400, base_size: 16 },
        colores: { primario: '#78716c', secundario: '#a8a29e', fondo: '#fafaf9', accent: '#57534e' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fafaf9', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#f5f5f4', fondo_alt_oscuro: '#292524', marca_claro: '#78716c', marca_oscuro: '#a8a29e', marca_hover_claro: '#57534e', marca_hover_oscuro: '#d6d3d1', acento_claro: '#57534e', acento_oscuro: '#a8a29e', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#1c1917' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#f5f5f4', fondo_imagenes_dark: '#292524', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#78716c', gradiente_via: '#a8a29e', gradiente_to: '#57534e', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.25rem', radius_buttons: '0.25rem', radius_cards: '0.25rem' },
        spacing: { section_padding: '6rem', container_max: '72rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'masonry', show_breadcrumbs: true, show_share: true, show_rating: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: 'Experiencia Gourmet', subtitle: 'Lo que nos hace únicos', items: [
          { icon: 'i-lucide-leaf', title: 'Ingredientes frescos', description: 'Solo lo mejor de productores locales seleccionados.' },
          { icon: 'i-lucide-sparkles', title: 'Recetas únicas', description: 'Creaciones exclusivas de nuestro chef ejecutivo.' },
          { icon: 'i-lucide-utensils', title: 'Experiencia gastronómica', description: 'Más que comida, un viaje para todos los sentidos.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Cocina artesanal', subtitle: 'Tradición e innovación en cada plato', items: [
          { icon: 'i-lucide-flame', title: 'Cocina culinaria', description: 'Técnicas tradicionales reinventadas con toque moderno.', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
          { icon: 'i-lucide-hand', title: 'Toque artesanal', description: 'Cada plato preparado con dedicación y pasión.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'cards', title: 'Lo que dicen nuestros comensales', subtitle: 'Opiniones de críticos y clientes', items: [
          { name: 'Carlos Gourmet', role: 'Crítico gastronómico', avatar: null, rating: 5, text: 'Una experiencia que despierta todos los sentidos. El mejor restaurante de la región.' },
          { name: 'María Elena', role: 'Comensal frecuente', avatar: null, rating: 5, text: 'Cada visita es una nueva aventura gastronómica. Nunca decepciona.' },
          { name: 'Andrés Chef', role: 'Chef profesional', avatar: null, rating: 5, text: 'La combinación de ingredientes locales con técnicas innovadoras es excepcional.' },
        ]},
        faq: { show: true, order: 4, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo lo que necesitas saber', items: [
          { question: '¿Es necesario reservar?', answer: 'Recomendamos reservar con anticipación, especialmente fines de semana y días festivos.' },
          { question: '¿Ofrecen menú degustación?', answer: 'Sí, contamos con menú degustación de 7 tiempos que cambia según la temporada.' },
          { question: '¿Tienen opciones vegetarianas/veganas?', answer: 'Sí, nuestro menú incluye opciones vegetarianas y veganas creativas y deliciosas.' },
        ]},
        cta: { show: true, order: 5, variant: 'split', headline: 'Reserva Tu Experiencia', subtext: 'Cada visita es una nueva aventura gastronómica', cta_primary: { label: 'Reservar mesa', url: '/reservas' }, cta_secondary: { label: 'Ver menú', url: '/menu' }, bg_color: '#b45309', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Gourmet Experience - Los mejores sabores en tu mesa', subtext: 'Una tradición culinaria que se transforma en una experiencia inolvidable para tu paladar.', background_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Crear experiencias gastronómicas memorables combinando ingredientes locales de la más alta calidad con técnicas innovadoras.', mission_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser el referente gastronómico de la región, reconocido por la excelencia culinaria y lahospitalidad.', vision_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que define nuestra cocina', layout: 'grid-3', items: [
          { icon: 'i-lucide-book-open', title: 'Tradición', description: 'Recetas que honran la culinaria de siempre.', image: null },
          { icon: 'i-lucide-lightbulb', title: 'Innovación', description: 'Técnicas nuevas que sorprenden el paladar.', image: null },
          { icon: 'i-lucide-heart', title: 'Pasión', description: 'Cada plato preparado con amor y dedicación.', image: null },
          { icon: 'i-lucide-gem', title: 'Calidad', description: 'Solo los mejores ingredientes llegan a nuestra cocina.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los artistas detrás de cada plato', layout: 'grid-3', members: [
          { name: 'Chef Alejandro', role: 'Chef Ejecutivo', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80', bio: '25 años de experiencia en alta cocina.' },
          { name: 'Chef Isabella', role: 'Chef Pastelera', image: 'https://images.unsplash.com/photo-1583394293214-28ez182408f4?w=400&q=80', bio: 'Especialista en postres de autor.' },
        ]},
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'De la tradición a la innovación', events: [
          { year: '2000', title: 'El comienzo', description: 'Abrimos nuestras puertas con una visión clara.', icon: 'i-lucide-utensils', image: null },
          { year: '2010', title: 'Reconocimiento', description: 'Nuestra primera estrella Michelin.', icon: 'i-lucide-star', image: null },
          { year: '2024', title: 'Nueva era', description: 'Innovación constante sin perder nuestra esencia.', icon: 'i-lucide-award', image: null },
        ]},
        cta: { show: true, headline: 'Visítanos', subtext: 'Ven a vivir la experiencia completa.', cta_primary: { label: 'Reservar mesa', url: '/reservas' }, cta_secondary: { label: 'Ver menú', url: '/menu' }, bg_color: '#b45309', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Playfair Display', heading_weight: 700, base_size: 16 },
        colores: { primario: '#b45309', secundario: '#92400e', fondo: '#fffbeb', accent: '#d97706' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fffbeb', texto_secundario_claro: '#57534e', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#fffbeb', fondo_alt_oscuro: '#451a03', marca_claro: '#b45309', marca_oscuro: '#f59e0b', marca_hover_claro: '#92400e', marca_hover_oscuro: '#fbbf24', acento_claro: '#d97706', acento_oscuro: '#fbbf24', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#fffbeb', fondo_imagenes_dark: '#451a03', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#b45309', gradiente_via: '#92400e', gradiente_to: '#d97706', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.5rem', radius_buttons: '0.5rem', radius_cards: '0.5rem' },
        spacing: { section_padding: '6rem', container_max: '76rem' },
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
      producto: {
        hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegir nuestro café?', subtitle: 'Calidad que se nota en cada sorbo', items: [
          { icon: 'i-lucide-leaf', title: 'Origen directo', description: 'Compramos directamente a productores y pagamos precios justos.' },
          { icon: 'i-lucide-flame', title: 'Tueste artesanal', description: 'Cada lote se tuesta en small batch para máximo sabor y frescura.' },
          { icon: 'i-lucide-droplets', title: 'Notas únicas', description: 'Cada origen tiene notas de sabor únicas: frutas, chocolate, nueces.' },
          { icon: 'i-lucide-truck', title: 'Envío fresco', description: 'Tostamos y enviamos en 24 horas para que llegue en su punto máximo.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Nuestro proceso artesanal', subtitle: 'De la finca a tu taza', items: [
          { icon: 'i-lucide-mountain', title: 'Selección de origen', description: 'Elegimos los mejores granos de fincas certificadas en Colombia y Latinoamérica.', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80' },
          { icon: 'i-lucide-flame', title: 'Tueste controlado', description: 'Cada lote se tuesta artesanalmente para resaltar sus notas naturales.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Lo que dicen nuestros cafeteros', subtitle: 'Opiniones de amantes del café', items: [
          { name: 'Andrés Felipe Gómez', role: 'Barista profesional', avatar: null, rating: 5, text: 'El mejor café que he probado en años. Las notas de sabor son increíbles y la frescura se nota.' },
          { name: 'Camila Restrepo', role: 'Amante del café', avatar: null, rating: 5, text: 'Cada taza es una experiencia. El tueste artesanal marca la diferencia.' },
        ]},
        warranty: { show: true, order: 4, variant: 'cards', headline: 'Compra con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía de frescura', description: 'Si no te gusta, lo reemplazamos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: '30 días para cambios.' },
          { icon: 'i-lucide-headphones', title: 'Soporte café', description: 'Te ayudamos a elegir tu grind y origen ideal.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre nuestro café', items: [
          { question: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda 3-5 días hábiles. Express en 24-48 horas. Tostamos y enviamos en el mismo día.' },
          { question: '¿Qué método de preparación me recomiendan?', answer: 'Depende de tu preferencia. Espresso para intensidad, filtrado para notas limpias. Tenemos guías en cada producto.' },
          { question: '¿Ofrecen suscripciones?', answer: 'Sí, puedes configurar envíos recurrentes con 15% de descuento y elegir la frecuencia que prefieras.' },
        ]},
        cta: { show: true, order: 6, variant: 'banner', headline: '¿Listo para tu próxima taza?', subtext: 'Prueba nuestro café premium y descubre por qué nuestros clientes vuelven siempre.', cta_primary: { label: 'Ordenar café', url: '/catalogo' }, cta_secondary: { label: 'Visitar tienda', url: '/tiendas' }, bg_color: '#78350f', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Tu Taza Favorita Te Espera', subtext: 'Café de origen premium conectando personas desde 2015. De la finca a tu taza, sin intermediarios.', background_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Conectar personas a través del café de origen premium, ofreciendo una experiencia auténtica del grano a la taza con transparencia y compromiso social.', mission_image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la referencia cafetera de origen en Latinoamérica, reconocida por la calidad, trazabilidad y el impacto positivo en las comunidades productoras.', vision_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los principios que guían cada taza', layout: 'grid-3', items: [
          { icon: 'i-lucide-mountain', title: 'Origen', description: 'Trazabilidad completa desde la finca hasta tu taza.', image: null },
          { icon: 'i-lucide-snowflake', title: 'Frescura', description: 'Tostamos y enviamos en 24 horas para máxima calidad.', image: null },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Pagamos precios justos y apoyamos a las comunidades cafeteras.', image: null },
          { icon: 'i-lucide-leaf', title: 'Sostenibilidad', description: 'Prácticas responsables con el medio ambiente.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'Los artesanos del café', layout: 'grid-3', members: [] },
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'Un viaje de grano en grano', events: [
          { year: '2015', title: 'El primer lote', description: 'Comenzamos tostando café en un garage con un tostador pequeño.', icon: 'i-lucide-coffee', image: null },
          { year: '2018', title: 'Apertura del café', description: 'Abrimos nuestra primera cafetería en Chapinero.', icon: 'i-lucide-store', image: null },
          { year: '2021', title: 'Expansión online', description: 'Llegamos a clientes en todo el país con envío directo.', icon: 'i-lucide-globe', image: null },
          { year: '2024', title: 'Cooperativa propia', description: 'Creamos una red directa con 50+ productores.', icon: 'i-lucide-handshake', image: null },
        ]},
        map: { show: false, headline: 'Visítanos', address: 'Calle del Café #12-34, Chapinero, Bogotá', latitude: 4.662, longitude: -74.052, phone: '+57 300 987 6543', hours: 'Lun - Vie: 7:00 - 20:00, Sáb - Dom: 8:00 - 18:00' },
        cta: { show: true, headline: '¿Listo para conocernos?', subtext: 'Visita nuestro café o pide tu primer pedido con descuento.', cta_primary: { label: 'Ordenar café', url: '/catalogo' }, cta_secondary: { label: 'Visitar café', url: '/tiendas' }, bg_color: '#78350f', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Playfair Display', heading_weight: 700, base_size: 16 },
        colores: { primario: '#c2410c', secundario: '#9a3412', fondo: '#fffbeb', accent: '#ea580c' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fef3c7', texto_secundario_claro: '#78716c', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#e7e5e4', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#fef7ee', fondo_alt_oscuro: '#292524', marca_claro: '#c2410c', marca_oscuro: '#ea580c', marca_hover_claro: '#9a3412', marca_hover_oscuro: '#fb923c', acento_claro: '#ea580c', acento_oscuro: '#fb923c', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#fef7ee', fondo_imagenes_dark: '#292524', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#c2410c', gradiente_via: '#9a3412', gradiente_to: '#ea580c', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'split', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegirnos?', subtitle: 'Calidad artesanal en cada bocado', items: [
          { icon: 'i-lucide-wheat', title: 'Ingredientes naturales', description: 'Solo usamos harina premium, mantequilla de primera y frutas frescas.' },
          { icon: 'i-lucide-flame', title: 'Horneado diario', description: 'Cada pieza se hornea fresca cada mañana para garantizar sabor.' },
          { icon: 'i-lucide-heart', title: 'Recetas de familia', description: 'Recetas tradicionales transmitidas por generaciones desde 1985.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Nuestro proceso artesanal', subtitle: 'Del horno a tu mesa', items: [
          { icon: 'i-lucide-wheat', title: 'Selección de ingredientes', description: 'Solo ingredientes naturales, sin conservadores ni aditivos artificiales.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
          { icon: 'i-lucide-hand', title: 'Amasado a mano', description: 'Cada masa se amasa artesanalmente para lograr la textura perfecta.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Lo que dicen nuestros clientes', subtitle: 'Opiniones de panaderos y clientes felices', items: [
          { name: 'María Alejandra Torres', role: 'Cliente frecuente', avatar: null, rating: 5, text: 'El pan de masa madre es espectacular. Cada mañana hago la fila y vale totalmente la pena.' },
          { name: 'Carlos Martínez', role: 'Chef profesional', avatar: null, rating: 5, text: 'Los croissants son los mejores que he probado fuera de París. La mantequilla y la técnica son impecables.' },
        ]},
        warranty: { show: true, order: 4, variant: 'cards', headline: 'Frescura garantizada', items: [
          { icon: 'i-lucide-shield-check', title: 'Frescura garantizada', description: 'Si no está fresco, lo reemplazamos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: 'Si no te gusta, lo cambiamos.' },
          { icon: 'i-lucide-headphones', title: 'Atención personal', description: 'Te ayudamos con pedidos especiales.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre nuestros productos', items: [
          { question: '¿Puedo hacer pedidos especiales?', answer: 'Sí, aceptamos pedidos personalizados con al menos 48 horas de anticipación. Pastels, tortas y arreglos especiales.' },
          { question: '¿Cuánto tarda un pedido?', answer: 'Los pedidos estándar están listos en 2-4 horas. Los personalizados pueden tardar 24-48 horas según la complejidad.' },
          { question: '¿Tienen opciones sin gluten?', answer: 'Sí, contamos con una línea especial de productos sin gluten preparados en zona controlada.' },
        ]},
        cta: { show: true, order: 6, variant: 'split', headline: '¿Listo para endulzar tu día?', subtext: 'Pide tu pedido y recíbelo recién horneado.', cta_primary: { label: 'Hacer pedido', url: '/catalogo' }, cta_secondary: { label: 'Ver tiendas', url: '/tiendas' }, bg_color: '#be185d', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Hecho con Amor', subtext: 'Panadería artesanal desde 1985. Recetas de familia que endulzan la vida de nuestra comunidad.', background_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Conservar la tradición de panadería artesanal ofreciendo productos frescos, de calidad superior y con el amor que solo una familia puede transmitir.', mission_image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la panadería favorita de la comunidad, reconocida por la calidad artesanal, la frescura de nuestros productos y el trato cercano.', vision_image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que nos hace únicos', layout: 'grid-3', items: [
          { icon: 'i-lucide-award', title: 'Tradición', description: 'Recetas transmitidas por tres generaciones de panaderos.', image: null },
          { icon: 'i-lucide-hand', title: 'Artesanía', description: 'Cada pieza hecha a mano con dedicación y paciencia.', image: null },
          { icon: 'i-lucide-snowflake', title: 'Frescura', description: 'Horneamos cada día para que siempre tengas lo mejor.', image: null },
          { icon: 'i-lucide-heart', title: 'Amor', description: 'Ponemos el corazón en cada pieza que sale del horno.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'Los artesanos del pan', layout: 'grid-3', members: [] },
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'Desde 1985 endulzando vidas', events: [
          { year: '1985', title: 'El comienzo', description: 'La abuela Carmen abrió la primera panadería con una receta de masa madre.', icon: 'i-lucide-wheat', image: null },
          { year: '2000', title: 'Segunda generación', description: 'Los hijos asumieron el negocio y ampliaron el catálogo de productos.', icon: 'i-lucide-users', image: null },
          { year: '2015', title: 'Modernización', description: 'Incorporamos tecnología manteniendo la receta original.', icon: 'i-lucide-trending-up', image: null },
          { year: '2024', title: 'Tercera generación', description: 'Los nietos llevan la tradición a nuevas generaciones.', icon: 'i-lucide-heart', image: null },
        ]},
        map: { show: false, headline: 'Visítanos', address: 'Carrera 15 #82-20, Bogotá', latitude: 4.668, longitude: -74.055, phone: '+57 300 456 7890', hours: 'Lun - Sáb: 7:00 - 20:00' },
        cta: { show: true, headline: '¿Listo para probar?', subtext: 'Ven a visitarnos o pide tu pedido favorito.', cta_primary: { label: 'Hacer pedido', url: '/catalogo' }, cta_secondary: { label: 'Visitar panadería', url: '/tiendas' }, bg_color: '#be185d', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Playfair Display', heading_weight: 700, base_size: 16 },
        colores: { primario: '#db2777', secundario: '#be185d', fondo: '#fdf2f8', accent: '#f472b6' },
        paleta: { texto_principal_claro: '#1c1917', texto_principal_oscuro: '#fdf2f8', texto_secundario_claro: '#78716c', texto_secundario_oscuro: '#d6d3d1', texto_muted_claro: '#a8a29e', texto_muted_oscuro: '#78716c', borde_claro: '#f3e8ff', borde_oscuro: '#44403c', superficie_claro: '#ffffff', superficie_oscuro: '#1c1917', fondo_alt_claro: '#fdf2f8', fondo_alt_oscuro: '#292524', marca_claro: '#db2777', marca_oscuro: '#f472b6', marca_hover_claro: '#be185d', marca_hover_oscuro: '#f9a8d4', acento_claro: '#f472b6', acento_oscuro: '#f9a8d4', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1c1917', fondo_imagenes: '#fdf2f8', fondo_imagenes_dark: '#292524', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1c1917', tipo_fondo: 'solid', gradiente_from: '#db2777', gradiente_via: '#be185d', gradiente_to: '#f472b6', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-right', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegir TechZone?', subtitle: 'Tu tienda de confianza en tecnología', items: [
          { icon: 'i-lucide-zap', title: 'Specs recientes', description: 'Siempre con la tecnología más actualizada del mercado.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía extendida', description: '2 años de garantía en todos los productos con soporte técnico dedicado.' },
          { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu producto en menos de 24 horas en ciudades principales.' },
          { icon: 'i-lucide-headphones', title: 'Soporte experto', description: 'Equipo de especialistas que resuelve cualquier duda técnica.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Rendimiento que impresiona', subtitle: 'Especificaciones detalladas', items: [
          { icon: 'i-lucide-cpu', title: 'Potencia de procesamiento', description: 'Chips de última generación para máximo rendimiento.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
          { icon: 'i-lucide-monitor', title: 'Pantallas de alta resolución', description: 'Displays con tecnología OLED y tasas de refresco de 120Hz.', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80' },
        ]},
        comparison: { product_ids: [], order: 3, title: 'Comparación de productos', subtitle: 'Elige el que mejor se adapte a tus necesidades', items: [] },
        testimonials: { product_ids: [], order: 4, variant: 'carousel', title: 'Lo que dicen los reviewers', subtitle: 'Opiniones de expertos en tecnología', items: [
          { name: 'Roberto Sánchez', role: 'Reviewer Tech', avatar: null, rating: 5, text: 'La gama de productos es impresionante. Siempre encuentro lo último antes que en cualquier otro lado.' },
          { name: 'Patricia León', role: 'Ingeniera de software', avatar: null, rating: 5, text: 'El soporte post-venta es excepcional. Me ayudaron a configurar todo sin ningún problema.' },
        ]},
        warranty: { show: true, order: 5, variant: 'cards', headline: 'Compra con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía 2 años', description: 'Cobertura completa en todos los productos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días para cambios sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Asistencia técnica cuando la necesites.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 6, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre tecnología', items: [
          { question: '¿Cómo elegir el equipo correcto?', answer: 'Compara rendimiento, compatibilidad, autonomía y el uso principal que tendrás para encontrar el modelo adecuado.' },
          { question: '¿Incluyen garantía?', answer: 'Los productos cuentan con las condiciones de garantía indicadas en su ficha y según el fabricante.' },
          { question: '¿Ofrecen soporte después de la compra?', answer: 'Sí. Nuestro equipo puede orientarte con configuración, compatibilidad y dudas de uso.' },
        ]},
        cta: { show: true, order: 7, variant: 'gradient', headline: 'La Próxima Actualización Te Espera', subtext: 'No te quedes con lo viejo. Actualiza tu setup con la tecnología más reciente.', cta_primary: { label: 'Ver catálogo completo', url: '/catalogo' }, cta_secondary: { label: 'Recibir ofertas tech', url: '/newsletter' }, bg_color: '#172554', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Innovación sin Límites', subtext: 'La tecnología que necesitas, con el servicio que mereces. Desde 2018 conectando personas con la innovación.', background_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Hacer la tecnología accesible para todos, ofreciendo productos de última generación con soporte experto y la mejor experiencia de compra.', mission_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la tienda de tecnología de referencia en Latinoamérica, reconocida por la innovación, la confianza y el soporte post-venta.', vision_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los pilares de nuestra marca', layout: 'grid-3', items: [
          { icon: 'i-lucide-zap', title: 'Innovación', description: 'Siempre a la vanguardia de la tecnología.', image: null },
          { icon: 'i-lucide-shield-check', title: 'Confianza', description: 'Garantía real y transparencia en cada compra.', image: null },
          { icon: 'i-lucide-headphones', title: 'Soporte', description: 'Asesoría experta antes, durante y después de la compra.', image: null },
          { icon: 'i-lucide-award', title: 'Calidad', description: 'Solo productos que superan nuestros estándares.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los especialistas detrás de TechZone', layout: 'grid-3', members: [
          { name: 'Alejandro Pérez', role: 'Director de Tecnología', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Ingeniero con 10 años en la industria tech.' },
          { name: 'Laura Gómez', role: 'Jefa de Soporte', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: 'Especialista en experiencia de cliente.' },
        ]},
        timeline: { show: false, title: 'Nuestra Historia', subtitle: 'De la visión a la realidad', events: [] },
        map: { show: false, headline: 'Visítanos', address: 'Calle Tech #45-67, Bogotá', latitude: 4.672, longitude: -74.057, phone: '+57 300 234 5678', hours: 'Lun - Sáb: 10:00 - 20:00' },
        cta: { show: true, headline: '¿Listo para innovar?', subtext: 'Explora nuestro catálogo y encuentra la tecnología que necesitas.', cta_primary: { label: 'Ver catálogo', url: '/catalogo' }, cta_secondary: { label: 'Contactar soporte', url: '/soporte' }, bg_color: '#172554', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 600, base_size: 16 },
        colores: { primario: '#2563eb', secundario: '#4338ca', fondo: '#eff6ff', accent: '#3b82f6' },
        paleta: { texto_principal_claro: '#1e293b', texto_principal_oscuro: '#eff6ff', texto_secundario_claro: '#64748b', texto_secundario_oscuro: '#cbd5e1', texto_muted_claro: '#94a3b8', texto_muted_oscuro: '#64748b', borde_claro: '#e2e8f0', borde_oscuro: '#334155', superficie_claro: '#ffffff', superficie_oscuro: '#0f172a', fondo_alt_claro: '#f0f9ff', fondo_alt_oscuro: '#1e293b', marca_claro: '#2563eb', marca_oscuro: '#3b82f6', marca_hover_claro: '#1d4ed8', marca_hover_oscuro: '#60a5fa', acento_claro: '#3b82f6', acento_oscuro: '#60a5fa', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#0f172a', fondo_imagenes: '#f0f9ff', fondo_imagenes_dark: '#1e293b', fondo_componentes: '#ffffff', fondo_componentes_dark: '#0f172a', tipo_fondo: 'solid', gradiente_from: '#2563eb', gradiente_via: '#4338ca', gradiente_to: '#3b82f6', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegirnos?', subtitle: 'Gadgets inteligentes para tu día a día', items: [
          { icon: 'i-lucide-smartphone', title: 'Smart devices', description: 'Última tecnología en gadgets y dispositivos inteligentes.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía 2 años', description: 'Cobertura completa en todos nuestros productos.' },
          { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'Envío gratuito en pedidos superiores a $99.000.' },
          { icon: 'i-lucide-headphones', title: 'Soporte técnico', description: 'Equipo especializado para resolver tus dudas.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Conectividad inteligente', subtitle: 'Tecnología que simplifica tu vida', items: [
          { icon: 'i-lucide-wifi', title: 'Conectividad total', description: 'Todos nuestros gadgets se conectan entre sí para una experiencia seamlessly.', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80' },
          { icon: 'i-lucide-smartphone', title: 'Control desde tu móvil', description: 'Gestiona todos tus dispositivos desde una sola app.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Lo que dicen nuestros usuarios', subtitle: 'Gadget enthusiasts de toda Latinoamérica', items: [
          { name: 'Diego Morales', role: 'Tech enthusiast', avatar: null, rating: 5, text: 'Increíble la variedad de gadgets. Siempre encuentro algo nuevo y útil para automatizar mi hogar.' },
          { name: 'Valentina Ríos', role: 'Influencer tech', avatar: null, rating: 5, text: 'Los productos son de excelente calidad y el soporte técnico es muy rápido.' },
        ]},
        warranty: { show: true, order: 4, variant: 'cards', headline: 'Compra segura', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía extendida', description: '2 años de cobertura completa.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: '30 días sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Ayuda cuando la necesites.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre nuestros gadgets', items: [
          { question: '¿Cómo funcionan los dispositivos inteligentes?', answer: 'Se conectan vía WiFi o Bluetooth a tu red doméstica y se controlan desde nuestra app móvil disponible para iOS y Android.' },
          { question: '¿Son compatibles con Alexa y Google Home?', answer: 'Sí, la mayoría de nuestros gadgets son compatibles con las principales plataformas de asistentes virtuales.' },
          { question: '¿Qué incluye la garantía?', answer: 'Cobertura contra defectos de fabricación por 2 años, incluyendo reparación o reemplazo sin costo.' },
        ]},
        cta: { show: true, order: 6, variant: 'banner', headline: 'Haz tu vida más inteligente', subtext: 'Los gadgets que necesitas para automatizar y mejorar cada aspecto de tu día.', cta_primary: { label: 'Comprar gadgets', url: '/catalogo' }, cta_secondary: { label: 'Ver guía Smart Home', url: '/guia-smart-home' }, bg_color: '#6d28d9', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Tu Mundo Conectado', subtext: 'Gadgets inteligentes para simplificar tu vida. Desde 2019 conectando hogares y personas con la tecnología.', background_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Simplificar la vida a través de la tecnología, ofreciendo gadgets inteligentes que hacen tu día más fácil, conectado y eficiente.', mission_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la tienda de gadgets más completa y confiable de Latinoamérica, donde cada persona pueda encontrar la tecnología que necesita.', vision_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Lo que nos define', layout: 'grid-3', items: [
          { icon: 'i-lucide-wifi', title: 'Conectividad', description: 'Un mundo donde todo se comunica entre sí.', image: null },
          { icon: 'i-lucide-lightbulb', title: 'Simplificación', description: 'La tecnología debe hacer la vida más fácil, no más complicada.', image: null },
          { icon: 'i-lucide-zap', title: 'Innovación', description: 'Siempre buscamos lo último en tecnología.', image: null },
          { icon: 'i-lucide-shield-check', title: 'Confianza', description: 'Productos de calidad con garantía real.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'Los detrás de GadgetLab', layout: 'grid-3', members: [] },
        timeline: { show: false, title: 'Nuestra Historia', subtitle: 'De la idea a tu hogar', events: [] },
        map: { show: false, headline: 'Visítanos', address: 'Calle Gadget #78-90, Bogotá', latitude: 4.668, longitude: -74.055, phone: '+57 300 567 8901', hours: 'Lun - Sáb: 10:00 - 20:00' },
        cta: { show: true, headline: '¿Listo para conectarte?', subtext: 'Explora nuestro catálogo de gadgets inteligentes.', cta_primary: { label: 'Ver gadgets', url: '/catalogo' }, cta_secondary: { label: 'Guía Smart Home', url: '/guia-smart-home' }, bg_color: '#6d28d9', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 600, base_size: 16 },
        colores: { primario: '#7c3aed', secundario: '#6d28d9', fondo: '#f5f3ff', accent: '#a78bfa' },
        paleta: { texto_principal_claro: '#1e1b4b', texto_principal_oscuro: '#f5f3ff', texto_secundario_claro: '#6b7280', texto_secundario_oscuro: '#d1d5db', texto_muted_claro: '#9ca3af', texto_muted_oscuro: '#6b7280', borde_claro: '#e5e7eb', borde_oscuro: '#374151', superficie_claro: '#ffffff', superficie_oscuro: '#1e1b4b', fondo_alt_claro: '#ede9fe', fondo_alt_oscuro: '#272452', marca_claro: '#7c3aed', marca_oscuro: '#a78bfa', marca_hover_claro: '#6d28d9', marca_hover_oscuro: '#c4b5fd', acento_claro: '#a78bfa', acento_oscuro: '#c4b5fd', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1e1b4b', fondo_imagenes: '#ede9fe', fondo_imagenes_dark: '#272452', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1e1b4b', tipo_fondo: 'solid', gradiente_from: '#7c3aed', gradiente_via: '#6d28d9', gradiente_to: '#a78bfa', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'split', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegirnos?', subtitle: 'Tu rendimiento nos importa', items: [
          { icon: 'i-lucide-zap', title: 'Asesoría deportiva', description: 'Te ayudamos a elegir el equipamiento ideal para tu disciplina y nivel.' },
          { icon: 'i-lucide-truck', title: 'Envío prioritario', description: 'Entrega rápida para que no pares tu entrenamiento ni un día.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía rendimiento', description: 'Si el producto no cumple, lo cambiamos sin preguntas en 30 días.' },
          { icon: 'i-lucide-trophy', title: 'Club de atletas', description: 'Acceso a descuentos exclusivos, eventos y contenido premium.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Rendimiento y durabilidad', subtitle: 'Equipamiento que supera tus expectativas', items: [
          { icon: 'i-lucide-zap', title: 'Alto rendimiento', description: 'Diseñado para atletas que exigen lo máximo de su equipamiento.', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=600&q=80' },
          { icon: 'i-lucide-shield', title: 'Durabilidad extrema', description: 'Materiales resistentes que aguantan los entrenamientos más duros.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Lo que dicen los atletas', subtitle: 'Opiniones de quienes entrenan con nosotros', items: [
          { name: 'Juan David Pérez', role: 'Maratonista', avatar: null, rating: 5, text: 'LosTenis que compré superaron mis expectativas. Marqué mi mejor tiempo personal.' },
          { name: 'Natalia Gómez', role: 'Crossfitera', avatar: null, rating: 5, text: 'La variedad de equipamiento para crossfit es increíble. Todo de primera calidad.' },
        ]},
        warranty: { show: true, order: 4, variant: 'cards', headline: 'Entrena con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía rendimiento', description: '30 días de garantía en todos los productos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: 'Cambio sin preguntas en 30 días.' },
          { icon: 'i-lucide-headphones', title: 'Soporte deportivo', description: 'Asesoría de especialistas en fitness.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre equipamiento deportivo', items: [
          { question: '¿Qué equipo necesito para empezar?', answer: 'Depende de tu disciplina, nivel y objetivo. Las categorías están organizadas para facilitar esa decisión.' },
          { question: '¿Puedo cambiar una talla?', answer: 'Consulta las condiciones de cambio de cada producto antes de finalizar tu compra.' },
          { question: '¿Tienen productos para entrenamiento en casa?', answer: 'Sí. Disponemos de opciones para fuerza, cardio, movilidad y recuperación en espacios reducidos.' },
        ]},
        cta: { show: true, order: 6, variant: 'split', headline: 'Supera Tus Límites', subtext: 'Con el equipamiento adecuado, no hay meta que no puedas alcanzar.', cta_primary: { label: 'Comprar ahora', url: '/catalogo' }, cta_secondary: { label: 'Guía de entrenamiento', url: '/guias' }, bg_color: '#052e16', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Rendimiento Máximo', subtext: 'Equípate con lo mejor para alcanzar tus metas deportivas. Desde 2017 potenciando el rendimiento de cada atleta.', background_image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Potenciar el rendimiento de cada atleta ofreciendo equipamiento deportivo de la más alta calidad, con asesoría especializada y entrega prioritaria.', mission_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la tienda deportiva de referencia en Latinoamérica, reconocida por la variedad, la calidad y el compromiso con el rendimiento de cada atleta.', vision_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los principios del rendimiento', layout: 'grid-3', items: [
          { icon: 'i-lucide-zap', title: 'Rendimiento', description: 'Cada producto está diseñado para maximizar tu potencial.', image: null },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Más que una tienda, una comunidad de atletas.', image: null },
          { icon: 'i-lucide-award', title: 'Calidad', description: 'Solo marcas que superan los más altos estándares.', image: null },
          { icon: 'i-lucide-heart', title: 'Pasión', description: 'Amamos el deporte y lo reflejamos en todo.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los especialistas en deporte', layout: 'grid-3', members: [
          { name: 'Carlos Martínez', role: 'Director Deportivo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Ex-atleta profesional con 15 años en la industria.' },
          { name: 'Laura Sánchez', role: 'Asesora de Equipamiento', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: 'Especialista en biomecánica y equipamiento deportivo.' },
        ]},
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'Del gimnasio a Latinoamérica', events: [
          { year: '2017', title: 'El comienzo', description: 'Abrimos nuestra primera tienda con 50 productos.', icon: 'i-lucide-dumbbell', image: null },
          { year: '2019', title: 'Crecimiento', description: 'Expandimos a 500+ productos y 20 marcas.', icon: 'i-lucide-trending-up', image: null },
          { year: '2022', title: 'Online', description: 'Lanzamos nuestra plataforma digital.', icon: 'i-lucide-globe', image: null },
          { year: '2024', title: 'Referencia', description: 'Más de 10,000 atletas equipados.', icon: 'i-lucide-trophy', image: null },
        ]},
        map: { show: false, headline: 'Visítanos', address: 'Calle Deportes #100-20, Bogotá', latitude: 4.662, longitude: -74.052, phone: '+57 300 678 9012', hours: 'Lun - Sáb: 8:00 - 20:00' },
        cta: { show: true, headline: '¿Listo para entrenar?', subtext: 'Equipa tu pasión con lo mejor del mercado.', cta_primary: { label: 'Ver equipamiento', url: '/catalogo' }, cta_secondary: { label: 'Guía de entrenamiento', url: '/guias' }, bg_color: '#052e16', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 700, base_size: 16 },
        colores: { primario: '#16a34a', secundario: '#047857', fondo: '#f0fdf4', accent: '#10b981' },
        paleta: { texto_principal_claro: '#14532d', texto_principal_oscuro: '#f0fdf4', texto_secundario_claro: '#6b7280', texto_secundario_oscuro: '#d1d5db', texto_muted_claro: '#9ca3af', texto_muted_oscuro: '#6b7280', borde_claro: '#d1fae5', borde_oscuro: '#065f46', superficie_claro: '#ffffff', superficie_oscuro: '#14532d', fondo_alt_claro: '#dcfce7', fondo_alt_oscuro: '#166534', marca_claro: '#16a34a', marca_oscuro: '#10b981', marca_hover_claro: '#047857', marca_hover_oscuro: '#34d399', acento_claro: '#10b981', acento_oscuro: '#34d399', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#14532d', fondo_imagenes: '#dcfce7', fondo_imagenes_dark: '#166534', fondo_componentes: '#ffffff', fondo_componentes_dark: '#14532d', tipo_fondo: 'solid', gradiente_from: '#16a34a', gradiente_via: '#047857', gradiente_to: '#10b981', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué FitLife?', subtitle: 'Resultados que hablan por sí solos', items: [
          { icon: 'i-lucide-dumbbell', title: 'Equipamiento premium', description: 'Marcas reconocidas mundialmente por su calidad y durabilidad.' },
          { icon: 'i-lucide-flask-conical', title: 'Suplementos certificados', description: 'Todos nuestros suplementos están certificados y probados en laboratorio.' },
          { icon: 'i-lucide-video', title: 'Rutinas gratis', description: 'Accede a rutinas de entrenamiento creadas por expertos en fitness.' },
          { icon: 'i-lucide-users', title: 'Comunidad FitLife', description: 'Únete a miles de atletas que comparten sus progresos y motivación.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Rendimiento superior', subtitle: 'Tecnología para tu cuerpo', items: [
          { icon: 'i-lucide-dumbbell', title: 'Equipamiento profesional', description: 'Marcas que usan los mejores atletas del mundo.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
          { icon: 'i-lucide-flask-conical', title: 'Suplementos de grado farmacéutico', description: 'Calidad garantizada con certificaciones internacionales.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Transformaciones reales', subtitle: 'Historias de personas que cambiaron su vida', items: [
          { name: 'Diego Alejandro Muñoz', role: 'Entrenador personal', avatar: null, rating: 5, text: 'Llevo 3 años usando sus suplementos y la diferencia es notable. Mis clientes siempre preguntan qué uso.' },
          { name: 'Laura Sofía Ramírez', role: 'Competidora de fitness', avatar: null, rating: 5, text: 'La calidad de los suplementos me dio el impulso que necesitaba para competir en nivel nacional.' },
        ]},
        ugc: { show: true, order: 4, title: 'Comunidad FitLife', subtitle: 'Transformaciones reales de nuestra comunidad', items: [] },
        warranty: { show: true, order: 5, variant: 'cards', headline: 'Entrena con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía de calidad', description: 'Productos certificados y probados.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: '30 días sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Soporte fitness', description: 'Asesoría de especialistas.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 6, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre fitness y suplementación', items: [
          { question: '¿Cómo elegir mi suplemento?', answer: 'Depende de tu objetivo: ganancia muscular, resistencia, recuperación o pérdida de peso. Consulta nuestras guías.' },
          { question: '¿Los suplementos son seguros?', answer: 'Sí. Todos nuestros suplementos están certificados, probados en laboratorio y cumplen con normativas internacionales.' },
          { question: '¿Puedo combinar suplementos?', answer: 'Sí. Ofrecemos guías de combinación según tu objetivo. Consulta con nuestro equipo para un plan personalizado.' },
        ]},
        cta: { show: true, order: 7, variant: 'gradient', headline: 'Tu Transformación Empieza Hoy', subtext: 'No esperes al lunes. El mejor momento para empezar es ahora.', cta_primary: { label: 'Empezar ahora', url: '/catalogo' }, cta_secondary: { label: 'Ver plan de entrenamiento', url: '/planes' }, bg_color: '#dc2626', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Transforma Tu Cuerpo', subtext: 'Suplementos y equipamiento de alto rendimiento para quienes buscan resultados reales. Desde 2016 transformando vidas.', background_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Ayudar a personas a alcanzar sus objetivos fitness ofreciendo productos de alta calidad, asesoría experta y una comunidad que motive.', mission_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la comunidad fitness más grande y confiable de Latinoamérica, reconocida por transformar vidas a través de la salud y el ejercicio.', vision_image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d7a6?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los pilares de tu transformación', layout: 'grid-3', items: [
          { icon: 'i-lucide-trending-up', title: 'Resultados', description: 'Todo está diseñado para ayudarte a alcanzar tus metas.', image: null },
          { icon: 'i-lucide-award', title: 'Calidad', description: 'Solo productos que superan estándares internacionales.', image: null },
          { icon: 'i-lucide-users', title: 'Comunidad', description: 'Más que clientes, somos una familia fitness.', image: null },
          { icon: 'i-lucide-zap', title: 'Innovación', description: 'Siempre lo último en ciencia deportiva.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'Los detrás de FitLife', layout: 'grid-3', members: [] },
        timeline: { show: true, title: 'Nuestra Historia', subtitle: 'De la idea a tu transformación', events: [
          { year: '2016', title: 'El comienzo', description: 'Un grupo de atletas decidió crear la tienda que siempre quisieron.', icon: 'i-lucide-heart-pulse', image: null },
          { year: '2018', title: 'Crecimiento', description: 'Expandimos a suplementos y equipamiento premium.', icon: 'i-lucide-trending-up', image: null },
          { year: '2021', title: 'Comunidad', description: 'Lanzamos nuestra plataforma de contenido fitness.', icon: 'i-lucide-users', image: null },
          { year: '2024', title: 'Líderes', description: 'Más de 15,000 atletas activos en nuestra comunidad.', icon: 'i-lucide-trophy', image: null },
        ]},
        map: { show: false, headline: 'Visítanos', address: 'Calle Fitness #55-77, Bogotá', latitude: 4.672, longitude: -74.057, phone: '+57 300 789 0123', hours: 'Lun - Sáb: 6:00 - 22:00' },
        cta: { show: true, headline: '¿Listo para transformarte?', subtext: 'Únete a la comunidad FitLife y empieza tu camino.', cta_primary: { label: 'Empezar ahora', url: '/catalogo' }, cta_secondary: { label: 'Ver planes', url: '/planes' }, bg_color: '#dc2626', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 700, base_size: 16 },
        colores: { primario: '#ef4444', secundario: '#e11d48', fondo: '#fef2f2', accent: '#f43f5e' },
        paleta: { texto_principal_claro: '#1f2937', texto_principal_oscuro: '#fef2f2', texto_secundario_claro: '#6b7280', texto_secundario_oscuro: '#d1d5db', texto_muted_claro: '#9ca3af', texto_muted_oscuro: '#6b7280', borde_claro: '#fecaca', borde_oscuro: '#991b1b', superficie_claro: '#ffffff', superficie_oscuro: '#1f2937', fondo_alt_claro: '#fee2e2', fondo_alt_oscuro: '#450a0a', marca_claro: '#ef4444', marca_oscuro: '#f43f5e', marca_hover_claro: '#e11d48', marca_hover_oscuro: '#fb7185', acento_claro: '#f43f5e', acento_oscuro: '#fb7185', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1f2937', fondo_imagenes: '#fee2e2', fondo_imagenes_dark: '#450a0a', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1f2937', tipo_fondo: 'solid', gradiente_from: '#ef4444', gradiente_via: '#e11d48', gradiente_to: '#f43f5e', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'gallery-left', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegirnos?', subtitle: 'Una experiencia de compra sin complicaciones', items: [
          { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas en todo el país.' },
          { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos 100% protegidos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Soporte real', description: 'Atención humana cuando la necesitas.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Simplicidad y calidad', subtitle: 'Menos es más', items: [
          { icon: 'i-lucide-sparkles', title: 'Diseño limpio', description: 'Productos seleccionados con atención al detalle y la funcionalidad.', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80' },
          { icon: 'i-lucide-check-circle', title: 'Calidad garantizada', description: 'Cada producto supera nuestros rigurosos estándares de calidad.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Opiniones reales', subtitle: 'La confianza de nuestros clientes', items: [
          { name: 'Pedro Sánchez', role: 'Cliente frecuente', avatar: null, rating: 5, text: 'Excelente experiencia de compra. Todo rápido, claro y sin complicaciones. Volveré a comprar.' },
          { name: 'Marta Herrera', role: 'Nueva clienta', avatar: null, rating: 5, text: 'Me encantó la simplicidad. Encontré lo que buscabas en 2 minutos y llegó al día siguiente.' },
        ]},
        warranty: { show: true, order: 4, variant: 'cards', headline: 'Compra con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía de calidad', description: 'Si no estás satisfecho, lo cambiamos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: '30 días sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Soporte disponible', description: 'Estamos para ayudarte.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 5, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo claro antes de comprar', items: [
          { question: '¿Cómo encuentro un producto rápido?', answer: 'Utiliza categorías, búsqueda y filtros para reducir el catálogo hasta encontrar exactamente lo que necesitas.' },
          { question: '¿Cómo funcionan los cambios?', answer: 'Cada producto muestra sus condiciones de cambio y devolución para que puedas comprar con tranquilidad.' },
          { question: '¿Puedo recibir ayuda?', answer: 'Sí. Nuestro equipo está disponible para resolver dudas sobre productos, pedidos y entregas.' },
        ]},
        cta: { show: true, order: 6, variant: 'banner', headline: '¿Listo para tu próxima compra?', subtext: 'Descubre el catálogo completo y disfruta de una experiencia sin complicaciones.', cta_primary: { label: 'Ir al catálogo', url: '/catalogo' }, cta_secondary: { label: 'Crear cuenta', url: '/auth/register' }, bg_color: '#334155', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Bienvenido a Tu Tienda', subtext: 'Productos curados con cuidado, envío rápido y una experiencia de compra tan limpia como nuestro diseño.', background_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Ofrecer una experiencia de compra limpia y sin complicaciones, con productos seleccionados cuidadosamente y un servicio que haga la diferencia.', mission_image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser sinónimo de simplicidad y calidad en el comercio electrónico, donde cada compra sea una experiencia placentera.', vision_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los principios de nuestra tienda', layout: 'grid-3', items: [
          { icon: 'i-lucide-layout', title: 'Simplicidad', description: 'Sin ruido, sin complicaciones. Solo lo esencial.', image: null },
          { icon: 'i-lucide-award', title: 'Calidad', description: 'Cada producto seleccionado con los más altos estándares.', image: null },
          { icon: 'i-lucide-eye', title: 'Transparencia', description: 'Todo claro desde el primer momento.', image: null },
          { icon: 'i-lucide-zap', title: 'Eficiencia', description: 'Rápido, directo y sin pasos innecesarios.', image: null },
        ]},
        team: { show: false, title: 'Nuestro Equipo', subtitle: 'Los detrás de la tienda', layout: 'grid-3', members: [] },
        timeline: { show: false, title: 'Nuestra Historia', subtitle: 'Del diseño a tu puerta', events: [] },
        map: { show: false, headline: 'Visítanos', address: 'Calle Clean #33-44, Bogotá', latitude: 4.668, longitude: -74.055, phone: '+57 300 890 1234', hours: 'Lun - Vie: 9:00 - 18:00' },
        cta: { show: true, headline: '¿Listo para una experiencia diferente?', subtext: 'Compra sin complicaciones y descubre por qué somos diferentes.', cta_primary: { label: 'Explorar catálogo', url: '/catalogo' }, cta_secondary: { label: 'Contactar', url: '/contacto' }, bg_color: '#334155', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 400, base_size: 16 },
        colores: { primario: '#475569', secundario: '#64748b', fondo: '#f8fafc', accent: '#334155' },
        paleta: { texto_principal_claro: '#1e293b', texto_principal_oscuro: '#f8fafc', texto_secundario_claro: '#64748b', texto_secundario_oscuro: '#cbd5e1', texto_muted_claro: '#94a3b8', texto_muted_oscuro: '#64748b', borde_claro: '#e2e8f0', borde_oscuro: '#334155', superficie_claro: '#ffffff', superficie_oscuro: '#1e293b', fondo_alt_claro: '#f1f5f9', fondo_alt_oscuro: '#1e293b', marca_claro: '#475569', marca_oscuro: '#94a3b8', marca_hover_claro: '#334155', marca_hover_oscuro: '#cbd5e1', acento_claro: '#334155', acento_oscuro: '#64748b', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1e293b', fondo_imagenes: '#f1f5f9', fondo_imagenes_dark: '#1e293b', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1e293b', tipo_fondo: 'solid', gradiente_from: '#475569', gradiente_via: '#64748b', gradiente_to: '#334155', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.5rem', radius_buttons: '0.5rem', radius_cards: '0.5rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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

      producto: {
        hero: { show: true, order: 0, variant: 'full-width', gallery_style: 'grid', show_breadcrumbs: true, show_share: true, sticky_add_to_cart: true, show_rating: true, show_sku: true },
        benefits: { show: true, order: 1, variant: 'horizontal', title: '¿Por qué elegirnos?', subtitle: 'Colores que cuentan tu historia', items: [
          { icon: 'i-lucide-palette', title: 'Personalización', description: 'Elige entre más de 200 combinaciones de colores.' },
          { icon: 'i-lucide-sparkles', title: 'Colores únicos', description: 'Pigmentos de alta calidad que no se desvanecen.' },
          { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas.' },
          { icon: 'i-lucide-shield-check', title: 'Garantía', description: 'Si el color no es el esperado, lo cambiamos.' },
        ]},
        features: { product_ids: [], order: 2, variant: 'alternating', title: 'Expresión y creatividad', subtitle: 'Colores para cada personalidad', items: [
          { icon: 'i-lucide-palette', title: 'Paleta infinita', description: 'Colores vibrantes, pasteles y neón para cada ocasión.', image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&q=80' },
          { icon: 'i-lucide-brush', title: 'Acabado premium', description: 'Colores intensos con acabados mates, brillantes o metalizados.', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80' },
        ]},
        testimonials: { product_ids: [], order: 3, variant: 'carousel', title: 'Voces del mundo', subtitle: 'Personas que aman el color', items: [
          { name: 'Luciana Fernández', role: 'Artista visual', avatar: null, rating: 5, text: 'Finalmente una tienda que entiende que los colores son expresión. Cada producto es una obra de arte.' },
          { name: 'Martín Castro', role: 'Diseñador de interiores', avatar: null, rating: 5, text: 'La variedad de tonos es impresionante. Encontré exactamente el color que necesitaba.' },
        ]},
        ugc: { show: true, order: 4, title: 'Inspiración colorida', subtitle: 'Mira cómo nuestros clientes usan los colores', items: [] },
        warranty: { show: true, order: 5, variant: 'cards', headline: 'Compra con confianza', items: [
          { icon: 'i-lucide-shield-check', title: 'Garantía de color', description: 'Si no es el color esperado, lo cambiamos.' },
          { icon: 'i-lucide-rotate-ccw', title: 'Devolución fácil', description: '30 días sin preguntas.' },
          { icon: 'i-lucide-headphones', title: 'Asesoría creativa', description: 'Te ayudamos a elegir tu paleta perfecta.' },
        ], cta_label: 'Ver políticas', cta_url: '/garantia' },
        faq: { show: true, order: 6, variant: 'accordion', title: 'Preguntas frecuentes', subtitle: 'Todo sobre personalización y colores', items: [
          { question: '¿Puedo personalizar colores?', answer: 'Sí. Ofrecemos más de 200 combinaciones de colores, incluyendo opciones personalizadas.' },
          { question: '¿Los colores se desvanecen?', answer: 'No. Utilizamos pigmentos de alta calidad resistentes a la luz y al lavado.' },
          { question: '¿Puedo ver muestras antes de comprar?', answer: 'Sí. Ofrecemos servicio de muestras gratuitas para que puedas ver el color en persona.' },
        ]},
        cta: { show: true, order: 7, variant: 'gradient', headline: 'Añade Color a Tu Vida', subtext: 'Explora nuestra paleta infinita y encuentra los colores que te representan.', cta_primary: { label: 'Explorar productos', url: '/catalogo' }, cta_secondary: { label: 'Crear mi paleta', url: '/personalizar' }, bg_color: '#7c3aed', text_color: '#ffffff' },
      },

      nosotros: {
        hero: { show: true, headline: 'Exprésate con Color', subtext: 'Colores que cuentan tu historia. Productos vibrantes para personas que no temen destacar.', background_image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80', overlay_opacity: 0.4, text_align: 'center' },
        mission_vision: { show: true, mission_title: 'Nuestra Misión', mission_text: 'Inspirar a personas a expresarse a través del color, ofreciendo productos vibrantes y personalizables que cuenten historias únicas.', mission_image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80', vision_title: 'Nuestra Visión', vision_text: 'Ser la tienda más colorida y expresiva de Latinoamérica, reconocida por la variedad, la calidad y la creatividad de nuestros productos.', vision_image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80', layout: 'side-by-side' },
        values: { show: true, title: 'Nuestros Valores', subtitle: 'Los pilares de la expresión', layout: 'grid-3', items: [
          { icon: 'i-lucide-brush', title: 'Creatividad', description: 'Cada producto es una oportunidad para crear algo único.', image: null },
          { icon: 'i-lucide-heart', title: 'Expresión', description: 'Los colores son el lenguaje de tu personalidad.', image: null },
          { icon: 'i-lucide-award', title: 'Calidad', description: 'Colores intensos que perduran en el tiempo.', image: null },
          { icon: 'i-lucide-smile', title: 'Diversidad', description: 'Colores para cada persona, cada momento, cada emoción.', image: null },
        ]},
        team: { show: true, title: 'Nuestro Equipo', subtitle: 'Los artistas del color', layout: 'grid-3', members: [
          { name: 'Isabela Moreno', role: 'Directora Creativa', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', bio: 'Artista visual con 10 años de experiencia en color.' },
          { name: 'Carlos Rodríguez', role: 'Diseñador de Color', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Especialista en teoría del color y tendencias.' },
        ]},
        timeline: { show: false, title: 'Nuestra Historia', subtitle: 'Del lienzo a tu vida', events: [] },
        map: { show: false, headline: 'Visítanos', address: 'Calle Color #88-99, Bogotá', latitude: 4.668, longitude: -74.055, phone: '+57 300 901 2345', hours: 'Lun - Sáb: 10:00 - 20:00' },
        cta: { show: true, headline: '¿Listo para expresarte?', subtext: 'Descubre nuestra paleta de colores y encuentra tu tono perfecto.', cta_primary: { label: 'Explorar colores', url: '/catalogo' }, cta_secondary: { label: 'Crear mi paleta', url: '/personalizar' }, bg_color: '#7c3aed', text_color: '#ffffff' },
      },

      estilos: {
        tipografia: { font_family: 'Inter', heading_weight: 700, base_size: 16 },
        colores: { primario: '#a855f7', secundario: '#6366f1', fondo: '#faf5ff', accent: '#ec4899' },
        paleta: { texto_principal_claro: '#1e1b4b', texto_principal_oscuro: '#faf5ff', texto_secundario_claro: '#6b7280', texto_secundario_oscuro: '#d1d5db', texto_muted_claro: '#9ca3af', texto_muted_oscuro: '#6b7280', borde_claro: '#e9d5ff', borde_oscuro: '#581c87', superficie_claro: '#ffffff', superficie_oscuro: '#1e1b4b', fondo_alt_claro: '#f3e8ff', fondo_alt_oscuro: '#3b0764', marca_claro: '#a855f7', marca_oscuro: '#c084fc', marca_hover_claro: '#9333ea', marca_hover_oscuro: '#d8b4fe', acento_claro: '#ec4899', acento_oscuro: '#f472b6', texto_sobre_marca_claro: '#ffffff', texto_sobre_marca_oscuro: '#ffffff' },
        fondos: { fondo_principal: '#ffffff', fondo_principal_dark: '#1e1b4b', fondo_imagenes: '#f3e8ff', fondo_imagenes_dark: '#3b0764', fondo_componentes: '#ffffff', fondo_componentes_dark: '#1e1b4b', tipo_fondo: 'solid', gradiente_from: '#a855f7', gradiente_via: '#6366f1', gradiente_to: '#ec4899', gradiente_direccion: 'to-br' },
        borders: { radius_global: '0.75rem', radius_buttons: '1rem', radius_cards: '0.75rem' },
        spacing: { section_padding: '5rem', container_max: '80rem' },
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
