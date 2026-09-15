<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const nl = computed(() => props.config.secciones.newsletter)
</script>
<template>
  <section class="py-16 sm:py-20" :style="{ backgroundColor: nl.bg_color, color: nl.text_color }">
    <div class="max-w-7xl mx-auto px-6 text-center">
      <h2 class="text-2xl sm:text-3xl font-bold mb-3">{{ nl.headline }}</h2>
      <p class="text-sm opacity-80 mb-6 max-w-xl mx-auto">{{ nl.subtext }}</p>
      <div class="flex gap-2 max-w-md mx-auto">
        <div class="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white text-sm">{{ nl.placeholder }}</div>
        <span class="px-6 py-3 rounded-xl font-semibold bg-white text-sm" :style="{ color: nl.bg_color }">{{ nl.button_label }}</span>
      </div>
    </div>
  </section>
</template>
