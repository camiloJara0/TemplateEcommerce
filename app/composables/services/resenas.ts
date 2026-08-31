import type { CreateReviewPayload } from '~/types/catalog'

export function useResenasService() {
  const reviewStore = useReviewStore()

  return {
    listar: (productId: number, force?: boolean) =>
      reviewStore.loadForProduct(productId, force ?? false),
    crear: (productId: number, payload: CreateReviewPayload) =>
      reviewStore.create(productId, payload)
  }
}
