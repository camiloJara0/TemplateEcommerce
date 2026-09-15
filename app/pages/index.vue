<script setup lang="ts">
import type { Product } from '~/types/catalog'

definePageMeta({ layout: 'client' })

const appConfig = useAppConfig()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const storeConfigStore = useStoreConfigStore()
const { prefetchBase } = usePrefetch()

const { items: products } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { storeName } = storeToRefs(storeConfigStore)
const { effectiveTiendaConfig } = storeToRefs(storeConfigStore)

const featured = computed(() => products.value.filter(p => p.is_featured).slice(0, 8))

onMounted(async () => {
  await Promise.all([
    prefetchBase(),
    productStore.loadList({ destacado: 1, per_page: 8 }),
  ])
})

useSeoMeta({
  title: () => `${storeName.value || appConfig.app?.name || 'CommerceOS'} — ${appConfig.app?.tagline || 'Tu tienda'}`,
  description: () => appConfig.app?.description || 'Ecommerce premium con los mejores productos, envío rápido y checkout seguro.',
  ogTitle: () => storeName.value || appConfig.app?.name || 'CommerceOS',
  ogDescription: () => appConfig.app?.description || 'Ecommerce premium con los mejores productos, envío rápido y checkout seguro.',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: storeName.value || 'CommerceOS',
        url: '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: '/catalogo?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})

const previewProduct = ref<Product | null>(null)
const previewOpen = ref(false)

function openPreview(product: Product) {
  previewProduct.value = product
  previewOpen.value = true
}
</script>

<template>
  <div>
    <ClientPageRenderer
      :config="effectiveTiendaConfig"
      mode="client"
      :products="featured"
      @quickview="openPreview"
    />

    <EcommerceProductPreviewModal
      :product="previewProduct"
      :open="previewOpen"
      @update:open="previewOpen = $event"
    />
  </div>
</template>
