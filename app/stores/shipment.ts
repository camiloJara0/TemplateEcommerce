import type { Paginated } from '~/types/api'
import type { AdminShipment, CreateShipmentPayload, ShipmentQuote, ShipmentQuoteQuery, ShipmentStatusPayload } from '~/types/admin'
import type { TrackingInfo } from '~/types/commerce'

export const useShipmentStore = defineStore('shipment', () => {
  const offlineStore = useOfflineStore()
  const adminList = ref<AdminShipment[]>([])
  const adminPagination = ref<Paginated<AdminShipment>['pagination'] | null>(null)
  const current = ref<AdminShipment | null>(null)
  const tracking = ref<TrackingInfo | null>(null)
  const loading = ref(false)
  const loadingTrack = ref(false)

  async function loadAdminList() {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paginated<AdminShipment>>('/admin/envios')
      adminList.value = res.data.items
      adminPagination.value = res.data.pagination
    } finally {
      loading.value = false
    }
  }

  async function loadAdminOne(id: number) {
    const { request } = useApi()
    const res = await request<AdminShipment>(`/admin/envios/${id}`)
    current.value = res.data
  }

  async function quote(query: ShipmentQuoteQuery) {
    const { request } = useApi()
    const res = await request<ShipmentQuote>('/admin/envios/cotizar', { query })
    return res.data
  }

  async function adminCreate(payload: CreateShipmentPayload) {
    const { request } = useApi()
    return runMutation<AdminShipment>({
      request: () => request<AdminShipment>('/admin/envios', { method: 'POST', body: payload }),
      successMessage: 'Envío creado',
      onSuccess: (data) => {
        adminList.value = [data, ...adminList.value]
      }
    })
  }

  async function adminChangeStatus(id: number, payload: ShipmentStatusPayload) {
    const { request } = useApi()
    return runMutation<AdminShipment>({
      request: () => request<AdminShipment>(`/admin/envios/${id}/estado`, { method: 'PUT', body: payload }),
      successMessage: 'Estado del envío actualizado',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(s => s.id === id)
        if (idx >= 0) adminList.value[idx] = data
        if (current.value?.id === id) current.value = data
      }
    })
  }

  async function track(trackingNumber: string) {
    loadingTrack.value = true
    try {
      const { request } = useApi()
      const res = await offlineStore.loadCollection<TrackingInfo>(
        'shipments',
        () => request<TrackingInfo>(`/envios/tracking/${trackingNumber}`),
        { key: `tracking:${trackingNumber}` }
      )
      tracking.value = res
    } finally {
      loadingTrack.value = false
    }
  }

  return {
    adminList, adminPagination, current, tracking,
    loading, loadingTrack,
    loadAdminList, loadAdminOne, quote, adminCreate, adminChangeStatus, track
  }
})
