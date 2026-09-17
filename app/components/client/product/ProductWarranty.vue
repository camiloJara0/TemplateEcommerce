<script setup lang="ts">
import type { ProductWarrantySection } from '~/types/store'

defineProps<{ config: ProductWarrantySection }>()
</script>

<template>
  <section class="py-16 bg-theme-surface rounded-xl">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-theme mb-10">{{ config.headline }}</h2>

      <!-- CARDS variant (default) -->
      <div v-if="config.variant === 'cards'" class="grid md:grid-cols-3 gap-6 mb-10">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl p-6 shadow-sm border border-theme hover:shadow-md hover:border-theme-brand/20 transition-all duration-300 group">
          <div class="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UIcon :name="item.icon" class="size-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="font-semibold text-theme mb-2">{{ item.title }}</h3>
          <p class="text-sm text-theme-muted">{{ item.description }}</p>
        </div>
      </div>

      <!-- ICONS variant (horizontal) -->
      <div v-else-if="config.variant === 'icons'" class="flex flex-wrap justify-center gap-8 mb-10">
        <div v-for="(item, i) in config.items" :key="i" class="flex items-center gap-4 px-6 py-4 bg-theme-alt/30 rounded-2xl">
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <UIcon :name="item.icon" class="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="text-left">
            <h3 class="font-semibold text-theme text-sm">{{ item.title }}</h3>
            <p class="text-xs text-theme-muted">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- MINIMAL variant (simple line) -->
      <div v-else class="flex flex-wrap justify-center gap-6 mb-10">
        <div v-for="(item, i) in config.items" :key="i" class="flex items-center gap-2 text-sm text-theme">
          <UIcon :name="item.icon" class="size-4 text-green-600 dark:text-green-400" />
          <span class="font-medium">{{ item.title }}</span>
        </div>
      </div>

      <UButton :label="config.cta_label" :to="config.cta_url" variant="outline" color="primary" />
    </div>
  </section>
</template>
