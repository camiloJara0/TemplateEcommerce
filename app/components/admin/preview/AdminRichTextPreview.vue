<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const rt = computed(() => props.config.secciones.richtext)
</script>
<template>
  <section class="py-14 sm:py-20" :style="{ backgroundColor: rt.bg_color || bg, color: rt.text_color || undefined }">
    <div class="max-w-7xl mx-auto px-6">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4" :style="{ color: rt.text_color || c }">{{ rt.headline }}</h2>
        <div class="opacity-80" :style="{ color: rt.text_color || cs }" v-html="rt.content" />
        <a v-if="rt.cta_label && rt.cta_url" :href="rt.cta_url" class="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-white font-semibold" :style="{ backgroundColor: s.colores.primario }">
          {{ rt.cta_label }}<UIcon name="i-lucide-arrow-right" class="size-4" />
        </a>
      </div>
    </div>
  </section>
</template>
