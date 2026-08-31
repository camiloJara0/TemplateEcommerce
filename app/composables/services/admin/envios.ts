import type { CreateShipmentPayload, ShipmentQuoteQuery, ShipmentStatusPayload } from '~/types/admin'

export function useAdminEnviosService() {
  const shipmentStore = useShipmentStore()

  return {
    listar: () => shipmentStore.loadAdminList(),
    crear: (payload: CreateShipmentPayload) => shipmentStore.adminCreate(payload),
    cotizar: (query: ShipmentQuoteQuery) => shipmentStore.quote(query),
    obtener: (id: number) => shipmentStore.loadAdminOne(id),
    cambiarEstado: (id: number, payload: ShipmentStatusPayload) =>
      shipmentStore.adminChangeStatus(id, payload)
  }
}
