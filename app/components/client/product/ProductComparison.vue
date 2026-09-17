<script setup lang="ts">
import type { ProductComparisonSection } from '~/types/store'

defineProps<{
  config: ProductComparisonSection
  product?: Record<string, unknown>
}>()

function isPositive(val: string | undefined) {
  const v = val?.toLowerCase()
  return v === 'sí' || v === 'si' || v === 'yes' || v === 'true' || v === '✓'
}

function isNegative(val: string | undefined) {
  const v = val?.toLowerCase()
  return v === 'no' || v === 'false' || v === '✗'
}
</script>

<template>
  <section class="py-16">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.headline }}</h2>
        <p class="mt-3 text-theme-muted max-w-2xl mx-auto">{{ config.subtext }}</p>
      </div>

      <!-- TABLE variant (default) -->
      <div v-if="!config.columns[0]?.is_ours" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-theme">
              <th class="text-left py-4 px-4 text-theme-muted font-medium text-sm">Característica</th>
              <th
                v-for="(col, i) in config.columns"
                :key="i"
                class="py-4 px-4 text-center font-semibold text-sm"
                :class="col.is_ours ? 'text-theme-brand bg-theme-brand/5 rounded-t-xl' : 'text-theme-secondary'"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in config.rows" :key="i" class="border-b border-theme/50 hover:bg-theme-alt/30 transition-colors">
              <td class="py-4 px-4 font-medium text-theme text-sm">{{ row.feature }}</td>
              <td
                v-for="(val, j) in row.values"
                :key="j"
                class="py-4 px-4 text-center"
                :class="config.columns[j]?.is_ours ? 'bg-theme-brand/5' : ''"
              >
                <UIcon v-if="isPositive(val)" name="i-lucide-check-circle" class="size-5 text-green-500 mx-auto" />
                <UIcon v-else-if="isNegative(val)" name="i-lucide-x-circle" class="size-5 text-red-400 mx-auto" />
                <span v-else class="text-theme text-sm">{{ val }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CARDS variant (visual comparison) -->
      <div v-else class="grid md:grid-cols-2 gap-8">
        <div
          v-for="(col, ci) in config.columns"
          :key="ci"
          class="rounded-2xl p-8 transition-all duration-300"
          :class="col.is_ours
            ? 'bg-linear-to-br from-theme-brand/10 to-theme-brand/5 border-2 border-theme-brand/30 shadow-lg shadow-theme-brand/10'
            : 'bg-theme-alt/50 border border-theme'"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="col.is_ours ? 'bg-theme-brand text-theme-on-brand' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              <UIcon :name="col.is_ours ? 'i-lucide-trophy' : 'i-lucide-minus'" class="size-6" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-theme">{{ col.label }}</h3>
              <p v-if="col.is_ours" class="text-xs text-theme-brand font-medium">La mejor elección</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="(row, ri) in config.rows" :key="ri" class="flex items-center gap-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                :class="isPositive(row.values[ci]) ? 'bg-green-100 dark:bg-green-900/30' : isNegative(row.values[ci]) ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'"
              >
                <UIcon v-if="isPositive(row.values[ci])" name="i-lucide-check" class="size-3.5 text-green-600 dark:text-green-400" />
                <UIcon v-else-if="isNegative(row.values[ci])" name="i-lucide-x" class="size-3.5 text-red-500" />
                <span v-else class="text-[10px] font-medium text-slate-500">{{ row.values[ci] }}</span>
              </div>
              <span class="text-sm text-theme">{{ row.feature }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
