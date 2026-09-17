<script setup lang="ts">
import type { ProductBenefitsSection } from '~/types/store'

defineProps<{ config: ProductBenefitsSection }>()
</script>

<template>
  <section v-if="config.items.length" class="py-12 border-t border-theme">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-theme">{{ config.title }}</h2>
      <p class="mt-1 text-theme-muted">{{ config.subtitle }}</p>
    </div>

    <div
      :class="config.variant !== 'horizontal' ? 'space-y-4' : 'grid grid-cols-2 md:grid-cols-3 gap-6'"
    >
      <div
        v-for="(item, i) in config.items"
        :key="i"
        class="flex items-center justify-center gap-4 p-4 rounded-xl bg-theme-surface"
        :class="config.variant === 'vertical' ? 'flex-row' : 'flex-col text-center'"
      >
        <div class="w-12 h-12 rounded-full bg-theme-imagenes flex items-center justify-center shrink-0">
          <UIcon :name="item.icon" class="size-6" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'" />
        </div>
        <div>
          <h3 class="font-semibold text-theme">{{ item.title }}</h3>
          <p class="text-sm text-theme-muted mt-1">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
