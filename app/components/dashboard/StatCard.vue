<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  value: string
  icon?: string
  trend?: number
  trendLabel?: string
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}>(), {
  tone: 'primary'
})

const toneMap = {
  primary: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  error: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}
</script>

<template>
  <div class="surface p-5 sm:p-6 hover-lift">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          {{ title }}
        </p>
        <p class="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {{ value }}
        </p>
      </div>
      <div
        v-if="icon"
        class="size-11 rounded-2xl flex items-center justify-center shrink-0"
        :class="toneMap[tone]"
      >
        <UIcon
          :name="icon"
          class="size-5"
        />
      </div>
    </div>

    <div
      v-if="trend != null"
      class="mt-3 flex items-center gap-1.5 text-xs"
    >
      <span
        class="inline-flex items-center gap-0.5 font-medium"
        :class="trend >= 0 ? 'text-emerald-600' : 'text-rose-600'"
      >
        <UIcon
          :name="trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="size-3.5"
        />
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-slate-400">
        {{ trendLabel || 'vs periodo anterior' }}
      </span>
    </div>
  </div>
</template>
