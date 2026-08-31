<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'client', middleware: ['auth'] })

const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()
const { items, loading } = storeToRefs(favoriteStore)
const { currency } = useFormat()

async function remove(productId: number) {
  await favoriteStore.remove(productId)
}

async function moveToCart(itemId: number) {
  await favoriteStore.moveToCart(itemId)
  await cartStore.load(true)
}

onMounted(() => {
  void favoriteStore.load()
})

useSeoMeta({ title: 'Mis favoritos', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">
          Mis favoritos
        </h1>
        <p class="page-subtitle">
          {{ items.length }} {{ items.length === 1 ? 'producto' : 'productos' }} guardados
        </p>
      </div>
    </div>

    <FeedbackSkeletonLoader
      v-if="loading && !items.length"
      variant="card"
      :count="4"
    />

    <FeedbackEmptyState
      v-else-if="!items.length"
      icon="i-lucide-heart"
      title="Aún no tienes favoritos"
      description="Explora el catálogo y guarda tus productos preferidos."
      action-label="Ir al catálogo"
      action-to="/catalogo"
    />

    <div
      v-else
      class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <article
        v-for="item in items"
        :key="item.id"
        class="surface overflow-hidden flex flex-col hover-lift"
      >
        <NuxtLink
          v-if="item.product?.slug"
          :to="`/producto/${item.product.slug}`"
          class="aspect-square bg-slate-100 dark:bg-slate-800 block"
        >
          <img
            v-if="item.product.images?.[0]"
            :src="item.product.images[0].url"
            :alt="item.product.name"
            class="size-full object-cover"
          >
        </NuxtLink>
        <div class="p-4 flex flex-col flex-1 gap-2">
          <NuxtLink
            v-if="item.product"
            :to="`/producto/${item.product.slug}`"
            class="font-medium hover:text-theme-brand line-clamp-2"
          >
            {{ item.product.name }}
          </NuxtLink>
          <p class="text-sm font-semibold tabular-nums">
            {{ currency(item.product?.price_discount ?? item.product?.price ?? 0) }}
          </p>
          <div class="mt-auto flex gap-2">
            <UButton
              size="sm"
              color="primary"
              variant="subtle"
              icon="i-lucide-shopping-bag"
              label="Al carrito"
              class="flex-1 rounded-lg"
              @click="moveToCart(item.id)"
            />
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              aria-label="Eliminar"
              class="rounded-lg"
              @click="item.product_id && remove(item.product_id)"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
