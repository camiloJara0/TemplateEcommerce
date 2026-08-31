<script setup lang="ts">
import type { UpdateProfilePayload } from '~/types/api'
import { usePerfilService } from '~/composables/services/perfil'

interface Props {
  action?: (payload: UpdateProfilePayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<UpdateProfilePayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar cambios',
  loading: false,
  initial: () => ({ nombre: '', telefono: '', foto: '', idioma: 'es' })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'nombre', label: 'Nombre', required: true, minLength: 2, maxLength: 120 },
  { key: 'telefono', label: 'Teléfono', maxLength: 30 },
  { key: 'foto', label: 'Foto (URL)', maxLength: 500 },
  { key: 'idioma', label: 'Idioma', maxLength: 5 }
])

setForm({ ...props.initial })

const idiomaOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' }
]

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: UpdateProfilePayload = {
      nombre: String(form.value.nombre ?? ''),
      telefono: form.value.telefono || undefined,
      foto: form.value.foto || undefined,
      idioma: form.value.idioma || undefined
    }
    const result = props.action ? await props.action(payload) : await usePerfilService().actualizar(payload)
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
      v-model="form.nombre"
      label="Nombre"
      required
      autocomplete="name"
      :error="visibleErrors.nombre || undefined"
      @blur="touch('nombre')"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseInput
        v-model="form.telefono"
        label="Teléfono"
        autocomplete="tel"
        :error="visibleErrors.telefono || undefined"
        @blur="touch('telefono')"
      />
      <UiBaseSelect
        v-model="form.idioma"
        label="Idioma"
        :items="idiomaOptions"
        :error="visibleErrors.idioma || undefined"
        @blur="touch('idioma')"
      />
    </div>
    <UiBaseInput
      v-model="form.foto"
      label="URL de foto de perfil"
      placeholder="https://..."
      icon="i-lucide-image"
      :error="visibleErrors.foto || undefined"
      @blur="touch('foto')"
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
