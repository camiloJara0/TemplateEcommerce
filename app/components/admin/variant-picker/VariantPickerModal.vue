<script setup lang="ts">
import type { SectionVariantMeta } from '~/types/store'
import { getSectionPreview } from '~/lib/sectionPreviews'

const props = defineProps<{
  open: boolean
  sectionLabel: string
  variants: SectionVariantMeta[]
  currentVariant: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [variantKey: string]
}>()

const sectionType = computed(() => props.sectionLabel.toLowerCase().replace(/\s+/g, '_'))

function select(key: string) {
  emit('select', key)
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="size-9 rounded-lg bg-theme-brand/10 flex items-center justify-center">
          <UIcon name="i-lucide-palette" class="size-5 text-theme-brand" />
        </div>
        <div>
          <h3 class="font-semibold text-theme">Estilo de {{ sectionLabel }}</h3>
          <p class="text-xs text-theme-muted">Selecciona un diseño para esta sección</p>
        </div>
      </div>
    </template>

    <template #body>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
      <button
        v-for="v in variants"
        :key="v.key"
        class="group relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer"
        :class="currentVariant === v.key
          ? 'border-theme-brand bg-theme-brand/5 shadow-sm'
          : 'border-theme hover:border-theme-brand/40 hover:bg-theme-alt/50'"
        @click="select(v.key)"
      >
        <div
          v-if="getSectionPreview(sectionType, v.key)"
          class="w-full aspect-16/10 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800"
          v-html="getSectionPreview(sectionType, v.key)?.svg"
        />
        <div class="text-center">
          <p class="text-sm font-medium text-theme">{{ v.label }}</p>
          <p class="text-xs text-theme-muted mt-0.5 leading-relaxed">{{ v.description }}</p>
        </div>
        <div
          v-if="currentVariant === v.key"
          class="absolute top-2.5 right-2.5 size-5 rounded-full bg-theme-brand flex items-center justify-center"
        >
          <UIcon name="i-lucide-check" class="size-3 text-white" />
        </div>
      </button>
    </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton label="Cerrar" color="neutral" variant="ghost" @click="emit('update:open', false)" />
      </div>
    </template>
  </UModal>
</template>
