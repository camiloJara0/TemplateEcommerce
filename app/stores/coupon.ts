import type { Paginated } from '~/types/api'
import type { Coupon } from '~/types/commerce'
import type { CouponPayload } from '~/types/admin'

export const useCouponStore = defineStore('coupon', () => {
  const offlineStore = useOfflineStore()
  const adminList = ref<Coupon[]>([])
  const adminPagination = ref<Paginated<Coupon>['pagination'] | null>(null)
  const loading = ref(false)

  async function loadAdminList() {
    loading.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<Coupon[]>(
        'coupons',
        () => request<Coupon[]>('/admin/cupones')
      )
      adminList.value = data
    } finally {
      loading.value = false
    }
  }

  async function adminCreate(payload: CouponPayload) {
    const { request } = useApi()
    return runMutation<Coupon>({
      request: () => request<Coupon>('/admin/cupones', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'coupon',
        method: 'POST',
        url: '/admin/cupones',
        body: { ...payload }
      },
      successMessage: 'Cupón creado',
      onSuccess: (data) => {
        adminList.value = [data, ...adminList.value]
      }
    })
  }

  async function adminUpdate(id: number, payload: Partial<CouponPayload>) {
    const { request } = useApi()
    return runMutation<Coupon>({
      request: () => request<Coupon>(`/admin/cupones/${id}`, { method: 'PUT', body: payload }),
      offline: {
        type: 'update',
        resource: 'coupon',
        method: 'PUT',
        url: `/admin/cupones/${id}`,
        body: { id, ...payload }
      },
      successMessage: 'Cupón actualizado',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(c => c.id === id)
        if (idx >= 0) adminList.value[idx] = data
      }
    })
  }

  async function adminDelete(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/cupones/${id}`, { method: 'DELETE' }),
      offline: {
        type: 'delete',
        resource: 'coupon',
        method: 'DELETE',
        url: `/admin/cupones/${id}`,
        body: { id }
      },
      successMessage: 'Cupón eliminado',
      onSuccess: () => {
        adminList.value = adminList.value.filter(c => c.id !== id)
      }
    })
  }

  return { adminList, adminPagination, loading, loadAdminList, adminCreate, adminUpdate, adminDelete }
})
