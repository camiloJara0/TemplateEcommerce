import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

/**
 * Resuelve las secciones de producto combinando config global + per-product.
 *
 * Secciones GLOBALES (hero, benefits, gallery, warranty, faq, cta):
 *   Se configuran en el tienda editor. Se muestran si `show === true`.
 *
 * Secciones INDIVIDUALES (problem_solution, transform, features, comparison,
 * bundle, countdown, testimonials, ugc):
 *   Se configuran por producto en ProductForm. Se muestran si el ID del producto
 *   está en `product_ids`. El renderer valida esto directamente.
 *
 * Todas las secciones se ordenan por su campo `order`.
 */
export function useProductSections(
  productPageConfig: Record<string, unknown> | null | undefined
) {
  const configStore = useStoreConfigStore()

  const globalSections = computed<ProductoSecciones>(() => {
    return configStore.effectiveTiendaConfig?.producto ?? DEFAULT_TIENDA_CONFIG.producto
  })

  /**
   * sections: combina config global con overrides del producto.
   * Para secciones individuales, preserva product_ids del override.
   * El renderer se encarga de filtrar por product_ids.
   */
  const sections = computed<ProductoSecciones>(() => {
    if (!productPageConfig) return globalSections.value

    const merged = JSON.parse(JSON.stringify(globalSections.value)) as ProductoSecciones

    for (const [key, value] of Object.entries(productPageConfig)) {
      if (key in merged && typeof value === 'object' && value !== null) {
        ;(merged as unknown as Record<string, unknown>)[key] = {
          ...((merged as unknown as Record<string, unknown>)[key] as Record<string, unknown>),
          ...value,
        }
      }
    }

    return merged
  })

  return { sections, globalSections }
}
