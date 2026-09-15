<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { orderStatusMeta, paymentStatusMeta, shippingStatusMeta } from '~/utils/orderStatus'

definePageMeta({ layout: 'client', middleware: ['auth'] })

const route = useRoute()
const orderId = Number(route.params.id)

const orderStore = useOrderStore()
const shipmentStore = useShipmentStore()
const { current } = storeToRefs(orderStore)
const { tracking } = storeToRefs(shipmentStore)
const { currency, date, relative } = useFormat()

const orderHistory = computed(() => current.value?.history ?? [])
const orderPayments = computed(() => current.value?.payments ?? [])

onMounted(async () => {
  if (orderId) {
    await orderStore.loadOne(orderId)
    if (current.value?.id) {
      // Si el envío tiene tracking público, intentar cargar
      const shippingId = (current.value as unknown as { shipment?: { tracking_number?: string } }).shipment?.tracking_number
      if (shippingId) await shipmentStore.track(shippingId)
    }
  }
})

useSeoMeta({ title: () => current.value ? `Pedido ${current.value.order_number ?? current.value.id}` : 'Pedido', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="page-container py-8 sm:py-10 max-w-4xl">
    <NuxtLink
      to="/cuenta/pedidos"
      class="text-sm text-theme-muted hover:text-theme-brand inline-flex items-center gap-1 mb-4"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Volver a mis pedidos
    </NuxtLink>

    <FeedbackSkeletonLoader
      v-if="!current"
      variant="card"
      :count="3"
    />

    <div
      v-else
      class="space-y-6"
    >
      <!-- Header -->
      <header class="surface p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">
            {{ current.order_number ?? `Pedido #${current.id}` }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            {{ date(current.created_at) }} · {{ relative(current.created_at) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            :label="orderStatusMeta(current.status).label"
            :color="orderStatusMeta(current.status).color"
            :icon="orderStatusMeta(current.status).icon"
            variant="subtle"
            size="md"
          />
          <UBadge
            :label="paymentStatusMeta(current.payment_status).label"
            :color="paymentStatusMeta(current.payment_status).color"
            variant="outline"
          />
          <UBadge
            v-if="current.shipping_status"
            :label="shippingStatusMeta(current.shipping_status).label"
            :color="shippingStatusMeta(current.shipping_status).color"
            variant="outline"
          />
        </div>
      </header>

      <!-- Items -->
      <section class="surface p-5 sm:p-6 space-y-3">
        <h2 class="font-semibold">
          Productos
        </h2>
        <ul class="divide-y divide-slate-100 dark:divide-slate-800">
          <li
            v-for="item in current.items ?? []"
            :key="item.id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
              <img
                v-if="item.product?.images?.[0]"
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="size-full object-cover"
              >
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">
                {{ item.name ?? item.product?.name ?? 'Producto' }}
              </p>
              <p class="text-xs text-slate-400">
                {{ item.quantity }} × {{ currency(item.price, current.currency) }}
              </p>
            </div>
            <p class="font-semibold tabular-nums text-sm shrink-0">
              {{ currency((item.price ?? 0) * item.quantity, current.currency) }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Totales -->
      <section class="surface p-5 sm:p-6">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex justify-between col-span-2">
            <span class="text-slate-500">Subtotal</span>
            <span class="tabular-nums">{{ currency(current.subtotal, current.currency) }}</span>
          </div>
          <div
            v-if="current.discount"
            class="flex justify-between col-span-2 text-emerald-600"
          >
            <span>Descuento</span>
            <span class="tabular-nums">-{{ currency(current.discount, current.currency) }}</span>
          </div>
          <div class="flex justify-between col-span-2">
            <span class="text-slate-500">Envío</span>
            <span class="tabular-nums">{{ currency(current.shipping, current.currency) }}</span>
          </div>
          <div class="flex justify-between col-span-2 text-slate-500">
            <span>Impuestos</span>
            <span class="tabular-nums">{{ currency(current.tax, current.currency) }}</span>
          </div>
          <USeparator class="col-span-2 my-2" />
          <div class="flex justify-between col-span-2 text-base font-semibold">
            <span>Total</span>
            <span class="tabular-nums">{{ currency(current.total, current.currency) }}</span>
          </div>
        </div>
      </section>

      <!-- Tracking -->
      <section
        v-if="tracking"
        class="surface p-5 sm:p-6 space-y-3"
      >
        <h2 class="font-semibold">
          Seguimiento
        </h2>
        <UBadge
          :label="shippingStatusMeta(tracking.status).label"
          :color="shippingStatusMeta(tracking.status).color"
          variant="subtle"
        />
        <ul class="space-y-2 text-sm">
          <li
            v-for="(event, i) in tracking.events ?? []"
            :key="i"
            class="flex items-start gap-3"
          >
            <UIcon
              name="i-lucide-circle-dot"
              class="size-4 text-theme-brand mt-0.5 shrink-0"
            />
            <div>
              <p>{{ event.descripcion ?? event.estado }}</p>
              <p class="text-xs text-slate-400">
                {{ event.fecha ? date(event.fecha) : '' }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Historial -->
      <section
        v-if="orderHistory.length"
        class="surface p-5 sm:p-6"
      >
        <h2 class="font-semibold mb-3">
          Historial
        </h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="h in orderHistory"
            :key="h.id"
            class="flex items-center justify-between gap-3 border-l-2 border-theme-brand pl-3"
          >
            <span>{{ orderStatusMeta(h.estado).label }}</span>
            <span class="text-slate-400 text-xs">{{ date(h.created_at) }}</span>
          </li>
        </ul>
      </section>

      <!-- Pagos -->
      <section
        v-if="orderPayments.length"
        class="surface p-5 sm:p-6"
      >
        <h2 class="font-semibold mb-3">
          Pagos
        </h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="p in orderPayments"
            :key="p.id"
            class="flex items-center justify-between gap-3"
          >
            <span>{{ p.provider }} · {{ p.reference ?? '—' }}</span>
            <span class="tabular-nums">{{ currency(p.amount, current.currency) }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
