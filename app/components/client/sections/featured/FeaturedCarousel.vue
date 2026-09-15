<script setup lang="ts">
import type { FeaturedSection } from '~/types/store'

const props = defineProps<{ config: FeaturedSection; products: any[] }>()
const emit = defineEmits<{ quickview: [product: any] }>()

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
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <div class="flex items-center gap-3">
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
          <UButton
            v-if="config.show_all_link"
            to="/catalogo?orden=mas_vendidos"
            color="neutral"
            variant="ghost"
            label="Ver más"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
      </div>
    </div>
    <div class="relative">
      <div
        ref="scrollContainer"
        class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[max(1rem,calc((100vw-80rem)/2+1rem))]"
      >
        <div
          v-for="p in products"
          :key="p.id"
          class="shrink-0 snap-start"
          style="width: 280px"
        >
          <EcommerceProductGrid :products="[p]" @quickview="emit('quickview', $event)" />
        </div>
      </div>
    </div>
  </section>
</template>
