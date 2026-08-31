<script setup lang="ts">
import type { CouponPayload } from '~/types/admin'
import type { CouponType } from '~/types/api'
import { useAdminCuponesService } from '~/composables/services/admin/cupones'

interface Props {
  action?: (payload: CouponPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<CouponPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar cupón',
  loading: false,
  initial: () => ({
    code: '',
    type: 'percent' as CouponType,
    value: 0,
    min_subtotal: undefined as unknown as number,
    max_discount: undefined as unknown as number,
    usage_limit: undefined as unknown as number,
    per_user_limit: undefined as unknown as number,
    starts_at: '',
    expires_at: '',
    active: true
  })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'code', label: 'Código', required: true, minLength: 2, maxLength: 50, custom: (v) => {
    if (!v) return null
    if (!/^[A-Z0-9_-]+$/i.test(String(v))) return 'Solo letras, números, guion y guion bajo'
    return null
  } },
  { key: 'type', label: 'Tipo', required: true },
  { key: 'value', label: 'Valor', required: true, min: 0 },
  { key: 'min_subtotal', label: 'Subtotal mínimo', min: 0 },
  { key: 'max_discount', label: 'Descuento máximo', min: 0 },
  { key: 'usage_limit', label: 'Límite de usos', min: 1 },
  { key: 'per_user_limit', label: 'Límite por usuario', min: 1 }
])

setForm({ ...props.initial })

const typeOptions = [
  { label: 'Porcentaje (%)', value: 'percent' },
  { label: 'Monto fijo', value: 'fixed' },
  { label: 'Envío gratis', value: 'free_shipping' }
]

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: CouponPayload = {
      code: String(form.value.code ?? '').toUpperCase(),
      type: form.value.type as CouponType,
      value: Number(form.value.value ?? 0),
      min_subtotal: form.value.min_subtotal != null ? Number(form.value.min_subtotal) : undefined,
      max_discount: form.value.max_discount != null ? Number(form.value.max_discount) : undefined,
      usage_limit: form.value.usage_limit != null ? Number(form.value.usage_limit) : undefined,
      per_user_limit: form.value.per_user_limit != null ? Number(form.value.per_user_limit) : undefined,
      starts_at: form.value.starts_at || undefined,
      expires_at: form.value.expires_at || undefined,
      active: Boolean(form.value.active)
    }
    const result = props.action ? await props.action(payload) : await useAdminCuponesService().crear(payload)
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
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model="form.code"
        label="Código del cupón"
        placeholder="VERANO20"
        required
        :error="visibleErrors.code || undefined"
        @blur="touch('code')"
      />
      <UiBaseSelect
        v-model="form.type"
        label="Tipo"
        :items="typeOptions"
        required
        :error="visibleErrors.type || undefined"
        @blur="touch('type')"
      />
    </div>
    <UiBaseInput
      v-model.number="form.value"
      label="Valor"
      type="number"
      required
      :error="visibleErrors.value || undefined"
      @blur="touch('value')"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model.number="form.min_subtotal"
        label="Subtotal mínimo"
        type="number"
        :error="visibleErrors.min_subtotal || undefined"
        @blur="touch('min_subtotal')"
      />
      <UiBaseInput
        v-model.number="form.max_discount"
        label="Descuento máximo"
        type="number"
        :error="visibleErrors.max_discount || undefined"
        @blur="touch('max_discount')"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model.number="form.usage_limit"
        label="Límite total de usos"
        type="number"
        :error="visibleErrors.usage_limit || undefined"
        @blur="touch('usage_limit')"
      />
      <UiBaseInput
        v-model.number="form.per_user_limit"
        label="Límite por usuario"
        type="number"
        :error="visibleErrors.per_user_limit || undefined"
        @blur="touch('per_user_limit')"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UFormField label="Fecha de inicio">
        <UInput
          v-model="form.starts_at"
          type="datetime-local"
          size="md"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Fecha de expiración">
        <UInput
          v-model="form.expires_at"
          type="datetime-local"
          size="md"
          class="w-full"
        />
      </UFormField>
    </div>
    <UCheckbox
      v-model="form.active"
      label="Cupón activo"
    />

    <slot name="extras" />

    <UiBaseButton
      type="submit"
      color="primary"
      :label="submitLabel"
      :loading="loading || submitLoading"
      :disabled="!isValid"
      class="rounded-xl mt-2"
    />
  </UForm>
</template>
