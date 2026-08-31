<script setup lang="ts">
import type { TiendaConfig, NavbarLink } from '~/types/store'

const props = defineProps<{ value: TiendaConfig['navbar'] }>()
const emit = defineEmits<{ update: [value: TiendaConfig['navbar']] }>()

function updateLink(index: number, field: keyof NavbarLink, val: unknown) {
  const links = [...props.value.links]
  links[index] = { ...links[index], [field]: val } as NavbarLink
  emit('update', { ...props.value, links } as TiendaConfig['navbar'])
}

function addLink() {
  emit('update', {
    ...props.value,
    links: [...props.value.links, { label: 'Nuevo', url: '/', visible: true }]
  })
}

function removeLink(index: number) {
  emit('update', { ...props.value, links: props.value.links.filter((_, i) => i !== index) })
}

function moveLink(index: number, dir: -1 | 1) {
  const newIndex = index + dir
  if (newIndex < 0 || newIndex >= props.value.links.length) return
  const links = [...props.value.links]
  ;[links[index], links[newIndex]] = [links[newIndex]!, links[index]!]
  emit('update', { ...props.value, links })
}

function updateToggle(field: 'show_search' | 'show_cart' | 'show_favorites', val: unknown) {
  emit('update', { ...props.value, [field]: val } as TiendaConfig['navbar'])
}
</script>

<template>
  <div class="space-y-6">
    <!-- Toggles -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Elementos</p>

      <UCheckbox :model-value="value.show_search" label="Mostrar búsqueda" @update:model-value="updateToggle('show_search', $event)" />
      <UCheckbox :model-value="value.show_cart" label="Mostrar carrito" @update:model-value="updateToggle('show_cart', $event)" />
      <UCheckbox :model-value="value.show_favorites" label="Mostrar favoritos" @update:model-value="updateToggle('show_favorites', $event)" />
    </div>

    <!-- Links -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Links de navegación</p>
        <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addLink" />
      </div>

      <div
        v-for="(link, i) in value.links"
        :key="i"
        class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-slate-500">{{ link.label || `Link ${i + 1}` }}</p>
          <div class="flex items-center gap-1">
            <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="xs" :disabled="i === 0" @click="moveLink(i, -1)" />
            <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="xs" :disabled="i === value.links.length - 1" @click="moveLink(i, 1)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeLink(i)" />
          </div>
        </div>
        <UiBaseInput :model-value="link.label" label="Label" @update:model-value="updateLink(i, 'label', String($event))" />
        <UiBaseInput :model-value="link.url" label="URL" @update:model-value="updateLink(i, 'url', String($event))" />
        <UCheckbox :model-value="link.visible" label="Visible" @update:model-value="updateLink(i, 'visible', $event)" />
      </div>
    </div>
  </div>
</template>
