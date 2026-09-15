<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'client' })

const cartStore = useCartStore()
const addressStore = useAddressStore()
const shippingStore = useShippingMethodStore()
const orderStore = useOrderStore()

const { cart, sessionId } = storeToRefs(cartStore)
const { items: addresses, principal: principalAddress } = storeToRefs(addressStore)
const { items: shippingMethods } = storeToRefs(shippingStore)
const { preview, appliedCoupon } = storeToRefs(orderStore)

const { currency } = useFormat()
const toast = useToast()

const selectedAddressId = ref<number | null>(null)
const selectedShippingId = ref<number | null>(null)
const couponCode = ref('')
const notes = ref('')
const showAddressModal = ref(false)
const submitting = ref(false)

const addressOptions = computed(() => addresses.value.map(a => ({
  label: `${a.label ? a.label + ' · ' : ''}${a.ciudad} · ${a.direccion}`,
  value: a.id
})))

const shippingOptions = computed(() => shippingMethods.value.map(s => ({
  label: `${s.name} · ${currency(s.cost)}`,
  value: s.id
})))

const items = computed(() => cart.value?.items ?? [])
const subtotal = computed(() => preview.value?.subtotal ?? cart.value?.subtotal ?? 0)
const shipping = computed(() => preview.value?.shipping ?? 0)
const tax = computed(() => preview.value?.tax ?? 0)
const total = computed(() => preview.value?.total ?? subtotal.value)

async function refreshPreview() {
  if (!selectedAddressId.value || !selectedShippingId.value) return
  await orderStore.getPreview({
    session_id: sessionId.value ?? undefined,
    address_id: selectedAddressId.value,
    shipping_method_id: selectedShippingId.value,
    coupon_code: couponCode.value || undefined
  })
}

async function applyCoupon() {
  if (!couponCode.value || !subtotal.value) return
  await orderStore.applyCoupon({
    code: couponCode.value,
    subtotal: subtotal.value,
    shipping: shipping.value
  })
}

async function placeOrder() {
  if (!selectedAddressId.value || !selectedShippingId.value) {
    toast.add({
      title: 'Datos incompletos',
      description: 'Selecciona dirección y método de envío.',
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
    return
  }
  submitting.value = true
  try {
    const result = await orderStore.create({
      session_id: sessionId.value ?? undefined,
      address_id: selectedAddressId.value,
      shipping_method_id: selectedShippingId.value,
      coupon_code: appliedCoupon.value?.code || couponCode.value || undefined,
      notes: notes.value || undefined
    })
    // await cartStore.clear()
    if (result.data?.id) {
      await navigateTo(`/checkout/pago/${result.data.id}`)
    }
  } finally {
    submitting.value = false
  }
}

watch([selectedAddressId, selectedShippingId], () => {
  void refreshPreview()
})

onMounted(async () => {
  await Promise.all([
    cartStore.load(),
    addressStore.load(),
    shippingStore.loadList()
  ])
  if (principalAddress.value) selectedAddressId.value = principalAddress.value.id
  if (shippingMethods.value[0]) selectedShippingId.value = shippingMethods.value[0].id
})

useSeoMeta({
  title: 'Checkout — Finalizar compra',
  description: 'Revisa tu pedido y finaliza la compra de forma segura.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <h1 class="page-title mb-2">
      Checkout
    </h1>
    <p class="page-subtitle mb-8">
      Confirma tu pedido
    </p>

    <div
      v-if="!items.length"
      class="surface p-12"
    >
      <FeedbackEmptyState
        icon="i-lucide-shopping-bag"
        title="No hay productos en tu carrito"
        description="Agrega productos antes de finalizar la compra."
        action-label="Ir al catálogo"
        action-to="/catalogo"
      />
    </div>

    <div
      v-else
      class="grid lg:grid-cols-[1fr_380px] gap-6"
    >
      <div class="space-y-6">
        <!-- Dirección -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold">
              1. Dirección de envío
            </h2>
            <UModal
              v-model:open="showAddressModal"
              :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }"
            >
              <UButton
                size="xs"
                color="primary"
                variant="subtle"
                icon="i-lucide-plus"
                label="Nueva"
                class="rounded-lg"
              />
              <template #header>
                <h3 class="font-semibold">
                  Nueva dirección
                </h3>
              </template>
              <template #body>
                <div class="p-4">
                  <FormsAddressForm
                    :show-principal="true"
                    @success="async (data) => {
                      showAddressModal = false
                      await addressStore.load(true)
                      const created = data as { id: number }
                      if (created?.id) selectedAddressId = created.id
                    }"
                    :action="addressStore.create"
                  />
                </div>
              </template>
            </UModal>
          </div>

          <UiBaseSelect
            v-model="selectedAddressId"
            label="Selecciona una dirección"
            :items="addressOptions"
            placeholder="Sin dirección"
            :error="!selectedAddressId ? 'Selecciona una dirección' : undefined"
          />

          <div
            v-if="principalAddress && !selectedAddressId"
            class="text-xs text-slate-400"
          >
            Tu dirección principal: {{ principalAddress.ciudad }} · {{ principalAddress.direccion }}
          </div>
        </section>

        <!-- Envío -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <h2 class="font-semibold">
            2. Método de envío
          </h2>
          <UiBaseSelect
            v-model="selectedShippingId"
            label="Selecciona un método"
            :items="shippingOptions"
            placeholder="Selecciona"
            :error="!selectedShippingId ? 'Selecciona un método' : undefined"
          />
        </section>

        <!-- Cupón + Notas -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <h2 class="font-semibold">
            3. Cupón y notas
          </h2>
          <div class="flex gap-2">
            <UInput
              v-model="couponCode"
              placeholder="Código de cupón"
              size="md"
              icon="i-lucide-ticket"
              class="flex-1"
            />
            <UButton
              label="Aplicar"
              color="primary"
              variant="subtle"
              :disabled="!couponCode"
              @click="applyCoupon"
            />
          </div>
          <UBadge
            v-if="appliedCoupon"
            :label="`${appliedCoupon.code} aplicado`"
            color="success"
            variant="subtle"
            icon="i-lucide-check"
          />
          <UiBaseTextarea
            v-model="notes"
            label="Notas (opcional)"
            placeholder="Indicaciones para la entrega"
            :rows="3"
          />
        </section>
      </div>

      <!-- Resumen -->
      <aside class="surface p-6 h-fit lg:sticky lg:top-24 space-y-4">
        <h2 class="font-semibold">
          Resumen del pedido
        </h2>
        <ul class="space-y-2 text-sm max-h-48 overflow-y-auto">
          <li
            v-for="item in items"
            :key="item.id"
            class="flex justify-between gap-3"
          >
            <span class="text-slate-600 dark:text-slate-300 truncate">
              {{ item.quantity }}× {{ item?.name ?? 'Producto' }}
            </span>
            <span class="font-medium tabular-nums shrink-0">
              {{ currency((item.price ?? 0) * item.quantity) }}
            </span>
          </li>
        </ul>
        <USeparator />
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Subtotal</span>
            <span class="tabular-nums">{{ currency(subtotal) }}</span>
          </div>
          <div
            v-if="appliedCoupon"
            class="flex justify-between text-emerald-600"
          >
            <span>Descuento</span>
            <span class="tabular-nums">-{{ currency(preview?.discount ?? 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Envío</span>
            <span class="tabular-nums">{{ currency(shipping) }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Impuestos</span>
            <span class="tabular-nums">{{ currency(tax) }}</span>
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
          label="Confirmar pedido"
          :loading="submitting"
          :disabled="!selectedAddressId || !selectedShippingId"
          class="rounded-xl cta-glow"
          @click="placeOrder"
        />
        <p class="text-xs text-theme-muted text-center">
          Serás redirigido a la página de pago seguro.
        </p>
      </aside>
    </div>
  </div>
</template>
