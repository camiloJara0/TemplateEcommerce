<script setup lang="ts">
import type { BrandLogosSection } from '~/types/store'

const props = defineProps<{ config: BrandLogosSection }>()
</script>

<template>
  <section v-if="config.show" class="py-12 sm:py-16">
    <div class="page-container">
      <p v-if="config.title" class="text-center text-sm text-theme-muted mb-8 uppercase tracking-wider font-medium">
        {{ config.title }}
      </p>
      <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        <div
          v-for="(brand, i) in config.items"
          :key="i"
          class="flex items-center gap-2 transition-all duration-300"
          :class="[
            config.style === 'grayscale' ? 'opacity-50 hover:opacity-100 hover:grayscale-0 grayscale' : '',
            config.style === 'minimal' ? 'opacity-40 hover:opacity-80' : '',
          ]"
        >
          <img
            v-if="brand.logo"
            :src="brand.logo"
            :alt="brand.name"
            class="h-8 sm:h-10 object-contain"
          />
          <span v-else class="text-lg sm:text-xl font-bold text-theme-muted">{{ brand.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
