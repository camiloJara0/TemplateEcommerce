<script setup lang="ts">
withDefaults(defineProps<{
  subtotal: number
  discount?: number
  shipping?: number
  tax?: number
  total: number
  currencyCode?: string
  loading?: boolean
}>(), {
  discount: 0,
  shipping: 0,
  tax: 0,
  currencyCode: 'COP',
  loading: false
})

const { currency } = useFormat()
</script>

<template>
  <div class="surface p-5 sm:p-6 space-y-4">
    <h3 class="font-semibold text-slate-900 dark:text-white">
      Resumen
    </h3>

    <dl class="space-y-3 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">
          Subtotal
        </dt>
        <dd class="font-medium tabular-nums">
          {{ currency(subtotal, currencyCode) }}
        </dd>
      </div>
      <div
        v-if="discount > 0"
        class="flex justify-between gap-4"
      >
        <dt class="text-emerald-600">
          Descuento
        </dt>
        <dd class="font-medium text-emerald-600 tabular-nums">
          −{{ currency(discount, currencyCode) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">
          Envío
        </dt>
        <dd class="font-medium tabular-nums">
          {{ shipping === 0 ? 'Gratis' : currency(shipping, currencyCode) }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-slate-500">
          Impuestos
        </dt>
        <dd class="font-medium tabular-nums">
          {{ currency(tax, currencyCode) }}
        </dd>
      </div>
      <USeparator />
      <div class="flex justify-between gap-4 text-base">
        <dt class="font-semibold">
          Total
        </dt>
        <dd class="font-semibold tabular-nums">
          {{ currency(total, currencyCode) }}
        </dd>
      </div>
    </dl>

    <slot name="actions" />
  </div>
</template>
