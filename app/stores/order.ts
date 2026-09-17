import type { Paginated } from '~/types/api'
import type {
  ApplyCouponPayload,
  CheckoutPreview,
  CheckoutPreviewPayload,
  Coupon,
  CreateOrderPayload,
  Order,
  PayOrderPayload
} from '~/types/commerce'
import type { AdminOrderFilters, ChangeOrderStatusPayload, RefundPayload } from '~/types/admin'

export const useOrderStore = defineStore('order', () => {
  const { canCall } = useRateLimit()
  const items = ref<Order[]>([])
  const pagination = ref<Paginated<Order>['pagination'] | null>(null)
  const current = ref<Order | null>(null)
  const preview = ref<CheckoutPreview | null>(null)
  const appliedCoupon = ref<Coupon | null>(null)
  const loadingList = ref(false)
  const loadingOne = ref(false)

  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(o => o.id === id) ?? null

  async function loadList(perPage = 15, page = 1) {
    loadingList.value = true
    try {
      const { request } = useApi()
      const data = await request<Paginated<Order>>('/pedidos', {
        query: { per_page: perPage, page }
      })
      items.value = data.data.items
      pagination.value = data.data.pagination
    } finally {
      loadingList.value = false
    }
  }

  async function loadOne(id: number) {
    loadingOne.value = true
    try {
      const { request } = useApi()
      const res = await request<Order>(`/pedidos/${id}`)
      current.value = res.data
    } finally {
      loadingOne.value = false
    }
  }

  async function getPreview(payload: CheckoutPreviewPayload) {
    const { request } = useApi()
    const result = await runMutation<CheckoutPreview>({
      request: () => request<CheckoutPreview>('/checkout/preview', { method: 'POST', body: payload }),
      successMessage: 'Resumen actualizado',
      onSuccess: (data) => {
        preview.value = data
      }
    })
    return result
  }

  async function create(payload: CreateOrderPayload) {
    if (!canCall('order:create', 2000)) return null
    const { request } = useApi()
    return runMutation<Order>({
      request: () => request<Order>('/pedidos', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'order',
        method: 'POST',
        url: '/pedidos',
        body: { ...payload }
      },
      successMessage: 'Pedido creado correctamente',
      redirectTo: data => `/checkout/pago/${data.id}`,
      onSuccess: (data) => {
        items.value = [data, ...items.value]
        current.value = data
      }
    })
  }

  async function pay(id: number, payload: PayOrderPayload) {
    if (!canCall(`order:pay:${id}`, 2000)) return null
    const { request } = useApi()
    return runMutation<Order>({
      request: () => request<Order>(`/pedidos/${id}/pagar`, { method: 'POST', body: payload }),
      offline: {
        type: 'update',
        resource: 'order',
        method: 'POST',
        url: `/pedidos/${id}/pagar`,
        body: { id, ...payload }
      },
      successMessage: 'Pago registrado',
      redirectTo: `/cuenta/pedidos/${id}`,
      onSuccess: (data) => {
        const idx = items.value.findIndex(o => o.id === id)
        if (idx >= 0) items.value[idx] = data
        if (current.value?.id === id) current.value = data
      }
    })
  }

  async function applyCoupon(payload: ApplyCouponPayload) {
    const { request } = useApi()
    return runMutation<Coupon>({
      request: () => request<Coupon>('/cupones/aplicar', { method: 'POST', body: payload }),
      successMessage: 'Cupón aplicado',
      onSuccess: (data) => {
        appliedCoupon.value = data
        if (preview.value) {
          preview.value = { ...preview.value, coupon: data }
        }
      }
    })
  }

  function clearCoupon() {
    appliedCoupon.value = null
    if (preview.value) preview.value = { ...preview.value, coupon: null }
  }

  return {
    items, pagination, current, preview, appliedCoupon,
    loadingList, loadingOne,
    count, byId,
    loadList, loadOne, getPreview, create, pay, applyCoupon, clearCoupon
  }
})

export const useAdminOrderStore = defineStore('admin-order', () => {
  const items = ref<Order[]>([])
  const pagination = ref<Paginated<Order>['pagination'] | null>(null)
  const filters = ref<AdminOrderFilters>({})
  const loading = ref(false)

  async function loadList(filtersArg?: AdminOrderFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paginated<Order>>('/admin/pedidos', { query: filtersArg })
      items.value = res.data.items
      pagination.value = res.data.pagination
      filters.value = filtersArg ?? {}
    } finally {
      loading.value = false
    }
  }

  async function changeStatus(id: number, payload: ChangeOrderStatusPayload) {
    const { request } = useApi()
    return runMutation<Order>({
      request: () => request<Order>(`/admin/pedidos/${id}/estado`, { method: 'POST', body: payload }),
      successMessage: 'Estado del pedido actualizado',
      onSuccess: (data) => {
        const idx = items.value.findIndex(o => o.id === id)
        if (idx >= 0) items.value[idx] = data
      }
    })
  }

  async function refund(paymentId: number, payload: RefundPayload) {
    const { request } = useApi()
    return runMutation<Order>({
      request: () => request<Order>(`/admin/pagos/${paymentId}/reembolsar`, { method: 'POST', body: payload }),
      successMessage: 'Reembolso procesado',
      onSuccess: (data) => {
        const idx = items.value.findIndex(o => o.id === data.id)
        if (idx >= 0) items.value[idx] = data
      }
    })
  }

  return { items, pagination, filters, loading, loadList, changeStatus, refund }
})
