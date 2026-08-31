export function useConfiguracionService() {
  const configStore = useStoreConfigStore()

  return {
    publica: (force?: boolean) => configStore.loadPublic(force ?? false),
    tienda: (force?: boolean) => configStore.loadTienda(force ?? false)
  }
}
