import type { AddCartItemPayload, UpdateCartItemPayload } from '~/types/commerce'

export function useCarritoService() {
  const cartStore = useCartStore()

  return {
    obtener: (sessionId?: string, force?: boolean) => {
      if (sessionId) cartStore.sessionId = sessionId
      return cartStore.load(force ?? false)
    },
    agregarItem: (payload: AddCartItemPayload) => cartStore.addItem(payload),
    actualizarItem: (itemId: number, payload: UpdateCartItemPayload) =>
      cartStore.updateItem(itemId, payload),
    eliminarItem: (itemId: number) => cartStore.removeItem(itemId),
    vaciar: (sessionId?: string) => {
      if (sessionId) cartStore.sessionId = sessionId
      return cartStore.clear()
    }
  }
}
