<script setup lang="ts">
import type { TiendaConfig, SectionKey } from '~/types/store'
import { SECTION_META } from '~/types/store'

const config = defineModel<TiendaConfig>('config', { required: true })
const selected = defineModel<SectionKey>('selected', { required: true })

const sectionOrder = ref<SectionKey[]>(Object.keys(SECTION_META) as SectionKey[])

function toggleVisibility(key: SectionKey) {
  const section = config.value.secciones[key]
  if ('show_section' in section) {
    config.value = {
      ...config.value,
      secciones: {
        ...config.value.secciones,
        [key]: { ...section, show_section: !(section as { show_section: boolean }).show_section }
      }
    }
  }
}

function moveUp(index: number) {
  if (index <= 0) return
  const arr = [...sectionOrder.value]
  const temp = arr[index - 1]
  arr[index - 1] = arr[index]!
  arr[index] = temp!
  sectionOrder.value = arr
}

function moveDown(index: number) {
  if (index >= sectionOrder.value.length - 1) return
  const arr = [...sectionOrder.value]
  const temp = arr[index + 1]
  arr[index + 1] = arr[index]!
  arr[index] = temp!
  sectionOrder.value = arr
}

function isHidden(key: SectionKey) {
  const section = config.value.secciones[key]
  if ('show_section' in section) return !(section as { show_section: boolean }).show_section
  return false
}

let dragIndex: number | null = null

function onDragStart(index: number) {
  dragIndex = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex === null || dragIndex === index) return
  const arr = [...sectionOrder.value]
  const moved = arr.splice(dragIndex, 1)[0]
  if (moved !== undefined) {
    arr.splice(index, 0, moved)
    sectionOrder.value = arr
    dragIndex = index
  }
}

function onDragEnd() {
  dragIndex = null
}

function selectItem(key: SectionKey) {
  selected.value = key
}
</script>

<template>
  <div class="p-3 space-y-1">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
      Secciones de página
    </p>

    <div
      v-for="(key, index) in sectionOrder"
      :key="key"
      draggable="true"
      class="group flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-all duration-150"
      :class="[
        selected === key
          ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900',
        isHidden(key) ? 'opacity-50' : ''
      ]"
      @click="selectItem(key)"
      @dragstart="onDragStart(index)"
      @dragover="onDragOver($event, index)"
      @dragend="onDragEnd"
    >
      <UIcon
        name="i-lucide-grip-vertical"
        class="size-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab"
      />

      <UIcon
        :name="SECTION_META[key].icon"
        class="size-4 shrink-0"
      />

      <span class="flex-1 text-sm font-medium truncate">
        {{ SECTION_META[key].label }}
      </span>

      <button
        v-if="'show_section' in config.secciones[key]"
        class="opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="toggleVisibility(key)"
      >
        <UIcon
          :name="isHidden(key) ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          class="size-3.5 text-slate-400"
        />
      </button>

      <div class="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          :disabled="index === 0"
          class="text-slate-400 hover:text-slate-600 disabled:opacity-30"
          @click.stop="moveUp(index)"
        >
          <UIcon name="i-lucide-chevron-up" class="size-3" />
        </button>
        <button
          :disabled="index === sectionOrder.length - 1"
          class="text-slate-400 hover:text-slate-600 disabled:opacity-30"
          @click.stop="moveDown(index)"
        >
          <UIcon name="i-lucide-chevron-down" class="size-3" />
        </button>
      </div>
    </div>
  </div>
</template>
