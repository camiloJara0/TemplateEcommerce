<script setup lang="ts">
import type { CategoriesSection } from '~/types/store'

const props = defineProps<{ value: CategoriesSection }>()
const emit = defineEmits<{ update: [value: CategoriesSection] }>()

function update(field: keyof CategoriesSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as CategoriesSection)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Categorías</p>

    <UiBaseInput :model-value="value.title" label="Título" @update:model-value="update('title', String($event))" />
    <UiBaseInput :model-value="value.subtitle" label="Subtítulo" @update:model-value="update('subtitle', String($event))" />
    <UCheckbox :model-value="value.show_all_link" label="Mostrar enlace 'Ver todas'" @update:model-value="update('show_all_link', $event)" />
  </div>
</template>
