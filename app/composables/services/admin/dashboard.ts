import type {
  DashboardSummary,
  InventoryReportQuery,
  SalesByCategory,
  SalesByDay,
  SalesReportQuery,
  TopProduct,
  UsersRegistered
} from '~/types/admin'

export function useAdminDashboardService() {
  const summary = ref<DashboardSummary | null>(null)
  const salesByDay = ref<SalesByDay[]>([])
  const salesByCategory = ref<SalesByCategory[]>([])
  const topProducts = ref<TopProduct[]>([])
  const usersRegistered = ref<UsersRegistered[]>([])
  const loading = ref(false)

  async function loadAll(dias = 7, limite = 5) {
    loading.value = true
    try {
      const { request } = useApi()
      const [resumenRes, diasRes, catRes, topRes, usersRes] = await Promise.all([
        request<DashboardSummary>('/admin/dashboard/resumen'),
        request<SalesByDay[]>('/admin/dashboard/ventas-por-dia', { query: { dias } }),
        request<SalesByCategory[]>('/admin/dashboard/ventas-por-categoria'),
        request<TopProduct[]>('/admin/dashboard/top-productos', { query: { limite } }),
        request<UsersRegistered[]>('/admin/dashboard/usuarios-registrados')
      ])
      summary.value = resumenRes.data
      salesByDay.value = diasRes.data
      salesByCategory.value = catRes.data
      topProducts.value = topRes.data
      usersRegistered.value = usersRes.data
    } finally {
      loading.value = false
    }
  }

  async function reporteVentas(query: SalesReportQuery) {
    const { request } = useApi()
    const res = await request<Blob>('/admin/reportes/ventas', {
      query,
      responseType: 'blob'
    })
    return res.data
  }

  async function reporteInventario(query: InventoryReportQuery) {
    const { request } = useApi()
    const res = await request<Blob>('/admin/reportes/inventario', {
      query,
      responseType: 'blob'
    })
    return res.data
  }

  async function reporteClientes(query: { formato?: 'csv' | 'pdf' | 'excel' } = {}) {
    const { request } = useApi()
    const res = await request<Blob>('/admin/reportes/clientes', {
      query,
      responseType: 'blob'
    })
    return res.data
  }

  async function reporteProductos(query: { formato?: 'csv' | 'pdf' | 'excel' } = {}) {
    const { request } = useApi()
    const res = await request<Blob>('/admin/reportes/productos', {
      query,
      responseType: 'blob'
    })
    return res.data
  }

  return {
    summary, salesByDay, salesByCategory, topProducts, usersRegistered, loading,
    loadAll,
    reporteVentas, reporteInventario, reporteClientes, reporteProductos
  }
}
