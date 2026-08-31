import type { Category } from '~/types/catalog'
import type { CategoryPayload } from '~/types/admin'

export const useCategoryStore = defineStore('category', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Category[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(c => c.id === id) ?? null
  const bySlug = (slug: string) => items.value.find(c => c.slug === slug) ?? null

  async function loadList(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Category[]>(
        'categories',
        () => request<Category[]>('/categorias'),
        { force }
      )
      items.value = data
    } finally {
      loading.value = false
    }
  }

  async function adminCreate(payload: CategoryPayload) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>('/admin/categorias', { method: 'POST', body: payload }),
      successMessage: 'Categoría creada',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function adminUpdate(id: number, payload: Partial<CategoryPayload>) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/categorias/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Categoría actualizada',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/categorias/${id}`, { method: 'DELETE' }),
      successMessage: 'Categoría eliminada',
      onSuccess: () => {
        items.value = items.value.filter(c => c.id !== id)
      }
    })
  }

  return { items, loading, count, byId, bySlug, loadList, adminCreate, adminUpdate, adminDelete }
})
