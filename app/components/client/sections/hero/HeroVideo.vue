<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()

const visible = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
  if (videoRef.value) {
    videoRef.value.playbackRate = 0.6
  }
})
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
    <video
      v-if="config.background_image"
      ref="videoRef"
      :src="config.background_image"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s]"
      :class="visible ? 'scale-100' : 'scale-110'"
      autoplay
      muted
      loop
      playsinline
    />
    <div
      v-else
      class="absolute inset-0"
      style="background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)"
    />

    <div class="absolute inset-0 bg-black/50" />

    <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat" />

    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
      <div
        class="transition-all duration-1000 ease-out"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
      >
        <UBadge
          v-if="config.badge"
          :label="config.badge"
          color="primary"
          variant="subtle"
          class="mb-8 mx-auto border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm"
        />
      </div>

      <h1
        class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.95] transition-all duration-[1200ms] delay-150"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'"
      >
        {{ config.headline }}
      </h1>

      <p
        class="mt-8 text-lg sm:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-300"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        {{ config.subtext }}
      </p>

      <div
        class="mt-12 flex flex-wrap justify-center items-center gap-4 transition-all duration-1000 delay-500"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
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
        class="mt-20 transition-all duration-1000 delay-700"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="flex flex-wrap justify-center gap-10 sm:gap-16">
          <div
            v-for="(stat, i) in config.stats"
            :key="i"
            class="text-center"
          >
            <p class="text-3xl sm:text-4xl font-bold text-white">
              {{ stat.value }}
            </p>
            <p class="text-sm text-white/40 mt-2 tracking-wide uppercase">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
      <UIcon name="i-lucide-chevron-down" class="size-6 text-white/40" />
    </div>
  </section>
</template>
