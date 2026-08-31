import type { ProductFilters } from '~/types/catalog'

export function useCatalogoService() {
  const productStore = useProductStore()
  const categoryStore = useCategoryStore()
  const brandStore = useBrandStore()
  const tagStore = useTagStore()
  const shippingStore = useShippingMethodStore()

  return {
    listarProductos: (filters?: ProductFilters) => productStore.loadList(filters),
    obtenerProducto: (slug: string) => productStore.loadOne(slug),
    obtenerRelacionados: (id: number) => productStore.loadRelated(id),
    listarResenasProducto: (id: number, force?: boolean) =>
      productStore.loadReviews(id, force ?? false),
    listarCategorias: (force?: boolean) => categoryStore.loadList(force ?? false),
    listarMarcas: (force?: boolean) => brandStore.loadList(force ?? false),
    listarEtiquetas: (force?: boolean) => tagStore.loadList(force ?? false),
    listarMetodosEnvio: (force?: boolean) => shippingStore.loadList(force ?? false)
  }
}
