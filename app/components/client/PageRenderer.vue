<script setup lang="ts">
import type { TiendaConfig, PageSection } from '~/types/store'
import type { Product } from '~/types/catalog'

import AdminNavbarPreview from '~/components/admin/preview/AdminNavbarPreview.vue'

const props = withDefaults(defineProps<{
  config: TiendaConfig
  mode?: 'client' | 'admin-preview' | 'template-preview'
  selectedSectionId?: string | null
  scale?: number
  dark?: boolean
  products?: Product[]
}>(), {
  mode: 'client',
  scale: 0.35,
  dark: false,
  selectedSectionId: null,
})

const emit = defineEmits<{
  'update:selectedSectionId': [id: string]
  'quickview': [product: Product]
}>()

const { getComponent } = useSectionVariants()
const { getOrderedSections } = usePageSections()

const visibleSections = computed(() => getOrderedSections(props.config).filter(s => s.visible))

const isPreview = computed(() => props.mode === 'admin-preview' || props.mode === 'template-preview')
const isSelectable = computed(() => props.mode === 'admin-preview')

function selectSection(id: string) {
  if (isSelectable.value) emit('update:selectedSectionId', id)
}

function sectionClass(id: string) {
  if (!isSelectable.value) return ''
  return props.selectedSectionId === id
    ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
    : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
}

function getConfigForSection(section: PageSection): any {
  const c = props.config

  if (section.type === '_header') return c.header
  if (section.type === '_categories_home') return c.categories_home

  if (section.type in c.secciones) {
    return (c.secciones as any)[section.type]
  }

  return section.config
}

function resolveComponent(section: PageSection) {
  return getComponent(section.type, section.variant)
}
</script>

<template>
  <div :class="isPreview ? 'origin-top-left' : ''" :style="isPreview ? { transform: `scale(${scale})`, width: `${100 / scale}%` } : {}">
    <div :class="isPreview ? 'bg-white dark:bg-slate-950' : ''">
      <template v-for="section in visibleSections" :key="section.id">
        <div
          :class="['transition-all duration-200', sectionClass(section.id)]"
          :style="isSelectable ? { cursor: 'pointer' } : {}"
          @click="selectSection(section.id)"
        >
          <component
            v-if="resolveComponent(section)"
            :is="resolveComponent(section)"
            :config="getConfigForSection(section)"
            v-bind="section.type === 'featured' && products ? { products } : {}"
          />

          <AdminNavbarPreview
            v-else-if="section.type === ('_navbar' as any)"
            :config="config"
            :dark="dark"
          />
        </div>
      </template>
    </div>
  </div>
</template>
