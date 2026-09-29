<script setup lang="ts">
import type { StatsSection } from '~/types/store'

const props = defineProps<{ config: StatsSection }>()
</script>

<template>
  <section
    v-if="config.show"
    class="py-14 sm:py-18"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <div class="page-container">
      <div
        class="grid gap-8"
        :class="config.layout === 'grid-3' ? 'grid-cols-1 sm:grid-cols-3' : config.layout === 'grid-4' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'"
      >
        <div
          v-for="(stat, i) in config.items"
          :key="i"
          class="text-center"
        >
          <UIcon
            v-if="stat.icon"
            :name="stat.icon"
            class="size-8 mx-auto mb-3 opacity-70"
          />
          <p class="text-3xl sm:text-4xl font-bold mb-1">{{ stat.value }}</p>
          <p class="text-sm opacity-70">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
