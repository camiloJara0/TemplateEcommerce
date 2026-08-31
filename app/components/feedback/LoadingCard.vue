<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: 'Cargando…'
})
</script>

<template>
  <div class="surface flex flex-col items-center justify-center gap-4 py-16 px-6">
    <div class="relative size-10">
      <div class="absolute inset-0 rounded-full border-2 border-brand-100 dark:border-brand-900" />
      <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
    </div>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ label }}
    </p>
  </div>
</template>
