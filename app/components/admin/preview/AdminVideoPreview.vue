<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
const v = computed(() => props.config.secciones.video)
</script>
<template>
  <section class="py-14 sm:py-20" :style="{ backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2" :style="{ color: c }">{{ v.headline }}</h2>
        <p v-if="v.subtext" class="max-w-xl mx-auto" :style="{ color: cs }">{{ v.subtext }}</p>
      </div>
      <div class="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl aspect-video" :style="{ backgroundColor: cm + '20' }">
        <img v-if="v.thumbnail" :src="v.thumbnail" alt="" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-play-circle" class="size-16" :style="{ color: cm }" />
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <UIcon name="i-lucide-play" class="size-8 ml-1" :style="{ color: s.colores.primario }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
