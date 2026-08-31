<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Product } from '~/types/catalog'
import type { ProductPayload } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()

const { adminList, adminPagination, adminFilters, loadingList, items } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { items: brands } = storeToRefs(brandStore)

onMounted(async () => {
  await Promise.all([
    productStore.loadAdminList(),
    categoryStore.loadList(),
    brandStore.loadList()
  ])
})

const search = ref('')
const estadoFilter = ref<'all' | 'activo' | 'inactivo'>('all')
const showFormModal = ref(false)
const editingId = ref<number | null>(null)
const editingProduct = ref<Partial<ProductPayload> | null>(null)

const categoryOptions = computed(() => categories.value.map(c => ({ label: c.name, value: c.id })))
const brandOptions = computed(() => brands.value.map(b => ({ label: b.name, value: b.id })))
const estadoOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'activo' },
  { label: 'Inactivos', value: 'inactivo' }
]

const { currency, discountPercent, effectivePrice } = useFormat()

async function applyFilters() {
  await productStore.loadAdminList({
    busqueda: search.value || undefined,
    estado: estadoFilter.value === 'all' ? undefined : estadoFilter.value
  })
}

async function openCreate() {
  editingId.value = null
  editingProduct.value = null
  showFormModal.value = true
}

async function openEdit(product: Product) {
  editingId.value = product.id
  editingProduct.value = {
    name: product.name,
    sku: product.sku,
    price: product.price,
    price_discount: product.price_discount ?? undefined,
    stock: product.stock,
    description: product.description ?? undefined,
    category_id: product.category_id ?? undefined,
    brand_id: product.brand_id ?? undefined,
    estado: product.estado,
    is_featured: product.is_featured ?? false,
    images: product.images?.map(img => img.url) ?? [],
    page_config: product.page_config ?? undefined
  }
  showFormModal.value = true
}

async function handleSubmit() {
  showFormModal.value = false
  editingId.value = null
  editingProduct.value = null
  await productStore.loadAdminList(adminFilters.value)
}

async function remove(product: NonNullable<typeof adminList.value>[number]) {
  if (!confirm(`¿Eliminar "${product.name}"?`)) return
  await productStore.adminDelete(product.id)
}

useSeoMeta({ title: 'Productos — Admin' })
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Productos
        </h1>
        <p class="page-subtitle">
          {{ adminPagination?.total ?? 0 }} productos en total
        </p>
      </div>
      <UModal v-model:open="showFormModal" :ui="{ content: 'glass-panel rounded-lg overflow-hidden max-w-2xl' }">
        <UButton label="Nuevo producto" icon="i-lucide-plus" color="primary" size="sm" class="rounded-xl"
          @click="openCreate" />
        <template #header>
          <h3 class="text-base font-semibold">
            {{ editingId ? 'Editar producto' : 'Nuevo producto' }}
          </h3>
        </template>
        <template #body>
          <div class="p-4">
            <FormsProductForm :initial="editingProduct ?? undefined" :product-id="editingId ?? undefined" :category-options="categoryOptions"
              :brand-options="brandOptions" @success="handleSubmit" />
          </div>
        </template>
      </UModal>
    </div>

    <!-- Filtros -->
    <div class="surface p-4 flex flex-wrap gap-3">
      <UInput v-model="search" placeholder="Buscar por nombre o SKU…" icon="i-lucide-search" class="flex-1 min-w-50"
        @keyup.enter="applyFilters" />
      <USelect v-model="estadoFilter" :items="estadoOptions" value-key="value" label-key="label" class="w-44"
        @update:model-value="applyFilters" />
      <UButton label="Filtrar" icon="i-lucide-filter" color="neutral" variant="subtle" @click="applyFilters" />
    </div>

    <!-- Tabla -->
    <DashboardDataTable :columns="[
      { key: 'name', label: 'Producto', class: 'min-w-[200px]' },
      { key: 'sku', label: 'SKU', class: 'tabular-nums' },
      { key: 'price', label: 'Precio' },
      { key: 'stock', label: 'Stock' },
      { key: 'estado', label: 'Estado' }
    ]" :rows="items" :loading="loadingList" empty-title="Sin productos"
      empty-description="Aún no has creado productos.">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img v-if="(row as any).images?.[0]" :src="(row as any).images[0].url" :alt="(row as any).name"
              class="size-full object-cover">
          </div>
          <div class="min-w-0">
            <p class="font-medium truncate">
              {{ (row as any).name }}
            </p>
            <p class="text-xs text-slate-400">
              {{ (row as any).category?.name ?? 'Sin categoría' }}
            </p>
          </div>
        </div>
      </template>
      <template #cell-price="{ row }">
        <div class="font-semibold tabular-nums">
          {{ currency(effectivePrice((row as any).price, (row as any).price_discount)) }}
          <span v-if="discountPercent((row as any).price, (row as any).price_discount) > 0"
            class="ml-1 text-xs text-emerald-600">
            -{{ discountPercent((row as any).price, (row as any).price_discount) }}%
          </span>
        </div>
      </template>
      <template #cell-stock="{ row }">
        <span class="tabular-nums" :class="(row as any).stock <= 5 ? 'text-rose-600 font-semibold' : ''">
          {{ (row as any).stock }}
        </span>
      </template>
      <template #cell-estado="{ row }">
        <UBadge :label="(row as any).estado" :color="(row as any).estado === 'activo' ? 'success' : 'neutral'"
          variant="subtle" size="sm" />
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

    <div v-if="adminPagination && adminPagination.last_page > 1" class="flex justify-center">
      <UPagination :model-value="adminPagination.current_page" :page-count="adminPagination.last_page"
        @update:model-value="(p: number) => productStore.loadAdminList({ ...adminFilters, page: p })" />
    </div>
  </div>
</template>
