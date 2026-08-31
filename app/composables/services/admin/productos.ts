import type { AdminProductFilters, BrandPayload, CategoryPayload, ProductPayload, TagPayload } from '~/types/admin'

export function useAdminProductosService() {
  const productStore = useProductStore()
  const categoryStore = useCategoryStore()
  const brandStore = useBrandStore()
  const tagStore = useTagStore()

  return {
    listar: (filters?: AdminProductFilters) => productStore.loadAdminList(filters),
    crear: (payload: ProductPayload) => productStore.adminCreate(payload),
    actualizar: (id: number, payload: Partial<ProductPayload>) =>
      productStore.adminUpdate(id, payload),
    eliminar: (id: number) => productStore.adminDelete(id),

    crearCategoria: (payload: CategoryPayload) => categoryStore.adminCreate(payload),
    actualizarCategoria: (id: number, payload: Partial<CategoryPayload>) =>
      categoryStore.adminUpdate(id, payload),
    eliminarCategoria: (id: number) => categoryStore.adminDelete(id),

    crearMarca: (payload: BrandPayload) => brandStore.adminCreate(payload),
    actualizarMarca: (id: number, payload: Partial<BrandPayload>) =>
      brandStore.adminUpdate(id, payload),
    eliminarMarca: (id: number) => brandStore.adminDelete(id),

    crearEtiqueta: (payload: TagPayload) => tagStore.adminCreate(payload),
    actualizarEtiqueta: (id: number, payload: Partial<TagPayload>) =>
      tagStore.adminUpdate(id, payload),
    eliminarEtiqueta: (id: number) => tagStore.adminDelete(id)
  }
}
