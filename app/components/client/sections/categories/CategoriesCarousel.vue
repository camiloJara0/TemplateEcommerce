<script setup lang="ts">
import type { CategoriesHomeSection } from '~/types/store'

const props = defineProps<{ config: CategoriesHomeSection }>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function updateScrollState() {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scroll(direction: 'left' | 'right') {
  const el = scrollContainer.value
  if (!el) return
  const amount = el.clientWidth * 0.7
  el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
}

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', updateScrollState, { passive: true })
  nextTick(updateScrollState)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', updateScrollState)
})
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-chevron-left"
            :disabled="!canScrollLeft"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="scroll('left')"
          />
          <UButton
            icon="i-lucide-chevron-right"
            :disabled="!canScrollRight"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
            @click="scroll('right')"
          />
        </div>
      </div>
    </div>

    <div class="relative">
      <div
        ref="scrollContainer"
        class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[max(1rem,calc((100vw-80rem)/2+1rem))]"
      >
        <NuxtLink
          v-for="cat in config.items"
          :key="cat.name"
          :to="cat.url"
          class="group relative shrink-0 snap-start overflow-hidden rounded-2xl cursor-pointer"
          :style="{ width: '280px', height: config.card_height }"
        >
          <div
            v-if="cat.image"
            class="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            :style="{ backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
          />
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-theme-brand/20 to-theme-accent/10 transition-transform duration-500 group-hover:scale-105"
          />
          <div
            class="absolute inset-0 transition-opacity duration-300"
            :style="{ backgroundColor: '#000', opacity: cat.overlay_opacity }"
          />
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h3 class="text-lg font-semibold transition-transform duration-300 group-hover:-translate-y-1" :style="{ color: cat.text_color }">
              {{ cat.name }}
            </h3>
            <p class="text-sm mt-1 opacity-80 transition-transform duration-300 group-hover:-translate-y-1" :style="{ color: cat.text_color }">
              {{ cat.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
