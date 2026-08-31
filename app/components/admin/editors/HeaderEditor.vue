<script setup lang="ts">
import type { HeaderSection } from '~/types/store'

const props = defineProps<{ value: HeaderSection }>()
const emit = defineEmits<{ update: [value: HeaderSection] }>()
const { upload, uploading } = useImageUpload()

function update(field: keyof HeaderSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as HeaderSection)
}

function updateCtaPrimary(field: 'label' | 'url', val: string) {
  emit('update', { ...props.value, cta_primary: { ...props.value.cta_primary, [field]: val } } as HeaderSection)
}

function updateCtaSecondary(field: 'label' | 'url', val: string) {
  if (!props.value.cta_secondary) return
  emit('update', { ...props.value, cta_secondary: { ...props.value.cta_secondary, [field]: val } } as HeaderSection)
}

function toggleSecondary() {
  if (props.value.cta_secondary) {
    emit('update', { ...props.value, cta_secondary: null } as HeaderSection)
  } else {
    emit('update', { ...props.value, cta_secondary: { label: 'Conocer más', url: '/nosotros' } } as HeaderSection)
  }
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await upload(file, 'sections/header')
  if (result) update('background_image', result.url)
  input.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Header Animado</p>

    <UCheckbox :model-value="value.show" label="Mostrar sección" @update:model-value="update('show', $event)" />

    <template v-if="value.show">
      <div class="space-y-2">
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Imagen de fondo</p>
        <div v-if="value.background_image" class="relative rounded-lg overflow-hidden h-32">
          <img :src="value.background_image" class="w-full h-full object-cover" />
          <UButton icon="i-lucide-x" color="error" size="xs" class="absolute top-2 right-2" @click="update('background_image', null)" />
        </div>
        <label class="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
          <UIcon name="i-lucide-upload" class="size-4 text-slate-400" />
          <span class="text-xs text-slate-400">{{ uploading ? 'Subiendo...' : 'Subir imagen' }}</span>
          <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
        </label>
      </div>

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
          <UButton :label="value.cta_secondary ? 'Quitar' : 'Agregar'" color="neutral" variant="ghost" size="xs" @click="toggleSecondary" />
        </div>
        <template v-if="value.cta_secondary">
          <UiBaseInput :model-value="value.cta_secondary.label" label="Label" @update:model-value="updateCtaSecondary('label', String($event))" />
          <UiBaseInput :model-value="value.cta_secondary.url" label="URL" @update:model-value="updateCtaSecondary('url', String($event))" />
        </template>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <UiBaseInput :model-value="value.overlay_color" label="Color overlay" type="color" @update:model-value="update('overlay_color', String($event))" />
        <UiBaseInput :model-value="String(value.overlay_opacity)" label="Opacidad (0-1)" type="number" step="0.1" min="0" max="1" @update:model-value="update('overlay_opacity', Number($event))" />
      </div>

      <UiBaseSelect
        :model-value="value.animation"
        label="Animación"
        :items="[
          { label: 'Fade', value: 'fade' },
          { label: 'Slide Up', value: 'slide-up' },
          { label: 'Zoom', value: 'zoom' },
        ]"
        @update:model-value="update('animation', $event)"
      />

      <UiBaseSelect
        :model-value="value.text_align"
        label="Alineación del texto"
        :items="[
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' },
        ]"
        @update:model-value="update('text_align', $event)"
      />

      <UiBaseInput :model-value="value.height" label="Altura (ej: 80vh, 500px)" @update:model-value="update('height', String($event))" />
    </template>
  </div>
</template>
