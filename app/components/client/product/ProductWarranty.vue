<script setup lang="ts">
import type { ProductWarrantySection } from '~/types/store'

defineProps<{ config: ProductWarrantySection }>()
</script>

<template>
  <section v-if="config.show" class="py-16 bg-theme-surface rounded-xl">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-theme mb-10">{{ config.headline }}</h2>

      <div class="grid md:grid-cols-3 gap-6 mb-10">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl p-6 shadow-sm">
          <div class="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <UIcon :name="item.icon" class="size-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="font-semibold text-theme mb-2">{{ item.title }}</h3>
          <p class="text-sm text-theme-muted">{{ item.description }}</p>
        </div>
      </div>

      <UButton :label="config.cta_label" :to="config.cta_url" variant="outline" color="primary" />
    </div>
  </section>
</template>
