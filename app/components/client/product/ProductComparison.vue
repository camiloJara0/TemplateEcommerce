<script setup lang="ts">
import type { ProductComparisonSection } from '~/types/store'

defineProps<{ config: ProductComparisonSection }>()
</script>

<template>
  <section v-if="config.show" class="py-16">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-theme">{{ config.headline }}</h2>
        <p class="mt-2 text-theme-muted">{{ config.subtext }}</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-theme">
              <th class="text-left py-4 px-4 text-theme-muted font-medium">Característica</th>
              <th
                v-for="(col, i) in config.columns"
                :key="i"
                class="py-4 px-4 text-center font-semibold"
                :class="col.is_ours ? 'text-theme-on-brand bg-theme-accent rounded-t-xl' : 'text-theme-secondary'"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in config.rows" :key="i" class="border-b border-theme">
              <td class="py-4 px-4 font-medium text-theme">{{ row.feature }}</td>
              <td
                v-for="(val, j) in row.values"
                :key="j"
                class="py-4 px-4 text-center"
                :class="config.columns[j]?.is_ours ? 'bg-theme-imagenes' : ''"
              >
                <UIcon
                  v-if="val.toLowerCase() === 'sí' || val.toLowerCase() === 'si' || val === '✓'"
                  name="i-lucide-check-circle"
                  class="size-5 text-green-500 mx-auto"
                />
                <UIcon
                  v-else-if="val.toLowerCase() === 'no' || val === '✗'"
                  name="i-lucide-x-circle"
                  class="size-5 text-red-400 mx-auto"
                />
                <span v-else class="text-theme">{{ val }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
