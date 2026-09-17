<script setup lang="ts">
import type { ProductCountdownSection } from '~/types/store'

const props = defineProps<{ config: ProductCountdownSection }>()

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

function updateTimer() {
  if (!props.config.end_date) return
  const end = new Date(props.config.end_date).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)

  timeLeft.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

onMounted(() => {
  updateTimer()
  timer = setInterval(updateTimer, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const pad = (n: number) => String(n).padStart(2, '0')

const isExpired = computed(() => timeLeft.value.days === 0 && timeLeft.value.hours === 0 && timeLeft.value.minutes === 0 && timeLeft.value.seconds === 0)

const urgencyLevel = computed(() => {
  const totalSeconds = timeLeft.value.days * 86400 + timeLeft.value.hours * 3600 + timeLeft.value.minutes * 60 + timeLeft.value.seconds
  if (totalSeconds < 3600) return 'critical'
  if (totalSeconds < 86400) return 'warning'
  return 'normal'
})
</script>

<template>
  <section
    v-if="config.end_date"
    class="py-12"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <!-- MINIMAL variant -->
    <div v-if="config.variant === 'minimal'" class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-2xl font-bold mb-2">{{ config.headline }}</h2>
      <p class="text-sm opacity-70 mb-8">{{ config.subtext }}</p>

      <div class="flex justify-center items-center gap-3">
        <div class="text-center">
          <div class="w-16 h-16 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span class="text-2xl font-bold tabular-nums">{{ pad(timeLeft.days) }}</span>
          </div>
          <div class="text-[10px] opacity-60 mt-1.5 uppercase tracking-wider">Días</div>
        </div>
        <span class="text-2xl font-bold opacity-30 mt-[-16px]">:</span>
        <div class="text-center">
          <div class="w-16 h-16 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span class="text-2xl font-bold tabular-nums">{{ pad(timeLeft.hours) }}</span>
          </div>
          <div class="text-[10px] opacity-60 mt-1.5 uppercase tracking-wider">Horas</div>
        </div>
        <span class="text-2xl font-bold opacity-30 mt-[-16px]">:</span>
        <div class="text-center">
          <div class="w-16 h-16 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span class="text-2xl font-bold tabular-nums">{{ pad(timeLeft.minutes) }}</span>
          </div>
          <div class="text-[10px] opacity-60 mt-1.5 uppercase tracking-wider">Min</div>
        </div>
        <span class="text-2xl font-bold opacity-30 mt-[-16px]">:</span>
        <div class="text-center">
          <div class="w-16 h-16 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <span class="text-2xl font-bold tabular-nums">{{ pad(timeLeft.seconds) }}</span>
          </div>
          <div class="text-[10px] opacity-60 mt-1.5 uppercase tracking-wider">Seg</div>
        </div>
      </div>
    </div>

    <!-- URGENT variant -->
    <div v-else-if="config.variant === 'urgent'" class="max-w-4xl mx-auto px-6">
      <div class="relative overflow-hidden rounded-2xl p-8 text-center" :class="urgencyLevel === 'critical' ? 'animate-pulse bg-red-500/20' : urgencyLevel === 'warning' ? 'bg-amber-500/20' : ''">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,currentColor_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" :class="urgencyLevel === 'critical' ? 'bg-red-500/30 text-red-100' : urgencyLevel === 'warning' ? 'bg-amber-500/30 text-amber-100' : 'bg-white/20'">
            <UIcon :name="urgencyLevel === 'critical' ? 'i-lucide-zap' : 'i-lucide-clock'" class="size-4" />
            <span class="text-sm font-bold uppercase tracking-wider">
              {{ urgencyLevel === 'critical' ? '¡Últimas horas!' : urgencyLevel === 'warning' ? '¡Tiempo limitado!' : config.headline }}
            </span>
          </div>

          <div v-if="urgencyLevel === 'critical'" class="flex justify-center items-center gap-2 mb-4">
            <div class="w-20 h-20 rounded-2xl bg-red-500/40 flex items-center justify-center border border-red-400/50">
              <span class="text-4xl font-bold tabular-nums">{{ pad(timeLeft.hours) }}</span>
            </div>
            <span class="text-3xl font-bold text-red-300">:</span>
            <div class="w-20 h-20 rounded-2xl bg-red-500/40 flex items-center justify-center border border-red-400/50">
              <span class="text-4xl font-bold tabular-nums">{{ pad(timeLeft.minutes) }}</span>
            </div>
            <span class="text-3xl font-bold text-red-300">:</span>
            <div class="w-20 h-20 rounded-2xl bg-red-500/40 flex items-center justify-center border border-red-400/50">
              <span class="text-4xl font-bold tabular-nums">{{ pad(timeLeft.seconds) }}</span>
            </div>
          </div>

          <div v-else class="flex justify-center items-center gap-4 mb-4">
            <div v-for="(unit, label) in { Días: timeLeft.days, Horas: timeLeft.hours, Min: timeLeft.minutes, Seg: timeLeft.seconds }" :key="label" class="text-center">
              <div class="w-16 h-16 rounded-xl bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <span class="text-2xl font-bold tabular-nums">{{ pad(unit) }}</span>
              </div>
              <div class="text-[10px] opacity-60 mt-1 uppercase tracking-wider">{{ label }}</div>
            </div>
          </div>

          <p v-if="config.subtext" class="text-sm opacity-80">{{ config.subtext }}</p>
        </div>
      </div>
    </div>

    <!-- ELEGANT variant (default) -->
    <div v-else class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-2">{{ config.headline }}</h2>
      <p class="text-lg opacity-80 mb-8">{{ config.subtext }}</p>

      <div class="flex justify-center items-center gap-4">
        <div class="text-center">
          <div class="w-24 h-24 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-inner">
            <div>
              <div class="text-4xl font-bold tabular-nums leading-none">{{ pad(timeLeft.days) }}</div>
              <div class="text-[10px] opacity-50 mt-1 uppercase tracking-widest">Días</div>
            </div>
          </div>
        </div>
        <span class="text-4xl font-light opacity-20 mt-[-20px]">:</span>
        <div class="text-center">
          <div class="w-24 h-24 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-inner">
            <div>
              <div class="text-4xl font-bold tabular-nums leading-none">{{ pad(timeLeft.hours) }}</div>
              <div class="text-[10px] opacity-50 mt-1 uppercase tracking-widest">Horas</div>
            </div>
          </div>
        </div>
        <span class="text-4xl font-light opacity-20 mt-[-20px]">:</span>
        <div class="text-center">
          <div class="w-24 h-24 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-inner">
            <div>
              <div class="text-4xl font-bold tabular-nums leading-none">{{ pad(timeLeft.minutes) }}</div>
              <div class="text-[10px] opacity-50 mt-1 uppercase tracking-widest">Min</div>
            </div>
          </div>
        </div>
        <span class="text-4xl font-light opacity-20 mt-[-20px]">:</span>
        <div class="text-center">
          <div class="w-24 h-24 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-inner">
            <div>
              <div class="text-4xl font-bold tabular-nums leading-none">{{ pad(timeLeft.seconds) }}</div>
              <div class="text-[10px] opacity-50 mt-1 uppercase tracking-widest">Seg</div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="isExpired" class="mt-6 text-sm font-semibold opacity-90">¡La oferta ha expirado!</p>
    </div>
  </section>
</template>
