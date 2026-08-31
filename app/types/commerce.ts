import type {
  Carrier,
  CouponType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ShippingStatus
} from './api'
import type { Product, ProductVariant, ShippingMethod } from './catalog'

export interface Address {
  id: number
  user_id?: number
  label?: string | null
  pais: string
  ciudad: string
  direccion: string
  codigo_postal?: string | null
  telefono?: string | null
  es_principal?: boolean
  created_at?: string
  updated_at?: string
}

export interface AddressPayload {
  label?: string
  pais: string
  ciudad: string
  direccion: string
  codigo_postal?: string
  telefono?: string
  es_principal?: boolean
}

export interface CartItem {
  id: number
  product_id: number
  product_variant_id?: number | null
  quantity: number
  price?: number
  name: string
  slug: string
  image: string
  brand: string
  sku: string
  subtotal?: number
  product?: Product
  variant?: ProductVariant
}

export interface Cart {
  id: number
  user_id?: number | null
  session_id?: string | null
  items: CartItem[]
  items_count: number
  subtotal?: number
}

export interface AddCartItemPayload {
  session_id?: string
  product_id: number
  product_variant_id?: number
  quantity?: number
}

export interface UpdateCartItemPayload {
  quantity: number
}

export interface CheckoutPreview {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  currency: string
  coupon?: Coupon | null
  items?: CartItem[]
  address?: Address | null
  shipping_method?: ShippingMethod | null
}

export interface CheckoutPreviewPayload {
  session_id?: string
  address_id?: number
  shipping_method_id?: number
  coupon_code?: string
}

export interface OrderItem {
  id: number
  order_id?: number
  product_id: number
  product_variant_id?: number | null
  name?: string
  sku?: string
  quantity: number
  unit_price: number
  price_discount?: number | null
  subtotal?: number
  total?: number
  product?: Product
  variant?: ProductVariant
}

export interface OrderHistory {
  id: number
  order_id: number
  estado: OrderStatus
  comentario?: string | null
  user_id?: number | null
  created_at?: string
}

export interface Payment {
  id: number
  order_id: number
  provider: PaymentProvider
  reference?: string | null
  amount: number
  status: PaymentStatus
  paid_at?: string | null
  created_at?: string
}

export interface Order {
  id: number
  order_number?: string
  user_id?: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_status?: ShippingStatus
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  currency: string
  coupon_code?: string | null
  notes?: string | null
  address?: Address | null
  shipping_method?: ShippingMethod | null
  items?: OrderItem[]
  history?: OrderHistory[]
  payments?: Payment[]
  created_at?: string
  updated_at?: string
}

export interface CreateOrderPayload {
  session_id?: string
  address_id: number
  shipping_method_id: number
  coupon_code?: string
  notes?: string
}

export interface PayOrderPayload {
  provider: PaymentProvider
  reference?: string
}

export interface Coupon {
  id: number
  code: string
  type: CouponType
  value: number
  min_subtotal?: number
  max_discount?: number
  usage_limit?: number
  used_count?: number
  per_user_limit?: number
  starts_at?: string | null
  expires_at?: string | null
  active?: boolean
  description?: string | null
}

export interface ApplyCouponPayload {
  code: string
  subtotal: number
  shipping?: number
}

export interface Favorite {
  id: number
  product_id: number
  product?: Product
  created_at?: string
}

export interface TrackingEvent {
  fecha?: string
  estado?: string
  descripcion?: string
}

export interface TrackingInfo {
  id?: number
  order_id?: number
  tracking_number?: string
  carrier?: Carrier
  status: ShippingStatus
  events?: TrackingEvent[]
  ciudad_destino?: string
  created_at?: string
  updated_at?: string
}
