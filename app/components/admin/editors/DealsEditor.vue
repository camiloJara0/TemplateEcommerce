<script setup lang="ts">
import type { DealsSection } from '~/types/store'

const props = defineProps<{ value: DealsSection }>()
const emit = defineEmits<{ update: [value: DealsSection] }>()

function update(field: keyof DealsSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as DealsSection)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ofertas</p>

    <UCheckbox :model-value="value.show_section" label="Mostrar sección" @update:model-value="update('show_section', $event)" />

    <template v-if="value.show_section">
      <UiBaseInput :model-value="value.badge" label="Badge" @update:model-value="update('badge', String($event))" />
      <UiBaseInput :model-value="value.headline" label="Headline" @update:model-value="update('headline', String($event))" />
      <UiBaseTextarea :model-value="value.subtext" label="Subtext" :rows="3" @update:model-value="update('subtext', String($event))" />
      <UiBaseInput :model-value="value.cta_label" label="Label del botón" @update:model-value="update('cta_label', String($event))" />
    </template>
  </div>
</template>
