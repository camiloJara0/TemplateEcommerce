<script setup lang="ts">
import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { PRODUCT_SECTION_META, isIndividualSection } from '~/types/store'

const props = withDefaults(defineProps<{
  sections: ProductoSecciones
  product?: Record<string, unknown>
  images?: string[]
  editMode?: boolean
  selectedSection?: string
}>(), {
  editMode: false,
  selectedSection: '',
})

const emit = defineEmits<{
  select: [key: string]
}>()

const productData = computed(() => props.product ?? {})
const productId = computed(() => productData.value?.id as number | undefined)

const productImages = computed(() => {
  if (props.images?.length) return props.images
  const imgs = productData.value?.images as Array<{ url: string }> | undefined
  return imgs?.map(i => i.url) ?? []
})

const galleryImages = computed(() => {
  const pageConfig = productData.value?.page_config as Record<string, unknown> | undefined
  const galleryConfig = pageConfig?.gallery as Record<string, unknown> | undefined
  const customImages = galleryConfig?.images as string[] | undefined
  if (customImages?.length) return customImages
  return productImages.value
})

/**
 * Validate if a section should be rendered for the current product.
 * - Global sections: use `show` flag
 * - Individual sections: check if productId is in `product_ids`
 */
function isSectionVisible(key: ProductSectionKey): boolean {
  const section = (props.sections[key] as unknown as Record<string, unknown>)
  if (!section) return false

  if (isIndividualSection(key)) {
    const pids = section.product_ids as number[] | undefined
    if (productId.value == null || !pids) return false
    return pids.includes(productId.value)
  }

  // Global sections: use show flag
  return section.show === true
}

/** Ordered keys that should be rendered */
const visibleKeys = computed<ProductSectionKey[]>(() => {
  const allKeys = Object.keys(props.sections) as ProductSectionKey[]
  const visible = allKeys.filter(key => isSectionVisible(key))

  visible.sort((a, b) => {
    const orderA = ((props.sections[a] as unknown as Record<string, unknown>).order as number) ?? 0
    const orderB = ((props.sections[b] as unknown as Record<string, unknown>).order as number) ?? 0
    return orderA - orderB
  })

  return visible
})

function sectionMeta(key: ProductSectionKey) {
  return PRODUCT_SECTION_META[key]
}

function isSelected(key: string) {
  return props.editMode && props.selectedSection === key
}
</script>

<template>
  <div class="product-sections">
    <template v-for="key in visibleKeys" :key="key">
      <div
        :class="[
          'relative',
          editMode && 'cursor-pointer ring-offset-2 ring-offset-transparent transition-all duration-200 hover:ring-2 hover:ring-primary-400/50',
          isSelected(key) && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
        ]"
        @click="editMode && emit('select', key)"
      >
        <!-- Edit mode label -->
        <div v-if="editMode" class="absolute top-2 left-2 z-20">
          <span class="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm">
            {{ sectionMeta(key)?.label }}
          </span>
        </div>

        <!-- Hero -->
        <ClientProductHero v-if="key === 'hero'" :config="sections.hero">
          <div class="grid md:grid-cols-2 gap-8 py-8">
            <ClientProductGallery
              v-if="sections.gallery.show && galleryImages.length"
              :config="sections.gallery"
              :images="galleryImages"
            />
            <div v-else-if="productImages.length" class="space-y-4">
              <img :src="productImages[0]" class="w-full h-96 object-cover rounded-2xl" :alt="(productData.name as string) ?? 'Producto'" />
            </div>
            <div class="space-y-6">
              <div v-if="productData.brand" class="text-sm text-theme-brand font-medium">{{ productData.brand }}</div>
              <h1 class="text-3xl font-bold text-theme">{{ productData.name }}</h1>
              <div v-if="productData.rating" class="flex items-center gap-2">
                <div class="flex items-center gap-0.5">
                  <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= (productData.rating as number) ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
                </div>
                <span class="text-sm text-theme-muted">({{ productData.reviews_count }} reseñas)</span>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-bold text-theme">${{ (productData.price as number)?.toLocaleString() }}</span>
                <span v-if="productData.price_discount" class="text-lg text-theme-muted line-through">${{ (productData.price_discount as number)?.toLocaleString() }}</span>
              </div>
              <p class="text-theme-secondary">{{ productData.description }}</p>
              <div class="flex gap-3">
                <UButton label="Agregar al carrito" icon="i-lucide-shopping-cart" size="lg" class="flex-1" />
                <UButton icon="i-lucide-heart" size="lg" variant="outline" />
                <UButton v-if="sections.hero.show_share" icon="i-lucide-share-2" size="lg" variant="outline" />
              </div>
            </div>
          </div>
        </ClientProductHero>

        <!-- Gallery (standalone, outside hero) -->
        <ClientProductGallery
          v-else-if="key === 'gallery' && (!sections.hero.show || !galleryImages.length)"
          :config="sections.gallery"
          :images="galleryImages"
        />

        <!-- Benefits -->
        <ClientProductBenefits v-else-if="key === 'benefits'" :config="sections.benefits" />

        <!-- Problem/Solution -->
        <ClientProductProblemSolution v-else-if="key === 'problem_solution'" :config="sections.problem_solution" />

        <!-- Transform -->
        <ClientProductTransform v-else-if="key === 'transform'" :config="sections.transform" />

        <!-- Features -->
        <ClientProductFeatures v-else-if="key === 'features'" :config="sections.features" />

        <!-- Comparison -->
        <ClientProductComparison
          v-else-if="key === 'comparison'"
          :config="sections.comparison"
          :product="productData"
        />

        <!-- Bundle -->
        <ClientProductBundle
          v-else-if="key === 'bundle'"
          :config="sections.bundle"
          :product="productData"
        />

        <!-- Countdown -->
        <ClientProductCountdown v-else-if="key === 'countdown'" :config="sections.countdown" />

        <!-- Testimonials -->
        <ClientProductTestimonials v-else-if="key === 'testimonials'" :config="sections.testimonials" />

        <!-- UGC -->
        <ClientProductUgc v-else-if="key === 'ugc'" :config="sections.ugc" />

        <!-- Warranty -->
        <ClientProductWarranty v-else-if="key === 'warranty'" :config="sections.warranty" />

        <!-- FAQ -->
        <ClientProductFaq v-else-if="key === 'faq'" :config="sections.faq" />

        <!-- CTA -->
        <ClientProductCta v-else-if="key === 'cta'" :config="sections.cta" />
      </div>
    </template>

    <!-- Empty state for edit mode -->
    <div v-if="editMode && !visibleKeys.length" class="py-16 text-center">
      <UIcon name="i-lucide-eye-off" class="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-sm text-slate-400">Activa secciones en el editor para ver la preview</p>
    </div>
  </div>
</template>
