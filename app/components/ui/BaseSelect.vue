<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: string
}

withDefaults(defineProps<{
  modelValue?: string | number | null
  items: SelectOption[]
  label?: string
  name?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md',
  placeholder: 'Seleccionar…'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :hint="hint"
    :error="error"
    :required="required"
  >
    <USelect
      :model-value="modelValue ?? undefined"
      :items="items"
      value-key="value"
      label-key="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="size"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </UFormField>
</template>
