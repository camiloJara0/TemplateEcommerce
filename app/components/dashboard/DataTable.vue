<script setup lang="ts" generic="T extends Record<string, unknown>">
export interface TableColumn<T> {
  key: string
  label: string
  class?: string
  sortable?: boolean
}

const props = withDefaults(defineProps<{
  columns?: TableColumn<T>[]
  rows?: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  columns: () => [],
  rows: () => []
})

defineSlots<{
  [key: `cell-${string}`]: (props: { row: T, value: unknown }) => unknown
  empty: () => unknown
  'row-actions': (props: { row: T }) => unknown
}>()
</script>

<template>
  <div class="surface overflow-hidden">
    <FeedbackSkeletonLoader
      v-if="loading"
      variant="table"
      :count="5"
    />

    <template v-else>
      <div
        v-if="!rows.length"
        class="p-4"
      >
        <slot name="empty">
          <FeedbackEmptyState
            :title="emptyTitle || 'Sin registros'"
            :description="emptyDescription || 'No hay datos para mostrar.'"
          />
        </slot>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="min-w-full">
          <thead class="bg-slate-50/80 dark:bg-slate-900/50">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                scope="col"
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                :class="col.class"
              >
                {{ col.label }}
              </th>
              <th
                v-if="$slots['row-actions']"
                class="px-4 py-3"
              >
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(row, idx) in rows"
              :key="(row.id as string | number) ?? idx"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300"
                :class="col.class"
              >
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="row[col.key]"
                >
                  {{ row[col.key] ?? '—' }}
                </slot>
              </td>
              <td
                v-if="$slots['row-actions']"
                class="px-4 py-3.5 text-right"
              >
                <slot
                  name="row-actions"
                  :row="row"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
