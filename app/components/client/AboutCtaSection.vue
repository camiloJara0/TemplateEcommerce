<script setup lang="ts">
import type { AboutCtaSection } from '~/types/store'

const props = defineProps<{ config: AboutCtaSection }>()
</script>

<template>
  <section
    v-if="config.show"
    class="py-16 sm:py-20"
    :style="{
      backgroundColor: config.bg_color || undefined,
      color: config.text_color || undefined,
    }"
  >
    <div class="page-container text-center">
      <h2 class="text-2xl sm:text-3xl font-bold mb-3">{{ config.headline }}</h2>
      <p v-if="config.subtext" class="text-theme-muted max-w-xl mx-auto mb-8">{{ config.subtext }}</p>
      <div class="flex flex-wrap gap-3 justify-center">
        <NuxtLink
          v-if="config.cta_primary"
          :to="config.cta_primary.url"
          class="px-8 py-3 rounded-xl font-semibold bg-theme-brand text-theme-on-brand hover:scale-105 transition-transform"
        >
          {{ config.cta_primary.label }}
        </NuxtLink>
        <NuxtLink
          v-if="config.cta_secondary"
          :to="config.cta_secondary.url"
          class="px-8 py-3 rounded-xl font-semibold border-2 border-theme-brand text-theme-brand hover:bg-theme-brand hover:text-theme-on-brand transition-all"
        >
          {{ config.cta_secondary.label }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
