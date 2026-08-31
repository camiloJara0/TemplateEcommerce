<script setup lang="ts">
import type { AddressPayload } from '~/types/commerce'

interface Props {
  action?: (payload: AddressPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<AddressPayload>
  showPrincipal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar dirección',
  loading: false,
  showPrincipal: true,
  initial: () => ({
    label: '',
    pais: 'Colombia',
    ciudad: '',
    direccion: '',
    codigo_postal: '',
    telefono: '',
    es_principal: false
  })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'label', label: 'Etiqueta', maxLength: 60 },
  { key: 'pais', label: 'País', required: true, minLength: 2, maxLength: 80 },
  { key: 'ciudad', label: 'Ciudad', required: true, minLength: 2, maxLength: 120 },
  { key: 'direccion', label: 'Dirección', required: true, minLength: 5, maxLength: 200 },
  { key: 'codigo_postal', label: 'Código postal', maxLength: 20 },
  { key: 'telefono', label: 'Teléfono', maxLength: 30 }
])

setForm({ ...props.initial })

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: AddressPayload = {
      label: form.value.label || undefined,
      pais: String(form.value.pais ?? ''),
      ciudad: String(form.value.ciudad ?? ''),
      direccion: String(form.value.direccion ?? ''),
      codigo_postal: form.value.codigo_postal || undefined,
      telefono: form.value.telefono || undefined,
      es_principal: Boolean(form.value.es_principal)
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
    <UiBaseInput
      v-model="form.label"
      label="Etiqueta (ej. Casa, Oficina)"
      placeholder="Etiqueta"
      icon="i-lucide-tag"
      :error="visibleErrors.label || undefined"
      @blur="touch('label')"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model="form.pais"
        label="País"
        required
        :error="visibleErrors.pais || undefined"
        @blur="touch('pais')"
      />
      <UiBaseInput
        v-model="form.ciudad"
        label="Ciudad"
        required
        :error="visibleErrors.ciudad || undefined"
        @blur="touch('ciudad')"
      />
    </div>
    <UiBaseInput
      v-model="form.direccion"
      label="Dirección"
      placeholder="Calle 123 #45-67"
      required
      :error="visibleErrors.direccion || undefined"
      @blur="touch('direccion')"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model="form.codigo_postal"
        label="Código postal"
        :error="visibleErrors.codigo_postal || undefined"
        @blur="touch('codigo_postal')"
      />
      <UiBaseInput
        v-model="form.telefono"
        label="Teléfono"
        autocomplete="tel"
        :error="visibleErrors.telefono || undefined"
        @blur="touch('telefono')"
      />
    </div>

    <UCheckbox
      v-if="showPrincipal"
      v-model="form.es_principal"
      label="Marcar como dirección principal"
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
