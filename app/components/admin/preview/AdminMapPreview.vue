<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_componentes_dark : s.value.fondos.fondo_componentes)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
const m = computed(() => props.config.secciones.map)
</script>
<template>
  <section class="py-14 sm:py-20" :style="{ backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2" :style="{ color: c }">{{ m.headline }}</h2>
        <p v-if="m.subtext" :style="{ color: cs }">{{ m.subtext }}</p>
      </div>
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="rounded-2xl overflow-hidden shadow-lg h-80 flex items-center justify-center" :style="{ backgroundColor: s.fondos.fondo_principal }">
          <UIcon name="i-lucide-map" class="size-12" :style="{ color: cm }" />
        </div>
        <div class="space-y-6">
          <div v-if="m.address" class="flex items-start gap-3">
            <UIcon name="i-lucide-map-pin" class="size-5 mt-0.5 shrink-0" :style="{ color: s.colores.primario }" />
            <div><p class="text-xs uppercase tracking-wider mb-1" :style="{ color: cm }">Dirección</p><p class="font-medium" :style="{ color: c }">{{ m.address }}</p></div>
          </div>
          <div v-if="m.phone" class="flex items-start gap-3">
            <UIcon name="i-lucide-phone" class="size-5 mt-0.5 shrink-0" :style="{ color: s.colores.primario }" />
            <div><p class="text-xs uppercase tracking-wider mb-1" :style="{ color: cm }">Teléfono</p><p class="font-medium" :style="{ color: c }">{{ m.phone }}</p></div>
          </div>
          <div v-if="m.hours" class="flex items-start gap-3">
            <UIcon name="i-lucide-clock" class="size-5 mt-0.5 shrink-0" :style="{ color: s.colores.primario }" />
            <div><p class="text-xs uppercase tracking-wider mb-1" :style="{ color: cm }">Horario</p><p class="font-medium" :style="{ color: c }">{{ m.hours }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
