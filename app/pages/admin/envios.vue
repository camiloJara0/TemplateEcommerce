<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shippingStatusMeta } from '~/utils/orderStatus'
import type { ShippingStatus, Carrier } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const shipmentStore = useShipmentStore()
const { adminList, adminPagination, loading } = storeToRefs(shipmentStore)
const { request, showSuccess } = useApi()
const { date, currency } = useFormat()
const toast = useToast()

const currentPage = ref(1)
const statusFilter = ref('#')
const carrierFilter = ref('#')

const showCreate = ref(false)
const newShipment = ref<{ order_id: number, carrier: Carrier }>({
  order_id: 0, carrier: 'servientrega'
})

const showStatus = ref(false)
const statusTarget = ref<{ id: number, current: ShippingStatus } | null>(null)
const newStatus = ref<ShippingStatus>('en_preparacion')

const showQuote = ref(false)
const quoteLoading = ref(false)
const quoteForm = ref({ order_id: undefined as number | undefined, weight: undefined as number | undefined, ciudad: '', pais: 'Colombia' })
const quoteResults = ref<Array<{ carrier: string, cost: number, days?: number, weight?: number, volumetric_weight?: number, zone?: string }>>([])

const showCancel = ref(false)
const cancelTarget = ref<number | null>(null)

const carrierOptions = [
  { label: 'Servientrega', value: 'servientrega' },
  { label: 'Coordinadora', value: 'coordinadora' },
  { label: 'DHL', value: 'dhl' },
  { label: 'FedEx', value: 'fedex' },
  { label: 'Interrapidísimo', value: 'interrapidisimo' }
]

const statusOptions = [
  { label: 'En preparación', value: 'en_preparacion' },
  { label: 'Despachado', value: 'despachado' },
  { label: 'En tránsito', value: 'en_transito' },
  { label: 'Entregado', value: 'entregado' }
]

async function loadPage(page = 1) {
  currentPage.value = page
  await shipmentStore.loadAdminList({
    status: statusFilter.value || undefined,
    carrier: carrierFilter.value || undefined,
    page
  })
}

async function submitCreate() {
  if (!newShipment.value.order_id) return
  await shipmentStore.adminCreate({ ...newShipment.value, address_id: 0 })
  showCreate.value = false
  newShipment.value = { order_id: 0, carrier: 'servientrega' }
}

function openStatus(shipment: NonNullable<typeof adminList.value>[number]) {
  statusTarget.value = { id: shipment.id, current: shipment.status }
  newStatus.value = shipment.status
  showStatus.value = true
}

async function submitStatus() {
  if (!statusTarget.value) return
  await shipmentStore.adminChangeStatus(statusTarget.value.id, { estado: newStatus.value })
  showStatus.value = false
}

async function downloadLabel(shipment: NonNullable<typeof adminList.value>[number]) {
  try {
    await shipmentStore.adminDownloadLabel(shipment.id, shipment.tracking_number)
    showSuccess('Etiqueta descargada')
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo descargar la etiqueta', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

function openCancel(id: number) {
  cancelTarget.value = id
  showCancel.value = true
}

async function submitCancel() {
  if (!cancelTarget.value) return
  await shipmentStore.adminCancel(cancelTarget.value)
  showCancel.value = false
  cancelTarget.value = null
}

async function submitQuote() {
  quoteLoading.value = true
  quoteResults.value = []
  try {
    const res = await request<unknown>('/admin/envios/cotizar', {
      query: {
        order_id: quoteForm.value.order_id || undefined,
        weight: quoteForm.value.weight || undefined,
        ciudad: quoteForm.value.ciudad || undefined,
        pais: quoteForm.value.pais || undefined
      }
    })
    const data = res.data
    quoteResults.value = Array.isArray(data) ? data as typeof quoteResults.value : [data as typeof quoteResults.value[number]]
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo cotizar', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    quoteLoading.value = false
  }
}

onMounted(() => loadPage())

useSeoMeta({ title: 'Envíos — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Envíos
        </h1>
        <p class="page-subtitle">
          {{ adminPagination?.total ?? adminList.length }} envíos
        </p>
      </div>
      <div class="flex gap-2">
        <UModal
          v-model:open="showQuote"
          :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
        >
          <UButton
            label="Cotizar"
            icon="i-lucide-calculator"
            color="neutral"
            variant="soft"
            size="sm"
            class="rounded-xl"
          />
          <template #header>
            <h3 class="font-semibold">
              Cotizar envío
            </h3>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <UiBaseInput
                v-model.number="quoteForm.order_id"
                label="ID de pedido (opcional)"
                type="number"
              />
              <UiBaseInput
                v-model.number="quoteForm.weight"
                label="Peso manual (kg, si no hay pedido)"
                type="number"
                step="0.1"
              />
              <UiBaseInput
                v-model="quoteForm.ciudad"
                label="Ciudad destino"
              />
              <UiBaseInput
                v-model="quoteForm.pais"
                label="País"
              />
              <UiBaseButton
                block
                color="primary"
                label="Cotizar"
                :loading="quoteLoading"
                @click="submitQuote"
              />
              <ul
                v-if="quoteResults.length"
                class="space-y-2 text-sm"
              >
                <li
                  v-for="q in quoteResults"
                  :key="q.carrier"
                  class="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                >
                  <div>
                    <p class="font-medium capitalize">
                      {{ q.carrier.replace(/_/g, ' ') }}
                    </p>
                    <p class="text-xs text-slate-500">
                      Peso facturable: {{ q.weight ?? '—' }} kg
                      <template v-if="q.volumetric_weight">
                        · vol. {{ q.volumetric_weight }} kg
                      </template>
                      <template v-if="q.zone">
                        · {{ q.zone }}
                      </template>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold tabular-nums">
                      {{ currency(q.cost) }}
                    </p>
                    <p
                      v-if="q.days"
                      class="text-xs text-slate-500"
                    >
                      {{ q.days }} días
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </template>
        </UModal>

        <UModal
          v-model:open="showCreate"
          :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
        >
          <UButton
            label="Nuevo envío"
            icon="i-lucide-plus"
            color="primary"
            size="sm"
            class="rounded-xl"
          />
          <template #header>
            <h3 class="font-semibold">
              Crear envío
            </h3>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <p class="text-sm text-slate-500">
                El peso y costo se calculan automáticamente desde los productos del pedido.
              </p>
              <UiBaseInput
                v-model.number="newShipment.order_id"
                label="ID de pedido"
                type="number"
              />
              <UiBaseSelect
                v-model="newShipment.carrier"
                label="Transportadora"
                :items="carrierOptions"
              />
              <UiBaseButton
                block
                color="primary"
                label="Crear envío"
                @click="submitCreate"
              />
            </div>
          </template>
        </UModal>
      </div>
    </div>

    <div class="surface p-4 flex flex-wrap gap-3">
      <USelect
        v-model="statusFilter"
        :items="[
          { label: 'Todos los estados', value: '#' },
          ...statusOptions
        ]"
        class="w-48"
        @update:model-value="loadPage(1)"
      />
      <USelect
        v-model="carrierFilter"
        :items="[
          { label: 'Todas las transportadoras', value: '#' },
          ...carrierOptions
        ]"
        class="w-48"
        @update:model-value="loadPage(1)"
      />
    </div>

    <DashboardDataTable
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'order_id', label: 'Pedido' },
        { key: 'carrier', label: 'Transportadora' },
        { key: 'tracking_number', label: 'Tracking' },
        { key: 'weight', label: 'Peso' },
        { key: 'cost', label: 'Costo' },
        { key: 'status', label: 'Estado' },
        { key: 'created_at', label: 'Fecha' }
      ]"
      :rows="adminList"
      :loading="loading"
      empty-title="Sin envíos"
      empty-description="Crea el primer envío."
    >
      <template #cell-id="{ row }">
        <span class="font-mono tabular-nums">#{{ (row as any).id }}</span>
      </template>
      <template #cell-order_id="{ row }">
        <span class="font-mono tabular-nums">#{{ (row as any).order_id }}</span>
      </template>
      <template #cell-tracking_number="{ row }">
        <code
          v-if="(row as any).tracking_number"
          class="font-mono text-xs text-slate-500"
        >{{ (row as any).tracking_number }}</code>
        <span
          v-else
          class="text-slate-400"
        >—</span>
      </template>
      <template #cell-weight="{ row }">
        <span
          v-if="(row as any).weight"
          class="tabular-nums text-sm"
        >{{ (row as any).weight }} kg</span>
        <span
          v-else
          class="text-slate-400"
        >—</span>
      </template>
      <template #cell-cost="{ row }">
        <span
          v-if="(row as any).cost != null"
          class="tabular-nums text-sm font-medium"
        >{{ currency((row as any).cost) }}</span>
        <span
          v-else
          class="text-slate-400"
        >—</span>
      </template>
      <template #cell-status="{ row }">
        <UBadge
          :label="shippingStatusMeta((row as any).status).label"
          :color="shippingStatusMeta((row as any).status).color"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #cell-created_at="{ row }">
        <span class="text-sm text-slate-500">{{ date((row as any).created_at) }}</span>
      </template>
      <template #row-actions="{ row }">
        <div class="flex items-center gap-0.5">
          <UButton
            v-if="(row as any).status !== 'cancelado' && (row as any).status !== 'entregado'"
            icon="i-lucide-arrow-right-left"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Cambiar estado"
            @click="openStatus(row as any)"
          />
          <UButton
            v-if="(row as any).tracking_number"
            icon="i-lucide-download"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Descargar etiqueta"
            @click="downloadLabel(row as any)"
          />
          <UButton
            v-if="(row as any).status !== 'cancelado' && (row as any).status !== 'entregado'"
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Cancelar envío"
            @click="openCancel((row as any).id)"
          />
        </div>
      </template>
    </DashboardDataTable>

    <UiPaginationBar
      :current-page="currentPage"
      :last-page="adminPagination?.last_page ?? 1"
      :total="adminPagination?.total"
      @update:current-page="loadPage"
    />

    <UModal
      v-model:open="showStatus"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          Cambiar estado del envío
        </h3>
      </template>
      <template #body>
        <div class="p-4 space-y-4">
          <UiBaseSelect
            v-model="newStatus"
            label="Nuevo estado"
            :items="statusOptions"
          />
          <UiBaseButton
            block
            color="primary"
            label="Aplicar"
            @click="submitStatus"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="showCancel"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          Cancelar envío
        </h3>
      </template>
      <template #body>
        <div class="p-4 space-y-4">
          <p class="text-sm text-slate-500">
            El envío se marcará como cancelado y el pedido volverá a estado preparando.
          </p>
          <UiBaseButton
            block
            color="error"
            label="Confirmar cancelación"
            @click="submitCancel"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
