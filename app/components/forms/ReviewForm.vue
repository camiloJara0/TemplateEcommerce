<script setup lang="ts">
import type { CreateReviewPayload } from '~/types/catalog'
import { useResenasService } from '~/composables/services/resenas'

interface Props {
  action?: (payload: CreateReviewPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<CreateReviewPayload>
  productId?: number
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Enviar reseña',
  loading: false,
  initial: () => ({ rating: 5, comment: '' })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'rating', label: 'Calificación', required: true, min: 1, custom: (v) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n < 1 || n > 5) return 'La calificación debe ser entre 1 y 5'
    return null
  } },
  { key: 'comment', label: 'Comentario', maxLength: 2000 }
])

setForm({ ...props.initial })

const ratingOptions = [
  { label: '1 estrella', value: 1 },
  { label: '2 estrellas', value: 2 },
  { label: '3 estrellas', value: 3 },
  { label: '4 estrellas', value: 4 },
  { label: '5 estrellas', value: 5 }
]

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: CreateReviewPayload = {
      rating: Number(form.value.rating),
      comment: form.value.comment || undefined
    }
    const result = props.action
      ? await props.action(payload)
      : await useResenasService().crear(props.productId ?? 0, payload)
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
      v-model="form.rating"
      label="Calificación"
      :items="ratingOptions"
      required
      :error="visibleErrors.rating || undefined"
      @blur="touch('rating')"
    />
    <UiBaseTextarea
      v-model="form.comment"
      label="Tu opinión"
      placeholder="Cuéntanos qué te pareció el producto"
      :rows="5"
      :error="visibleErrors.comment || undefined"
      @blur="touch('comment')"
    />

    <slot name="extras" />

    <UiBaseButton
      type="submit"
      block
      color="primary"
      :label="submitLabel"
      :loading="loading || submitLoading"
      :disabled="!isValid"
      class="rounded-xl mt-2"
    />
  </UForm>
</template>
