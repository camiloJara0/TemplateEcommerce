<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
</script>
<template>
  <section class="section-padding" :style="{ backgroundColor: bg }">
    <div class="page-container">
      <div class="relative overflow-hidden rounded-3xl text-white p-10" style="background-color: #0f172a">
        <div class="absolute inset-0" :style="{ background: `linear-gradient(135deg, ${s.colores.primario}cc, ${s.colores.primario}99, ${s.colores.accent}66)` }" />
        <div class="relative">
          <span class="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4">{{ config.secciones.deals.badge }}</span>
          <h2 class="text-3xl font-bold">{{ config.secciones.deals.headline }}</h2>
          <p class="mt-3 text-white/80 max-w-md">{{ config.secciones.deals.subtext }}</p>
          <span class="inline-block mt-6 px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold">{{ config.secciones.deals.cta_label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
