<script setup lang="ts">
import type { ProductProblemSection } from '~/types/store'

defineProps<{ config: ProductProblemSection }>()
</script>

<template>
  <section v-if="config.show" class="py-16 bg-theme-surface">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-center text-theme mb-12">{{ config.headline }}</h2>

      <div class="grid md:grid-cols-2 gap-12">

        <!-- Problems -->
        <div class="space-y-6">
          <h3 class="text-xl font-bold text-red-600 dark:text-red-400">Problemas</h3>
          <div v-for="(item, i) in config.problems" :key="i"
            class="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <UIcon :name="item.icon" class="size-5 text-red-500" />
            </div>
            <div>
              <h3 class="font-semibold text-theme">{{ item.title }}</h3>
              <p class="text-sm text-theme-muted mt-1">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <!-- Solutions -->
        <div class="space-y-6">
          <h3 class="text-xl font-bold text-green-600 dark:text-green-400">{{ config.solution_headline }}</h3>
          <div v-for="(item, i) in config.solution_items" :key="i"
            class="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
            <div
              class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <UIcon :name="item.icon" class="size-5 text-green-500" />
            </div>
            <div>
              <h3 class="font-semibold text-theme">{{ item.title }}</h3>
              <p class="text-sm text-theme-muted mt-1">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
