<script setup lang="ts">
import type { HeroSection } from '~/types/store'
const props = defineProps<{ config: HeroSection }>()
</script>
<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="animate-fade-up">
          <UBadge v-if="config.badge" :label="config.badge" color="primary" variant="subtle" class="mb-5" />
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-theme leading-[1.05]">
            {{ config.headline }}
          </h1>
          <p class="mt-5 text-lg text-theme-secondary leading-relaxed max-w-xl">{{ config.subtext }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton :to="config.cta_primary.url" size="xl" color="primary" :label="config.cta_primary.label" trailing-icon="i-lucide-arrow-right" class="cta-glow rounded-2xl" />
            <UButton v-if="config.cta_secondary" :to="config.cta_secondary.url" size="xl" color="neutral" variant="outline" :label="config.cta_secondary.label" class="rounded-2xl" />
          </div>
        </div>
        <div class="relative animate-fade-up delay-150">
          <div class="aspect-[4/5] rounded-3xl overflow-hidden" :style="{ backgroundColor: 'var(--color-theme-brand, #6366f1)' }">
            <div v-if="config.background_image" class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${config.background_image})` }" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-24 text-white/30" />
            </div>
          </div>
          <div v-if="config.show_stats" class="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 flex items-center gap-4">
            <div class="size-12 rounded-xl bg-theme-brand/10 flex items-center justify-center">
              <UIcon name="i-lucide-star" class="size-6 text-theme-brand" />
            </div>
            <div>
              <p class="text-2xl font-bold text-theme">{{ config.stats[0]?.value }}</p>
              <p class="text-xs text-theme-muted">{{ config.stats[0]?.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
