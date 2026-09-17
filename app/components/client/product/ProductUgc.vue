<script setup lang="ts">
import type { ProductUgcSection } from '~/types/store'

defineProps<{ config: ProductUgcSection }>()

const scrollContainer = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

function onScroll() {
  if (!scrollContainer.value) return
  const el = scrollContainer.value
  const scrollLeft = el.scrollLeft
  const cardWidth = 288 + 16 // w-72 + gap-4
  currentIndex.value = Math.round(scrollLeft / cardWidth)
}

function scrollTo(index: number) {
  if (!scrollContainer.value) return
  const cardWidth = 288 + 16
  scrollContainer.value.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
}
</script>

<template>
  <section v-if="config.items.length" class="py-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- CAROUSEL variant -->
      <div v-if="config.variant === 'carousel'" class="relative">
        <div ref="scrollContainer" class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" @scroll="onScroll">
          <div v-for="(item, i) in config.items" :key="i" class="snap-center shrink-0 w-72">
            <div class="bg-theme-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div class="relative aspect-square overflow-hidden">
                <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" loading="lazy" />
                <div class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div class="absolute bottom-3 left-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
                  <p class="text-white text-sm line-clamp-2 font-medium">{{ item.text }}</p>
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-pink-400 flex items-center justify-center shrink-0">
                    <span class="text-xs font-bold text-white">{{ item.author[0] }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-sm text-theme truncate">{{ item.author }}</p>
                    <p class="text-xs text-theme-muted">{{ item.platform }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-4">
          <button v-for="(_, i) in config.items" :key="i" class="w-2 h-2 rounded-full transition-all" :class="currentIndex === i ? 'bg-theme-brand w-5' : 'bg-theme-muted/30'" @click="scrollTo(i)" />
        </div>
      </div>

      <!-- MASONRY variant -->
      <div v-else-if="config.variant === 'masonry'" class="columns-1 sm:columns-2 lg:columns-3 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="break-inside-avoid mb-4">
          <div class="bg-theme-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div v-if="item.image" class="relative overflow-hidden">
              <img :src="item.image" class="w-full object-cover" :style="{ minHeight: i % 3 === 0 ? '280px' : i % 3 === 1 ? '220px' : '260px' }" loading="lazy" />
            </div>
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-full bg-linear-to-br from-primary-400 to-pink-400 flex items-center justify-center shrink-0">
                  <span class="text-[10px] font-bold text-white">{{ item.author[0] }}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-xs text-theme truncate">{{ item.author }}</p>
                  <p class="text-[10px] text-theme-muted">{{ item.platform }}</p>
                </div>
              </div>
              <p class="text-xs text-theme-secondary line-clamp-3">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID variant (default) -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div v-if="item.image" class="aspect-square overflow-hidden">
            <img :src="item.image" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
          </div>
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1.5">
              <div class="w-6 h-6 rounded-full bg-linear-to-br from-primary-400 to-pink-400 flex items-center justify-center shrink-0">
                <span class="text-[9px] font-bold text-white">{{ item.author[0] }}</span>
              </div>
              <span class="font-medium text-xs text-theme truncate">{{ item.author }}</span>
            </div>
            <p class="text-[11px] text-theme-muted line-clamp-2">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
