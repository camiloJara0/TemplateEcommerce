export function useEnviosService() {
  const shipmentStore = useShipmentStore()

  return {
    tracking: (trackingNumber: string) => shipmentStore.track(trackingNumber)
  }
}
