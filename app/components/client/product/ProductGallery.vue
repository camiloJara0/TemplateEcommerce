<script setup lang="ts">
import type { ProductGallerySection } from '~/types/store'

const props = defineProps<{ config: ProductGallerySection }>()

const images = defineModel<string[]>('images', { default: () => [] })
const activeIndex = ref(0)
const isZoomed = ref(false)
const zoomX = ref(50)
const zoomY = ref(50)

function onMouseMove(e: MouseEvent) {
  if (!isZoomed.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomX.value = ((e.clientX - rect.left) / rect.width) * 100
  zoomY.value = ((e.clientY - rect.top) / rect.height) * 100
}

function selectImage(i: number) {
  activeIndex.value = i
  isZoomed.value = false
}
</script>

<template>
  <section v-if="images.length" class="py-8">
    <!-- GRID variant -->
    <div v-if="config.variant === 'grid'">
      <div
        class="grid gap-3"
        :style="{ gridTemplateColumns: `repeat(${config.columns}, 1fr)` }"
      >
        <div
          v-for="(img, i) in images"
          :key="i"
          class="relative rounded-xl overflow-hidden cursor-pointer group aspect-square"
          :class="{ 'ring-2 ring-theme-brand ring-offset-2 ring-offset-white dark:ring-offset-slate-950': activeIndex === i }"
          @click="selectImage(i)"
        >
          <img :src="img" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div v-if="config.enable_zoom" class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <UIcon name="i-lucide-zoom-in" class="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </div>

    <!-- MASONRY variant -->
    <div v-else-if="config.variant === 'masonry'" class="columns-1 sm:columns-2 lg:columns-3 gap-3">
      <div
        v-for="(img, i) in images"
        :key="i"
        class="break-inside-avoid mb-3 relative rounded-xl overflow-hidden cursor-pointer group"
        :class="{ 'ring-2 ring-theme-brand': activeIndex === i }"
        @click="selectImage(i)"
      >
        <img :src="img" class="w-full object-cover transition-transform duration-500 group-hover:scale-105" :style="{ minHeight: i % 3 === 0 ? '280px' : i % 3 === 1 ? '200px' : '240px' }" />
      </div>
    </div>

    <!-- CAROUSEL variant -->
    <div v-else-if="config.variant === 'carousel'" class="relative">
      <div class="overflow-hidden rounded-2xl">
        <div class="flex transition-transform duration-500 ease-out" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
          <div v-for="(img, i) in images" :key="i" class="w-full shrink-0">
            <div
              class="relative aspect-[4/3] overflow-hidden cursor-zoom-in"
              @click="config.enable_zoom && (isZoomed = !isZoomed)"
              @mousemove="onMouseMove"
              @mouseleave="isZoomed = false"
            >
              <img
                :src="img"
                class="w-full h-full object-cover transition-transform duration-300"
                :style="isZoomed ? { transform: 'scale(2)', transformOrigin: `${zoomX}% ${zoomY}%` } : {}"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Nav arrows -->
      <button v-if="images.length > 1" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110" @click="selectImage((activeIndex - 1 + images.length) % images.length)">
        <UIcon name="i-lucide-chevron-left" class="size-5" />
      </button>
      <button v-if="images.length > 1" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110" @click="selectImage((activeIndex + 1) % images.length)">
        <UIcon name="i-lucide-chevron-right" class="size-5" />
      </button>
      <!-- Dots -->
      <div v-if="images.length > 1 && images.length <= 8" class="flex justify-center gap-2 mt-4">
        <button v-for="(_, i) in images" :key="i" class="w-2 h-2 rounded-full transition-all duration-300" :class="activeIndex === i ? 'bg-theme-brand w-6' : 'bg-slate-300 dark:bg-slate-600'" @click="selectImage(i)" />
      </div>
    </div>

    <!-- SPOTLIGHT variant (Apple-style) -->
    <div v-else-if="config.variant === 'spotlight'" class="space-y-4">
      <!-- Main image with zoom -->
      <div
        class="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in aspect-square"
        @click="config.enable_zoom && (isZoomed = !isZoomed)"
        @mousemove="onMouseMove"
        @mouseleave="isZoomed = false"
      >
        <img
          :src="images[activeIndex]"
          class="w-full h-full object-contain transition-transform duration-300"
          :style="isZoomed ? { transform: 'scale(2.5)', transformOrigin: `${zoomX}% ${zoomY}%` } : { transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }"
        />
        <div v-if="config.enable_zoom && !isZoomed" class="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <UIcon name="i-lucide-zoom-in" class="size-3.5" />
          <span>Click para ampliar</span>
        </div>
      </div>
      <!-- Thumbnails -->
      <div v-if="config.show_thumbnails && images.length > 1" class="flex gap-2 justify-center">
        <button
          v-for="(img, i) in images"
          :key="i"
          class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200"
          :class="activeIndex === i ? 'border-theme-brand shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'"
          @click="selectImage(i)"
        >
          <img :src="img" class="w-full h-full object-cover" />
        </button>
      </div>
    </div>

    <!-- Thumbnails (for grid/masonry) -->
    <div v-if="config.show_thumbnails && config.variant !== 'spotlight' && config.variant !== 'carousel' && images.length > 1" class="flex gap-2 mt-4 justify-center">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200"
        :class="activeIndex === i ? 'border-theme-brand shadow-sm scale-105' : 'border-transparent opacity-50 hover:opacity-100'"
        @click="selectImage(i)"
      >
        <img :src="img" class="w-full h-full object-cover" />
      </button>
    </div>
  </section>
</template>
