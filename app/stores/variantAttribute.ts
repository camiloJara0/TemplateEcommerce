import type { AdminVariantAttribute } from '~/types/catalog'

export const useVariantAttributeStore = defineStore('variantAttribute', () => {
  const items = ref<AdminVariantAttribute[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function loadList(force = false) {
    if (!force && loaded.value) return
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<AdminVariantAttribute[]>('/admin/variant-attributes', { method: 'GET' })
      items.value = res.data ?? []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function crear(payload: { name: string }) {
    const { request } = useApi()
    return runMutation<AdminVariantAttribute>({
      request: () => request<AdminVariantAttribute>('/admin/variant-attributes', { method: 'POST', body: payload }),
      successMessage: 'Atributo creado',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function actualizar(id: number, payload: { name: string }) {
    const { request } = useApi()
    return runMutation<AdminVariantAttribute>({
      request: () => request<AdminVariantAttribute>(`/admin/variant-attributes/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Atributo actualizado',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function eliminar(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/variant-attributes/${id}`, { method: 'DELETE' }),
      successMessage: 'Atributo eliminado',
      onSuccess: () => {
        items.value = items.value.filter(a => a.id !== id)
      }
    })
  }

  async function crearValor(attributeId: number, value: string) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/variant-attributes/${attributeId}/values`, {
        method: 'POST',
        body: { value }
      }),
      successMessage: 'Valor creado',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function actualizarValor(valueId: number, value: string) {
    const { request } = useApi()
    return runMutation<{ id: number }>({
      request: () => request<{ id: number }>(`/admin/variant-values/${valueId}`, {
        method: 'PUT',
        body: { value }
      }),
      successMessage: 'Valor actualizado',
      onSuccess: () => { void loadList(true) }
    })
  }

  async function eliminarValor(valueId: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/variant-values/${valueId}`, { method: 'DELETE' }),
      successMessage: 'Valor eliminado',
      onSuccess: () => {
        items.value = items.value.map(a => ({
          ...a,
          values: a.values.filter(v => v.id !== valueId)
        }))
      }
    })
  }

  return {
    items, loading, loaded, loadList,
    crear, actualizar, eliminar,
    crearValor, actualizarValor, eliminarValor
  }
})
