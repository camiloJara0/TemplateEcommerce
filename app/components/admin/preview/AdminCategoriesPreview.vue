<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const surface = computed(() => props.dark ? s.value.fondos.fondo_componentes_dark : s.value.fondos.fondo_componentes)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
</script>
<template>
  <section class="section-padding" :style="{ backgroundColor: bg }">
    <div class="page-container">
      <h2 class="text-2xl font-bold mb-2" :style="{ color: c }">{{ config.secciones.categories.title }}</h2>
      <p class="mb-6" :style="{ color: cs }">{{ config.secciones.categories.subtitle }}</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="i in 6" :key="i" class="aspect-square rounded-2xl flex items-center justify-center" :style="{ backgroundColor: surface }">
          <UIcon name="i-lucide-layers" class="size-8" :style="{ color: cm }" />
        </div>
      </div>
    </div>
  </section>
</template>
