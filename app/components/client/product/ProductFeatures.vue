<script setup lang="ts">
import type { ProductFeaturesSection } from '~/types/store'

const props = defineProps<{ config: ProductFeaturesSection }>()

const observed = ref<Set<number>>(new Set())
const sectionRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!sectionRef.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-idx'))
          observed.value.add(idx)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  const items = sectionRef.value.querySelectorAll('[data-feature-item]')
  items.forEach((el) => observer.observe(el))

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <section v-if="config.items.length" class="py-16 bg-theme-surface rounded-xl" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.title }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtitle }}</p>
      </div>

      <!-- List layout -->
      <div v-if="config.variant === 'list'" class="space-y-4">
        <div
          v-for="(item, i) in config.items"
          :key="i"
          :data-feature-item="i"
          :data-idx="i"
          class="flex items-start gap-6 p-6 bg-theme-surface rounded-2xl border border-theme transition-all duration-700"
          :class="observed.has(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          :style="{ transitionDelay: `${i * 100}ms` }"
        >
          <div class="w-12 h-12 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UIcon :name="item.icon" class="size-6" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-theme">{{ item.title }}</h3>
            <p class="text-theme-muted mt-1">{{ item.description }}</p>
          </div>
          <img v-if="item.image" :src="item.image" class="w-24 h-24 rounded-lg object-cover shrink-0" />
        </div>
      </div>

      <!-- Grid layout -->
      <div v-else-if="config.variant === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(item, i) in config.items"
          :key="i"
          :data-feature-item="i"
          :data-idx="i"
          class="p-6 bg-theme-surface rounded-2xl border border-theme text-center group transition-all duration-700 hover:shadow-lg hover:border-theme-brand/20 hover:-translate-y-1"
          :class="observed.has(i) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'"
          :style="{ transitionDelay: `${i * 120}ms` }"
        >
          <div class="w-14 h-14 rounded-2xl bg-theme-imagenes flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <UIcon :name="item.icon" class="size-7" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'" />
          </div>
          <h3 class="font-semibold text-theme">{{ item.title }}</h3>
          <p class="text-sm text-theme-muted mt-2">{{ item.description }}</p>
          <img v-if="item.image" :src="item.image" class="w-full h-32 rounded-xl object-cover mt-4 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </div>

      <!-- Alternating layout -->
      <div v-else class="space-y-8">
        <div
          v-for="(item, i) in config.items"
          :key="i"
          :data-feature-item="i"
          :data-idx="i"
          class="flex items-center gap-8 transition-all duration-700"
          :class="[
            i % 2 === 1 ? 'flex-row-reverse' : '',
            observed.has(i) ? 'opacity-100 translate-x-0' : (i % 2 === 0 ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12')
          ]"
          :style="{ transitionDelay: `${i * 150}ms` }"
        >
          <div class="flex-1 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-theme-imagenes flex items-center justify-center">
                <UIcon :name="item.icon" class="size-5" :class="i % 2 === 0 ? 'text-theme-brand' : 'text-theme-accent'" />
              </div>
              <h3 class="font-semibold text-lg text-theme">{{ item.title }}</h3>
            </div>
            <p class="text-theme-muted">{{ item.description }}</p>
          </div>
          <div v-if="item.image" class="flex-1">
            <img :src="item.image" class="w-full h-48 rounded-2xl object-cover shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
