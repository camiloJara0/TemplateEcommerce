<script setup lang="ts">
import type { ProductTransformSection } from '~/types/store'

const props = defineProps<{ config: ProductTransformSection }>()

const sliderPosition = ref(50)
const isDragging = ref(false)
const sliderRef = ref<HTMLElement | null>(null)

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  updatePosition(e)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  updatePosition(e)
}

function stopDrag() {
  isDragging.value = false
}

function updatePosition(e: MouseEvent | TouchEvent) {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
  const x = clientX - rect.left
  sliderPosition.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

const hasImages = computed(() => props.config.before_image && props.config.after_image)
</script>

<template>
  <section v-if="config.show" class="py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
      <p class="text-theme-muted mb-12">{{ config.subtext }}</p>

      <!-- Image Slider Mode -->
      <div v-if="hasImages && config.slider_style === 'overlay'" class="max-w-3xl mx-auto">
        <div
          ref="sliderRef"
          class="ba-slider rounded-2xl shadow-xl overflow-hidden relative select-none"
          style="aspect-ratio: 16/10"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart.prevent="startDrag"
          @touchmove.prevent="onDrag"
          @touchend="stopDrag"
        >
          <div class="ba-after">
            <img :src="config.after_image!" alt="Después" class="w-full h-full object-cover" />
          </div>
          <div class="ba-before" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
            <img :src="config.before_image!" alt="Antes" class="w-full h-full object-cover" />
          </div>
          <div class="ba-handle" :style="{ left: `${sliderPosition}%` }">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <UIcon name="i-lucide-move-horizontal" class="size-5 text-theme" />
            </div>
          </div>
          <div class="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
            Antes
          </div>
          <div class="absolute top-4 right-4 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
            Después
          </div>
        </div>
      </div>

      <!-- Side by Side Image Mode -->
      <div v-else-if="hasImages && config.slider_style === 'side-by-side'" class="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
        <div class="relative rounded-2xl overflow-hidden shadow-lg">
          <img :src="config.before_image!" alt="Antes" class="w-full h-72 object-cover" />
          <div class="absolute top-4 left-4 px-3 py-1 bg-red-500/80 text-white text-xs font-semibold rounded-full">Antes</div>
        </div>
        <div class="relative rounded-2xl overflow-hidden shadow-lg">
          <img :src="config.after_image!" alt="Después" class="w-full h-72 object-cover" />
          <div class="absolute top-4 left-4 px-3 py-1 bg-green-500/80 text-white text-xs font-semibold rounded-full">Después</div>
        </div>
      </div>

      <!-- Cards Mode (default) -->
      <div v-else class="grid md:grid-cols-2 gap-8 items-center relative">
        <div class="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8">
          <div class="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full mb-6">
            Antes
          </div>
          <div class="space-y-4">
            <div v-for="(item, i) in config.before" :key="i" class="flex items-center gap-3 text-left">
              <UIcon name="i-lucide-x-circle" class="size-5 text-red-400 shrink-0" />
              <div>
                <p class="font-medium text-theme">{{ item.label }}</p>
                <p class="text-sm text-theme-muted">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-theme-brand rounded-full items-center justify-center z-10 shadow-lg">
          <UIcon name="i-lucide-arrow-right" class="size-6 text-theme-on-brand" />
        </div>

        <div class="bg-green-50 dark:bg-green-900/10 rounded-2xl p-8">
          <div class="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full mb-6">
            Después
          </div>
          <div class="space-y-4">
            <div v-for="(item, i) in config.after" :key="i" class="flex items-center gap-3 text-left">
              <UIcon name="i-lucide-check-circle" class="size-5 text-green-400 shrink-0" />
              <div>
                <p class="font-medium text-theme">{{ item.label }}</p>
                <p class="text-sm text-theme-muted">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
