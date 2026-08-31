<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { orderStatusMeta, paymentStatusMeta } from '~/utils/orderStatus'
import type { OrderStatus } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const adminOrderStore = useAdminOrderStore()
const { items, pagination, filters, loading } = storeToRefs(adminOrderStore)
const { currency, date, relative } = useFormat()

const search = ref('')
const statusFilter = ref<OrderStatus | ''>('')
const showChangeStatus = ref(false)
const changeTarget = ref<{ id: number, current: OrderStatus } | null>(null)
const newStatus = ref<OrderStatus>('pagado')
const statusComment = ref('')
const showRefund = ref(false)
const refundTarget = ref<{ paymentId: number, amount: number } | null>(null)
const refundReason = ref('')

function openChangeStatus(order: NonNullable<typeof items.value>[number]) {
  changeTarget.value = { id: order.id, current: order.status }
  newStatus.value = order.status
  statusComment.value = ''
  showChangeStatus.value = true
}

async function submitStatus() {
  if (!changeTarget.value) return
  await adminOrderStore.changeStatus(changeTarget.value.id, {
    estado: newStatus.value,
    comentario: statusComment.value || undefined
  })
  showChangeStatus.value = false
}

function openRefund(order: NonNullable<typeof items.value>[number]) {
  const payment = (order as unknown as { payments?: Array<{ id: number, amount: number }> }).payments?.[0]
  if (!payment) return
  refundTarget.value = { paymentId: payment.id, amount: payment.amount }
  refundReason.value = ''
  showRefund.value = true
}

async function submitRefund() {
  if (!refundTarget.value) return
  await adminOrderStore.refund(refundTarget.value.paymentId, {
    amount: refundTarget.value.amount,
    reason: refundReason.value || undefined
  })
  showRefund.value = false
}

const statusOptions = [
  { label: 'Todos', value: 'p' },
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Preparando', value: 'preparando' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Devuelto', value: 'devuelto' }
]

const changeOptions = [
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Pagado', value: 'pagado' },
  { label: 'Preparando', value: 'preparando' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
  { label: 'Devuelto', value: 'devuelto' }
]

async function applyFilters() {
  await adminOrderStore.loadList({
    busqueda: search.value || undefined,
    status: statusFilter.value || undefined
  })
}

onMounted(async() => {
  await adminOrderStore.loadList()
})

useSeoMeta({ title: 'Pedidos — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Pedidos
        </h1>
        <p class="page-subtitle">
          {{ pagination?.total ?? 0 }} pedidos
        </p>
      </div>
    </div>

    <div class="surface p-4 flex flex-wrap gap-3">
      <UInput
        v-model="search"
        placeholder="Buscar por número…"
        icon="i-lucide-search"
        class="flex-1 min-w-50"
        @keyup.enter="applyFilters"
      />
      <USelect
        v-model="statusFilter"
        :items="statusOptions"
        value-key="value"
        label-key="label"
        class="w-48"
        @update:model-value="applyFilters"
      />
      <UButton
        label="Filtrar"
        icon="i-lucide-filter"
        color="neutral"
        variant="subtle"
        @click="applyFilters"
      />
    </div>

    <DashboardDataTable
      :columns="[
        { key: 'order_number', label: 'Pedido' },
        { key: 'status', label: 'Estado' },
        { key: 'payment_status', label: 'Pago' },
        { key: 'total', label: 'Total' },
        { key: 'created_at', label: 'Fecha' }
      ]"
      :rows="items || []"
      :loading="loading"
      empty-title="Sin pedidos"
      empty-description="No hay pedidos con los filtros actuales."
    >
      <template #cell-order_number="{ row }">
        <div>
          <NuxtLink
            :to="`/admin/pedidos/${(row as any).id}`"
            class="font-mono font-semibold hover:text-brand-600"
          >
            {{ (row as any).order_number ?? `#${(row as any).id}` }}
          </NuxtLink>
          <p class="text-xs text-slate-400">
            {{ relative((row as any).created_at) }}
          </p>
        </div>
      </template>
      <template #cell-status="{ row }">
        <UBadge
          :label="orderStatusMeta((row as any).status).label"
          :color="orderStatusMeta((row as any).status).color"
          :icon="orderStatusMeta((row as any).status).icon"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #cell-payment_status="{ row }">
        <UBadge
          :label="paymentStatusMeta((row as any).payment_status).label"
          :color="paymentStatusMeta((row as any).payment_status).color"
          variant="outline"
          size="sm"
        />
      </template>
      <template #cell-total="{ row }">
        <span class="tabular-nums font-semibold">{{ currency((row as any).total, (row as any).currency) }}</span>
      </template>
      <template #cell-created_at="{ row }">
        <span class="text-sm text-slate-500">{{ date((row as any).created_at) }}</span>
      </template>
      <template #row-actions="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-arrow-right-left"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Cambiar estado"
            @click="openChangeStatus(row as any)"
          />
          <UButton
            icon="i-lucide-undo-2"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Reembolsar"
            @click="openRefund(row as any)"
          />
        </div>
      </template>
    </DashboardDataTable>

    <div
      v-if="pagination && pagination.last_page > 1"
      class="flex justify-center"
    >
      <UPagination
        :model-value="pagination.current_page"
        :page-count="pagination.last_page"
        @update:model-value="(p: number) => adminOrderStore.loadList({ ...filters, page: p })"
      />
    </div>

    <!-- Modal cambiar estado -->
    <UModal
      v-model:open="showChangeStatus"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          Cambiar estado del pedido #{{ changeTarget?.id }}
        </h3>
      </template>
      <template #body>
        <div class="p-4 space-y-4">
          <UiBaseSelect
            v-model="newStatus"
            label="Nuevo estado"
            :items="changeOptions"
          />
          <UiBaseTextarea
            v-model="statusComment"
            label="Comentario (opcional)"
            :rows="3"
          />
          <UiBaseButton
            block
            color="primary"
            label="Aplicar cambio"
            @click="submitStatus"
          />
        </div>
      </template>
    </UModal>

    <!-- Modal reembolso -->
    <UModal
      v-model:open="showRefund"
      :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
    >
      <template #header>
        <h3 class="font-semibold">
          Reembolsar pago
        </h3>
      </template>
      <template #body>
        <div class="p-4 space-y-4">
          <UiBaseInput
            :model-value="refundTarget ? currency(refundTarget.amount) : ''"
            label="Monto"
            disabled
          />
          <UiBaseTextarea
            v-model="refundReason"
            label="Razón"
            :rows="3"
          />
          <UiBaseButton
            block
            color="primary"
            label="Procesar reembolso"
            @click="submitRefund"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
