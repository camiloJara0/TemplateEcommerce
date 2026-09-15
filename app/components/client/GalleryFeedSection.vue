<script setup lang="ts">
import type { GalleryFeedSection } from '~/types/store'

const props = defineProps<{ config: GalleryFeedSection }>()
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-14 sm:py-20">
    <div class="page-container">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.title }}</h2>
        <p v-if="config.subtitle" class="text-theme-muted">{{ config.subtitle }}</p>
      </div>
      <div
        class="grid gap-3"
        :class="{
          'grid-cols-2': config.layout === 'grid-2',
          'grid-cols-2 sm:grid-cols-3': config.layout === 'grid-3' || config.layout === 'masonry',
          'grid-cols-2 sm:grid-cols-4': config.layout === 'grid-4',
        }"
      >
        <a
          v-for="(item, i) in config.items"
          :key="i"
          :href="item.url || '#'"
          class="group relative aspect-square overflow-hidden rounded-xl"
        >
          <img
            :src="item.image"
            :alt="item.caption || ''"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div v-if="item.caption" class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
            <p class="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              {{ item.caption }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
