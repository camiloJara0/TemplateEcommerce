import type { Brand } from '~/types/catalog'
import type { BrandPayload } from '~/types/admin'

export const useBrandStore = defineStore('brand', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Brand[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(b => b.id === id) ?? null

  const adminItems = ref<Brand[]>([])
  const adminLoading = ref(false)
  const adminLoaded = ref(false)

  async function loadList(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Brand[]>(
        'brands',
        () => request<Brand[]>('/marcas'),
        { force }
      )
      items.value = data
    } finally {
      loading.value = false
    }
  }

  async function loadAdminList(force = false) {
    if (!force && adminLoaded.value) return
    adminLoading.value = true
    try {
      const { request } = useApi()
      const res = await request<Brand[]>('/admin/marcas', { method: 'GET' })
      adminItems.value = res.data ?? []
      adminLoaded.value = true
    } finally {
      adminLoading.value = false
    }
  }

  function refreshAfterMutation() {
    void loadList(true)
    if (adminLoaded.value) void loadAdminList(true)
  }

  async function adminCreate(payload: BrandPayload) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>('/admin/marcas', { method: 'POST', body: payload }),
      successMessage: 'Marca creada',
      onSuccess: refreshAfterMutation
    })
  }

  async function adminUpdate(id: number, payload: Partial<BrandPayload>) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/marcas/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Marca actualizada',
      onSuccess: refreshAfterMutation
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/marcas/${id}`, { method: 'DELETE' }),
      successMessage: 'Marca eliminada',
      onSuccess: () => {
        items.value = items.value.filter(b => b.id !== id)
        adminItems.value = adminItems.value.filter(b => b.id !== id)
      }
    })
  }

  return {
    items, loading, count, byId, loadList,
    adminItems, adminLoading, adminLoaded, loadAdminList,
    adminCreate, adminUpdate, adminDelete
  }
})
