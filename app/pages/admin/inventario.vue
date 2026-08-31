<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const inventoryStore = useInventoryStore()
const productStore = useProductStore()
const { movements, loadingMovements, alerts, loadingAlerts } = storeToRefs(inventoryStore)
const { items: products } = storeToRefs(productStore)
const { date } = useFormat()

const showMovementModal = ref(false)
const showAlertModal = ref(false)
const productOptions = computed(() => products.value.map(p => ({ label: p.name, value: p.id })))

const movementInitial = ref<Parameters<typeof inventoryStore.createMovement>[0]>({
  product_id: 0,
  tipo: 'entrada',
  cantidad: 0,
  razon: ''
})

const alertInitial = ref<Parameters<typeof inventoryStore.createAlert>[0]>({
  product_id: 0,
  min_stock: 5,
  active: true
})

async function submitMovement(payload: unknown) {
  await inventoryStore.createMovement(payload as Parameters<typeof inventoryStore.createMovement>[0])
  showMovementModal.value = false
}

async function submitAlert(payload: unknown) {
  await inventoryStore.createAlert(payload as Parameters<typeof inventoryStore.createAlert>[0])
  showAlertModal.value = false
}

onMounted(async () => {
  await Promise.all([
    inventoryStore.loadMovements(),
    inventoryStore.loadAlerts(),
    productStore.loadList()
  ])
})

useSeoMeta({ title: 'Inventario — Admin' })
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Inventario
        </h1>
        <p class="page-subtitle">
          Movimientos y alertas de stock
        </p>
      </div>
    </div>

    <!-- Alertas -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Alertas de stock bajo
        </h2>
        <UModal
          v-model:open="showAlertModal"
          :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
        >
          <UButton
            label="Nueva alerta"
            icon="i-lucide-bell-plus"
            color="primary"
            variant="subtle"
            size="sm"
            class="rounded-xl"
          />
          <template #header>
            <h3 class="font-semibold">
              Nueva alerta de stock
            </h3>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <UiBaseSelect
                v-model="alertInitial.product_id"
                label="Producto"
                :items="productOptions"
                placeholder="Selecciona"
              />
              <UiBaseInput
                v-model.number="alertInitial.min_stock"
                label="Stock mínimo"
                type="number"
              />
              <UCheckbox
                v-model="alertInitial.active"
                label="Activa"
              />
              <UiBaseButton
                block
                color="primary"
                label="Guardar"
                @click="submitAlert(alertInitial)"
              />
            </div>
          </template>
        </UModal>
      </div>

      <DashboardDataTable
        :columns="[
          { key: 'product', label: 'Producto' },
          { key: 'min_stock', label: 'Mínimo' },
          { key: 'active', label: 'Estado' }
        ]"
        :rows="alerts"
        :loading="loadingAlerts"
        empty-title="Sin alertas"
        empty-description="Configura alertas para productos con stock bajo."
      >
        <template #cell-product="{ row }">
          <p class="font-medium">
            {{ (row as any).product?.name ?? `Producto #${(row as any).product_id}` }}
          </p>
        </template>
        <template #cell-min_stock="{ row }">
          <span class="tabular-nums font-semibold">{{ (row as any).min_stock }}</span>
        </template>
        <template #cell-active="{ row }">
          <UBadge
            :label="(row as any).active ? 'Activa' : 'Inactiva'"
            :color="(row as any).active ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          />
        </template>
      </DashboardDataTable>
    </section>

    <!-- Movimientos -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Movimientos
        </h2>
        <UModal
          v-model:open="showMovementModal"
          :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
        >
          <UButton
            label="Nuevo movimiento"
            icon="i-lucide-arrow-left-right"
            color="primary"
            variant="subtle"
            size="sm"
            class="rounded-xl"
          />
          <template #header>
            <h3 class="font-semibold">
              Registrar movimiento
            </h3>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <UiBaseSelect
                v-model="movementInitial.product_id"
                label="Producto"
                :items="productOptions"
                placeholder="Selecciona"
              />
              <UiBaseSelect
                v-model="movementInitial.tipo"
                label="Tipo"
                :items="[
                  { label: 'Entrada', value: 'entrada' },
                  { label: 'Salida', value: 'salida' },
                  { label: 'Ajuste', value: 'ajuste' }
                ]"
              />
              <UiBaseInput
                v-model.number="movementInitial.cantidad"
                label="Cantidad"
                type="number"
              />
              <UiBaseTextarea
                v-model="movementInitial.razon"
                label="Razón"
                :rows="2"
                placeholder="Motivo del movimiento"
              />
              <UiBaseButton
                block
                color="primary"
                label="Guardar"
                @click="submitMovement(movementInitial)"
              />
            </div>
          </template>
        </UModal>
      </div>

      <DashboardDataTable
        :columns="[
          { key: 'created_at', label: 'Fecha' },
          { key: 'product', label: 'Producto' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'cantidad', label: 'Cantidad' },
          { key: 'razon', label: 'Razón' }
        ]"
        :rows="movements"
        :loading="loadingMovements"
        empty-title="Sin movimientos"
        empty-description="Registra entradas, salidas o ajustes."
      >
        <template #cell-created_at="{ row }">
          <span class="text-sm text-slate-500">{{ date((row as any).created_at) }}</span>
        </template>
        <template #cell-product="{ row }">
          {{ (row as any).product?.name ?? `Producto #${(row as any).product_id}` }}
        </template>
        <template #cell-tipo="{ row }">
          <UBadge
            :label="(row as any).tipo"
            :color="(row as any).tipo === 'entrada' ? 'success' : (row as any).tipo === 'salida' ? 'warning' : 'info'"
            variant="subtle"
            size="sm"
          />
        </template>
        <template #cell-cantidad="{ row }">
          <span
            class="tabular-nums font-semibold"
            :class="(row as any).tipo === 'entrada' ? 'text-emerald-600' : (row as any).tipo === 'salida' ? 'text-rose-600' : ''"
          >
            {{ (row as any).tipo === 'entrada' ? '+' : (row as any).tipo === 'salida' ? '-' : '' }}{{ (row as any).cantidad }}
          </span>
        </template>
        <template #cell-razon="{ row }">
          <span class="text-sm text-slate-500 line-clamp-1">{{ (row as any).razon ?? '—' }}</span>
        </template>
      </DashboardDataTable>
    </section>
  </div>
</template>
