<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()
</script>

<template>
  <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-theme-brand/5" />
    <div
      v-if="config.background_image"
      class="absolute inset-0"
      :style="{ backgroundImage: `url(${config.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
    />
    <div
      v-else
      class="absolute inset-0"
      style="background: radial-gradient(ellipse at center, rgb(99 102 241 / 0.12) 0%, transparent 70%)"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-theme-brand/5" />

    <div class="page-container relative py-20 sm:py-28 text-center">
      <div class="max-w-3xl mx-auto animate-fade-up">
        <UBadge
          v-if="config.badge"
          :label="config.badge"
          color="primary"
          variant="subtle"
          class="mb-6 mx-auto"
        />
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-theme leading-[1.05]">
          {{ config.headline }}
        </h1>
        <p class="mt-6 text-lg sm:text-xl text-theme-secondary leading-relaxed max-w-2xl mx-auto">
          {{ config.subtext }}
        </p>
        <div class="mt-10 flex flex-wrap justify-center items-center gap-4">
          <UButton
            :to="config.cta_primary.url"
            size="xl"
            color="primary"
            :label="config.cta_primary.label"
            trailing-icon="i-lucide-arrow-right"
            class="cta-glow rounded-2xl px-8"
          />
          <UButton
            v-if="config.cta_secondary"
            :to="config.cta_secondary.url"
            size="xl"
            color="neutral"
            variant="outline"
            :label="config.cta_secondary.label"
            class="rounded-2xl px-8"
          />
        </div>
      </div>

      <div v-if="config.show_stats" class="mt-16 animate-fade-up delay-200">
        <div class="flex flex-wrap justify-center gap-8 sm:gap-14">
          <div
            v-for="(stat, i) in config.stats"
            :key="i"
            class="text-center"
          >
            <p class="text-3xl sm:text-4xl font-bold text-theme-brand">
              {{ stat.value }}
            </p>
            <p class="text-sm text-theme-muted mt-1">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
