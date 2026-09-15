<script setup lang="ts">
import type { TiendaConfig, SectionKey, PageSection } from '~/types/store'
import { SECTION_META } from '~/types/store'
import VariantPickerModal from './variant-picker/VariantPickerModal.vue'

const props = defineProps<{
  config: TiendaConfig
  selected: string
}>()

const emit = defineEmits<{
  'update:section': [key: SectionKey, value: any]
  'update:header': [value: TiendaConfig['header']]
  'update:categories_home': [value: TiendaConfig['categories_home']]
  'update:pageSection': [id: string, patch: Partial<PageSection>]
}>()

const { getOrderedSections, updateSectionVariant } = usePageSections()

function update(key: SectionKey, value: any) {
  emit('update:section', key, value)
}

function nn(v: string | null | undefined): string | undefined {
  return v ?? undefined
}

const { getVariants } = useSectionVariants()

const variantPickerOpen = ref(false)

function extractType(id: string): string {
  const lastDash = id.lastIndexOf('-')
  if (lastDash > 0) return id.substring(0, lastDash)
  return id
}

const baseType = computed(() => extractType(props.selected))

const currentSectionType = computed(() => {
  if (baseType.value === '_header') return 'header'
  if (baseType.value === '_categories_home') return 'categories_home'
  return baseType.value
})

const availableVariants = computed(() => getVariants(currentSectionType.value))
const hasVariants = computed(() => availableVariants.value.length > 0)

const pageSection = computed(() => {
  return getOrderedSections(props.config).find(s => s.id === props.selected)
})

const currentVariantKey = computed(() => {
  if (props.selected === '_header') return props.config.header.variant ?? 'animation'
  if (props.selected === '_categories_home') return props.config.categories_home.variant ?? 'grid'
  return pageSection.value?.variant ?? 'classic'
})

function onVariantSelect(key: string) {
  if (props.selected === '_header') {
    emit('update:header', { ...props.config.header, variant: key as any })
  } else if (props.selected === '_categories_home') {
    emit('update:categories_home', { ...props.config.categories_home, variant: key as any })
  } else if (pageSection.value) {
    emit('update:pageSection', pageSection.value.id, { variant: key })
  }
}
</script>

<template>
  <div class="p-4">
    <!-- Variant Picker Trigger -->
    <div v-if="hasVariants" class="mb-4">
      <button
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-theme-brand hover:bg-theme-brand/5 transition-all group"
        @click="variantPickerOpen = true"
      >
        <div class="flex items-center gap-2.5">
          <UIcon name="i-lucide-palette" class="size-4 text-slate-400 group-hover:text-theme-brand transition-colors" />
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-theme-brand transition-colors">Cambiar estilo</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider">
            {{ availableVariants.find(v => v.key === currentVariantKey)?.label ?? currentVariantKey }}
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-3 text-slate-400 group-hover:text-theme-brand transition-colors" />
        </div>
      </button>
    </div>

    <VariantPickerModal
      :open="variantPickerOpen"
      :section-label="SECTION_META[baseType as SectionKey]?.label || baseType"
      :variants="availableVariants"
      :current-variant="currentVariantKey"
      @update:open="variantPickerOpen = $event"
      @select="onVariantSelect"
    />

    <!-- Special: Header editor -->
    <template v-if="baseType === '_header'">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-panel-top" class="size-4" />
        Header
      </h3>
      <AdminEditorsHeaderEditor :value="config.header" @update="(v) => emit('update:header', v)" />
    </template>

    <!-- Special: Categories home editor -->
    <template v-else-if="baseType === '_categories_home'">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-layout-grid" class="size-4" />
        Categorías Home
      </h3>
      <AdminEditorsCategoriesHomeEditor :value="config.categories_home"
        @update="(v) => emit('update:categories_home', v)" />
    </template>

    <!-- Regular sections -->
    <template v-else>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon :name="SECTION_META[baseType as SectionKey]?.icon || 'i-lucide-settings'" class="size-4" />
        {{ SECTION_META[baseType as SectionKey]?.label || baseType }}
        <span v-if="pageSection" class="text-[10px] font-normal text-slate-400 ml-auto">{{ pageSection.id }}</span>
      </h3>

      <!-- Generic field rendering for all sections -->
      <div class="space-y-4">
        <!-- Hero Section -->
        <template v-if="baseType === 'hero'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Badge</label>
            <UInput :model-value="nn(config.secciones.hero.badge)"
              @update:model-value="update('hero', { ...config.secciones.hero, badge: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.hero.headline"
              @update:model-value="update('hero', { ...config.secciones.hero, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UTextarea :model-value="config.secciones.hero.subtext"
              @update:model-value="update('hero', { ...config.secciones.hero, subtext: $event })" :rows="3" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA Principal</label>
              <UInput :model-value="config.secciones.hero.cta_primary.label"
                @update:model-value="update('hero', { ...config.secciones.hero, cta_primary: { ...config.secciones.hero.cta_primary, label: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">URL</label>
              <UInput :model-value="config.secciones.hero.cta_primary.url"
                @update:model-value="update('hero', { ...config.secciones.hero, cta_primary: { ...config.secciones.hero.cta_primary, url: $event } })" />
            </div>
          </div>
          <AdminImageUpload
            :model-value="config.secciones.hero.background_image ?? null"
            label="Imagen de fondo"
            folder="sections/hero"
            @update:model-value="update('hero', { ...config.secciones.hero, background_image: $event })"
          />
        </template>

        <!-- Newsletter Section -->
        <template v-if="baseType === 'newsletter'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.newsletter?.show"
              @update:model-value="update('newsletter', { ...config.secciones.newsletter, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.newsletter?.headline"
              @update:model-value="update('newsletter', { ...config.secciones.newsletter, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="config.secciones.newsletter?.subtext"
              @update:model-value="update('newsletter', { ...config.secciones.newsletter, subtext: $event })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Placeholder</label>
              <UInput :model-value="config.secciones.newsletter?.placeholder"
                @update:model-value="update('newsletter', { ...config.secciones.newsletter, placeholder: $event })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Botón</label>
              <UInput :model-value="config.secciones.newsletter?.button_label"
                @update:model-value="update('newsletter', { ...config.secciones.newsletter, button_label: $event })" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color fondo</label>
              <UInput type="color" :model-value="config.secciones.newsletter?.bg_color"
                @update:model-value="update('newsletter', { ...config.secciones.newsletter, bg_color: $event })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color texto</label>
              <UInput type="color" :model-value="config.secciones.newsletter?.text_color"
                @update:model-value="update('newsletter', { ...config.secciones.newsletter, text_color: $event })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
            <USelect :model-value="config.secciones.newsletter?.layout"
              :items="[{ label: 'Centrado', value: 'centered' }, { label: 'Dividido', value: 'split' }]"
              @update:model-value="update('newsletter', { ...config.secciones.newsletter, layout: $event })" />
          </div>
          <AdminImageUpload
            :model-value="config.secciones.newsletter?.image"
            label="Imagen"
            folder="sections/newsletter"
            @update:model-value="update('newsletter', { ...config.secciones.newsletter, image: $event })"
          />
        </template>

        <!-- Stats Section -->
        <template v-if="baseType === 'stats'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.stats.show"
              @update:model-value="update('stats', { ...config.secciones.stats, show: $event })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color fondo</label>
              <UInput type="color" :model-value="config.secciones.stats.bg_color"
                @update:model-value="update('stats', { ...config.secciones.stats, bg_color: $event })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color texto</label>
              <UInput type="color" :model-value="config.secciones.stats.text_color"
                @update:model-value="update('stats', { ...config.secciones.stats, text_color: $event })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
            <USelect :model-value="config.secciones.stats.layout"
              :items="[{ label: 'Grid 3', value: 'grid-3' }, { label: 'Grid 4', value: 'grid-4' }]"
              @update:model-value="update('stats', { ...config.secciones.stats, layout: $event })" />
          </div>
          <div v-for="(item, i) in config.secciones.stats.items" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Estadística {{ i + 1 }}</p>
            <div class="grid grid-cols-2 gap-2">
              <UInput :model-value="item.value" placeholder="Valor" @update:model-value="item.value = $event" />
              <UInput :model-value="item.label" placeholder="Etiqueta" @update:model-value="item.label = $event" />
            </div>
          </div>
        </template>

        <!-- Video Section -->
        <template v-if="baseType === 'video'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.video.show"
              @update:model-value="update('video', { ...config.secciones.video, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.video.headline"
              @update:model-value="update('video', { ...config.secciones.video, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="config.secciones.video.subtext"
              @update:model-value="update('video', { ...config.secciones.video, subtext: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">URL del video</label>
            <UInput :model-value="nn(config.secciones.video.video_url)"
              @update:model-value="update('video', { ...config.secciones.video, video_url: $event })"
              placeholder="YouTube o Vimeo URL" />
          </div>
          <AdminImageUpload
            :model-value="config.secciones.video.thumbnail"
            label="Thumbnail"
            folder="sections/video"
            @update:model-value="update('video', { ...config.secciones.video, thumbnail: $event })"
          />
        </template>

        <!-- Map Section -->
        <template v-if="baseType === 'map'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.map.show"
              @update:model-value="update('map', { ...config.secciones.map, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.map.headline"
              @update:model-value="update('map', { ...config.secciones.map, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
            <UInput :model-value="config.secciones.map.address"
              @update:model-value="update('map', { ...config.secciones.map, address: $event })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Latitud</label>
              <UInput type="number" :model-value="config.secciones.map.latitude"
                @update:model-value="update('map', { ...config.secciones.map, latitude: Number($event) })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Longitud</label>
              <UInput type="number" :model-value="config.secciones.map.longitude"
                @update:model-value="update('map', { ...config.secciones.map, longitude: Number($event) })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Teléfono</label>
            <UInput :model-value="nn(config.secciones.map.phone)"
              @update:model-value="update('map', { ...config.secciones.map, phone: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Horario</label>
            <UInput :model-value="nn(config.secciones.map.hours)"
              @update:model-value="update('map', { ...config.secciones.map, hours: $event })" />
          </div>
        </template>

        <!-- Rich Text Section -->
        <template v-if="baseType === 'richtext'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.richtext.show"
              @update:model-value="update('richtext', { ...config.secciones.richtext, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.richtext.headline"
              @update:model-value="update('richtext', { ...config.secciones.richtext, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Contenido (HTML)</label>
            <UTextarea :model-value="config.secciones.richtext.content"
              @update:model-value="update('richtext', { ...config.secciones.richtext, content: $event })" :rows="4" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
            <USelect :model-value="config.secciones.richtext.layout"
              :items="[{ label: 'Completo', value: 'full' }, { label: 'Imagen izquierda', value: 'split-left' }, { label: 'Imagen derecha', value: 'split-right' }]"
              @update:model-value="update('richtext', { ...config.secciones.richtext, layout: $event })" />
          </div>
          <AdminImageUpload
            :model-value="config.secciones.richtext.image"
            label="Imagen"
            folder="sections/richtext"
            @update:model-value="update('richtext', { ...config.secciones.richtext, image: $event })"
          />
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
              <UInput :model-value="nn(config.secciones.richtext.cta_label)"
                @update:model-value="update('richtext', { ...config.secciones.richtext, cta_label: $event })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA URL</label>
              <UInput :model-value="nn(config.secciones.richtext.cta_url)"
                @update:model-value="update('richtext', { ...config.secciones.richtext, cta_url: $event })" />
            </div>
          </div>
        </template>

        <!-- Brand Logos Section -->
        <template v-if="baseType === 'brand_logos'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.brand_logos.show"
              @update:model-value="update('brand_logos', { ...config.secciones.brand_logos, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="config.secciones.brand_logos.title"
              @update:model-value="update('brand_logos', { ...config.secciones.brand_logos, title: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Estilo</label>
            <USelect :model-value="config.secciones.brand_logos.style"
              :items="[{ label: 'Grayscale', value: 'grayscale' }, { label: 'Color', value: 'color' }, { label: 'Minimal', value: 'minimal' }]"
              @update:model-value="update('brand_logos', { ...config.secciones.brand_logos, style: $event })" />
          </div>
          <div v-for="(item, i) in config.secciones.brand_logos.items" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Marca {{ i + 1 }}</p>
            <UInput :model-value="item.name" placeholder="Nombre" @update:model-value="item.name = $event" />
            <AdminImageUpload
              :model-value="item.logo"
              label="Logo"
              folder="sections/brands"
              @update:model-value="item.logo = $event"
            />
          </div>
        </template>

        <!-- Gallery Feed Section -->
        <template v-if="baseType === 'gallery_feed'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.gallery_feed.show"
              @update:model-value="update('gallery_feed', { ...config.secciones.gallery_feed, show: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="config.secciones.gallery_feed.title"
              @update:model-value="update('gallery_feed', { ...config.secciones.gallery_feed, title: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
            <UInput :model-value="config.secciones.gallery_feed.subtitle"
              @update:model-value="update('gallery_feed', { ...config.secciones.gallery_feed, subtitle: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
            <USelect :model-value="config.secciones.gallery_feed.layout"
              :items="[{ label: 'Grid 2', value: 'grid-2' }, { label: 'Grid 3', value: 'grid-3' }, { label: 'Grid 4', value: 'grid-4' }, { label: 'Masonry', value: 'masonry' }]"
              @update:model-value="update('gallery_feed', { ...config.secciones.gallery_feed, layout: $event })" />
          </div>
        </template>

        <!-- Benefits -->
        <template v-if="baseType === 'benefits'">
          <div v-for="(item, i) in config.secciones.benefits.items" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Beneficio {{ i + 1 }}</p>
            <UInput :model-value="item.title" placeholder="Título" @update:model-value="item.title = $event" />
            <UInput :model-value="item.description" placeholder="Descripción"
              @update:model-value="item.description = $event" />
            <UInput :model-value="item.icon" placeholder="Icono (i-lucide-...)"
              @update:model-value="item.icon = $event" />
          </div>
        </template>

        <!-- Featured -->
        <template v-if="baseType === 'featured'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="config.secciones.featured.title"
              @update:model-value="update('featured', { ...config.secciones.featured, title: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="config.secciones.featured.subtitle"
              @update:model-value="update('featured', { ...config.secciones.featured, subtitle: $event })" />
          </div>
        </template>

        <!-- Deals -->
        <template v-if="baseType === 'deals'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="config.secciones.deals.show_section"
              @update:model-value="update('deals', { ...config.secciones.deals, show_section: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.deals.headline"
              @update:model-value="update('deals', { ...config.secciones.deals, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="config.secciones.deals.subtext"
              @update:model-value="update('deals', { ...config.secciones.deals, subtext: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Badge</label>
            <UInput :model-value="config.secciones.deals.badge"
              @update:model-value="update('deals', { ...config.secciones.deals, badge: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
            <UInput :model-value="config.secciones.deals.cta_label"
              @update:model-value="update('deals', { ...config.secciones.deals, cta_label: $event })" />
          </div>
        </template>

        <!-- Testimonials -->
        <template v-if="baseType === 'testimonials'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="config.secciones.testimonials.title"
              @update:model-value="update('testimonials', { ...config.secciones.testimonials, title: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="config.secciones.testimonials.subtitle"
              @update:model-value="update('testimonials', { ...config.secciones.testimonials, subtitle: $event })" />
          </div>
          <div v-for="(item, i) in config.secciones.testimonials.items" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Testimonio {{ i + 1 }}</p>
            <UInput :model-value="item.name" placeholder="Nombre" @update:model-value="item.name = $event" />
            <UInput :model-value="item.role" placeholder="Rol" @update:model-value="item.role = $event" />
            <UTextarea :model-value="item.text" placeholder="Testimonio" @update:model-value="item.text = $event"
              :rows="2" />
          </div>
        </template>

        <!-- CTA -->
        <template v-if="baseType === 'cta'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="config.secciones.cta.headline"
              @update:model-value="update('cta', { ...config.secciones.cta, headline: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="config.secciones.cta.subtext"
              @update:model-value="update('cta', { ...config.secciones.cta, subtext: $event })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
              <UInput :model-value="config.secciones.cta.cta_primary.label"
                @update:model-value="update('cta', { ...config.secciones.cta, cta_primary: { ...config.secciones.cta.cta_primary, label: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA URL</label>
              <UInput :model-value="config.secciones.cta.cta_primary.url"
                @update:model-value="update('cta', { ...config.secciones.cta, cta_primary: { ...config.secciones.cta.cta_primary, url: $event } })" />
            </div>
          </div>
        </template>

        <!-- Categories -->
        <template v-if="baseType === 'categories'">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="config.secciones.categories.title"
              @update:model-value="update('categories', { ...config.secciones.categories, title: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="config.secciones.categories.subtitle"
              @update:model-value="update('categories', { ...config.secciones.categories, subtitle: $event })" />
          </div>
        </template>

        <!-- Urgency Banner -->
        <template v-if="baseType === 'urgency_banner' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="pageSection.config.headline"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, headline: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="pageSection.config.subtext"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtext: $event } })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
              <UInput :model-value="pageSection.config.cta_label"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, cta_label: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA URL</label>
              <UInput :model-value="pageSection.config.cta_url"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, cta_url: $event } })" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color fondo</label>
              <UInput type="color" :model-value="pageSection.config.bg_color"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, bg_color: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Color texto</label>
              <UInput type="color" :model-value="pageSection.config.text_color"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, text_color: $event } })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Mostrar botón cerrar</label>
            <USwitch :model-value="pageSection.config.show_close"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, show_close: $event } })" />
          </div>
        </template>

        <!-- Countdown Offer -->
        <template v-if="baseType === 'countdown_offer' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="pageSection.config.headline"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, headline: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="pageSection.config.subtext"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtext: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Fecha fin oferta</label>
            <UInput type="datetime-local" :model-value="pageSection.config.offer_end_date?.slice(0, 16)"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, offer_end_date: $event } })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
              <UInput :model-value="pageSection.config.cta_label"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, cta_label: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">CTA URL</label>
              <UInput :model-value="pageSection.config.cta_url"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, cta_url: $event } })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Color fondo</label>
            <UInput type="color" :model-value="pageSection.config.bg_color"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, bg_color: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Mostrar progreso</label>
            <USwitch :model-value="pageSection.config.show_progress"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, show_progress: $event } })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Stock total</label>
              <UInput type="number" :model-value="pageSection.config.stock_total"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, stock_total: Number($event) } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Stock vendido</label>
              <UInput type="number" :model-value="pageSection.config.stock_sold"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, stock_sold: Number($event) } })" />
            </div>
          </div>
        </template>

        <!-- Stock Counter -->
        <template v-if="baseType === 'stock_counter' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
            <UInput :model-value="pageSection.config.headline"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, headline: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
            <UInput :model-value="pageSection.config.subtext"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtext: $event } })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Stock total</label>
              <UInput type="number" :model-value="pageSection.config.stock_total"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, stock_total: Number($event) } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Stock vendido</label>
              <UInput type="number" :model-value="pageSection.config.stock_sold"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, stock_sold: Number($event) } })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Umbral stock bajo</label>
            <UInput type="number" :model-value="pageSection.config.low_stock_threshold"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, low_stock_threshold: Number($event) } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Estilo</label>
            <USelect :model-value="pageSection.config.style"
              :items="[{ label: 'Barra', value: 'bar' }, { label: 'Contador', value: 'counter' }, { label: 'Puntos', value: 'dots' }]"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, style: $event } })" />
          </div>
        </template>

        <!-- Sticky Add to Cart -->
        <template v-if="baseType === 'sticky_add_to_cart' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
            <USwitch :model-value="pageSection.config.show"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, show: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Nombre producto</label>
            <UInput :model-value="pageSection.config.product_name"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, product_name: $event } })" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Precio</label>
              <UInput :model-value="pageSection.config.price"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, price: $event } })" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Precio original</label>
              <UInput :model-value="pageSection.config.original_price"
                @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, original_price: $event } })" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">CTA Label</label>
            <UInput :model-value="pageSection.config.cta_label"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, cta_label: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Mostrar badge descuento</label>
            <USwitch :model-value="pageSection.config.show_discount_badge"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, show_discount_badge: $event } })" />
          </div>
        </template>

        <!-- FAQ -->
        <template v-if="baseType === 'faq' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="pageSection.config.title"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, title: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="pageSection.config.subtitle"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtitle: $event } })" />
          </div>
          <div v-for="(item, i) in (pageSection.config.items || [])" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Pregunta {{ Number(i) + 1 }}</p>
            <UInput :model-value="item.question" placeholder="Pregunta"
              @update:model-value="item.question = $event" />
            <UTextarea :model-value="item.answer" placeholder="Respuesta" :rows="2"
              @update:model-value="item.answer = $event" />
          </div>
          <UButton label="+ Agregar pregunta" variant="ghost" size="xs" icon="i-lucide-plus"
            @click="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, items: [...(pageSection.config.items || []), { question: '', answer: '' }] } })" />
        </template>

        <!-- Timeline -->
        <template v-if="baseType === 'timeline' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="pageSection.config.title"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, title: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="pageSection.config.subtitle"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtitle: $event } })" />
          </div>
          <div v-for="(item, i) in (pageSection.config.items || [])" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Evento {{ Number(i) + 1 }}</p>
            <div class="grid grid-cols-2 gap-2">
              <UInput :model-value="item.year" placeholder="Año/Etiqueta" @update:model-value="item.year = $event" />
              <UInput :model-value="item.title" placeholder="Título" @update:model-value="item.title = $event" />
            </div>
            <UTextarea :model-value="item.description" placeholder="Descripción" :rows="2"
              @update:model-value="item.description = $event" />
            <UInput :model-value="item.icon" placeholder="Icono (i-lucide-...)"
              @update:model-value="item.icon = $event" />
          </div>
          <UButton label="+ Agregar evento" variant="ghost" size="xs" icon="i-lucide-plus"
            @click="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, items: [...(pageSection.config.items || []), { year: '', title: '', description: '', icon: '' }] } })" />
        </template>

        <!-- Blog Grid -->
        <template v-if="baseType === 'blog_grid' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="pageSection.config.title"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, title: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="pageSection.config.subtitle"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtitle: $event } })" />
          </div>
          <div v-for="(item, i) in (pageSection.config.posts || [])" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Post {{ Number(i) + 1 }}</p>
            <UInput :model-value="item.title" placeholder="Título" @update:model-value="item.title = $event" />
            <UTextarea :model-value="item.excerpt" placeholder="Extracto" :rows="2"
              @update:model-value="item.excerpt = $event" />
            <div class="grid grid-cols-2 gap-2">
              <UInput :model-value="item.author" placeholder="Autor" @update:model-value="item.author = $event" />
              <UInput :model-value="item.category" placeholder="Categoría" @update:model-value="item.category = $event" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <UInput :model-value="item.date" placeholder="Fecha" @update:model-value="item.date = $event" />
              <UInput :model-value="item.read_time" placeholder="Tiempo lectura" @update:model-value="item.read_time = $event" />
            </div>
            <UInput :model-value="item.url" placeholder="URL" @update:model-value="item.url = $event" />
            <AdminImageUpload :model-value="item.image" label="Imagen" folder="sections/blog"
              @update:model-value="item.image = $event" />
          </div>
          <UButton label="+ Agregar post" variant="ghost" size="xs" icon="i-lucide-plus"
            @click="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, posts: [...(pageSection.config.posts || []), { title: '', excerpt: '', image: null, author: '', date: '', category: '', read_time: '', url: '' }] } })" />
        </template>

        <!-- Article Featured -->
        <template v-if="baseType === 'article_featured' && pageSection">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
            <UInput :model-value="pageSection.config.title"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, title: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
            <UInput :model-value="pageSection.config.subtitle"
              @update:model-value="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, subtitle: $event } })" />
          </div>
          <div v-for="(item, i) in (pageSection.config.articles || [])" :key="i"
            class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
            <p class="text-xs font-medium text-slate-400">Artículo {{ Number(i) + 1 }}</p>
            <UInput :model-value="item.title" placeholder="Título" @update:model-value="item.title = $event" />
            <UInput :model-value="item.source" placeholder="Fuente" @update:model-value="item.source = $event" />
            <UInput :model-value="item.excerpt" placeholder="Extracto" @update:model-value="item.excerpt = $event" />
            <div class="grid grid-cols-2 gap-2">
              <UInput :model-value="item.date" placeholder="Fecha" @update:model-value="item.date = $event" />
              <UInput :model-value="item.url" placeholder="URL" @update:model-value="item.url = $event" />
            </div>
            <AdminImageUpload :model-value="item.logo" label="Logo medio" folder="sections/press"
              @update:model-value="item.logo = $event" />
          </div>
          <UButton label="+ Agregar artículo" variant="ghost" size="xs" icon="i-lucide-plus"
            @click="emit('update:pageSection', pageSection.id, { config: { ...pageSection.config, articles: [...(pageSection.config.articles || []), { title: '', source: '', logo: null, url: '', date: '', excerpt: '' }] } })" />
        </template>

        <!-- Generic fallback for new section types -->
        <template v-if="!['hero','newsletter','stats','video','map','richtext','brand_logos','gallery_feed','benefits','featured','deals','testimonials','cta','categories','urgency_banner','countdown_offer','stock_counter','sticky_add_to_cart','faq','timeline','blog_grid','article_featured'].includes(baseType)">
          <div class="text-center py-8 text-slate-400 dark:text-slate-500">
            <UIcon name="i-lucide-settings" class="size-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm font-medium">Editor no disponible</p>
            <p class="text-xs mt-1">Esta sección se edita desde su variante</p>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
