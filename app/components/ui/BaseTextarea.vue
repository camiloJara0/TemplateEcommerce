<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | null
  label?: string
  name?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  rows: 4,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
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
    <UTextarea
      :model-value="modelValue ?? undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :size="size"
      class="w-full"
      autoresize
      @update:model-value="emit('update:modelValue', $event)"
    />
  </UFormField>
</template>
