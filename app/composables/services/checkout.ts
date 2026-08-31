import type {
  ApplyCouponPayload,
  CheckoutPreviewPayload,
  CreateOrderPayload,
  PayOrderPayload
} from '~/types/commerce'

export function useCheckoutService() {
  const orderStore = useOrderStore()

  return {
    preview: (payload: CheckoutPreviewPayload) => orderStore.getPreview(payload),
    crearPedido: (payload: CreateOrderPayload) => orderStore.create(payload),
    pagarPedido: (id: number, payload: PayOrderPayload) => orderStore.pay(id, payload),
    listarPedidos: (perPage?: number, page?: number) =>
      orderStore.loadList(perPage ?? 15, page ?? 1),
    obtenerPedido: (id: number) => orderStore.loadOne(id),
    aplicarCupon: (payload: ApplyCouponPayload) => orderStore.applyCoupon(payload)
  }
}
