<script setup lang="ts">
import type { Language } from '~/types/api'
import type { StoreConfigPayload } from '~/types/store'
import { useAdminConfiguracionService } from '~/composables/services/admin/configuracion'

interface Props {
  action?: (payload: StoreConfigPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<StoreConfigPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar configuración',
  loading: false,
  initial: () => ({
    currency: 'COP',
    tax_rate: 0.19,
    default_language: 'es' as Language,
    support_email: '',
    support_phone: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: ''
  })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'currency', label: 'Moneda', required: true, custom: (v) => {
    if (!v) return null
    if (!/^[A-Z]{3}$/.test(String(v))) return 'Código ISO de 3 letras (ej. COP, USD)'
    return null
  } },
  { key: 'tax_rate', label: 'Tasa de impuesto', min: 0, custom: (v) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0 || n > 1) return 'Debe estar entre 0 y 1 (ej. 0.19 = 19%)'
    return null
  } },
  { key: 'support_email', label: 'Email de soporte', isEmail: true }
])

setForm({ ...props.initial })

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' }
]

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: StoreConfigPayload = {
      currency: String(form.value.currency ?? 'COP').toUpperCase(),
      tax_rate: Number(form.value.tax_rate ?? 0),
      default_language: form.value.default_language as Language,
      support_email: form.value.support_email || undefined,
      support_phone: form.value.support_phone || undefined,
      meta_title: form.value.meta_title || undefined,
      meta_description: form.value.meta_description || undefined,
      meta_keywords: form.value.meta_keywords || undefined,
      og_image: form.value.og_image || undefined
    }
    const result = props.action ? await props.action(payload) : await useAdminConfiguracionService().actualizar(payload)
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
  <UForm class="space-y-6" :state="form" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UiBaseInput
        v-model="form.currency"
        label="Moneda (ISO 3 letras)"
        placeholder="COP"
        maxlength="3"
        required
        :error="visibleErrors.currency || undefined"
        @blur="touch('currency')"
      />
      <UiBaseInput
        v-model.number="form.tax_rate"
        label="Impuesto (0-1)"
        type="number"
        step="0.01"
        required
        :error="visibleErrors.tax_rate || undefined"
        @blur="touch('tax_rate')"
      />
      <UiBaseSelect
        v-model="form.default_language"
        label="Idioma por defecto"
        :items="languageOptions"
      />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model="form.support_email"
        label="Email de soporte"
        type="email"
        :error="visibleErrors.support_email || undefined"
        @blur="touch('support_email')"
      />
      <UiBaseInput
        v-model="form.support_phone"
        label="Teléfono de soporte"
        autocomplete="tel"
      />
    </div>
    <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
      <p class="text-xs font-medium text-slate-500 mb-3">SEO</p>
      <div class="space-y-4">
        <UiBaseInput
          v-model="form.meta_title"
          label="Meta título"
        />
        <UiBaseTextarea
          v-model="form.meta_description"
          label="Meta descripción"
          :rows="3"
        />
        <UiBaseInput
          v-model="form.meta_keywords"
          label="Meta keywords (separadas por coma)"
        />
        <UiBaseInput
          v-model="form.og_image"
          label="Imagen Open Graph (URL)"
        />
      </div>
    </div>

    <slot name="extras" />

    <UiBaseButton
      type="submit"
      color="primary"
      size="lg"
      :label="submitLabel"
      :loading="loading || submitLoading"
      :disabled="!isValid"
      class="rounded-xl mt-2"
    />
  </UForm>
</template>
