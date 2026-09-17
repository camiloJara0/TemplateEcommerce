<script setup lang="ts">
const props = withDefaults(defineProps<{
  product: Record<string, unknown>
  images?: string[]
  hideHero?: boolean
}>(), { hideHero: false })

const { sections: rawSections } = useProductSections(
  props.product?.page_config as Record<string, unknown> | null | undefined
)

const productImages = computed(() => {
  if (props.images?.length) return props.images
  const imgs = props.product?.images as Array<{ url: string }> | undefined
  return imgs?.map(i => i.url) ?? []
})

const galleryImages = computed(() => {
  const pageConfig = props.product?.page_config as Record<string, unknown> | undefined
  const galleryConfig = pageConfig?.gallery as Record<string, unknown> | undefined
  const customImages = galleryConfig?.images as string[] | undefined
  if (customImages?.length) return customImages
  return productImages.value
})

// If hideHero, force hero.show = false so the renderer skips it
const sections = computed(() => {
  if (props.hideHero) {
    return {
      ...rawSections.value,
      hero: { ...rawSections.value.hero, show: false },
    }
  }
  return rawSections.value
})
</script>

<template>
  <div class="space-y-10">
    <ClientProductSectionRenderer
      :sections="sections"
      :product="product"
      :images="galleryImages"
    />
  </div>
</template>
