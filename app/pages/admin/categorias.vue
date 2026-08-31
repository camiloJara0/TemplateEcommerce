<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const categoryStore = useCategoryStore()
const { items, loading } = storeToRefs(categoryStore)

const showModal = ref(false)
const editingId = ref<number | null>(null)
const editingCategory = ref<{ name?: string, description?: string, is_active?: boolean, sort_order?: number, parent_id?: number } | null>(null)

const parentOptions = computed(() => items.value.map(c => ({ label: c.name, value: c.id })))

async function openCreate() {
  editingId.value = null
  editingCategory.value = null
  showModal.value = true
}

async function openEdit(category: NonNullable<typeof items.value>[number]) {
  editingId.value = category.id
  editingCategory.value = {
    name: category.name,
    description: category.description ?? undefined,
    is_active: category.is_active ?? true,
    sort_order: category.sort_order ?? 0,
    parent_id: category.parent_id ?? undefined
  }
  showModal.value = true
}

async function handleSubmit(payload: unknown) {
  const data = payload as Parameters<typeof categoryStore.adminCreate>[0]
  if (editingId.value) {
    await categoryStore.adminUpdate(editingId.value, data)
  } else {
    await categoryStore.adminCreate(data)
  }
  showModal.value = false
}

async function remove(category: NonNullable<typeof items.value>[number]) {
  if (!confirm(`¿Eliminar "${category.name}"?`)) return
  await categoryStore.adminDelete(category.id)
}

onMounted(() => {
  void categoryStore.loadList()
})

useSeoMeta({ title: 'Categorías — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Categorías
        </h1>
        <p class="page-subtitle">
          {{ items.length }} categorías
        </p>
      </div>
      <UModal v-model:open="showModal" :ui="{ content: 'glass-panel rounded-lg overflow-hidden' }">
        <UButton label="Nueva categoría" icon="i-lucide-plus" color="primary" size="sm" class="rounded-xl"
          @click="openCreate" />
        <template #header>
          <h3 class="text-base font-semibold">
            {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
          </h3>
        </template>
        <template #body>
          <div class="p-4">
            <FormsCategoryForm :initial="editingCategory ?? undefined" :parent-options="parentOptions"
              @success="handleSubmit" />
          </div>
        </template>
      </UModal>
    </div>

    <DashboardDataTable :columns="[
      { key: 'name', label: 'Nombre', class: 'min-w-[200px]' },
      { key: 'sort_order', label: 'Orden', class: 'tabular-nums w-24' },
      { key: 'is_active', label: 'Estado' }
    ]" :rows="items" :loading="loading" empty-title="Sin categorías"
      empty-description="Crea categorías para organizar tu catálogo.">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <UIcon name="i-lucide-layers" class="size-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p class="font-medium">
              {{ (row as any).name }}
            </p>
            <p v-if="(row as any).description" class="text-xs text-slate-400 line-clamp-1">
              {{ (row as any).description }}
            </p>
          </div>
        </div>
      </template>
      <template #cell-is_active="{ row }">
        <UBadge :label="(row as any).is_active ? 'Activa' : 'Inactiva'"
          :color="(row as any).is_active ? 'success' : 'neutral'" variant="subtle" size="sm" />
      </template>
      <template #row-actions="{ row }">
        <div class="flex items-center gap-1">
          <UButton icon="i-lucide-pen" color="neutral" variant="ghost" size="xs" aria-label="Editar"
            @click="openEdit(row as any)" />
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" aria-label="Eliminar"
            @click="remove(row as any)" />
        </div>
      </template>
    </DashboardDataTable>
  </div>
</template>
