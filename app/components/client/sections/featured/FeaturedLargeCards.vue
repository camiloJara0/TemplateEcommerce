<script setup lang="ts">
import type { FeaturedSection } from '~/types/store'
const props = defineProps<{ config: FeaturedSection; products: any[] }>()
const emit = defineEmits<{ quickview: [product: any] }>()
</script>
<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <UButton v-if="config.show_all_link" to="/catalogo?orden=mas_vendidos" color="neutral" variant="ghost" label="Ver más" trailing-icon="i-lucide-arrow-right" />
      </div>
      <div class="grid sm:grid-cols-2 gap-6">
        <div
          v-for="p in products?.slice(0, 4)"
          :key="p.id"
          class="group surface rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
          @click="emit('quickview', p)"
        >
          <div class="aspect-16/10 bg-theme-imagenes overflow-hidden">
            <div v-if="p.images?.[0]" class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" :style="{ backgroundImage: `url(${p.images[0]})` }" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-16 text-theme-muted/40" />
            </div>
          </div>
          <div class="p-5">
            <p class="text-xs text-theme-muted mb-1">{{ p.brand?.name ?? 'Sin marca' }}</p>
            <h3 class="font-semibold text-theme text-lg mb-2">{{ p.name }}</h3>
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold text-theme-brand">${{ p.price?.toLocaleString() }}</span>
              <span v-if="p.price_discount" class="text-sm text-theme-muted line-through">${{ p.price_discount?.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
