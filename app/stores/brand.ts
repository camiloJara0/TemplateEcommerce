import type { Brand } from '~/types/catalog'
import type { BrandPayload } from '~/types/admin'

export const useBrandStore = defineStore('brand', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Brand[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(b => b.id === id) ?? null

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

  async function adminCreate(payload: BrandPayload) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>('/admin/marcas', { method: 'POST', body: payload }),
      successMessage: 'Marca creada',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function adminUpdate(id: number, payload: Partial<BrandPayload>) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/marcas/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Marca actualizada',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/marcas/${id}`, { method: 'DELETE' }),
      successMessage: 'Marca eliminada',
      onSuccess: () => {
        items.value = items.value.filter(b => b.id !== id)
      }
    })
  }

  return { items, loading, count, byId, loadList, adminCreate, adminUpdate, adminDelete }
})
