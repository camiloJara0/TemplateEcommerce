<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()

const now = ref(Date.now())
let interval: ReturnType<typeof setInterval> | null = null

const targetDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(23, 59, 59, 0)
  return d.getTime()
})

const remaining = computed(() => {
  const diff = Math.max(0, targetDate.value - now.value)
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
})

const timeUnits = computed(() => [
  { value: remaining.value.days, label: 'Días' },
  { value: remaining.value.hours, label: 'Horas' },
  { value: remaining.value.minutes, label: 'Min' },
  { value: remaining.value.seconds, label: 'Seg' },
])

onMounted(() => {
  interval = setInterval(() => { now.value = Date.now() }, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />

    <div
      class="absolute inset-0 opacity-[0.04]"
      style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat"
    />

    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[128px]" />

    <div class="absolute top-10 right-20 size-px bg-gradient-to-b from-transparent via-primary/40 to-transparent h-40" />
    <div class="absolute bottom-20 left-16 size-px bg-gradient-to-b from-transparent via-accent/40 to-transparent h-32" />

    <div class="relative z-10 page-container w-full py-20 text-center">
      <div class="max-w-3xl mx-auto">
        <UBadge
          v-if="config.badge"
          :label="config.badge"
          color="primary"
          variant="subtle"
          class="mb-6 mx-auto animate-fade-up"
        />

        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] animate-fade-up delay-100"
        >
          {{ config.headline }}
        </h1>

        <p
          class="mt-6 text-lg sm:text-xl text-white/50 leading-relaxed max-w-xl mx-auto animate-fade-up delay-200"
        >
          {{ config.subtext }}
        </p>

        <div class="mt-14 flex justify-center gap-3 sm:gap-5 animate-fade-up delay-300">
          <div
            v-for="(unit, i) in timeUnits"
            :key="i"
            class="group relative"
          >
            <div class="relative w-20 h-24 sm:w-28 sm:h-32 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.06]">
              <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span
                class="relative text-3xl sm:text-4xl font-bold text-white tabular-nums countdown-pulse"
                :style="{ animationDelay: `${i * 0.15}s` }"
              >
                {{ String(unit.value).padStart(2, '0') }}
              </span>
              <span class="relative text-[10px] sm:text-xs text-white/40 uppercase tracking-widest mt-1">
                {{ unit.label }}
              </span>
            </div>
            <div
              v-if="i < timeUnits.length - 1"
              class="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 text-xl font-light text-white/20"
            >
              :
            </div>
          </div>
        </div>

        <div class="mt-14 flex flex-wrap justify-center items-center gap-4 animate-fade-up delay-500">
          <UButton
            :to="config.cta_primary.url"
            size="xl"
            color="primary"
            :label="config.cta_primary.label"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-full px-10"
          />
          <UButton
            v-if="config.cta_secondary"
            :to="config.cta_secondary.url"
            size="xl"
            color="neutral"
            variant="outline"
            :label="config.cta_secondary.label"
            class="rounded-full px-10 border-white/15 text-white hover:bg-white/5"
          />
        </div>

        <div
          v-if="config.show_stats"
          class="mt-16 flex flex-wrap justify-center gap-10 sm:gap-16 animate-fade-up delay-700"
        >
          <div
            v-for="(stat, i) in config.stats"
            :key="i"
            class="text-center"
          >
            <p class="text-3xl sm:text-4xl font-bold text-white">
              {{ stat.value }}
            </p>
            <p class="text-sm text-white/35 mt-1">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.countdown-pulse {
  animation: countdown-pulse 2s ease-in-out infinite;
}
</style>
