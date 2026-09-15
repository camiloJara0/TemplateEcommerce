import type { AppNotification, PushSubscriptionPayload, AppNotificationResponse } from '~/types/notifications'

export const useNotificationStore = defineStore('notification', () => {
  const offlineStore = useOfflineStore()
  const items = ref<AppNotification[]>([])
  const loading = ref(false)
  const unreadCount = computed(() => items.value?.filter(n => !n.read_at).length)

  async function load(force = false) {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<AppNotification[]>(
        'notifications',
        () => request<AppNotification[]>('/notificaciones'),
        { force }
      )
      items.value = data.items
    } finally {
      loading.value = false
    }
  }

  async function subscribePush(payload: PushSubscriptionPayload) {
    const { request } = useApi()
    return runMutation<{ message: string }>({
      request: () => request<{ message: string }>('/notificaciones/push/subscribir', {
        method: 'POST',
        body: payload
      }),
      successMessage: 'Suscripción a notificaciones push activada'
    })
  }

  async function unsubscribePush(endpoint: string) {
    const { request } = useApi()
    return runMutation<{ message: string }>({
      request: () => request<{ message: string }>('/notificaciones/push/desuscribir', {
        method: 'POST',
        body: { endpoint }
      }),
      successMessage: 'Notificaciones push desactivadas'
    })
  }

  function markRead(id: number) {
    const idx = items.value.findIndex(n => n.id === id)
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx]!, read_at: new Date().toISOString() }
    }
  }

  return { items, loading, unreadCount, load, subscribePush, unsubscribePush, markRead }
})
