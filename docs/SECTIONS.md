# Documentación de Secciones — Template Frontend

Guía completa de todos los componentes disponibles para personalizar la tienda, con sus campos, tipos de datos y variantes.

---

## Índice

- [Home Page (Secciones de Inicio)](#home-page)
- [Product Page (Secciones de Producto)](#product-page)
- [About Us Page (Secciones de Nosotros)](#about-us-page)
- [Sistema de Variantes](#sistema-de-variantes)
- [Estructura PageSection](#estructura-pagesection)

---

## Home Page

Secciones disponibles para la página de inicio. Se almacenan en `config.secciones` + `config.header` + `config.categories_home` + `config.page_sections[]`.

---

### 1. Hero

**Key:** `hero` | **Icon:** `i-lucide-layout-template` | **Categoría:** `hero`

Componente principal de la página de inicio. Soporta 7 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `classic` | Clásico | Dos columnas: texto a la izquierda, estadísticas a la derecha |
| `centered` | Centrado | Texto centrado con fondo a pantalla completa |
| `split` | Dividido | Texto a la izquierda, imagen grande a la derecha |
| `video` | Video | Fondo con video a pantalla completa con overlay oscuro |
| `slider` | Slider | Carrusel automático de slides con transiciones |
| `countdown` | Countdown | Hero con temporizador de cuenta regresiva en vivo |
| `parallax` | Parallax | Efecto parallax con elementos flotantes decorativos |

**Campos:**

```typescript
interface HeroSection {
  variant?: HeroVariant           // 'classic' | 'centered' | 'split' | 'video' | 'slider' | 'countdown' | 'parallax'
  badge?: string | null            // Badge o etiqueta destacada
  headline: string                 // Título principal
  subtext: string                  // Texto descriptivo
  cta_primary: {                   // Botón principal
    label: string                  // Texto del botón
    url: string                    // URL de destino
  }
  cta_secondary?: {                // Botón secundario (opcional)
    label: string
    url: string
  } | null
  background_image?: string | null // URL de imagen de fondo
  show_stats: boolean              // Mostrar estadísticas
  stats: Array<{                   // Lista de estadísticas
    value: string                  // Valor numérico/texto
    label: string                  // Descripción
  }>
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### 2. Beneficios

**Key:** `benefits` | **Icon:** `i-lucide-badge-check` | **Categoría:** `content`

Muestra las ventajas o beneficios de la tienda. Soporta 3 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `icons` | Iconos | Tarjetas compactas con icono y texto |
| `steps` | Pasos | Pasos numerados con línea conectora |
| `cards` | Tarjetas | Tarjetas elevadas con sombras y efectos hover |

**Campos:**

```typescript
interface BenefitsSection {
  variant?: BenefitsVariant       // 'icons' | 'steps' | 'cards'
  title: string                   // Título de la sección
  subtitle: string                // Subtítulo descriptivo
  items: Array<{                  // Lista de beneficios
    icon: string                  // Icono (i-lucide-*)
    title: string                 // Nombre del beneficio
    description: string           // Descripción
  }>
}
```

**Valores por defecto:**

```typescript
{
  variant: 'icons',
  title: 'Beneficios',
  subtitle: 'Por qué elegirnos',
  items: [
    { icon: 'i-lucide-truck', title: 'Envío express', description: 'Recibe tu pedido en 24-48 horas.' },
    { icon: 'i-lucide-shield-check', title: 'Compra segura', description: 'Pago encriptado y datos protegidos.' },
    { icon: 'i-lucide-rotate-ccw', title: 'Devoluciones fáciles', description: '30 días para cambios sin preguntas.' },
    { icon: 'i-lucide-headphones', title: 'Soporte real', description: 'Atención humana cuando la necesitas.' },
  ],
}
```

---

### 3. Categorías

**Key:** `categories` | **Icon:** `i-lucide-layers` | **Categoría:** `layout`

Muestra categorías de productos. Soporta 3 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `grid` | Cuadrícula | Tarjetas de categorías en cuadrícula responsiva |
| `carousel` | Carrusel | Scroll horizontal con peek de siguientes categorías |
| `pills` | Píldoras | Botones horizontales con icono y texto |

**Campos:**

```typescript
interface CategoriesSection {
  variant?: CategoriesHomeVariant // 'grid' | 'carousel' | 'pills'
  title: string                   // Título de la sección
  subtitle: string                // Subtítulo descriptivo
  show_all_link: boolean          // Mostrar enlace "Ver todas"
}
```

**Valores por defecto:**

```typescript
{
  variant: 'grid',
  title: 'Categorías',
  subtitle: 'Encuentra rápido lo que buscas',
  show_all_link: true,
}
```

---

### 4. Categorías Home

**Key:** `_categories_home` | **Icon:** `i-lucide-layout-grid` | **Categoría:** `layout`

Sección especial de categorías en la página de inicio con tarjetas de imagen.

**Campos:**

```typescript
interface CategoriesHomeSection {
  variant?: CategoriesHomeVariant // 'grid' | 'carousel' | 'pills'
  show: boolean                   // Mostrar sección
  title: string                   // Título
  subtitle: string                // Subtítulo
  layout: 'grid-2' | 'grid-3' | 'grid-4'  // Disposición del grid
  card_height: string             // Altura de tarjetas (ej: '280px')
  items: Array<{                  // Lista de categorías
    image: string | null          // URL de imagen
    name: string                  // Nombre
    description: string           // Descripción
    url: string                   // URL de enlace
    overlay_opacity: number       // Opacidad del overlay (0-1)
    text_color: string            // Color del texto (hex)
  }>
}
```

**Valores por defecto:**

```typescript
{
  variant: 'grid',
  show: true,
  title: 'Explora por categoría',
  subtitle: 'Encuentra exactamente lo que buscas',
  layout: 'grid-3',
  card_height: '280px',
  items: [
    { image: null, name: 'Tecnología', description: 'Lo último en innovación', url: '/categorias/tecnologia', overlay_opacity: 0.5, text_color: '#ffffff' },
    { image: null, name: 'Moda', description: 'Estilo y tendencia', url: '/categorias/moda', overlay_opacity: 0.5, text_color: '#ffffff' },
    { image: null, name: 'Hogar', description: 'Transforma tu espacio', url: '/categorias/hogar', overlay_opacity: 0.5, text_color: '#ffffff' },
  ],
}
```

---

### 5. Destacados

**Key:** `featured` | **Icon:** `i-lucide-star` | **Categoría:** `content`

Muestra productos destacados o populares. Soporta 3 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `grid` | Cuadrícula | Grid de productos destacados |
| `carousel` | Carrusel | Scroll horizontal de productos destacados |
| `large-cards` | Tarjetas grandes | Pocas tarjetas grandes con imagen y precio |

**Campos:**

```typescript
interface FeaturedSection {
  variant?: FeaturedVariant       // 'grid' | 'carousel' | 'large-cards'
  title: string                   // Título de la sección
  subtitle: string                // Subtítulo descriptivo
  show_all_link: boolean          // Mostrar enlace "Ver todos"
}
```

**Valores por defecto:**

```typescript
{
  variant: 'grid',
  title: 'Populares',
  subtitle: 'Lo que más eligen nuestros clientes',
  show_all_link: true,
}
```

---

### 6. Ofertas

**Key:** `deals` | **Icon:** `i-lucide-tag` | **Categoría:** `conversion`

Banner de ofertas y promociones.

**Campos:**

```typescript
interface DealsSection {
  badge: string                   // Etiqueta destacada (ej: 'Ofertas limitadas')
  headline: string                // Título principal
  subtext: string                 // Texto descriptivo
  cta_label: string               // Texto del botón CTA
  show_section: boolean           // Mostrar sección
}
```

**Valores por defecto:**

```typescript
{
  badge: 'Ofertas limitadas',
  headline: 'Hasta 30% en selección premium',
  subtext: 'Aprovecha descuentos reales en productos curados. Stock limitado y envío prioritario.',
  cta_label: 'Comprar ofertas',
  show_section: true,
}
```

---

### 7. Testimonios

**Key:** `testimonials` | **Icon:** `i-lucide-message-square-quote` | **Categoría:** `social`

Muestra opiniones de clientes. Soporta 3 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `cards` | Tarjetas | Grid de tarjetas con avatar, estrellas y texto |
| `spotlight` | Destacado | Un testimonio grande con navegación |
| `masonry` | Masonry | Grid asimétrico tipo Pinterest |

**Campos:**

```typescript
interface TestimonialsSection {
  variant?: TestimonialsVariant   // 'cards' | 'spotlight' | 'masonry'
  title: string                   // Título de la sección
  subtitle: string                // Subtítulo descriptivo
  items: Array<{                  // Lista de testimonios
    name: string                  // Nombre del cliente
    role: string                  // Rol o descripción
    avatar?: string | null        // URL del avatar
    rating: number                // Calificación (1-5)
    text: string                  // Texto del testimonio
  }>
}
```

**Valores por defecto:**

```typescript
{
  variant: 'cards',
  title: 'Lo que dicen nuestros clientes',
  subtitle: 'Confianza construida pedido a pedido',
  items: [
    { name: 'María G.', role: 'Cliente frecuente', avatar: null, rating: 5, text: 'Excelente experiencia. El envío fue súper rápido y la calidad impecable.' },
    { name: 'Carlos R.', role: 'Compra recurrente', avatar: null, rating: 5, text: 'Lo mejor es la transparencia. Todo claro desde el primer momento.' },
    { name: 'Laura M.', role: 'Nueva clienta', avatar: null, rating: 5, text: 'Diseño increíble y atención al cliente de otro nivel.' },
  ],
}
```

---

### 8. Newsletter

**Key:** `newsletter` | **Icon:** `i-lucide-mail` | **Categoría:** `conversion`

Formulario de suscripción a newsletter.

**Campos:**

```typescript
interface NewsletterSection {
  show: boolean                   // Mostrar sección
  headline: string                // Título principal
  subtext: string                 // Texto descriptivo
  placeholder: string             // Placeholder del input
  button_label: string            // Texto del botón
  bg_color: string                // Color de fondo (hex)
  text_color: string              // Color del texto (hex)
  layout: 'centered' | 'split'   // Disposición
  image: string | null            // URL de imagen (para layout split)
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Suscríbete a nuestro newsletter',
  subtext: 'Ofertas exclusivas, lanzamientos y descuentos directo a tu correo.',
  placeholder: 'Tu correo electrónico',
  button_label: 'Suscribirme',
  bg_color: '#6366f1',
  text_color: '#ffffff',
  layout: 'centered',
  image: null,
}
```

---

### 9. Marcas

**Key:** `brand_logos` | **Icon:** `i-lucide-heart` | **Categoría:** `social`

Muestra logos de marcas asociadas.

**Campos:**

```typescript
interface BrandLogosSection {
  show: boolean                   // Mostrar sección
  title: string                   // Título
  items: Array<{                  // Lista de marcas
    name: string                  // Nombre de la marca
    logo: string | null           // URL del logo
    url: string | null            // URL de enlace
  }>
  style: 'grayscale' | 'color' | 'minimal'  // Estilo visual
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Marcas que confían en nosotros',
  items: [
    { name: 'Nike', logo: null, url: null },
    { name: 'Apple', logo: null, url: null },
    { name: 'Samsung', logo: null, url: null },
    { name: 'Sony', logo: null, url: null },
  ],
  style: 'grayscale',
}
```

---

### 10. Galería

**Key:** `gallery_feed` | **Icon:** `i-lucide-instagram` | **Categoría:** `media`

Grid de imágenes tipo Instagram.

**Campos:**

```typescript
interface GalleryFeedSection {
  show: boolean                   // Mostrar sección
  title: string                   // Título
  subtitle: string                // Subtítulo
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry'  // Disposición
  items: Array<{                  // Lista de imágenes
    image: string                 // URL de imagen
    url: string | null            // URL de enlace
    caption: string | null        // Pie de foto
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Síguenos en Instagram',
  subtitle: 'Etiquétanos @tienda para aparecer aquí',
  layout: 'grid-4',
  items: [],
}
```

---

### 11. Estadísticas

**Key:** `stats` | **Icon:** `i-lucide-bar-chart-3` | **Categoría:** `content`

Muestra números clave de la tienda.

**Campos:**

```typescript
interface StatsSection {
  show: boolean                   // Mostrar sección
  layout: 'grid-3' | 'grid-4' | 'horizontal'  // Disposición
  bg_color: string                // Color de fondo (hex)
  text_color: string              // Color del texto (hex)
  items: Array<{                  // Lista de estadísticas
    value: string                 // Valor numérico/texto
    label: string                 // Descripción
    icon: string                  // Icono (i-lucide-*)
  }>
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### 12. Video

**Key:** `video` | **Icon:** `i-lucide-play-circle` | **Categoría:** `media`

Reproductor de video con thumbnail.

**Campos:**

```typescript
interface VideoSection {
  show: boolean                   // Mostrar sección
  headline: string                // Título
  subtext: string                 // Subtítulo
  video_url: string | null        // URL del video (YouTube/Vimeo)
  thumbnail: string | null        // URL del thumbnail
  aspect_ratio: '16:9' | '4:3' | '21:9'  // Relación de aspecto
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Mira cómo funciona',
  subtext: 'Un vistazo rápido a lo que nos hace diferentes.',
  video_url: null,
  thumbnail: null,
  aspect_ratio: '16:9',
}
```

---

### 13. Mapa

**Key:** `map` | **Icon:** `i-lucide-map-pin` | **Categoría:** `content`

Mapa con información de contacto/ubicación.

**Campos:**

```typescript
interface MapSection {
  show: boolean                   // Mostrar sección
  headline: string                // Título
  subtext: string                 // Subtítulo
  address: string                 // Dirección completa
  latitude: number | null         // Latitud (decimal)
  longitude: number | null        // Longitud (decimal)
  phone: string | null            // Teléfono
  hours: string | null            // Horario
  map_style: 'standard' | 'satellite' | 'terrain'  // Estilo del mapa
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Visítanos',
  subtext: 'Estamos en el corazón de la ciudad.',
  address: 'Calle Principal #123, Bogotá',
  latitude: 4.711,
  longitude: -74.0721,
  phone: '+57 300 000 0000',
  hours: 'Lun - Vie: 9:00 - 18:00',
  map_style: 'standard',
}
```

---

### 14. Texto Enriquecido

**Key:** `richtext` | **Icon:** `i-lucide-file-text` | **Categoría:** `content`

Bloque de texto con imagen opcional.

**Campos:**

```typescript
interface RichTextSection {
  show: boolean                   // Mostrar sección
  layout: 'full' | 'split-left' | 'split-right'  // Disposición
  headline: string                // Título
  content: string                 // Contenido (HTML soportado)
  image: string | null            // URL de imagen
  cta_label: string | null        // Texto del botón CTA
  cta_url: string | null          // URL del CTA
  bg_color: string | null         // Color de fondo (hex)
  text_color: string | null       // Color del texto (hex)
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  layout: 'full',
  headline: 'Nuestra historia',
  content: 'Somos una tienda comprometida con la calidad y la satisfacción del cliente.',
  image: null,
  cta_label: null,
  cta_url: null,
  bg_color: null,
  text_color: null,
}
```

---

### 15. CTA Final

**Key:** `cta` | **Icon:** `i-lucide-megaphone` | **Categoría:** `conversion`

Llamada a la acción final de la página. Soporta 3 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `banner` | Banner | Centrado con fondo decorativo |
| `split` | Dividido | Dos columnas con imagen a un lado |
| `gradient` | Gradiente | Fondo gradiente con efectos de luz |

**Campos:**

```typescript
interface CtaSection {
  variant?: CtaVariant            // 'banner' | 'split' | 'gradient'
  headline: string                // Título principal
  subtext: string                 // Texto descriptivo
  cta_primary: {                  // Botón principal
    label: string
    url: string
  }
  cta_secondary?: {               // Botón secundario (opcional)
    label: string
    url: string
  } | null
}
```

**Valores por defecto:**

```typescript
{
  variant: 'banner',
  headline: 'Listo para tu próxima compra?',
  subtext: 'Descubre el catálogo completo y finaliza en minutos.',
  cta_primary: { label: 'Ir al catálogo', url: '/catalogo' },
  cta_secondary: { label: 'Crear cuenta', url: '/auth/register' },
}
```

---

### 16. Header

**Key:** `_header` | **Icon:** `i-lucide-panel-top` | **Categoría:** `layout`

Sección especial del header de la tienda. Soporta 2 variantes.

| Variante | Label | Descripción |
|----------|-------|-------------|
| `animation` | Animación | Header con animaciones de entrada |
| `video` | Video | Fondo con video o imagen a pantalla completa |

**Campos:**

```typescript
interface HeaderSection {
  variant?: HeaderVariant         // 'animation' | 'video'
  show: boolean                   // Mostrar header
  background_image: string | null // URL de imagen de fondo
  headline: string                // Título principal
  subtext: string                 // Subtítulo
  cta_primary: {                  // Botón principal
    label: string
    url: string
  }
  cta_secondary: {                // Botón secundario (opcional)
    label: string
    url: string
  } | null
  overlay_color: string           // Color del overlay (hex)
  overlay_opacity: number         // Opacidad del overlay (0-1)
  animation: 'fade' | 'slide-up' | 'zoom'  // Tipo de animación
  text_align: 'left' | 'center' | 'right'  // Alineación del texto
  height: string                  // Altura (ej: '80vh')
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### 17. Banner de Urgencia

**Key:** `urgency_banner` | **Icon:** `i-lucide-alert-triangle` | **Categoría:** `conversion`

Banner horizontal con efecto shimmer para crear urgencia.

**Campos:**

```typescript
interface UrgencyBannerSection {
  headline: string                // Texto principal
  subtext: string                 // Texto secundario
  cta_label: string               // Texto del botón
  cta_url: string                 // URL del botón
  bg_color: string                // Color de fondo (hex)
  text_color: string              // Color del texto (hex)
  show_close: boolean             // Mostrar botón cerrar
}
```

---

### 18. Oferta Countdown

**Key:** `countdown_offer` | **Icon:** `i-lucide-timer` | **Categoría:** `conversion`

Oferta con temporizador de cuenta regresiva en vivo.

**Campos:**

```typescript
interface CountdownOfferSection {
  headline: string                // Título
  subtext: string                 // Subtítulo
  offer_end_date: string          // Fecha de fin (ISO string)
  cta_label: string               // Texto del botón
  cta_url: string                 // URL del botón
  bg_color: string                // Color de fondo (hex)
  show_progress: boolean          // Mostrar barra de progreso
  stock_total: number             // Stock total
  stock_sold: number              // Unidades vendidas
}
```

---

### 19. Contador de Stock

**Key:** `stock_counter` | **Icon:** `i-lucide-package` | **Categoría:** `conversion`

Muestra disponibilidad de stock con estilos variantes.

**Campos:**

```typescript
interface StockCounterSection {
  headline: string                // Título
  subtext: string                 // Subtítulo
  stock_total: number             // Stock total
  stock_sold: number              // Unidades vendidas
  low_stock_threshold: number     // Umbral de bajo stock
  style: 'bar' | 'badge' | 'pulse'  // Estilo visual
}
```

---

### 20. Carrito Fijo

**Key:** `sticky_add_to_cart` | **Icon:** `i-lucide-shopping-cart` | **Categoría:** `conversion`

Barra fija en la parte inferior para agregar al carrito.

**Campos:**

```typescript
interface StickyAddToCartSection {
  show: boolean                   // Mostrar barra
  product_name: string            // Nombre del producto
  price: number                   // Precio actual
  original_price: number          // Precio original
  cta_label: string               // Texto del botón
  show_discount_badge: boolean    // Mostrar badge de descuento
}
```

---

### 21. Preguntas Frecuentes

**Key:** `faq` | **Icon:** `i-lucide-help-circle` | **Categoría:** `content`

Acordeón de preguntas frecuentes con animación.

**Campos:**

```typescript
interface FaqSection {
  title: string                   // Título
  subtitle: string                // Subtítulo
  items: Array<{                  // Lista de preguntas
    question: string              // Pregunta
    answer: string                // Respuesta
  }>
}
```

---

### 22. Línea de Tiempo

**Key:** `timeline` | **Icon:** `i-lucide-git-branch` | **Categoría:** `content`

Línea de tiempo vertical alternada.

**Campos:**

```typescript
interface TimelineSection {
  title: string                   // Título
  subtitle: string                // Subtítulo
  items: Array<{                  // Lista de eventos
    year: string                  // Año o fecha
    title: string                 // Título del evento
    description: string           // Descripción
    icon: string                  // Icono (i-lucide-*)
    image: string | null          // URL de imagen
  }>
}
```

---

### 23. Blog Grid

**Key:** `blog_grid` | **Icon:** `i-lucide-layout-grid` | **Categoría:** `content`

Grid de artículos de blog estilo revista.

**Campos:**

```typescript
interface BlogGridSection {
  title: string                   // Título
  subtitle: string                // Subtítulo
  posts: Array<{                  // Lista de artículos
    title: string                 // Título
    excerpt: string               // Extracto
    image: string | null          // URL de imagen
    url: string                   // URL del artículo
    date: string                  // Fecha de publicación
    author: string                // Autor
    category: string              // Categoría
  }>
}
```

---

### 24. Artículos Destacados

**Key:** `article_featured` | **Icon:** `i-lucide-newspaper` | **Categoría:** `content`

Artículos destacados tipo prensa.

**Campos:**

```typescript
interface ArticleFeaturedSection {
  title: string                   // Título
  subtitle: string                // Subtítulo
  articles: Array<{               // Lista de artículos
    title: string                 // Título
    excerpt: string               // Extracto
    image: string | null          // URL de imagen
    url: string                   // URL del artículo
    date: string                  // Fecha
    author: string                // Autor
  }>
}
```

---

## Product Page

Secciones disponibles para la página de producto. Se almacenan en `config.producto`.

---

### P1. Hero Producto

**Key:** `hero` | **Icon:** `i-lucide-package`

**Campos:**

```typescript
interface ProductHeroSection {
  show: boolean
  layout: 'gallery-left' | 'gallery-right' | 'full-width'
  gallery_style: 'grid' | 'stacked' | 'zoom'
  show_breadcrumbs: boolean
  show_share: boolean
  sticky_add_to_cart: boolean
}
```

**Valores por defecto:**

```typescript
{
  show: true,
  layout: 'gallery-left',
  gallery_style: 'grid',
  show_breadcrumbs: true,
  show_share: true,
  sticky_add_to_cart: true,
}
```

---

### P2. Beneficios Producto

**Key:** `benefits` | **Icon:** `i-lucide-badge-check`

**Campos:**

```typescript
interface ProductBenefitsSection {
  show: boolean
  title: string
  subtitle: string
  items: Array<{
    icon: string
    title: string
    description: string
  }>
  layout: 'horizontal' | 'vertical'
}
```

**Valores por defecto:**

```typescript
{
  show: true,
  title: 'Por qué elegir este producto?',
  subtitle: 'Diseñado para ti',
  layout: 'horizontal',
  items: [
    { icon: 'i-lucide-truck', title: 'Envío gratis', description: 'En pedidos superiores a $99.000' },
    { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa' },
    { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días sin preguntas' },
  ],
}
```

---

### P3. Galería Producto

**Key:** `gallery` | **Icon:** `i-lucide-images`

**Campos:**

```typescript
interface ProductGallerySection {
  show: boolean
  style: 'grid' | 'masonry' | 'carousel'
  columns: number
  show_thumbnails: boolean
  enable_zoom: boolean
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  style: 'grid',
  columns: 2,
  show_thumbnails: true,
  enable_zoom: true,
}
```

---

### P4. Problema/Solución

**Key:** `problem_solution` | **Icon:** `i-lucide-lightbulb`

**Campos:**

```typescript
interface ProductProblemSection {
  show: boolean
  headline: string
  problems: Array<{
    icon: string
    title: string
    description: string
  }>
  solution_headline: string
  solution_items: Array<{
    icon: string
    title: string
    description: string
  }>
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### P5. Transformación

**Key:** `transform` | **Icon:** `i-lucide-arrow-right-left`

**Campos:**

```typescript
interface ProductTransformSection {
  show: boolean
  headline: string
  subtext: string
  before_image: string | null
  after_image: string | null
  before: Array<{ label: string; description: string }>
  after: Array<{ label: string; description: string }>
  slider_style: 'side-by-side' | 'overlay' | 'cards'
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'La transformación',
  subtext: 'Mira la diferencia',
  before_image: null,
  after_image: null,
  before: [{ label: 'Antes', description: 'Situación anterior' }],
  after: [{ label: 'Después', description: 'Situación mejorada' }],
  slider_style: 'overlay',
}
```

---

### P6. Características

**Key:** `features` | **Icon:** `i-lucide-settings`

**Campos:**

```typescript
interface ProductFeaturesSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'list' | 'grid' | 'alternating'
  items: Array<{
    icon: string
    title: string
    description: string
    image: string | null
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Características',
  subtitle: 'Todo lo que necesitas saber',
  layout: 'alternating',
  items: [
    { icon: 'i-lucide-zap', title: 'Rendimiento', description: 'Alto rendimiento probado', image: null },
    { icon: 'i-lucide-shield', title: 'Durabilidad', description: 'Materiales premium', image: null },
  ],
}
```

---

### P7. Comparativa

**Key:** `comparison` | **Icon:** `i-lucide-table`

**Campos:**

```typescript
interface ProductComparisonSection {
  show: boolean
  headline: string
  subtext: string
  columns: Array<{
    label: string
    is_ours: boolean
  }>
  rows: Array<{
    feature: string
    values: string[]
  }>
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### P8. Bundle Oferta

**Key:** `bundle` | **Icon:** `i-lucide-package-plus`

**Campos:**

```typescript
interface ProductBundleSection {
  show: boolean
  headline: string
  subtext: string
  discount_label: string
  items: Array<{
    product_id: number | null
    name: string
    original_price: number
    bundle_price: number
    image: string | null
  }>
  cta_label: string
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Lleva el pack completo',
  subtext: 'Ahorra comprando en bundle',
  discount_label: 'Ahorra 25%',
  items: [],
  cta_label: 'Agregar bundle al carrito',
}
```

---

### P9. Countdown Producto

**Key:** `countdown` | **Icon:** `i-lucide-timer`

**Campos:**

```typescript
interface ProductCountdownSection {
  show: boolean
  headline: string
  subtext: string
  end_date: string               // Fecha ISO
  bg_color: string               // hex
  text_color: string             // hex
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Oferta por tiempo limitado',
  subtext: 'No dejes pasar esta oportunidad',
  end_date: '',
  bg_color: '#dc2626',
  text_color: '#ffffff',
}
```

---

### P10. Testimonios Producto

**Key:** `testimonials` | **Icon:** `i-lucide-message-square-quote`

**Campos:**

```typescript
interface ProductTestimonialsSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'carousel' | 'grid' | 'masonry'
  items: Array<{
    name: string
    role: string
    avatar: string | null
    rating: number
    text: string
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Lo que dicen quienes ya lo compraron',
  subtitle: 'Opiniones verificadas',
  layout: 'carousel',
  items: [],
}
```

---

### P11. UGC Clientes

**Key:** `ugc` | **Icon:** `i-lucide-camera`

**Campos:**

```typescript
interface ProductUgcSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'carousel' | 'grid'
  items: Array<{
    image: string | null
    author: string
    platform: string
    text: string
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Visto en Instagram',
  subtitle: 'Clientes reales usando nuestro producto',
  layout: 'carousel',
  items: [],
}
```

---

### P12. Garantía

**Key:** `warranty` | **Icon:** `i-lucide-shield-check`

**Campos:**

```typescript
interface ProductWarrantySection {
  show: boolean
  headline: string
  items: Array<{
    icon: string
    title: string
    description: string
  }>
  cta_label: string
  cta_url: string
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Compra con confianza',
  items: [
    { icon: 'i-lucide-shield-check', title: 'Garantía 1 año', description: 'Cobertura completa de fábrica' },
    { icon: 'i-lucide-rotate-ccw', title: 'Devolución gratis', description: '30 días para cambios' },
    { icon: 'i-lucide-headphones', title: 'Soporte 24/7', description: 'Estamos siempre para ti' },
  ],
  cta_label: 'Ver políticas',
  cta_url: '/garantia',
}
```

---

### P13. FAQ Producto

**Key:** `faq` | **Icon:** `i-lucide-circle-help`

**Campos:**

```typescript
interface ProductFaqSection {
  show: boolean
  title: string
  subtitle: string
  style: 'accordion' | 'tabs' | 'simple'
  items: Array<{
    question: string
    answer: string
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Preguntas frecuentes',
  subtitle: 'Resolvemos tus dudas',
  style: 'accordion',
  items: [
    { question: '¿Cuánto tarda el envío?', answer: 'El envío estándar tarda 3-5 días hábiles.' },
    { question: '¿Puedo devolver el producto?', answer: 'Sí, tienes 30 días para devoluciones.' },
  ],
}
```

---

### P14. CTA Producto

**Key:** `cta` | **Icon:** `i-lucide-megaphone`

**Campos:**

```typescript
interface ProductCtaSection {
  show: boolean
  headline: string
  subtext: string
  cta_primary: {
    label: string
    url: string
  }
  cta_secondary: {
    label: string
    url: string
  } | null
  bg_color: string               // hex
  text_color: string             // hex
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: '¿Listo para comprar?',
  subtext: 'Agrega al carrito y recíbelo en casa',
  cta_primary: { label: 'Comprar ahora', url: '/carrito' },
  cta_secondary: null,
  bg_color: '#6366f1',
  text_color: '#ffffff',
}
```

---

## About Us Page

Secciones disponibles para la página "Nosotros". Se almacenan en `config.nosotros`.

---

### A1. Hero Nosotros

**Key:** `hero` | **Icon:** `i-lucide-layout-template`

**Campos:**

```typescript
interface AboutHeroSection {
  show: boolean
  headline: string
  subtext: string
  background_image: string | null
  overlay_opacity: number         // 0-1
  text_align: 'left' | 'center' | 'right'
}
```

**Valores por defecto:**

```typescript
{
  show: true,
  headline: 'Sobre nosotros',
  subtext: 'Conoce la historia detrás de nuestra tienda.',
  background_image: null,
  overlay_opacity: 0.4,
  text_align: 'center',
}
```

---

### A2. Misión y Visión

**Key:** `mission_vision` | **Icon:** `i-lucide-eye`

**Campos:**

```typescript
interface MissionVisionSection {
  show: boolean
  mission_title: string
  mission_text: string
  mission_image: string | null
  vision_title: string
  vision_text: string
  vision_image: string | null
  layout: 'side-by-side' | 'stacked' | 'alternating'
}
```

**Valores por defecto:**

```typescript
{
  show: true,
  mission_title: 'Nuestra Misión',
  mission_text: 'Ofrecer productos de la más alta calidad con una experiencia de compra excepcional.',
  mission_image: null,
  vision_title: 'Nuestra Visión',
  vision_text: 'Ser la tienda en línea de referencia en Latinoamérica.',
  vision_image: null,
  layout: 'side-by-side',
}
```

---

### A3. Valores

**Key:** `values` | **Icon:** `i-lucide-heart`

**Campos:**

```typescript
interface ValuesSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4' | 'list'
  items: Array<{
    icon: string
    title: string
    description: string
    image: string | null
  }>
}
```

**Valores por defecto:**

```typescript
{
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
}
```

---

### A4. Equipo

**Key:** `team` | **Icon:** `i-lucide-users`

**Campos:**

```typescript
interface TeamSection {
  show: boolean
  title: string
  subtitle: string
  layout: 'grid-2' | 'grid-3' | 'grid-4'
  members: Array<{
    name: string
    role: string
    avatar: string | null
    bio: string
    social_links: {
      instagram?: string
      linkedin?: string
      twitter?: string
    }
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Nuestro Equipo',
  subtitle: 'La gente que hace posible todo',
  layout: 'grid-3',
  members: [],
}
```

---

### A5. Historia

**Key:** `timeline` | **Icon:** `i-lucide-clock`

**Campos:**

```typescript
interface TimelineSection {
  show: boolean
  title: string
  subtitle: string
  events: Array<{
    year: string
    title: string
    description: string
    icon: string
    image: string | null
  }>
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  title: 'Nuestra Historia',
  subtitle: 'Un recorrido que apenas comienza',
  events: [
    { year: '2020', title: 'El comienzo', description: 'Nacimos con la idea de hacer las cosas diferentes.', icon: 'i-lucide-rocket', image: null },
    { year: '2022', title: 'Crecimiento', description: 'Alcanzamos nuestros primeros 1,000 clientes.', icon: 'i-lucide-trending-up', image: null },
    { year: '2024', title: 'Consolidación', description: 'Expandimos nuestro catálogo y mejoramos la experiencia.', icon: 'i-lucide-award', image: null },
  ],
}
```

---

### A6. Ubicación

**Key:** `map` | **Icon:** `i-lucide-map-pin`

**Campos:**

```typescript
interface AboutMapSection {
  show: boolean
  headline: string
  address: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  hours: string | null
}
```

**Valores por defecto:**

```typescript
{
  show: false,
  headline: 'Encuéntranos',
  address: 'Calle Principal #123, Bogotá, Colombia',
  latitude: 4.711,
  longitude: -74.0721,
  phone: '+57 300 000 0000',
  hours: 'Lun - Vie: 9:00 - 18:00',
}
```

---

### A7. CTA Nosotros

**Key:** `cta` | **Icon:** `i-lucide-megaphone`

**Campos:**

```typescript
interface AboutCtaSection {
  show: boolean
  headline: string
  subtext: string
  cta_primary: {
    label: string
    url: string
  }
  cta_secondary: {
    label: string
    url: string
  } | null
  bg_color: string | null         // hex
  text_color: string | null       // hex
}
```

**Valores por defecto:**

```typescript
{
  show: true,
  headline: '¿Listo para conocernos?',
  subtext: 'Explora nuestro catálogo y descubre por qué somos diferentes.',
  cta_primary: { label: 'Ver catálogo', url: '/catalogo' },
  cta_secondary: { label: 'Contactar', url: '/contacto' },
  bg_color: null,
  text_color: null,
}
```

---

## Sistema de Variantes

Cada sección puede tener múltiples variantes visuales. El sistema funciona así:

1. **Registro:** Las variantes se definen en `SectionRegistry.ts` y `PageBuilder.ts`
2. **Selección:** El usuario elige una variante al agregar la sección o desde el editor
3. **Almacenamiento:** Se guarda como `variant: string` en el objeto `PageSection`
4. **Renderizado:** El componente `PageRenderer` usa `useSectionVariants` para resolver qué componente renderizar

### Secciones con Múltiples Variantes

| Sección | Variantes |
|---------|-----------|
| Hero | `classic`, `centered`, `split`, `video`, `slider`, `countdown`, `parallax` |
| Header | `animation`, `video` |
| Beneficios | `icons`, `steps`, `cards` |
| Categorías | `grid`, `carousel`, `pills` |
| Destacados | `grid`, `carousel`, `large-cards` |
| Testimonios | `cards`, `spotlight`, `masonry` |
| CTA | `banner`, `split`, `gradient` |

### Secciones con Variante Única

Las demás secciones usan variante `default`.

---

## Estructura PageSection

Cada sección en `config.page_sections[]` tiene esta estructura:

```typescript
interface PageSection {
  id: string        // ID único (ej: 'hero-1', 'benefits-2')
  type: SectionKey  // Tipo de sección
  order: number     // Orden de aparición
  visible: boolean  // Si es visible
  variant: string   // Variante seleccionada
  config: Record<string, any>  // Configuración específica
}
```

### Generación de IDs

Los IDs se generan con el formato `{type}-{timestamp}` para garantizar unicidad. Ejemplo: `hero-1726345678901`.

---

## Resumen Estadístico

| Métrica | Cantidad |
|---------|----------|
| Total tipos de sección Home | 24 |
| Total tipos de sección Producto | 14 |
| Total tipos de sección Nosotros | 7 |
| Total único de tipos (con nombres compartidos) | ~45 |
| Secciones con múltiples variantes | 8 |
| Secciones con variante única | 16 |
| Total de variantes definidas | 32+ |
