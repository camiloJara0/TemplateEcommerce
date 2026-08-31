<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useResenasService } from '~/composables/services/resenas'

definePageMeta({ layout: 'client' })

const route = useRoute()
const slug = String(route.params.slug ?? '')

const productStore = useProductStore()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()
const { current, reviewsByProduct } = storeToRefs(productStore)
const { productIds } = storeToRefs(favoriteStore)

const productReviews = computed(() => reviewsByProduct.value[Number(current.value?.id)] ?? [])
const isFavorite = computed(() => current.value ? productIds.value.includes(current.value.id) : false)

const quantity = ref(1)
const selectedImage = ref<string | null>(null)

const { currency, discountPercent, effectivePrice } = useFormat()
const price = computed(() => current.value ? effectivePrice(current.value.price, current.value.price_discount) : 0)
const discount = computed(() => current.value ? discountPercent(current.value.price, current.value.price_discount) : 0)
const image = computed(() => selectedImage.value ?? current.value?.images?.[0]?.url ?? null)
const outOfStock = computed(() => (current.value?.stock ?? 0) <= 0)

const reviewService = useResenasService()

const newReviewRating = ref(5)
const newReviewComment = ref('')
const submittingReview = ref(false)
const showReviewForm = ref(false)

async function toggleFavorite() {
  if (!current.value) return
  await favoriteStore.toggle(current.value.id)
}

async function addToCart() {
  if (!current.value) return
  await cartStore.addItem({
    product_id: current.value.id,
    quantity: quantity.value
  })
}

async function submitReview() {
  if (!current.value || !newReviewComment.value) return
  submittingReview.value = true
  try {
    await reviewService.crear(current.value.id, {
      rating: newReviewRating.value,
      comment: newReviewComment.value
    })
    showReviewForm.value = false
    newReviewComment.value = ''
  } finally {
    submittingReview.value = false
  }
}

watchEffect(async () => {
  if (slug) {
    await productStore.loadOne(slug)
    if (current.value?.id) {
      await productStore.loadReviews(current.value.id)
      await productStore.loadRelated(current.value.id)
    }
  }
})

watchEffect(() => {
  if (current.value && !selectedImage.value) {
    selectedImage.value = current.value.images?.[0]?.url ?? null
  }
})

useSeoMeta({
  title: () => current.value?.name ?? 'Producto',
  description: () => current.value?.description ?? '',
  ogTitle: () => current.value?.name ?? 'Producto',
  ogDescription: () => current.value?.description ?? '',
  ogImage: () => current.value?.images?.[0]?.url ?? undefined
})

useHead({
  script: computed(() => {
    if (!current.value) return []
    const p = current.value
    return [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        image: p.images?.map(img => img.url) ?? [],
        description: p.description ?? '',
        sku: p.sku,
        brand: p.brand ? { '@type': 'Brand', name: p.brand.name } : undefined,
        offers: {
          '@type': 'Offer',
          price: p.price_discount ?? p.price,
          priceCurrency: 'COP',
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `/producto/${p.slug}`
        },
        aggregateRating: p.rating_avg ? {
          '@type': 'AggregateRating',
          ratingValue: p.rating_avg,
          reviewCount: p.rating_count ?? 0
        } : undefined
      })
    }]
  })
})
</script>

<template>
  <div class="page-container py-8 sm:py-10 homepage-section-bg">
    <div
      v-if="!current"
      class="animate-pulse space-y-6"
    >
      <div class="grid lg:grid-cols-2 gap-8">
        <div class="aspect-square surface bg-slate-200 dark:bg-slate-800" />
        <div class="space-y-3">
          <div class="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div class="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div class="h-10 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>

    <article
      v-else
      class="space-y-10"
    >
      <!-- Breadcrumb -->
      <nav
        class="text-sm text-theme-muted"
        aria-label="Navegación"
      >
        <NuxtLink
          to="/"
          class="hover:text-theme-brand"
        >Inicio</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink
          to="/catalogo"
          class="hover:text-theme-brand"
        >Catálogo</NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-theme">{{ current.name }}</span>
      </nav>

      <!-- Product hero -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery -->
        <div class="space-y-3">
          <div class="surface overflow-hidden aspect-square bg-theme-imagenes">
            <img
              v-if="image"
              :src="image"
              :alt="current.name"
              class="size-full object-cover"
            >
            <div
              v-else
              class="size-full flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-image"
                class="size-16 text-theme-muted"
              />
            </div>
          </div>
          <div
            v-if="current.images && current.images.length > 1"
            class="grid grid-cols-4 gap-2"
          >
            <button
              v-for="img in current.images"
              :key="img.id"
              type="button"
              class="aspect-square rounded-xl overflow-hidden border-2 transition-colors"
              :class="selectedImage === img.url
                ? 'border-theme-brand'
                : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'"
              @click="selectedImage = img.url"
            >
              <img
                :src="img.url"
                :alt="img.alt || current.name"
                class="size-full object-cover"
              >
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <UBadge
              v-if="current.brand"
              :label="current.brand.name"
              color="neutral"
              variant="subtle"
            />
            <UBadge
              v-if="discount > 0"
              :label="`-${discount}%`"
              color="error"
              variant="solid"
            />
            <UBadge
              v-if="outOfStock"
              label="Agotado"
              color="neutral"
              variant="outline"
            />
          </div>

          <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">
            {{ current.name }}
          </h1>
          <p
            v-if="current.rating_avg"
            class="mt-2 flex items-center gap-2 text-sm text-theme-muted"
          >
            <span class="flex items-center gap-0.5 text-amber-400">
              <UIcon
                v-for="n in 5"
                :key="n"
                name="i-lucide-star"
                class="size-3.5"
                :class="n <= Math.round(current.rating_avg ?? 0) ? 'fill-current' : 'opacity-30'"
              />
            </span>
            {{ current.rating_avg.toFixed(1) }} · {{ current.rating_count }} reseñas
          </p>

          <div class="mt-5 flex items-baseline gap-3">
            <span class="text-3xl sm:text-4xl font-semibold tabular-nums">
              {{ currency(price) }}
            </span>
            <span
              v-if="discount > 0"
              class="text-lg text-theme-muted line-through tabular-nums"
            >
              {{ currency(current.price) }}
            </span>
          </div>

          <p
            v-if="current.description"
            class="mt-5 text-theme-secondary leading-relaxed"
          >
            {{ current.description }}
          </p>

          <!-- Quantity + actions -->
          <div class="mt-8 flex items-center gap-3">
            <div class="flex items-center surface rounded-xl overflow-hidden">
              <UButton
                icon="i-lucide-minus"
                size="md"
                color="neutral"
                variant="ghost"
                :disabled="quantity <= 1"
                aria-label="Reducir"
                @click="quantity = Math.max(1, quantity - 1)"
              />
              <span class="w-10 text-center text-sm tabular-nums">{{ quantity }}</span>
              <UButton
                icon="i-lucide-plus"
                size="md"
                color="neutral"
                variant="ghost"
                :disabled="outOfStock"
                aria-label="Aumentar"
                @click="quantity = Math.min(current.stock, quantity + 1)"
              />
            </div>

            <UButton
              icon="i-lucide-shopping-bag"
              color="primary"
              size="lg"
              :label="outOfStock ? 'Agotado' : 'Agregar al carrito'"
              :disabled="outOfStock"
              class="flex-1 rounded-xl"
              @click="addToCart"
            />

            <UButton
              :icon="isFavorite ? 'i-lucide-heart' : 'i-lucide-heart'"
              :color="isFavorite ? 'primary' : 'neutral'"
              :variant="isFavorite ? 'solid' : 'outline'"
              size="lg"
              class="rounded-xl"
              :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
              @click="toggleFavorite"
            />
          </div>

          <!-- Meta -->
          <dl class="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-theme pt-6">
            <div>
              <dt class="text-theme-muted">
                SKU
              </dt>
              <dd class="font-medium tabular-nums">
                {{ current.sku }}
              </dd>
            </div>
            <div>
              <dt class="text-theme-muted">
                Stock disponible
              </dt>
              <dd class="font-medium tabular-nums">
                {{ current.stock }}
              </dd>
            </div>
            <div v-if="current.category">
              <dt class="text-theme-muted">
                Categoría
              </dt>
              <dd class="font-medium">
                {{ current.category.name }}
              </dd>
            </div>
            <div v-if="current.tags && current.tags.length">
              <dt class="text-theme-muted">
                Etiquetas
              </dt>
              <dd class="flex flex-wrap gap-1 mt-1">
                <UBadge
                  v-for="tag in current.tags"
                  :key="tag.id"
                  :label="tag.name"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Reviews -->
      <section class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-semibold">
            Reseñas
          </h2>
          <UModal
            v-model:open="showReviewForm"
            :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
          >
            <UButton
              label="Escribir reseña"
              icon="i-lucide-pen-line"
              color="primary"
              variant="subtle"
              size="sm"
              class="rounded-xl"
            />
            <template #header>
              <h3 class="text-base font-semibold">
                Escribir reseña
              </h3>
            </template>
            <template #body>
              <div class="p-4 space-y-3">
                <UiBaseSelect
                  v-model="newReviewRating"
                  label="Calificación"
                  :items="[
                    { label: '1 estrella', value: 1 },
                    { label: '2 estrellas', value: 2 },
                    { label: '3 estrellas', value: 3 },
                    { label: '4 estrellas', value: 4 },
                    { label: '5 estrellas', value: 5 }
                  ]"
                />
                <UiBaseTextarea
                  v-model="newReviewComment"
                  label="Comentario"
                  placeholder="Cuéntanos qué te pareció"
                  :rows="5"
                />
                <UiBaseButton
                  label="Enviar reseña"
                  color="primary"
                  block
                  :loading="submittingReview"
                  @click="submitReview"
                />
              </div>
            </template>
          </UModal>
        </div>

        <FeedbackEmptyState
          v-if="!productReviews.length"
          icon="i-lucide-message-square"
          title="Sin reseñas aún"
          description="Sé el primero en opinar sobre este producto."
        />

        <div
          v-else
          class="grid sm:grid-cols-2 gap-4"
        >
          <article
            v-for="review in productReviews"
            :key="review.id"
            class="surface p-5"
          >
            <div class="flex items-center gap-2 mb-2">
              <UAvatar
                :src="review.user?.foto || undefined"
                :alt="review.user?.nombre"
                size="sm"
              />
              <p class="font-medium text-sm">
                {{ review.user?.nombre ?? 'Cliente' }}
              </p>
            </div>
            <div class="flex items-center gap-0.5 text-amber-400 mb-2">
              <UIcon
                v-for="n in 5"
                :key="n"
                name="i-lucide-star"
                class="size-3.5"
                :class="n <= review.rating ? 'fill-current' : 'opacity-30'"
              />
            </div>
            <p
              v-if="review.comment"
              class="text-sm text-theme-secondary leading-relaxed"
            >
              {{ review.comment }}
            </p>
          </article>
        </div>
      </section>

      <!-- Product page sections (configured via admin) -->
      <ClientProductPage
        v-if="current"
        :product="current"
        :images="current.images?.map(img => img.url)"
        :hide-hero="true"
      />
    </article>
  </div>
</template>
