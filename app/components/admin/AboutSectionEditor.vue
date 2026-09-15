<script setup lang="ts">
import type { NosotrosSecciones, AboutSectionKey } from '~/types/store'
import { ABOUT_SECTION_META } from '~/types/store'

const props = defineProps<{
  config: NosotrosSecciones
  selected: AboutSectionKey
}>()

const emit = defineEmits<{
  'update:section': [key: AboutSectionKey, value: any]
}>()

function update(key: AboutSectionKey, value: any) {
  emit('update:section', key, value)
}

function nn(v: string | null | undefined): string | undefined {
  return v ?? undefined
}
</script>

<template>
  <div class="p-4">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <UIcon :name="ABOUT_SECTION_META[selected]?.icon || 'i-lucide-settings'" class="size-4" />
      {{ ABOUT_SECTION_META[selected]?.label || selected }}
    </h3>

    <div class="space-y-4">
      <!-- About Hero -->
      <template v-if="selected === 'hero'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.hero.show" @update:model-value="update('hero', { ...config.hero, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
          <UInput :model-value="config.hero.headline" @update:model-value="update('hero', { ...config.hero, headline: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
          <UTextarea :model-value="config.hero.subtext" @update:model-value="update('hero', { ...config.hero, subtext: $event })" :rows="2" />
        </div>
        <AdminImageUpload
          :model-value="config.hero.background_image"
          label="Imagen de fondo"
          folder="sections/about/hero"
          @update:model-value="update('hero', { ...config.hero, background_image: $event })"
        />
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Opacidad overlay</label>
            <UInput type="number" :model-value="config.hero.overlay_opacity" @update:model-value="update('hero', { ...config.hero, overlay_opacity: Number($event) })" :step="0.1" :min="0" :max="1" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Alineación</label>
            <USelect :model-value="config.hero.text_align" :items="[{ label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' }]" @update:model-value="update('hero', { ...config.hero, text_align: $event })" />
          </div>
        </div>
      </template>

      <!-- Mission & Vision -->
      <template v-if="selected === 'mission_vision'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.mission_vision.show" @update:model-value="update('mission_vision', { ...config.mission_vision, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
          <USelect :model-value="config.mission_vision.layout" :items="[{ label: 'Lado a lado', value: 'side-by-side' }, { label: 'Apilado', value: 'stacked' }, { label: 'Alterno', value: 'alternating' }]" @update:model-value="update('mission_vision', { ...config.mission_vision, layout: $event })" />
        </div>
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
          <p class="text-xs font-medium text-slate-400">Misión</p>
          <UInput :model-value="config.mission_vision.mission_title" placeholder="Título" @update:model-value="update('mission_vision', { ...config.mission_vision, mission_title: $event })" />
          <UTextarea :model-value="config.mission_vision.mission_text" placeholder="Descripción" @update:model-value="update('mission_vision', { ...config.mission_vision, mission_text: $event })" :rows="3" />
          <AdminImageUpload
            :model-value="config.mission_vision.mission_image"
            label="Imagen misión"
            folder="sections/about/mission"
            @update:model-value="update('mission_vision', { ...config.mission_vision, mission_image: $event })"
          />
        </div>
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
          <p class="text-xs font-medium text-slate-400">Visión</p>
          <UInput :model-value="config.mission_vision.vision_title" placeholder="Título" @update:model-value="update('mission_vision', { ...config.mission_vision, vision_title: $event })" />
          <UTextarea :model-value="config.mission_vision.vision_text" placeholder="Descripción" @update:model-value="update('mission_vision', { ...config.mission_vision, vision_text: $event })" :rows="3" />
          <AdminImageUpload
            :model-value="config.mission_vision.vision_image"
            label="Imagen visión"
            folder="sections/about/vision"
            @update:model-value="update('mission_vision', { ...config.mission_vision, vision_image: $event })"
          />
        </div>
      </template>

      <!-- Values -->
      <template v-if="selected === 'values'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.values.show" @update:model-value="update('values', { ...config.values, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
          <UInput :model-value="config.values.title" @update:model-value="update('values', { ...config.values, title: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
          <UInput :model-value="config.values.subtitle" @update:model-value="update('values', { ...config.values, subtitle: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Layout</label>
          <USelect :model-value="config.values.layout" :items="[{ label: 'Grid 2', value: 'grid-2' }, { label: 'Grid 3', value: 'grid-3' }, { label: 'Grid 4', value: 'grid-4' }, { label: 'Lista', value: 'list' }]" @update:model-value="update('values', { ...config.values, layout: $event })" />
        </div>
        <div v-for="(item, i) in config.values.items" :key="i" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
          <p class="text-xs font-medium text-slate-400">Valor {{ i + 1 }}</p>
          <UInput :model-value="item.title" placeholder="Título" @update:model-value="item.title = $event" />
          <UInput :model-value="item.description" placeholder="Descripción" @update:model-value="item.description = $event" />
          <UInput :model-value="item.icon" placeholder="Icono" @update:model-value="item.icon = $event" />
        </div>
      </template>

      <!-- Team -->
      <template v-if="selected === 'team'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.team.show" @update:model-value="update('team', { ...config.team, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
          <UInput :model-value="config.team.title" @update:model-value="update('team', { ...config.team, title: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Subtítulo</label>
          <UInput :model-value="config.team.subtitle" @update:model-value="update('team', { ...config.team, subtitle: $event })" />
        </div>
        <div v-for="(member, i) in config.team.members" :key="i" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
          <p class="text-xs font-medium text-slate-400">Miembro {{ i + 1 }}</p>
          <UInput :model-value="member.name" placeholder="Nombre" @update:model-value="member.name = $event" />
          <UInput :model-value="member.role" placeholder="Rol" @update:model-value="member.role = $event" />
          <UTextarea :model-value="member.bio" placeholder="Bio" @update:model-value="member.bio = $event" :rows="2" />
          <AdminImageUpload
            :model-value="member.avatar"
            label="Avatar"
            folder="sections/about/team"
            @update:model-value="member.avatar = $event"
          />
        </div>
      </template>

      <!-- Timeline -->
      <template v-if="selected === 'timeline'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.timeline.show" @update:model-value="update('timeline', { ...config.timeline, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Título</label>
          <UInput :model-value="config.timeline.title" @update:model-value="update('timeline', { ...config.timeline, title: $event })" />
        </div>
        <div v-for="(event, i) in config.timeline.events" :key="i" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
          <p class="text-xs font-medium text-slate-400">Evento {{ i + 1 }}</p>
          <div class="grid grid-cols-2 gap-2">
            <UInput :model-value="event.year" placeholder="Año" @update:model-value="event.year = $event" />
            <UInput :model-value="event.title" placeholder="Título" @update:model-value="event.title = $event" />
          </div>
          <UTextarea :model-value="event.description" placeholder="Descripción" @update:model-value="event.description = $event" :rows="2" />
          <UInput :model-value="event.icon" placeholder="Icono" @update:model-value="event.icon = $event" />
        </div>
      </template>

      <!-- Map -->
      <template v-if="selected === 'map'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.map.show" @update:model-value="update('map', { ...config.map, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
          <UInput :model-value="config.map.headline" @update:model-value="update('map', { ...config.map, headline: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
          <UInput :model-value="config.map.address" @update:model-value="update('map', { ...config.map, address: $event })" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Teléfono</label>
            <UInput :model-value="nn(config.map.phone)" @update:model-value="update('map', { ...config.map, phone: $event })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Horario</label>
            <UInput :model-value="nn(config.map.hours)" @update:model-value="update('map', { ...config.map, hours: $event })" />
          </div>
        </div>
      </template>

      <!-- CTA -->
      <template v-if="selected === 'cta'">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Visible</label>
          <USwitch :model-value="config.cta.show" @update:model-value="update('cta', { ...config.cta, show: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Headline</label>
          <UInput :model-value="config.cta.headline" @update:model-value="update('cta', { ...config.cta, headline: $event })" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Subtext</label>
          <UInput :model-value="config.cta.subtext" @update:model-value="update('cta', { ...config.cta, subtext: $event })" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">CTA Primario</label>
            <UInput :model-value="config.cta.cta_primary.label" @update:model-value="update('cta', { ...config.cta, cta_primary: { ...config.cta.cta_primary, label: $event } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">URL</label>
            <UInput :model-value="config.cta.cta_primary.url" @update:model-value="update('cta', { ...config.cta, cta_primary: { ...config.cta.cta_primary, url: $event } })" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">CTA Secundario</label>
            <UInput :model-value="config.cta.cta_secondary?.label" @update:model-value="update('cta', { ...config.cta, cta_secondary: { label: $event, url: config.cta.cta_secondary?.url || '' } })" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">URL</label>
            <UInput :model-value="config.cta.cta_secondary?.url" @update:model-value="update('cta', { ...config.cta, cta_secondary: { label: config.cta.cta_secondary?.label || '', url: $event } })" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
