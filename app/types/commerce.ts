import type {
  Carrier,
  CouponType,
  OrderStatus,
  Pagination,
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
  id: number
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
  price: number
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
  transaction_id?: string | null
  reference?: string | null
  amount: number
  currency?: string
  status: PaymentStatus
  payload?: Record<string, any> | null
  paid_at?: string | null
  created_at?: string
  updated_at?: string
  order?: Order
  refunds?: Refund[]
}

export interface Refund {
  id: number
  payment_id: number
  amount: number
  reason?: string | null
  status: string
  transaction_id?: string | null
  created_at?: string
}

export interface Order {
  id: number
  numero?: string
  order_number?: string
  user_id?: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_status?: ShippingStatus
  subtotal: number
  discount: number
  shipping: number
  shipping_cost?: number
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
  user?: { id: number; nombre?: string; name?: string; email?: string }
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
  coupon: CouponObject
  pagination: Pagination[]
  items: CouponObject[]
}

export interface CouponObject {
  code: string
  type: CouponType
  value: number
  min_subtotal?: number
  max_discount?: number
  usage_limit?: number
  used_count?: number
  per_user_limit?: number
}

export interface ApplyCouponPayload {
  code: string
  subtotal: number
  shipping?: number
  session_id: string | null
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

export interface AdminContact extends Contact {
  replies_count?: number
  replies?: Array<{ id: number, user_id?: number, respuesta: string, correo_enviado?: boolean, created_at?: string }>
  respuesta?: string
}

export interface CreateContactPayload {
  nombre?: string
  nit?: string
  correo: string
  asunto: string
  mensaje: string
  user_id?: number
}

export interface ResponseContactPayload {
  contact_message_id?: number
  respuesta?: string
  estado: string
  user_id?: number
  id?: number
}

export interface Contact {
  id: number
  user_id: number
  user?: {
    id: number
    nombre: string
    foto?: string | null
  }
  nombre?: string | null
  correo: string
  nit?: string | null
  asunto: string
  mensaje: string
  fecha_lectura: string
  estado?: 'Pendiente' | 'Leido' | 'Respondido' | 'Cerrado'
  created_at?: string
  updated_at?: string
}

export interface SubscribeNewsPayload {
  correo: string
  nombre?: string
  user_id?: number
}

export type EstadoSuscriptor = 'Activo' | 'Inactivo' | 'Cancelado'

export interface NewsletterSubscriber {
  id: number
  correo: string
  nombre?: string | null
  user_id?: number | null
  user?: { id: number, nombre: string, email?: string } | null
  estado: EstadoSuscriptor
  origen?: string
  token_aprobacion?: string
  fecha_confirmacion?: string | null
  fecha_baja?: string | null
  created_at?: string
  updated_at?: string
}

export type EstadoCampana = 'Borrador' | 'Programada' | 'Enviada'

export interface CampanaProducto {
  id: number
  name: string
  slug: string
  price: number
  price_discount?: number | null
  description?: string | null
  images?: Array<{ url: string }>
}

export interface CampanaItem {
  id?: number
  orden: number
  product_id?: number
  product?: CampanaProducto
}

export interface CampanaMedia {
  id?: number
  tipo: 'Imagen' | 'Video'
  url: string
  orden: number
}

export interface CampanaCupon {
  id: number
  code: string
  type: 'percent' | 'fixed' | 'free_shipping'
  value: number
  min_subtotal?: number | null
  expires_at?: string | null
}

export interface CampanaFiltros {
  estados: EstadoCampana[]
  suscriptores_activos: number
}

export interface NewsletterCampaign {
  id: number
  titulo: string
  asunto: string
  contenido: string
  estado: EstadoCampana
  fecha_programada?: string | null
  fecha_envio?: string | null
  created_by?: number | null
  cupon_id?: number | null
  cupon?: CampanaCupon | null
  creador?: { id: number, nombre: string } | null
  destinatarios: number
  enviados: number
  fallidos: number
  items_count?: number
  media_count?: number
  recipients_count?: number
  items?: CampanaItem[]
  media?: CampanaMedia[]
  created_at?: string
  updated_at?: string
}

export interface CreateCampaignPayload {
  titulo: string
  asunto: string
  contenido: string
  estado?: EstadoCampana
  fecha_programada?: string | null
  cupon_id?: number | null
  items?: Array<number | string>
  existing_image_urls?: string[]
  media?: string[]
}

export interface CampaignPreview {
  html: string
  asunto: string
}

export type EstadoWebhook = 'recibido' | 'procesado' | 'duplicado' | 'ignorado' | 'error'

export interface WebhookEvent {
  id: number
  provider: string
  event_id: string | null
  tipo: string | null
  estado: EstadoWebhook
  firma_valida: boolean | null
  payload: Record<string, unknown>
  respuesta?: Record<string, unknown> | null
  error: string | null
  payment_id: number | null
  order_id: number | null
  intentos: number
  http_status: number | null
  ip: string | null
  procesado_en?: string | null
  created_at?: string
  payment?: { id: number, order_id: number, provider: string, status: string, amount: number | string } | null
  order?: { id: number, numero: string, status: string } | null
}

export interface WebhookEventsResumen {
  total: number
  procesados: number | null
  errores: number | null
  ignorados: number | null
}
