import type { Tag } from '~/types/catalog'
import type { TagPayload } from '~/types/admin'

export const useTagStore = defineStore('tag', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Tag[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(t => t.id === id) ?? null

  const adminItems = ref<Tag[]>([])
  const adminLoading = ref(false)
  const adminLoaded = ref(false)

  async function loadList(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Tag[]>(
        'tags',
        () => request<Tag[]>('/etiquetas'),
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
      const res = await request<Tag[]>('/admin/etiquetas', { method: 'GET' })
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

  async function adminCreate(payload: TagPayload) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>('/admin/etiquetas', { method: 'POST', body: payload }),
      successMessage: 'Etiqueta creada',
      onSuccess: refreshAfterMutation
    })
  }

  async function adminUpdate(id: number, payload: Partial<TagPayload>) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/etiquetas/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Etiqueta actualizada',
      onSuccess: refreshAfterMutation
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/etiquetas/${id}`, { method: 'DELETE' }),
      successMessage: 'Etiqueta eliminada',
      onSuccess: () => {
        items.value = items.value.filter(t => t.id !== id)
        adminItems.value = adminItems.value.filter(t => t.id !== id)
      }
    })
  }

  return {
    items, loading, count, byId, loadList,
    adminItems, adminLoading, adminLoaded, loadAdminList,
    adminCreate, adminUpdate, adminDelete
  }
})
