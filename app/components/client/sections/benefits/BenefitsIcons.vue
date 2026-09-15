<script setup lang="ts">
import type { BenefitsSection } from '~/types/store'

const props = defineProps<{ config: BenefitsSection }>()
</script>

<template>
  <section class="border-y border-theme homepage-section-bg">
    <div class="page-container py-8 sm:py-10">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div
          v-for="(b, i) in config.items"
          :key="b.title"
          class="flex items-start gap-3 animate-fade-up"
          :style="{ animationDelay: `${i * 75}ms` }"
        >
          <div class="size-10 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0 border-theme">
            <UIcon :name="b.icon" class="size-5 text-theme-brand" />
          </div>
          <div>
            <p class="font-medium text-sm text-theme">{{ b.title }}</p>
            <p class="text-xs text-theme-muted mt-0.5 leading-relaxed">{{ b.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
