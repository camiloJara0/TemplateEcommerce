import type { AddFavoritePayload } from '~/stores/favorite'

export function useFavoritosService() {
  const favoriteStore = useFavoriteStore()

  return {
    listar: (force?: boolean) => favoriteStore.load(force ?? false),
    agregar: (payload: AddFavoritePayload) => favoriteStore.add(payload),
    eliminar: (productId: number) => favoriteStore.remove(productId),
    moverAlCarrito: (itemId: number) => favoriteStore.moveToCart(itemId),
    toggle: (productId: number) => favoriteStore.toggle(productId),
    has: (productId: number) => favoriteStore.has(productId)
  }
}
