<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  retryLabel?: string
}>(), {
  title: 'Algo salió mal',
  description: 'No pudimos cargar esta sección. Intenta de nuevo en un momento.',
  retryLabel: 'Reintentar'
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-14 animate-fade-up">
    <div class="size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-5">
      <UIcon
        name="i-lucide-circle-alert"
        class="size-7 text-rose-500"
      />
    </div>
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
      {{ title }}
    </h3>
    <p class="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      {{ description }}
    </p>
    <UButton
      class="mt-6"
      color="primary"
      variant="soft"
      :label="retryLabel"
      icon="i-lucide-refresh-cw"
      @click="emit('retry')"
    />
  </div>
</template>
