<script setup lang="ts">
import type { CtaSection } from '~/types/store'
const props = defineProps<{ config: CtaSection }>()
</script>
<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="relative overflow-hidden rounded-3xl px-8 py-16 sm:py-20 text-center bg-theme-brand">
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)" />
        <div class="absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div class="absolute -bottom-20 -left-20 size-64 rounded-full bg-black/10 blur-3xl" />
        <div class="relative z-10">
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-theme-on-brand">{{ config.headline }}</h2>
          <p class="mt-4 text-lg text-theme-on-brand/80 max-w-lg mx-auto">{{ config.subtext }}</p>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <UButton :to="config.cta_primary.url" size="xl" color="neutral" variant="solid" :label="config.cta_primary.label" class="rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-semibold" />
            <UButton v-if="config.cta_secondary" :to="config.cta_secondary.url" size="xl" color="neutral" variant="outline" :label="config.cta_secondary.label" class="rounded-2xl border-white/30 text-white hover:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
