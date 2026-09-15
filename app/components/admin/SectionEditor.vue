<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'

const props = defineProps<{
  config: TiendaConfig
  selected: string
}>()

const emit = defineEmits<{
  'update:selected': [value: string]
}>()

const previewDark = ref(false)
</script>

<template>
  <div class="text-left h-screen">
    <!-- Theme Toggle Bar -->
    <div class="flex items-center justify-end gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <button
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        :class="!previewDark ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-700' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-300'"
        @click="previewDark = false"
      >
        <UIcon name="i-lucide-sun" class="size-3.5" />
        Claro
      </button>
      <button
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        :class="previewDark ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-700' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-300'"
        @click="previewDark = true"
      >
        <UIcon name="i-lucide-moon" class="size-3.5" />
        Oscuro
      </button>
    </div>

    <ClientPageRenderer
      :config="config"
      mode="admin-preview"
      :selected-section-id="selected"
      :dark="previewDark"
      :scale="0.75"
      @update:selected-section-id="emit('update:selected', $event)"
    />
  </div>
</template>
