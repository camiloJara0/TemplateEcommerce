<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Product } from '~/types/catalog'

definePageMeta({ layout: 'client' })

const productStore = useProductStore()
const { items: products, loadingList } = storeToRefs(productStore)

onMounted(async () => {
  await productStore.loadList({ precio_max: undefined })
})

const deals = computed(() => products.value.filter(p => p.price_discount))

useSeoMeta({
  title: 'Ofertas y descuentos',
  description: 'Aprovecha los mejores descuentos en productos seleccionados. Envío rápido y pago seguro.',
  ogTitle: 'Ofertas y descuentos',
  ogDescription: 'Aprovecha los mejores descuentos en productos seleccionados. Envío rápido y pago seguro.',
  ogType: 'website'
})

const previewProduct = ref<Product | null>(null)
const previewOpen = ref(false)

function openPreview(product: Product) {
  previewProduct.value = product
  previewOpen.value = true
}
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-8">
      <div>
        <h1 class="page-title">
          Ofertas
        </h1>
        <p class="page-subtitle">
          Productos con descuento especial. Stock limitado.
        </p>
      </div>
    </div>

    <FeedbackEmptyState
      v-if="!loadingList && !deals.length"
      icon="i-lucide-tag"
      title="Sin ofertas disponibles"
      description="Pronto tendremos descuentos especiales para ti."
    />

    <EcommerceProductGrid
      :products="deals"
      @quickview="openPreview"
      :loading="loadingList"
    />

    <!-- Product preview modal -->
    <EcommerceProductPreviewModal
      :product="previewProduct"
      :open="previewOpen"
      @update:open="previewOpen = $event"
    />
  </div>
</template>
