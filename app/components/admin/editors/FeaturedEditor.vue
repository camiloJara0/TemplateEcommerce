<script setup lang="ts">
import type { FeaturedSection } from '~/types/store'

const props = defineProps<{ value: FeaturedSection }>()
const emit = defineEmits<{ update: [value: FeaturedSection] }>()

function update(field: keyof FeaturedSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as FeaturedSection)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Destacados</p>

    <UiBaseInput :model-value="value.title" label="Título" @update:model-value="update('title', String($event))" />
    <UiBaseInput :model-value="value.subtitle" label="Subtítulo" @update:model-value="update('subtitle', String($event))" />
    <UCheckbox :model-value="value.show_all_link" label="Mostrar enlace 'Ver más'" @update:model-value="update('show_all_link', $event)" />
  </div>
</template>
