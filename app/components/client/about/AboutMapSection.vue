<script setup lang="ts">
import type { AboutMapSection } from '~/types/store'

const props = defineProps<{ config: AboutMapSection }>()

const mapUrl = computed(() => {
  if (props.config.latitude && props.config.longitude) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${props.config.longitude - 0.01},${props.config.latitude - 0.01},${props.config.longitude + 0.01},${props.config.latitude + 0.01}&layer=mapnik&marker=${props.config.latitude},${props.config.longitude}`
  }
  return `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(props.config.address)}`
})
</script>

<template>
  <section v-if="config.show" class="py-14 sm:py-20 bg-theme-alt">
    <div class="page-container">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="rounded-2xl overflow-hidden shadow-lg h-80 bg-theme-surface">
          <iframe :src="mapUrl" class="w-full h-full border-0" loading="lazy" />
        </div>
        <div class="space-y-6">
          <div v-if="config.address" class="flex items-start gap-3">
            <UIcon name="i-lucide-map-pin" class="size-5 text-theme-brand mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-theme-muted uppercase tracking-wider mb-1">Dirección</p>
              <p class="text-theme font-medium">{{ config.address }}</p>
            </div>
          </div>
          <div v-if="config.phone" class="flex items-start gap-3">
            <UIcon name="i-lucide-phone" class="size-5 text-theme-brand mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-theme-muted uppercase tracking-wider mb-1">Teléfono</p>
              <p class="text-theme font-medium">{{ config.phone }}</p>
            </div>
          </div>
          <div v-if="config.hours" class="flex items-start gap-3">
            <UIcon name="i-lucide-clock" class="size-5 text-theme-brand mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-theme-muted uppercase tracking-wider mb-1">Horario</p>
              <p class="text-theme font-medium">{{ config.hours }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
