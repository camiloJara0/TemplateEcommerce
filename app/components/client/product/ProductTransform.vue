<script setup lang="ts">
import type { ProductTransformSection } from '~/types/store'

defineProps<{ config: ProductTransformSection }>()
</script>

<template>
  <section v-if="config.show" class="py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
      <p class="text-theme-muted mb-12">{{ config.subtext }}</p>

      <div class="grid md:grid-cols-2 gap-8 items-center">
        <!-- Before -->
        <div class="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8">
          <div class="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full mb-6">
            Antes
          </div>
          <div class="space-y-4">
            <div v-for="(item, i) in config.before" :key="i" class="flex items-center gap-3 text-left">
              <UIcon name="i-lucide-x-circle" class="size-5 text-red-400 shrink-0" />
              <div>
                <p class="font-medium text-theme">{{ item.label }}</p>
                <p class="text-sm text-theme-muted">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-theme-brand rounded-full items-center justify-center">
          <UIcon name="i-lucide-arrow-right" class="size-6 text-theme-on-brand" />
        </div>

        <!-- After -->
        <div class="bg-green-50 dark:bg-green-900/10 rounded-2xl p-8">
          <div class="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full mb-6">
            Después
          </div>
          <div class="space-y-4">
            <div v-for="(item, i) in config.after" :key="i" class="flex items-center gap-3 text-left">
              <UIcon name="i-lucide-check-circle" class="size-5 text-green-400 shrink-0" />
              <div>
                <p class="font-medium text-theme">{{ item.label }}</p>
                <p class="text-sm text-theme-muted">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
