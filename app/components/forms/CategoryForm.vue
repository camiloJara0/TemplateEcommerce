<script setup lang="ts">
import type { CategoryPayload } from '~/types/admin'
import { useAdminProductosService } from '~/composables/services/admin/productos'
import type { SelectOption } from '~/components/ui/BaseSelect.vue'

interface Props {
  action?: (payload: CategoryPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<CategoryPayload>
  parentOptions?: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar categoría',
  loading: false,
  initial: () => ({
    name: '',
    parent_id: undefined as unknown as number,
    description: '',
    image: '',
    sort_order: 0,
    is_active: true
  }),
  parentOptions: () => [] as SelectOption[]
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 120 },
  { key: 'description', label: 'Descripción', maxLength: 500 },
  { key: 'sort_order', label: 'Orden', min: 0 }
])

setForm({ ...props.initial })

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: CategoryPayload = {
      name: String(form.value.name ?? ''),
      parent_id: form.value.parent_id ? Number(form.value.parent_id) : undefined,
      description: form.value.description || undefined,
      image: form.value.image || undefined,
      sort_order: form.value.sort_order != null ? Number(form.value.sort_order) : undefined,
      is_active: Boolean(form.value.is_active)
    }
    const result = props.action ? await props.action(payload) : await useAdminProductosService().crearCategoria(payload)
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
    <UiBaseSelect
      v-model="form.parent_id"
      label="Categoría padre (opcional)"
      :items="parentOptions"
      placeholder="Sin padre"
      :error="visibleErrors.parent_id || undefined"
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
      label="URL de imagen"
      icon="i-lucide-image"
      :error="visibleErrors.image || undefined"
    />
    <UiBaseInput
      v-model.number="form.sort_order"
      label="Orden"
      type="number"
      :error="visibleErrors.sort_order || undefined"
      @blur="touch('sort_order')"
    />
    <UCheckbox
      v-model="form.is_active"
      label="Categoría activa"
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
