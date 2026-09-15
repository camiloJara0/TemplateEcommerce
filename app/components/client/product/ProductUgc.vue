<script setup lang="ts">
import type { ProductUgcSection } from '~/types/store'

defineProps<{ config: ProductUgcSection }>()
const currentIndex = ref(0)
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <div v-if="config.layout === 'carousel'" class="relative">
        <div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          <div v-for="(item, i) in config.items" :key="i" class="snap-center shrink-0 w-72">
            <div class="bg-theme-surface rounded-2xl overflow-hidden shadow-sm">
              <img v-if="item.image" :src="item.image" class="w-full h-64 object-cover" />
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-pink-400 flex items-center justify-center">
                    <span class="text-xs font-bold text-theme-on-brand">{{ item.author[0] }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-sm text-theme">{{ item.author }}</p>
                    <p class="text-xs text-theme-muted">{{ item.platform }}</p>
                  </div>
                </div>
                <p class="text-sm text-theme-secondary">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl overflow-hidden shadow-sm">
          <img v-if="item.image" :src="item.image" class="w-full h-48 object-cover" />
          <div class="p-3">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm text-theme">{{ item.author }}</span>
              <span class="text-xs text-theme-muted">{{ item.platform }}</span>
            </div>
            <p class="text-xs text-theme-muted mt-1 line-clamp-2">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
