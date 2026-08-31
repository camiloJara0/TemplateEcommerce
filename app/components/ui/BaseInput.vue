<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  label?: string
  name?: string
  type?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  icon?: string
  trailingIcon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autocomplete?: string
}>(), {
  type: 'text',
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const id = useId()
</script>

<template>
  <UFormField
    :label="label"
    :name="name"
    :hint="hint"
    :error="error"
    :required="required"
  >
    <UInput
      :id="id"
      :model-value="modelValue ?? undefined"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :icon="icon"
      :trailing-icon="trailingIcon"
      :size="size"
      :autocomplete="autocomplete"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </UFormField>
</template>
