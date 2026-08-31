<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  icon?: string
  trailingIcon?: string
  loading?: boolean
  disabled?: boolean
  block?: boolean
  to?: string
  type?: 'button' | 'submit' | 'reset'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  type: 'button',
  color: 'primary',
  variant: 'solid',
  size: 'md'
})
</script>

<template>
  <UButton
    :label="label"
    :icon="icon"
    :trailing-icon="trailingIcon"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :to="to"
    :type="type"
    :color="color"
    :variant="variant"
    :size="size"
    class="focus-ring"
  >
    <slot />
  </UButton>
</template>
