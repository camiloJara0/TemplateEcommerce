<script setup lang="ts">
import type { Product } from '~/types/catalog'
import type { AddCartItemPayload } from '~/types/commerce'

const props = defineProps<{
  product: Product
  compact?: boolean
}>()

const emit = defineEmits<{
  quickview: [product: Product]
}>()

const { currency, discountPercent, effectivePrice } = useFormat()
const toast = useToast()
const carrito = useCartStore()

const price = computed(() => effectivePrice(props.product.price, props.product.price_discount))
const discount = computed(() => discountPercent(props.product.price, props.product.price_discount))
const image = computed(() => props.product.images?.[0]?.url)
const outOfStock = computed(() => (props.product.stock ?? 0) <= 0)

const hovered = ref(false)

function addToCart(product: Product) {
  carrito.addItem(product as unknown as AddCartItemPayload)
  toast.add({
    title: 'Agregado al carrito',
    description: props.product.name,
    color: 'success',
    icon: 'i-lucide-shopping-bag'
  })
}
</script>

<template>
  <article
    class="group relative overflow-hidden flex flex-col transition-all duration-500 ease-out border-theme bg-theme-surface"
    :class="[
      hovered ? 'scale-[1.02] shadow-2xl -translate-y-1' : 'shadow-md hover:shadow-lg',
      compact ? 'rounded-xl' : 'rounded-2xl'
    ]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Image -->
    <NuxtLink
      :to="`/producto/${product.slug}`"
      class="relative block overflow-hidden image-bg-themed"
      :class="compact ? 'aspect-square' : 'aspect-4/5'"
    >
      <img
        v-if="image"
        :src="image"
        :alt="product.images?.[0]?.alt || product.name"
        class="size-full object-cover transition-transform duration-700 ease-out"
        :class="hovered ? 'scale-110' : 'scale-100'"
        loading="lazy"
        decoding="async"
      >
      <div v-else class="size-full flex items-center justify-center bg-theme-imagenes">
        <UIcon name="i-lucide-image" class="size-10 text-theme-muted" />
      </div>

      <!-- Gradient overlay on hover -->
      <div
        class="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        :class="hovered ? 'opacity-100' : 'opacity-0'"
        style="background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)"
      />

      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        <Transition name="badge-pop">
          <UBadge
            v-if="discount > 0"
            :label="`-${discount}%`"
            color="error"
            variant="solid"
            size="sm"
            class="backdrop-blur-sm"
          />
        </Transition>
        <UBadge
          v-if="product.is_featured"
          label="Destacado"
          color="primary"
          variant="solid"
          size="sm"
          class="backdrop-blur-sm"
        />
      </div>

      <!-- Out of stock overlay -->
      <Transition name="fade">
        <div
          v-if="outOfStock"
          class="absolute inset-0 flex items-center justify-center z-10"
          style="background: rgba(255,255,255,0.6); backdrop-filter: blur(2px)"
        >
          <UBadge label="Agotado" color="neutral" variant="solid" size="lg" />
        </div>
      </Transition>

      <!-- Quick view button -->
      <Transition name="badge-pop">
        <button
          v-if="hovered && !outOfStock"
          class="absolute bottom-3 right-3 z-10 size-9 rounded-full bg-theme-surface backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border-theme"
          aria-label="Vista rápida"
          @click.prevent="emit('quickview', product)"
        >
          <UIcon name="i-lucide-eye" class="size-4 text-theme" />
        </button>
      </Transition>
    </NuxtLink>

    <!-- Content -->
    <div class="flex flex-col flex-1 p-4 gap-2 bg-theme-surface">
      <div class="flex items-start justify-between gap-2">
        <p
          v-if="product.brand?.name"
          class="text-xs font-medium uppercase tracking-wide text-theme-brand"
        >
          {{ product.brand.name }}
        </p>
        <div v-if="product.rating_avg" class="flex items-center gap-0.5 text-xs text-amber-500 shrink-0">
          <UIcon name="i-lucide-star" class="size-3.5 fill-current" />
          <span class="font-medium">{{ product.rating_avg.toFixed(1) }}</span>
        </div>
      </div>

      <NuxtLink
        :to="`/producto/${product.slug}`"
        class="font-medium text-sm sm:text-base text-theme line-clamp-2 hover:text-theme-brand transition-colors duration-300"
      >
        {{ product.name }}
      </NuxtLink>

      <div class="mt-auto pt-2 flex items-end justify-between gap-2">
        <div>
          <p class="text-base sm:text-lg font-semibold text-theme-brand tabular-nums">
            {{ currency(price) }}
          </p>
          <p v-if="discount > 0" class="text-xs text-theme-muted line-through tabular-nums">
            {{ currency(product.price) }}
          </p>
        </div>

        <Transition name="badge-pop">
          <UButton
            v-if="!outOfStock"
            icon="i-lucide-plus"
            color="primary"
            size="sm"
            class="rounded-xl shrink-0 add-btn transition-all duration-300"
            :class="hovered ? 'shadow-lg' : ''"
            aria-label="Agregar al carrito"
            @click.prevent="addToCart(product)"
          />
        </Transition>
      </div>
    </div>
  </article>
</template>

<style scoped>
.add-btn {
  background-color: var(--color-brand, #6366f1);
}
.add-btn:hover {
  background-color: var(--color-brand-hover, #4f46e5);
}

/* Transitions */
.badge-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-pop-leave-active { transition: all 0.2s ease-in; }
.badge-pop-enter-from { opacity: 0; transform: scale(0.6) translateY(4px); }
.badge-pop-leave-to { opacity: 0; transform: scale(0.8); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
