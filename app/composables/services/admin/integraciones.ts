import type { Paginated } from '~/types/api'
import type {
  ImportacionInicialPreview,
  Integration,
  IntegrationCompraDoc,
  IntegrationPayload,
  IntegrationSistema,
  IntegrationSyncRun,
  IntegrationUltimaEjecucion,
  IntegrationVentaItem
} from '~/types/integrations'

export interface TestConnectionResult {
  success: boolean
  message: string
}

interface ApiErrorLike {
  data?: { message?: string }
}

export function apiErrorMessage(e: unknown, fallback: string): string {
  return (e as ApiErrorLike | null)?.data?.message || fallback
}

export interface SyncResultado {
  run: IntegrationUltimaEjecucion
}

export interface ImportacionInicialResultado {
  run?: {
    id: number
    estado: string
    creados: number
    actualizados: number
    omitidos: number
    errores: number
  }
  preview?: ImportacionInicialPreview
}

export function useAdminIntegracionesService() {
  const { request } = useApi()

  async function listarSistemas() {
    const res = await request<IntegrationSistema[]>('/admin/integraciones/sistemas')
    return res.data
  }

  async function listar() {
    const res = await request<Paginated<Integration>>('/admin/integraciones')
    return { items: res.data.items, pagination: res.data.pagination }
  }

  async function crear(payload: IntegrationPayload) {
    const res = await request<Integration>('/admin/integraciones', {
      method: 'POST',
      body: payload
    })
    return res.data
  }

  async function obtener(id: number) {
    const res = await request<Integration>(`/admin/integraciones/${id}`)
    return res.data
  }

  async function actualizar(id: number, payload: IntegrationPayload) {
    const res = await request<Integration>(`/admin/integraciones/${id}`, {
      method: 'PUT',
      body: payload
    })
    return res.data
  }

  async function eliminar(id: number) {
    await request(`/admin/integraciones/${id}`, { method: 'DELETE' })
  }

  async function probar(id: number) {
    const res = await request<TestConnectionResult>(`/admin/integraciones/${id}/probar`, {
      method: 'POST'
    })
    return res.data
  }

  async function activar(id: number) {
    const res = await request<Integration>(`/admin/integraciones/${id}/activar`, {
      method: 'POST'
    })
    return res.data
  }

  async function desactivar(id: number) {
    const res = await request<Integration>(`/admin/integraciones/${id}/desactivar`, {
      method: 'POST'
    })
    return res.data
  }

  async function sincronizar(id: number, tipo?: 'productos' | 'inventario' | 'compras' | 'ventas' | 'inicial' | 'todo') {
    const res = await request<SyncResultado>(`/admin/integraciones/${id}/sincronizar`, {
      method: 'POST',
      body: tipo ? { tipo } : {}
    })
    return res.data
  }

  async function importacionInicial(id: number, dryRun = false) {
    const res = await request<ImportacionInicialResultado>(`/admin/integraciones/${id}/importacion-inicial`, {
      method: 'POST',
      body: { dry_run: dryRun }
    })
    return res.data
  }

  async function listarEjecuciones(id: number, filters?: { estado?: string, page?: number, per_page?: number }) {
    const res = await request<Paginated<IntegrationSyncRun>>(`/admin/integraciones/${id}/ejecuciones`, {
      query: filters
    })
    return { items: res.data.items, pagination: res.data.pagination }
  }

  async function listarCompras(id: number, filters?: { estado?: string, page?: number, per_page?: number }) {
    const res = await request<Paginated<IntegrationCompraDoc>>(`/admin/integraciones/${id}/compras`, {
      query: filters
    })
    return { items: res.data.items, pagination: res.data.pagination }
  }

  async function listarVentas(id: number, filters?: { estado?: string, queue?: 'cola', page?: number, per_page?: number }) {
    const res = await request<Paginated<IntegrationVentaItem>>(`/admin/integraciones/${id}/ventas`, {
      query: filters
    })
    return { items: res.data.items, pagination: res.data.pagination }
  }

  return {
    listarSistemas,
    listar,
    crear,
    obtener,
    actualizar,
    eliminar,
    probar,
    activar,
    desactivar,
    sincronizar,
    importacionInicial,
    listarEjecuciones,
    listarCompras,
    listarVentas
  }
}
