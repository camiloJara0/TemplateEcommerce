<script setup lang="ts">
import type { ProductFaqSection } from '~/types/store'

defineProps<{ config: ProductFaqSection }>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-16">
    <div class="max-w-3xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- Accordion -->
      <div v-if="config.style === 'accordion'" class="space-y-3">
        <div v-for="(item, i) in config.items" :key="i" class="border border-theme rounded-xl overflow-hidden">
          <button class="w-full flex items-center justify-between p-5 text-left" @click="toggle(i)">
            <span class="font-medium text-theme">{{ item.question }}</span>
            <UIcon name="i-lucide-chevron-down" class="size-5 text-theme-muted transition-transform duration-200" :class="openIndex === i ? 'rotate-180' : ''" />
          </button>
          <div v-show="openIndex === i" class="px-5 pb-5 text-theme-secondary">
            {{ item.answer }}
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div v-else-if="config.style === 'tabs'">
        <div class="flex flex-wrap gap-2 mb-6 border-b border-theme pb-2">
          <button v-for="(item, i) in config.items" :key="i" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors" :class="openIndex === i ? 'bg-theme-imagenes text-theme-brand' : 'text-theme-muted hover:bg-theme-imagenes'" @click="openIndex = i">
            {{ item.question }}
          </button>
        </div>
        <div v-if="openIndex !== null" class="p-6 bg-theme-surface rounded-xl">
          <p class="text-theme">{{ config.items[openIndex]?.answer }}</p>
        </div>
      </div>

      <!-- Simple -->
      <div v-else class="space-y-6">
        <div v-for="(item, i) in config.items" :key="i">
          <h3 class="font-semibold text-theme mb-1">{{ item.question }}</h3>
          <p class="text-theme-secondary">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
