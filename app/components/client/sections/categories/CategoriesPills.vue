<script setup lang="ts">
import type { CategoriesHomeSection } from '~/types/store'
const props = defineProps<{ config: CategoriesHomeSection }>()
</script>
<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink
          v-for="cat in config.items"
          :key="cat.name"
          :to="cat.url"
          class="group flex items-center gap-3 px-6 py-4 rounded-2xl surface hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          <div v-if="cat.image" class="size-10 rounded-xl overflow-hidden shrink-0">
            <div class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${cat.image})` }" />
          </div>
          <div v-else class="size-10 rounded-xl bg-theme-brand/10 flex items-center justify-center shrink-0 group-hover:bg-theme-brand transition-colors">
            <UIcon name="i-lucide-tag" class="size-5 text-theme-brand group-hover:text-white transition-colors" />
          </div>
          <div>
            <p class="font-semibold text-theme text-sm">{{ cat.name }}</p>
            <p class="text-xs text-theme-muted">{{ cat.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
