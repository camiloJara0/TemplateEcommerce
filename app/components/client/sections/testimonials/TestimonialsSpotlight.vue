<script setup lang="ts">
import type { TestimonialsSection } from '~/types/store'

const props = defineProps<{ config: TestimonialsSection }>()

const currentIndex = ref(0)
const items = computed(() => props.config.items)
const current = computed(() => items.value[currentIndex.value] ?? items.value[0])

function next() {
  currentIndex.value = (currentIndex.value + 1) % items.value.length
}
function prev() {
  currentIndex.value = (currentIndex.value - 1 + items.value.length) % items.value.length
}

let interval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  interval = setInterval(next, 5000)
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>

      <div class="max-w-3xl mx-auto">
        <div class="surface p-8 sm:p-12 text-center relative">
          <UIcon name="i-lucide-quote" class="size-10 text-theme-brand/20 mx-auto mb-6" />
          <div class="flex justify-center gap-0.5 text-amber-400 mb-6">
            <UIcon
              v-for="n in (current?.rating ?? 5)"
              :key="n"
              name="i-lucide-star"
              class="size-5 fill-current"
            />
          </div>
          <p class="text-lg sm:text-xl text-theme-secondary leading-relaxed italic mb-8">
            "{{ current?.text }}"
          </p>
          <div class="flex items-center justify-center gap-3">
            <UAvatar :src="current?.avatar ?? undefined" :alt="current?.name" size="md" />
            <div class="text-left">
              <p class="font-medium text-theme">{{ current?.name }}</p>
              <p class="text-sm text-theme-muted">{{ current?.role }}</p>
            </div>
          </div>
        </div>

        <div v-if="items.length > 1" class="flex justify-center gap-3 mt-6">
          <button
            class="size-10 rounded-full border border-theme flex items-center justify-center hover:bg-theme-alt transition-colors"
            @click="prev"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4 text-theme-muted" />
          </button>
          <div class="flex items-center gap-2">
            <button
              v-for="(_, i) in items"
              :key="i"
              class="size-2.5 rounded-full transition-all duration-300"
              :class="i === currentIndex ? 'bg-theme-brand w-6' : 'bg-theme-muted/30 hover:bg-theme-muted/50'"
              @click="currentIndex = i"
            />
          </div>
          <button
            class="size-10 rounded-full border border-theme flex items-center justify-center hover:bg-theme-alt transition-colors"
            @click="next"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4 text-theme-muted" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
