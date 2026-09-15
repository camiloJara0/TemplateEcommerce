<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    protected array $definidos = [
        'general' => [
            'store_name',
            'store_tagline',
            'logo',
            'currency',
            'tax_rate',
            'default_language',
            'support_email',
            'support_phone',
        ],
        'colores' => [
            'color_primario',
            'color_secundario',
            'color_fondo',
        ],
        'seo' => [
            'meta_title',
            'meta_description',
            'meta_keywords',
            'og_image',
        ],
    ];

    public function index()
    {
        $agrupados = [];

        foreach ($this->definidos as $grupo => $claves) {
            $agrupados[$grupo] = [];

            foreach ($claves as $clave) {
                $agrupados[$grupo][$clave] = Setting::obtener($clave);
            }
        }

        return ApiResponse::success($agrupados);
    }

    public function actualizar(Request $request)
    {
        $reglas = [];
        $grupoPorClave = [];

        foreach ($this->definidos as $grupo => $claves) {
            foreach ($claves as $clave) {
                $reglas[$clave] = $this->reglaPara($clave);
                $grupoPorClave[$clave] = $grupo;
            }
        }

        $validated = $request->validate($reglas);

        foreach ($validated as $clave => $valor) {
            Setting::establecer($clave, $valor, $grupoPorClave[$clave] ?? 'general');
        }

        $this->aplicarConfig($validated);

        return ApiResponse::success($this->index()->getData()->data, 'Configuración actualizada');
    }

    public function publico()
    {
        $publica = [
            'store_name' => Setting::obtener('store_name', config('app.name')),
            'store_tagline' => Setting::obtener('store_tagline'),
            'logo' => Setting::obtener('logo'),
            'currency' => Setting::obtener('currency', config('ecommerce.currency', 'COP')),
            'tax_rate' => (float) Setting::obtener('tax_rate', config('ecommerce.tax_rate', 0.19)),
            'default_language' => Setting::obtener('default_language', 'es'),
            'support_email' => Setting::obtener('support_email'),
            'support_phone' => Setting::obtener('support_phone'),
            'color_primario' => Setting::obtener('color_primario', '#2563EB'),
            'color_secundario' => Setting::obtener('color_secundario', '#3B82F6'),
            'color_fondo' => Setting::obtener('color_fondo', '#FFFFFF'),
            'meta_title' => Setting::obtener('meta_title'),
            'meta_description' => Setting::obtener('meta_description'),
            'meta_keywords' => Setting::obtener('meta_keywords'),
            'og_image' => Setting::obtener('og_image'),
            'font_family' => Setting::obtener('font_family'),
        ];

        return ApiResponse::success($publica);
    }

    public function obtenerTienda()
    {
        return ApiResponse::success([
            'secciones' => $this->cargarLlave('tienda_secciones', 'secciones', $this->defaultsSecciones()),
            'header' => $this->cargarLlave('tienda_header', 'header', $this->defaultsHeader()),
            'categories_home' => $this->cargarLlave('tienda_categories_home', 'categories_home', $this->defaultsCategoriesHome()),
            'producto' => $this->cargarLlave('tienda_producto', 'producto', $this->defaultsProducto()),
            'nosotros' => $this->cargarLlave('tienda_nosotros', 'nosotros', $this->defaultsNosotros()),
            'estilos' => $this->cargarLlave('tienda_estilos', 'estilos', $this->defaultsEstilos()),
            'brand' => $this->cargarLlave('tienda_brand', 'brand', $this->defaultsBrand()),
            'social' => $this->cargarLlave('tienda_social', 'social', $this->defaultsSocial()),
            'navbar' => $this->cargarLlave('tienda_navbar', 'navbar', $this->defaultsNavbar()),
            'footer' => $this->cargarLlave('tienda_footer', 'footer', $this->defaultsFooter()),
            'page_sections' => $this->cargarLlave('tienda_page_sections', 'page_sections', $this->defaultsPageSections()),
        ]);
    }

    public function actualizarTienda(Request $request)
    {
        $validated = $request->validate([
            'secciones' => 'nullable|array',
            'header' => 'nullable|array',
            'categories_home' => 'nullable|array',
            'producto' => 'nullable|array',
            'nosotros' => 'nullable|array',
            'estilos' => 'nullable|array',
            'brand' => 'nullable|array',
            'social' => 'nullable|array',
            'navbar' => 'nullable|array',
            'footer' => 'nullable|array',
            'page_sections' => 'nullable|array',
        ]);

        $mapGrupo = [
            'secciones' => 'tienda_secciones',
            'header' => 'tienda_header',
            'categories_home' => 'tienda_categories_home',
            'producto' => 'tienda_producto',
            'nosotros' => 'tienda_nosotros',
            'estilos' => 'tienda_estilos',
            'brand' => 'tienda_brand',
            'social' => 'tienda_social',
            'navbar' => 'tienda_navbar',
            'footer' => 'tienda_footer',
            'page_sections' => 'tienda_page_sections',
        ];

        foreach ($validated as $seccion => $valor) {
            if ($valor !== null) {
                Setting::establecer($seccion, $valor, $mapGrupo[$seccion] ?? 'tienda');
            }
        }

        return ApiResponse::success($this->obtenerTienda()->getData()->data, 'Configuración de tienda actualizada');
    }

    public function tienda()
    {
        return ApiResponse::success([
            'secciones' => $this->cargarLlave('tienda_secciones', 'secciones', $this->defaultsSecciones()),
            'header' => $this->cargarLlave('tienda_header', 'header', $this->defaultsHeader()),
            'categories_home' => $this->cargarLlave('tienda_categories_home', 'categories_home', $this->defaultsCategoriesHome()),
            'producto' => $this->cargarLlave('tienda_producto', 'producto', $this->defaultsProducto()),
            'nosotros' => $this->cargarLlave('tienda_nosotros', 'nosotros', $this->defaultsNosotros()),
            'estilos' => $this->cargarLlave('tienda_estilos', 'estilos', $this->defaultsEstilos()),
            'brand' => $this->cargarLlave('tienda_brand', 'brand', $this->defaultsBrand()),
            'social' => $this->cargarLlave('tienda_social', 'social', $this->defaultsSocial()),
            'navbar' => $this->cargarLlave('tienda_navbar', 'navbar', $this->defaultsNavbar()),
            'footer' => $this->cargarLlave('tienda_footer', 'footer', $this->defaultsFooter()),
            'page_sections' => $this->cargarLlave('tienda_page_sections', 'page_sections', $this->defaultsPageSections()),
        ]);
    }

    // ── Helpers: cargar una llave desde settings ──────────────────────────────

    private function cargarLlave(string $group, string $key, array $defaults): array
    {
        $row = Setting::where('group', $group)->where('key', $key)->first();

        if ($row && $row->value !== null) {
            $decoded = json_decode($row->value, true);
            if (is_array($decoded)) {
                return array_replace_recursive($defaults, $decoded);
            }
        }

        return $defaults;
    }

    // ── Defaults: valores por defecto que replican el contenido actual ────────

    private function defaultsSecciones(): array
    {
        return [
            'hero' => [
                'badge' => 'Nueva colección 2026',
                'headline' => 'Compra con la claridad que mereces',
                'subtext' => 'Productos curados, checkout sin fricción y una experiencia tan limpia como el mejor software del mundo.',
                'cta_primary' => ['label' => 'Explorar catálogo', 'url' => '/catalogo'],
                'cta_secondary' => ['label' => 'Ver ofertas', 'url' => '/ofertas'],
                'background_image' => null,
                'show_stats' => true,
                'stats' => [
                    ['value' => '4.9', 'label' => 'Valoración media de clientes'],
                    ['value' => '+12k', 'label' => 'Pedidos este año'],
                ],
            ],
            'benefits' => [
                'title' => 'Beneficios',
                'subtitle' => 'Por qué elegirnos',
                'items' => [
                    ['icon' => 'i-lucide-truck', 'title' => 'Envío express', 'description' => 'Recibe tu pedido en 24-48 horas.'],
                    ['icon' => 'i-lucide-shield-check', 'title' => 'Compra segura', 'description' => 'Pago encriptado y datos protegidos.'],
                    ['icon' => 'i-lucide-rotate-ccw', 'title' => 'Devoluciones fáciles', 'description' => '30 días para cambios sin preguntas.'],
                    ['icon' => 'i-lucide-headphones', 'title' => 'Soporte real', 'description' => 'Atención humana cuando la necesitas.'],
                ],
            ],
            'categories' => ['title' => 'Categorías', 'subtitle' => 'Encuentra rápido lo que buscas', 'show_all_link' => true],
            'featured' => ['title' => 'Populares', 'subtitle' => 'Lo que más eligen nuestros clientes', 'show_all_link' => true],
            'deals' => [
                'badge' => 'Ofertas limitadas',
                'headline' => 'Hasta 30% en selección premium',
                'subtext' => 'Aprovecha descuentos reales en productos curados. Stock limitado y envío prioritario.',
                'cta_label' => 'Comprar ofertas',
                'show_section' => true,
            ],
            'testimonials' => [
                'title' => 'Lo que dicen nuestros clientes',
                'subtitle' => 'Confianza construida pedido a pedido',
                'items' => [
                    ['name' => 'María G.', 'role' => 'Clienta frecuente', 'avatar' => null, 'rating' => 5, 'text' => 'Excelente experiencia. El envío fue súper rápido y la calidad impecable.'],
                    ['name' => 'Carlos R.', 'role' => 'Compra recurrente', 'avatar' => null, 'rating' => 5, 'text' => 'Lo mejor es la transparencia. Todo claro desde el primer momento.'],
                    ['name' => 'Laura M.', 'role' => 'Nueva clienta', 'avatar' => null, 'rating' => 5, 'text' => 'Diseño increíble y atención al cliente de otro nivel.'],
                ],
            ],
            'newsletter' => [
                'show' => false,
                'headline' => 'Suscríbete a nuestro newsletter',
                'subtext' => 'Ofertas exclusivas, lanzamientos y descuentos directo a tu correo.',
                'placeholder' => 'Tu correo electrónico',
                'button_label' => 'Suscribirme',
                'bg_color' => '#6366f1',
                'text_color' => '#ffffff',
                'layout' => 'centered',
                'image' => null,
            ],
            'brand_logos' => [
                'show' => false,
                'title' => 'Marcas que confían en nosotros',
                'items' => [
                    ['name' => 'Nike', 'logo' => null, 'url' => null],
                    ['name' => 'Apple', 'logo' => null, 'url' => null],
                    ['name' => 'Samsung', 'logo' => null, 'url' => null],
                    ['name' => 'Sony', 'logo' => null, 'url' => null],
                ],
                'style' => 'grayscale',
            ],
            'gallery_feed' => [
                'show' => false,
                'title' => 'Síguenos en Instagram',
                'subtitle' => 'Etiquétanos @tienda para aparecer aquí',
                'layout' => 'grid-4',
                'items' => [],
            ],
            'stats' => [
                'show' => false,
                'layout' => 'grid-4',
                'bg_color' => '#0f172a',
                'text_color' => '#ffffff',
                'items' => [
                    ['value' => '+12,000', 'label' => 'Clientes satisfechos', 'icon' => 'i-lucide-users'],
                    ['value' => '+5,000', 'label' => 'Productos vendidos', 'icon' => 'i-lucide-shopping-bag'],
                    ['value' => '4.9', 'label' => 'Valoración media', 'icon' => 'i-lucide-star'],
                    ['value' => '24h', 'label' => 'Envío express', 'icon' => 'i-lucide-truck'],
                ],
            ],
            'video' => [
                'show' => false,
                'headline' => 'Mira cómo funciona',
                'subtext' => 'Un vistazo rápido a lo que nos hace diferentes.',
                'video_url' => null,
                'thumbnail' => null,
                'aspect_ratio' => '16:9',
            ],
            'map' => [
                'show' => false,
                'headline' => 'Visítanos',
                'subtext' => 'Estamos en el corazón de la ciudad.',
                'address' => 'Calle Principal #123, Bogotá',
                'latitude' => 4.711,
                'longitude' => -74.0721,
                'phone' => '+57 300 000 0000',
                'hours' => 'Lun - Vie: 9:00 - 18:00',
                'map_style' => 'standard',
            ],
            'richtext' => [
                'show' => false,
                'layout' => 'full',
                'headline' => 'Nuestra historia',
                'content' => 'Somos una tienda comprometida con la calidad y la satisfacción del cliente.',
                'image' => null,
                'cta_label' => null,
                'cta_url' => null,
                'bg_color' => null,
                'text_color' => null,
            ],
            'cta' => [
                'headline' => '¿Listo para tu próxima compra?',
                'subtext' => 'Descubre el catálogo completo y finaliza en minutos.',
                'cta_primary' => ['label' => 'Ir al catálogo', 'url' => '/catalogo'],
                'cta_secondary' => ['label' => 'Crear cuenta', 'url' => '/auth/register'],
            ],
        ];
    }

    private function defaultsEstilos(): array
    {
        return [
            'tipografia' => ['font_family' => 'Inter', 'heading_weight' => 600, 'base_size' => 16],
            'colores' => ['primario' => '#6366f1', 'secundario' => '#64748b', 'fondo' => '#f8fafc', 'accent' => '#d946ef'],
            'paleta' => [
                'texto_principal_claro' => '#0f172a',
                'texto_principal_oscuro' => '#f8fafc',
                'texto_secundario_claro' => '#475569',
                'texto_secundario_oscuro' => '#cbd5e1',
                'texto_muted_claro' => '#94a3b8',
                'texto_muted_oscuro' => '#64748b',
                'borde_claro' => '#e2e8f0',
                'borde_oscuro' => '#1e293b',
                'superficie_claro' => '#ffffff',
                'superficie_oscuro' => '#0f172a',
                'fondo_alt_claro' => '#f1f5f9',
                'fondo_alt_oscuro' => '#111827',
                'marca_claro' => '#6366f1',
                'marca_oscuro' => '#818cf8',
                'marca_hover_claro' => '#4f46e5',
                'marca_hover_oscuro' => '#a5b4fc',
                'acento_claro' => '#d946ef',
                'acento_oscuro' => '#e879f9',
                'texto_sobre_marca_claro' => '#ffffff',
                'texto_sobre_marca_oscuro' => '#ffffff',
            ],
            'fondos' => [
                'fondo_principal' => '#ffffff',
                'fondo_principal_dark' => '#0f172a',
                'fondo_imagenes' => '#f1f5f9',
                'fondo_imagenes_dark' => '#1e293b',
                'fondo_componentes' => '#ffffff',
                'fondo_componentes_dark' => '#1e293b',
                'tipo_fondo' => 'solid',
                'gradiente_from' => '#6366f1',
                'gradiente_via' => '#8b5cf6',
                'gradiente_to' => '#d946ef',
                'gradiente_direccion' => 'to-br',
            ],
            'borders' => ['radius_global' => '0.75rem', 'radius_buttons' => '1rem', 'radius_cards' => '0.75rem'],
            'spacing' => ['section_padding' => '5rem', 'container_max' => '80rem'],
        ];
    }

    private function defaultsBrand(): array
    {
        return ['name' => 'CommerceOS', 'tagline' => 'Tu tienda, elevada.', 'logo' => null, 'favicon' => null];
    }

    private function defaultsSocial(): array
    {
        return ['instagram' => null, 'facebook' => null, 'twitter' => null, 'youtube' => null];
    }

    private function defaultsNavbar(): array
    {
        return [
            'links' => [
                ['label' => 'Inicio', 'url' => '/', 'visible' => true],
                ['label' => 'Catálogo', 'url' => '/catalogo', 'visible' => true],
                ['label' => 'Ofertas', 'url' => '/ofertas', 'visible' => true],
                ['label' => 'Nosotros', 'url' => '/nosotros', 'visible' => true],
            ],
            'show_search' => true,
            'show_cart' => true,
            'show_favorites' => true,
        ];
    }

    private function defaultsFooter(): array
    {
        return [
            'columns' => [
                ['title' => 'Tienda', 'links' => [['label' => 'Catálogo', 'url' => '/catalogo'], ['label' => 'Ofertas', 'url' => '/ofertas'], ['label' => 'Nosotros', 'url' => '/nosotros']]],
                ['title' => 'Soporte', 'links' => [['label' => 'Centro de ayuda', 'url' => '/ayuda'], ['label' => 'Envíos', 'url' => '/envios'], ['label' => 'Devoluciones', 'url' => '/devoluciones']]],
                ['title' => 'Legal', 'links' => [['label' => 'Privacidad', 'url' => '/privacidad'], ['label' => 'Términos', 'url' => '/terminos']]],
            ],
            'copyright_text' => 'Todos los derechos reservados.',
        ];
    }

    private function defaultsPageSections(): array
    {
        return [
            ['id' => 'hero-1', 'type' => 'hero', 'order' => 0, 'visible' => true, 'variant' => 'classic', 'config' => []],
            ['id' => 'benefits-1', 'type' => 'benefits', 'order' => 1, 'visible' => true, 'variant' => 'icons', 'config' => []],
            ['id' => 'categories_home-1', 'type' => '_categories_home', 'order' => 2, 'visible' => true, 'variant' => 'grid', 'config' => []],
            ['id' => 'featured-1', 'type' => 'featured', 'order' => 3, 'visible' => true, 'variant' => 'grid', 'config' => []],
            ['id' => 'deals-1', 'type' => 'deals', 'order' => 4, 'visible' => true, 'variant' => 'default', 'config' => []],
            ['id' => 'testimonials-1', 'type' => 'testimonials', 'order' => 5, 'visible' => true, 'variant' => 'cards', 'config' => []],
            ['id' => 'cta-1', 'type' => 'cta', 'order' => 6, 'visible' => true, 'variant' => 'banner', 'config' => []],
        ];
    }

    private function defaultsHeader(): array
    {
        return [
            'show' => true,
            'background_image' => null,
            'headline' => 'Bienvenido a nuestra tienda',
            'subtext' => 'Descubre productos increíbles con la mejor experiencia de compra.',
            'cta_primary' => ['label' => 'Explorar ahora', 'url' => '/catalogo'],
            'cta_secondary' => ['label' => 'Conocer más', 'url' => '/nosotros'],
            'overlay_color' => '#000000',
            'overlay_opacity' => 0.4,
            'animation' => 'fade',
            'text_align' => 'center',
            'height' => '80vh',
        ];
    }

    private function defaultsCategoriesHome(): array
    {
        return [
            'show' => true,
            'title' => 'Explora por categoría',
            'subtitle' => 'Encuentra exactamente lo que buscas',
            'layout' => 'grid-3',
            'card_height' => '280px',
            'items' => [
                ['image' => null, 'name' => 'Tecnología', 'description' => 'Lo último en innovación', 'url' => '/categorias/tecnologia', 'overlay_opacity' => 0.5, 'text_color' => '#ffffff'],
                ['image' => null, 'name' => 'Moda', 'description' => 'Estilo y tendencia', 'url' => '/categorias/moda', 'overlay_opacity' => 0.5, 'text_color' => '#ffffff'],
                ['image' => null, 'name' => 'Hogar', 'description' => 'Transforma tu espacio', 'url' => '/categorias/hogar', 'overlay_opacity' => 0.5, 'text_color' => '#ffffff'],
            ],
        ];
    }

    private function defaultsProducto(): array
    {
        return [
            'hero' => ['show' => true, 'layout' => 'gallery-left', 'gallery_style' => 'grid', 'show_breadcrumbs' => true, 'show_share' => true, 'sticky_add_to_cart' => true],
            'benefits' => [
                'show' => true,
                'title' => '¿Por qué elegir este producto?',
                'subtitle' => 'Diseñado para ti',
                'layout' => 'horizontal',
                'items' => [
                    ['icon' => 'i-lucide-truck', 'title' => 'Envío gratis', 'description' => 'En pedidos superiores a $99.000'],
                    ['icon' => 'i-lucide-shield-check', 'title' => 'Garantía 1 año', 'description' => 'Cobertura completa'],
                    ['icon' => 'i-lucide-rotate-ccw', 'title' => 'Devolución gratis', 'description' => '30 días sin preguntas'],
                ],
            ],
            'gallery' => ['show' => false, 'style' => 'grid', 'columns' => 2, 'show_thumbnails' => true, 'enable_zoom' => true],
            'problem_solution' => [
                'show' => false,
                'headline' => '¿Cansado de...?',
                'problems' => [
                    ['icon' => 'i-lucide-x-circle', 'title' => 'Problema 1', 'description' => 'Descripción del problema'],
                    ['icon' => 'i-lucide-x-circle', 'title' => 'Problema 2', 'description' => 'Descripción del problema'],
                ],
                'solution_headline' => 'Nuestra solución',
                'solution_items' => [
                    ['icon' => 'i-lucide-check-circle', 'title' => 'Solución 1', 'description' => 'Cómo lo resolvemos'],
                    ['icon' => 'i-lucide-check-circle', 'title' => 'Solución 2', 'description' => 'Cómo lo resolvemos'],
                ],
            ],
            'transform' => [
                'show' => false,
                'headline' => 'La transformación',
                'subtext' => 'Mira la diferencia',
                'before_image' => null,
                'after_image' => null,
                'before' => [['label' => 'Antes', 'description' => 'Situación anterior']],
                'after' => [['label' => 'Después', 'description' => 'Situación mejorada']],
                'slider_style' => 'overlay',
            ],
            'features' => [
                'show' => false,
                'title' => 'Características',
                'subtitle' => 'Todo lo que necesitas saber',
                'layout' => 'alternating',
                'items' => [
                    ['icon' => 'i-lucide-zap', 'title' => 'Rendimiento', 'description' => 'Alto rendimiento probado', 'image' => null],
                    ['icon' => 'i-lucide-shield', 'title' => 'Durabilidad', 'description' => 'Materiales premium', 'image' => null],
                ],
            ],
            'comparison' => [
                'show' => false,
                'headline' => '¿Por qué nosotros?',
                'subtext' => 'Compara y decide',
                'columns' => [['label' => 'Nuestro Producto', 'is_ours' => true], ['label' => 'Competencia', 'is_ours' => false]],
                'rows' => [
                    ['feature' => 'Calidad', 'values' => ['Premium', 'Estándar']],
                    ['feature' => 'Garantía', 'values' => ['1 año', '3 meses']],
                    ['feature' => 'Envío', 'values' => ['Gratis', 'Pago']],
                ],
            ],
            'bundle' => [
                'show' => false,
                'headline' => 'Lleva el pack completo',
                'subtext' => 'Ahorra comprando en bundle',
                'discount_label' => 'Ahorra 25%',
                'items' => [],
                'cta_label' => 'Agregar bundle al carrito',
            ],
            'countdown' => ['show' => false, 'headline' => 'Oferta por tiempo limitado', 'subtext' => 'No dejes pasar esta oportunidad', 'end_date' => '', 'bg_color' => '#dc2626', 'text_color' => '#ffffff'],
            'testimonials' => ['show' => false, 'title' => 'Lo que dicen quienes ya lo compraron', 'subtitle' => 'Opiniones verificadas', 'layout' => 'carousel', 'items' => []],
            'ugc' => ['show' => false, 'title' => 'Visto en Instagram', 'subtitle' => 'Clientes reales usando nuestro producto', 'layout' => 'carousel', 'items' => []],
            'warranty' => [
                'show' => false,
                'headline' => 'Compra con confianza',
                'items' => [
                    ['icon' => 'i-lucide-shield-check', 'title' => 'Garantía 1 año', 'description' => 'Cobertura completa de fábrica'],
                    ['icon' => 'i-lucide-rotate-ccw', 'title' => 'Devolución gratis', 'description' => '30 días para cambios'],
                    ['icon' => 'i-lucide-headphones', 'title' => 'Soporte 24/7', 'description' => 'Estamos siempre para ti'],
                ],
                'cta_label' => 'Ver políticas',
                'cta_url' => '/garantia',
            ],
            'faq' => [
                'show' => false,
                'title' => 'Preguntas frecuentes',
                'subtitle' => 'Resolvemos tus dudas',
                'style' => 'accordion',
                'items' => [
                    ['question' => '¿Cuánto tarda el envío?', 'answer' => 'El envío estándar tarda 3-5 días hábiles.'],
                    ['question' => '¿Puedo devolver el producto?', 'answer' => 'Sí, tienes 30 días para devoluciones.'],
                ],
            ],
            'cta' => ['show' => false, 'headline' => '¿Listo para comprar?', 'subtext' => 'Agrega al carrito y recíbelo en casa', 'cta_primary' => ['label' => 'Comprar ahora', 'url' => '/carrito'], 'cta_secondary' => null, 'bg_color' => '#6366f1', 'text_color' => '#ffffff'],
        ];
    }

    private function defaultsNosotros(): array
    {
        return [
            'hero' => [
                'show' => true,
                'headline' => 'Sobre nosotros',
                'subtext' => 'Conoce la historia detrás de nuestra tienda.',
                'background_image' => null,
                'overlay_opacity' => 0.4,
                'text_align' => 'center',
            ],
            'mission_vision' => [
                'show' => true,
                'mission_title' => 'Nuestra Misión',
                'mission_text' => 'Ofrecer productos de la más alta calidad con una experiencia de compra excepcional, making each interaction memorable.',
                'mission_image' => null,
                'vision_title' => 'Nuestra Visión',
                'vision_text' => 'Ser la tienda en línea de referencia en Latinoamérica, reconocida por la innovación, la calidad y la satisfacción del cliente.',
                'vision_image' => null,
                'layout' => 'side-by-side',
            ],
            'values' => [
                'show' => true,
                'title' => 'Nuestros Valores',
                'subtitle' => 'Los principios que guían cada decisión',
                'layout' => 'grid-3',
                'items' => [
                    ['icon' => 'i-lucide-shield-check', 'title' => 'Confianza', 'description' => 'Transparencia absoluta en cada transacción.', 'image' => null],
                    ['icon' => 'i-lucide-sparkles', 'title' => 'Calidad', 'description' => 'Solo ofrecemos lo que compraríamos nosotros.', 'image' => null],
                    ['icon' => 'i-lucide-heart', 'title' => 'Pasión', 'description' => 'Amamos lo que hacemos y se nota.', 'image' => null],
                    ['icon' => 'i-lucide-headphones', 'title' => 'Soporte', 'description' => 'Atención real, humana y disponible.', 'image' => null],
                ],
            ],
            'team' => [
                'show' => false,
                'title' => 'Nuestro Equipo',
                'subtitle' => 'La gente que hace posible todo',
                'layout' => 'grid-3',
                'members' => [],
            ],
            'timeline' => [
                'show' => false,
                'title' => 'Nuestra Historia',
                'subtitle' => 'Un recorrido que apenas comienza',
                'events' => [
                    ['year' => '2020', 'title' => 'El comienzo', 'description' => 'Nacimos con la idea de hacer las cosas diferentes.', 'icon' => 'i-lucide-rocket', 'image' => null],
                    ['year' => '2022', 'title' => 'Crecimiento', 'description' => 'Alcanzamos nuestros primeros 1,000 clientes.', 'icon' => 'i-lucide-trending-up', 'image' => null],
                    ['year' => '2024', 'title' => 'Consolidación', 'description' => 'Expandimos nuestro catálogo y mejoramos la experiencia.', 'icon' => 'i-lucide-award', 'image' => null],
                ],
            ],
            'map' => [
                'show' => false,
                'headline' => 'Encuéntranos',
                'address' => 'Calle Principal #123, Bogotá, Colombia',
                'latitude' => 4.711,
                'longitude' => -74.0721,
                'phone' => '+57 300 000 0000',
                'hours' => 'Lun - Vie: 9:00 - 18:00',
            ],
            'cta' => [
                'show' => true,
                'headline' => '¿Listo para conocernos?',
                'subtext' => 'Explora nuestro catálogo y descubre por qué somos diferentes.',
                'cta_primary' => ['label' => 'Ver catálogo', 'url' => '/catalogo'],
                'cta_secondary' => ['label' => 'Contactar', 'url' => '/contacto'],
                'bg_color' => null,
                'text_color' => null,
            ],
        ];
    }

    private function reglaPara(string $clave): string
    {
        return match ($clave) {
            'tax_rate' => 'nullable|numeric|min:0|max:1',
            'currency' => 'nullable|string|size:3',
            'color_primario', 'color_secundario', 'color_fondo' => 'nullable|string|max:20',
            'logo', 'og_image' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            default => 'nullable|string|max:255',
        };
    }

    private function aplicarConfig(array $validated): void
    {
        if (isset($validated['currency'])) {
            config(['ecommerce.currency' => $validated['currency']]);
        }

        if (isset($validated['tax_rate'])) {
            config(['ecommerce.tax_rate' => (float) $validated['tax_rate']]);
        }
    }

    public function vapidPublicKey()
    {
        return ApiResponse::success([
            'key' => config('webpush.vapid_public_key'),
        ]);
    }

    // ── Configuración de pagos ───────────────────────────────────────────────

    public function obtenerPagos()
    {
        $credentialService = app(\App\Services\PaymentCredentialService::class);
        $default = config('payments.default');
        $classMap = config('payments.class_map', []);

        $data = [
            'default_provider' => $default,
            'providers' => [],
        ];

        foreach ($classMap as $key => $class) {
            $configured = $credentialService->estaConfigurado($key);
            $requiredFields = [];

            if (class_exists($class)) {
                $ref = new \ReflectionClass($class);
                if ($ref->isSubclassOf(\App\Services\Payment\AbstractPaymentProvider::class)) {
                    $tmp = new $class();
                    $requiredFields = $tmp->credencialesRequeridas();
                }
            }

            $credentialsStatus = [];
            foreach ($requiredFields as $field) {
                $creds = $credentialService->obtener($key);
                $credentialsStatus[$field] = !empty($creds[$field]);
            }

            $data['providers'][$key] = [
                'name' => $key,
                'configured' => $configured,
                'is_default' => $key === $default,
                'credentials_status' => $credentialsStatus,
            ];
        }

        return ApiResponse::success($data);
    }

    public function actualizarPagos(Request $request)
    {
        $validated = $request->validate([
            'default_provider' => 'nullable|string|in:stripe,mercadopago,paypal,wompi,rapyd',
            'credentials' => 'nullable|array',
            'credentials.stripe' => 'nullable|array',
            'credentials.mercadopago' => 'nullable|array',
            'credentials.paypal' => 'nullable|array',
            'credentials.wompi' => 'nullable|array',
            'credentials.rapyd' => 'nullable|array',
        ]);

        $credentialService = app(\App\Services\PaymentCredentialService::class);

        if (isset($validated['default_provider'])) {
            Setting::establecer('payment_default_provider', $validated['default_provider'], 'pagos');
            config(['payments.default' => $validated['default_provider']]);
        }

        if (isset($validated['credentials'])) {
            foreach ($validated['credentials'] as $provider => $creds) {
                if (is_array($creds)) {
                    $credentialService->guardar($provider, $creds);
                }
            }
        }

        return ApiResponse::success('Configuración de pagos actualizada');
    }

    public function probarProveedor(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:stripe,mercadopago,paypal,wompi,rapyd',
        ]);

        $credentialService = app(\App\Services\PaymentCredentialService::class);
        $resultado = $credentialService->probarConexion($validated['provider']);

        if ($resultado['success']) {
            return ApiResponse::success($resultado, $resultado['message']);
        }

        return ApiResponse::error($resultado['message'], 422, 'CONNECTION_FAILED');
    }
}