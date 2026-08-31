import type { CouponPayload } from '~/types/admin'

export function useAdminCuponesService() {
  const couponStore = useCouponStore()

  return {
    listar: () => couponStore.loadAdminList(),
    crear: (payload: CouponPayload) => couponStore.adminCreate(payload),
    actualizar: (id: number, payload: Partial<CouponPayload>) =>
      couponStore.adminUpdate(id, payload),
    eliminar: (id: number) => couponStore.adminDelete(id)
  }
}
