import type { DashboardSummary, SalesByCategory, SalesByDay, TopProduct } from '~/types/admin'
import type { Brand, Category, Product } from '~/types/catalog'
import type { Order } from '~/types/commerce'

export function useMockData() {
  const categories: Category[] = [
    { id: 1, name: 'Electrónica', slug: 'electronica', image: null, is_active: true },
    { id: 2, name: 'Moda', slug: 'moda', image: null, is_active: true },
    { id: 3, name: 'Hogar', slug: 'hogar', image: null, is_active: true },
    { id: 4, name: 'Deportes', slug: 'deportes', image: null, is_active: true },
    { id: 5, name: 'Belleza', slug: 'belleza', image: null, is_active: true },
    { id: 6, name: 'Tecnología', slug: 'tecnologia', image: null, is_active: true }
  ]

  const brands: Brand[] = [
    { id: 1, name: 'Nova', slug: 'nova', is_active: true },
    { id: 2, name: 'Aether', slug: 'aether', is_active: true },
    { id: 3, name: 'Lumen', slug: 'lumen', is_active: true },
    { id: 4, name: 'Orbit', slug: 'orbit', is_active: true }
  ]

  const products: Product[] = [
    {
      id: 1,
      name: 'Auriculares Wireless Pro',
      slug: 'auriculares-wireless-pro',
      sku: 'AUD-001',
      price: 459900,
      price_discount: 349900,
      stock: 48,
      is_featured: true,
      estado: 'activo',
      category_id: 1,
      brand_id: 1,
      brand: brands[0],
      category: categories[0],
      rating_avg: 4.8,
      rating_count: 214,
      description: 'Cancelación activa de ruido, 40 h de batería y audio espacial.',
      images: [{ id: 1, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', alt: 'Auriculares' }]
    },
    {
      id: 2,
      name: 'Smartwatch Pulse X',
      slug: 'smartwatch-pulse-x',
      sku: 'WCH-002',
      price: 899900,
      price_discount: 749900,
      stock: 32,
      is_featured: true,
      estado: 'activo',
      category_id: 1,
      brand_id: 2,
      brand: brands[1],
      category: categories[0],
      rating_avg: 4.6,
      rating_count: 128,
      description: 'Salud avanzada, GPS y pantalla siempre activa.',
      images: [{ id: 2, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', alt: 'Smartwatch' }]
    },
    {
      id: 3,
      name: 'Zapatillas Runner Air',
      slug: 'zapatillas-runner-air',
      sku: 'SHOE-003',
      price: 389900,
      price_discount: null,
      stock: 76,
      is_featured: true,
      estado: 'activo',
      category_id: 4,
      brand_id: 3,
      brand: brands[2],
      category: categories[3],
      rating_avg: 4.7,
      rating_count: 89,
      description: 'Amortiguación reactiva para entrenamiento diario.',
      images: [{ id: 3, url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', alt: 'Zapatillas' }]
    },
    {
      id: 4,
      name: 'Lámpara Desk Glow',
      slug: 'lampara-desk-glow',
      sku: 'HOME-004',
      price: 189900,
      price_discount: 149900,
      stock: 55,
      is_featured: true,
      estado: 'activo',
      category_id: 3,
      brand_id: 4,
      brand: brands[3],
      category: categories[2],
      rating_avg: 4.5,
      rating_count: 64,
      description: 'Luz cálida regulable con USB-C integrado.',
      images: [{ id: 4, url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', alt: 'Lámpara' }]
    },
    {
      id: 5,
      name: 'Mochila Urban Lite',
      slug: 'mochila-urban-lite',
      sku: 'BAG-005',
      price: 259900,
      price_discount: 199900,
      stock: 41,
      is_featured: true,
      estado: 'activo',
      category_id: 2,
      brand_id: 1,
      brand: brands[0],
      category: categories[1],
      rating_avg: 4.9,
      rating_count: 156,
      description: '15 L, compartimento laptop y tela impermeable.',
      images: [{ id: 5, url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', alt: 'Mochila' }]
    },
    {
      id: 6,
      name: 'Cámara Compacta Nova',
      slug: 'camara-compacta-nova',
      sku: 'CAM-006',
      price: 1299900,
      price_discount: 1099900,
      stock: 18,
      is_featured: true,
      estado: 'activo',
      category_id: 6,
      brand_id: 1,
      brand: brands[0],
      category: categories[5],
      rating_avg: 4.4,
      rating_count: 42,
      description: 'Sensor 24 MP, 4K60 y estabilización de 5 ejes.',
      images: [{ id: 6, url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', alt: 'Cámara' }]
    },
    {
      id: 7,
      name: 'Set Skincare Essential',
      slug: 'set-skincare-essential',
      sku: 'BEA-007',
      price: 179900,
      price_discount: null,
      stock: 90,
      is_featured: false,
      estado: 'activo',
      category_id: 5,
      brand_id: 3,
      brand: brands[2],
      category: categories[4],
      rating_avg: 4.8,
      rating_count: 201,
      description: 'Limpieza, serum y crema hidratante vegana.',
      images: [{ id: 7, url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Skincare' }]
    },
    {
      id: 8,
      name: 'Teclado Mecánico Low-Profile',
      slug: 'teclado-mecanico-low-profile',
      sku: 'KEY-008',
      price: 429900,
      price_discount: 379900,
      stock: 27,
      is_featured: true,
      estado: 'activo',
      category_id: 6,
      brand_id: 2,
      brand: brands[1],
      category: categories[5],
      rating_avg: 4.7,
      rating_count: 97,
      description: 'Switches silenciosos, RGB y layout ISO-ES.',
      images: [{ id: 8, url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', alt: 'Teclado' }]
    }
  ]

  const dashboardSummary: DashboardSummary = {
    ventas_hoy: 4850000,
    pedidos_mes: 342,
    clientes: 1284,
    stock_bajo: 7,
    ventas_mes: 128450000,
    ticket_promedio: 375600,
    conversion: 3.4
  }

  const salesByDay: SalesByDay[] = [
    { fecha: '2026-08-08', total: 4200000, pedidos: 18 },
    { fecha: '2026-08-09', total: 5100000, pedidos: 22 },
    { fecha: '2026-08-10', total: 3800000, pedidos: 15 },
    { fecha: '2026-08-11', total: 6200000, pedidos: 28 },
    { fecha: '2026-08-12', total: 5900000, pedidos: 25 },
    { fecha: '2026-08-13', total: 7100000, pedidos: 31 },
    { fecha: '2026-08-14', total: 4850000, pedidos: 20 }
  ]

  const salesByCategory: SalesByCategory[] = [
    { categoria: 'Electrónica', total: 42000000, cantidad: 180 },
    { categoria: 'Tecnología', total: 31000000, cantidad: 95 },
    { categoria: 'Moda', total: 22000000, cantidad: 210 },
    { categoria: 'Hogar', total: 18000000, cantidad: 140 },
    { categoria: 'Deportes', total: 15450000, cantidad: 88 }
  ]

  const topProducts: TopProduct[] = products.slice(0, 5).map((p, i) => ({
    product_id: p.id,
    name: p.name,
    cantidad: 120 - i * 18,
    total: (p.price_discount ?? p.price) * (120 - i * 18)
  }))

  const recentOrders: Order[] = [
    {
      id: 1042,
      order_number: 'ORD-1042',
      status: 'pagado',
      payment_status: 'pagado',
      shipping_status: 'en_preparacion',
      subtotal: 699800,
      discount: 0,
      shipping: 15000,
      tax: 132962,
      total: 847762,
      currency: 'COP',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      items: [{ id: 1, product_id: 1, quantity: 2, unit_price: 349900, name: 'Auriculares Wireless Pro' }]
    },
    {
      id: 1041,
      order_number: 'ORD-1041',
      status: 'preparando',
      payment_status: 'pagado',
      shipping_status: 'en_preparacion',
      subtotal: 749900,
      discount: 50000,
      shipping: 0,
      tax: 132981,
      total: 832881,
      currency: 'COP',
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      items: [{ id: 2, product_id: 2, quantity: 1, unit_price: 749900, name: 'Smartwatch Pulse X' }]
    },
    {
      id: 1040,
      order_number: 'ORD-1040',
      status: 'enviado',
      payment_status: 'pagado',
      shipping_status: 'en_transito',
      subtotal: 389900,
      discount: 0,
      shipping: 12000,
      tax: 74081,
      total: 475981,
      currency: 'COP',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      items: [{ id: 3, product_id: 3, quantity: 1, unit_price: 389900, name: 'Zapatillas Runner Air' }]
    },
    {
      id: 1039,
      order_number: 'ORD-1039',
      status: 'entregado',
      payment_status: 'pagado',
      shipping_status: 'entregado',
      subtotal: 1099900,
      discount: 100000,
      shipping: 0,
      tax: 189981,
      total: 1189881,
      currency: 'COP',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      items: [{ id: 4, product_id: 6, quantity: 1, unit_price: 1099900, name: 'Cámara Compacta Nova' }]
    },
    {
      id: 1038,
      order_number: 'ORD-1038',
      status: 'nuevo',
      payment_status: 'pendiente',
      shipping_status: 'pendiente',
      subtotal: 199900,
      discount: 0,
      shipping: 10000,
      tax: 37981,
      total: 247881,
      currency: 'COP',
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      items: [{ id: 5, product_id: 5, quantity: 1, unit_price: 199900, name: 'Mochila Urban Lite' }]
    }
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Laura Méndez',
      role: 'Diseñadora',
      avatar: 'https://i.pravatar.cc/100?img=5',
      rating: 5,
      text: 'Compra rápida, empaque impecable y el producto superó mis expectativas. La experiencia se siente premium de punta a punta.'
    },
    {
      id: 2,
      name: 'Carlos Ruiz',
      role: 'Emprendedor',
      avatar: 'https://i.pravatar.cc/100?img=12',
      rating: 5,
      text: 'El seguimiento del pedido es clarísimo. En dos días tenía todo en casa. Volveré sin dudarlo.'
    },
    {
      id: 3,
      name: 'Ana Sofía',
      role: 'Fotógrafa',
      avatar: 'https://i.pravatar.cc/100?img=9',
      rating: 5,
      text: 'Catálogo bien curado y atención al detalle. Se nota que cuidan cada interacción.'
    }
  ]

  const benefits = [
    {
      icon: 'i-lucide-truck',
      title: 'Envío express',
      description: 'Entrega en 24–48 h en principales ciudades.'
    },
    {
      icon: 'i-lucide-shield-check',
      title: 'Compra segura',
      description: 'Pagos cifrados y protección al comprador.'
    },
    {
      icon: 'i-lucide-refresh-cw',
      title: 'Devoluciones fáciles',
      description: '30 días para cambiar o devolver sin fricción.'
    },
    {
      icon: 'i-lucide-headphones',
      title: 'Soporte real',
      description: 'Equipo humano listo para ayudarte 7 días.'
    }
  ]

  const activityFeed = [
    { id: 1, type: 'order', text: 'Nuevo pedido ORD-1042', time: 'Hace 25 min', icon: 'i-lucide-shopping-bag' },
    { id: 2, type: 'user', text: 'Nuevo cliente registrado', time: 'Hace 40 min', icon: 'i-lucide-user-plus' },
    { id: 3, type: 'stock', text: 'Stock bajo: Cámara Compacta Nova', time: 'Hace 1 h', icon: 'i-lucide-package-x' },
    { id: 4, type: 'review', text: 'Nueva reseña 5★ en Auriculares Pro', time: 'Hace 2 h', icon: 'i-lucide-star' },
    { id: 5, type: 'payment', text: 'Pago confirmado ORD-1041', time: 'Hace 3 h', icon: 'i-lucide-credit-card' }
  ]

  return {
    categories,
    brands,
    products,
    dashboardSummary,
    salesByDay,
    salesByCategory,
    topProducts,
    recentOrders,
    testimonials,
    benefits,
    activityFeed
  }
}
