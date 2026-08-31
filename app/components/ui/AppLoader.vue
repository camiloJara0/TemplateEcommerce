<script setup lang="ts">
import { storeToRefs } from 'pinia'

const configStore = useStoreConfigStore()
const { loadingTienda } = storeToRefs(configStore)

const show = ref(true)

onMounted(() => {
  const interval = setInterval(() => {
    if (!loadingTienda.value) {
      setTimeout(() => { show.value = false }, 600)
      clearInterval(interval)
    }
  }, 100)
})
</script>

<template>
  <Transition name="fade-out">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950">
      <!-- Animated background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 animate-float" />
        <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 animate-float-delayed" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-500/5 to-purple-500/5 animate-spin-slow" />
      </div>

      <!-- Content -->
      <div class="relative flex flex-col items-center gap-8">
        <!-- Logo / Brand -->
        <div class="relative">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-pulse-soft">
            <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <!-- Orbiting dots -->
          <div class="absolute inset-0 animate-spin" style="animation-duration: 3s;">
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary-400" />
          </div>
          <div class="absolute inset-0 animate-spin" style="animation-duration: 3s; animation-delay: -1s;">
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
          <div class="absolute inset-0 animate-spin" style="animation-duration: 3s; animation-delay: -2s;">
            <div class="absolute top-1/2 -right-2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-400" />
          </div>
        </div>

        <!-- Loading bar -->
        <div class="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full animate-loading-bar" />
        </div>

        <!-- Text -->
        <p class="text-sm text-slate-400 dark:text-slate-500 animate-pulse">
          Preparando tu tienda...
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
@keyframes float-delayed {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-5deg); }
}
@keyframes spin-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes pulse-soft {
  0%, 100% { transform: scale(1); box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25); }
  50% { transform: scale(1.05); box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.4); }
}
@keyframes loading-bar {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delayed { animation: float-delayed 6s ease-in-out infinite 1s; }
.animate-spin-slow { animation: spin-slow 20s linear infinite; }
.animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
.animate-loading-bar { animation: loading-bar 1.5s ease-in-out infinite; }

.fade-out-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-out-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
