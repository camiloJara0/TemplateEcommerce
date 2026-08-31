<script setup lang="ts">
import type { ProductFeaturesSection } from '~/types/store'

defineProps<{ config: ProductFeaturesSection }>()
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-16 bg-theme-surface">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- List layout -->
      <div v-if="config.layout === 'list'" class="space-y-6">
        <div v-for="(item, i) in config.items" :key="i" class="flex items-start gap-6 p-6 bg-theme-surface rounded-2xl shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0">
            <UIcon :name="item.icon" class="size-6 text-theme-brand" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-theme">{{ item.title }}</h3>
            <p class="text-theme-muted mt-1">{{ item.description }}</p>
          </div>
          <img v-if="item.image" :src="item.image" class="w-24 h-24 rounded-lg object-cover" />
        </div>
      </div>

      <!-- Grid layout -->
      <div v-else-if="config.layout === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(item, i) in config.items" :key="i" class="p-6 bg-theme-surface rounded-2xl shadow-sm text-center">
          <div class="w-14 h-14 rounded-xl bg-theme-imagenes flex items-center justify-center mx-auto mb-4">
            <UIcon :name="item.icon" class="size-7 text-theme-brand" />
          </div>
          <h3 class="font-semibold text-theme">{{ item.title }}</h3>
          <p class="text-sm text-theme-muted mt-2">{{ item.description }}</p>
          <img v-if="item.image" :src="item.image" class="w-full h-32 rounded-lg object-cover mt-4" />
        </div>
      </div>

      <!-- Alternating layout -->
      <div v-else class="space-y-8">
        <div v-for="(item, i) in config.items" :key="i" class="flex items-center gap-8" :class="i % 2 === 1 ? 'flex-row-reverse' : ''">
          <div class="flex-1 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-theme-imagenes flex items-center justify-center">
                <UIcon :name="item.icon" class="size-5 text-theme-brand" />
              </div>
              <h3 class="font-semibold text-lg text-theme">{{ item.title }}</h3>
            </div>
            <p class="text-theme-muted">{{ item.description }}</p>
          </div>
          <div v-if="item.image" class="flex-1">
            <img :src="item.image" class="w-full h-48 rounded-2xl object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
