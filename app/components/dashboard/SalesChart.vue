<script setup lang="ts">
import type { SalesByDay } from '~/types/admin'

const props = defineProps<{
  data: SalesByDay[]
}>()

const { currency, compact } = useFormat()

const max = computed(() => Math.max(...props.data.map(d => d.total), 1))

function barHeight(total: number) {
  return `${Math.max((total / max.value) * 100, 4)}%`
}

function dayLabel(fecha: string) {
  // const d = new Date(fecha + 'T12:00:00')
  // return new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(d)
  return fecha
}
</script>

<template>
  <div class="h-56 flex items-end gap-2 sm:gap-3">
    <div
      v-for="point in data"
      :key="point.fecha"
      class="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
    >
      <div class="relative w-full flex-1 flex items-end">
        <div
          class="w-full rounded-t-lg bg-brand-500/90 dark:bg-brand-500 transition-all duration-300 ease-out group-hover:bg-brand-600 relative"
          :style="{ height: barHeight(point.total) }"
        >
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
            <span class="text-[10px] font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2 py-1 rounded-md shadow-soft">
              {{ currency(point.total) }}
            </span>
          </div>
        </div>
      </div>
      <div class="text-center">
        <p class="text-[11px] font-medium text-slate-500 capitalize">
          {{ dayLabel(point.fecha) }}
        </p>
        <p class="text-[10px] text-slate-400 tabular-nums hidden sm:block">
          {{ compact(point.total) }}
        </p>
      </div>
    </div>
  </div>
</template>
