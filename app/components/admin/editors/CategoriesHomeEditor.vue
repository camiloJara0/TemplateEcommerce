<script setup lang="ts">
import type { CategoriesHomeSection, CategoryCardItem } from '~/types/store'

const props = defineProps<{ value: CategoriesHomeSection }>()
const emit = defineEmits<{ update: [value: CategoriesHomeSection] }>()

function update(field: keyof CategoriesHomeSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as CategoriesHomeSection)
}

function updateItem(index: number, field: keyof CategoryCardItem, val: unknown) {
  const items = [...props.value.items]
  items[index] = { ...items[index], [field]: val } as CategoryCardItem
  emit('update', { ...props.value, items } as CategoriesHomeSection)
}

function addItem() {
  emit('update', {
    ...props.value,
    items: [...props.value.items, { image: null, name: 'Nueva categoría', description: 'Descripción', url: '/categorias/nueva', overlay_opacity: 0.5, text_color: '#ffffff' }],
  } as CategoriesHomeSection)
}

function removeItem(index: number) {
  emit('update', { ...props.value, items: props.value.items.filter((_, i) => i !== index) } as CategoriesHomeSection)
}

function moveItem(index: number, direction: -1 | 1) {
  const items = [...props.value.items]
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= items.length) return
  ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
  emit('update', { ...props.value, items } as CategoriesHomeSection)
}

const { upload, uploading } = useImageUpload()

async function handleImageUpload(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await upload(file, `sections/categories/${index}`)
  if (result) updateItem(index, 'image', result.url)
  input.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Categorías (Apple/Nike Style)</p>

    <UCheckbox :model-value="value.show" label="Mostrar sección" @update:model-value="update('show', $event)" />

    <template v-if="value.show">
      <UiBaseInput :model-value="value.title" label="Título" @update:model-value="update('title', String($event))" />
      <UiBaseInput :model-value="value.subtitle" label="Subtítulo" @update:model-value="update('subtitle', String($event))" />

      <UiBaseSelect
        :model-value="value.layout"
        label="Layout"
        :items="[
          { label: '2 columnas', value: 'grid-2' },
          { label: '3 columnas', value: 'grid-3' },
          { label: '4 columnas', value: 'grid-4' },
        ]"
        @update:model-value="update('layout', $event)"
      />

      <UiBaseInput :model-value="value.card_height" label="Altura de tarjeta (ej: 280px)" @update:model-value="update('card_height', String($event))" />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Tarjetas de categoría</p>
          <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addItem" />
        </div>

        <div v-for="(item, i) in value.items" :key="i" class="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-500">#{{ i + 1 }}</span>
            <div class="flex gap-1">
              <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="xs" :disabled="i === 0" @click="moveItem(i, -1)" />
              <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="xs" :disabled="i === value.items.length - 1" @click="moveItem(i, 1)" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeItem(i)" />
            </div>
          </div>

          <div class="relative rounded-lg overflow-hidden h-24">
            <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <UIcon name="i-lucide-image" class="size-6 text-slate-400" />
            </div>
            <label class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <span class="text-xs text-white">{{ uploading ? 'Subiendo...' : 'Cambiar imagen' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload(i, $event)" />
            </label>
          </div>

          <UiBaseInput :model-value="item.name" label="Nombre" @update:model-value="updateItem(i, 'name', String($event))" />
          <UiBaseInput :model-value="item.description" label="Descripción" @update:model-value="updateItem(i, 'description', String($event))" />
          <UiBaseInput :model-value="item.url" label="URL" @update:model-value="updateItem(i, 'url', String($event))" />

          <div class="grid grid-cols-2 gap-3">
            <UiBaseInput :model-value="String(item.overlay_opacity)" label="Opacidad overlay" type="number" step="0.1" min="0" max="1" @update:model-value="updateItem(i, 'overlay_opacity', Number($event))" />
            <UiBaseInput :model-value="item.text_color" label="Color texto" type="color" @update:model-value="updateItem(i, 'text_color', String($event))" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
