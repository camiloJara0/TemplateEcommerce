<script setup lang="ts">
import type { TagPayload } from '~/types/admin'
import { useAdminProductosService } from '~/composables/services/admin/productos'

interface Props {
  action?: (payload: TagPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<TagPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar etiqueta',
  loading: false,
  initial: () => ({
    name: '',
    slug: ''
  })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 60 },
  { key: 'slug', label: 'Slug', maxLength: 70 }
])

setForm({ ...props.initial })

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: TagPayload = {
      name: String(form.value.name ?? ''),
      slug: form.value.slug ? String(form.value.slug) : undefined
    }
    const result = props.action
      ? await props.action(payload)
      : await useAdminProductosService().crearEtiqueta(payload)
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
      placeholder="Ej: oferta"
      required
      :error="visibleErrors.name || undefined"
      @blur="touch('name')"
    />
    <UiBaseInput
      v-model="form.slug"
      label="Slug (opcional)"
      placeholder="Se genera desde el nombre"
      icon="i-lucide-link"
      :error="visibleErrors.slug || undefined"
      @blur="touch('slug')"
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
