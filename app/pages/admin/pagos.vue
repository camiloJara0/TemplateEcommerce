<script setup lang="ts">
import type { Payment, Refund } from '~/types/commerce'
import type { PaymentConfig, PaymentConfigProvider, PaymentFilters } from '~/composables/services/admin/pagos'
import { useAdminPagosService } from '~/composables/services/admin/pagos'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const toast = useToast()
const { currency, date } = useFormat()
const pagosService = useAdminPagosService()

const activeTab = ref('historial')
const loading = ref(false)
const saving = ref(false)

const pagos = ref<Payment[]>([])
const pagination = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const currentPage = ref(1)
const filtersProvider = ref('#')
const filtersStatus = ref('#')
const filtersDesde = ref('')
const filtersHasta = ref('')

const config = ref<PaymentConfig | null>(null)
const defaultProvider = ref('rapyd')

// Credenciales por proveedor (loaded from DB, decrypted)
const providerCredentials = ref<Record<string, Record<string, string>>>({})
const testingProvider = ref<string | null>(null)
const savingProvider = ref<string | null>(null)

const detailOpen = ref(false)
const detailPago = ref<Payment | null>(null)
const detailLoading = ref(false)
const expandedCredentials = ref<Record<string, boolean>>({})

const refundOpen = ref(false)
const refundPago = ref<Payment | null>(null)
const refundAmount = ref(0)
const refundReason = ref('')
const refundLoading = ref(false)

const cancelOpen = ref(false)
const cancelPago = ref<Payment | null>(null)
const cancelLoading = ref(false)

const tabs = [
  { key: 'historial', label: 'Historial', icon: 'i-lucide-history' },
  { key: 'proveedores', label: 'Proveedores', icon: 'i-lucide-credit-card' },
]

const providerLabels: Record<string, string> = {
  rapyd: 'Rapyd',
  stripe: 'Stripe',
  mercadopago: 'Mercado Pago',
  paypal: 'PayPal',
  wompi: 'Wompi',
  payu: 'PayU',
}

const providerIcons: Record<string, string> = {
  rapyd: 'i-lucide-wallet',
  stripe: 'i-lucide-credit-card',
  mercadopago: 'i-lucide-wallet',
  paypal: 'i-lucide-globe',
  wompi: 'i-lucide-smartphone',
  payu: 'i-lucide-credit-card',
}

const providerDescriptions: Record<string, string> = {
  rapyd: 'Pasarela de pago global con múltiples métodos para Latinoamérica.',
  stripe: 'Plataforma de pagos en línea líder mundial.',
  mercadopago: 'Solución de pagos de Mercado Libre para Latinoamérica.',
  paypal: 'Pagos globales con tarjeta y saldo PayPal.',
  wompi: 'Pasarela de pago colombiana con Nequi, PSE y tarjeta.',
  payu: 'Pasarela de pago para Latinoamérica.',
}

const providerCredentialFields: Record<string, { key: string; label: string; type?: string; options?: string[] }[]> = {
  rapyd: [
    { key: 'access_key', label: 'Access Key' },
    { key: 'secret_key', label: 'Secret Key' },
  ],
  stripe: [
    { key: 'secret_key', label: 'Secret Key' },
    { key: 'public_key', label: 'Public Key' },
    { key: 'webhook_secret', label: 'Webhook Secret' },
  ],
  mercadopago: [
    { key: 'access_token', label: 'Access Token' },
    { key: 'public_key', label: 'Public Key' },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_secret', label: 'Client Secret' },
    { key: 'mode', label: 'Modo', type: 'select', options: ['sandbox', 'production'] },
  ],
  wompi: [
    { key: 'public_key', label: 'Public Key' },
    { key: 'private_key', label: 'Private Key' },
    { key: 'events_key', label: 'Events Key' },
  ],
}

const paymentColumns = [
  { key: 'id', label: '#' },
  { key: 'order_id', label: 'Pedido' },
  { key: 'provider', label: 'Proveedor' },
  { key: 'amount', label: 'Monto' },
  { key: 'currency', label: 'Moneda' },
  { key: 'status', label: 'Estado' },
  { key: 'reference', label: 'Referencia' },
  { key: 'created_at', label: 'Fecha' },
  { key: 'actions', label: '' },
]

const paymentStatusColor = (status: string) => {
  const map: Record<string, string> = {
    aprobado: 'success',
    pagado: 'success',
    pendiente: 'warning',
    rechazado: 'error',
    fallido: 'error',
    reembolsado: 'neutral',
  }
  return (map[status] || 'neutral') as any
}

const paymentStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    aprobado: 'Aprobado',
    pendiente: 'Pendiente',
    rechazado: 'Rechazado',
    reembolsado: 'Reembolsado',
  }
  return map[status] || status
}

// ── Data loading ──

async function loadHistorial() {
  loading.value = true
  try {
    const filters: PaymentFilters = { page: currentPage.value }
    if (filtersProvider.value && filtersProvider.value !== '#') filters.provider = filtersProvider.value
    if (filtersStatus.value && filtersStatus.value !== '#') filters.status = filtersStatus.value
    if (filtersDesde.value) filters.desde = filtersDesde.value
    if (filtersHasta.value) filters.hasta = filtersHasta.value
    const res = await pagosService.listarPagos(filters)
    pagos.value = res.items
    pagination.value = res.pagination
  } finally {
    loading.value = false
  }
}

async function loadConfig() {
  loading.value = true
  try {
    const data = await pagosService.obtenerConfiguracion()
    config.value = data
    defaultProvider.value = data.default_provider || 'rapyd'
    // Initialize credential fields for each provider
    for (const key of Object.keys(data.providers)) {
      if (!providerCredentials.value[key]) {
        const fields = providerCredentialFields[key] || []
        providerCredentials.value[key] = Object.fromEntries(fields.map(f => [f.key, '']))
      }
    }
  } finally {
    loading.value = false
  }
}

async function saveDefaultProvider() {
  saving.value = true
  try {
    await pagosService.actualizarConfiguracion({ default_provider: defaultProvider.value })
    toast.add({ title: 'Proveedor predeterminado actualizado', color: 'success' })
  } finally {
    saving.value = false
  }
}

async function saveProviderCredentials(providerKey: string) {
  savingProvider.value = providerKey
  try {
    const creds = providerCredentials.value[providerKey] || {}
    await pagosService.actualizarConfiguracion({
      default_provider: defaultProvider.value,
      credentials: { [providerKey]: creds },
    })
    // Reload config to get updated status
    const data = await pagosService.obtenerConfiguracion()
    config.value = data
    toast.add({ title: `${providerLabels[providerKey]}: credenciales guardadas`, color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.message || 'Error al guardar', color: 'error' })
  } finally {
    savingProvider.value = null
  }
}

async function testConnection(providerKey: string) {
  testingProvider.value = providerKey
  try {
    const result = await pagosService.probarProveedor(providerKey)
    toast.add({
      title: result.success ? 'Conexión exitosa' : 'Error de conexión',
      description: result.message,
      color: result.success ? 'success' : 'error',
    })
  } catch (e: any) {
    toast.add({
      title: 'Error de conexión',
      description: e?.data?.message || 'No se pudo probar la conexión',
      color: 'error',
    })
  } finally {
    testingProvider.value = null
  }
}

function updateCredential(providerKey: string, fieldKey: string, value: string) {
  if (!providerCredentials.value[providerKey]) {
    providerCredentials.value[providerKey] = {}
  }
  providerCredentials.value[providerKey][fieldKey] = value
}

function onTabChange(val: string | number) {
  const tab = String(val)
  activeTab.value = tab
  if (tab === 'historial') loadHistorial()
  if (tab === 'proveedores') loadConfig()
}

// ── Payment detail ──

async function openDetail(pago: Payment) {
  detailOpen.value = true
  detailLoading.value = true
  try {
    detailPago.value = await pagosService.obtenerPago(pago.id)
  } finally {
    detailLoading.value = false
  }
}

// ── Refund ──

function openRefund(pago: Payment) {
  refundPago.value = pago
  refundAmount.value = Number(pago.amount)
  refundReason.value = ''
  refundOpen.value = true
}

async function executeRefund() {
  if (!refundPago.value) return
  refundLoading.value = true
  try {
    await pagosService.reembolsar(refundPago.value.id, {
      amount: refundAmount.value,
      reason: refundReason.value || undefined,
    })
    toast.add({ title: 'Reembolso procesado', color: 'success' })
    refundOpen.value = false
    loadHistorial()
  } catch (e: any) {
    toast.add({ title: e?.data?.message || 'Error al reembolsar', color: 'error' })
  } finally {
    refundLoading.value = false
  }
}

// ── Cancel ──

function openCancel(pago: Payment) {
  cancelPago.value = pago
  cancelOpen.value = true
}

async function executeCancel() {
  if (!cancelPago.value) return
  cancelLoading.value = true
  try {
    await pagosService.cancelar(cancelPago.value.id)
    toast.add({ title: 'Pago cancelado', color: 'success' })
    cancelOpen.value = false
    loadHistorial()
  } catch (e: any) {
    toast.add({ title: e?.data?.message || 'Error al cancelar', color: 'error' })
  } finally {
    cancelLoading.value = false
  }
}

onMounted(() => loadHistorial())

useSeoMeta({ title: 'Pagos — Admin' })
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">Pagos</h1>
        <p class="page-subtitle">Historial, gestión y configuración de pasarelas de pago</p>
      </div>
    </div>

    <UTabs :items="tabs" variant="link" @update:model-value="onTabChange">
      <template #content="{ item }">
        <!-- ===== HISTORIAL ===== -->
        <div v-if="item.key === 'historial'" class="space-y-6 mt-6">
          <div class="flex flex-wrap items-end gap-4">
            <UField label="Proveedor" name="provider">
              <USelect
                v-model="filtersProvider"
                :items="[
                  { label: 'Todos', value: '#' },
                  { label: 'Rapyd', value: 'rapyd' },
                  { label: 'Stripe', value: 'stripe' },
                  { label: 'Mercado Pago', value: 'mercadopago' },
                  { label: 'PayPal', value: 'paypal' },
                  { label: 'Wompi', value: 'wompi' },
                ]"
                class="w-44"
              />
            </UField>
            <UField label="Estado" name="status">
              <USelect
                v-model="filtersStatus"
                :items="[
                  { label: 'Todos', value: '#' },
                  { label: 'Aprobado', value: 'aprobado' },
                  { label: 'Pendiente', value: 'pendiente' },
                  { label: 'Rechazado', value: 'rechazado' },
                  { label: 'Reembolsado', value: 'reembolsado' },
                ]"
                class="w-44"
              />
            </UField>
            <UField label="Desde" name="desde">
              <UInput v-model="filtersDesde" type="date" class="w-44" />
            </UField>
            <UField label="Hasta" name="hasta">
              <UInput v-model="filtersHasta" type="date" class="w-44" />
            </UField>
            <UButton label="Buscar" icon="i-lucide-search" color="primary" @click="loadHistorial" />
          </div>

          <DashboardDataTable
            :columns="paymentColumns"
            :rows="pagos"
            :loading="loading"
            empty-title="Sin pagos"
            empty-description="No se encontraron pagos con los filtros seleccionados."
          >
            <template #cell-provider="{ value }">
              <div class="flex items-center gap-2">
                <UIcon :name="providerIcons[value as string] || 'i-lucide-credit-card'" class="size-4 text-theme-muted" />
                <span>{{ providerLabels[value as string] || value }}</span>
              </div>
            </template>
            <template #cell-amount="{ value }">
              <span class="font-semibold">{{ currency(value as number) }}</span>
            </template>
            <template #cell-currency="{ value }">
              <span class="text-xs text-theme-muted">{{ value || 'COP' }}</span>
            </template>
            <template #cell-status="{ value }">
              <UBadge :label="paymentStatusLabel(value as string)" :color="paymentStatusColor(value as string)" variant="subtle" size="sm" />
            </template>
            <template #cell-created_at="{ value }">
              {{ value ? date(value as string) : '—' }}
            </template>
            <template #cell-reference="{ value }">
              <span class="font-mono text-xs text-theme-muted truncate max-w-40 block" :title="value as string">{{ value || '—' }}</span>
            </template>
            <template #cell-actions="{ row }">
              <div class="flex items-center gap-1">
                <UButton icon="i-lucide-eye" variant="ghost" color="neutral" size="xs" @click="openDetail(row)" />
                <UButton
                  v-if="row.status === 'aprobado'"
                  icon="i-lucide-rotate-ccw"
                  variant="ghost"
                  color="warning"
                  size="xs"
                  @click="openRefund(row)"
                />
                <UButton
                  v-if="row.status === 'pendiente'"
                  icon="i-lucide-x"
                  variant="ghost"
                  color="error"
                  size="xs"
                  @click="openCancel(row)"
                />
              </div>
            </template>
          </DashboardDataTable>

          <div v-if="pagination && pagination.last_page > 1" class="flex justify-center">
            <UPagination
              v-model:page="currentPage"
              :items-per-page="pagination.per_page"
              :total="pagination.total"
              @update:page="loadHistorial"
            />
          </div>
        </div>

        <!-- ===== PROVEEDORES ===== -->
        <div v-else-if="item.key === 'proveedores'" class="space-y-6 mt-6">
          <p class="text-sm text-theme-muted">
            Configura los proveedores de pago. Selecciona cuál está activo y guarda sus credenciales de forma segura.
          </p>

          <!-- Provider cards -->
          <div
            v-for="(fields, providerKey) in providerCredentialFields"
            :key="providerKey"
            class="surface rounded-2xl border overflow-hidden transition-all duration-200"
            :class="defaultProvider === providerKey ? 'border-theme-brand shadow-sm' : 'border-theme'"
          >
            <!-- Header -->
            <div class="p-5 flex items-center gap-4">
              <!-- Icon -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="defaultProvider === providerKey ? 'bg-theme-brand text-white' : 'bg-theme-imagenes text-theme-brand'"
              >
                <UIcon :name="providerIcons[providerKey] || 'i-lucide-credit-card'" class="size-6" />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-theme">{{ providerLabels[providerKey] || providerKey }}</p>
                  <UBadge
                    v-if="defaultProvider === providerKey"
                    label="Activo"
                    color="success"
                    variant="subtle"
                    size="sm"
                  />
                  <UBadge
                    v-else-if="config?.providers[providerKey]?.configured"
                    label="Configurado"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  />
                  <UBadge
                    v-else
                    label="Sin configurar"
                    color="warning"
                    variant="subtle"
                    size="sm"
                  />
                </div>
                <p class="text-xs text-theme-muted mt-0.5">{{ providerDescriptions[providerKey] }}</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <UButton
                  v-if="config?.providers[providerKey]?.configured"
                  label="Probar"
                  icon="i-lucide-zap"
                  variant="outline"
                  size="sm"
                  :loading="testingProvider === providerKey"
                  @click="testConnection(String(providerKey))"
                />
                <UButton
                  label="Activar"
                  icon="i-lucide-check"
                  :color="defaultProvider === providerKey ? 'success' : 'neutral'"
                  :variant="defaultProvider === providerKey ? 'solid' : 'outline'"
                  size="sm"
                  :disabled="defaultProvider === providerKey"
                  @click="defaultProvider = String(providerKey); saveDefaultProvider()"
                />
              </div>
            </div>

            <!-- Credentials form (collapsible) -->
            <div class="border-t border-theme bg-theme-alt/50">
              <UButton
                label="Credenciales API"
                icon="i-lucide-key"
                variant="ghost"
                size="sm"
                class="w-full justify-start px-5 py-3 rounded-none"
                @click="expandedCredentials[providerKey] = !expandedCredentials[providerKey]"
              />
              <div :class="[expandedCredentials[providerKey] ? '' : 'hidden', 'px-5 pb-5 space-y-4']">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-for="field in fields" :key="field.key" class="space-y-1.5">
                    <label class="text-xs font-medium text-theme-muted">{{ field.label }}</label>
                    <UInput
                      v-if="field.type !== 'select'"
                      :model-value="providerCredentials[providerKey]?.[field.key] || ''"
                      :type="field.key.includes('secret') || field.key.includes('token') || field.key.includes('private') || field.key.includes('key') || field.key.includes('password') ? 'password' : 'text'"
                      :placeholder="`Ingresa ${field.label.toLowerCase()}`"
                      class="w-full"
                      @update:model-value="updateCredential(String(providerKey), field.key, String($event))"
                    />
                    <USelect
                      v-else
                      :model-value="providerCredentials[providerKey]?.[field.key] || 'sandbox'"
                      :items="(field.options ?? []).map((o: string) => ({ label: o, value: o }))"
                      class="w-full"
                      @update:model-value="updateCredential(String(providerKey), field.key, String($event))"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <p class="text-xs text-theme-muted flex items-center gap-1.5">
                    <UIcon name="i-lucide-shield-check" class="size-3" />
                    Las credenciales se almacenan de forma encriptada.
                  </p>
                  <UButton
                    label="Guardar credenciales"
                    color="primary"
                    size="sm"
                    :loading="savingProvider === providerKey"
                    @click="saveProviderCredentials(String(providerKey))"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>

    <!-- ===== DETALLE DE PAGO ===== -->
    <UModal v-model:open="detailOpen" title="Detalle de pago" :ui="{ content: 'w-full max-w-2xl' }">
      <template #body>
        <div v-if="detailLoading" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-theme-brand" />
        </div>
        <div v-else-if="detailPago" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-theme-muted">ID Pago</p>
              <p class="font-mono text-sm">{{ detailPago.id }}</p>
            </div>
            <div>
              <p class="text-xs text-theme-muted">Pedido</p>
              <p class="text-sm font-medium">{{ detailPago.order?.numero || `#${detailPago.order_id}` }}</p>
            </div>
            <div>
              <p class="text-xs text-theme-muted">Proveedor</p>
              <p class="text-sm">{{ providerLabels[detailPago.provider] || detailPago.provider }}</p>
            </div>
            <div>
              <p class="text-xs text-theme-muted">Monto</p>
              <p class="text-sm font-semibold">{{ currency(detailPago.amount) }}</p>
            </div>
            <div>
              <p class="text-xs text-theme-muted">Estado</p>
              <UBadge :label="paymentStatusLabel(detailPago.status)" :color="paymentStatusColor(detailPago.status)" variant="subtle" size="sm" />
            </div>
            <div>
              <p class="text-xs text-theme-muted">Fecha</p>
              <p class="text-sm">{{ detailPago.created_at ? date(detailPago.created_at) : '—' }}</p>
            </div>
          </div>

          <div v-if="detailPago.transaction_id">
            <p class="text-xs text-theme-muted mb-1">Transaction ID</p>
            <p class="font-mono text-xs bg-theme-imagenes p-2 rounded break-all">{{ detailPago.transaction_id }}</p>
          </div>

          <div v-if="detailPago.order" class="border-t border-theme pt-4">
            <p class="text-xs font-medium text-theme-muted mb-2">Datos del pedido</p>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-theme-muted">Cliente:</span>
                {{ detailPago.order.user?.nombre || detailPago.order.user?.name || '—' }}
              </div>
              <div>
                <span class="text-theme-muted">Email:</span>
                {{ detailPago.order.user?.email || '—' }}
              </div>
              <div>
                <span class="text-theme-muted">Subtotal:</span>
                {{ currency(detailPago.order.subtotal) }}
              </div>
              <div>
                <span class="text-theme-muted">Envío:</span>
                {{ currency(detailPago.order.shipping_cost) }}
              </div>
              <div>
                <span class="text-theme-muted">Impuestos:</span>
                {{ currency(detailPago.order.tax) }}
              </div>
              <div>
                <span class="text-theme-muted">Total:</span>
                <span class="font-semibold">{{ currency(detailPago.order.total) }}</span>
              </div>
            </div>
          </div>

          <div v-if="detailPago.refunds && detailPago.refunds.length" class="border-t border-theme pt-4">
            <p class="text-xs font-medium text-theme-muted mb-2">Reembolsos</p>
            <div v-for="refund in detailPago.refunds" :key="refund.id" class="flex items-center justify-between text-sm py-1">
              <span>{{ currency(refund.amount) }} — {{ refund.reason || 'Sin razón' }}</span>
              <UBadge :label="refund.status" :color="refund.status === 'completado' ? 'success' : 'warning'" variant="subtle" size="xs" />
            </div>
          </div>

          <div v-if="detailPago.payload" class="border-t border-theme pt-4">
            <p class="text-xs font-medium text-theme-muted mb-2">Payload completo</p>
            <pre class="text-xs bg-theme-imagenes p-3 rounded overflow-auto max-h-48 font-mono">{{ JSON.stringify(detailPago.payload, null, 2) }}</pre>
          </div>
        </div>
      </template>
    </UModal>

    <!-- ===== MODAL REEMBOLSO ===== -->
    <UModal v-model:open="refundOpen" title="Reembolsar pago" :ui="{ content: 'w-full max-w-md' }">
      <template #body>
        <div v-if="refundPago" class="space-y-4">
          <div class="surface p-4 rounded-lg">
            <p class="text-sm text-theme-muted">Pago a reembolsar</p>
            <p class="font-semibold">{{ currency(refundPago.amount) }} — Pedido #{{ refundPago.order_id }}</p>
          </div>

          <UField label="Monto a reembolsar" name="refund_amount">
            <UInput v-model.number="refundAmount" type="number" :max="Number(refundPago.amount)" min="0.01" step="0.01" />
          </UField>

          <UField label="Razón (opcional)" name="refund_reason">
            <UInput v-model="refundReason" placeholder="Motivo del reembolso" />
          </UField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" variant="outline" @click="refundOpen = false" />
          <UButton label="Reembolsar" color="warning" :loading="refundLoading" @click="executeRefund" />
        </div>
      </template>
    </UModal>

    <!-- ===== MODAL CANCELAR ===== -->
    <UModal v-model:open="cancelOpen" title="Cancelar pago" :ui="{ content: 'w-full max-w-md' }">
      <template #body>
        <div v-if="cancelPago" class="space-y-4">
          <p class="text-sm text-theme-muted">
            ¿Estás seguro de que deseas cancelar este pago? Esta acción no se puede deshacer.
          </p>
          <div class="surface p-4 rounded-lg">
            <p class="text-sm text-theme-muted">Pago a cancelar</p>
            <p class="font-semibold">{{ currency(cancelPago.amount) }} — Pedido #{{ cancelPago.order_id }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cerrar" variant="outline" @click="cancelOpen = false" />
          <UButton label="Cancelar pago" color="error" :loading="cancelLoading" @click="executeCancel" />
        </div>
      </template>
    </UModal>
  </div>
</template>
