<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const st = computed(() => props.config.secciones.stats)
</script>
<template>
  <section class="py-14 sm:py-18" :style="{ backgroundColor: st.bg_color, color: st.text_color }">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid gap-8 grid-cols-2 sm:grid-cols-4">
        <div v-for="(stat, i) in st.items" :key="i" class="text-center">
          <UIcon v-if="stat.icon" :name="stat.icon" class="size-8 mx-auto mb-3 opacity-70" />
          <p class="text-3xl sm:text-4xl font-bold mb-1">{{ stat.value }}</p>
          <p class="text-sm opacity-70">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
