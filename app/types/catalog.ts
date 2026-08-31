import type { ProductStatus } from './api'

export interface Category {
  id: number
  name: string
  slug?: string
  parent_id?: number | null
  description?: string | null
  image?: string | null
  sort_order?: number
  is_active?: boolean
  children?: Category[]
  created_at?: string
  updated_at?: string
}

export interface Brand {
  id: number
  name: string
  slug?: string
  description?: string | null
  image?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Tag {
  id: number
  name: string
  slug?: string
}

export interface ProductImage {
  id: number
  url: string
  alt?: string | null
  sort_order?: number
}

export interface VariantAttributeValue {
  id?: number
  attribute: string
  value: string
}

export interface ProductVariant {
  id: number
  product_id: number
  sku: string
  price: number
  price_discount?: number | null
  stock: number
  image?: string | null
  attribute_values?: VariantAttributeValue[]
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description?: string | null
  price: number
  price_discount?: number | null
  weight?: number | null
  stock: number
  is_featured?: boolean
  estado: ProductStatus
  category_id?: number | null
  brand_id?: number | null
  category?: Category
  brand?: Brand
  tags?: Tag[]
  images?: ProductImage[]
  variants?: ProductVariant[]
  page_config?: Record<string, unknown> | null
  rating_avg?: number
  rating_count?: number
  reviews_count?: number
  created_at?: string
  updated_at?: string
}

export interface ProductFilters {
  busqueda?: string
  categoria_id?: number
  marca_id?: number
  tag?: string
  precio_min?: number
  precio_max?: number
  destacado?: 0 | 1
  orden?: 'precio_asc' | 'precio_desc' | 'mas_vendidos'
  per_page?: number
  page?: number
}

export interface ProductReview {
  id: number
  product_id: number
  user_id: number
  user?: {
    id: number
    nombre: string
    foto?: string | null
  }
  rating: number
  comment?: string | null
  estado?: 'pendiente' | 'aprobada' | 'rechazada'
  created_at?: string
  updated_at?: string
}

export interface ShippingMethod {
  id: number
  name: string
  slug?: string
  cost: number
  description?: string | null
  estimated_days?: number
  is_active?: boolean
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
}
