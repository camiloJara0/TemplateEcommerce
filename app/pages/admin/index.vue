<script setup lang="ts">
import { orderStatusMeta } from '~/utils/orderStatus'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const adminOrders = useAdminOrderStore()
const productStore = useProductStore()
const inventoryStore = useInventoryStore()

const { items: recentOrders } = storeToRefs(adminOrders)
const { items: products } = storeToRefs(productStore)

const { currency, number, relative } = useFormat()

const lowStock = computed(() => (products.value ?? []).filter(p => (p.stock ?? 0) <= 5).length)
const summary = computed(() => ({
  ventas_hoy: 0,
  pedidos_mes: recentOrders.value?.length || 0,
  clientes: 0,
  stock_bajo: lowStock.value,
  ventas_mes: 0,
  ticket_promedio: 0,
  conversion: 0
}))

const activityFeed = computed(() => recentOrders.value?.slice(0, 5).map(o => ({
  id: o.id,
  type: 'order',
  text: `Pedido ${o.order_number ?? `#${o.id}`} · ${orderStatusMeta(o.status).label}`,
  time: relative(o.created_at),
  icon: orderStatusMeta(o.status).icon
})))

const salesByDay = computed(() => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return days.map((d, _i) => ({
    fecha: d,
    total: Math.floor(Math.random() * 5_000_000) + 1_000_000,
    pedidos: Math.floor(Math.random() * 30) + 10
  }))
})

const topProducts = computed(() => products.value.slice(0, 5).map((p, i) => ({
  product_id: p.id,
  name: p.name,
  cantidad: 120 - i * 18,
  total: (p.price_discount ?? p.price ?? 0) * (120 - i * 18)
})))

onMounted(async () => {
  await Promise.all([
    adminOrders.loadList(),
    productStore.loadList(),
    inventoryStore.loadAlerts()
  ])
})

useSeoMeta({ title: 'Dashboard — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Dashboard
        </h1>
        <p class="page-subtitle">
          Resumen operativo de tu tienda · Hoy
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          icon="i-lucide-download"
          color="neutral"
          variant="outline"
          label="Exportar"
          size="sm"
          class="rounded-xl"
        />
        <UButton
          icon="i-lucide-plus"
          color="primary"
          label="Nuevo producto"
          size="sm"
          to="/admin/productos"
          class="rounded-xl"
        />
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardStatCard
        title="Ventas de hoy"
        :value="currency(summary.ventas_hoy)"
        icon="i-lucide-banknote"
        tone="primary"
        :trend="0"
        trend-label="vs ayer"
      />
      <DashboardStatCard
        title="Pedidos del mes"
        :value="number(summary.pedidos_mes)"
        icon="i-lucide-shopping-bag"
        tone="info"
        :trend="0"
      />
      <DashboardStatCard
        title="Clientes"
        :value="number(summary.clientes)"
        icon="i-lucide-users"
        tone="success"
        :trend="0"
      />
      <DashboardStatCard
        title="Stock bajo"
        :value="number(summary.stock_bajo)"
        icon="i-lucide-package-x"
        tone="warning"
        :trend="0"
        trend-label="alertas activas"
      />
    </div>

    <!-- Charts + activity -->
    <div class="grid lg:grid-cols-3 gap-4 sm:gap-6">
      <DashboardMetricsCard
        class="lg:col-span-2"
        title="Ventas (7 días)"
        description="Total facturado por día"
      >
        <template #actions>
          <UBadge
            label="Últimos 7 días"
            color="neutral"
            variant="subtle"
          />
        </template>
        <DashboardSalesChart :data="salesByDay" />
      </DashboardMetricsCard>

      <DashboardMetricsCard
        title="Actividad"
        description="Pedidos recientes"
      >
        <DashboardActivityFeed :items="activityFeed" />
      </DashboardMetricsCard>
    </div>

    <!-- Categorías + top productos -->
    <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
      <DashboardMetricsCard
        title="Productos más vendidos"
        description="Top 5 del catálogo"
      >
        <ul class="space-y-3">
          <li
            v-for="p in topProducts"
            :key="p.product_id"
            class="flex items-center gap-3"
          >
            <div class="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
              <img
                v-if="(products.find(x => x.id === p.product_id)?.images ?? [])[0]"
                :src="(products.find(x => x.id === p.product_id)?.images as Array<{ url: string }>)[0]!.url"
                :alt="p.name"
                class="size-full object-cover"
              >
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ p.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ p.cantidad }} uds
              </p>
            </div>
            <span class="text-sm font-semibold tabular-nums shrink-0">
              {{ currency(p.total ?? 0) }}
            </span>
          </li>
        </ul>
      </DashboardMetricsCard>

      <DashboardMetricsCard
        title="Stock bajo"
        description="Productos que requieren atención"
      >
        <ul class="space-y-3">
          <li
            v-for="p in (products ?? []).filter(x => (x.stock ?? 0) <= 5).slice(0, 5)"
            :key="p.id"
            class="flex items-center gap-3"
          >
            <UIcon
              name="i-lucide-package-x"
              class="size-5 text-amber-500"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ p.name }}
              </p>
              <p class="text-xs text-slate-400">
                {{ p.sku }}
              </p>
            </div>
            <span class="text-sm font-semibold tabular-nums text-rose-600">
              {{ p.stock }}
            </span>
          </li>
          <FeedbackEmptyState
            v-if="!(products ?? []).filter(x => (x.stock ?? 0) <= 5).length"
            icon="i-lucide-package-check"
            title="Todo en orden"
            description="Sin alertas de stock."
          />
        </ul>
      </DashboardMetricsCard>
    </div>

    <!-- Pedidos recientes -->
    <DashboardMetricsCard
      title="Pedidos recientes"
      description="Últimas órdenes"
    >
      <template #actions>
        <UButton
          to="/admin/pedidos"
          color="neutral"
          variant="ghost"
          size="sm"
          label="Ver todos"
          trailing-icon="i-lucide-arrow-right"
        />
      </template>

      <div class="overflow-x-auto -mx-5 sm:-mx-6">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <th class="px-5 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pedido
              </th>
              <th class="px-5 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Estado
              </th>
              <th class="px-5 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hidden sm:table-cell">
                Pago
              </th>
              <th class="px-5 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total
              </th>
              <th class="px-5 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hidden md:table-cell">
                Fecha
              </th>
              <th class="px-5 sm:px-6 py-2" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="order in (recentOrders ?? []).slice(0, 5)"
              :key="order.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
            >
              <td class="px-5 sm:px-6 py-3.5">
                <p class="text-sm font-medium">
                  {{ order.order_number ?? `#${order.id}` }}
                </p>
                <p class="text-xs text-slate-400 truncate max-w-35">
                  {{ order.items?.[0]?.name }}
                </p>
              </td>
              <td class="px-5 sm:px-6 py-3.5">
                <UBadge
                  :label="orderStatusMeta(order.status).label"
                  :color="orderStatusMeta(order.status).color"
                  variant="subtle"
                  size="sm"
                />
              </td>
              <td class="px-5 sm:px-6 py-3.5 hidden sm:table-cell">
                <span class="text-sm capitalize text-slate-600 dark:text-slate-300">
                  {{ order.payment_status }}
                </span>
              </td>
              <td class="px-5 sm:px-6 py-3.5 text-sm font-semibold tabular-nums">
                {{ currency(order.total, order.currency) }}
              </td>
              <td class="px-5 sm:px-6 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                {{ relative(order.created_at) }}
              </td>
              <td class="px-5 sm:px-6 py-3.5 text-right">
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :to="`/admin/pedidos/${order.id}`"
                  aria-label="Ver pedido"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardMetricsCard>
  </div>
</template>
