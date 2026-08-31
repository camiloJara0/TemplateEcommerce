<script setup lang="ts">
const collapsed = ref(false)
const mobileOpen = ref(false)
const route = useRoute()

const title = computed(() => {
  const map: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/pedidos': 'Pedidos',
    '/admin/usuarios': 'Usuarios',
    '/admin/productos': 'Productos',
    '/admin/categorias': 'Categorías',
    '/admin/inventario': 'Inventario',
    '/admin/pagos': 'Pagos',
    '/admin/envios': 'Envíos',
    '/admin/reportes': 'Reportes',
    '/admin/tienda': 'Editor de tienda',
    '/admin/configuracion': 'Configuración'
  }
  return map[route.path] || 'Admin'
})

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="admin-scope min-h-dvh flex bg-slate-50 dark:bg-slate-950">
    <!-- Desktop sidebar -->
    <div class="hidden lg:flex shrink-0 sticky top-0 h-dvh">
      <NavigationAdminSidebar v-model:collapsed="collapsed" />
    </div>

    <!-- Mobile sidebar -->
    <USlideover
      v-model:open="mobileOpen"
      side="left"
      :ui="{ content: 'w-72 p-0' }"
    >
      <template #content>
        <NavigationAdminSidebar
          :collapsed="false"
          class="h-full border-0"
        />
      </template>
    </USlideover>

    <div class="flex-1 flex flex-col min-w-0">
      <NavigationAdminNavbar
        :title="title"
        @toggle-mobile="mobileOpen = true"
      />

      <main class="flex-1 admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>
