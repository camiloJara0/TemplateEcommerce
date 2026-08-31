import type { ProductoSecciones } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

/**
 * Combina la configuración global de secciones de producto con la configuración
 * específica de un producto (almacenada en `products.page_config`).
 *
 * Uso:
 *   const { sections } = useProductSections(product.value)
 *
 * El `page_config` del producto tiene la estructura parcial de ProductoSecciones.
 * Solo los campos presentes sobreescriben los globales.
 */
export function useProductSections(productPageConfig: Record<string, unknown> | null | undefined) {
  const configStore = useStoreConfigStore()

  const globalSections = computed<ProductoSecciones>(() => {
    return configStore.effectiveTiendaConfig?.producto ?? DEFAULT_TIENDA_CONFIG.producto
  })

  const sections = computed<ProductoSecciones>(() => {
    if (!productPageConfig) return globalSections.value

    const merged = { ...globalSections.value }

    for (const [key, value] of Object.entries(productPageConfig)) {
      if (key in merged && typeof value === 'object' && value !== null) {
        ;(merged as Record<string, unknown>)[key] = {
          ...((merged as Record<string, unknown>)[key] as Record<string, unknown>),
          ...value,
        }
      }
    }

    return merged
  })

  return { sections }
}
