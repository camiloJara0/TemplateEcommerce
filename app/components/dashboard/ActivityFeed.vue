<script setup lang="ts">
export interface ActivityItem {
  id: number | string
  type?: string
  text: string
  time: string
  icon?: string
}

defineProps<{
  items: ActivityItem[]
}>()
</script>

<template>
  <ul class="space-y-1">
    <li
      v-for="item in items"
      :key="item.id"
      class="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <div class="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <UIcon
          :name="item.icon || 'i-lucide-activity'"
          class="size-4 text-slate-500"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm text-slate-700 dark:text-slate-200">
          {{ item.text }}
        </p>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ item.time }}
        </p>
      </div>
    </li>
  </ul>
</template>
