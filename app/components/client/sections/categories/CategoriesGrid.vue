<script setup lang="ts">
import type { CategoriesHomeSection } from '~/types/store'

const props = defineProps<{ config: CategoriesHomeSection }>()

const gridClass = computed(() => {
  const map: Record<string, string> = {
    'grid-2': 'grid-cols-1 sm:grid-cols-2',
    'grid-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid-cols-2 lg:grid-cols-4',
  }
  return map[props.config.layout] ?? map['grid-3']
})
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>
      <div class="grid gap-4 sm:gap-6" :class="gridClass">
        <NuxtLink
          v-for="cat in config.items"
          :key="cat.name"
          :to="cat.url"
          class="group relative overflow-hidden rounded-2xl cursor-pointer"
          :style="{ height: config.card_height }"
        >
          <div
            v-if="cat.image"
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            :style="{ backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
          />
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-theme-brand/20 to-theme-accent/10 transition-transform duration-500 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 transition-opacity duration-300"
            :style="{ backgroundColor: '#000', opacity: cat.overlay_opacity }"
          />
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h3 class="text-xl sm:text-2xl font-semibold transition-transform duration-300 group-hover:-translate-y-1" :style="{ color: cat.text_color }">
              {{ cat.name }}
            </h3>
            <p class="text-sm mt-1 opacity-80 transition-transform duration-300 group-hover:-translate-y-1" :style="{ color: cat.text_color }">
              {{ cat.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
