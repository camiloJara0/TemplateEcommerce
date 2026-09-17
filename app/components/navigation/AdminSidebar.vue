<script setup lang="ts">
import { storeToRefs } from 'pinia'
const route = useRoute()
const collapsed = defineModel<boolean>('collapsed', { default: false })
const storePedidos = useOrderStore()

const {count} = storeToRefs(storePedidos)
const groups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
      { label: 'Pedidos', icon: 'i-lucide-shopping-bag', to: '/admin/pedidos', badge: count.value },
      { label: 'Usuarios', icon: 'i-lucide-users', to: '/admin/usuarios' }
    ]
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Productos', icon: 'i-lucide-package', to: '/admin/productos' },
      { label: 'Categorías', icon: 'i-lucide-layers', to: '/admin/categorias' },
      { label: 'Inventario', icon: 'i-lucide-warehouse', to: '/admin/inventario' }
    ]
  },
  {
    label: 'Tienda',
    items: [
      { label: 'Editor de tienda', icon: 'i-lucide-layout-template', to: '/admin/tienda' },
      { label: 'Plantillas', icon: 'i-lucide-layout-grid', to: '/admin/plantillas' },
      { label: 'Configuración', icon: 'i-lucide-settings', to: '/admin/configuracion' }
    ]
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Pagos', icon: 'i-lucide-credit-card', to: '/admin/pagos' },
      { label: 'Envíos', icon: 'i-lucide-truck', to: '/admin/envios' },
      { label: 'Reportes', icon: 'i-lucide-chart-column', to: '/admin/reportes' }
    ]
  }
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-out"
    :class="collapsed ? 'w-18' : 'w-64'"
  >
    <!-- Brand -->
    <div
      class="flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-800 shrink-0"
      :class="collapsed ? 'justify-center' : 'gap-2.5'"
    >
      <div class="size-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-glow">
        <UIcon
          name="i-lucide-hexagon"
          class="size-4 text-white"
        />
      </div>
      <div
        v-if="!collapsed"
        class="min-w-0 animate-fade-in"
      >
        <p class="font-semibold text-sm text-slate-900 dark:text-white truncate">
          CommerceOS
        </p>
        <p class="text-[11px] text-slate-400 truncate">
          Panel admin
        </p>
      </div>
    </div>

    <!-- Nav -->
    <nav
      class="flex-1 overflow-y-auto py-4 px-3 space-y-5"
      aria-label="Admin"
    >
      <div
        v-for="group in groups"
        :key="group.label"
      >
        <p
          v-if="!collapsed"
          class="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          {{ group.label }}
        </p>
        <ul class="space-y-0.5">
          <li
            v-for="item in group.items"
            :key="item.to"
          >
            <UTooltip
              :text="item.label"
              :disabled="!collapsed"
              :content="{ side: 'right' }"
            >
              <NuxtLink
                :to="item.to"
                class="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150 focus-ring"
                :class="[
                  collapsed ? 'justify-center' : '',
                  isActive(item.to)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                ]"
              >
                <UIcon
                  :name="item.icon"
                  class="size-5 shrink-0"
                  :class="isActive(item.to) ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'"
                />
                <span
                  v-if="!collapsed"
                  class="flex-1 truncate"
                >{{ item.label }}</span>
                <UBadge
                  v-if="!collapsed && item.badge"
                  :label="item.badge"
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              </NuxtLink>
            </UTooltip>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Collapse -->
    <div class="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
      <UButton
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        color="neutral"
        variant="ghost"
        size="sm"
        :block="!collapsed"
        :class="collapsed ? 'w-full justify-center' : 'justify-start'"
        :label="collapsed ? undefined : 'Colapsar'"
        aria-label="Colapsar sidebar"
        @click="collapsed = !collapsed"
      />
    </div>
  </aside>
</template>
