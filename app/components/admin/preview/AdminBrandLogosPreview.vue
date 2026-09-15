<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
</script>
<template>
  <section class="py-12 sm:py-16" :style="{ backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-6">
      <p class="text-center text-sm mb-8 uppercase tracking-wider font-medium" :style="{ color: cm }">{{ config.secciones.brand_logos.title }}</p>
      <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        <div v-for="(brand, i) in config.secciones.brand_logos.items" :key="i" class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <img v-if="brand.logo" :src="brand.logo" :alt="brand.name" class="h-8 sm:h-10 object-contain" />
          <span v-else class="text-lg sm:text-xl font-bold" :style="{ color: cm }">{{ brand.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
