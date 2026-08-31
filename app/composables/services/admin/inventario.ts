import type { CreateInventoryMovementPayload, CreateStockAlertPayload } from '~/types/admin'

export function useAdminInventarioService() {
  const inventoryStore = useInventoryStore()

  return {
    listarMovimientos: () => inventoryStore.loadMovements(),
    crearMovimiento: (payload: CreateInventoryMovementPayload) =>
      inventoryStore.createMovement(payload),
    listarAlertas: () => inventoryStore.loadAlerts(),
    crearAlerta: (payload: CreateStockAlertPayload) =>
      inventoryStore.createAlert(payload)
  }
}
