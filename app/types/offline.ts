export type OfflineActionType = 'create' | 'update' | 'delete'

export type OfflineResource =
  | 'product'
  | 'category'
  | 'brand'
  | 'tag'
  | 'cart'
  | 'address'
  | 'favorite'
  | 'review'
  | 'coupon'
  | 'order'
  | 'shipment'
  | 'inventory_movement'
  | 'stock_alert'
  | 'notification'
  | 'profile'
  | 'store_config'
  | 'tienda_config'

export type OfflineStatus = 'pending' | 'syncing' | 'failed'

export interface OutboxItem {
  localId: string
  type: OfflineActionType
  resource: OfflineResource
  method: 'POST' | 'PUT' | 'DELETE'
  url: string
  body: Record<string, unknown>
  tempId?: string
  targetId?: number
  original?: Record<string, unknown>
  createdAt: string
  attempts: number
  status: OfflineStatus
  lastError?: string
}

export interface OutboxExport {
  app: 'CommerceOS'
  version: 1
  exportedAt: string
  items: OutboxItem[]
}

export const OFFLINE_COLLECTIONS = [
  'products',
  'categories',
  'brands',
  'tags',
  'cart',
  'addresses',
  'favorites',
  'reviews',
  'coupons',
  'orders',
  'shipments',
  'inventory_movements',
  'stock_alerts',
  'notifications',
  'profile',
  'store_config',
  'shipping_methods',
  'tienda_config'
] as const

export type OfflineCollectionName = (typeof OFFLINE_COLLECTIONS)[number]

export const RESOURCE_COLLECTION: Record<OfflineResource, OfflineCollectionName> = {
  product: 'products',
  category: 'categories',
  brand: 'brands',
  tag: 'tags',
  cart: 'cart',
  address: 'addresses',
  favorite: 'favorites',
  review: 'reviews',
  coupon: 'coupons',
  order: 'orders',
  shipment: 'shipments',
  inventory_movement: 'inventory_movements',
  stock_alert: 'stock_alerts',
  notification: 'notifications',
  profile: 'profile',
  store_config: 'store_config',
  tienda_config: 'tienda_config'
}

export const OFFLINE_COLLECTION_LABELS: Record<OfflineCollectionName, string> = {
  products: 'Productos',
  categories: 'Categorías',
  brands: 'Marcas',
  tags: 'Etiquetas',
  cart: 'Carrito',
  addresses: 'Direcciones',
  favorites: 'Favoritos',
  reviews: 'Reseñas',
  coupons: 'Cupones',
  orders: 'Pedidos',
  shipments: 'Envíos',
  inventory_movements: 'Movimientos de inventario',
  stock_alerts: 'Alertas de stock',
  notifications: 'Notificaciones',
  profile: 'Perfil',
  store_config: 'Configuración',
  shipping_methods: 'Métodos de envío',
  tienda_config: 'Configuración de tienda'
}

export const OFFLINE_RESOURCES = Object.keys(RESOURCE_COLLECTION) as OfflineResource[]
