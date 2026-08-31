import type { StoreConfigPayload, TiendaConfig } from '~/types/store'

export function useAdminConfiguracionService() {
  const configStore = useStoreConfigStore()

  return {
    obtener: () => configStore.loadAdmin(),
    actualizar: (payload: StoreConfigPayload) => configStore.updateAdmin(payload),
    obtenerTienda: () => configStore.loadTiendaAdmin(),
    actualizarTienda: (config: TiendaConfig) => configStore.updateTienda(config)
  }
}
