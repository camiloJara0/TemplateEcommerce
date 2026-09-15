<script setup lang="ts">
defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  toggleMobile: []
}>()

const searchOpen = ref(false)
const authStore = useAuthStore()
const { initials } = useFormat()

const userMenu = [
  [
    { label: 'Mi perfil', icon: 'i-lucide-user', to: '/admin/perfil' },
    { label: 'Configuración', icon: 'i-lucide-settings', to: '/admin/configuracion' }
  ],
  [
    { label: 'Ver tienda', icon: 'i-lucide-store', to: '/' },
    { label: 'Cerrar sesión', icon: 'i-lucide-log-out', color: 'error' as const, onSelect: authStore.logout }
  ]
]
</script>

<template>
  <header class="sticky top-0 z-30 h-16 glass border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3 px-4 sm:px-6">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="ghost"
      size="sm"
      class="lg:hidden rounded-xl"
      aria-label="Abrir menú"
      @click="emit('toggleMobile')"
    />

    <div class="hidden sm:block min-w-0">
      <h1
        v-if="title"
        class="text-sm font-semibold text-slate-900 dark:text-white truncate"
      >
        {{ title }}
      </h1>
    </div>

    <div class="flex-1 max-w-md mx-auto hidden md:block">
      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="outline"
        block
        class="justify-start text-slate-400 font-normal rounded-xl"
        label="Buscar pedidos, productos…"
        @click="searchOpen = true"
      >
        <template #trailing>
          <kbd class="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </template>
      </UButton>
    </div>

    <div class="flex items-center gap-1 sm:gap-2 ml-auto">
      <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        size="sm"
        class="md:hidden rounded-xl"
        aria-label="Buscar"
        @click="searchOpen = true"
      />

      <NavigationThemeToggle />

      <NavigationNotificationDropdown />

      <UDropdownMenu :items="userMenu">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
          aria-label="Menú de usuario"
        >
          <UAvatar
            :alt="'Admin'"
            :text="initials('Admin Store')"
            size="sm"
            class="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
          />
          <span class="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
            Admin
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 text-slate-400 hidden sm:block"
          />
        </button>
      </UDropdownMenu>
    </div>

    <UModal v-model:open="searchOpen">
      <template #content>
        <div class="p-2">
          <UInput
            autofocus
            icon="i-lucide-search"
            placeholder="Buscar en el panel…"
            size="lg"
            class="w-full"
          />
          <p class="px-3 py-6 text-center text-sm text-slate-400">
            Escribe para buscar pedidos, productos o clientes
          </p>
        </div>
      </template>
    </UModal>
  </header>
</template>
