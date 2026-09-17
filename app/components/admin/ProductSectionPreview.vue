<script setup lang="ts">
import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { MOCK_PRODUCT_FOR_PREVIEW, INDIVIDUAL_PRODUCT_SECTIONS } from '~/types/store'

const props = defineProps<{ value: ProductoSecciones }>()

// For preview: inject mock product ID into individual sections so renderer shows them
const previewSections = computed<ProductoSecciones>(() => {
  const sections = JSON.parse(JSON.stringify(props.value)) as ProductoSecciones
  for (const key of INDIVIDUAL_PRODUCT_SECTIONS) {
    const section = (sections as unknown as Record<string, unknown>)[key] as Record<string, unknown>
    if (!section.product_ids) section.product_ids = []
    const pids = section.product_ids as number[]
    if (!pids.includes(MOCK_PRODUCT_FOR_PREVIEW.id)) {
      pids.push(MOCK_PRODUCT_FOR_PREVIEW.id)
    }
  }
  return sections
})

const productWithConfig = computed(() => ({
  ...MOCK_PRODUCT_FOR_PREVIEW,
  page_config: props.value as unknown as Record<string, unknown>
}))

const selectedSection = ref('')

function onSelect(key: string) {
  selectedSection.value = selectedSection.value === key ? '' : key
}
</script>

<template>
  <ClientProductSectionRenderer
    :sections="previewSections"
    :product="productWithConfig"
    :images="MOCK_PRODUCT_FOR_PREVIEW.images"
    edit-mode
    :selected-section="selectedSection"
    @select="onSelect"
  />
</template>
