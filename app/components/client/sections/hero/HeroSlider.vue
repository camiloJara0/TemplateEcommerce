<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()

const currentSlide = ref(0)
const isTransitioning = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

const slides = computed(() => [
  {
    headline: props.config.headline,
    subtext: props.config.subtext,
    image: props.config.background_image,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
  },
  {
    headline: 'Descubre lo extraordinario',
    subtext: 'Cada producto cuenta una historia. Encuentra la tuya en nuestra colección curada.',
    image: props.config.background_image,
    gradient: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #292524 100%)',
  },
  {
    headline: 'Calidad que se siente',
    subtext: 'Materiales premium, diseño innovador y una experiencia que supera expectativas.',
    image: props.config.background_image,
    gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 50%, #059669 100%)',
  },
])

function goToSlide(index: number) {
  if (isTransitioning.value || index === currentSlide.value) return
  isTransitioning.value = true
  currentSlide.value = index
  setTimeout(() => { isTransitioning.value = false }, 800)
}

function nextSlide() {
  goToSlide((currentSlide.value + 1) % slides.value.length)
}

onMounted(() => {
  interval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <section class="relative min-h-[85vh] flex items-center overflow-hidden">
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
      :class="i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'"
    >
      <div
        v-if="slide.image"
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${slide.image})` }"
      />
      <div v-else class="absolute inset-0" :style="{ background: slide.gradient }" />
      <div class="absolute inset-0 bg-black/40" />
    </div>

    <div class="absolute inset-0 z-20 opacity-[0.02]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat" />

    <div class="relative z-30 page-container w-full py-20 sm:py-28">
      <div class="max-w-3xl">
        <Transition
          enter-active-class="transition-all duration-700 ease-out"
          enter-from-class="opacity-0 translate-y-6"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-500 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
          mode="out-in"
        >
          <div :key="currentSlide">
            <UBadge
              v-if="config.badge"
              :label="config.badge"
              color="primary"
              variant="subtle"
              class="mb-6"
            />
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              {{ slides[currentSlide]?.headline }}
            </h1>
            <p class="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
              {{ slides[currentSlide]?.subtext }}
            </p>
            <div class="mt-10 flex flex-wrap items-center gap-4">
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
          </div>
        </Transition>

        <div v-if="config.show_stats" class="mt-16 flex flex-wrap gap-8 sm:gap-14">
          <div
            v-for="(stat, i) in config.stats"
            :key="i"
            class="text-center"
          >
            <p class="text-3xl sm:text-4xl font-bold text-white">
              {{ stat.value }}
            </p>
            <p class="text-sm text-white/50 mt-1">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="group relative h-2 rounded-full transition-all duration-500"
        :class="i === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'"
        @click="goToSlide(i)"
      >
        <span
          v-if="i === currentSlide"
          class="absolute inset-0 rounded-full bg-white/20"
          style="animation: pulse-ring 2s ease-in-out infinite"
        />
      </button>
    </div>
  </section>
</template>

<style scoped>
@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0; }
}
</style>
