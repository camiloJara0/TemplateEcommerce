export interface ActiveProviderInfo {
  provider: string
  available: string[]
}

export function usePaymentProvider() {
  const activeProvider = ref<string>('rapyd')
  const availableProviders = ref<string[]>([])
  const loading = ref(false)

  async function fetchActiveProvider() {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const response = await $fetch<{ success: boolean; data: ActiveProviderInfo }>(
        `${config.public.apiBase}/api/v1/pagos/provider`,
      )
      if (response.success && response.data) {
        activeProvider.value = response.data.provider || 'rapyd'
        availableProviders.value = response.data.available || []
      }
    } catch {
      // Default to rapyd on error
      activeProvider.value = 'rapyd'
    } finally {
      loading.value = false
    }
  }

  function isProvider(name: string): boolean {
    return activeProvider.value === name
  }

  return {
    activeProvider,
    availableProviders,
    loading,
    fetchActiveProvider,
    isProvider,
  }
}
