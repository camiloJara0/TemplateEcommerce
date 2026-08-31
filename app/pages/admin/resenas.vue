<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const reviewStore = useReviewStore()
const { adminList, adminPagination, loading } = storeToRefs(reviewStore)
const { date, relative } = useFormat()

const statusFilter = ref<'' | 'pendiente' | 'aprobada' | 'rechazada'>('')

const statusBadge: Record<string, { label: string, color: 'success' | 'warning' | 'error' | 'neutral' }> = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  aprobada: { label: 'Aprobada', color: 'success' },
  rechazada: { label: 'Rechazada', color: 'error' }
}

async function applyFilters() {
  await reviewStore.loadAdminList({
    estado: statusFilter.value || undefined
  })
}

async function approve(id: number) {
  await reviewStore.adminApprove(id)
}

async function reject(id: number) {
  await reviewStore.adminReject(id)
}

async function remove(id: number) {
  if (!confirm('¿Eliminar esta reseña?')) return
  await reviewStore.adminDelete(id)
}

onMounted(() => {
  void reviewStore.loadAdminList()
})

useSeoMeta({ title: 'Reseñas — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Reseñas
        </h1>
        <p class="page-subtitle">
          {{ adminPagination?.total ?? adminList.length }} reseñas
        </p>
      </div>
    </div>

    <div class="surface p-4 flex flex-wrap gap-3">
      <USelect
        v-model="statusFilter"
        :items="[
          { label: 'Todas', value: '' },
          { label: 'Pendientes', value: 'pendiente' },
          { label: 'Aprobadas', value: 'aprobada' },
          { label: 'Rechazadas', value: 'rechazada' }
        ]"
        value-key="value"
        label-key="label"
        class="w-48"
        @update:model-value="applyFilters"
      />
    </div>

    <DashboardDataTable
      :columns="[
        { key: 'product', label: 'Producto' },
        { key: 'user', label: 'Usuario' },
        { key: 'rating', label: 'Rating' },
        { key: 'comment', label: 'Comentario' },
        { key: 'estado', label: 'Estado' },
        { key: 'created_at', label: 'Fecha' }
      ]"
      :rows="adminList"
      :loading="loading"
      empty-title="Sin reseñas"
      empty-description="Aún no hay reseñas para moderar."
    >
      <template #cell-product="{ row }">
        <p class="font-medium">
          {{ (row as any).product?.name ?? `Producto #${(row as any).product_id}` }}
        </p>
      </template>
      <template #cell-user="{ row }">
        <p class="text-sm">
          {{ (row as any).user?.nombre ?? 'Anónimo' }}
        </p>
      </template>
      <template #cell-rating="{ row }">
        <div class="flex items-center gap-0.5 text-amber-400">
          <UIcon
            v-for="n in 5"
            :key="n"
            name="i-lucide-star"
            class="size-3.5"
            :class="n <= (row as any).rating ? 'fill-current' : 'opacity-30'"
          />
        </div>
      </template>
      <template #cell-comment="{ row }">
        <p class="text-sm text-slate-500 line-clamp-2 max-w-[280px]">
          {{ (row as any).comment ?? '—' }}
        </p>
      </template>
      <template #cell-estado="{ row }">
        <UBadge
          :label="statusBadge[(row as any).estado]?.label ?? (row as any).estado"
          :color="statusBadge[(row as any).estado]?.color ?? 'neutral'"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #cell-created_at="{ row }">
        <span
          class="text-sm text-slate-500"
          :title="date((row as any).created_at)"
        >{{ relative((row as any).created_at) }}</span>
      </template>
      <template #row-actions="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-check"
            color="success"
            variant="ghost"
            size="xs"
            aria-label="Aprobar"
            @click="approve((row as any).id)"
          />
          <UButton
            icon="i-lucide-x"
            color="warning"
            variant="ghost"
            size="xs"
            aria-label="Rechazar"
            @click="reject((row as any).id)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Eliminar"
            @click="remove((row as any).id)"
          />
        </div>
      </template>
    </DashboardDataTable>
  </div>
</template>
