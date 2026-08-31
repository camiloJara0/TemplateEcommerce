<script setup lang="ts">
import type { HeroSection } from '~/types/store'

const props = defineProps<{ value: HeroSection }>()
const emit = defineEmits<{ update: [value: HeroSection] }>()

function update(field: keyof HeroSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as HeroSection)
}

function updateCtaPrimary(field: 'label' | 'url', val: string) {
  emit('update', { ...props.value, cta_primary: { ...props.value.cta_primary, [field]: val } } as HeroSection)
}

function updateCtaSecondary(field: 'label' | 'url', val: string) {
  if (!props.value.cta_secondary) return
  emit('update', { ...props.value, cta_secondary: { ...props.value.cta_secondary, [field]: val } } as HeroSection)
}

function toggleSecondary() {
  if (props.value.cta_secondary) {
    emit('update', { ...props.value, cta_secondary: null } as HeroSection)
  } else {
    emit('update', { ...props.value, cta_secondary: { label: 'Ver ofertas', url: '/ofertas' } } as HeroSection)
  }
}

function updateStat(index: number, field: 'value' | 'label', val: string) {
  const stats = [...props.value.stats]
  stats[index] = { ...stats[index], [field]: val } as { value: string, label: string }
  emit('update', { ...props.value, stats } as HeroSection)
}

function addStat() {
  emit('update', { ...props.value, stats: [...props.value.stats, { value: '0', label: 'Nuevo stat' }] } as HeroSection)
}

function removeStat(index: number) {
  emit('update', { ...props.value, stats: props.value.stats.filter((_, i) => i !== index) } as HeroSection)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hero</p>

    <UiBaseInput :model-value="value.badge ?? ''" label="Badge (texto)" @update:model-value="update('badge', String($event) || null)" />
    <UiBaseInput :model-value="value.headline" label="Headline" @update:model-value="update('headline', String($event))" />
    <UiBaseTextarea :model-value="value.subtext" label="Subtext" :rows="3" @update:model-value="update('subtext', String($event))" />

    <div class="space-y-2">
      <p class="text-xs font-medium text-slate-600 dark:text-slate-400">CTA Principal</p>
      <UiBaseInput :model-value="value.cta_primary.label" label="Label" @update:model-value="updateCtaPrimary('label', String($event))" />
      <UiBaseInput :model-value="value.cta_primary.url" label="URL" @update:model-value="updateCtaPrimary('url', String($event))" />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">CTA Secundario</p>
        <UButton
          :label="value.cta_secondary ? 'Quitar' : 'Agregar'"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="toggleSecondary"
        />
      </div>
      <template v-if="value.cta_secondary">
        <UiBaseInput :model-value="value.cta_secondary.label" label="Label" @update:model-value="updateCtaSecondary('label', String($event))" />
        <UiBaseInput :model-value="value.cta_secondary.url" label="URL" @update:model-value="updateCtaSecondary('url', String($event))" />
      </template>
    </div>

    <UiBaseInput :model-value="value.background_image ?? ''" label="Imagen de fondo (URL)" @update:model-value="update('background_image', String($event) || null)" />

    <UCheckbox :model-value="value.show_stats" label="Mostrar estadísticas" @update:model-value="update('show_stats', $event)" />

    <div v-if="value.show_stats" class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Estadísticas</p>
        <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addStat" />
      </div>
      <div v-for="(stat, i) in value.stats" :key="i" class="flex gap-2 items-start">
        <UiBaseInput :model-value="stat.value" label="" placeholder="Valor" class="flex-1" @update:model-value="updateStat(i, 'value', String($event))" />
        <UiBaseInput :model-value="stat.label" label="" placeholder="Etiqueta" class="flex-1" @update:model-value="updateStat(i, 'label', String($event))" />
        <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" class="mt-1" @click="removeStat(i)" />
      </div>
    </div>
  </div>
</template>
