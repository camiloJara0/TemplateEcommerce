<script setup lang="ts">
definePageMeta({ layout: 'client', middleware: ['auth'] })

const notificationStore = useNotificationStore()
const { items, loading } = storeToRefs(notificationStore)
const { relative } = useFormat()

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
}

onMounted(() => {
  notificationStore.load(true)
})

useSeoMeta({ title: 'Notificaciones' })
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notificaciones</h1>
          <p class="page-subtitle">Historial de tus notificaciones</p>
        </div>
      </div>

      <FeedbackSkeletonLoader v-if="loading && !items.length" variant="list" :count="5" />

      <div v-else-if="!items.length" class="surface p-12 text-center">
        <UIcon name="i-lucide-bell-off" class="size-12 text-theme-muted mx-auto mb-3" />
        <p class="text-theme-muted">No tienes notificaciones</p>
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="n in items"
          :key="n.id"
          class="w-full flex items-start gap-4 p-4 surface rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          :class="{ 'opacity-50': n.read_at }"
          @click="handleClick(n)"
        >
          <div class="size-10 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0">
            <UIcon :name="getIcon(n.type)" class="size-5 text-theme-brand" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-theme">{{ n.title }}</p>
            <p v-if="n.body" class="text-sm text-theme-muted mt-1">{{ n.body }}</p>
            <p v-if="n.created_at" class="text-xs text-theme-muted mt-2">{{ relative(n.created_at) }}</p>
          </div>
          <div v-if="!n.read_at" class="size-2.5 rounded-full bg-theme-brand shrink-0 mt-1.5" />
        </button>
      </div>
    </div>
  </div>
</template>
