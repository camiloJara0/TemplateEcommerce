<script setup lang="ts">
import type { ProductCtaSection } from '~/types/store'

defineProps<{ config: ProductCtaSection }>()
</script>

<template>
  <section
    class="py-16 rounded-xl"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold mb-3">{{ config.headline }}</h2>
      <p class="text-lg opacity-80 mb-8">{{ config.subtext }}</p>
      <div class="flex justify-center gap-4">
        <UButton :label="config.cta_primary.label" :to="config.cta_primary.url" color="primary" variant="solid" size="lg" class="font-semibold" />
        <UButton v-if="config.cta_secondary" :label="config.cta_secondary.label" :to="config.cta_secondary.url" color="neutral" variant="outline" size="lg" class="font-semibold" />
      </div>
    </div>
  </section>
</template>
