import type { Paginated } from '~/types/api'
import type { AdminReview, AdminReviewFilters } from '~/types/admin'
import type { AdminContact, Contact, CreateContactPayload, ResponseContactPayload, SubscribeNewsPayload } from '~/types/commerce'

export interface ReviewFilters {
  estado?: string
  page?: number
  per_page?: number
}

export const useCommunityStore = defineStore('community', () => {
  const adminList = ref<AdminContact[]>([])
  const adminPagination = ref<Paginated<AdminContact>['pagination'] | null>(null)
  const adminFilters = ref<AdminReviewFilters>({})
  const subscriptors = ref({})
  const loading = ref(false)

  // Contacto
  async function create(payload: CreateContactPayload) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>(`/contact`, {
        method: 'POST',
        body: payload
      }),
      offline: {
        type: 'create',
        resource: 'community',
        method: 'POST',
        url: `/contact`,
        body: { ...payload }
      },
      successMessage: 'Comentario enviado. Un asesor contactará contigo por correo.',
      onSuccess: (data) => {

      }
    })
  }

  async function loadAdminList(filtersArg?: ReviewFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const query: Record<string, unknown> = { ...filtersArg }
      if (query.estado) {
        query.status = query.estado
        delete query.estado
      }
      const res = await request<Paginated<AdminContact>>('/admin/contact', { query })
      adminList.value = res.data.data.data
      adminPagination.value = res.data.pagination
      adminFilters.value = (filtersArg as AdminReviewFilters) ?? {}
    } finally {
      loading.value = false
    }
  }

  async function adminUpdate(id: number, payload: ResponseContactPayload) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>(`/admin/contact/${id}`, { method: 'PUT', body: payload }),
      successMessage: 'Mensaje actualizado',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(r => r.id === id)
        if (idx >= 0) adminList.value[idx] = data
      }
    })
  }

  async function adminResponse(payload: ResponseContactPayload) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>(`/admin/reply_contact`, { method: 'POST', body: payload}),
      successMessage: 'Mensaje actualizado',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(r => r.id === id)
        if (idx >= 0) adminList.value[idx] = data
      }
    })
  }

  // Newsletter
  async function loadSubscriptors(filtersArg?: ReviewFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const query: Record<string, unknown> = { ...filtersArg }
      if (query.estado) {
        query.status = query.estado
        delete query.estado
      }
      const res = await request<Paginated<AdminContact>>('/admin/newsletter', { query })
      subscriptors.value = res.data.data.data
      // adminPagination.value = res.data.pagination
      // adminFilters.value = (filtersArg as AdminReviewFilters) ?? {}
    } finally {
      loading.value = false
    }
  }

  async function subscribe(payload: SubscribeNewsPayload) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>(`/newsletter`, {
        method: 'POST',
        body: payload
      }),
      offline: {
        type: 'create',
        resource: 'community',
        method: 'POST',
        url: `/newsletter`,
        body: { ...payload }
      },
      successMessage: 'Confirma tu subscripción desde correo',
      onSuccess: (data) => {

      }
    })
  }

  async function confirmSubscribe(token: string) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>(`/confirmarNewsletter`, {
        method: 'POST',
        body: {token}
      }),
      offline: {
        type: 'create',
        resource: 'community',
        method: 'POST',
        url: `/confirmarNewsletter`,
        body: { token }
      },
      successMessage: 'Registrate para disfrutar de beneficios especiales',
      onSuccess: (data) => {

      }
    })
  }

  return {
    adminList, adminPagination, adminFilters, loading, subscriptors,
    create, loadAdminList, adminUpdate, adminResponse, subscribe, confirmSubscribe, loadSubscriptors
  }
})
