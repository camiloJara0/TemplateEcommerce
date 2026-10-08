<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AuditLog } from '~/types/admin'
import type {
  AdminContact,
  EstadoCampana,
  EstadoSuscriptor,
  NewsletterCampaign,
  NewsletterSubscriber
} from '~/types/commerce'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const communityStore = useCommunityStore()
const profileStore = useProfileStore()

const { adminList: messages, adminPagination, subscriptors, subscriptorsResumen, campanas, campanasPagination, loading } = storeToRefs(communityStore)
const { auditLogs, auditFilters } = storeToRefs(profileStore)

const { initials, date, relative } = useFormat()

useSeoMeta({ title: 'Comunidad — Admin' })

// ───────────────────────────── Mensajes ────────────────────────────────────
const search = ref('')
const estadoContacto = ref('all')
const contactoSelected = ref<AdminContact | null>(null)
const showContactModal = ref(false)

const estadosContacto = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Leído', value: 'Leido' },
  { label: 'Respondido', value: 'Respondido' },
  { label: 'Cerrado', value: 'Cerrado' }
]

const badgeContacto: Record<string, { label: string, color: 'warning' | 'info' | 'success' | 'neutral' }> = {
  Pendiente: { label: 'Pendiente', color: 'warning' },
  Leido: { label: 'Leído', color: 'info' },
  Respondido: { label: 'Respondido', color: 'success' },
  Cerrado: { label: 'Cerrado', color: 'neutral' }
}

const filteredMessages = computed(() => {
  const q = search.value.trim().toLowerCase()
  return messages.value.filter((m) => {
    const matchesSearch = !q
      || (m.nombre ?? '').toLowerCase().includes(q)
      || (m.correo ?? '').toLowerCase().includes(q)
      || (m.asunto ?? '').toLowerCase().includes(q)
    const matchesEstado = !estadoContacto.value
      || estadoContacto.value === 'all'
      || m.estado === estadoContacto.value
    return matchesSearch && matchesEstado
  })
})

function loadMensajes(page = 1) {
  void communityStore.loadAdminList({
    page,
    estado: estadoContacto.value && estadoContacto.value !== 'all' ? estadoContacto.value : undefined,
    busqueda: search.value.trim() || undefined
  })
}

function openContacto(message: AdminContact) {
  contactoSelected.value = message
  showContactModal.value = true
}

function onContactoRespondido() {
  showContactModal.value = false
  contactoSelected.value = null
  loadMensajes(adminPagination.value?.current_page ?? 1)
}

// ───────────────────────────── Suscriptores ────────────────────────────────
const subEstado = ref<EstadoSuscriptor | 'all'>('all')
const subSearch = ref('')

const estadosSuscriptor = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
  { label: 'Cancelados', value: 'Cancelado' }
]

const badgeSuscriptor: Record<EstadoSuscriptor, { label: string, color: 'success' | 'neutral' | 'error' }> = {
  Activo: { label: 'Activo', color: 'success' },
  Inactivo: { label: 'Inactivo', color: 'neutral' },
  Cancelado: { label: 'Cancelado', color: 'error' }
}

const filteredSubscriptors = computed(() => {
  const q = subSearch.value.trim().toLowerCase()
  return subscriptors.value.filter(s => !q || s.correo.toLowerCase().includes(q) || (s.nombre ?? '').toLowerCase().includes(q))
})

function loadSuscriptores(page = 1) {
  void communityStore.loadSubscriptors({
    page,
    estado: subEstado.value === 'all' ? undefined : subEstado.value,
    busqueda: subSearch.value.trim() || undefined
  })
}

async function cambiarEstadoSuscriptor(sub: NewsletterSubscriber, estado: EstadoSuscriptor) {
  await communityStore.updateSubscriberEstado(sub.id, estado)
}

async function eliminarSuscriptor(sub: NewsletterSubscriber) {
  if (!confirm(`¿Eliminar definitivamente a ${sub.correo}?`)) return
  await communityStore.deleteSubscriber(sub.id)
}

// ───────────────────────────── Campañas ────────────────────────────────────
const showCampaignModal = ref(false)
const campaignSelected = ref<NewsletterCampaign | null>(null)
const campaignEstado = ref<EstadoCampana | 'all'>('all')
const campaignsLoaded = ref(false)

const estadosCampana = [
  { label: 'Todas', value: 'all' },
  { label: 'Borradores', value: 'Borrador' },
  { label: 'Programadas', value: 'Programada' },
  { label: 'Enviadas', value: 'Enviada' }
]

const badgeCampana: Record<EstadoCampana, { label: string, color: 'neutral' | 'info' | 'success' }> = {
  Borrador: { label: 'Borrador', color: 'neutral' },
  Programada: { label: 'Programada', color: 'info' },
  Enviada: { label: 'Enviada', color: 'success' }
}

function loadCampanas(page = 1) {
  campaignsLoaded.value = true
  void communityStore.loadCampanas({
    page,
    estado: campaignEstado.value === 'all' ? undefined : campaignEstado.value
  })
}

function openNuevaCampana() {
  campaignSelected.value = null
  showCampaignModal.value = true
}

function editarCampana(campaign: NewsletterCampaign) {
  campaignSelected.value = campaign
  showCampaignModal.value = true
}

function onCampaignSaved() {
  showCampaignModal.value = false
  campaignSelected.value = null
}

const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  action: null as (() => Promise<void>) | null
})

function pedirConfirmacion(title: string, message: string, action: () => Promise<void>) {
  confirmState.title = title
  confirmState.message = message
  confirmState.action = action
  confirmState.open = true
}

async function confirmar() {
  const action = confirmState.action
  confirmState.open = false
  if (action) await action()
}

function enviarCampana(campaign: NewsletterCampaign) {
  pedirConfirmacion(
    'Enviar campaña',
    `Se enviará "${campaign.titulo}" a todos los suscriptores activos. Esta acción no se puede deshacer.`,
    async () => {
      await communityStore.sendCampaign(campaign.id)
      await communityStore.loadCampanas({ page: campanasPagination.value?.current_page ?? 1, estado: campaignEstado.value || undefined })
    }
  )
}

function eliminarCampana(campaign: NewsletterCampaign) {
  pedirConfirmacion(
    'Eliminar campaña',
    `¿Deseas eliminar "${campaign.titulo}"?`,
    async () => {
      await communityStore.deleteCampaign(campaign.id)
    }
  )
}

// Correo de prueba
const showTestModal = ref(false)
const testCorreo = ref('')
const testCampaign = ref<NewsletterCampaign | null>(null)

function enviarPrueba(campaign: NewsletterCampaign) {
  testCampaign.value = campaign
  testCorreo.value = ''
  showTestModal.value = true
}

async function confirmarPrueba() {
  if (!testCampaign.value || !testCorreo.value) return
  await communityStore.sendTestCampaign(testCampaign.value.id, testCorreo.value)
  showTestModal.value = false
}

// ───────────────────────────── Auditoría ───────────────────────────────────
const filters = reactive({
  usuario: '',
  accion: '',
  fecha: ''
})

const columnsAudit: Array<{ accessorKey: string, header: string, cell?: (ctx: { row: { original: AuditLog } }) => unknown }> = [
  { accessorKey: 'usuario.nombre', header: 'Usuario' },
  { accessorKey: 'usuario.email', header: 'Correo' },
  { accessorKey: 'accion', header: 'Acción' },
  { accessorKey: 'descripcion', header: 'Descripción' },
  {
    accessorKey: 'created_at',
    header: 'Fecha',
    cell: ({ row }) => h('p', relative(String(row.original.created_at ?? '')))
  }
]

async function applyFilters() {
  await profileStore.loadAuditoria({
    usuario: filters.usuario || undefined,
    accion: filters.accion || undefined,
    fecha: filters.fecha || undefined
  })
  await profileStore.loadFiltros()
}

async function onTabChange(value: string | number) {
  if (value === 'campanas' && !campaignsLoaded.value) loadCampanas()
}

onMounted(async () => {
  await Promise.all([
    communityStore.loadAdminList(),
    communityStore.loadSubscriptors(),
    profileStore.loadAuditoria(),
    profileStore.loadFiltros()
  ])
})
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <UTabs
      :items="[
        { label: 'Mensajes', slot: 'mensajes', icon: 'i-lucide-message' },
        { label: 'Suscriptores', slot: 'suscriptores', icon: 'i-lucide-users' },
        { label: 'Campañas', slot: 'campanas', icon: 'i-lucide-bell' }
      ]"
      variant="link"
      :ui="{ trigger: 'data-[state=active]:!bg-transparent' }"
      @update:model-value="onTabChange"
    >
      <!-- ── Mensajes ──────────────────────────────────────────────── -->
      <template #mensajes>
        <div class="page-header">
          <div>
            <h1 class="page-title">
              Mensajes de contacto
            </h1>
            <p class="page-subtitle">
              Consultas del formulario de contacto del sitio
            </p>
          </div>
        </div>

        <div class="surface p-4 my-4 flex flex-col sm:flex-row gap-3">
          <UInput
            v-model="search"
            placeholder="Buscar por nombre, correo o asunto…"
            icon="i-lucide-search"
            class="flex-1"
            @update:model-value="loadMensajes(1)"
          />
          <USelect
            v-model="estadoContacto"
            :items="estadosContacto"
            placeholder="Estado"
            class="w-full sm:w-48"
            @update:model-value="loadMensajes(1)"
          />
        </div>

        <div class="surface overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nombre
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Correo
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Asunto
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estado
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Recibido
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="message in filteredMessages"
                :key="message.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      :alt="message.nombre ?? message.correo"
                      size="sm"
                    >
                      {{ initials(message.nombre ?? message.correo) }}
                    </UAvatar>
                    <p class="text-sm font-medium">
                      {{ message.nombre || '—' }}
                    </p>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-sm">
                  {{ message.correo }}
                </td>
                <td class="px-5 py-3.5 text-sm max-w-65 truncate">
                  {{ message.asunto }}
                </td>
                <td class="px-5 py-3.5">
                  <UBadge
                    :label="badgeContacto[message.estado ?? 'Pendiente']?.label ?? message.estado"
                    :color="badgeContacto[message.estado ?? 'Pendiente']?.color ?? 'neutral'"
                    variant="subtle"
                  />
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  {{ date(message.created_at) }}
                </td>
                <td class="px-5 py-3.5">
                  <UButton
                    icon="i-lucide-mail"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    aria-label="Responder"
                    @click="openContacto(message)"
                  />
                </td>
              </tr>
              <tr v-if="!filteredMessages.length">
                <td
                  colspan="6"
                  class="px-5 py-10 text-center text-sm text-slate-400"
                >
                  {{ loading ? 'Cargando…' : 'No hay mensajes de contacto' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <UiPaginationBar
          v-if="adminPagination && adminPagination.last_page > 1"
          :current-page="adminPagination.current_page"
          :last-page="adminPagination.last_page"
          :total="adminPagination.total"
          :per-page="adminPagination.per_page"
          @update:current-page="loadMensajes($event)"
        />
      </template>

      <!-- ── Suscriptores ──────────────────────────────────────────── -->
      <template #suscriptores>
        <div class="page-header">
          <div>
            <h1 class="page-title">
              Suscriptores del newsletter
            </h1>
            <p class="page-subtitle">
              Altas, bajas y confirmaciones de la lista de correo
            </p>
          </div>
          <div class="flex gap-2">
            <span class="text-xs px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-950 text-success-700 dark:text-success-300">
              {{ subscriptorsResumen.activos }} activos
            </span>
            <span class="text-xs px-3 py-1.5 rounded-full bg-warning-50 dark:bg-warning-950 text-warning-700 dark:text-warning-300">
              {{ subscriptorsResumen.pendientes }} pendientes
            </span>
            <span class="text-xs px-3 py-1.5 rounded-full bg-error-50 dark:bg-error-950 text-error-700 dark:text-error-300">
              {{ subscriptorsResumen.cancelados }} cancelados
            </span>
          </div>
        </div>

        <div class="surface p-4 my-4 flex flex-col sm:flex-row gap-3">
          <UInput
            v-model="subSearch"
            placeholder="Buscar por correo o nombre…"
            icon="i-lucide-search"
            class="flex-1"
            @update:model-value="loadSuscriptores(1)"
          />
          <USelect
            v-model="subEstado"
            :items="estadosSuscriptor"
            placeholder="Estado"
            class="w-full sm:w-48"
            @update:model-value="loadSuscriptores(1)"
          />
        </div>

        <div class="surface overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Suscriptor
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estado
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Origen
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Confirmación
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="sub in filteredSubscriptors"
                :key="sub.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <p class="text-sm font-medium">
                    {{ sub.nombre || '—' }}
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ sub.correo }}
                  </p>
                </td>
                <td class="px-5 py-3.5">
                  <UBadge
                    :label="badgeSuscriptor[sub.estado]?.label ?? sub.estado"
                    :color="badgeSuscriptor[sub.estado]?.color ?? 'neutral'"
                    variant="subtle"
                  />
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400 capitalize">
                  {{ sub.origen || '—' }}
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  {{ sub.fecha_confirmacion ? date(sub.fecha_confirmacion) : 'Pendiente' }}
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-1">
                    <UButton
                      v-if="sub.estado !== 'Activo'"
                      icon="i-lucide-user-check"
                      color="success"
                      variant="ghost"
                      size="xs"
                      aria-label="Reactivar"
                      @click="cambiarEstadoSuscriptor(sub, 'Activo')"
                    />
                    <UButton
                      v-if="sub.estado === 'Activo'"
                      icon="i-lucide-user-x"
                      color="warning"
                      variant="ghost"
                      size="xs"
                      aria-label="Desactivar"
                      @click="cambiarEstadoSuscriptor(sub, 'Inactivo')"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="xs"
                      aria-label="Eliminar"
                      @click="eliminarSuscriptor(sub)"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredSubscriptors.length">
                <td
                  colspan="5"
                  class="px-5 py-10 text-center text-sm text-slate-400"
                >
                  {{ loading ? 'Cargando…' : 'No hay suscriptores' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ── Campañas ──────────────────────────────────────────────── -->
      <template #campanas>
        <div class="page-header">
          <div>
            <h1 class="page-title">
              Campañas de newsletter
            </h1>
            <p class="page-subtitle">
              Crea, previsualiza y envía correos a tus suscriptores
            </p>
          </div>
          <div class="flex gap-3">
            <USelect
              v-model="campaignEstado"
              :items="estadosCampana"
              placeholder="Estado"
              class="w-44"
              @update:model-value="loadCampanas(1)"
            />
            <UButton
              label="Nueva campaña"
              icon="i-lucide-plus"
              color="primary"
              size="sm"
              class="rounded-xl"
              @click="openNuevaCampana"
            />
          </div>
        </div>

        <div class="surface overflow-hidden">
          <table class="min-w-full">
            <thead class="bg-slate-50/80 dark:bg-slate-900/50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Campaña
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estado
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Envíos
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Fecha
                </th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="campaign in campanas"
                :key="campaign.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <p class="text-sm font-medium">
                    {{ campaign.titulo }}
                  </p>
                  <p class="text-xs text-slate-400 truncate max-w-[280px]">
                    {{ campaign.asunto }}
                  </p>
                </td>
                <td class="px-5 py-3.5">
                  <UBadge
                    :label="badgeCampana[campaign.estado]?.label ?? campaign.estado"
                    :color="badgeCampana[campaign.estado]?.color ?? 'neutral'"
                    variant="subtle"
                  />
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  <span class="text-success-600">{{ campaign.enviados }}</span>
                  /
                  <span>{{ campaign.destinatarios }}</span>
                  <span
                    v-if="campaign.fallidos"
                    class="text-error-500 ml-1"
                  >({{ campaign.fallidos }} fallos)</span>
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-400">
                  {{ campaign.fecha_envio ? date(campaign.fecha_envio) : (campaign.fecha_programada ? date(campaign.fecha_programada) : date(campaign.created_at)) }}
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-1">
                    <UButton
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      aria-label="Editar"
                      @click="editarCampana(campaign)"
                    />
                    <UButton
                      icon="i-lucide-send"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      aria-label="Enviar"
                      :disabled="campaign.estado === 'Enviada'"
                      @click="enviarCampana(campaign)"
                    />
                    <UButton
                      icon="i-lucide-flask-conical"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      aria-label="Enviar prueba"
                      @click="enviarPrueba(campaign)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="xs"
                      aria-label="Eliminar"
                      @click="eliminarCampana(campaign)"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="!campanas.length">
                <td
                  colspan="5"
                  class="px-5 py-10 text-center text-sm text-slate-400"
                >
                  {{ loading ? 'Cargando…' : 'Aún no hay campañas. Crea la primera.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <UiPaginationBar
          v-if="campanasPagination && campanasPagination.last_page > 1"
          :current-page="campanasPagination.current_page"
          :last-page="campanasPagination.last_page"
          :total="campanasPagination.total"
          :per-page="campanasPagination.per_page"
          @update:current-page="loadCampanas($event)"
        />
      </template>

    </UTabs>

    <!-- ── Modal: responder mensaje ─────────────────────────────────── -->
    <UModal
      v-model:open="showCampaignModal"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden max-w-7xl' }"
    >
      <template #header>
        <h3 class="font-semibold">
          {{ campaignSelected ? 'Editar campaña' : 'Nueva campaña de newsletter' }}
        </h3>
      </template>
      <template #body>
        <FormsCampaignForm
          v-if="showCampaignModal"
          :campaign-id="campaignSelected?.id"
          :initial="campaignSelected ?? undefined"
          submit-label="Guardar campaña"
          @success="onCampaignSaved"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="showTestModal"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          Enviar correo de prueba
        </h3>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Recibirás la campaña <strong>{{ testCampaign?.titulo }}</strong> con el mismo diseño que verán tus suscriptores.
          </p>
          <UiBaseInput
            v-model="testCorreo"
            type="email"
            label="Correo de prueba"
            required
            placeholder="tucorreo@empresa.com"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            @click="showTestModal = false"
          />
          <UButton
            label="Enviar prueba"
            color="primary"
            icon="i-lucide-send"
            :disabled="!testCorreo"
            @click="confirmarPrueba"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="confirmState.open"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          {{ confirmState.title }}
        </h3>
      </template>
      <template #body>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          {{ confirmState.message }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            @click="confirmState.open = false"
          />
          <UButton
            label="Confirmar"
            color="primary"
            @click="confirmar"
          />
        </div>
      </template>
    </UModal>

    <!-- Modal de respuesta se renderiza aparte para no depender del tab activo -->
    <UModal
      v-model:open="showContactModal"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <div>
          <h3 class="font-semibold">
            Responder mensaje
          </h3>
          <p class="text-xs text-slate-400">
            {{ contactoSelected?.correo }}
          </p>
        </div>
      </template>
      <template #body>
        <FormsContactForm
          v-if="contactoSelected"
          :key="contactoSelected.id"
          :initial="contactoSelected"
          submit-label="Enviar respuesta"
          @success="onContactoRespondido"
        />
      </template>
    </UModal>
  </div>
</template>
