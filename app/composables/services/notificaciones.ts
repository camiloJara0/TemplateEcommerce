export function useNotificacionesService() {
  const notificationStore = useNotificationStore()
  const pushSubscription = usePushSubscription()

  return {
    listar: (force?: boolean) => notificationStore.load(force ?? false),
    subscribirPush: notificationStore.subscribePush,
    desuscribirPush: notificationStore.unsubscribePush,
    marcarLeida: notificationStore.markRead,
    pushPermission: computed(() => pushSubscription.permission),
    isPushSubscribed: computed(() => pushSubscription.isSubscribed),
    isPushSupported: computed(() => pushSubscription.isSupported),
    pushLoading: computed(() => pushSubscription.loading),
    solicitarPush: pushSubscription.subscribe,
    desuscribirPushNotification: pushSubscription.unsubscribe,
  }
}
