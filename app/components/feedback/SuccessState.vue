<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>(), {
  title: 'Listo',
  description: 'La operación se completó correctamente.'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-14 animate-scale-in">
    <div class="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-5">
      <UIcon
        name="i-lucide-circle-check"
        class="size-7 text-emerald-500"
      />
    </div>
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
      {{ title }}
    </h3>
    <p class="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      {{ description }}
    </p>
    <UButton
      v-if="actionLabel"
      class="mt-6"
      color="primary"
      :label="actionLabel"
      :to="actionTo"
    />
  </div>
</template>
