<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="surface flex flex-col">
    <div class="px-5 py-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-slate-900 dark:text-white">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="text-xs text-slate-500 mt-0.5"
        >
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </div>
    <div class="p-5 sm:p-6 flex-1">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="px-5 py-3 sm:px-6 border-t border-slate-100 dark:border-slate-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
