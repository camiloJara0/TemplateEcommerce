<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ config: HeroSection }>()
</script>

<template>
  <section class="relative overflow-hidden section-gradient">
    <div class="absolute inset-0 section-gradient" />
    <div
      v-if="config.background_image"
      class="absolute inset-0 opacity-20"
      :style="{ backgroundImage: `url(${config.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
    />
    <div
      v-else
      class="absolute inset-0 opacity-40 dark:opacity-20"
      style="background-image: radial-gradient(circle at 10% 20%, rgb(99 102 241 / 0.15), transparent 35%), radial-gradient(circle at 90% 10%, rgb(217 70 239 / 0.12), transparent 30%)"
    />

    <div class="page-container relative section-padding">
      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div class="animate-fade-up">
          <UBadge
            v-if="config.badge"
            :label="config.badge"
            color="primary"
            variant="subtle"
            class="mb-5"
          />
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-theme leading-[1.08]">
            {{ config.headline }}
          </h1>
          <p class="mt-5 text-base sm:text-lg text-theme-secondary leading-relaxed max-w-xl">
            {{ config.subtext }}
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              :to="config.cta_primary.url"
              size="xl"
              color="primary"
              :label="config.cta_primary.label"
              trailing-icon="i-lucide-arrow-right"
              class="cta-glow rounded-2xl"
            />
            <UButton
              v-if="config.cta_secondary"
              :to="config.cta_secondary.url"
              size="xl"
              color="neutral"
              variant="outline"
              :label="config.cta_secondary.label"
              class="rounded-2xl"
            />
          </div>
          <div class="mt-10 flex items-center gap-6 text-sm text-theme-muted">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="size-4 text-emerald-500" />
              Pago seguro
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-truck" class="size-4 text-theme-brand" />
              Envío 24–48h
            </div>
          </div>
        </div>

        <div v-if="config.show_stats" class="relative animate-fade-up delay-150">
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              v-for="(stat, i) in config.stats"
              :key="i"
              class="surface p-4 sm:p-5"
              :class="i === 1 ? 'glass' : ''"
            >
              <p class="text-2xl font-semibold tabular-nums" :class="i === 1 ? 'text-gradient-subtle' : ''">
                {{ stat.value }}
              </p>
              <p class="text-xs text-theme-muted mt-1">
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
