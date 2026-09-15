<script setup lang="ts">
import type { CtaSection } from '~/types/store'

const props = defineProps<{ config: CtaSection }>()
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl surface">
        <div class="relative p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div class="absolute inset-0 bg-gradient-to-br from-theme-brand/5 to-transparent pointer-events-none" />
          <div class="relative">
            <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-theme">
              {{ config.headline }}
            </h2>
            <p class="mt-3 text-theme-muted max-w-md leading-relaxed">
              {{ config.subtext }}
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                :to="config.cta_primary.url"
                size="lg"
                color="primary"
                :label="config.cta_primary.label"
                trailing-icon="i-lucide-arrow-right"
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
        <div class="relative hidden lg:block">
          <div class="absolute inset-0 bg-gradient-to-br from-theme-brand/10 to-theme-accent/10" />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <UIcon name="i-lucide-shopping-bag" class="size-20 text-theme-brand/20" />
              <p class="text-sm text-theme-muted mt-4">Tu próxima compra te espera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
