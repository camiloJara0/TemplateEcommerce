export function usePrefetch() {
  const categoryStore = useCategoryStore()
  const brandStore = useBrandStore()
  const tagStore = useTagStore()
  const storeConfigStore = useStoreConfigStore()
  const shippingMethodStore = useShippingMethodStore()

  const prefetched = ref(false)
  const loading = ref(false)

  async function prefetchBase() {
    if (prefetched.value) return
    loading.value = true
    try {
      await Promise.all([
        categoryStore.loadList(),
        brandStore.loadList(),
        tagStore.loadList(),
        storeConfigStore.loadCombined(),
        shippingMethodStore.loadList(),
      ])
      prefetched.value = true
    } finally {
      loading.value = false
    }
  }

  async function prefetchProducts(filters?: Record<string, unknown>) {
    const productStore = useProductStore()
    await productStore.loadList(filters)
  }

  async function prefetchAll(filters?: Record<string, unknown>) {
    await Promise.all([
      prefetchBase(),
      prefetchProducts(filters),
    ])
  }

  return { prefetchBase, prefetchProducts, prefetchAll, prefetched, loading }
}
