import type { Pagination } from '~/types/api'
import type { AdminReviewFilters } from '~/types/admin'
import type {
  AdminContact,
  CampaignPreview,
  CampanaFiltros,
  Contact,
  CreateCampaignPayload,
  CreateContactPayload,
  EstadoSuscriptor,
  NewsletterCampaign,
  NewsletterSubscriber,
  ResponseContactPayload,
  SubscribeNewsPayload,
  WebhookEvent,
  WebhookEventsResumen
} from '~/types/commerce'

export interface ListFilters {
  estado?: string
  busqueda?: string
  fecha?: string
  provider?: string
  page?: number
  per_page?: number
}

interface Paged<T> {
  items: T[]
  pagination: Pagination
}

export const useCommunityStore = defineStore('community', () => {
  // ── Contactos ────────────────────────────────────────────────────────────
  const adminList = ref<AdminContact[]>([])
  const adminPagination = ref<Pagination | null>(null)
  const adminFilters = ref<AdminReviewFilters>({})

  // ── Suscriptores ─────────────────────────────────────────────────────────
  const subscriptors = ref<NewsletterSubscriber[]>([])
  const subscriptorsPagination = ref<Pagination | null>(null)
  const subscriptorsResumen = ref({ activos: 0, cancelados: 0, pendientes: 0 })

  // ── Campañas ─────────────────────────────────────────────────────────────
  const campanas = ref<NewsletterCampaign[]>([])
  const campanasPagination = ref<Pagination | null>(null)
  const campanaFiltros = ref<CampanaFiltros | null>(null)
  const campanaActual = ref<NewsletterCampaign | null>(null)

  // ── Webhooks ─────────────────────────────────────────────────────────────
  const webhookEvents = ref<WebhookEvent[]>([])
  const webhookPagination = ref<Pagination | null>(null)
  const webhookResumen = ref<WebhookEventsResumen | null>(null)

  const loading = ref(false)

  // ───────────────────────── Contacto ──────────────────────────────────────
  async function create(payload: CreateContactPayload) {
    const { request } = useApi()
    return runMutation<Contact>({
      request: () => request<Contact>('/contact', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'community',
        method: 'POST',
        url: '/contact',
        body: { ...payload }
      },
      successMessage: 'Mensaje enviado. Un asesor te contactará por correo.'
    })
  }

  async function loadAdminList(filtersArg?: ListFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paged<AdminContact>>('/admin/contact', { query: { ...filtersArg } })
      adminList.value = res.data?.items ?? []
      adminPagination.value = res.data?.pagination ?? null
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
        if (idx >= 0) adminList.value[idx] = { ...adminList.value[idx], ...data }
      }
    })
  }

  async function adminResponse(payload: ResponseContactPayload) {
    const { request } = useApi()
    const contactoId = payload.contact_message_id ?? payload.id
    return runMutation<Contact>({
      request: () => request<Contact>('/admin/reply_contact', { method: 'POST', body: payload }),
      successMessage: 'Respuesta enviada',
      onSuccess: (data) => {
        const idx = adminList.value.findIndex(r => r.id === contactoId)
        if (idx >= 0) adminList.value[idx] = { ...adminList.value[idx], ...data }
      }
    })
  }

  // ───────────────────────── Suscriptores ──────────────────────────────────
  async function loadSubscriptors(filtersArg?: ListFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paged<NewsletterSubscriber> & { resumen?: typeof subscriptorsResumen.value }>(
        '/admin/newsletter',
        { query: { ...filtersArg } }
      )
      subscriptors.value = res.data?.items ?? []
      subscriptorsPagination.value = res.data?.pagination ?? null
      if (res.data?.resumen) subscriptorsResumen.value = res.data.resumen
    } finally {
      loading.value = false
    }
  }

  async function updateSubscriberEstado(id: number, estado: EstadoSuscriptor) {
    const { request } = useApi()
    return runMutation<NewsletterSubscriber>({
      request: () => request<NewsletterSubscriber>(`/admin/newsletter/${id}`, { method: 'PUT', body: { estado } }),
      successMessage: estado === 'Activo' ? 'Suscriptor reactivado' : 'Suscriptor actualizado',
      onSuccess: (data) => {
        const idx = subscriptors.value.findIndex(s => s.id === id)
        if (idx >= 0) subscriptors.value[idx] = data
      }
    })
  }

  async function deleteSubscriber(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/newsletter/${id}`, { method: 'DELETE' }),
      successMessage: 'Suscriptor eliminado',
      onSuccess: () => {
        subscriptors.value = subscriptors.value.filter(s => s.id !== id)
      }
    })
  }

  async function subscribe(payload: SubscribeNewsPayload) {
    const { request } = useApi()
    return runMutation<{ correo: string, estado: string }>({
      request: () => request('/newsletter', { method: 'POST', body: payload }),
      offline: {
        type: 'create',
        resource: 'community',
        method: 'POST',
        url: '/newsletter',
        body: { ...payload }
      },
      successMessage: 'Revisa tu correo para confirmar la suscripción'
    })
  }

  async function confirmSubscribe(token: string) {
    const { request } = useApi()
    return runMutation<{ correo: string, estado: string }>({
      request: () => request('/confirmarNewsletter', { method: 'POST', body: { token } }),
      successMessage: 'Suscripción confirmada. ¡Bienvenido!'
    })
  }

  async function fetchBaja(token: string) {
    const { request } = useApi()
    const res = await request<{ correo: string, estado: EstadoSuscriptor, cancelado: boolean }>(
      `/newsletter/baja/${encodeURIComponent(token)}`
    )
    return res.data
  }

  async function cancelarSuscripcion(token: string) {
    const { request } = useApi()
    return runMutation<{ correo: string, estado: EstadoSuscriptor }>({
      request: () => request('/newsletter/baja', { method: 'POST', body: { token } }),
      successMessage: 'Suscripción cancelada. No volverás a recibir nuestros correos.'
    })
  }

  // ───────────────────────── Campañas ──────────────────────────────────────
  async function loadCampanas(filtersArg?: ListFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paged<NewsletterCampaign>>('/admin/newsletter_campaign', { query: { ...filtersArg } })
      campanas.value = res.data?.items ?? []
      campanasPagination.value = res.data?.pagination ?? null
    } finally {
      loading.value = false
    }
  }

  async function loadCampanaFiltros() {
    const { request } = useApi()
    const res = await request<CampanaFiltros>('/admin/newsletter_campaign/filtros')
    campanaFiltros.value = res.data
    return res.data
  }

  async function loadCampana(id: number) {
    const { request } = useApi()
    const res = await request<{ campaign: NewsletterCampaign }>(`/admin/newsletter_campaign/${id}`)
    campanaActual.value = res.data?.campaign ?? null
    return campanaActual.value
  }

  function toFormData(payload: CreateCampaignPayload, campaignId?: number): FormData {
    const formData = new FormData()
    formData.append('titulo', payload.titulo)
    formData.append('asunto', payload.asunto)
    formData.append('contenido', payload.contenido)
    formData.append('estado', payload.estado ?? 'Borrador')

    if (payload.fecha_programada) formData.append('fecha_programada', payload.fecha_programada)
    formData.append('cupon_id', payload.cupon_id ? String(payload.cupon_id) : '')

    const items = payload.items ?? []
    items.forEach(id => formData.append('items[]', String(id)))
    if (!items.length) formData.append('items', '')

    const existentes = payload.existing_image_urls ?? []
    existentes.forEach(url => formData.append('existing_image_urls[]', url))
    if (!existentes.length) formData.append('existing_image_urls', '')

    if (campaignId) formData.append('_method', 'PUT')

    return formData
  }

  async function saveCampaign(payload: CreateCampaignPayload, campaignId?: number) {
    const { request } = useApi()
    const formData = toFormData(payload, campaignId)
    const url = campaignId ? `/admin/newsletter_campaign/${campaignId}` : '/admin/newsletter_campaign'

    return runMutation<NewsletterCampaign>({
      request: () => request<NewsletterCampaign>(url, { method: 'POST', body: formData }),
      successMessage: campaignId ? 'Campaña actualizada' : 'Campaña creada',
      onSuccess: (data) => {
        if (campaignId) {
          const idx = campanas.value.findIndex(c => c.id === campaignId)
          if (idx >= 0) campanas.value[idx] = data
        } else {
          campanas.value.unshift(data)
        }
      }
    })
  }

  /**
   * Previsualiza el correo en el servidor con exactamente el mismo template
   * que se usa para el envío real.
   */
  async function previewCampaign(payload: CreateCampaignPayload): Promise<CampaignPreview> {
    const { request } = useApi()
    const formData = toFormData(payload)
    formData.delete('_method')
    const res = await request<CampaignPreview>('/admin/newsletter_campaign/vista-previa', {
      method: 'POST',
      body: formData
    })
    return res.data
  }

  async function sendCampaign(id: number) {
    const { request } = useApi()
    return runMutation<{ campaign: NewsletterCampaign, destinatarios: number }>({
      request: () => request(`/admin/newsletter_campaign/${id}/enviar`, { method: 'POST' }),
      successMessage: 'Campaña en cola de envío',
      onSuccess: (data) => {
        const idx = campanas.value.findIndex(c => c.id === id)
        if (idx >= 0) campanas.value[idx] = data.campaign
      }
    })
  }

  async function sendTestCampaign(id: number, correo: string) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/newsletter_campaign/${id}/prueba`, {
        method: 'POST',
        body: { correo }
      }),
      successMessage: `Correo de prueba enviado a ${correo}`
    })
  }

  async function deleteCampaign(id: number) {
    const { request } = useApi()
    return runMutation<null>({
      request: () => request<null>(`/admin/newsletter_campaign/${id}`, { method: 'DELETE' }),
      successMessage: 'Campaña eliminada',
      onSuccess: () => {
        campanas.value = campanas.value.filter(c => c.id !== id)
      }
    })
  }

  // ───────────────────────── Webhooks ──────────────────────────────────────
  async function loadWebhookEvents(filtersArg?: ListFilters) {
    loading.value = true
    try {
      const { request } = useApi()
      const res = await request<Paged<WebhookEvent> & { resumen: WebhookEventsResumen }>(
        '/admin/webhooks/events',
        { query: { ...filtersArg } }
      )
      webhookEvents.value = res.data?.items ?? []
      webhookPagination.value = res.data?.pagination ?? null
      webhookResumen.value = res.data?.resumen ?? null
    } finally {
      loading.value = false
    }
  }

  async function retryWebhookEvent(id: number) {
    const { request } = useApi()
    return runMutation<WebhookEvent>({
      request: () => request<WebhookEvent>(`/admin/webhooks/events/${id}/reintentar`, { method: 'POST' }),
      successMessage: 'Evento reprocesado',
      onSuccess: (data) => {
        const idx = webhookEvents.value.findIndex(e => e.id === id)
        if (idx >= 0) webhookEvents.value[idx] = data
      }
    })
  }

  return {
    adminList,
    adminPagination,
    adminFilters,
    subscriptors,
    subscriptorsPagination,
    subscriptorsResumen,
    campanas,
    campanasPagination,
    campanaFiltros,
    campanaActual,
    webhookEvents,
    webhookPagination,
    webhookResumen,
    loading,
    create,
    loadAdminList,
    adminUpdate,
    adminResponse,
    loadSubscriptors,
    updateSubscriberEstado,
    deleteSubscriber,
    subscribe,
    confirmSubscribe,
    fetchBaja,
    cancelarSuscripcion,
    loadCampanas,
    loadCampanaFiltros,
    loadCampana,
    saveCampaign,
    previewCampaign,
    sendCampaign,
    sendTestCampaign,
    deleteCampaign,
    loadWebhookEvents,
    retryWebhookEvent
  }
})
