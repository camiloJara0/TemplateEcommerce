<script setup lang="ts">
import type { Product } from '~/types/catalog'

const props = defineProps<{
  product: Product | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const { currency, discountPercent, effectivePrice } = useFormat()
const toast = useToast()
const carrito = useCartStore()

const price = computed(() => props.product ? effectivePrice(props.product.price, props.product.price_discount) : 0)
const discount = computed(() => props.product ? discountPercent(props.product.price, props.product.price_discount) : 0)
const images = computed(() => props.product?.images ?? [])
const currentImageIndex = ref(0)
const currentImage = computed(() => images.value[currentImageIndex.value]?.url)

function nextImage() {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = images.value.length - 1
  }
}

function addToCart() {
  if (!props.product) return
  carrito.addItem({ id: props.product.id, quantity: 1 })
  toast.add({
    title: 'Agregado al carrito',
    description: props.product.name,
    color: 'success',
    icon: 'i-lucide-shopping-bag'
  })
  close()
}

function close() {
  emit('update:open', false)
  emit('close')
}

watch(() => props.open, (val) => {
  if (val) currentImageIndex.value = 0
})
</script>

<template>
  <UModal
    :open="open"
    :ui="{ content: 'max-w-4xl w-full mx-4 overflow-hidden', overlay: 'backdrop-blur-sm' }"
    @update:open="emit('update:open', $event)"
  >
    <template #content v-if="product">
      <div class="flex flex-col md:flex-row">
        <!-- Image gallery -->
        <div class="relative md:w-1/2 bg-theme-imagenes">
          <div class="aspect-square relative overflow-hidden">
            <Transition
              name="slide"
              mode="out-in"
            >
              <img
                :key="currentImageIndex"
                :src="currentImage"
                :alt="product.name"
                class="size-full object-cover"
              />
            </Transition>

            <!-- Navigation arrows -->
            <template v-if="images.length > 1">
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-theme-surface backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 border-theme"
                @click="prevImage"
              >
                <UIcon name="i-lucide-chevron-left" class="size-5 text-theme" />
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-theme-surface backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 border-theme"
                @click="nextImage"
              >
                <UIcon name="i-lucide-chevron-right" class="size-5 text-theme" />
              </button>
            </template>

            <!-- Thumbnails -->
            <div
              v-if="images.length > 1"
              class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1.5 rounded-full bg-black/40 backdrop-blur-sm"
            >
              <button
                v-for="(_, i) in images.slice(0, 6)"
                :key="i"
                class="size-8 rounded-full overflow-hidden border-2 transition-all duration-200"
                :class="i === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'"
                @click="currentImageIndex = i"
              >
                <img
                  :src="images[i]?.url"
                  :alt="`${product.name} ${i + 1}`"
                  class="size-full object-cover"
                />
              </button>
              <span
                v-if="images.length > 6"
                class="flex items-center text-xs text-white/80 px-1"
              >
                +{{ images.length - 6 }}
              </span>
            </div>

            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5">
              <UBadge
                v-if="discount > 0"
                :label="`-${discount}%`"
                color="error"
                variant="solid"
                size="sm"
              />
              <UBadge
                v-if="product.is_featured"
                label="Destacado"
                color="primary"
                variant="solid"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Product info -->
        <div class="md:w-1/2 p-6 flex flex-col homepage-section-bg">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p
                v-if="product.brand?.name"
                class="text-xs font-medium uppercase tracking-wide mb-1"
                style="color: var(--color-brand, #6366f1)"
              >
                {{ product.brand.name }}
              </p>
              <h2 class="text-xl font-semibold text-theme leading-tight">
                {{ product.name }}
              </h2>
            </div>
            <button
              class="size-8 rounded-full flex items-center justify-center hover:bg-theme-imagenes transition-colors shrink-0"
              @click="close"
            >
              <UIcon name="i-lucide-x" class="size-5 text-theme-muted" />
            </button>
          </div>

          <!-- Rating -->
          <div
            v-if="product.rating_avg"
            class="flex items-center gap-2 mb-4"
          >
            <div class="flex gap-0.5 text-amber-400">
              <UIcon
                v-for="s in 5"
                :key="s"
                name="i-lucide-star"
                class="size-4"
                :class="s <= Math.round(product.rating_avg ?? 0) ? 'fill-current' : 'text-theme-muted'"
              />
            </div>
            <span class="text-sm text-theme-muted">
              {{ product.rating_avg.toFixed(1) }}
              <span v-if="product.rating_count">({{ product.rating_count }})</span>
            </span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-2xl font-bold tabular-nums" style="color: var(--color-brand, #6366f1)">
              {{ currency(price) }}
            </span>
            <span
              v-if="discount > 0"
              class="text-base text-theme-muted line-through tabular-nums"
            >
              {{ currency(product.price) }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-sm text-theme-secondary leading-relaxed mb-6 line-clamp-4">
            {{ product.description }}
          </p>

          <!-- Stock -->
          <div class="mb-6">
            <div
              v-if="(product.stock ?? 0) > 0"
              class="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
            >
              <div class="size-2 rounded-full bg-emerald-500 animate-pulse" />
              En stock ({{ product.stock }} disponibles)
            </div>
            <div
              v-else
              class="flex items-center gap-2 text-sm text-red-500"
            >
              <div class="size-2 rounded-full bg-red-500" />
              Agotado
            </div>
          </div>

          <!-- Spacer -->
          <div class="mt-auto" />

          <!-- Actions -->
          <div class="flex gap-3">
            <UButton
              label="Agregar al carrito"
              icon="i-lucide-shopping-cart"
              size="lg"
              class="flex-1 rounded-xl"
              :disabled="(product.stock ?? 0) <= 0"
              style="background-color: var(--color-brand, #6366f1)"
              @click="addToCart"
            />
            <NuxtLink
              :to="`/producto/${product.slug}`"
              class="flex items-center justify-center size-12 rounded-xl border-theme hover:bg-theme-imagenes transition-colors"
              @click="close"
            >
              <UIcon name="i-lucide-arrow-right" class="size-5 text-theme-secondary" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
