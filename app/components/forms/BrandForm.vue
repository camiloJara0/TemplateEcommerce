<script setup lang="ts">
import type { BrandPayload } from '~/types/admin'
import { useAdminProductosService } from '~/composables/services/admin/productos'

interface Props {
  action?: (payload: BrandPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<BrandPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar marca',
  loading: false,
  initial: () => ({
    name: '',
    description: '',
    image: '',
    is_active: true
  })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 120 },
  { key: 'description', label: 'Descripción', maxLength: 500 }
])

setForm({ ...props.initial })

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: BrandPayload = {
      name: String(form.value.name ?? ''),
      description: form.value.description || undefined,
      image: form.value.image || undefined,
      is_active: Boolean(form.value.is_active)
    }
    const result = props.action
      ? await props.action(payload)
      : await useAdminProductosService().crearMarca(payload)
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
      v-model="form.name"
      label="Nombre"
      required
      :error="visibleErrors.name || undefined"
      @blur="touch('name')"
    />
    <UiBaseTextarea
      v-model="form.description"
      label="Descripción"
      :rows="3"
      :error="visibleErrors.description || undefined"
      @blur="touch('description')"
    />
    <UiBaseInput
      v-model="form.image"
      label="URL de logo"
      icon="i-lucide-image"
      :error="visibleErrors.image || undefined"
    />
    <UCheckbox
      v-model="form.is_active"
      label="Marca activa"
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
