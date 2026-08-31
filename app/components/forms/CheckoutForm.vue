<script setup lang="ts">
import type { CreateOrderPayload } from '~/types/commerce'

interface Props {
  action?: (payload: CreateOrderPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<CreateOrderPayload>
  addressOptions?: Array<{ label: string, value: number | string }>
  shippingOptions?: Array<{ label: string, value: number | string }>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Confirmar pedido',
  loading: false,
  initial: () => {
    return {
      address_id: undefined as unknown as number,
      shipping_method_id: undefined as unknown as number,
      coupon_code: '',
      notes: ''
    }
  },
  addressOptions: () => {
    return []
  },
  shippingOptions: () => {
    return []
  }
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'address_id', label: 'Dirección', required: true, custom: v => (!v ? 'Selecciona una dirección' : null) },
  { key: 'shipping_method_id', label: 'Método de envío', required: true, custom: v => (!v ? 'Selecciona un método de envío' : null) },
  { key: 'coupon_code', label: 'Cupón', maxLength: 50 },
  { key: 'notes', label: 'Notas', maxLength: 500 }
])

setForm({ ...props.initial })

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: CreateOrderPayload = {
      address_id: Number(form.value.address_id),
      shipping_method_id: Number(form.value.shipping_method_id),
      coupon_code: form.value.coupon_code || undefined,
      notes: form.value.notes || undefined
    }
    const result = props.action ? await props.action(payload) : await payload
    emit('success', result)
  } catch (e) {
    emit('error', e)
  } finally {
    submitLoading.value = false
  }
}

defineExpose({ form, visibleErrors, isValid })
</script>

<template>
  <UForm class="space-y-4" :state="form" @submit.prevent="onSubmit">
    <UiBaseSelect
      v-model="form.address_id"
      label="Dirección de envío"
      :items="addressOptions"
      required
      placeholder="Selecciona una dirección"
      :error="visibleErrors.address_id || undefined"
      @blur="touch('address_id')"
    />
    <UiBaseSelect
      v-model="form.shipping_method_id"
      label="Método de envío"
      :items="shippingOptions"
      required
      placeholder="Selecciona un método"
      :error="visibleErrors.shipping_method_id || undefined"
      @blur="touch('shipping_method_id')"
    />
    <UiBaseInput
      v-model="form.coupon_code"
      label="Cupón de descuento (opcional)"
      placeholder="CODIGO"
      icon="i-lucide-ticket"
      :error="visibleErrors.coupon_code || undefined"
      @blur="touch('coupon_code')"
    />
    <UiBaseTextarea
      v-model="form.notes"
      label="Notas para el pedido (opcional)"
      placeholder="Indicaciones especiales para la entrega"
      :error="visibleErrors.notes || undefined"
      @blur="touch('notes')"
    />

    <slot name="extras" />

    <UiBaseButton
      type="submit"
      block
      size="lg"
      color="primary"
      :label="submitLabel"
      :loading="loading || submitLoading"
      :disabled="!isValid"
      class="rounded-xl mt-2"
    />
  </UForm>
</template>
