<script setup lang="ts">
import type { BenefitsSection } from '~/types/store'

const props = defineProps<{ config: BenefitsSection }>()
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>
      <div class="relative max-w-4xl mx-auto">
        <div class="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-theme-imagenes" />
        <div class="grid lg:grid-cols-4 gap-8 lg:gap-6">
          <div
            v-for="(b, i) in config.items"
            :key="b.title"
            class="relative flex flex-col items-center text-center animate-fade-up"
            :style="{ animationDelay: `${i * 100}ms` }"
          >
            <div class="relative z-10 size-20 rounded-2xl bg-theme-brand flex items-center justify-center mb-5 shadow-lg shadow-theme-brand/20">
              <span class="text-2xl font-bold text-theme-on-brand">{{ i + 1 }}</span>
            </div>
            <div class="size-12 rounded-xl bg-theme-imagenes flex items-center justify-center mb-3 border-theme">
              <UIcon :name="b.icon" class="size-6 text-theme-brand" />
            </div>
            <h3 class="font-semibold text-theme mb-1">{{ b.title }}</h3>
            <p class="text-sm text-theme-muted leading-relaxed max-w-xs">{{ b.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
