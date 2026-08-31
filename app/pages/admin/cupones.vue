<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { CouponPayload } from '~/types/admin'
import type { Coupon } from '~/types/commerce'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const couponStore = useCouponStore()
const { adminList, loading } = storeToRefs(couponStore)
const { currency, date } = useFormat()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const editingCoupon = ref<Partial<CouponPayload> | null>(null)

const typeBadge: Record<string, { label: string, color: 'primary' | 'success' | 'info' }> = {
  percent: { label: '%', color: 'primary' },
  fixed: { label: 'Monto fijo', color: 'success' },
  free_shipping: { label: 'Envío gratis', color: 'info' }
}

async function openCreate() {
  editingId.value = null
  editingCoupon.value = null
  showModal.value = true
}

function stripNull<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v != null) out[k] = v
  }
  return out
}

async function openEdit(coupon: Coupon) {
  editingId.value = coupon.id
  editingCoupon.value = stripNull({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    min_subtotal: coupon.min_subtotal,
    max_discount: coupon.max_discount,
    usage_limit: coupon.usage_limit,
    per_user_limit: coupon.per_user_limit,
    starts_at: coupon.starts_at,
    expires_at: coupon.expires_at,
    active: coupon.active
  }) as Partial<CouponPayload>
  showModal.value = true
}

async function handleSubmit(payload: unknown) {
  if (editingId.value) {
    await couponStore.adminUpdate(editingId.value, payload as Partial<CouponPayload>)
  } else {
    await couponStore.adminCreate(payload as CouponPayload)
  }
  showModal.value = false
}

async function remove(coupon: NonNullable<typeof adminList.value>[number]) {
  if (!confirm(`¿Eliminar cupón "${coupon.code}"?`)) return
  await couponStore.adminDelete(coupon.id)
}

onMounted(() => {
  void couponStore.loadAdminList()
})

useSeoMeta({ title: 'Cupones — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Cupones
        </h1>
        <p class="page-subtitle">
          {{ adminList.length }} cupones
        </p>
      </div>
      <UModal
        v-model:open="showModal"
        :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
      >
        <UButton
          label="Nuevo cupón"
          icon="i-lucide-plus"
          color="primary"
          size="sm"
          class="rounded-xl"
          @click="openCreate"
        />
        <template #header>
          <h3 class="text-base font-semibold">
            {{ editingId ? 'Editar cupón' : 'Nuevo cupón' }}
          </h3>
        </template>
        <template #body>
          <div class="p-4">
            <FormsCouponForm
              :initial="editingCoupon ?? undefined"
              @success="handleSubmit"
            />
          </div>
        </template>
      </UModal>
    </div>

    <DashboardDataTable
      :columns="[
        { key: 'code', label: 'Código' },
        { key: 'type', label: 'Tipo' },
        { key: 'value', label: 'Valor' },
        { key: 'used_count', label: 'Usos' },
        { key: 'expires_at', label: 'Expira' },
        { key: 'active', label: 'Estado' }
      ]"
      :rows="adminList"
      :loading="loading"
      empty-title="Sin cupones"
      empty-description="Crea cupones para promover tus productos."
    >
      <template #cell-code="{ row }">
        <code class="font-mono font-semibold text-brand-600 dark:text-brand-400">{{ (row as any).code }}</code>
      </template>
      <template #cell-type="{ row }">
        <UBadge
          :label="typeBadge[(row as any).type]?.label ?? (row as any).type"
          :color="typeBadge[(row as any).type]?.color ?? 'neutral'"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #cell-value="{ row }">
        <span class="tabular-nums font-semibold">
          {{ (row as any).type === 'percent' ? `${(row as any).value}%` : currency((row as any).value) }}
        </span>
      </template>
      <template #cell-used_count="{ row }">
        <span class="tabular-nums">{{ (row as any).used_count ?? 0 }} / {{ (row as any).usage_limit ?? '∞' }}</span>
      </template>
      <template #cell-expires_at="{ row }">
        <span
          v-if="(row as any).expires_at"
          class="text-sm text-slate-500"
        >{{ date((row as any).expires_at) }}</span>
        <span
          v-else
          class="text-slate-400"
        >—</span>
      </template>
      <template #cell-active="{ row }">
        <UBadge
          :label="(row as any).active ? 'Activo' : 'Inactivo'"
          :color="(row as any).active ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
        />
      </template>
      <template #row-actions="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pen"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Editar"
            @click="openEdit(row as any)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Eliminar"
            @click="remove(row as any)"
          />
        </div>
      </template>
    </DashboardDataTable>
  </div>
</template>
