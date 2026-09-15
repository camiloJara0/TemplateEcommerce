<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { orderStatusMeta, paymentStatusMeta } from '~/utils/orderStatus'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route = useRoute()
const orderId = Number(route.params.id)

const adminOrderStore = useAdminOrderStore()
const { items } = storeToRefs(adminOrderStore)
const { currency, date } = useFormat()

const order = computed(() => items.value.find(o => o.id === orderId) ?? null)
const orderHistory = computed(() => order.value?.history ?? [])
const orderPayments = computed(() => (order.value as unknown as { payments?: Array<{ id: number, provider: string, amount: number, reference?: string, status: string }> })?.payments ?? [])

onMounted(async () => {
  await adminOrderStore.loadList()
})

useSeoMeta({ title: () => order.value ? `Pedido ${order.value.order_number ?? order.value.id} — Admin` : 'Pedido' })
</script>

<template>
  <div class="space-y-6 animate-fade-up max-w-4xl">
    <NuxtLink
      to="/admin/pedidos"
      class="text-sm text-slate-500 hover:text-brand-600 inline-flex items-center gap-1"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Volver a pedidos
    </NuxtLink>

    <FeedbackSkeletonLoader
      v-if="!order"
      variant="card"
      :count="2"
    />

    <div
      v-else
      class="space-y-6"
    >
      <header class="surface p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">
            {{ order.order_number ?? `Pedido #${order.id}` }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            {{ date(order.created_at) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
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
      </header>

      <section class="surface p-5 sm:p-6">
        <h2 class="font-semibold mb-3">
          Productos
        </h2>
        <ul class="divide-y divide-slate-100 dark:divide-slate-800">
          <li
            v-for="item in order.items ?? []"
            :key="item.id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <p class="flex-1 text-sm">
              {{ item.quantity }}× {{ item.name ?? item.product?.name }}
            </p>
            <p class="tabular-nums text-sm font-semibold">
              {{ currency((item.price ?? 0) * item.quantity, order.currency) }}
            </p>
          </li>
        </ul>
      </section>

      <section class="surface p-5 sm:p-6">
        <h2 class="font-semibold mb-3">
          Totales
        </h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="col-span-2 flex justify-between">
            <span class="text-slate-500">Subtotal</span>
            <span class="tabular-nums">{{ currency(order.subtotal, order.currency) }}</span>
          </div>
          <div
            v-if="order.discount"
            class="col-span-2 flex justify-between text-emerald-600"
          >
            <span>Descuento</span>
            <span class="tabular-nums">-{{ currency(order.discount, order.currency) }}</span>
          </div>
          <div class="col-span-2 flex justify-between">
            <span class="text-slate-500">Envío</span>
            <span class="tabular-nums">{{ currency(order.shipping, order.currency) }}</span>
          </div>
          <div class="col-span-2 flex justify-between text-slate-500">
            <span>Impuestos</span>
            <span class="tabular-nums">{{ currency(order.tax, order.currency) }}</span>
          </div>
          <USeparator class="col-span-2 my-2" />
          <div class="col-span-2 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span class="tabular-nums">{{ currency(order.total, order.currency) }}</span>
          </div>
        </div>
      </section>

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
            class="flex items-center justify-between gap-3 border-l-2 border-brand-500 pl-3"
          >
            <span>
              {{ orderStatusMeta(h.estado).label }}
              <span
                v-if="h.comentario"
                class="text-slate-400"
              > — {{ h.comentario }}</span>
            </span>
            <span class="text-xs text-slate-400">{{ date(h.created_at) }}</span>
          </li>
        </ul>
      </section>

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
            <span class="tabular-nums">{{ currency(p.amount, order.currency) }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
