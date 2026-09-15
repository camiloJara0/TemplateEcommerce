<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const brd = computed(() => props.dark ? s.value.paleta.borde_oscuro : s.value.paleta.borde_claro)
</script>
<template>
  <nav class="border-b" :style="{ borderColor: brd, backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg" :style="{ color: config.estilos.colores.primario }">{{ config.brand.name }}</span>
        </div>
        <div class="hidden md:flex items-center gap-6">
          <span v-for="link in config.navbar.links.filter(l => l.visible)" :key="link.label" class="text-sm" :style="{ color: cs }">{{ link.label }}</span>
        </div>
        <div class="flex items-center gap-3">
          <UIcon v-if="config.navbar.show_search" name="i-lucide-search" class="size-5" :style="{ color: cm }" />
          <UIcon v-if="config.navbar.show_cart" name="i-lucide-shopping-cart" class="size-5" :style="{ color: cm }" />
        </div>
      </div>
    </div>
  </nav>
</template>
