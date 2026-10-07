<script setup lang="ts">
import type { Contact, ResponseContactPayload } from '~/types/commerce'

interface Props {
  action?: (payload: ResponseContactPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<Contact>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar cambios',
  loading: false,
  initial: () => ({ nombre: '', estado: '' })
})
const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const communityStore = useCommunityStore()
const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'estado', label: 'Estado', required: true },
  { key: 'respuesta', label: 'Respuesta', maxLength: 1200 }
])

setForm({ ...props.initial })

const estadosOptions = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Leido', value: 'Leido' },
  { label: 'Respondido', value: 'Respondido' },
  { label: 'Cerrado', value: 'Cerrado' }
]

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: ResponseContactPayload = {
      contact_message_id: form.value.id,
      user_id: form.value.user_id,
      estado: String(form.value.estado ?? ''),
      respuesta: form.value.respuesta || undefined
    }
    const result = props.action ? await props.action(payload) : await communityStore.adminResponse(payload)
    emit('success', result)
  } catch (e) {
    emit('error', e)
  } finally {
    submitLoading.value = false
  }
}

async function updateFechaLectura() {
  if (form.value.fecha_lectura) return

  await communityStore.adminUpdate(form.value.id, { estado: 'Leido', id: form.value.id })
  form.value.estado = 'Leido'
}

onMounted(async () => {
  await updateFechaLectura()
})

defineExpose({ form, visibleErrors, isValid })
</script>

<template>
  <UForm
    class="space-y-4"
    :state="form"
    @submit.prevent="onSubmit"
  >
    <UiBaseInput
      v-model="form.nombre"
      label="Nombre"
      disabled
    />
    <UiBaseInput
      v-model="form.asunto"
      label="Asunto"
      disabled
    />
    <UTextarea
      v-model="form.mensaje"
      label="Mensaje"
      class="w-full"
      disabled
    />

    <div class="w-full h-0.5 bg-gray-50 dark:bg-gray-800 my-2" />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UiBaseSelect
        v-model="form.estado"
        label="Estado"
        :items="estadosOptions"
        :error="visibleErrors.estado || undefined"
        @blur="touch('estado')"
      />
      <UiBaseInput
        v-model="form.correo"
        label="Correo cliente"
        disabled
      />
    </div>
    <UiBaseInput
      v-model="form.respuesta"
      label="Respuesta"
      placeholder="Hola Juan, "
      :error="visibleErrors.respuesta || undefined"
      @blur="touch('respuesta')"
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
