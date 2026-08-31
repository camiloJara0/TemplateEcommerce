<script setup lang="ts">
import type { ProductoSecciones } from '~/types/store'

const props = withDefaults(defineProps<{
  product: Record<string, unknown>
  images?: string[]
  hideHero?: boolean
}>(), { hideHero: false })

const { sections: productSections } = useProductSections(props.product?.page_config as Record<string, unknown> | null | undefined)

const productImages = computed(() => {
  if (props.images?.length) return props.images
  return (props.product?.images as string[]) || []
})
</script>

<template>
  <div class="space-y-10">
    <!-- Hero: Gallery + Product Info (only if not hidden by parent) -->
    <ClientProductHero v-if="!hideHero && productSections.hero.show" :config="productSections.hero">
      <div class="grid md:grid-cols-2 gap-8 py-8">
        <!-- Gallery -->
        <ClientProductGallery
          v-if="productSections.gallery.show"
          :config="productSections.gallery"
          :images="productImages"
        />
        <div v-else class="space-y-4">
          <img v-if="productImages[0]" :src="productImages[0]" class="w-full h-96 object-cover rounded-2xl" />
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <div v-if="product?.brand" class="text-sm text-theme-brand font-medium">{{ product.brand }}</div>
          <h1 class="text-3xl font-bold text-theme">{{ product?.name }}</h1>
          <div v-if="product?.rating" class="flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="size-4" :class="s <= (product.rating as number) ? 'text-yellow-400 fill-yellow-400' : 'text-theme-muted'" />
            </div>
            <span class="text-sm text-theme-muted">({{ product.reviews_count }} reseñas)</span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-bold text-theme">${{ (product?.price as number)?.toLocaleString() }}</span>
            <span v-if="product?.price_discount" class="text-lg text-theme-muted line-through">${{ (product?.price_discount as number)?.toLocaleString() }}</span>
          </div>
          <p class="text-theme-secondary">{{ product?.description }}</p>

          <div class="flex gap-3">
            <UButton label="Agregar al carrito" icon="i-lucide-shopping-cart" size="lg" class="flex-1" />
            <UButton icon="i-lucide-heart" size="lg" variant="outline" />
            <UButton v-if="productSections.hero.show_share" icon="i-lucide-share-2" size="lg" variant="outline" />
          </div>
        </div>
      </div>
    </ClientProductHero>

    <!-- Benefits -->
    <ClientProductBenefits :config="productSections.benefits" />

    <!-- Problem/Solution -->
    <ClientProductProblemSolution :config="productSections.problem_solution" />

    <!-- Transform -->
    <ClientProductTransform :config="productSections.transform" />

    <!-- Features -->
    <ClientProductFeatures :config="productSections.features" />

    <!-- Comparison -->
    <ClientProductComparison :config="productSections.comparison" />

    <!-- Bundle -->
    <ClientProductBundle :config="productSections.bundle" />

    <!-- Countdown -->
    <ClientProductCountdown :config="productSections.countdown" />

    <!-- Testimonials -->
    <ClientProductTestimonials :config="productSections.testimonials" />

    <!-- UGC -->
    <ClientProductUgc :config="productSections.ugc" />

    <!-- Warranty -->
    <ClientProductWarranty :config="productSections.warranty" />

    <!-- FAQ -->
    <ClientProductFaq :config="productSections.faq" />

    <!-- CTA -->
    <ClientProductCta :config="productSections.cta" />
  </div>
</template>
