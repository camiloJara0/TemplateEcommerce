<script setup lang="ts">
import type { BenefitsSection, BenefitItem } from '~/types/store'

const props = defineProps<{ value: BenefitsSection }>()
const emit = defineEmits<{ update: [value: BenefitsSection] }>()

function update(field: keyof BenefitsSection, val: unknown) {
  emit('update', { ...props.value, [field]: val } as BenefitsSection)
}

function updateItem(index: number, field: keyof BenefitItem, val: string) {
  const items = [...props.value.items]
  items[index] = { ...items[index], [field]: val } as BenefitItem
  emit('update', { ...props.value, items })
}

function addItem() {
  emit('update', {
    ...props.value,
    items: [...props.value.items, { icon: 'i-lucide-star', title: 'Nuevo beneficio', description: 'Descripción del beneficio.' }]
  })
}

function removeItem(index: number) {
  emit('update', { ...props.value, items: props.value.items.filter((_, i) => i !== index) })
}

const iconOptions = [
  'i-lucide-truck', 'i-lucide-shield-check', 'i-lucide-rotate-ccw', 'i-lucide-headphones',
  'i-lucide-heart', 'i-lucide-zap', 'i-lucide-leaf', 'i-lucide-award',
  'i-lucide-clock', 'i-lucide-gift', 'i-lucide-percent', 'i-lucide-shield'
]
</script>

<template>
  <div class="space-y-4">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Beneficios</p>

    <UiBaseInput :model-value="value.title" label="Título" @update:model-value="update('title', String($event))" />
    <UiBaseInput :model-value="value.subtitle" label="Subtítulo" @update:model-value="update('subtitle', String($event))" />

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Items</p>
        <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addItem" />
      </div>

      <div
        v-for="(item, i) in value.items"
        :key="i"
        class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-slate-500">Item {{ i + 1 }}</p>
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeItem(i)" />
        </div>
        <USelect
          :model-value="item.icon"
          :items="iconOptions.map(i => ({ label: i.replace('i-lucide-', ''), value: i }))"
          label="Icono"
          @update:model-value="updateItem(i, 'icon', String($event))"
        />
        <UiBaseInput :model-value="item.title" label="Título" @update:model-value="updateItem(i, 'title', String($event))" />
        <UiBaseTextarea :model-value="item.description" label="Descripción" :rows="2" @update:model-value="updateItem(i, 'description', String($event))" />
      </div>
    </div>
  </div>
</template>
