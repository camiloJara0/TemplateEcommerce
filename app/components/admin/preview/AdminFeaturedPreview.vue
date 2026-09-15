<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_componentes_dark : s.value.fondos.fondo_componentes)
const surface = computed(() => props.dark ? s.value.fondos.fondo_componentes_dark : s.value.fondos.fondo_componentes)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
</script>
<template>
  <section class="section-padding" :style="{ backgroundColor: bg }">
    <div class="page-container">
      <h2 class="text-2xl font-bold mb-2" :style="{ color: c }">{{ config.secciones.featured.title }}</h2>
      <p class="mb-6" :style="{ color: cs }">{{ config.secciones.featured.subtitle }}</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden shadow-sm" :style="{ backgroundColor: surface }">
          <div class="aspect-square flex items-center justify-center" :style="{ backgroundColor: surface }">
            <UIcon name="i-lucide-package" class="size-10" :style="{ color: cm }" />
          </div>
          <div class="p-4">
            <div class="h-4 rounded w-3/4" :style="{ backgroundColor: cm + '30' }" />
            <div class="h-3 rounded w-1/2 mt-2" :style="{ backgroundColor: cm + '20' }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
