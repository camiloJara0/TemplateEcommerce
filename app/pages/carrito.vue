<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'client' })

const cartStore = useCartStore()
const router = useRouter()
const { cart, loading } = storeToRefs(cartStore)
const { currency } = useFormat()

const items = computed(() => cart.value?.items ?? [])
const subtotal = computed(() => cart.value?.subtotal ?? items.value.reduce(
  (s, i) => s + (i.price ?? 0) * i.quantity,
  0
))
const total = computed(() => subtotal.value)

async function updateQty(itemId: number, qty: number) {
  if (qty < 1) return
  await cartStore.updateItem(itemId, { quantity: qty })
}

async function removeItem(itemId: number) {
  await cartStore.removeItem(itemId)
}

async function clearCart() {
  await cartStore.clear()
}

function goToCheckout() {
  router.push('/checkout')
}

onMounted(() => {
  if (!cartStore.cart) void cartStore.load()
})

useSeoMeta({
  title: 'Mi carrito de compras',
  description: 'Revisa los productos en tu carrito y finaliza tu compra.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title">
          Mi carrito
        </h1>
        <p class="page-subtitle">
          {{ items.length }} {{ items.length === 1 ? 'producto' : 'productos' }}
        </p>
      </div>
      <UButton
        v-if="items.length"
        label="Vaciar carrito"
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        size="sm"
        class="rounded-xl"
        @click="clearCart"
      />
    </div>

    <FeedbackSkeletonLoader
      v-if="loading && !items.length"
      variant="list"
      :count="3"
    />

    <div
      v-else-if="!items.length"
      class="surface p-12"
    >
      <FeedbackEmptyState
        icon="i-lucide-shopping-bag"
        title="Tu carrito está vacío"
        description="Explora el catálogo y agrega tus productos favoritos."
        action-label="Ir al catálogo"
        action-to="/catalogo"
      />
    </div>

    <div
      v-else
      class="grid lg:grid-cols-[1fr_360px] gap-6"
    >
      <ul class="space-y-3">
        <li
          v-for="item in items"
          :key="item.id"
          class="surface p-4 flex gap-4 animate-fade-up"
        >
          <NuxtLink
            v-if="item?.slug"
            :to="`/producto/${item.slug}`"
            class="size-24 rounded-xl overflow-hidden bg-theme-imagenes shrink-0"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="size-full object-cover"
            >
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <NuxtLink
              v-if="item.slug"
              :to="`/producto/${item.slug}`"
                class="font-medium hover:text-theme-brand line-clamp-2"
            >
              {{ item.name }}
            </NuxtLink>
            <p
              v-if="item.brand"
                class="text-xs text-theme-muted mt-1"
            >
              {{ item.brand }}
            </p>
            <p class="text-sm font-semibold tabular-nums mt-2">
              {{ currency(item.price ?? 0) }}
            </p>
            <div class="mt-3 flex items-center gap-2">
              <UButton
                icon="i-lucide-minus"
                size="xs"
                color="neutral"
                variant="outline"
                :disabled="item.quantity <= 1"
                aria-label="Reducir"
                @click="updateQty(item.id, item.quantity - 1)"
              />
              <span class="w-8 text-center text-sm tabular-nums">{{ item.quantity }}</span>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="outline"
                aria-label="Aumentar"
                @click="updateQty(item.id, item.quantity + 1)"
              />
            </div>
          </div>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="neutral"
            variant="ghost"
            class="self-start"
            aria-label="Eliminar"
            @click="removeItem(item.id)"
          />
        </li>
      </ul>

      <aside class="surface p-6 h-fit lg:sticky lg:top-24 space-y-4">
        <h2 class="font-semibold">
          Resumen
        </h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
              <span class="text-theme-muted">Subtotal</span>
            <span class="font-medium tabular-nums">{{ currency(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-theme-muted">
            <span>Envío</span>
            <span>Calculado en checkout</span>
          </div>
          <USeparator />
          <div class="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span class="tabular-nums">{{ currency(total) }}</span>
          </div>
        </div>
        <UiBaseButton
          block
          size="lg"
          color="primary"
          label="Ir al checkout"
          trailing-icon="i-lucide-arrow-right"
          class="rounded-xl cta-glow"
          @click="goToCheckout"
        />
        <NuxtLink
          to="/catalogo"
          class="block text-center text-sm text-theme-muted hover:text-theme-brand"
        >
          Seguir comprando
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>
