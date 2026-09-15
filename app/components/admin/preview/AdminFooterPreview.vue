<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
const props = defineProps<{ config: TiendaConfig; dark?: boolean }>()
const s = computed(() => props.config.estilos)
const bg = computed(() => props.dark ? s.value.fondos.fondo_principal_dark : s.value.fondos.fondo_principal)
const c = computed(() => props.dark ? s.value.paleta.texto_principal_oscuro : s.value.paleta.texto_principal_claro)
const cs = computed(() => props.dark ? s.value.paleta.texto_secundario_oscuro : s.value.paleta.texto_secundario_claro)
const cm = computed(() => props.dark ? s.value.paleta.texto_muted_oscuro : s.value.paleta.texto_muted_claro)
const brd = computed(() => props.dark ? s.value.paleta.borde_oscuro : s.value.paleta.borde_claro)
</script>
<template>
  <footer class="border-t" :style="{ borderColor: brd, backgroundColor: bg }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-bold mb-3" :style="{ color: s.colores.primario }">{{ config.brand.name }}</h3>
          <p class="text-sm" :style="{ color: cs }">{{ config.brand.tagline }}</p>
        </div>
        <div v-for="(col, i) in config.footer.columns" :key="i">
          <h4 class="font-semibold mb-3 text-sm" :style="{ color: c }">{{ col.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in col.links" :key="link.label">
              <span class="text-sm hover:opacity-80" :style="{ color: cs }">{{ link.label }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-6 text-center" :style="{ borderColor: brd }">
        <p class="text-xs" :style="{ color: cm }">&copy; 2026 {{ config.brand.name }}. {{ config.footer.copyright_text }}</p>
      </div>
    </div>
  </footer>
</template>
