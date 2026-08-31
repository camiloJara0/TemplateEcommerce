import type { Favorite } from '~/types/commerce'

export interface AddFavoritePayload {
  product_id: number
}

export const useFavoriteStore = defineStore('favorite', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Favorite[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const productIds = computed(() => items.value.map(f => f.product_id))
  const has = (productId: number) => productIds.value.includes(productId)

  async function load(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Favorite[]>(
        'favorites',
        () => request<Favorite[]>('/favoritos'),
        { force }
      )
      items.value = data
    } finally {
      loading.value = false
    }
  }

  async function add(payload: AddFavoritePayload) {
    const { request } = useApi()
    return runMutation<Favorite>({
      request: () => request<Favorite>('/favoritos', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'favorite',
        method: 'POST',
        url: '/favoritos',
        body: { ...payload }
      },
      successMessage: 'Agregado a favoritos',
      onSuccess: (data) => {
        const exists = items.value.find(f => f.product_id === payload.product_id)
        if (!exists) items.value = [data, ...items.value]
      }
    })
  }

  async function remove(productId: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/favoritos/${productId}`, { method: 'DELETE' }),
      offline: {
        type: 'delete',
        resource: 'favorite',
        method: 'DELETE',
        url: `/favoritos/${productId}`,
        body: { id: productId }
      },
      successMessage: 'Eliminado de favoritos',
      onSuccess: () => {
        items.value = items.value.filter(f => f.product_id !== productId)
      }
    })
  }

  async function moveToCart(itemId: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/favoritos/${itemId}/mover-al-carrito`, { method: 'POST' }),
      successMessage: 'Producto movido al carrito',
      onSuccess: () => {
        items.value = items.value.filter(f => f.id !== itemId)
      }
    })
  }

  function toggle(productId: number) {
    if (has(productId)) return remove(productId)
    return add({ product_id: productId })
  }

  return { items, loading, count, productIds, has, load, add, remove, moveToCart, toggle }
})
