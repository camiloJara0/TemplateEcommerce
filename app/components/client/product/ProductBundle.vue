<script setup lang="ts">
import type { ProductBundleSection } from '~/types/store'

const props = defineProps<{ config: ProductBundleSection }>()

const bundleTotal = computed(() => props.config.items.reduce((sum, item) => sum + item.bundle_price, 0))
const originalTotal = computed(() => props.config.items.reduce((sum, item) => sum + item.original_price, 0))
const savings = computed(() => originalTotal.value - bundleTotal.value)
</script>

<template>
  <section v-if="config.show && config.items.length" class="py-16 bg-theme-brand rounded-xl">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <div class="inline-block px-4 py-1 bg-white/20 text-theme-on-brand text-sm font-semibold rounded-full mb-4">
        {{ config.discount_label }}
      </div>
      <h2 class="text-3xl font-bold text-theme-on-brand mb-2">{{ config.headline }}</h2>
      <p class="text-theme-on-brand mb-10 opacity-80">{{ config.subtext }}</p>

      <div class="grid md:grid-cols-3 gap-4 mb-8">
        <div v-for="(item, i) in config.items" :key="i" class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left">
          <img v-if="item.image" :src="item.image" class="w-full h-32 rounded-lg object-cover mb-4" />
          <h3 class="font-semibold text-theme-on-brand">{{ item.name }}</h3>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-theme-on-brand opacity-50 line-through text-sm">${{ item.original_price.toLocaleString() }}</span>
            <span class="text-theme-on-brand font-bold">${{ item.bundle_price.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mb-8">
        <div class="text-center">
          <p class="text-theme-on-brand opacity-60 text-sm">Precio original</p>
          <p class="text-theme-on-brand opacity-60 line-through text-xl">${{ originalTotal.toLocaleString() }}</p>
        </div>
        <UIcon name="i-lucide-arrow-right" class="size-6 text-theme-on-brand opacity-60" />
        <div class="text-center">
          <p class="text-theme-on-brand opacity-60 text-sm">Precio bundle</p>
          <p class="text-theme-on-brand font-bold text-3xl">${{ bundleTotal.toLocaleString() }}</p>
        </div>
        <div class="text-center">
          <p class="text-green-300 text-sm">Ahorras</p>
          <p class="text-green-300 font-bold text-xl">${{ savings.toLocaleString() }}</p>
        </div>
      </div>

      <UButton :label="config.cta_label" color="neutral" variant="soft" size="lg" class="font-semibold" />
    </div>
  </section>
</template>
