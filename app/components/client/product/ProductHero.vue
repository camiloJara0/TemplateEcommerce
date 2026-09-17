<script setup lang="ts">
import type { ProductHeroSection } from '~/types/store'

defineProps<{ config: ProductHeroSection }>()
</script>

<template>
  <section class="mb-8">
    <!-- Breadcrumbs -->
    <div v-if="config.show_breadcrumbs" class="flex items-center gap-2 text-sm text-theme-muted mb-6">
      <NuxtLink to="/" class="hover:text-theme-brand">Inicio</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <NuxtLink to="/catalogo" class="hover:text-theme-brand">Catálogo</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <span class="text-theme">Producto</span>
    </div>

    <!-- Gallery + Info layout handled by product page -->
    <slot />
  </section>
</template>
