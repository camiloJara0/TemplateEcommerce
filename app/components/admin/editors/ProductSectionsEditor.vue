<script setup lang="ts">
import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { PRODUCT_SECTION_META, PRODUCT_SECTION_VARIANTS, isGlobalSection, isIndividualSection } from '~/types/store'
import ProductVariantPickerModal from '~/components/admin/ProductVariantPickerModal.vue'
import ProductSectionPreview from '~/components/admin/ProductSectionPreview.vue'

const props = defineProps<{ value: ProductoSecciones }>()
const emit = defineEmits<{ update: [value: ProductoSecciones] }>()

const activeSection = ref<ProductSectionKey>('hero')

// ── Section ordering ────────────────────────────────────────────────────────
const sectionOrder = computed<ProductSectionKey[]>(() => {
  const keys = Object.keys(props.value) as ProductSectionKey[]
  keys.sort((a, b) => {
    const orderA = ((props.value[a] as unknown as Record<string, unknown>).order as number) ?? 0
    const orderB = ((props.value[b] as unknown as Record<string, unknown>).order as number) ?? 0
    return orderA - orderB
  })
  return keys
})

// Drag reorder (native HTML5 DnD)
let dragIndex: number | null = null

function onDragStart(index: number) {
  dragIndex = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex === null || dragIndex === index) return
  const ids = [...sectionOrder.value]
  const moved = ids.splice(dragIndex, 1)[0]!
  ids.splice(index, 0, moved)
  // Update order values
  const updated = { ...props.value }
  ids.forEach((key, i) => {
    const section = (updated as unknown as Record<string, unknown>)[key] as Record<string, unknown>
    ;(updated as unknown as Record<string, unknown>)[key] = { ...section, order: i }
  })
  emit('update', updated)
  dragIndex = index
}

function onDragEnd() {
  dragIndex = null
}

// ── Variant picker ──────────────────────────────────────────────────────────
const variantModalOpen = ref(false)

const currentSectionVariants = computed(() => {
  const key = activeSection.value
  return PRODUCT_SECTION_VARIANTS[key] ?? []
})
const hasVariantPicker = computed(() => currentSectionVariants.value.length > 0)

const currentSectionVariant = computed(() => {
  const section = (props.value[activeSection.value] as unknown as Record<string, unknown>) ?? {}
  return (section.variant as string) ?? currentSectionVariants.value[0]?.key ?? ''
})

function onVariantPicked(key: string) {
  updateSectionField(activeSection.value, 'variant', key)
}

// ── Section CRUD ────────────────────────────────────────────────────────────
function updateSection<K extends ProductSectionKey>(key: K, val: ProductoSecciones[K]) {
  emit('update', { ...props.value, [key]: val } as ProductoSecciones)
}

function updateSectionField(key: ProductSectionKey, field: string, val: unknown) {
  const section = (props.value[key] as unknown as Record<string, unknown>) ?? {}
  updateSection(key, { ...section, [field]: val } as unknown as ProductoSecciones[ProductSectionKey])
}

function toggleGlobalSection(key: ProductSectionKey) {
  const section = (props.value[key] as unknown as Record<string, unknown>) ?? {}
  updateSection(key, { ...section, show: !section.show } as unknown as ProductoSecciones[ProductSectionKey])
}

function updateListItem(key: ProductSectionKey, listField: string, index: number, itemField: string, val: unknown) {
  const section = (props.value[key] as unknown as Record<string, unknown>)
  const list = [...(section[listField] as Array<Record<string, unknown>>)]
  list[index] = { ...list[index], [itemField]: val }
  updateSection(key, { ...section, [listField]: list } as unknown as ProductoSecciones[ProductSectionKey])
}

function addListItem(key: ProductSectionKey, listField: string, template: Record<string, unknown>) {
  const section = (props.value[key] as unknown as Record<string, unknown>)
  const list = [...(section[listField] as Array<Record<string, unknown>>), { ...template }]
  updateSection(key, { ...section, [listField]: list } as unknown as ProductoSecciones[ProductSectionKey])
}

function removeListItem(key: ProductSectionKey, listField: string, index: number) {
  const section = (props.value[key] as unknown as Record<string, unknown>)
  const list = (section[listField] as Array<Record<string, unknown>>).filter((_, i) => i !== index)
  updateSection(key, { ...section, [listField]: list } as unknown as ProductoSecciones[ProductSectionKey])
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Section list with drag reorder -->
    <div class="border-b border-slate-200 dark:border-slate-800">
      <div class="px-2 pt-2 pb-1">
        <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-1">Secciones (arrastra para reordenar)</p>
      </div>
      <div class="flex flex-wrap gap-1 px-2 pb-2">
        <div
          v-for="(key, index) in sectionOrder"
          :key="key"
          draggable="true"
          class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-grab active:cursor-grabbing select-none"
          :class="[
            activeSection === key
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
          @click="activeSection = key"
          @dragstart="onDragStart(index)"
          @dragover="onDragOver($event, index)"
          @dragend="onDragEnd"
        >
          <UIcon name="i-lucide-grip-vertical" class="size-2.5 opacity-0 group-hover:opacity-100" />
          <UIcon :name="PRODUCT_SECTION_META[key].icon" class="size-3" />
          {{ PRODUCT_SECTION_META[key].label }}
          <span v-if="isIndividualSection(key)" class="text-[8px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1 rounded">Individual</span>
        </div>
      </div>
    </div>

    <!-- Variant picker trigger -->
    <div v-if="hasVariantPicker" class="px-3 pt-3">
      <button
        type="button"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all group"
        @click="variantModalOpen = true"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-palette" class="size-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" />
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">Variante de diseño</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider">
            {{ currentSectionVariants.find(v => v.key === currentSectionVariant)?.label ?? currentSectionVariant }}
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-3 text-slate-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </button>
    </div>

    <ProductVariantPickerModal
      :open="variantModalOpen"
      :section-label="PRODUCT_SECTION_META[activeSection]?.label || activeSection"
      :section-type="activeSection"
      :variants="currentSectionVariants"
      :current-variant="currentSectionVariant"
      @update:open="variantModalOpen = $event"
      @select="onVariantPicked"
    />

    <!-- Section editor -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ PRODUCT_SECTION_META[activeSection].label }}
        </h3>
        <div class="flex items-center gap-2">
          <span v-if="isIndividualSection(activeSection)" class="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
            Configuración por producto
          </span>
          <UButton
            v-if="isGlobalSection(activeSection)"
            :label="(value[activeSection] as unknown as Record<string, unknown>).show ? 'Visible' : 'Oculta'"
            :color="(value[activeSection] as unknown as Record<string, unknown>).show ? 'success' : 'neutral'"
            variant="outline"
            size="xs"
            @click="toggleGlobalSection(activeSection)"
          />
        </div>
      </div>



      <!-- GLOBAL SECTION EDITORS -->
      <template v-if="isGlobalSection(activeSection)">
        <!-- HERO -->
        <template v-if="activeSection === 'hero'">
          <UiBaseSelect :model-value="(value.hero as unknown as Record<string, unknown>).variant as string" label="Layout" :items="[{ label: 'Galería izquierda', value: 'gallery-left' }, { label: 'Galería derecha', value: 'gallery-right' }, { label: 'Ancho completo', value: 'full-width' }]" @update:model-value="updateSectionField('hero', 'variant', $event)" />
          <UiBaseSelect :model-value="(value.hero as unknown as Record<string, unknown>).gallery_style as string" label="Estilo galería" :items="[{ label: 'Grid', value: 'grid' }, { label: 'Stacked', value: 'stacked' }, { label: 'Zoom', value: 'zoom' }]" @update:model-value="updateSectionField('hero', 'gallery_style', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).show_breadcrumbs as boolean" label="Mostrar breadcrumbs" @update:model-value="updateSectionField('hero', 'show_breadcrumbs', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).show_share as boolean" label="Mostrar compartir" @update:model-value="updateSectionField('hero', 'show_share', $event)" />
          <UCheckbox :model-value="(value.hero as unknown as Record<string, unknown>).sticky_add_to_cart as boolean" label="Carrito sticky" @update:model-value="updateSectionField('hero', 'sticky_add_to_cart', $event)" />
        </template>

        <!-- BENEFITS -->
        <template v-if="activeSection === 'benefits'">
          <UiBaseInput :model-value="(value.benefits as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateSectionField('benefits', 'title', String($event))" />
          <UiBaseInput :model-value="(value.benefits as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateSectionField('benefits', 'subtitle', String($event))" />
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
          <UiBaseInput :model-value="String((value.gallery as unknown as Record<string, unknown>).columns)" label="Columnas" type="number" min="1" max="4" @update:model-value="updateSectionField('gallery', 'columns', Number($event))" />
          <UCheckbox :model-value="(value.gallery as unknown as Record<string, unknown>).show_thumbnails as boolean" label="Mostrar thumbnails" @update:model-value="updateSectionField('gallery', 'show_thumbnails', $event)" />
          <UCheckbox :model-value="(value.gallery as unknown as Record<string, unknown>).enable_zoom as boolean" label="Habilitar zoom" @update:model-value="updateSectionField('gallery', 'enable_zoom', $event)" />
        </template>

        <!-- WARRANTY -->
        <template v-if="activeSection === 'warranty'">
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateSectionField('warranty', 'headline', String($event))" />
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
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).cta_label as string" label="CTA Label" @update:model-value="updateSectionField('warranty', 'cta_label', String($event))" />
          <UiBaseInput :model-value="(value.warranty as unknown as Record<string, unknown>).cta_url as string" label="CTA URL" @update:model-value="updateSectionField('warranty', 'cta_url', String($event))" />
        </template>

        <!-- FAQ -->
        <template v-if="activeSection === 'faq'">
          <UiBaseInput :model-value="(value.faq as unknown as Record<string, unknown>).title as string" label="Título" @update:model-value="updateSectionField('faq', 'title', String($event))" />
          <UiBaseInput :model-value="(value.faq as unknown as Record<string, unknown>).subtitle as string" label="Subtítulo" @update:model-value="updateSectionField('faq', 'subtitle', String($event))" />
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
          <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).headline as string" label="Headline" @update:model-value="updateSectionField('cta', 'headline', String($event))" />
          <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).subtext as string" label="Subtext" @update:model-value="updateSectionField('cta', 'subtext', String($event))" />
          <div class="space-y-2">
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400">CTA Principal</p>
            <UiBaseInput :model-value="((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>).label as string" label="Label" @update:model-value="updateSectionField('cta', 'cta_primary', { ...((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>), label: String($event) })" />
            <UiBaseInput :model-value="((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>).url as string" label="URL" @update:model-value="updateSectionField('cta', 'cta_primary', { ...((value.cta as unknown as Record<string, unknown>).cta_primary as Record<string, unknown>), url: String($event) })" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).bg_color as string" label="Color fondo" type="color" @update:model-value="updateSectionField('cta', 'bg_color', String($event))" />
            <UiBaseInput :model-value="(value.cta as unknown as Record<string, unknown>).text_color as string" label="Color texto" type="color" @update:model-value="updateSectionField('cta', 'text_color', String($event))" />
          </div>
        </template>
      </template>

      <!-- INDIVIDUAL SECTION INFO -->
      <template v-if="isIndividualSection(activeSection)">
        <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-info" class="size-4 text-amber-600 dark:text-amber-400" />
            <p class="text-sm font-medium text-amber-700 dark:text-amber-300">Sección individual</p>
          </div>
          <p class="text-xs text-amber-600 dark:text-amber-400">
            Esta sección se configura por producto en la página de edición de cada producto.
            Se muestra solo en los productos que la tengan activada.
          </p>
          <p class="text-xs text-amber-500 dark:text-amber-500">
            Edita la variante de diseño arriba. El contenido (textos, imágenes, etc.) se configura en
            <strong>Productos → Editar → Secciones de página</strong>.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
