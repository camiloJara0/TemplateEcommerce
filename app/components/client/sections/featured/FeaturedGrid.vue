<script setup lang="ts">
import type { FeaturedSection } from '~/types/store'

const props = defineProps<{ config: FeaturedSection; products: any[] }>()

const emit = defineEmits<{ quickview: [product: any] }>()
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <UButton
          v-if="config.show_all_link"
          to="/catalogo?orden=mas_vendidos"
          color="neutral"
          variant="ghost"
          label="Ver más"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>
      <EcommerceProductGrid :products="products" @quickview="emit('quickview', $event)" />
    </div>
  </section>
</template>
