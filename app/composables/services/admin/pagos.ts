import type { Payment } from '~/types/commerce'
import type { Paginated } from '~/types/api'

export interface PaymentConfigProvider {
  name: string
  configured: boolean
  is_default: boolean
  credentials_status: Record<string, boolean>
}

export interface PaymentConfig {
  default_provider: string
  providers: Record<string, PaymentConfigProvider>
}

export interface PaymentFilters {
  provider?: string
  status?: string
  desde?: string
  hasta?: string
  page?: number
  per_page?: number
}

export interface TestConnectionResult {
  success: boolean
  message: string
}

export function useAdminPagosService() {
  const { request } = useApi()

  async function listarPagos(filters?: PaymentFilters) {
    const res = await request<Paginated<Payment>>('/admin/pagos', { query: filters })
    return { items: res.data.items, pagination: res.data.pagination }
  }

  async function obtenerPago(id: number) {
    const res = await request<Payment>(`/admin/pagos/${id}`)
    return res.data
  }

  async function reembolsar(paymentId: number, payload: { amount: number; reason?: string }) {
    const res = await request(`/admin/pagos/${paymentId}/reembolsar`, {
      method: 'POST',
      body: payload,
    })
    return res.data
  }

  async function cancelar(paymentId: number) {
    const res = await request(`/admin/pagos/${paymentId}/cancelar`, {
      method: 'POST',
    })
    return res.data
  }

  async function obtenerConfiguracion() {
    const res = await request<PaymentConfig>('/admin/configuracion/pagos')
    return res.data
  }

  async function actualizarConfiguracion(payload: { default_provider?: string; credentials?: Record<string, Record<string, string>> }) {
    const res = await request<PaymentConfig>('/admin/configuracion/pagos', {
      method: 'PUT',
      body: payload,
    })
    return res.data
  }

  async function probarProveedor(provider: string) {
    const res = await request<TestConnectionResult>('/admin/configuracion/pagos/probar', {
      method: 'POST',
      body: { provider },
    })
    return res.data
  }

  return {
    listarPagos,
    obtenerPago,
    reembolsar,
    cancelar,
    obtenerConfiguracion,
    actualizarConfiguracion,
    probarProveedor,
  }
}
