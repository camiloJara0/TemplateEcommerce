<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()

const scrollY = ref(0)
const sectionRef = ref<HTMLElement | null>(null)

function handleScroll() {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const bgStyle = computed(() => ({
  transform: `translateY(${scrollY.value * 0.3}px)`,
}))

const floatA = computed(() => ({
  transform: `translateY(${scrollY.value * -0.15}px) rotate(${scrollY.value * 0.02}deg)`,
}))

const floatB = computed(() => ({
  transform: `translateY(${scrollY.value * -0.1}px) rotate(${-scrollY.value * 0.015}deg)`,
}))

const floatC = computed(() => ({
  transform: `translateY(${scrollY.value * -0.2}px) translateX(${scrollY.value * 0.03}px)`,
}))

const floatD = computed(() => ({
  transform: `translateY(${scrollY.value * -0.08}px) rotate(${scrollY.value * 0.01}deg) scale(${1 + scrollY.value * 0.0002})`,
}))
</script>

<template>
  <section ref="sectionRef" class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div
      class="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center"
      :style="{
        backgroundImage: config.background_image ? `url(${config.background_image})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
        ...bgStyle,
      }"
    />

    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

    <div class="absolute inset-0 opacity-[0.025]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat" />

    <div
      class="absolute top-[15%] left-[8%] w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-[2px] floating-shape"
      :style="floatA"
    />
    <div
      class="absolute top-[25%] right-[12%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/30 floating-dot"
      :style="floatB"
    />
    <div
      class="absolute bottom-[30%] left-[15%] w-12 h-12 sm:w-16 sm:h-16 rotate-45 border border-white/[0.05] bg-white/[0.015] floating-square"
      :style="floatC"
    />
    <div
      class="absolute top-[60%] right-[20%] w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/20 blur-[1px] floating-dot"
      :style="floatD"
    />
    <div
      class="absolute top-[10%] right-[35%] w-1 h-1 rounded-full bg-white/30 floating-dot"
      :style="floatA"
    />
    <div
      class="absolute bottom-[20%] right-[8%] w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-white/[0.04] bg-gradient-to-br from-primary/5 to-accent/5 blur-[1px] floating-shape"
      :style="floatB"
    />
    <div
      class="absolute top-[45%] left-[5%] w-2 h-2 rounded-full bg-primary/40 floating-dot"
      :style="floatD"
    />

    <div class="relative z-10 page-container w-full py-20 sm:py-28 text-center">
      <div class="max-w-4xl mx-auto">
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
          class="mt-7 text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto animate-fade-up delay-200"
        >
          {{ config.subtext }}
        </p>

        <div
          class="mt-12 flex flex-wrap justify-center items-center gap-4 animate-fade-up delay-300"
        >
          <UButton
            :to="config.cta_primary.url"
            size="xl"
            color="primary"
            :label="config.cta_primary.label"
            trailing-icon="i-lucide-arrow-right"
            class="rounded-full px-8"
          />
          <UButton
            v-if="config.cta_secondary"
            :to="config.cta_secondary.url"
            size="xl"
            color="neutral"
            variant="outline"
            :label="config.cta_secondary.label"
            class="rounded-full px-8 border-white/20 text-white hover:bg-white/10"
          />
        </div>

        <div
          v-if="config.show_stats"
          class="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-up delay-500"
        >
          <div
            v-for="(stat, i) in config.stats"
            :key="i"
            class="surface p-5 sm:p-6 bg-white/[0.04] border-white/[0.08] backdrop-blur-sm text-center"
          >
            <p class="text-2xl sm:text-3xl font-bold text-white">
              {{ stat.value }}
            </p>
            <p class="text-xs text-white/40 mt-2 tracking-wide">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
}

@keyframes dot-drift {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.2); }
}

.floating-shape {
  animation: float-gentle 8s ease-in-out infinite;
}

.floating-dot {
  animation: dot-drift 5s ease-in-out infinite;
}

.floating-square {
  animation: float-slow 10s ease-in-out infinite;
}
</style>
