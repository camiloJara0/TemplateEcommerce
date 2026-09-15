<script setup lang="ts">
import type { TestimonialsSection } from '~/types/store'

const props = defineProps<{ config: TestimonialsSection }>()
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>
      <div class="grid md:grid-cols-3 gap-4 sm:gap-6">
        <article
          v-for="t in config.items"
          :key="t.name"
          class="surface p-6 flex flex-col gap-4"
        >
          <div class="flex gap-0.5 text-amber-400">
            <UIcon
              v-for="n in t.rating"
              :key="n"
              name="i-lucide-star"
              class="size-4 fill-current"
            />
          </div>
          <p class="text-sm text-theme-secondary leading-relaxed flex-1">"{{ t.text }}"</p>
          <div class="flex items-center gap-3 pt-2 border-t border-theme">
            <UAvatar :src="t.avatar ?? undefined" :alt="t.name" size="sm" />
            <div>
              <p class="text-sm font-medium text-theme">{{ t.name }}</p>
              <p class="text-xs text-theme-muted">{{ t.role }}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
