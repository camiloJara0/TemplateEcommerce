import type { Paginated } from '~/types/api'
import type { CreateReviewPayload, ProductReview } from '~/types/catalog'
import type { AdminReview, AdminReviewFilters } from '~/types/admin'

export interface ReviewFilters {
  estado?: string
  page?: number
  per_page?: number
}

export const useReviewStore = defineStore('review', () => {
  const offlineStore = useOfflineStore()
  const productReviews = ref<Record<number, ProductReview[]>>({})
  const adminList = ref<AdminReview[]>([])
  const adminPagination = ref<Paginated<AdminReview>['pagination'] | null>(null)
  const adminFilters = ref<AdminReviewFilters>({})
  const loading = ref(false)

  function forProduct(productId: number): ProductReview[] {
    return productReviews.value[productId] ?? []
  }

  async function loadForProduct(productId: number, force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<ProductReview[]>(
        'reviews',
        () => request<ProductReview[]>(`/productos/${productId}/resenas`),
        { force, key: `reviews:product:${productId}` }
      )
      productReviews.value[productId] = data.items
    } finally {
      loading.value = false
    }
  }

  async function create(productId: number, payload: CreateReviewPayload) {
    const { request } = useApi()
    return runMutation<ProductReview>({
      request: () => request<ProductReview>(`/productos/${productId}/resenas`, {
        method: 'POST',
        body: payload
      }),
      offline: {
        type: 'create',
        resource: 'review',
        method: 'POST',
        url: `/productos/${productId}/resenas`,
        body: { ...payload }
      },
      successMessage: 'Reseña enviada. Quedará pendiente de aprobación.',
      redirectTo: '/catalogo',
      onSuccess: (data) => {
        const list = productReviews.value[productId] ?? []
        productReviews.value[productId] = [data, ...list]
      }
    })
  }

  async function loadAdminList(filtersArg?: ReviewFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const query: Record<string, unknown> = { ...filtersArg }
      if (query.estado) {
        query.status = query.estado
        delete query.estado
      }
      const res = await request<Paginated<AdminReview>>('/admin/resenas', { query })
      adminList.value = res.data.items
      adminPagination.value = res.data.pagination
      adminFilters.value = (filtersArg as AdminReviewFilters) ?? {}
    } finally {
      loading.value = false
    }
  }

  async function adminApprove(id: number) {
    const { request } = useApi()
    return runMutation<AdminReview>({
      request: () => request<AdminReview>(`/admin/resenas/${id}/aprobar`, { method: 'POST' }),
      successMessage: 'Reseña aprobada',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(r => r.id === id)
        if (idx >= 0) adminList.value[idx] = data
      }
    })
  }

  async function adminReject(id: number) {
    const { request } = useApi()
    return runMutation<AdminReview>({
      request: () => request<AdminReview>(`/admin/resenas/${id}/rechazar`, { method: 'POST' }),
      successMessage: 'Reseña rechazada',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(r => r.id === id)
        if (idx >= 0) adminList.value[idx] = data
      }
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/resenas/${id}`, { method: 'DELETE' }),
      successMessage: 'Reseña eliminada',
      onSuccess: () => {
        adminList.value = adminList.value.filter(r => r.id !== id)
      }
    })
  }

  return {
    productReviews, adminList, adminPagination, adminFilters, loading,
    forProduct,
    loadForProduct, create,
    loadAdminList, adminApprove, adminReject, adminDelete
  }
})
