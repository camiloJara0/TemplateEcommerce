import type { AdminReviewFilters } from '~/types/admin'

export function useAdminResenasService() {
  const reviewStore = useReviewStore()

  return {
    listar: (filters?: AdminReviewFilters) => reviewStore.loadAdminList(filters),
    aprobar: (id: number) => reviewStore.adminApprove(id),
    rechazar: (id: number) => reviewStore.adminReject(id),
    eliminar: (id: number) => reviewStore.adminDelete(id)
  }
}
