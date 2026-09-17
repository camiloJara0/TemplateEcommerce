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

function updatePositionFromEvent(e: MouseEvent) {
  updatePosition(e)
}

onMounted(() => {
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchend', stopDrag)
  document.addEventListener('touchmove', onDrag)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  document.removeEventListener('touchmove', onDrag)
})

const hasImages = computed(() => props.config.before_image && props.config.after_image)
</script>

<template>
  <section class="py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
      <p class="text-theme-muted mb-12">{{ config.subtext }}</p>

      <!-- Image Slider Mode (default — focused two-image comparison) -->
      <div v-if="hasImages" class="max-w-3xl mx-auto">
        <!-- OVERLAY slider -->
        <div
          v-if="config.variant === 'overlay'"
          ref="sliderRef"
          class="relative rounded-2xl shadow-xl overflow-hidden select-none cursor-ew-resize"
          style="aspect-ratio: 16/10"
          @mousedown.prevent="startDrag"
          @touchstart.prevent="startDrag"
        >
          <!-- After image (full) -->
          <img :src="config.after_image!" alt="Después" class="absolute inset-0 w-full h-full object-cover" />

          <!-- Before image (clipped) -->
          <div class="absolute inset-0" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }">
            <img :src="config.before_image!" alt="Antes" class="w-full h-full object-cover" />
          </div>

          <!-- Slider handle -->
          <div class="absolute top-0 bottom-0 w-0.5 bg-white/80" :style="{ left: `${sliderPosition}%` }">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
              <UIcon name="i-lucide-move-horizontal" class="size-5 text-slate-700" />
            </div>
          </div>

          <!-- Labels -->
          <div class="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <UIcon name="i-lucide-arrow-left" class="size-3" />
            Antes
          </div>
          <div class="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-sm flex items-center gap-1.5">
            Después
            <UIcon name="i-lucide-arrow-right" class="size-3" />
          </div>

          <!-- Percentage indicator -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-[11px] font-medium rounded-full backdrop-blur-sm">
            {{ Math.round(sliderPosition) }}% Antes · {{ 100 - Math.round(sliderPosition) }}% Después
          </div>
        </div>

        <!-- SIDE BY SIDE -->
        <div v-else-if="config.variant === 'side-by-side'" class="grid md:grid-cols-2 gap-4">
          <div class="relative rounded-2xl overflow-hidden shadow-lg">
            <img :src="config.before_image!" alt="Antes" class="w-full h-72 object-cover" />
            <div class="absolute top-4 left-4 px-3 py-1.5 bg-red-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <UIcon name="i-lucide-x" class="size-3" />
              Antes
            </div>
          </div>
          <div class="relative rounded-2xl overflow-hidden shadow-lg">
            <img :src="config.after_image!" alt="Después" class="w-full h-72 object-cover" />
            <div class="absolute top-4 left-4 px-3 py-1.5 bg-green-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <UIcon name="i-lucide-check" class="size-3" />
              Después
            </div>
          </div>
        </div>

        <!-- CARDS mode -->
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

      <!-- Fallback: Cards mode when no images -->
      <div v-else class="grid md:grid-cols-2 gap-8 items-center relative max-w-4xl mx-auto">
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
