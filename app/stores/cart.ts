import type { Cart, AddCartItemPayload, UpdateCartItemPayload } from '~/types/commerce'

export const useCartStore = defineStore('cart', () => {
  const offlineStore = useOfflineStore()
  const cart = ref<Cart | null>(null)
  const loading = ref(false)
  const sessionId = ref<string | null>(initSessionId())

  const items = computed(() => cart.value?.items ?? [])
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const isEmpty = computed(() => items.value.length === 0)
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0))

  function initSessionId(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('cart_session_id')
  }

  function getSessionId() {
    if (sessionId.value) return sessionId.value
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('cart_session_id')
      if (!id) {
        id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        sessionStorage.setItem('cart_session_id', id)
      }
      sessionId.value = id
      return id
    }
    return undefined
  }

  async function load(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const sid = getSessionId()
      const data = await offlineStore.loadCollection<Cart>(
        'cart',
        () => request<Cart>('/carrito', { query: sid ? { session_id: sid } : undefined }),
        { force, key: sid ? `cart:${sid}` : undefined }
      )
      cart.value = data
    } finally {
      loading.value = false
    }
  }

  async function addItem(payload: AddCartItemPayload) {
    const { request } = useApi()
    const sid = getSessionId()
    const body = { ...payload, session_id: payload.session_id ?? sid }
    return runMutation<Cart>({
      request: () => request<Cart>('/carrito/items', { method: 'POST', body }),
      offline: {
        type: 'create',
        resource: 'cart',
        method: 'POST',
        url: '/carrito/items',
        body: { ...body }
      },
      successMessage: 'Producto agregado al carrito',
      onSuccess: (data) => {
        cart.value = data
      }
    })
  }

  async function updateItem(itemId: number, payload: UpdateCartItemPayload) {
    const { request } = useApi()
    const sid = getSessionId()
    return runMutation<Cart>({
      request: () => request<Cart>(`/carrito/items/${itemId}`, {
        method: 'PUT',
        body: payload,
        query: sid ? { session_id: sid } : undefined
      }),
      offline: {
        type: 'update',
        resource: 'cart',
        method: 'PUT',
        url: `/carrito/items/${itemId}`,
        body: { id: itemId, ...payload }
      },
      successMessage: 'Carrito actualizado',
      onSuccess: (data) => {
        cart.value = data
      }
    })
  }

  async function removeItem(itemId: number) {
    const { request } = useApi()
    const sid = getSessionId()
    return runMutation<Cart>({
      request: () => request<Cart>(`/carrito/items/${itemId}`, {
        method: 'DELETE',
        query: sid ? { session_id: sid } : undefined
      }),
      offline: {
        type: 'delete',
        resource: 'cart',
        method: 'DELETE',
        url: `/carrito/items/${itemId}`,
        body: { id: itemId }
      },
      successMessage: 'Producto eliminado del carrito',
      onSuccess: (data) => {
        cart.value = data
      }
    })
  }

  async function clear() {
    const { request } = useApi()
    const sid = getSessionId()
    return runMutation<null>({
      request: () => request<null>('/carrito', {
        method: 'DELETE',
        query: sid ? { session_id: sid } : undefined
      }),
      offline: {
        type: 'delete',
        resource: 'cart',
        method: 'DELETE',
        url: '/carrito',
        body: { session_id: sid ?? '' }
      },
      successMessage: 'Carrito vaciado',
      onSuccess: () => {
        if (cart.value) cart.value = { ...cart.value, items: [], items_count: 0 }
      }
    })
  }

  function reset() {
    cart.value = null
    sessionId.value = null
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('cart_session_id')
      } catch {
        // ignore storage errors
      }
    }
  }

  return {
    cart, loading, sessionId,
    items, itemCount, isEmpty, subtotal,
    load, addItem, updateItem, removeItem, clear, reset
  }
})
