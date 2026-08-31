<script setup lang="ts">
import type { TestimonialsSection, TestimonialItem } from '~/types/store'

const props = defineProps<{ value: TestimonialsSection }>()
const emit = defineEmits<{ update: [value: TestimonialsSection] }>()

function update(field: keyof TestimonialsSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as TestimonialsSection)
}

function updateItem(index: number, field: keyof TestimonialItem, val: unknown) {
  const items = [...props.value.items]
  items[index] = { ...items[index], [field]: val } as TestimonialItem
  emit('update', { ...props.value, items } as TestimonialsSection)
}

function addItem() {
  emit('update', {
    ...props.value,
    items: [...props.value.items, { name: 'Nuevo', role: 'Cliente', avatar: null, rating: 5, text: 'Testimonial de ejemplo.' }]
  })
}

function removeItem(index: number) {
  emit('update', { ...props.value, items: props.value.items.filter((_, i) => i !== index) })
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Testimonios</p>

    <UiBaseInput :model-value="value.title" label="Título" @update:model-value="update('title', String($event))" />
    <UiBaseInput :model-value="value.subtitle" label="Subtítulo" @update:model-value="update('subtitle', String($event))" />

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Testimonios</p>
        <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addItem" />
      </div>

      <div
        v-for="(item, i) in value.items"
        :key="i"
        class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-slate-500">{{ item.name || `Testimonio ${i + 1}` }}</p>
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeItem(i)" />
        </div>
        <UiBaseInput :model-value="item.name" label="Nombre" @update:model-value="updateItem(i, 'name', String($event))" />
        <UiBaseInput :model-value="item.role" label="Rol" @update:model-value="updateItem(i, 'role', String($event))" />
        <UiBaseInput :model-value="item.avatar ?? ''" label="Avatar (URL)" @update:model-value="updateItem(i, 'avatar', String($event) || null)" />
        <USelect
          :model-value="item.rating"
          :items="[{ label: '5 estrellas', value: 5 }, { label: '4 estrellas', value: 4 }, { label: '3 estrellas', value: 3 }]"
          label="Rating"
          @update:model-value="updateItem(i, 'rating', Number($event))"
        />
        <UiBaseTextarea :model-value="item.text" label="Texto" :rows="3" @update:model-value="updateItem(i, 'text', String($event))" />
      </div>
    </div>
  </div>
</template>
