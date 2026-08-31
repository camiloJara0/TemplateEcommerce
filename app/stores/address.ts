import type { Address, AddressPayload } from '~/types/commerce'

export const useAddressStore = defineStore('address', () => {
  const offlineStore = useOfflineStore()
  const items = ref<Address[]>([])
  const loading = ref(false)
  const count = computed(() => items.value.length)
  const byId = (id: number) => items.value.find(a => a.id === id) ?? null
  const principal = computed(() => items.value.find(a => a.es_principal) ?? null)

  async function load(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Address[]>(
        'addresses',
        () => request<Address[]>('/direcciones'),
        { force }
      )
      items.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(payload: AddressPayload) {
    const { request } = useApi()
    return runMutation<Address>({
      request: () => request<Address>('/direcciones', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'address',
        method: 'POST',
        url: '/direcciones',
        body: { ...payload }
      },
      successMessage: 'Dirección agregada',
      onSuccess: (data) => {
        items.value = [data, ...items.value]
      }
    })
  }

  async function update(id: number, payload: Partial<AddressPayload>) {
    const { request } = useApi()
    return runMutation<Address>({
      request: () => request<Address>(`/direcciones/${id}`, { method: 'PUT', body: payload }),
      offline: {
        type: 'update',
        resource: 'address',
        method: 'PUT',
        url: `/direcciones/${id}`,
        body: { id, ...payload }
      },
      successMessage: 'Dirección actualizada',
      onSuccess: (data) => {
        const idx = items.value.findIndex(a => a.id === id)
        if (idx >= 0) items.value[idx] = data
      }
    })
  }

  async function remove(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/direcciones/${id}`, { method: 'DELETE' }),
      offline: {
        type: 'delete',
        resource: 'address',
        method: 'DELETE',
        url: `/direcciones/${id}`,
        body: { id }
      },
      successMessage: 'Dirección eliminada',
      onSuccess: () => {
        items.value = items.value.filter(a => a.id !== id)
      }
    })
  }

  return { items, loading, count, byId, principal, load, create, update, remove }
})
