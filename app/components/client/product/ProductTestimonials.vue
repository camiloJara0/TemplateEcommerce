<script setup lang="ts">
import type { ProductTestimonialsSection } from '~/types/store'

const props = defineProps<{ config: ProductTestimonialsSection }>()

const currentIndex = ref(0)
const autoplayTimer = ref<ReturnType<typeof setInterval> | null>(null)

function next() {
  if (!props.config.items.length) return
  currentIndex.value = (currentIndex.value + 1) % props.config.items.length
  resetAutoplay()
}

function prev() {
  if (!props.config.items.length) return
  currentIndex.value = (currentIndex.value - 1 + props.config.items.length) % props.config.items.length
  resetAutoplay()
}

function goTo(i: number) {
  currentIndex.value = i
  resetAutoplay()
}

function resetAutoplay() {
  if (autoplayTimer.value) clearInterval(autoplayTimer.value)
  if (props.config.variant === 'carousel' || props.config.variant === 'spotlight') {
    autoplayTimer.value = setInterval(next, 5000)
  }
}

onMounted(() => resetAutoplay())
onUnmounted(() => { if (autoplayTimer.value) clearInterval(autoplayTimer.value) })
</script>

<template>
  <section v-if="config.items.length" class="py-16 bg-theme-surface rounded-xl">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- SPOTLIGHT variant -->
      <div v-if="config.variant === 'spotlight'" class="max-w-3xl mx-auto">
        <div class="relative">
          <div v-for="(item, i) in config.items" :key="i" v-show="currentIndex === i" class="transition-all duration-500">
            <div class="bg-theme-alt/30 rounded-3xl p-10 text-center relative overflow-hidden">
              <div class="absolute top-6 left-8 text-6xl text-theme-brand/10 font-serif leading-none">"</div>
              <div class="relative z-10">
                <div class="flex items-center justify-center gap-1 mb-6">
                  <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-5" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
                </div>
                <blockquote class="text-xl text-theme italic leading-relaxed mb-8">
                  "{{ item.text }}"
                </blockquote>
                <div class="flex items-center justify-center gap-4">
                  <div class="w-14 h-14 rounded-full bg-theme-brand/10 flex items-center justify-center ring-2 ring-theme-brand/20 overflow-hidden">
                    <img v-if="item.avatar" :src="item.avatar" class="w-full h-full object-cover" :alt="item.name" />
                    <span v-else class="text-lg font-bold text-theme-brand">{{ item.name[0] }}</span>
                  </div>
                  <div class="text-left">
                    <p class="font-semibold text-theme">{{ item.name }}</p>
                    <p class="text-sm text-theme-muted">{{ item.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Controls -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-10 h-10 rounded-full bg-theme-alt border border-theme flex items-center justify-center hover:bg-theme-brand hover:text-theme-on-brand transition-all" @click="prev">
            <UIcon name="i-lucide-chevron-left" class="size-5" />
          </button>
          <div class="flex gap-2">
            <button v-for="(_, i) in config.items" :key="i" class="w-2.5 h-2.5 rounded-full transition-all duration-300" :class="currentIndex === i ? 'bg-theme-brand w-6' : 'bg-theme-muted/30'" @click="goTo(i)" />
          </div>
          <button class="w-10 h-10 rounded-full bg-theme-alt border border-theme flex items-center justify-center hover:bg-theme-brand hover:text-theme-on-brand transition-all" @click="next">
            <UIcon name="i-lucide-chevron-right" class="size-5" />
          </button>
        </div>
      </div>

      <!-- CAROUSEL variant -->
      <div v-else-if="config.variant === 'carousel'" class="relative">
        <div class="overflow-hidden">
          <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
            <div v-for="(item, i) in config.items" :key="i" class="w-full shrink-0 px-4">
              <div class="bg-theme-surface rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
                <div class="flex items-center gap-1 mb-4">
                  <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-5" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
                </div>
                <p class="text-lg text-theme italic mb-6">"{{ item.text }}"</p>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-theme-imagenes flex items-center justify-center">
                    <span class="font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
                  </div>
                  <div>
                    <p class="font-semibold text-theme">{{ item.name }}</p>
                    <p class="text-sm text-theme-muted">{{ item.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-surface rounded-full shadow-lg flex items-center justify-center" @click="prev">
          <UIcon name="i-lucide-chevron-left" class="size-5" />
        </button>
        <button class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-theme-surface rounded-full shadow-lg flex items-center justify-center" @click="next">
          <UIcon name="i-lucide-chevron-right" class="size-5" />
        </button>
      </div>

      <!-- GRID variant -->
      <div v-else-if="config.variant === 'grid'" class="grid md:grid-cols-3 gap-6">
        <div v-for="(item, i) in config.items" :key="i" class="bg-theme-surface rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-1 mb-3">
            <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
          </div>
          <p class="text-theme italic mb-4">"{{ item.text }}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-theme-imagenes flex items-center justify-center">
              <span class="text-xs font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
            </div>
            <div>
              <p class="font-medium text-sm text-theme">{{ item.name }}</p>
              <p class="text-xs text-theme-muted">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- MASONRY variant -->
      <div v-else class="columns-1 md:columns-2 lg:columns-3 gap-4">
        <div v-for="(item, i) in config.items" :key="i" class="break-inside-avoid mb-4 bg-theme-surface rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-1 mb-3">
            <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
          </div>
          <p class="text-theme italic mb-4">"{{ item.text }}"</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-theme-imagenes flex items-center justify-center">
              <span class="text-xs font-semibold" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'">{{ item.name[0] }}</span>
            </div>
            <div>
              <p class="font-medium text-sm text-theme">{{ item.name }}</p>
              <p class="text-xs text-theme-muted">{{ item.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
