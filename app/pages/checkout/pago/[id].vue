<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { RapydRequiredFieldsResponse } from '~/types/rapyd'
import { useRapydService } from '~/composables/services/rapyd'
import { useWompiService } from '~/composables/services/wompi'
import { useMercadoPagoService } from '~/composables/services/mercadopago'
import { usePaymentProvider } from '~/composables/services/payment'
import PaymentDynamicForm from '~/components/checkout/PaymentDynamicForm.vue'

definePageMeta({ layout: 'client' })

const route = useRoute()
const orderId = Number(route.params.id)

const orderStore = useOrderStore()
const { current } = storeToRefs(orderStore)
const { currency } = useFormat()
const toast = useToast()
const carrito = useCartStore()

// ── Provider detection ────────────────────────────────────────
const paymentProvider = usePaymentProvider()
const rapyd = useRapydService()
const wompi = useWompiService()
const mercadopago = useMercadoPagoService()

const processing = ref(false)
const errors = ref<string[]>([])

// ── Rapyd state ──────────────────────────────────────────────
const selectedMethod = ref('')
const requiredFieldsData = ref<RapydRequiredFieldsResponse | null>(null)
const loadingFields = ref(false)
const formFields = ref<Record<string, string>>({})
const openCategory = ref<string | null>(null)

// ── Wompi state ──────────────────────────────────────────────
const wompiPaymentType = ref('CARD')
const wompiFormFields = ref<Record<string, string>>({})

// ── Stripe state ─────────────────────────────────────────────
const stripeCardReady = ref(false)

// ── MercadoPago state ────────────────────────────────────────
const mpLoading = ref(false)

function toggleCategory(label: string) {
  openCategory.value = openCategory.value === label ? null : label
}

// ── Method categories (Rapyd) ────────────────────────────────

const CATEGORY_META: Record<string, { icon: string, label: string }> = {
  card: { icon: 'i-lucide-credit-card', label: 'Tarjeta de crédito o débito' },
  bank_transfer: { icon: 'i-lucide-building-2', label: 'Transferencia bancaria' },
  bank_redirect: { icon: 'i-lucide-building-2', label: 'Transferencia bancaria' },
  ewallet: { icon: 'i-lucide-smartphone', label: 'Billetera digital' },
  cash: { icon: 'i-lucide-banknote', label: 'Pago en efectivo' },
}

const methodCategories = computed(() => {
  const methods = rapyd.paymentMethods.value
  if (methods.length === 0) return []
  const map = new Map<string, typeof methods>()
  for (const m of methods) {
    if (!m.enabled) continue
    const key = m.category
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return Array.from(map.entries()).map(([cat, items]) => ({
    key: cat,
    label: CATEGORY_META[cat]?.label ?? cat,
    icon: CATEGORY_META[cat]?.icon ?? 'i-lucide-circle-help',
    methods: items,
  }))
})

// ── Rapyd fallback fields ────────────────────────────────────

import type { RapydRequiredField } from '~/types/rapyd'

const FALLBACK_FIELDS: Record<string, RapydRequiredField[]> = {
  card: [
    { name: 'number', type: 'string', is_required: true, instructions: 'Número de tarjeta' },
    { name: 'expiration_month', type: 'string', is_required: true, instructions: 'Mes de expiración (01-12)' },
    { name: 'expiration_year', type: 'string', is_required: true, instructions: 'Año de expiración (2 dígitos)' },
    { name: 'cvv', type: 'string', is_required: true, instructions: 'Código de seguridad' },
    { name: 'name', type: 'string', is_required: true, instructions: 'Nombre del titular' },
  ],
  ewallet: [
    { name: 'name', type: 'string', is_required: true, instructions: 'Nombre completo' },
    { name: 'phone_number', type: 'string', is_required: true, instructions: 'Número de celular (10 dígitos)' },
  ],
  bank_transfer: [
    { name: 'financial_institution_code', type: 'string', is_required: true, instructions: 'Código del banco' },
    { name: 'person_type', type: 'string', is_required: true, instructions: 'Tipo de persona' },
    { name: 'document_type', type: 'string', is_required: true, instructions: 'Tipo de documento' },
    { name: 'document_number', type: 'string', is_required: true, instructions: 'Número de documento' },
  ],
  cash: [
    { name: 'name', type: 'string', is_required: true, instructions: 'Nombre completo' },
    { name: 'email', type: 'string', is_required: true, instructions: 'Correo electrónico' },
  ],
}

function getFallbackFields(methodType: string): RapydRequiredField[] {
  if (methodType.includes('card')) return FALLBACK_FIELDS.card ?? []
  if (methodType.includes('ewallet') || methodType.includes('nequi')) return FALLBACK_FIELDS.ewallet ?? []
  if (methodType.includes('bank') || methodType.includes('pse')) return FALLBACK_FIELDS.bank_transfer ?? []
  if (methodType.includes('cash')) return FALLBACK_FIELDS.cash ?? []
  return []
}

// ── Watch method selection → fetch required fields (Rapyd) ───

watch(selectedMethod, async (type) => {
  if (!type) { requiredFieldsData.value = null; return }
  loadingFields.value = true
  formFields.value = {}
  try {
    const result = await rapyd.fetchRequiredFields(type)
    if (result && result.fields.length > 0) {
      requiredFieldsData.value = result
    } else {
      const fallback = getFallbackFields(type)
      requiredFieldsData.value = result ? { ...result, fields: fallback } : { type, fields: fallback, payment_method_options: [], payment_options: [], minimum_expiration_seconds: 0, maximum_expiration_seconds: 0 }
    }
  } finally {
    loadingFields.value = false
  }
})

// ── Wompi payment type fields ────────────────────────────────

const WOMPI_FIELDS: Record<string, { name: string; label: string; type?: string; placeholder?: string }[]> = {
  CARD: [
    { name: 'number', label: 'Número de tarjeta', placeholder: '0000 0000 0000 0000' },
    { name: 'cvv', label: 'CVV', type: 'password', placeholder: '***' },
    { name: 'expiration_month', label: 'Mes', placeholder: 'MM' },
    { name: 'expiration_year', label: 'Año', placeholder: 'AA' },
    { name: 'name', label: 'Nombre en la tarjeta', placeholder: 'Como aparece en la tarjeta' },
  ],
  NEQUI: [
    { name: 'phone_number', label: 'Número de celular', placeholder: '300 123 4567' },
  ],
  PSE: [
    { name: 'financial_institution_code', label: 'Banco', placeholder: 'Selecciona tu banco' },
    { name: 'person_type', label: 'Tipo de persona' },
    { name: 'document_type', label: 'Tipo de documento' },
    { name: 'document_number', label: 'Número de documento' },
  ],
}

const wompiFields = computed(() => WOMPI_FIELDS[wompiPaymentType.value.toUpperCase()] || [])

// ── Pay handlers ─────────────────────────────────────────────

async function payRapyd() {
  if (!orderId || !current.value || !selectedMethod.value) return
  errors.value = []

  formFields.value.number = (formFields.value.number || '').split(' ').join('')

  const payload = {
    order_id: orderId,
    payment_method_type: selectedMethod.value,
    amount: current.value.total,
    currency: current.value.currency || 'COP',
    ...formFields.value,
  }

  const validationErrors = rapyd.validatePaymentPayload(payload)
  if (validationErrors.length > 0) {
    errors.value = validationErrors
    return
  }

  processing.value = true
  try {
    await orderStore.pay(orderId, {
      provider: 'rapyd',
      reference: JSON.stringify(payload),
    })
    await carrito.clear()
    toast.add({
      title: 'Pago procesado',
      description: 'Tu pago está siendo procesado. Recibirás una confirmación en breve.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e: unknown) {
    errors.value = [e instanceof Error ? e.message : 'Error al procesar el pago']
  } finally {
    processing.value = false
  }
}

async function payWompi() {
  if (!orderId || !current.value) return
  errors.value = []

  const payload = {
    payment_method_type: wompiPaymentType.value,
    ...wompiFormFields.value,
  }

  const validationErrors = wompi.validatePayload(payload)
  if (validationErrors.length > 0) {
    errors.value = validationErrors
    return
  }

  processing.value = true
  try {
    await orderStore.pay(orderId, {
      provider: 'wompi',
      reference: JSON.stringify({ ...payload, order_id: orderId, amount: current.value.total }),
    })
    await carrito.clear()
    toast.add({
      title: 'Pago procesado',
      description: 'Tu pago está siendo procesado.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e: unknown) {
    errors.value = [e instanceof Error ? e.message : 'Error al procesar el pago']
  } finally {
    processing.value = false
  }
}

async function payMercadoPago() {
  if (!orderId || !current.value) return
  processing.value = true
  errors.value = []
  try {
    const pref = await mercadopago.createPreference(orderId, current.value.total, current.value.currency || 'COP')
    if (pref?.init_point) {
      await carrito.clear()
      mercadopago.redirectToCheckout(pref.init_point)
    } else {
      errors.value = ['No se pudo crear la preferencia de pago']
    }
  } catch (e: unknown) {
    errors.value = [e instanceof Error ? e.message : 'Error al procesar el pago']
  } finally {
    processing.value = false
  }
}

async function payStripe() {
  if (!orderId || !current.value) return
  errors.value = []
  processing.value = true
  try {
    await orderStore.pay(orderId, {
      provider: 'stripe',
      reference: JSON.stringify({ order_id: orderId, amount: current.value.total, currency: current.value.currency || 'cop' }),
    })
    await carrito.clear()
    toast.add({
      title: 'Pago procesado',
      description: 'Tu pago está siendo procesado.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (e: unknown) {
    errors.value = [e instanceof Error ? e.message : 'Error al procesar el pago']
  } finally {
    processing.value = false
  }
}

// ── Pay dispatcher ───────────────────────────────────────────

async function pay() {
  switch (paymentProvider.activeProvider.value) {
    case 'rapyd': return payRapyd()
    case 'wompi': return payWompi()
    case 'mercadopago': return payMercadoPago()
    case 'stripe': return payStripe()
    default: return payRapyd()
  }
}

// ── Init ─────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    orderId ? orderStore.loadOne(orderId) : Promise.resolve(),
    paymentProvider.fetchActiveProvider(),
  ])

  // Initialize provider-specific data
  const provider = paymentProvider.activeProvider.value
  if (provider === 'rapyd') {
    await rapyd.fetchPaymentMethods('CO', 'COP')
    const first = methodCategories.value[0]
    if (first) openCategory.value = first.key
  }
})

useSeoMeta({ title: 'Pago', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="mb-8 sm:mb-10">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-theme">Finalizar compra</h1>
        <p class="text-sm text-theme-muted mt-1">Pedido #{{ orderId }}</p>
      </div>

      <FeedbackSkeletonLoader v-if="!current" variant="card" :count="2" />

      <!-- ── 2-Column Grid ───────────────────────────────────── -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        <!-- ═══ LEFT: Order Summary (sticky) ═══════════════════ -->
        <aside class="lg:col-span-5 order-2 lg:order-1">
          <div class="lg:sticky lg:top-8">
            <div class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 space-y-5">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-theme-muted">Resumen del pedido</h2>

              <!-- Items preview -->
              <div v-if="current?.items?.length" class="space-y-3">
                <div
                  v-for="item in current.items.slice(0, 4)"
                  :key="item.id"
                  class="flex items-center gap-3"
                >
                  <div class="w-12 h-12 rounded-xl bg-theme/5 border border-theme flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      v-if="item.product?.images?.[0]"
                      :src="item.product.images[0]"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    >
                    <UIcon v-else name="i-lucide-package" class="size-5 text-theme-muted" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-theme truncate">{{ item.name }}</p>
                    <p class="text-xs text-theme-muted">x{{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-medium tabular-nums text-theme">
                    {{ currency(item.subtotal || item.price * item.quantity, current.currency) }}
                  </span>
                </div>
                <p v-if="current.items.length > 4" class="text-xs text-theme-muted text-center">
                  +{{ current.items.length - 4 }} artículos más
                </p>
              </div>

              <div class="border-t border-theme" />

              <!-- Totals -->
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-theme-muted">Subtotal</span>
                  <span class="font-medium tabular-nums text-theme">{{ currency(current.subtotal, current.currency) }}</span>
                </div>
                <div v-if="current.discount" class="flex justify-between text-emerald-600">
                  <span>Descuento</span>
                  <span class="tabular-nums font-medium">-{{ currency(current.discount, current.currency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-theme-muted">Envío</span>
                  <span class="font-medium tabular-nums text-theme">{{ currency(current.shipping, current.currency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-theme-muted">Impuestos</span>
                  <span class="font-medium tabular-nums text-theme">{{ currency(current.tax, current.currency) }}</span>
                </div>
              </div>

              <div class="border-t border-theme" />

              <!-- Total -->
              <div class="flex justify-between items-baseline">
                <span class="text-base font-semibold text-theme">Total</span>
                <span class="text-xl font-bold tabular-nums text-theme-brand">
                  {{ currency(current.total, current.currency) }}
                </span>
              </div>

              <!-- Security badge -->
              <div class="flex items-center gap-2 pt-1">
                <UIcon name="i-lucide-shield-check" class="size-4 text-emerald-500" />
                <span class="text-xs text-theme-muted">Pago seguro y encriptado</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- ═══ RIGHT: Payment Form ════════════════════════════ -->
        <section class="lg:col-span-7 order-1 lg:order-2">
          <div class="space-y-6">

            <!-- ── Loading provider ────────────────────────────── -->
            <div v-if="paymentProvider.loading.value" class="flex flex-col items-center justify-center py-16 bg-theme-alt rounded-2xl border border-theme">
              <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-theme-brand mb-3" />
              <p class="text-sm text-theme-muted">Cargando método de pago...</p>
            </div>

            <!-- ═══════════ RAPYD ═══════════ -->
            <template v-else-if="paymentProvider.isProvider('rapyd')">
              <!-- Loading methods -->
              <div v-if="rapyd.loadingMethods.value" class="flex flex-col items-center justify-center py-16 bg-theme-alt rounded-2xl border border-theme">
                <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-theme-brand mb-3" />
                <p class="text-sm text-theme-muted">Cargando métodos de pago...</p>
              </div>

              <!-- Error banner -->
              <div
                v-else-if="rapyd.methodsError.value"
                class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50"
              >
                <div class="flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-400">
                  <UIcon name="i-lucide-alert-triangle" class="size-4 shrink-0" />
                  <span>No se pudieron cargar los métodos. Usando opciones por defecto.</span>
                </div>
              </div>

              <!-- Accordion: Payment categories -->
              <div v-if="methodCategories.length > 0" class="space-y-3">
                <div
                  v-for="category in methodCategories"
                  :key="category.key"
                  class="rounded-2xl border border-theme overflow-hidden transition-all duration-200"
                  :class="openCategory === category.key ? 'bg-theme-alt shadow-sm' : 'bg-theme hover:border-theme-brand/30'"
                >
                  <button
                    class="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors duration-150"
                    :class="openCategory === category.key ? '' : 'hover:bg-theme-alt/50'"
                    @click="toggleCategory(category.key)"
                  >
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
                      :class="openCategory === category.key ? 'bg-theme-brand text-white' : 'bg-theme-alt text-theme-muted'"
                    >
                      <UIcon :name="category.icon" class="size-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-theme">{{ category.label }}</p>
                      <p class="text-xs text-theme-muted">{{ category.methods.length }} opciones disponibles</p>
                    </div>
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="size-5 text-theme-muted transition-transform duration-200 shrink-0"
                      :class="openCategory === category.key ? 'rotate-180' : ''"
                    />
                  </button>

                  <Transition
                    enter-active-class="transition-all duration-250 ease-out"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[2000px]"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 max-h-[2000px]"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-show="openCategory === category.key" class="overflow-hidden">
                      <div class="px-5 pb-5 space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            v-for="method in category.methods"
                            :key="method.id"
                            class="group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 text-left"
                            :class="selectedMethod === method.id
                              ? 'border-theme-brand bg-theme-brand/5 shadow-sm'
                              : 'border-theme hover:border-theme-brand/40 hover:bg-theme-alt'"
                            @click="selectedMethod = method.id"
                          >
                            <div class="w-10 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white border border-theme/50 overflow-hidden">
                              <img
                                v-if="method.image"
                                :src="method.image"
                                :alt="method.name"
                                class="w-full h-full object-contain p-0.5"
                                @error="($event.target as HTMLImageElement).style.display = 'none'"
                              >
                              <UIcon v-if="!method.image" :name="method.icon" class="size-5 text-theme-muted" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-theme group-hover:text-theme-brand transition-colors">
                                {{ method.name }}
                              </p>
                            </div>
                            <div
                              class="absolute -top-px -right-px w-5 h-5 rounded-bl-xl rounded-tr-xl flex items-center justify-center transition-all duration-200"
                              :class="selectedMethod === method.id ? 'bg-theme-brand text-white' : 'bg-transparent'"
                            >
                              <UIcon v-if="selectedMethod === method.id" name="i-lucide-check" class="size-3" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Dynamic form -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
              >
                <div
                  v-if="selectedMethod && requiredFieldsData?.fields?.length"
                  class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 space-y-5"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-theme-brand/10 flex items-center justify-center">
                      <UIcon name="i-lucide-file-text" class="size-4 text-theme-brand" />
                    </div>
                    <div>
                      <h3 class="text-sm font-semibold text-theme">Información de pago</h3>
                      <p class="text-xs text-theme-muted">Completa los campos requeridos</p>
                    </div>
                  </div>
                  <div v-if="loadingFields" class="flex items-center gap-2.5 py-4">
                    <UIcon name="i-lucide-loader-2" class="size-4 animate-spin text-theme-brand" />
                    <span class="text-sm text-theme-muted">Cargando campos...</span>
                  </div>
                  <PaymentDynamicForm
                    v-else
                    :fields="requiredFieldsData.fields"
                    v-model="formFields"
                  />
                </div>
              </Transition>
            </template>

            <!-- ═══════════ WOMPI ═══════════ -->
            <template v-else-if="paymentProvider.isProvider('wompi')">
              <div class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 space-y-5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-theme-brand/10 flex items-center justify-center">
                    <UIcon name="i-lucide-smartphone" class="size-4 text-theme-brand" />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-theme">Pago con Wompi</h3>
                    <p class="text-xs text-theme-muted">Selecciona tu método de pago preferido</p>
                  </div>
                </div>

                <!-- Payment type selector -->
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="type in ['CARD', 'NEQUI', 'PSE']"
                    :key="type"
                    class="px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center"
                    :class="wompiPaymentType === type
                      ? 'border-theme-brand bg-theme-brand/5 text-theme-brand'
                      : 'border-theme hover:border-theme-brand/40 text-theme'"
                    @click="wompiPaymentType = type; wompiFormFields = {}"
                  >
                    {{ type === 'CARD' ? 'Tarjeta' : type === 'NEQUI' ? 'Nequi' : 'PSE' }}
                  </button>
                </div>

                <!-- Dynamic fields -->
                <div class="space-y-4">
                  <div v-for="field in wompiFields" :key="field.name" class="space-y-1.5">
                    <label class="text-xs font-medium text-theme-secondary">{{ field.label }}</label>
                    <input
                      :value="wompiFormFields[field.name] || ''"
                      :type="field.type || 'text'"
                      :placeholder="field.placeholder || ''"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
                      @input="wompiFormFields[field.name] = ($event.target as HTMLInputElement).value"
                    >
                  </div>
                </div>
              </div>
            </template>

            <!-- ═══════════ STRIPE ═══════════ -->
            <template v-else-if="paymentProvider.isProvider('stripe')">
              <div class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 space-y-5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-theme-brand/10 flex items-center justify-center">
                    <UIcon name="i-lucide-credit-card" class="size-4 text-theme-brand" />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-theme">Pago con Stripe</h3>
                    <p class="text-xs text-theme-muted">Ingresa los datos de tu tarjeta</p>
                  </div>
                </div>

                <!-- Stripe card form placeholder -->
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-theme-secondary">Número de tarjeta</label>
                    <input
                      type="text"
                      inputmode="numeric"
                      placeholder="4242 4242 4242 4242"
                      maxlength="19"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums"
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <label class="text-xs font-medium text-theme-secondary">Vencimiento</label>
                      <input
                        type="text"
                        inputmode="numeric"
                        placeholder="MM/AA"
                        maxlength="5"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums"
                      >
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-xs font-medium text-theme-secondary">CVV</label>
                      <input
                        type="password"
                        inputmode="numeric"
                        placeholder="123"
                        maxlength="4"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums"
                      >
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-theme-secondary">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      placeholder="Como aparece en la tarjeta"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
                    >
                  </div>
                </div>

                <p class="text-xs text-theme-muted flex items-center gap-1.5">
                  <UIcon name="i-lucide-shield-check" class="size-3" />
                  Tu información está protegida por Stripe.
                </p>
              </div>
            </template>

            <!-- ═══════════ MERCADOPAGO ═══════════ -->
            <template v-else-if="paymentProvider.isProvider('mercadopago')">
              <div class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 space-y-5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-theme-brand/10 flex items-center justify-center">
                    <UIcon name="i-lucide-wallet" class="size-4 text-theme-brand" />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-theme">Pago con Mercado Pago</h3>
                    <p class="text-xs text-theme-muted">Serás redirigido a la pasarela de pago</p>
                  </div>
                </div>

                <div class="text-center py-4">
                  <p class="text-sm text-theme-muted mb-4">
                    Al hacer clic en "Pagar con Mercado Pago" serás redirigido para completar el pago de forma segura.
                  </p>
                  <UIcon name="i-lucide-arrow-right" class="size-6 text-theme-brand mx-auto" />
                </div>
              </div>
            </template>

            <!-- ═══════════ FALLBACK ═══════════ -->
            <template v-else>
              <div class="bg-theme-alt rounded-2xl border border-theme p-5 sm:p-6 text-center py-12">
                <UIcon name="i-lucide-alert-circle" class="size-8 text-theme-muted mx-auto mb-3" />
                <p class="text-sm text-theme-muted">Método de pago no disponible temporalmente.</p>
              </div>
            </template>

            <!-- ── Errors ─────────────────────────────────────── -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="errors.length"
                class="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 space-y-1.5"
              >
                <div v-for="(err, i) in errors" :key="i" class="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                  <UIcon name="i-lucide-alert-circle" class="size-4 mt-0.5 shrink-0" />
                  <span>{{ err }}</span>
                </div>
              </div>
            </Transition>

            <!-- ── CTA ────────────────────────────────────────── -->
            <div class="space-y-3">
              <UButton
                block
                size="lg"
                color="primary"
                :label="paymentProvider.isProvider('mercadopago') ? 'Pagar con Mercado Pago' : 'Confirmar pago'"
                :loading="processing"
                :disabled="paymentProvider.loading.value"
                icon="i-lucide-lock"
                class="rounded-xl h-12 text-sm font-semibold cta-glow"
                @click="pay"
              />
              <p class="text-xs text-theme-muted text-center leading-relaxed">
                Al continuar aceptas nuestros
                <NuxtLink to="/terminos" class="text-theme-brand hover:underline">términos y condiciones</NuxtLink>
                de venta.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
