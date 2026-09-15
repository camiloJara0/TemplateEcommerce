import type { OrderStatus, PaymentStatus, ShippingStatus } from '~/types/api'

type StatusMeta = {
  label: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'secondary'
  icon: string
}

const orderMap: Record<OrderStatus, StatusMeta> = {
  nuevo: { label: 'Nuevo', color: 'info', icon: 'i-lucide-sparkles' },
  pagado: { label: 'Pagado', color: 'success', icon: 'i-lucide-badge-check' },
  preparando: { label: 'Preparando', color: 'warning', icon: 'i-lucide-package' },
  enviado: { label: 'Enviado', color: 'primary', icon: 'i-lucide-truck' },
  entregado: { label: 'Entregado', color: 'success', icon: 'i-lucide-circle-check' },
  cancelado: { label: 'Cancelado', color: 'error', icon: 'i-lucide-circle-x' },
  devuelto: { label: 'Devuelto', color: 'neutral', icon: 'i-lucide-undo-2' }
}

const paymentMap: Record<PaymentStatus, StatusMeta> = {
  pendiente: { label: 'Pendiente', color: 'warning', icon: 'i-lucide-clock' },
  aprobado: { label: 'Aprobado', color: 'success', icon: 'i-lucide-circle-check' },
  pagado: { label: 'Pagado', color: 'success', icon: 'i-lucide-circle-check' },
  fallido: { label: 'Fallido', color: 'error', icon: 'i-lucide-circle-alert' },
  rechazado: { label: 'Rechazado', color: 'error', icon: 'i-lucide-circle-x' },
  reembolsado: { label: 'Reembolsado', color: 'neutral', icon: 'i-lucide-banknote' }
}

const shippingMap: Record<ShippingStatus, StatusMeta> = {
  pendiente: { label: 'Pendiente', color: 'neutral', icon: 'i-lucide-clock' },
  en_preparacion: { label: 'En preparación', color: 'warning', icon: 'i-lucide-package' },
  despachado: { label: 'Despachado', color: 'info', icon: 'i-lucide-send' },
  en_transito: { label: 'En tránsito', color: 'primary', icon: 'i-lucide-truck' },
  entregado: { label: 'Entregado', color: 'success', icon: 'i-lucide-circle-check' }
}

export function orderStatusMeta(status: OrderStatus): StatusMeta {
  return orderMap[status] ?? { label: status, color: 'neutral', icon: 'i-lucide-circle' }
}

export function paymentStatusMeta(status: PaymentStatus): StatusMeta {
  return paymentMap[status] ?? { label: status, color: 'neutral', icon: 'i-lucide-circle' }
}

export function shippingStatusMeta(status: ShippingStatus): StatusMeta {
  return shippingMap[status] ?? { label: status, color: 'neutral', icon: 'i-lucide-circle' }
}
