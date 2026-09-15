<script setup lang="ts">
import type { ProductTestimonialsSection } from '~/types/store'

defineProps<{ config: ProductTestimonialsSection }>()

const currentIndex = ref(0)

function next() {
  const config = useAttrs() as unknown as ProductTestimonialsSection
  currentIndex.value = (currentIndex.value + 1) % (config?.items?.length ?? 1)
}
function prev() {
  const config = useAttrs() as unknown as ProductTestimonialsSection
  currentIndex.value = (currentIndex.value - 1 + (config?.items?.length ?? 1)) % (config?.items?.length ?? 1)
}
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-16 bg-theme-surface rounded-xl">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- Carousel -->
      <div v-if="config.layout === 'carousel'" class="relative">
        <div class="overflow-hidden">
          <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="(item, i) in config.items" :key="i" class="w-full shrink-0 px-4">
              <div class="bg-theme-surface rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
                <div class="flex items-center gap-1 mb-4">
                  <UIcon v-for="s in 5" :key="s" :name="s <= item.rating ? 'i-lucide-star' : 'i-lucide-star'" class="size-5" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
                </div>
                <p class="text-lg text-theme italic mb-6">"{{ item.text }}"</p>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-theme-imagenes flex items-center justify-center">
                    <span class="font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-theme">{{ item.name }}</p>
                    <p class="text-sm text-theme-muted">{{ item.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-surface rounded-full shadow-lg flex items-center justify-center" @click="prev">
          <UIcon name="i-lucide-chevron-left" class="size-5" />
        </button>
        <button class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-surface rounded-full shadow-lg flex items-center justify-center" @click="next">
          <UIcon name="i-lucide-chevron-right" class="size-5" />
        </button>
      </div>

      <!-- Grid -->
      <div v-else-if="config.layout === 'grid'" class="grid md:grid-cols-3 gap-6">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-1 mb-3">
            <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
          </div>
          <p class="text-theme italic mb-4">"{{ item.text }}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-theme-imagenes flex items-center justify-center">
              <span class="text-xs font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
            </div>
            <div>
              <p class="font-medium text-sm text-theme">{{ item.name }}</p>
              <p class="text-xs text-theme-muted">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Masonry -->
      <div v-else class="columns-1 md:columns-2 lg:columns-3 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="break-inside-avoid mb-4 bg-theme-surface rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-1 mb-3">
            <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
          </div>
          <p class="text-theme italic mb-4">"{{ item.text }}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-theme-imagenes flex items-center justify-center">
              <span class="text-xs font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
            </div>
            <div>
              <p class="font-medium text-sm text-theme">{{ item.name }}</p>
              <p class="text-xs text-theme-muted">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
