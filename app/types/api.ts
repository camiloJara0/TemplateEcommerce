export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string | null
  data: T
  access_token?: string
  token_type?: string
  expires_in?: number
}

export interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
  path?: string
  links?: Array<{
    url?: string | null
    label: string
    active: boolean
  }>
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

export interface Role {
  id: number
  name: string
  pivot?: {
    user_id: number
    role_id: number
  }
}

export interface User {
  id: number
  nombre: string
  email: string
  foto: string | null
  telefono: string | null
  estado: 'activo' | 'inactivo'
  rol?: Role[]
  idioma?: string
  tema?: string
  zona_horaria?: string
  email_verified_at?: string | null
  ultimo_login?: string | null
  created_at?: string
  updated_at?: string
}

export interface AuthData {
  user: User
}

export interface LoginData {
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nombre: string
  email: string
  password: string
  password_confirmation: string
}

export interface SendCodePayload {
  email: string
}

export interface VerifyCodePayload {
  email: string
  codigo: string
}

export interface UpdateProfilePayload {
  nombre?: string
  telefono?: string
  foto?: string
  idioma?: string
}

export type ProductStatus = 'activo' | 'inactivo'
export type OrderStatus = 'nuevo' | 'pagado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado' | 'devuelto'
export type PaymentStatus = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado'
export type ShippingStatus = 'pendiente' | 'en_preparacion' | 'despachado' | 'en_transito' | 'entregado'
export type CouponType = 'percent' | 'fixed' | 'free_shipping'
export type PaymentProvider = 'stripe' | 'mercadopago' | 'paypal' | 'wompi'
export type Carrier = 'servientrega' | 'coordinadora' | 'dhl' | 'fedex' | 'interrapidisimo'
export type StockMovementType = 'entrada' | 'salida' | 'ajuste'
export type ReportFormat = 'csv' | 'pdf' | 'excel'
export type Language = 'es' | 'en' | 'pt'
