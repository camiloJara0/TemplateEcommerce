import type { AdminOrderFilters, ChangeOrderStatusPayload, RefundPayload } from '~/types/admin'

export function useAdminPedidosService() {
  const adminOrderStore = useAdminOrderStore()

  return {
    listar: (filters?: AdminOrderFilters) => adminOrderStore.loadList(filters),
    cambiarEstado: (id: number, payload: ChangeOrderStatusPayload) =>
      adminOrderStore.changeStatus(id, payload),
    reembolsar: (paymentId: number, payload: RefundPayload) =>
      adminOrderStore.refund(paymentId, payload)
  }
}
