<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
  icon?: string
}

interface FaqConfig {
  title: string
  subtitle: string
  items: FaqItem[]
}

const props = defineProps<{ config: FaqConfig }>()

const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section class="section-padding homepage-section-bg relative overflow-hidden">
    <div class="absolute top-12 right-12 opacity-[0.03] pointer-events-none select-none hidden lg:block">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="180" font-weight="800" fill="currentColor">?</text>
      </svg>
    </div>
    <div class="absolute bottom-8 left-8 opacity-[0.03] pointer-events-none select-none hidden lg:block">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="100" font-weight="800" fill="currentColor">?</text>
      </svg>
    </div>

    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>

      <div class="max-w-3xl mx-auto space-y-3">
        <div
          v-for="(item, i) in config.items"
          :key="i"
          class="surface rounded-xl overflow-hidden transition-all duration-300"
          :class="openIndex === i ? 'shadow-lg shadow-theme-brand/5' : 'hover:shadow-md'"
        >
          <button
            class="w-full flex items-start gap-4 p-5 sm:p-6 text-left cursor-pointer group"
            @click="toggle(i)"
          >
            <div
              class="shrink-0 size-9 rounded-lg flex items-center justify-center transition-all duration-300 mt-0.5"
              :class="openIndex === i ? 'bg-theme-brand text-white scale-105' : 'bg-theme-brand/10 text-theme-brand group-hover:bg-theme-brand/20'"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="size-4"
              />
              <span v-else class="text-sm font-bold">Q{{ i + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-medium text-theme text-[0.95rem] leading-snug block">{{ item.question }}</span>
            </div>
            <div
              class="shrink-0 size-8 rounded-full flex items-center justify-center transition-all duration-300"
              :class="openIndex === i ? 'bg-theme-brand/10 rotate-45' : 'bg-theme-alt'"
            >
              <UIcon name="i-lucide-plus" class="size-4 text-theme-muted" />
            </div>
          </button>
          <div
            class="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :style="{
              maxHeight: openIndex === i ? '300px' : '0px',
              opacity: openIndex === i ? 1 : 0
            }"
          >
            <div class="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.25rem]">
              <p class="text-theme-muted text-[0.9rem] leading-relaxed">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
