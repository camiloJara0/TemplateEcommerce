<script setup lang="ts">
import type { ValuesSection } from '~/types/store'

const props = defineProps<{ config: ValuesSection }>()
</script>

<template>
  <section v-if="config.show" class="py-14 sm:py-20 bg-theme-alt">
    <div class="page-container">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.title }}</h2>
        <p v-if="config.subtitle" class="text-theme-muted">{{ config.subtitle }}</p>
      </div>
      <div
        class="grid gap-6"
        :class="{
          'grid-cols-1 sm:grid-cols-2': config.layout === 'grid-2',
          'grid-cols-1 sm:grid-cols-3': config.layout === 'grid-3',
          'grid-cols-2 sm:grid-cols-4': config.layout === 'grid-4',
          'max-w-2xl mx-auto space-y-6': config.layout === 'list',
        }"
      >
        <div
          v-for="(value, i) in config.items"
          :key="i"
          class="p-6 rounded-2xl bg-theme-surface border border-theme transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group text-center"
          :class="{ 'flex items-start gap-4 text-left': config.layout === 'list' }"
        >
          <div v-if="value.image" class="mb-4 overflow-hidden rounded-xl">
            <img :src="value.image" alt="" class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div v-else class="w-14 h-14 rounded-xl bg-theme-brand/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" :class="{ 'mx-0 shrink-0': config.layout === 'list' }">
            <UIcon :name="value.icon || 'i-lucide-heart'" class="size-6 text-theme-brand" />
          </div>
          <div>
            <h3 class="font-bold text-theme text-lg mb-1">{{ value.title }}</h3>
            <p class="text-sm text-theme-muted leading-relaxed">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
