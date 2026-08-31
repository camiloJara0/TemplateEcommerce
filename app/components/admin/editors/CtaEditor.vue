<script setup lang="ts">
import type { CtaSection } from '~/types/store'

const props = defineProps<{ value: CtaSection }>()
const emit = defineEmits<{ update: [value: CtaSection] }>()

function update(field: keyof CtaSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as CtaSection)
}

function updateCtaPrimary(field: 'label' | 'url', val: string) {
  emit('update', { ...props.value, cta_primary: { ...props.value.cta_primary, [field]: val } } as CtaSection)
}

function updateCtaSecondary(field: 'label' | 'url', val: string) {
  if (!props.value.cta_secondary) return
  emit('update', { ...props.value, cta_secondary: { ...props.value.cta_secondary, [field]: val } } as CtaSection)
}

function toggleSecondary() {
  if (props.value.cta_secondary) {
    emit('update', { ...props.value, cta_secondary: null } as CtaSection)
  } else {
    emit('update', { ...props.value, cta_secondary: { label: 'Crear cuenta', url: '/auth/register' } } as CtaSection)
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">CTA Final</p>

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
  </div>
</template>
