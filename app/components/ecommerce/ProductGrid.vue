<script setup lang="ts">
import type { Product } from '~/types/catalog'

const props = withDefaults(defineProps<{
  products: Product[]
  loading?: boolean
  columns?: 2 | 3 | 4
}>(), {
  loading: false,
  columns: 4
})

const emit = defineEmits<{
  quickview: [product: Product]
}>()

const colClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
}
</script>

<template>
  <FeedbackSkeletonLoader
    v-if="loading"
    variant="product"
    :count="8"
  />

  <FeedbackEmptyState
    v-else-if="!products?.length"
    icon="i-lucide-package-search"
    title="Sin productos"
    description="No encontramos productos con estos filtros. Prueba ajustar la búsqueda."
  />

  <div
    v-else
    class="grid gap-4 sm:gap-6"
    :class="colClass[columns]"
  >
    <EcommerceProductCard
      v-for="(product, index) in products"
      :key="product.id"
      :product="product"
      class="animate-fade-up"
      :style="{ animationDelay: `${Math.min(index, 8) * 50}ms` }"
      @quickview="emit('quickview', $event)"
    />
  </div>
</template>
