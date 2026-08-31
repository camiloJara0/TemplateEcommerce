<script setup lang="ts">
import type { TiendaConfig, FooterColumn, FooterLink } from '~/types/store'

const props = defineProps<{ value: TiendaConfig['footer'] }>()
const emit = defineEmits<{ update: [value: TiendaConfig['footer']] }>()

function updateCopyright(val: string) {
  emit('update', { ...props.value, copyright_text: val })
}

function updateColumnTitle(index: number, val: string) {
  const columns = [...props.value.columns]
  columns[index] = { ...columns[index], title: val } as FooterColumn
  emit('update', { ...props.value, columns })
}

function addColumn() {
  emit('update', {
    ...props.value,
    columns: [...props.value.columns, { title: 'Nueva sección', links: [{ label: 'Link', url: '/' }] }]
  })
}

function removeColumn(index: number) {
  emit('update', { ...props.value, columns: props.value.columns.filter((_, i) => i !== index) })
}

function addLink(colIndex: number) {
  const columns = [...props.value.columns]
  columns[colIndex] = {
    ...columns[colIndex]!,
    links: [...columns[colIndex]!.links, { label: 'Nuevo', url: '/' }]
  } as FooterColumn
  emit('update', { ...props.value, columns })
}

function updateLink(colIndex: number, linkIndex: number, field: keyof FooterLink, val: string) {
  const columns = [...props.value.columns]
  const links = [...columns[colIndex]!.links]
  links[linkIndex] = { ...links[linkIndex]!, [field]: val } as FooterLink
  columns[colIndex] = { ...columns[colIndex]!, links } as FooterColumn
  emit('update', { ...props.value, columns })
}

function removeLink(colIndex: number, linkIndex: number) {
  const columns = [...props.value.columns]
  columns[colIndex] = {
    ...columns[colIndex]!,
    links: columns[colIndex]!.links.filter((_, i) => i !== linkIndex)
  } as FooterColumn
  emit('update', { ...props.value, columns })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Copyright -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Copyright</p>
      <UiBaseInput :model-value="value.copyright_text" label="Texto de copyright" @update:model-value="updateCopyright(String($event))" />
    </div>

    <!-- Columns -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Columnas del footer</p>
        <UButton label="Agregar columna" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addColumn" />
      </div>

      <div
        v-for="(col, colIndex) in value.columns"
        :key="colIndex"
        class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-3"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-slate-500">{{ col.title || `Columna ${colIndex + 1}` }}</p>
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeColumn(colIndex)" />
        </div>

        <UiBaseInput :model-value="col.title" label="Título" @update:model-value="updateColumnTitle(colIndex, String($event))" />

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400">Links</p>
            <UButton label="Agregar" color="neutral" variant="ghost" size="xs" icon="i-lucide-plus" @click="addLink(colIndex)" />
          </div>

          <div
            v-for="(link, linkIndex) in col.links"
            :key="linkIndex"
            class="flex gap-2 items-start"
          >
            <UiBaseInput :model-value="link.label" label="" placeholder="Label" class="flex-1" @update:model-value="updateLink(colIndex, linkIndex, 'label', String($event))" />
            <UiBaseInput :model-value="link.url" label="" placeholder="URL" class="flex-1" @update:model-value="updateLink(colIndex, linkIndex, 'url', String($event))" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" class="mt-1" @click="removeLink(colIndex, linkIndex)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
