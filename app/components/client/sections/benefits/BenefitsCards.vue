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
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="(b, i) in config.items"
          :key="b.title"
          class="group surface p-6 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up"
          :style="{ animationDelay: `${i * 75}ms` }"
        >
          <div class="size-14 rounded-2xl bg-theme-brand/10 flex items-center justify-center mb-5 group-hover:bg-theme-brand group-hover:scale-110 transition-all duration-300">
            <UIcon :name="b.icon" class="size-7 text-theme-brand group-hover:text-white transition-colors" />
          </div>
          <h3 class="font-semibold text-theme mb-2">{{ b.title }}</h3>
          <p class="text-sm text-theme-muted leading-relaxed">{{ b.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
