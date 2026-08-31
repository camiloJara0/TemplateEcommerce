import type { Paginated } from '~/types/api'
import type {
  CreateInventoryMovementPayload,
  CreateStockAlertPayload,
  InventoryMovement,
  StockAlert
} from '~/types/admin'

export const useInventoryStore = defineStore('inventory', () => {
  const offlineStore = useOfflineStore()
  const movements = ref<InventoryMovement[]>([])
  const movementsPagination = ref<Paginated<InventoryMovement>['pagination'] | null>(null)
  const alerts = ref<StockAlert[]>([])
  const loadingMovements = ref(false)
  const loadingAlerts = ref(false)

  const stockAlertCount = computed(() => alerts.value.length)

  async function loadMovements() {
    loadingMovements.value = true
    try {
      const { request } = useApi()
      const data = await request<Paginated<InventoryMovement>>('/admin/inventario/movimientos')
      movements.value = data.data.items
      movementsPagination.value = data.data.pagination
    } finally {
      loadingMovements.value = false
    }
  }

  async function createMovement(payload: CreateInventoryMovementPayload) {
    const { request } = useApi()
    return runMutation<InventoryMovement>({
      request: () => request<InventoryMovement>('/admin/inventario/movimientos', {
        method: 'POST',
        body: payload
      }),
      offline: {
        type: 'create',
        resource: 'inventory_movement',
        method: 'POST',
        url: '/admin/inventario/movimientos',
        body: { ...payload }
      },
      successMessage: 'Movimiento registrado',
      onSuccess: (data) => {
        movements.value = [data, ...movements.value]
      }
    })
  }

  async function loadAlerts() {
    loadingAlerts.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<StockAlert[]>(
        'stock_alerts',
        () => request<StockAlert[]>('/admin/inventario/alertas')
      )
      alerts.value = data
    } finally {
      loadingAlerts.value = false
    }
  }

  async function createAlert(payload: CreateStockAlertPayload) {
    const { request } = useApi()
    return runMutation<StockAlert>({
      request: () => request<StockAlert>('/admin/inventario/alertas', {
        method: 'POST',
        body: payload
      }),
      offline: {
        type: 'create',
        resource: 'stock_alert',
        method: 'POST',
        url: '/admin/inventario/alertas',
        body: { ...payload }
      },
      successMessage: 'Alerta creada',
      onSuccess: (data) => {
        alerts.value = [data, ...alerts.value]
      }
    })
  }

  return {
    movements, movementsPagination, alerts,
    loadingMovements, loadingAlerts, stockAlertCount,
    loadMovements, createMovement, loadAlerts, createAlert
  }
})
