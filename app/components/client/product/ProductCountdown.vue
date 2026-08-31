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
</script>

<template>
  <section
    v-if="config.show"
    class="py-12 rounded-xl"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-2">{{ config.headline }}</h2>
      <p class="text-lg opacity-80 mb-8">{{ config.subtext }}</p>

      <div class="flex justify-center gap-4">
        <div class="text-center">
          <div class="text-5xl font-bold tabular-nums">{{ pad(timeLeft.days) }}</div>
          <div class="text-sm opacity-70 mt-1">Días</div>
        </div>
        <span class="text-4xl font-bold opacity-50">:</span>
        <div class="text-center">
          <div class="text-5xl font-bold tabular-nums">{{ pad(timeLeft.hours) }}</div>
          <div class="text-sm opacity-70 mt-1">Horas</div>
        </div>
        <span class="text-4xl font-bold opacity-50">:</span>
        <div class="text-center">
          <div class="text-5xl font-bold tabular-nums">{{ pad(timeLeft.minutes) }}</div>
          <div class="text-sm opacity-70 mt-1">Min</div>
        </div>
        <span class="text-4xl font-bold opacity-50">:</span>
        <div class="text-center">
          <div class="text-5xl font-bold tabular-nums">{{ pad(timeLeft.seconds) }}</div>
          <div class="text-sm opacity-70 mt-1">Seg</div>
        </div>
      </div>
    </div>
  </section>
</template>
