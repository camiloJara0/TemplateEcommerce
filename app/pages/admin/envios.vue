<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { shippingStatusMeta } from '~/utils/orderStatus'
import type { ShippingStatus, Carrier } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const shipmentStore = useShipmentStore()
const { adminList, adminPagination, loading } = storeToRefs(shipmentStore)
const { date } = useFormat()

const showCreate = ref(false)
const newShipment = ref<{ order_id: number, carrier: Carrier, address_id: number, weight?: number }>({
  order_id: 0,
  carrier: 'servientrega',
  address_id: 0,
  weight: undefined
})

const showStatus = ref(false)
const statusTarget = ref<{ id: number, current: ShippingStatus } | null>(null)
const newStatus = ref<ShippingStatus>('en_preparacion')

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

async function submitCreate() {
  if (!newShipment.value.order_id || !newShipment.value.address_id) return
  await shipmentStore.adminCreate(newShipment.value)
  showCreate.value = false
  newShipment.value = { order_id: 0, carrier: 'servientrega', address_id: 0, weight: undefined }
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

onMounted(() => {
  void shipmentStore.loadAdminList()
})

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
            <UiBaseInput
              v-model.number="newShipment.order_id"
              label="ID de pedido"
              type="number"
            />
            <UiBaseInput
              v-model.number="newShipment.address_id"
              label="ID de dirección"
              type="number"
            />
            <UiBaseSelect
              v-model="newShipment.carrier"
              label="Transportadora"
              :items="carrierOptions"
            />
            <UiBaseInput
              v-model.number="newShipment.weight"
              label="Peso (kg)"
              type="number"
              step="0.1"
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

    <DashboardDataTable
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'order_id', label: 'Pedido' },
        { key: 'carrier', label: 'Transportadora' },
        { key: 'tracking_number', label: 'Tracking' },
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
        <UButton
          icon="i-lucide-arrow-right-left"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Cambiar estado"
          @click="openStatus(row as any)"
        />
      </template>
    </DashboardDataTable>

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
  </div>
</template>
