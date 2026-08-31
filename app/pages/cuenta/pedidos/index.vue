<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { orderStatusMeta, paymentStatusMeta } from '~/utils/orderStatus'

definePageMeta({ layout: 'client', middleware: ['auth'] })

const orderStore = useOrderStore()
const { items, pagination, loadingList } = storeToRefs(orderStore)
const { currency, date } = useFormat()

async function loadPage(page: number) {
  await orderStore.loadList(15, page)
}

onMounted(() => {
  void orderStore.loadList()
})

useSeoMeta({ title: 'Mis pedidos', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">
          Mis pedidos
        </h1>
        <p class="page-subtitle">
          {{ pagination?.total ?? 0 }} pedidos en total
        </p>
      </div>
    </div>

    <FeedbackSkeletonLoader
      v-if="loadingList && !items.length"
      variant="list"
      :count="4"
    />

    <FeedbackEmptyState
      v-else-if="!items.length"
      icon="i-lucide-package"
      title="Aún no has hecho pedidos"
      description="Explora el catálogo y realiza tu primera compra."
      action-label="Ir al catálogo"
      action-to="/catalogo"
    />

    <div
      v-else
      class="space-y-3"
    >
      <NuxtLink
        v-for="order in items"
        :key="order.id"
        :to="`/cuenta/pedidos/${order.id}`"
        class="surface p-4 sm:p-5 flex flex-wrap items-center gap-3 hover-lift"
      >
        <div class="flex-1 min-w-0">
          <p class="font-semibold tabular-nums">
            {{ order.order_number ?? `#${order.id}` }}
          </p>
          <p class="text-xs text-slate-400 mt-1">
            {{ date(order.created_at) }} · {{ order.items?.length ?? 0 }} ítems
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            :label="orderStatusMeta(order.status).label"
            :color="orderStatusMeta(order.status).color"
            :icon="orderStatusMeta(order.status).icon"
            variant="subtle"
          />
          <UBadge
            :label="paymentStatusMeta(order.payment_status).label"
            :color="paymentStatusMeta(order.payment_status).color"
            variant="outline"
          />
        </div>
        <p class="font-semibold tabular-nums text-right">
          {{ currency(order.total, order.currency) }}
        </p>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 text-slate-400"
        />
      </NuxtLink>

      <div
        v-if="pagination && pagination.last_page > 1"
        class="flex justify-center mt-6"
      >
        <UPagination
          :model-value="pagination.current_page"
          :page-count="pagination.last_page"
          @update:model-value="loadPage"
        />
      </div>
    </div>
  </div>
</template>
