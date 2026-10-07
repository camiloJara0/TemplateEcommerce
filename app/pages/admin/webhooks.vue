<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { EstadoWebhook, WebhookEvent } from '~/types/commerce'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const communityStore = useCommunityStore()
const { webhookEvents, webhookPagination, webhookResumen, loading } = storeToRefs(communityStore)

const { date, relative } = useFormat()

useSeoMeta({ title: 'Webhooks de pago — Admin' })

const filters = reactive({
  provider: '',
  estado: '',
  fecha: '',
  busqueda: ''
})

const providerOptions = ref<Array<{ label: string, value: string }>>([{ label: 'Todos', value: '' }])

const estadoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Recibido', value: 'recibido' },
  { label: 'Procesado', value: 'procesado' },
  { label: 'Duplicado', value: 'duplicado' },
  { label: 'Ignorado', value: 'ignorado' },
  { label: 'Error', value: 'error' }
]

const badgeEstado: Record<EstadoWebhook, { label: string, color: 'success' | 'info' | 'warning' | 'neutral' | 'error' }> = {
  recibido: { label: 'Recibido', color: 'info' },
  procesado: { label: 'Procesado', color: 'success' },
  duplicado: { label: 'Duplicado', color: 'warning' },
  ignorado: { label: 'Ignorado', color: 'neutral' },
  error: { label: 'Error', color: 'error' }
}

const detailOpen = ref(false)
const selected = ref<WebhookEvent | null>(null)

const payloadJson = computed(() => {
  if (!selected.value) return ''
  try {
    return JSON.stringify(selected.value.payload, null, 2)
  } catch {
    return String(selected.value.payload)
  }
})

const respuestaJson = computed(() => {
  if (!selected.value?.respuesta) return ''
  try {
    return JSON.stringify(selected.value.respuesta, null, 2)
  } catch {
    return ''
  }
})

function load(page = 1) {
  void communityStore.loadWebhookEvents({
    page,
    provider: filters.provider || undefined,
    estado: filters.estado || undefined,
    fecha: filters.fecha || undefined,
    busqueda: filters.busqueda.trim() || undefined
  })
}

function openDetail(evento: WebhookEvent) {
  selected.value = evento
  detailOpen.value = true
}

async function reintentar(evento: WebhookEvent) {
  await communityStore.retryWebhookEvent(evento.id)
  load(webhookPagination.value?.current_page ?? 1)
}

onMounted(async () => {
  const { request } = useApi()
  load()
  try {
    const res = await request<{ providers?: string[] }>('/admin/webhooks/events/proveedores')
    providerOptions.value = [
      { label: 'Todos', value: '' },
      ...(res.data?.providers ?? []).map(p => ({ label: p, value: p }))
    ]
  } catch {
    providerOptions.value = [{ label: 'Todos', value: '' }]
  }
})
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Trazabilidad de webhooks
        </h1>
        <p class="page-subtitle">
          Eventos recibidos de las pasarelas de pago: firma, reintentos y resultados
        </p>
      </div>
      <UButton
        label="Actualizar"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        size="sm"
        :loading="loading"
        @click="load()"
      />
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="surface rounded-xl p-4">
        <p class="text-xs text-slate-400">
          Total
        </p>
        <p class="text-2xl font-semibold">
          {{ webhookResumen?.total ?? 0 }}
        </p>
      </div>
      <div class="surface rounded-xl p-4">
        <p class="text-xs text-slate-400">
          Procesados
        </p>
        <p class="text-2xl font-semibold text-success-600">
          {{ webhookResumen?.procesados ?? 0 }}
        </p>
      </div>
      <div class="surface rounded-xl p-4">
        <p class="text-xs text-slate-400">
          Ignorados
        </p>
        <p class="text-2xl font-semibold text-warning-600">
          {{ webhookResumen?.ignorados ?? 0 }}
        </p>
      </div>
      <div class="surface rounded-xl p-4">
        <p class="text-xs text-slate-400">
          Errores
        </p>
        <p class="text-2xl font-semibold text-error-600">
          {{ webhookResumen?.errores ?? 0 }}
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="surface p-4 flex flex-col lg:flex-row gap-3">
      <UInput
        v-model="filters.busqueda"
        placeholder="Buscar event_id, tipo, orden…"
        icon="i-lucide-search"
        class="flex-1"
        @update:model-value="load(1)"
      />
      <USelect
        v-model="filters.provider"
        :items="providerOptions"
        placeholder="Proveedor"
        class="lg:w-48"
        @update:model-value="load(1)"
      />
      <USelect
        v-model="filters.estado"
        :items="estadoOptions"
        placeholder="Estado"
        class="lg:w-44"
        @update:model-value="load(1)"
      />
      <UInput
        v-model="filters.fecha"
        type="date"
        placeholder="Fecha"
        class="lg:w-44"
        @update:model-value="load(1)"
      />
    </div>

    <!-- Tabla -->
    <div class="surface overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50/80 dark:bg-slate-900/50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recibido
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Proveedor
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Evento
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estado
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Intentos
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Pedido
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="evento in webhookEvents"
              :key="evento.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
              @click="openDetail(evento)"
            >
              <td class="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                <p class="text-slate-600 dark:text-slate-300">
                  {{ date(evento.created_at, { day: '2-digit', month: 'short', year: 'numeric' }) }}
                </p>
                <p class="text-xs">
                  {{ relative(evento.created_at) }}
                </p>
              </td>
              <td class="px-5 py-3.5 text-sm capitalize">
                {{ evento.provider }}
              </td>
              <td class="px-5 py-3.5 text-sm max-w-[220px]">
                <p class="truncate font-medium">
                  {{ evento.tipo || '—' }}
                </p>
                <p class="truncate text-xs text-slate-400">
                  {{ evento.event_id || 'sin event_id' }}
                </p>
              </td>
              <td class="px-5 py-3.5">
                <UBadge
                  :label="badgeEstado[evento.estado]?.label ?? evento.estado"
                  :color="badgeEstado[evento.estado]?.color ?? 'neutral'"
                  variant="subtle"
                />
                <p
                  v-if="evento.firma_valida === false"
                  class="text-[10px] text-error-500 mt-1"
                >
                  firma inválida
                </p>
              </td>
              <td class="px-5 py-3.5 text-sm">
                {{ evento.intentos }}
                <span class="text-xs text-slate-400">(HTTP {{ evento.http_status ?? '—' }})</span>
              </td>
              <td class="px-5 py-3.5 text-sm">
                <NuxtLink
                  v-if="evento.order"
                  :to="`/admin/pedidos/${evento.order.id}`"
                  class="text-primary-600 hover:underline"
                  @click.stop
                >
                  {{ evento.order.numero }}
                </NuxtLink>
                <span
                  v-else
                  class="text-slate-400"
                >—</span>
              </td>
              <td class="px-5 py-3.5">
                <div
                  class="flex items-center gap-1"
                  @click.stop
                >
                  <UButton
                    icon="i-lucide-eye"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    aria-label="Ver detalle"
                    @click="openDetail(evento)"
                  />
                  <UButton
                    icon="i-lucide-rotate-cw"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    aria-label="Reintentar"
                    :disabled="evento.estado === 'procesado'"
                    @click="reintentar(evento)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="!webhookEvents.length">
              <td
                colspan="7"
                class="px-5 py-10 text-center text-sm text-slate-400"
              >
                {{ loading ? 'Cargando…' : 'No se han recibido eventos de webhook todavía' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiPaginationBar
      v-if="webhookPagination && webhookPagination.last_page > 1"
      :current-page="webhookPagination.current_page"
      :last-page="webhookPagination.last_page"
      :total="webhookPagination.total"
      :per-page="webhookPagination.per_page"
      @update:current-page="load($event)"
    />

    <!-- Detalle -->
    <UModal
      v-model:open="detailOpen"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <div class="min-w-0">
          <h3 class="font-semibold truncate">
            {{ selected?.tipo || 'Evento de webhook' }}
          </h3>
          <p class="text-xs text-slate-400">
            {{ selected?.provider }} · {{ selected?.event_id || 'sin event_id' }}
          </p>
        </div>
      </template>

      <template #body>
        <div
          v-if="selected"
          class="space-y-4"
        >
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p class="text-xs text-slate-400">
                Estado
              </p>
              <UBadge
                :label="badgeEstado[selected.estado]?.label ?? selected.estado"
                :color="badgeEstado[selected.estado]?.color ?? 'neutral'"
                variant="subtle"
              />
            </div>
            <div>
              <p class="text-xs text-slate-400">
                Intentos
              </p>
              <p class="font-medium">
                {{ selected.intentos }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">
                HTTP
              </p>
              <p class="font-medium">
                {{ selected.http_status ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">
                Firma
              </p>
              <p class="font-medium">
                {{ selected.firma_valida === null ? 'no verificada' : (selected.firma_valida ? 'válida' : 'inválida') }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">
                IP
              </p>
              <p class="font-medium">
                {{ selected.ip ?? '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">
                Pago
              </p>
              <p class="font-medium">
                {{ selected.payment_id ?? '—' }}
              </p>
            </div>
          </div>

          <div
            v-if="selected.error"
            class="p-3 rounded-lg bg-error-50 dark:bg-error-950 text-xs text-error-600 dark:text-error-300 break-words"
          >
            {{ selected.error }}
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Payload
            </p>
            <pre class="max-h-64 overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800">{{ payloadJson }}</pre>
          </div>

          <div v-if="respuestaJson">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Respuesta registrada
            </p>
            <pre class="max-h-40 overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800">{{ respuestaJson }}</pre>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            label="Cerrar"
            color="neutral"
            variant="ghost"
            @click="detailOpen = false"
          />
          <UButton
            v-if="selected && selected.estado !== 'procesado'"
            label="Reintentar"
            icon="i-lucide-rotate-cw"
            color="primary"
            @click="reintentar(selected); detailOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
