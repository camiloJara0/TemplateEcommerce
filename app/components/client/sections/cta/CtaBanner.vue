<script setup lang="ts">
import type { CtaSection } from '~/types/store'

const props = defineProps<{ config: CtaSection }>()
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="surface text-center px-6 py-14 sm:py-16 relative overflow-hidden">
        <div class="absolute inset-0 bg-linear-to-br from-brand-50/80 to-transparent dark:from-brand-950/30 pointer-events-none" />
        <div class="relative">
          <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-theme">
            {{ config.headline }}
          </h2>
          <p class="mt-3 text-theme-muted max-w-md mx-auto">
            {{ config.subtext }}
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <UButton
              :to="config.cta_primary.url"
              size="lg"
              color="primary"
              :label="config.cta_primary.label"
              class="rounded-2xl cta-glow"
            />
            <UButton
              v-if="config.cta_secondary"
              :to="config.cta_secondary.url"
              size="lg"
              color="neutral"
              variant="outline"
              :label="config.cta_secondary.label"
              class="rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
