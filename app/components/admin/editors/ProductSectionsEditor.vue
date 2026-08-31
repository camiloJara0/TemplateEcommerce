<script setup lang="ts">
import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { PRODUCT_SECTION_META } from '~/types/store'

const props = defineProps<{ value: ProductoSecciones }>()
const emit = defineEmits<{ update: [value: ProductoSecciones] }>()

const activeSection = ref<ProductSectionKey>('hero')

const sectionKeys = Object.keys(PRODUCT_SECTION_META) as ProductSectionKey[]

function updateSection<K extends ProductSectionKey>(key: K, val: ProductoSecciones[K]) {
  emit('update', { ...props.value, [key]: val } as ProductoSecciones)
}

function toggleSection(key: ProductSectionKey) {
  const section = props.value[key] as Record<string, unknown>
  updateSection(key, { ...section, show: !section.show } as ProductoSecciones[ProductSectionKey])
}

function updateField(key: ProductSectionKey, field: string, val: unknown) {
  const section = props.value[key] as Record<string, unknown>
  updateSection(key, { ...section, [field]: val } as ProductoSecciones[ProductSectionKey])
}

function updateListItem(key: ProductSectionKey, listField: string, index: number, itemField: string, val: unknown) {
  const section = props.value[key] as Record<string, unknown>
  const list = [...(section[listField] as Array<Record<string, unknown>>)]
  list[index] = { ...list[index], [itemField]: val }
  updateSection(key, { ...section, [listField]: list } as ProductoSecciones[ProductSectionKey])
}

function addListItem(key: ProductSectionKey, listField: string, template: Record<string, unknown>) {
  const section = props.value[key] as Record<string, unknown>
  const list = [...(section[listField] as Array<Record<string, unknown>>), { ...template }]
  updateSection(key, { ...section, [listField]: list } as ProductoSecciones[ProductSectionKey])
}

function removeListItem(key: ProductSectionKey, listField: string, index: number) {
  const section = props.value[key] as Record<string, unknown>
  const list = (section[listField] as Array<Record<string, unknown>>).filter((_, i) => i !== index)
  updateSection(key, { ...section, [listField]: list } as ProductoSecciones[ProductSectionKey])
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Section tabs -->
    <div class="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-800">
      <button
        v-for="key in sectionKeys"
        :key="key"
        class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
        :class="activeSection === key
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
        @click="activeSection = key"
      >
        <UIcon :name="PRODUCT_SECTION_META[key].icon" class="size-3" />
        {{ PRODUCT_SECTION_META[key].label }}
      </button>
    </div>

    <!-- Section editor -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ PRODUCT_SECTION_META[activeSection].label }}
        </h3>
        <UButton
          :label="(value[activeSection] as unknown as Record<string, unknown>).show ? 'Ocultar' : 'Mostrar'"
          :color="(value[activeSection] as unknown as Record<string, unknown>).show ? 'success' : 'neutral'"
          variant="outline"
          size="xs"
          @click="toggleSection(activeSection)"
        />
      </div>

      <template v-if="(value[activeSection] as unknown as Record<string, unknown>).show">
        <!-- HERO -->
        <template v-if="activeSection === 'hero'">
          <UiBaseSelect :model-value="(value.hero as unknown as Record<string, unknown>).layout as string" label="Layout" :items="[{ label: 'Galería izquierda', value: 'gallery-left' }, { label: 'Galería derecha', value: 'gallery-right' }, { label: 'Ancho completo', value: 'full-width' }]" @update:model-value="updateField('hero', 'layout', $event)" />
          <UiBaseSelect :model-value="(value.hero as unknown as Record<string, unknown>).gallery_style as string" label="Estilo galería" :items="[{ label: 'Grid', value: 'grid' }, { label: 'Stacked', value: 'stacked' }, { label: 'Zoom', value: 'zoom' }]" @update:model-value="updateField('hero', 'gallery_style', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).show_breadcrumbs as boolean" label="Mostrar breadcrumbs" @update:model-value="updateField('hero', 'show_breadcrumbs', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).show_share as boolean" label="Mostrar compartir" @update:model-value="updateField('hero', 'show_share', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).sticky_add_to_cart as boolean" label="Carrito sticky" @update:model-value="updateField('hero', 'sticky_add_to_cart', $event)" />
        </template>

        <!-- BENEFITS -->
        <template v-if="activeSection === 'benefits'">
          <UiBaseInput :model-value="(value.benefits as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateField('benefits', 'title', String($event))" />
          <UiBaseInput :model-value="(value.benefits as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateField('benefits', 'subtitle', String($event))" />
          <UiBaseSelect :model-value="(value.benefits as unknown as Record<string, unknown>).layout as string" label="Layout" :items="[{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }]" @update:model-value="updateField('benefits', 'layout', $event)" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Items</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('benefits', 'items', { icon: 'i-lucide-check', title: 'Nuevo beneficio', description: 'Descripción' })" />
            </div>
            <div v-for="(item, i) in (value.benefits as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('benefits', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.icon as string" label="Icono" @update:model-value="updateListItem('benefits', 'items', i, 'icon', String($event))" />
              <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('benefits', 'items', i, 'title', String($event))" />
              <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('benefits', 'items', i, 'description', String($event))" />
            </div>
          </div>
        </template>

        <!-- GALLERY -->
        <template v-if="activeSection === 'gallery'">
          <UiBaseSelect :model-value="(value.gallery as unknown as Record<string, unknown>).style as string" label="Estilo" :items="[{ label: 'Grid', value: 'grid' }, { label: 'Masonry', value: 'masonry' }, { label: 'Carousel', value: 'carousel' }]" @update:model-value="updateField('gallery', 'style', $event)" />
          <UiBaseInput :model-value="String((value.gallery as unknown as Record<string, unknown>).columns)" label="Columnas" type="number" min="1" max="4" @update:model-value="updateField('gallery', 'columns', Number($event))" />
          <UCheckbox :model-value="(value.gallery as unknown as Record<string, unknown>).show_thumbnails as boolean" label="Mostrar thumbnails" @update:model-value="updateField('gallery', 'show_thumbnails', $event)" />
          <UCheckbox :model-value="(value.gallery as unknown as Record<string, unknown>).enable_zoom as boolean" label="Habilitar zoom" @update:model-value="updateField('gallery', 'enable_zoom', $event)" />
        </template>

        <!-- PROBLEM/SOLUTION -->
        <template v-if="activeSection === 'problem_solution'">
          <UiBaseInput :model-value="(value.problem_solution as unknown as Record<string, unknown>).headline as string" label="Headline problemas" @update:model-value="updateField('problem_solution', 'headline', String($event))" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-red-500">Problemas</p>
              <UButton label="Agregar" color="error" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('problem_solution', 'problems', { icon: 'i-lucide-x-circle', title: 'Problema', description: 'Descripción' })" />
            </div>
            <div v-for="(item, i) in (value.problem_solution as unknown as Record<string, unknown>).problems as Array<Record<string, unknown>>" :key="i" class="border border-red-200 dark:border-red-900 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('problem_solution', 'problems', i)" />
              </div>
              <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('problem_solution', 'problems', i, 'title', String($event))" />
              <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('problem_solution', 'problems', i, 'description', String($event))" />
            </div>
          </div>
          <UiBaseInput :model-value="(value.problem_solution as unknown as Record<string, unknown>).solution_headline as string" label="Headline solución" @update:model-value="updateField('problem_solution', 'solution_headline', String($event))" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-green-500">Soluciones</p>
              <UButton label="Agregar" color="success" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('problem_solution', 'solution_items', { icon: 'i-lucide-check-circle', title: 'Solución', description: 'Descripción' })" />
            </div>
            <div v-for="(item, i) in (value.problem_solution as unknown as Record<string, unknown>).solution_items as Array<Record<string, unknown>>" :key="i" class="border border-green-200 dark:border-green-900 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('problem_solution', 'solution_items', i)" />
              </div>
              <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('problem_solution', 'solution_items', i, 'title', String($event))" />
              <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('problem_solution', 'solution_items', i, 'description', String($event))" />
            </div>
          </div>
        </template>

        <!-- TRANSFORM -->
        <template v-if="activeSection === 'transform'">
          <UiBaseInput :model-value="(value.transform as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('transform', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.transform as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateField('transform', 'subtext', String($event))" />
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <p class="text-xs font-medium text-red-500">Antes</p>
              <div v-for="(item, i) in (value.transform as unknown as Record<string, unknown>).before as Array<Record<string, unknown>>" :key="i" class="space-y-1">
                <UiBaseInput :model-value="item.label as string" label="Label" @update:model-value="updateListItem('transform', 'before', i, 'label', String($event))" />
                <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('transform', 'before', i, 'description', String($event))" />
              </div>
              <UButton label="Agregar" color="error" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('transform', 'before', { label: 'Antes', description: 'Situación' })" />
            </div>
            <div class="space-y-2">
              <p class="text-xs font-medium text-green-500">Después</p>
              <div v-for="(item, i) in (value.transform as unknown as Record<string, unknown>).after as Array<Record<string, unknown>>" :key="i" class="space-y-1">
                <UiBaseInput :model-value="item.label as string" label="Label" @update:model-value="updateListItem('transform', 'after', i, 'label', String($event))" />
                <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('transform', 'after', i, 'description', String($event))" />
              </div>
              <UButton label="Agregar" color="success" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('transform', 'after', { label: 'Después', description: 'Situación' })" />
            </div>
          </div>
        </template>

        <!-- FEATURES -->
        <template v-if="activeSection === 'features'">
          <UiBaseInput :model-value="(value.features as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateField('features', 'title', String($event))" />
          <UiBaseInput :model-value="(value.features as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateField('features', 'subtitle', String($event))" />
          <UiBaseSelect :model-value="(value.features as unknown as Record<string, unknown>).layout as string" label="Layout" :items="[{ label: 'Lista', value: 'list' }, { label: 'Grid', value: 'grid' }, { label: 'Alternado', value: 'alternating' }]" @update:model-value="updateField('features', 'layout', $event)" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Características</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('features', 'items', { icon: 'i-lucide-star', title: 'Característica', description: 'Descripción', image: null })" />
            </div>
            <div v-for="(item, i) in (value.features as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('features', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.icon as string" label="Icono" @update:model-value="updateListItem('features', 'items', i, 'icon', String($event))" />
              <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('features', 'items', i, 'title', String($event))" />
              <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('features', 'items', i, 'description', String($event))" />
            </div>
          </div>
        </template>

        <!-- COMPARISON -->
        <template v-if="activeSection === 'comparison'">
          <UiBaseInput :model-value="(value.comparison as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('comparison', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.comparison as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateField('comparison', 'subtext', String($event))" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Columnas</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('comparison', 'columns', { label: 'Columna', is_ours: false })" />
            </div>
            <div v-for="(col, i) in (value.comparison as unknown as Record<string, unknown>).columns as Array<Record<string, unknown>>" :key="i" class="flex gap-2 items-center">
              <UiBaseInput :model-value="col.label as string" label="" placeholder="Nombre" class="flex-1" @update:model-value="updateListItem('comparison', 'columns', i, 'label', String($event))" />
              <UCheckbox :model-value="col.is_ours as boolean" label="Nuestro" @update:model-value="updateListItem('comparison', 'columns', i, 'is_ours', $event)" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('comparison', 'columns', i)" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Filas</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('comparison', 'rows', { feature: 'Característica', values: ['', ''] })" />
            </div>
            <div v-for="(row, i) in (value.comparison as unknown as Record<string, unknown>).rows as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <UiBaseInput :model-value="row.feature as string" label="" placeholder="Feature" class="flex-1" @update:model-value="updateListItem('comparison', 'rows', i, 'feature', String($event))" />
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('comparison', 'rows', i)" />
              </div>
            </div>
          </div>
        </template>

        <!-- BUNDLE -->
        <template v-if="activeSection === 'bundle'">
          <UiBaseInput :model-value="(value.bundle as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('bundle', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.bundle as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateField('bundle', 'subtext', String($event))" />
          <UiBaseInput :model-value="(value.bundle as unknown as Record<string, unknown>).discount_label as string" label="Label descuento" @update:model-value="updateField('bundle', 'discount_label', String($event))" />
          <UiBaseInput :model-value="(value.bundle as unknown as Record<string, unknown>).cta_label as string" label="CTA Label" @update:model-value="updateField('bundle', 'cta_label', String($event))" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Items del bundle</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('bundle', 'items', { product_id: null, name: 'Producto', original_price: 0, bundle_price: 0, image: null })" />
            </div>
            <div v-for="(item, i) in (value.bundle as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('bundle', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.name as string" label="Nombre" @update:model-value="updateListItem('bundle', 'items', i, 'name', String($event))" />
              <div class="grid grid-cols-2 gap-2">
                <UiBaseInput :model-value="String(item.original_price)" label="Precio original" type="number" @update:model-value="updateListItem('bundle', 'items', i, 'original_price', Number($event))" />
                <UiBaseInput :model-value="String(item.bundle_price)" label="Precio bundle" type="number" @update:model-value="updateListItem('bundle', 'items', i, 'bundle_price', Number($event))" />
              </div>
            </div>
          </div>
        </template>

        <!-- COUNTDOWN -->
        <template v-if="activeSection === 'countdown'">
          <UiBaseInput :model-value="(value.countdown as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('countdown', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.countdown as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateField('countdown', 'subtext', String($event))" />
          <UiBaseInput :model-value="(value.countdown as unknown as Record<string, unknown>).end_date as string" label="Fecha fin (YYYY-MM-DD HH:mm)" @update:model-value="updateField('countdown', 'end_date', String($event))" />
          <div class="grid grid-cols-2 gap-3">
            <UiBaseInput :model-value="(value.countdown as unknown as Record<string, unknown>).bg_color as string" label="Color fondo" type="color" @update:model-value="updateField('countdown', 'bg_color', String($event))" />
            <UiBaseInput :model-value="(value.countdown as unknown as Record<string, unknown>).text_color as string" label="Color texto" type="color" @update:model-value="updateField('countdown', 'text_color', String($event))" />
          </div>
        </template>

        <!-- TESTIMONIALS -->
        <template v-if="activeSection === 'testimonials'">
          <UiBaseInput :model-value="(value.testimonials as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateField('testimonials', 'title', String($event))" />
          <UiBaseInput :model-value="(value.testimonials as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateField('testimonials', 'subtitle', String($event))" />
          <UiBaseSelect :model-value="(value.testimonials as unknown as Record<string, unknown>).layout as string" label="Layout" :items="[{ label: 'Carousel', value: 'carousel' }, { label: 'Grid', value: 'grid' }, { label: 'Masonry', value: 'masonry' }]" @update:model-value="updateField('testimonials', 'layout', $event)" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Testimonios</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('testimonials', 'items', { name: 'Cliente', role: 'Comprador', avatar: null, rating: 5, text: 'Excelente producto.' })" />
            </div>
            <div v-for="(item, i) in (value.testimonials as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('testimonials', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.name as string" label="Nombre" @update:model-value="updateListItem('testimonials', 'items', i, 'name', String($event))" />
              <UiBaseInput :model-value="item.role as string" label="Rol" @update:model-value="updateListItem('testimonials', 'items', i, 'role', String($event))" />
              <UiBaseInput :model-value="item.text as string" label="Texto" @update:model-value="updateListItem('testimonials', 'items', i, 'text', String($event))" />
            </div>
          </div>
        </template>

        <!-- UGC -->
        <template v-if="activeSection === 'ugc'">
          <UiBaseInput :model-value="(value.ugc as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateField('ugc', 'title', String($event))" />
          <UiBaseInput :model-value="(value.ugc as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateField('ugc', 'subtitle', String($event))" />
          <UiBaseSelect :model-value="(value.ugc as unknown as Record<string, unknown>).layout as string" label="Layout" :items="[{ label: 'Carousel', value: 'carousel' }, { label: 'Grid', value: 'grid' }]" @update:model-value="updateField('ugc', 'layout', $event)" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Posts de clientes</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('ugc', 'items', { image: null, author: '@usuario', platform: 'Instagram', text: ' increíble producto!' })" />
            </div>
            <div v-for="(item, i) in (value.ugc as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('ugc', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.author as string" label="Autor" @update:model-value="updateListItem('ugc', 'items', i, 'author', String($event))" />
              <UiBaseInput :model-value="item.platform as string" label="Plataforma" @update:model-value="updateListItem('ugc', 'items', i, 'platform', String($event))" />
              <UiBaseInput :model-value="item.text as string" label="Texto" @update:model-value="updateListItem('ugc', 'items', i, 'text', String($event))" />
            </div>
          </div>
        </template>

        <!-- WARRANTY -->
        <template v-if="activeSection === 'warranty'">
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('warranty', 'headline', String($event))" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Garantías</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('warranty', 'items', { icon: 'i-lucide-shield-check', title: 'Garantía', description: 'Descripción' })" />
            </div>
            <div v-for="(item, i) in (value.warranty as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('warranty', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.icon as string" label="Icono" @update:model-value="updateListItem('warranty', 'items', i, 'icon', String($event))" />
              <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('warranty', 'items', i, 'title', String($event))" />
              <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('warranty', 'items', i, 'description', String($event))" />
            </div>
          </div>
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).cta_label as string" label="CTA Label" @update:model-value="updateField('warranty', 'cta_label', String($event))" />
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).cta_url as string" label="CTA URL" @update:model-value="updateField('warranty', 'cta_url', String($event))" />
        </template>

        <!-- FAQ -->
        <template v-if="activeSection === 'faq'">
          <UiBaseInput :model-value="(value.faq as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateField('faq', 'title', String($event))" />
          <UiBaseInput :model-value="(value.faq as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateField('faq', 'subtitle', String($event))" />
          <UiBaseSelect :model-value="(value.faq as unknown as Record<string, unknown>).style as string" label="Estilo" :items="[{ label: 'Accordion', value: 'accordion' }, { label: 'Tabs', value: 'tabs' }, { label: 'Simple', value: 'simple' }]" @update:model-value="updateField('faq', 'style', $event)" />
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Preguntas</p>
              <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('faq', 'items', { question: '¿Pregunta?', answer: 'Respuesta.' })" />
            </div>
            <div v-for="(item, i) in (value.faq as unknown as Record<string, unknown>).items as Array<Record<string, unknown>>" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('faq', 'items', i)" />
              </div>
              <UiBaseInput :model-value="item.question as string" label="Pregunta" @update:model-value="updateListItem('faq', 'items', i, 'question', String($event))" />
              <UiBaseTextarea :model-value="item.answer as string" label="Respuesta" :rows="2" @update:model-value="updateListItem('faq', 'items', i, 'answer', String($event))" />
            </div>
          </div>
        </template>

        <!-- CTA -->
        <template v-if="activeSection === 'cta'">
          <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateField('cta', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateField('cta', 'subtext', String($event))" />
          <div class="space-y-2">
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400">CTA Principal</p>
            <UiBaseInput :model-value="((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>).label as string" label="Label" @update:model-value="updateField('cta', 'cta_primary', { ...((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>), label: String($event) })" />
            <UiBaseInput :model-value="((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>).url as string" label="URL" @update:model-value="updateField('cta', 'cta_primary', { ...((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>), url: String($event) })" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).bg_color as string" label="Color fondo" type="color" @update:model-value="updateField('cta', 'bg_color', String($event))" />
            <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).text_color as string" label="Color texto" type="color" @update:model-value="updateField('cta', 'text_color', String($event))" />
          </div>
        </template>
      </template>

      <div v-else class="text-center py-8 text-sm text-slate-400">
        Esta sección está oculta. Haz clic en "Mostrar" para activarla.
      </div>
    </div>
  </div>
</template>
