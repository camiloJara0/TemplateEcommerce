<script setup lang="ts">
import type { ProductBundleSection } from '~/types/store'

const props = defineProps<{
  config: ProductBundleSection
  product?: Record<string, unknown>
}>()

const cartStore = useCartStore()

const bundleTotal = computed(() => props.config.items.reduce((sum, item) => sum + item.bundle_price, 0))
const originalTotal = computed(() => props.config.items.reduce((sum, item) => sum + item.original_price, 0))
const savings = computed(() => originalTotal.value - bundleTotal.value)
const savingsPercent = computed(() => originalTotal.value > 0 ? Math.round((savings.value / originalTotal.value) * 100) : 0)

function getItemDiscountPercent(item: { original_price: number, bundle_price: number }): number {
  if (item.original_price <= 0) return 0
  return Math.round(((item.original_price - item.bundle_price) / item.original_price) * 100)
}

async function addBundleToCart() {
  for (const item of props.config.items) {
    if (item.product_id) {
      await cartStore.addItem({ id: item.product_id, quantity: 1 })
    }
  }
}
</script>

<template>
  <section v-if="config.items.length" class="py-16">
    <div class="max-w-6xl mx-auto px-6">
      <!-- SPLIT variant -->
      <div v-if="config.variant === 'split'" class="grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <div class="inline-block px-4 py-1.5 bg-theme-brand/10 text-theme-brand text-sm font-semibold rounded-full">
            {{ config.discount_label }}
          </div>
          <h2 class="text-3xl font-bold text-theme">{{ config.headline }}</h2>
          <p class="text-theme-muted text-lg">{{ config.subtext }}</p>

          <div class="space-y-3">
            <div v-for="(item, i) in config.items" :key="i" class="flex items-center gap-4 p-3 rounded-xl bg-theme-alt/50">
              <img v-if="item.image" :src="item.image" class="w-16 h-16 rounded-lg object-cover shrink-0" :alt="item.name" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-theme truncate">{{ item.name }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-theme-muted line-through text-sm">${{ item.original_price.toLocaleString() }}</span>
                  <span class="text-theme-brand font-semibold">${{ item.bundle_price.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <UButton :label="config.cta_label" color="primary" size="lg" class="w-full" @click="addBundleToCart" />
        </div>

        <div class="bg-gradient-to-br from-theme-brand/10 to-theme-brand/5 rounded-3xl p-8 text-center">
          <div class="inline-block px-3 py-1 bg-theme-brand text-theme-on-brand text-xs font-bold rounded-full mb-4">
            -{{ savingsPercent }}% OFF
          </div>
          <div class="text-5xl font-bold text-theme-brand mb-2">${{ bundleTotal.toLocaleString() }}</div>
          <div class="text-lg text-theme-muted line-through mb-4">${{ originalTotal.toLocaleString() }}</div>
          <div v-if="savings > 0" class="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold">
            <UIcon name="i-lucide-piggy-bank" class="size-5" />
            <span>Ahorras ${{ savings.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- GRID variant (default) -->
      <div v-else-if="config.variant === 'grid'">
        <div class="text-center mb-10">
          <div class="inline-block px-4 py-1.5 bg-theme-brand/10 text-theme-brand text-sm font-semibold rounded-full mb-4">
            {{ config.discount_label }}
          </div>
          <h2 class="text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
          <p class="text-theme-muted">{{ config.subtext }}</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div
            v-for="(item, i) in config.items"
            :key="i"
            class="bg-theme-alt/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-theme group relative"
          >
            <div class="relative mb-4">
              <img v-if="item.image" :src="item.image" class="w-full h-40 rounded-xl object-cover group-hover:scale-105 transition-transform duration-500" :alt="item.name" />
              <div v-if="i === 0" class="absolute top-2 left-2 px-2 py-0.5 bg-theme-brand text-theme-on-brand text-[10px] font-bold rounded-full">
                PRINCIPAL
              </div>
            </div>
            <h3 class="font-semibold text-theme mb-2">{{ item.name }}</h3>
            <div class="flex items-center gap-2">
              <span class="text-theme-muted line-through text-sm">${{ item.original_price.toLocaleString() }}</span>
              <span class="text-theme-brand font-bold text-lg">${{ item.bundle_price.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 bg-theme-alt/30 rounded-2xl p-6">
          <div class="text-center">
            <p class="text-xs text-theme-muted uppercase tracking-wide">Precio individual</p>
            <p class="text-theme-muted line-through text-xl">${{ originalTotal.toLocaleString() }}</p>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-5 text-theme-brand hidden sm:block" />
          <div class="text-center">
            <p class="text-xs text-theme-brand uppercase tracking-wide font-medium">Precio bundle</p>
            <p class="text-theme-brand font-bold text-3xl">${{ bundleTotal.toLocaleString() }}</p>
          </div>
          <div v-if="savings > 0" class="text-center">
            <p class="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-medium">Ahorras</p>
            <p class="text-green-600 dark:text-green-400 font-bold text-xl">${{ savings.toLocaleString() }}</p>
          </div>
          <UButton :label="config.cta_label" color="primary" size="lg" class="ml-4" @click="addBundleToCart" />
        </div>
      </div>

      <!-- CAROUSEL variant -->
      <div v-else>
        <div class="text-center mb-10">
          <div class="inline-block px-4 py-1.5 bg-theme-brand/10 text-theme-brand text-sm font-semibold rounded-full mb-4">
            {{ config.discount_label }}
          </div>
          <h2 class="text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
          <p class="text-theme-muted">{{ config.subtext }}</p>
        </div>

        <div class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          <div
            v-for="(item, i) in config.items"
            :key="i"
            class="snap-center shrink-0 w-72 bg-theme-alt/50 rounded-2xl overflow-hidden border border-theme"
          >
            <img v-if="item.image" :src="item.image" class="w-full h-48 object-cover" :alt="item.name" />
            <div class="p-5">
              <h3 class="font-semibold text-theme mb-1">{{ item.name }}</h3>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-theme-muted line-through text-sm">${{ item.original_price.toLocaleString() }}</span>
                <span class="text-theme-brand font-bold">${{ item.bundle_price.toLocaleString() }}</span>
              </div>
              <div class="w-full bg-theme-alt rounded-full h-1.5">
                <div class="bg-theme-brand h-1.5 rounded-full transition-all duration-700" :style="{ width: `${getItemDiscountPercent(item)}%` }" />
              </div>
              <p class="text-[11px] text-theme-muted mt-1">-{{ getItemDiscountPercent(item) }}%</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-4 mt-8">
          <div class="flex items-center gap-4 text-sm">
            <span class="text-theme-muted">Total: <span class="line-through">${{ originalTotal.toLocaleString() }}</span></span>
            <span class="text-theme-brand font-bold text-lg">${{ bundleTotal.toLocaleString() }}</span>
            <span v-if="savingsPercent > 0" class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">-{{ savingsPercent }}%</span>
          </div>
          <UButton :label="config.cta_label" color="primary" size="lg" @click="addBundleToCart" />
        </div>
      </div>
    </div>
  </section>
</template>
