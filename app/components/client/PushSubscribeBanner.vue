<script setup lang="ts">
const pushSubscription = usePushSubscription()
const { permission, isSubscribed, loading } = pushSubscription

const DISMISS_KEY = 'push_banner_dismissed'
const dismissed = ref(false)

const showBanner = computed(() =>
  import.meta.client
  && !dismissed.value
  && !isSubscribed.value
  && permission.value === 'default'
  && pushSubscription.isSupported.value,
)

async function handleAccept() {
  await pushSubscription.subscribe()
  localStorage.setItem(DISMISS_KEY, '1')
  dismissed.value = true
}

function handleDismiss() {
  localStorage.setItem(DISMISS_KEY, '1')
  dismissed.value = true
}

onMounted(() => {
  if (localStorage.getItem(DISMISS_KEY)) {
    dismissed.value = true
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="showBanner"
      class="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div class="max-w-lg mx-auto surface border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl flex items-start gap-4">
        <div class="size-10 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0">
          <UIcon name="i-lucide-bell-ring" class="size-5 text-theme-brand" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-theme">¿Quieres recibir notificaciones?</p>
          <p class="text-xs text-theme-muted mt-1">
            Te avisaremos sobre pedidos, ofertas y actualizaciones importantes.
          </p>
          <div class="flex gap-2 mt-3">
            <UButton
              label="Activar"
              color="primary"
              size="xs"
              :loading="loading"
              @click="handleAccept"
            />
            <UButton
              label="Ahora no"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="handleDismiss"
            />
          </div>
        </div>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          class="shrink-0"
          aria-label="Cerrar"
          @click="handleDismiss"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
