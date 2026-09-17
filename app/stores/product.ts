import type { Paginated } from '~/types/api'
import type { Product, ProductFilters, ProductReview } from '~/types/catalog'
import type { AdminProductFilters, ProductPayload } from '~/types/admin'

function hasFileImages(images?: (string | File)[]): images is File[] {
  return !!images?.length && images.some(i => i instanceof File)
}

function buildProductFormData(payload: ProductPayload, editar: Boolean): FormData {
  const fd = new FormData()
  fd.append('name', payload.name)
  fd.append('sku', payload.sku)
  fd.append('price', String(payload.price))
  if (payload.category_id != null) fd.append('category_id', String(payload.category_id))
  if (payload.brand_id != null) fd.append('brand_id', String(payload.brand_id))
  if (payload.description) fd.append('description', payload.description)
  if (payload.price_discount != null) fd.append('price_discount', String(payload.price_discount))
  if (payload.weight != null) fd.append('weight', String(payload.weight))
  if (payload.stock != null) fd.append('stock', String(payload.stock))
  if (payload.is_featured != null) fd.append('is_featured', payload.is_featured ? '1' : '0')
  if (payload.estado) fd.append('estado', payload.estado)
  if (payload.images) {
    payload.images.forEach((img, i) => {
      if (img instanceof File) {
        fd.append(`images[${i}]`, img)
      }
    })
  }
  if (payload.tags) {
    payload.tags.forEach((t, i) => fd.append(`tags[${i}]`, String(t)))
  }
  if (payload.variants) {
    payload.variants.forEach((v, i) => {
      fd.append(`variants[${i}][sku]`, v.sku)
      fd.append(`variants[${i}][price]`, String(v.price))
      if (v.price_discount != null) fd.append(`variants[${i}][price_discount]`, String(v.price_discount))
      if (v.stock != null) fd.append(`variants[${i}][stock]`, String(v.stock))
    })
  }
  if (editar) {
    fd.append("_method", "PUT")
  }
  return fd
}

export const useProductStore = defineStore('product', () => {
  const offlineStore = useOfflineStore()
  const { canCall } = useRateLimit()

  const items = ref<Product[]>([])
  const related = ref<Product[]>([])
  const reviewsByProduct = ref<Record<number, ProductReview[]>>({})
  const current = ref<Product | null>(null)
  const pagination = ref<Paginated<Product>['pagination'] | null>(null)
  const loadingList = ref(false)
  const loadingOne = ref(false)
  const filters = ref<ProductFilters>({})
  const adminList = ref<Product[]>([])
  const adminPagination = ref<Paginated<Product>['pagination'] | null>(null)
  const adminFilters = ref<AdminProductFilters>({})

  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(p => p.id === id) ?? null

  async function loadList(filtersArg?: ProductFilters) {
    loadingList.value = true
    filters.value = filtersArg ?? {}
    try {
      const { request } = useApi()
      const key = `products:${JSON.stringify(filtersArg ?? {})}`
      const data = await offlineStore.loadCollection<Paginated<Product>>(
        'products',
        () => request<Paginated<Product>>('/productos', { query: filtersArg }),
        { key }
      )
      items.value = data.data
      pagination.value = data.pagination
    } finally {
      loadingList.value = false
    }
  }

  async function loadOne(slug: string) {
    loadingOne.value = true
    try {
      const { request } = useApi()
      const res = await request<Product>(`/productos/${slug}`)
      current.value = res.data
    } finally {
      loadingOne.value = false
    }
  }

  async function loadRelated(id: number) {
    const { request } = useApi()
    const res = await request<Product[]>(`/productos/${id}/relacionados`)
    related.value = res.data
  }

  async function loadProductDetail(slug: string) {
    loadingOne.value = true
    try {
      const { request } = useApi()
      const res = await request<{
        product: Product
        related: Product[]
        reviews: { items: ProductReview[]; pagination: Paginated<ProductReview>['pagination'] }
      }>(`/productos/${slug}/detalle`)
      current.value = res.data.product
      related.value = res.data.related
      reviewsByProduct.value[res.data.product.id] = res.data.reviews.items
    } finally {
      loadingOne.value = false
    }
  }

  async function loadReviews(id: number, force = false) {
    const { request } = useApi()
    const res = await offlineStore.loadCollection<ProductReview[]>(
      'reviews',
      () => request<ProductReview[]>(`/productos/${id}/resenas`),
      { force, key: `reviews:product:${id}` }
    )
    reviewsByProduct.value[id] = res.items
  }

  async function loadAdminList(filtersArg?: AdminProductFilters) {
    const { request } = useApi()
    const res = await request<Paginated<Product>>('/admin/productos', { query: filtersArg })
    adminList.value = res.data.data
    adminPagination.value = res.data.pagination
    adminFilters.value = filtersArg ?? {}
  }

  async function adminCreate(payload: ProductPayload) {
    if (!canCall('product:create', 1000)) return null
    const { request } = useApi()
    const body = hasFileImages(payload.images) ? buildProductFormData(payload, false) : payload
    return runMutation<Product>({
      request: () => request<Product>('/admin/productos', { method: 'POST', body }),
      successMessage: 'Producto creado correctamente',
      onSuccess: (data) => {
        adminList.value = [data, ...adminList.value]
      }
    })
  }

  async function adminUpdate(id: number, payload: Partial<ProductPayload>) {
    if (!canCall(`product:update:${id}`, 1000)) return null
    const { request } = useApi()
    const body = hasFileImages(payload.images)
      ? buildProductFormData(payload as ProductPayload, true)
      : payload
    return runMutation<Product>({
      request: () => request<Product>(`/admin/productos/${id}`, { method: 'PUT', body }),
      successMessage: 'Producto actualizado correctamente',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(p => p.id === id)
        if (idx >= 0) adminList.value[idx] = data
        if (current.value?.id === id) current.value = data
      }
    })
  }

  async function adminDelete(id: number) {
    if (!canCall(`product:delete:${id}`, 1000)) return null
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/productos/${id}`, { method: 'DELETE' }),
      successMessage: 'Producto eliminado',
      onSuccess: () => {
        adminList.value = adminList.value.filter(p => p.id !== id)
      }
    })
  }

  return {
    items, related, reviewsByProduct, current, pagination,
    loadingList, loadingOne, filters,
    adminList, adminPagination, adminFilters,
    count, byId,
    loadList, loadOne, loadRelated, loadReviews, loadProductDetail,
    loadAdminList, adminCreate, adminUpdate, adminDelete
  }
})
