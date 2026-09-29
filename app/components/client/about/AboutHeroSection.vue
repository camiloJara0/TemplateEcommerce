<script setup lang="ts">
import type { AboutHeroSection } from '~/types/store'

const props = defineProps<{ config: AboutHeroSection }>()
</script>

<template>
  <section v-if="config.show" class="relative py-24 sm:py-32 overflow-hidden">
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{
        backgroundImage: config.background_image ? `url(${config.background_image})` : undefined,
      }"
    />
    <div
      class="absolute inset-0 bg-theme-brand"
      :style="{ opacity: config.background_image ? config.overlay_opacity : 0.9 }"
    />
    <div
      class="relative page-container text-theme-on-brand"
      :class="{
        'text-left': config.text_align === 'left',
        'text-center mx-auto': config.text_align === 'center',
        'text-right ml-auto': config.text_align === 'right',
      }"
      :style="{ maxWidth: config.text_align === 'center' ? '48rem' : undefined }"
    >
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
        {{ config.headline }}
      </h1>
      <p class="text-lg sm:text-xl opacity-80 max-w-2xl leading-relaxed" :class="{ 'mx-auto': config.text_align === 'center' }">
        {{ config.subtext }}
      </p>
    </div>
  </section>
</template>
