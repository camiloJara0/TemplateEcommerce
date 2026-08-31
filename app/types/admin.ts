import type {
  Carrier,
  CouponType,
  OrderStatus,
  PaymentStatus,
  ReportFormat,
  ShippingStatus,
  StockMovementType,
  User
} from './api'
import type { Brand, Category, Product, ProductReview, Tag } from './catalog'
import type { Address, Order } from './commerce'

export interface InventoryMovement {
  id: number
  product_id: number
  product_variant_id?: number | null
  tipo: StockMovementType
  cantidad: number
  razon?: string | null
  user_id?: number | null
  user?: Pick<User, 'id' | 'nombre'>
  product?: Product
  created_at?: string
}

export interface CreateInventoryMovementPayload {
  product_id: number
  product_variant_id?: number
  tipo: StockMovementType
  cantidad: number
  razon?: string
}

export interface StockAlert {
  id: number
  product_id: number
  min_stock: number
  active?: boolean
  product?: Product
  created_at?: string
}

export interface CreateStockAlertPayload {
  product_id: number
  min_stock: number
  active?: boolean
}

export interface ProductVariantPayload {
  sku: string
  price: number
  price_discount?: number
  stock?: number
  image?: string
  attribute_values?: Array<{
    attribute: string
    value: string
  }>
}

export interface ProductPayload {
  name: string
  sku: string
  price: number
  category_id?: number
  brand_id?: number
  description?: string
  price_discount?: number
  weight?: number
  stock?: number
  is_featured?: boolean
  estado?: 'activo' | 'inactivo'
  images?: (string | File)[]
  tags?: number[]
  variants?: ProductVariantPayload[]
  page_config?: Record<string, unknown>
}

export interface CategoryPayload {
  name: string
  parent_id?: number | null
  description?: string
  image?: string
  sort_order?: number
  is_active?: boolean
}

export interface BrandPayload {
  name: string
  description?: string
  image?: string
  is_active?: boolean
}

export interface TagPayload {
  name: string
  slug?: string
}

export interface AdminOrderFilters {
  status?: OrderStatus
  payment_status?: PaymentStatus
  busqueda?: string
  per_page?: number
  page?: number
}

export interface ChangeOrderStatusPayload {
  estado: OrderStatus
  comentario?: string
}

export interface RefundPayload {
  amount: number
  reason?: string
}

export interface AdminShipment {
  id: number
  order_id: number
  carrier: Carrier
  tracking_number?: string
  weight?: number
  status: ShippingStatus
  order?: Order
  address?: Address
  created_at?: string
  updated_at?: string
}

export interface CreateShipmentPayload {
  order_id: number
  carrier: Carrier
  weight?: number
  address_id: number
}

export interface ShipmentStatusPayload {
  estado: ShippingStatus
}

export interface ShipmentQuoteQuery {
  carrier?: Carrier
  weight?: number
  destino?: string
}

export interface ShipmentQuote {
  carrier?: Carrier
  weight?: number
  destino?: string
  price?: number
  estimated_days?: number
  currency?: string
}

export interface CouponPayload {
  code: string
  type: CouponType
  value: number
  min_subtotal?: number
  max_discount?: number
  usage_limit?: number
  per_user_limit?: number
  starts_at?: string
  expires_at?: string
  active?: boolean
}

export interface DashboardSummary {
  ventas_hoy: number
  pedidos_mes: number
  clientes: number
  stock_bajo: number
  ventas_mes?: number
  ticket_promedio?: number
  conversion?: number
}

export interface SalesByDay {
  fecha: string
  total: number
  pedidos?: number
}

export interface SalesByCategory {
  categoria: string
  total: number
  cantidad?: number
}

export interface TopProduct {
  product_id?: number
  name?: string
  cantidad?: number
  total?: number
}

export interface UsersRegistered {
  fecha: string
  total: number
}

export interface SalesReportQuery {
  desde?: string
  hasta?: string
  formato?: ReportFormat
}

export interface InventoryReportQuery {
  busqueda?: string
  formato?: ReportFormat
}

export interface AdminReviewFilters {
  estado?: 'pendiente' | 'aprobada' | 'rechazada'
  per_page?: number
  page?: number
}

export interface AdminReview extends ProductReview {
  product?: Product
  user?: {
    id: number
    nombre: string
    foto?: string | null
  }
}

export interface AdminProductFilters {
  busqueda?: string
  categoria_id?: number
  marca_id?: number
  estado?: 'activo' | 'inactivo'
  stock_bajo?: boolean
  per_page?: number
  page?: number
}

export interface AdminUser {
  id: number
  nombre: string
  email: string
  foto?: string | null
  rol?: string
  estado?: 'activo' | 'inactivo'
  created_at?: string
}

export interface AdminCatalogGroup {
  categorias: Category[]
  marcas: Brand[]
  etiquetas: Tag[]
}
