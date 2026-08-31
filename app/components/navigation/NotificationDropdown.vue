<script setup lang="ts">
const props = withDefaults(defineProps<{
  placement?: string
}>(), { placement: 'bottom-end' })

const notificationStore = useNotificationStore()
const { items, unreadCount, loading } = storeToRefs(notificationStore)
const { relative } = useFormat()

const open = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const typeIcons: Record<string, string> = {
  registro: 'i-lucide-user-plus',
  pedido_creado: 'i-lucide-shopping-bag',
  pedido_enviado: 'i-lucide-truck',
  recuperacion: 'i-lucide-key',
  alerta_stock: 'i-lucide-alert-triangle',
}

function getIcon(type?: string) {
  return typeIcons[type || ''] || 'i-lucide-bell'
}

function handleClick(n: typeof items.value[number]) {
  if (!n.read_at) {
    notificationStore.markRead(n.id)
  }
  if (n.data && typeof n.data === 'object' && 'url' in n.data) {
    navigateTo(n.data.url as string)
  }
  open.value = false
}

function markAllRead() {
  for (const n of items.value) {
    if (!n.read_at) {
      notificationStore.markRead(n.id)
    }
  }
}

onMounted(() => {
  notificationStore.load()
  pollTimer = setInterval(() => notificationStore.load(true), 60_000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <UPopover v-model:open="open" :placement="placement as any" :ui="{ content: 'w-80 p-0' }">
    <UButton
      icon="i-lucide-bell"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-xl relative"
      aria-label="Notificaciones"
    >
      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950"
      />
    </UButton>

    <template #content>
      <div class="flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-theme">Notificaciones</h3>
            <UBadge
              v-if="unreadCount > 0"
              :label="String(unreadCount)"
              color="error"
              variant="subtle"
              size="xs"
            />
          </div>
          <UButton
            v-if="unreadCount > 0"
            label="Leer todo"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="markAllRead"
          />
        </div>

        <!-- Body -->
        <div class="max-h-80 overflow-y-auto">
          <FeedbackSkeletonLoader v-if="loading && !items.length" variant="list" :count="3" />

          <div v-else-if="!items.length" class="py-8 text-center">
            <UIcon name="i-lucide-bell-off" class="size-8 text-theme-muted mx-auto mb-2" />
            <p class="text-sm text-theme-muted">No tienes notificaciones</p>
          </div>

          <div v-else>
            <button
              v-for="n in items"
              :key="n.id"
              class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
              :class="{ 'opacity-50': n.read_at }"
              @click="handleClick(n)"
            >
              <div class="size-8 rounded-lg bg-theme-imagenes flex items-center justify-center shrink-0 mt-0.5">
                <UIcon :name="getIcon(n.type)" class="size-4 text-theme-brand" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-theme truncate">{{ n.title }}</p>
                <p v-if="n.body" class="text-xs text-theme-muted mt-0.5 line-clamp-2">{{ n.body }}</p>
                <p v-if="n.created_at" class="text-xs text-theme-muted mt-1">{{ relative(n.created_at) }}</p>
              </div>
              <div v-if="!n.read_at" class="size-2 rounded-full bg-theme-brand shrink-0 mt-2" />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
          <NuxtLink
            to="/cuenta/notificaciones"
            class="text-xs font-medium text-theme-brand hover:text-theme-brand-hover transition-colors"
            @click="open = false"
          >
            Ver todas las notificaciones
          </NuxtLink>
        </div>
      </div>
    </template>
  </UPopover>
</template>
