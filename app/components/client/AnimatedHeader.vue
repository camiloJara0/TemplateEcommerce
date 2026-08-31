<script setup lang="ts">
import type { HeaderSection } from '~/types/store'

const props = defineProps<{ config: HeaderSection }>()

const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <section
    v-if="config.show"
    class="relative overflow-hidden flex items-center justify-center"
    :style="{ height: config.height }"
  >
    <!-- Background image -->
    <div
      v-if="config.background_image"
      class="absolute inset-0 bg-cover bg-center transition-transform duration-[2s]"
      :class="visible ? 'scale-100' : 'scale-110'"
      :style="{ backgroundImage: `url(${config.background_image})` }"
    />
    <div v-else class="absolute inset-0 bg-theme-brand" />

    <!-- Overlay -->
    <div
      class="absolute inset-0 transition-opacity duration-1000"
      :style="{ backgroundColor: config.overlay_color, opacity: config.overlay_opacity }"
    />

    <!-- Content -->
    <div
      class="relative z-10 max-w-4xl mx-auto px-6 text-center"
      :class="[
        config.animation === 'fade' ? 'transition-all duration-1000' : '',
        config.animation === 'slide-up' ? 'transition-all duration-1000' : '',
        config.animation === 'zoom' ? 'transition-all duration-1000' : '',
      ]"
      :style="{ textAlign: config.text_align }"
    >
      <h1
        class="text-4xl md:text-6xl font-bold text-theme-on-brand mb-6 transition-all duration-700"
        :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        {{ config.headline }}
      </h1>

      <p
        class="text-lg md:text-xl text-white/80 mb-10 max-w-2xl transition-all duration-700 delay-200"
        :class="[
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          config.text_align === 'center' ? 'mx-auto' : '',
        ]"
      >
        {{ config.subtext }}
      </p>

      <div
        class="flex gap-4 transition-all duration-700 delay-400"
        :class="[
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          config.text_align === 'center' ? 'justify-center' : '',
          config.text_align === 'right' ? 'justify-end' : '',
        ]"
      >
        <UButton
          :label="config.cta_primary.label"
          :to="config.cta_primary.url"
          size="lg"
          color="primary"
          variant="solid"
          class="font-semibold"
        />
        <UButton
          v-if="config.cta_secondary"
          :label="config.cta_secondary.label"
          :to="config.cta_secondary.url"
          size="lg"
          color="neutral"
          variant="outline"
          class="font-semibold"
        />
      </div>
    </div>
  </section>
</template>
