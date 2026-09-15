<script setup lang="ts">
const { open } = useCartDrawer()
const { currency } = useFormat()

const cartStore = useCartStore()
const { cart, loading } = storeToRefs(cartStore)

const items = computed(() => cart.value?.items ?? [])
const subtotal = computed(() => cart.value?.subtotal ?? items.value.reduce(
  (s, i) => s + (i.price ?? 0) * i.quantity,
  0
))
const total = computed(() => subtotal.value)

onMounted(() => {
  void cartStore.load()
})
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    :ui="{ content: 'max-w-md w-full' }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h2 class="font-semibold text-lg">
            Tu carrito
          </h2>
          <p class="text-xs text-slate-500">
            {{ items.length }} productos
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div
        v-if="items.length"
        class="space-y-4"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="flex gap-3 animate-fade-in"
        >
          <div class="size-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="size-full object-cover"
              loading="lazy"
            >
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
              {{ item.name }}
            </p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-1 tabular-nums">
              {{ currency(item.price) }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <UButton
                icon="i-lucide-minus"
                size="xs"
                color="neutral"
                variant="outline"
                class="rounded-lg"
                aria-label="Reducir cantidad"
                @click="item.quantity > 1 ? cartStore.updateItem(item.id, {...item, quantity: item.quantity - 1}) : cartStore.removeItem(item.id)"
              />
              <span class="text-sm w-6 text-center tabular-nums">{{ item.quantity }}</span>
              <UButton
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="outline"
                class="rounded-lg"
                aria-label="Aumentar cantidad"
                @click="cartStore.updateItem(item.id, {...item, quantity: item.quantity + 1})"
              />
            </div>
          </div>
          <UButton
            icon="i-lucide-trash-2"
            size="xs"
            color="neutral"
            variant="ghost"
            class="shrink-0 self-start"
            aria-label="Eliminar"
            @click="cartStore.removeItem(item.id)"
          />
        </div>
      </div>

      <FeedbackEmptyState
        v-else
        icon="i-lucide-shopping-bag"
        title="Carrito vacío"
        description="Explora el catálogo y agrega tus favoritos."
        action-label="Ver catálogo"
        action-to="/catalogo"
      />
    </template>

    <template
      v-if="items.length"
      #footer
    >
      <div class="w-full space-y-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Subtotal</span>
          <span class="font-semibold text-lg tabular-nums">{{ currency(subtotal) }}</span>
        </div>
        <p class="text-xs text-slate-400">
          Envío e impuestos se calculan en el checkout.
        </p>
        <UButton
          to="/checkout"
          block
          size="lg"
          color="primary"
          label="Ir al checkout"
          trailing-icon="i-lucide-arrow-right"
          class="cta-glow"
          @click="open = false"
        />
        <UButton
          to="/carrito"
          block
          size="md"
          color="neutral"
          variant="ghost"
          label="Ver carrito completo"
          @click="open = false"
        />
      </div>
    </template>
  </USlideover>
</template>
