<script setup lang="ts">
import type { ProductFaqSection } from '~/types/store'

defineProps<{ config: ProductFaqSection }>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section v-if="config.items.length" class="py-16">
    <div class="max-w-3xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- Accordion -->
      <div v-if="config.variant === 'accordion'" class="space-y-3">
        <div v-for="(item, i) in config.items" :key="i" class="border border-theme rounded-2xl overflow-hidden transition-all" :class="openIndex === i ? 'shadow-sm' : ''">
          <button class="w-full flex items-center justify-between p-5 text-left group" @click="toggle(i)">
            <span class="font-medium text-theme pr-4" :class="openIndex === i ? 'text-theme-brand' : ''">{{ item.question }}</span>
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300" :class="openIndex === i ? 'bg-theme-brand/10 rotate-180' : 'bg-theme-alt'">
              <UIcon name="i-lucide-chevron-down" class="size-4 text-theme-muted" />
            </div>
          </button>
          <div v-show="openIndex === i" class="px-5 pb-5">
            <div class="pt-1 pl-0 border-t border-theme/50">
              <p class="text-theme-secondary mt-4 leading-relaxed">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div v-else-if="config.variant === 'tabs'">
        <div class="flex flex-wrap gap-2 mb-6 border-b border-theme pb-2">
          <button
            v-for="(item, i) in config.items"
            :key="i"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="openIndex === i ? 'bg-theme-brand text-theme-on-brand shadow-sm' : 'text-theme-muted hover:bg-theme-alt'"
            @click="openIndex = i"
          >
            {{ item.question }}
          </button>
        </div>
        <Transition name="fade" mode="out-in">
          <div v-if="openIndex !== null" :key="openIndex" class="p-6 bg-theme-surface rounded-2xl border border-theme">
            <p class="text-theme leading-relaxed">{{ config.items[openIndex]?.answer }}</p>
          </div>
        </Transition>
      </div>

      <!-- Simple (cards) -->
      <div v-else class="grid md:grid-cols-2 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-alt/30 rounded-2xl p-6 border border-theme hover:border-theme-brand/30 transition-all">
          <h3 class="font-semibold text-theme mb-2 flex items-start gap-2">
            <UIcon name="i-lucide-help-circle" class="size-5 text-theme-brand shrink-0 mt-0.5" />
            {{ item.question }}
          </h3>
          <p class="text-theme-secondary text-sm leading-relaxed pl-7">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
