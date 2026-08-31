import type { UpdateProfilePayload, User } from '~/types/api'

type ProfileRow = User & Record<string, unknown>

export const useProfileStore = defineStore('profile', () => {
  const offlineStore = useOfflineStore()
  const toast = useToast()

  const profile = ref<ProfileRow | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoaded = computed(() => !!profile.value)
  const initials = computed(() => {
    if (!profile.value?.nombre) return '?'
    return profile.value.nombre.split(' ').filter(Boolean).slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '').join('')
  })

  async function load(force = false) {
    loading.value = true
    error.value = null
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<ProfileRow>(
        'profile',
        () => request<ProfileRow>('/perfil'),
        { force }
      )
      profile.value = Array.isArray(data) ? data[0] ?? null : data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar perfil'
    } finally {
      loading.value = false
    }
  }

  async function update(payload: UpdateProfilePayload) {
    const { request, showSuccess } = useApi()
    const result = await runMutation<ProfileRow>({
      request: () => request<ProfileRow>('/perfil', { method: 'PUT', body: payload }),
      offline: {
        type: 'update',
        resource: 'profile',
        method: 'PUT',
        url: '/perfil',
        body: { ...payload, id: profile.value?.id ?? 0 }
      },
      successMessage: 'Perfil actualizado correctamente',
      onSuccess: (data) => {
        profile.value = { ...(profile.value ?? {} as ProfileRow), ...data }
      }
    })
    void showSuccess
    void toast
    return result
  }

  function reset() {
    profile.value = null
    error.value = null
  }

  return { profile, loading, error, isLoaded, initials, load, update, reset }
})
