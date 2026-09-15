<script setup lang="ts">
import type { TiendaConfig, SectionKey, PageSection } from '~/types/store'
import { SECTION_META } from '~/types/store'

const config = defineModel<TiendaConfig>('config', { required: true })
const selected = defineModel<string>('selected', { required: true })
const collapsed = ref(false)
const showAddModal = ref(false)

const { getOrderedSections, addSection, removeSection, duplicateSection, toggleSectionVisibility, reorderSections } = usePageSections()

const pageSections = computed(() => getOrderedSections(config.value))

const specialTypes: SectionKey[] = ['_header', '_categories_home']

let dragIndex: number | null = null

function onDragStart(index: number) {
  dragIndex = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex === null || dragIndex === index) return
  const ids = pageSections.value.map(s => s.id)
  const moved = ids.splice(dragIndex, 1)[0]
  if (moved !== undefined) {
    ids.splice(index, 0, moved)
    config.value = reorderSections(config.value, ids)
    dragIndex = index
  }
}

function onDragEnd() {
  dragIndex = null
}

function handleAddSection(type: SectionKey, variant: string) {
  const { addSection: add } = usePageSections()
  const sections = getOrderedSections(config.value)
  const newSection: PageSection = {
    id: `${type}-${Date.now()}`,
    type,
    order: sections.length,
    visible: true,
    variant,
    config: {},
  }
  config.value = {
    ...config.value,
    page_sections: [...sections, newSection],
  }
  showAddModal.value = false
}

function handleRemoveSection(sectionId: string) {
  config.value = removeSection(config.value, sectionId)
}

function handleDuplicateSection(sectionId: string) {
  config.value = duplicateSection(config.value, sectionId)
}

function handleToggleVisibility(sectionId: string) {
  config.value = toggleSectionVisibility(config.value, sectionId)
}

function getSectionLabel(section: PageSection): string {
  return SECTION_META[section.type]?.label ?? section.type
}

function getSectionIcon(section: PageSection): string {
  return SECTION_META[section.type]?.icon ?? 'i-lucide-settings'
}

function selectItem(key: string) {
  selected.value = key
}
</script>

<template>
  <div class="select-none">
    <!-- Toggle header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      @click="collapsed = !collapsed"
    >
      <span>Secciones de página</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5 transition-transform duration-300 ease-out"
        :class="collapsed ? '-rotate-90' : 'rotate-0'"
      />
    </button>

    <!-- Collapsible content -->
    <div
      class="overflow-hidden transition-all duration-300 ease-out"
      :style="{ maxHeight: collapsed ? '0px' : '3000px', opacity: collapsed ? 0 : 1 }"
    >
      <div class="px-3 pb-3 space-y-1">
        <!-- Dynamic Section List -->
        <div
          v-for="(section, index) in pageSections"
          :key="section.id"
          draggable="true"
          class="group flex items-center gap-1.5 px-2 py-2 rounded-xl cursor-pointer transition-all duration-150"
          :class="[
            selected === section.id
              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50',
            !section.visible ? 'opacity-50' : ''
          ]"
          @click="selectItem(section.id)"
          @dragstart="onDragStart(index)"
          @dragover="onDragOver($event, index)"
          @dragend="onDragEnd"
        >
          <UIcon
            name="i-lucide-grip-vertical"
            class="size-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab shrink-0"
          />

          <UIcon
            :name="getSectionIcon(section)"
            class="size-4 shrink-0"
          />

          <span class="flex-1 text-sm font-medium truncate">
            {{ getSectionLabel(section) }}
          </span>

          <!-- Actions -->
          <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Duplicar"
              @click.stop="handleDuplicateSection(section.id)"
            >
              <UIcon name="i-lucide-copy" class="size-3 text-slate-400" />
            </button>
            <button
              class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              :title="section.visible ? 'Ocultar' : 'Mostrar'"
              @click.stop="handleToggleVisibility(section.id)"
            >
              <UIcon :name="section.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="size-3 text-slate-400" />
            </button>
            <button
              v-if="!specialTypes.includes(section.type)"
              class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Eliminar"
              @click.stop="handleRemoveSection(section.id)"
            >
              <UIcon name="i-lucide-trash-2" class="size-3 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>

        <!-- Add Section Button -->
        <button
          class="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-brand-600 hover:border-brand-400 dark:hover:text-brand-400 dark:hover:border-brand-500 transition-all text-xs font-medium mt-2"
          @click="showAddModal = true"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" />
          Agregar sección
        </button>
      </div>
    </div>

    <!-- Add Section Modal -->
    <AdminAddSectionModal
      :open="showAddModal"
      @update:open="showAddModal = $event"
      @select="handleAddSection"
    />
  </div>
</template>
