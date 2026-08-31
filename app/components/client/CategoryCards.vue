<script setup lang="ts">
import type { CategoriesHomeSection } from '~/types/store'

const props = defineProps<{ config: CategoriesHomeSection }>()

const visible = ref(false)
onMounted(() => { visible.value = true })

function getCategoryUrl(url: string): string {
  if (url.startsWith('/categorias/')) {
    const slug = url.split('/').pop()
    return `/catalogo?categoria=${slug}`
  }
  return url
}
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-20 px-6 homepage-section-bg">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2
          class="text-3xl md:text-4xl font-bold text-theme transition-all duration-700"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          {{ config.title }}
        </h2>
        <p
          class="mt-3 text-lg text-theme-secondary transition-all duration-700 delay-100"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          {{ config.subtitle }}
        </p>
      </div>

      <!-- Grid -->
      <div
        class="grid gap-4"
        :class="{
          'grid-cols-1 md:grid-cols-2': config.layout === 'grid-2',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': config.layout === 'grid-3',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': config.layout === 'grid-4',
        }"
      >
        <NuxtLink
          v-for="(item, i) in config.items"
          :key="i"
          :to="getCategoryUrl(item.url)"
          class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
          :style="{ height: config.card_height }"
          :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          :transition-delay="`${i * 100}ms`"
        >
          <!-- Background -->
          <div
            v-if="item.image"
            class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            :style="{ backgroundImage: `url(${item.image})` }"
          />
          <div v-else class="absolute inset-0 bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />

          <!-- Overlay -->
          <div
            class="absolute inset-0 transition-opacity duration-300"
            :style="{
              backgroundColor: '#000000',
              opacity: item.overlay_opacity,
            }"
          />

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/20 transition-colors duration-300" />

          <!-- Content -->
          <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3
              class="text-2xl font-bold mb-2 transition-transform duration-300 group-hover:scale-105"
              :style="{ color: item.text_color }"
            >
              {{ item.name }}
            </h3>
            <p
              class="text-sm opacity-80 transition-transform duration-300 group-hover:scale-105"
              :style="{ color: item.text_color }"
            >
              {{ item.description }}
            </p>

            <!-- Arrow -->
            <div
              class="mt-4 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:border-white"
              :style="{ borderColor: item.text_color, color: item.text_color }"
            >
              <UIcon name="i-lucide-arrow-right" class="size-5 group-hover:text-theme-brand" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
