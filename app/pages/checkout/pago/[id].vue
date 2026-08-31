<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'client' })

const route = useRoute()
const orderId = Number(route.params.id)

const orderStore = useOrderStore()
const { current } = storeToRefs(orderStore)
const { currency } = useFormat()

const selectedProvider = ref<'stripe' | 'mercadopago' | 'paypal' | 'wompi'>('stripe')
const reference = ref('')
const processing = ref(false)

const providerOptions = [
  { label: 'Stripe', value: 'stripe' as const },
  { label: 'Mercado Pago', value: 'mercadopago' as const },
  { label: 'PayPal', value: 'paypal' as const },
  { label: 'Wompi', value: 'wompi' as const }
]

async function pay() {
  if (!orderId) return
  processing.value = true
  try {
    await orderStore.pay(orderId, {
      provider: selectedProvider.value,
      reference: reference.value || undefined
    })
  } finally {
    processing.value = false
  }
}

onMounted(async () => {
  if (orderId) await orderStore.loadOne(orderId)
})

useSeoMeta({ title: 'Pago', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="page-container py-8 sm:py-10 max-w-2xl mx-auto">
    <h1 class="page-title mb-2">
      Finalizar pago
    </h1>
    <p class="page-subtitle mb-8">
      Pedido #{{ orderId }}
    </p>

    <FeedbackSkeletonLoader
      v-if="!current"
      variant="card"
      :count="2"
    />

    <div
      v-else
      class="space-y-6"
    >
      <!-- Resumen -->
      <section class="surface p-5 sm:p-6">
        <h2 class="font-semibold mb-4">
          Resumen
        </h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Subtotal</span>
            <span class="tabular-nums">{{ currency(current.subtotal, current.currency) }}</span>
          </div>
          <div
            v-if="current.discount"
            class="flex justify-between text-emerald-600"
          >
            <span>Descuento</span>
            <span class="tabular-nums">-{{ currency(current.discount, current.currency) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Envío</span>
            <span class="tabular-nums">{{ currency(current.shipping, current.currency) }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Impuestos</span>
            <span class="tabular-nums">{{ currency(current.tax, current.currency) }}</span>
          </div>
          <USeparator />
          <div class="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span class="tabular-nums">{{ currency(current.total, current.currency) }}</span>
          </div>
        </div>
      </section>

      <!-- Método -->
      <section class="surface p-5 sm:p-6 space-y-4">
        <h2 class="font-semibold">
          Método de pago
        </h2>
        <UiBaseSelect
          v-model="selectedProvider"
          label="Proveedor"
          :items="providerOptions"
        />
        <UiBaseInput
          v-model="reference"
          label="Referencia (opcional)"
          placeholder="ID de transacción del proveedor"
        />
        <UiBaseButton
          block
          size="lg"
          color="primary"
          label="Pagar ahora"
          :loading="processing"
          class="rounded-xl cta-glow"
          @click="pay"
        />
        <p class="text-xs text-slate-400 text-center">
          El estado del pedido se actualizará cuando el proveedor confirme el pago.
        </p>
      </section>
    </div>
  </div>
</template>
