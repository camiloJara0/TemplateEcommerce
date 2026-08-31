import type { ShippingMethod } from '~/types/catalog'

export const useShippingMethodStore = defineStore('shippingMethod', () => {
  const offlineStore = useOfflineStore()
  const items = ref<ShippingMethod[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(s => s.id === id) ?? null

  async function loadList(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<ShippingMethod[]>(
        'shipping_methods',
        () => request<ShippingMethod[]>('/metodos-envio'),
        { force }
      )
      items.value = data
    } finally {
      loading.value = false
    }
  }

  return { items, loading, count, byId, loadList }
})
