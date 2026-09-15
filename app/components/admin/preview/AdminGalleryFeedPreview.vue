<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
</script>
<template>
  <section v-if="config.secciones.gallery_feed.items.length" class="py-14 sm:py-20" :style="{ backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2" :style="{ color: c }">{{ config.secciones.gallery_feed.title }}</h2>
        <p v-if="config.secciones.gallery_feed.subtitle" :style="{ color: cs }">{{ config.secciones.gallery_feed.subtitle }}</p>
      </div>
      <div class="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div v-for="(item, i) in config.secciones.gallery_feed.items" :key="i" class="aspect-square rounded-xl overflow-hidden" :style="{ backgroundColor: cm + '20' }">
          <img v-if="item.image" :src="item.image" :alt="item.caption || ''" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="size-8" :style="{ color: cm }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
