<script setup lang="ts">
import type { ProductGallerySection } from '~/types/store'

defineProps<{ config: ProductGallerySection }>()

const images = defineModel<string[]>('images', { default: () => [] })
const activeIndex = ref(0)
</script>

<template>
  <section v-if="config.show" class="py-8">
    <div
      :class="{
        'grid gap-4': config.style === 'grid',
        'grid gap-4': config.style === 'masonry',
        'flex gap-4 overflow-x-auto': config.style === 'carousel',
      }"
      :style="config.style !== 'carousel' ? { gridTemplateColumns: `repeat(${config.columns}, 1fr)` } : {}"
    >
      <div
        v-for="(img, i) in images"
        :key="i"
        class="relative rounded-xl overflow-hidden cursor-pointer group"
        :class="{ 'ring-2 ring-theme-brand': activeIndex === i }"
        @click="activeIndex = i"
      >
        <img :src="img" class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
        <div v-if="config.enable_zoom" class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <UIcon name="i-lucide-zoom-in" class="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>

    <!-- Thumbnails -->
    <div v-if="config.show_thumbnails && images.length > 1" class="flex gap-2 mt-4">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
        :class="activeIndex === i ? 'border-theme-brand' : 'border-transparent'"
        @click="activeIndex = i"
      >
        <img :src="img" class="w-full h-full object-cover" />
      </button>
    </div>
  </section>
</template>
