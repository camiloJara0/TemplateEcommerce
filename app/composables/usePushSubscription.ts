function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

export function usePushSubscription() {
  const notificationStore = useNotificationStore()
  const permission = ref<NotificationPermission>('default')
  const isSubscribed = ref(false)
  const vapidPublicKey = ref<string | null>('BMsJRT_-A2jWFaBPobImbiIPy_r7lgmIp0x3LCaiVpkkjgsxYJWgGIh0oy3Y-DITwsF00RRws_PSWcUl2w8GG1c')
  const loading = ref(false)

  const isSupported = computed(() =>
    typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'Notification' in window
    && 'PushManager' in window,
  )

  async function loadVapidKey() {
    if (vapidPublicKey.value) return vapidPublicKey.value
    const { request } = useApi()
    const res = await request<{ key: string }>('/configuracion/vapid-public-key')
    vapidPublicKey.value = res.data.key
    return res.data.key
  }

  async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready
    return registration
  }

  async function checkSubscription() {
    if (!isSupported.value) return
    permission.value = Notification.permission
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      isSubscribed.value = !!subscription
    } catch {
      isSubscribed.value = false
    }
  }

  async function subscribe(): Promise<boolean> {
    if (!isSupported.value) return false
    loading.value = true
    try {
      const notifPerm = await Notification.requestPermission()
      permission.value = notifPerm

      if (notifPerm !== 'granted') return false

      const key = await loadVapidKey()
      if (!key) return false

      const registration = await registerServiceWorker()
      const existingSub = await registration.pushManager.getSubscription()

      if (existingSub) {
        isSubscribed.value = true
        return true
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })

      const subJson = subscription.toJSON()
      await notificationStore.subscribePush({
        endpoint: subscription.endpoint,
        auth: subJson.keys?.auth || '',
        p256dh: subJson.keys?.p256dh || '',
      })

      isSubscribed.value = true
      return true
    } catch (e) {
      console.error('Push subscribe error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function unsubscribe(): Promise<boolean> {
    if (!isSupported.value) return false
    loading.value = true
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        isSubscribed.value = false
        return true
      }

      await notificationStore.unsubscribePush(subscription.endpoint)
      await subscription.unsubscribe()
      isSubscribed.value = false
      return true
    } catch (e) {
      console.error('Push unsubscribe error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    checkSubscription()
  })

  return {
    permission,
    isSubscribed,
    isSupported,
    loading,
    subscribe,
    unsubscribe,
    checkSubscription,
  }
}
