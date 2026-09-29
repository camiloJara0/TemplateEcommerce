<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Product } from '~/types/catalog'
import type { BrandPayload, ProductPayload, TagPayload } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()
const tagStore = useTagStore()

const { adminList, adminPagination, adminFilters, loadingList } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { items: brands } = storeToRefs(brandStore)
const { adminItems: adminBrands, adminLoading: adminBrandsLoading } = storeToRefs(brandStore)
const { adminItems: adminTags, adminLoading: adminTagsLoading } = storeToRefs(tagStore)

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
const showPreview = ref(false)

const showBrandModal = ref(false)
const editingBrandId = ref<number | null>(null)
const editingBrand = ref<Partial<BrandPayload> | null>(null)

const showTagModal = ref(false)
const editingTagId = ref<number | null>(null)
const editingTag = ref<Partial<TagPayload> | null>(null)

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
  showPreview.value = false
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
    category_id: product.category?.id ?? undefined,
    brand_id: product.brand?.id ?? undefined,
    estado: product.estado,
    is_featured: product.is_featured ?? false,
    images: product.images?.map(img => img.url) ?? [],
    tags: product.tags?.map(tag => tag.id) ?? [],
    variants: product.variants?.map(variant => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      price_discount: variant.price_discount ?? null,
      stock: variant.stock,
      image: variant.image ?? null,
      attribute_values: (variant.attribute_values ?? [])
        .map(av => av.id)
        .filter((id): id is number => typeof id === 'number')
    })) ?? [],
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

function changeModal(show: unknown) {
  showPreview.value = show === true
}

function openBrandCreate() {
  editingBrandId.value = null
  editingBrand.value = null
  showBrandModal.value = true
}

watch(showBrandModal, (open) => {
  if (open) void brandStore.loadAdminList()
})

function openBrandEdit(brand: { id: number, name: string, description?: string | null, image?: string | null, is_active?: boolean }) {
  editingBrandId.value = brand.id
  editingBrand.value = {
    name: brand.name,
    description: brand.description ?? undefined,
    image: brand.image ?? undefined,
    is_active: brand.is_active ?? true
  }
  showBrandModal.value = true
}

async function brandAction(payload: BrandPayload) {
  if (editingBrandId.value) {
    return brandStore.adminUpdate(editingBrandId.value, payload)
  }
  return brandStore.adminCreate(payload)
}

function closeBrandModal() {
  showBrandModal.value = false
  editingBrandId.value = null
  editingBrand.value = null
}

async function removeBrand(brand: { id: number, name: string, products_count?: number }) {
  if (brand.products_count) {
    alert(`No puedes eliminar "${brand.name}": tiene ${brand.products_count} producto(s) asociado(s).`)
    return
  }
  if (!confirm(`¿Eliminar la marca "${brand.name}"?`)) return
  await brandStore.adminDelete(brand.id)
}

function openTagCreate() {
  editingTagId.value = null
  editingTag.value = null
  showTagModal.value = true
}

watch(showTagModal, (open) => {
  if (open) void tagStore.loadAdminList()
})

function openTagEdit(tag: { id: number, name: string, slug?: string }) {
  editingTagId.value = tag.id
  editingTag.value = { name: tag.name, slug: tag.slug }
  showTagModal.value = true
}

async function tagAction(payload: TagPayload) {
  if (editingTagId.value) {
    return tagStore.adminUpdate(editingTagId.value, payload)
  }
  return tagStore.adminCreate(payload)
}

function closeTagModal() {
  showTagModal.value = false
  editingTagId.value = null
  editingTag.value = null
}

async function removeTag(tag: { id: number, name: string, products_count?: number }) {
  if (tag.products_count) {
    alert(`No puedes eliminar "${tag.name}": tiene ${tag.products_count} producto(s) asociado(s).`)
    return
  }
  if (!confirm(`¿Eliminar la etiqueta "${tag.name}"?`)) return
  await tagStore.adminDelete(tag.id)
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
      <div class="flex items-center gap-2 flex-wrap">
        <UModal v-model:open="showBrandModal" :ui="{ content: 'glass-panel rounded-lg overflow-hidden max-w-2xl' }">
          <UButton label="Marcas" icon="i-lucide-building-2" color="neutral" variant="subtle" size="sm" class="rounded-xl" />
          <template #header>
            <div class="w-full flex justify-between items-center">
              <h3 class="text-base font-semibold">
                Marcas
              </h3>
              <div class="flex items-center gap-2">
                <UButton label="Nueva" icon="i-lucide-plus" size="xs" color="primary" @click="openBrandCreate" />
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="closeBrandModal" />
              </div>
            </div>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <FormsBrandForm
                :key="editingBrandId ?? 'new-brand'"
                :initial="editingBrand ?? undefined"
                :action="brandAction"
                :submit-label="editingBrandId ? 'Actualizar marca' : 'Crear marca'"
                @success="closeBrandModal"
              />
              <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  {{ adminBrands.length }} marcas
                </p>
                <div class="max-h-64 overflow-y-auto space-y-1">
                  <USkeleton v-if="adminBrandsLoading" class="h-10" />
                  <div
                    v-for="brand in adminBrands" :key="brand.id"
                    class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{ brand.name }}
                      </p>
                      <p class="text-xs text-slate-400">
                        {{ brand.products_count ?? 0 }} producto(s)
                      </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <UBadge
                        :label="brand.is_active ? 'Activa' : 'Inactiva'"
                        :color="brand.is_active ? 'success' : 'neutral'"
                        variant="subtle"
                        size="xs"
                      />
                      <UButton icon="i-lucide-pen" color="neutral" variant="ghost" size="xs" aria-label="Editar marca" @click="openBrandEdit(brand)" />
                      <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" aria-label="Eliminar marca" @click="removeBrand(brand)" />
                    </div>
                  </div>
                  <p v-if="!adminBrandsLoading && !adminBrands.length" class="text-sm text-slate-400 px-3 py-2">
                    Aún no hay marcas.
                  </p>
                </div>
              </div>
            </div>
          </template>
        </UModal>

        <UModal v-model:open="showTagModal" :ui="{ content: 'glass-panel rounded-lg overflow-hidden max-w-2xl' }">
          <UButton label="Etiquetas" icon="i-lucide-tags" color="neutral" variant="subtle" size="sm" class="rounded-xl" />
          <template #header>
            <div class="w-full flex justify-between items-center">
              <h3 class="text-base font-semibold">
                Etiquetas
              </h3>
              <div class="flex items-center gap-2">
                <UButton label="Nueva" icon="i-lucide-plus" size="xs" color="primary" @click="openTagCreate" />
                <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="closeTagModal" />
              </div>
            </div>
          </template>
          <template #body>
            <div class="p-4 space-y-4">
              <FormsTagForm
                :key="editingTagId ?? 'new-tag'"
                :initial="editingTag ?? undefined"
                :action="tagAction"
                :submit-label="editingTagId ? 'Actualizar etiqueta' : 'Crear etiqueta'"
                @success="closeTagModal"
              />
              <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  {{ adminTags.length }} etiquetas
                </p>
                <div class="max-h-64 overflow-y-auto space-y-1">
                  <USkeleton v-if="adminTagsLoading" class="h-10" />
                  <div
                    v-for="tag in adminTags" :key="tag.id"
                    class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{ tag.name }}
                      </p>
                      <p class="text-xs text-slate-400">
                        {{ tag.products_count ?? 0 }} producto(s)
                      </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <UButton icon="i-lucide-pen" color="neutral" variant="ghost" size="xs" aria-label="Editar etiqueta" @click="openTagEdit(tag)" />
                      <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" aria-label="Eliminar etiqueta" @click="removeTag(tag)" />
                    </div>
                  </div>
                  <p v-if="!adminTagsLoading && !adminTags.length" class="text-sm text-slate-400 px-3 py-2">
                    Aún no hay etiquetas.
                  </p>
                </div>
              </div>
            </div>
          </template>
        </UModal>

        <UModal v-model:open="showFormModal" :ui="showPreview ? { content: 'glass-panel rounded-lg overflow-hidden max-w-7xl' } : { content: 'glass-panel rounded-lg overflow-hidden max-w-2xl' }">
          <UButton label="Nuevo producto" icon="i-lucide-plus" color="primary" size="sm" class="rounded-xl" @click="openCreate" />
          <template #header>
            <div class="w-full flex justify-between items-center">
              <h3 class="text-base font-semibold">
                {{ editingId ? 'Editar producto' : 'Nuevo producto' }}
              </h3>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="() => { showFormModal = false; showPreview = false }"></UButton>
            </div>
          </template>
          <template #body>
            <div class="p-4">
              <FormsProductForm :initial="editingProduct ?? undefined" :product-id="editingId ?? undefined" :category-options="categoryOptions" :brand-options="brandOptions" @success="handleSubmit" @preview="changeModal" />
            </div>
          </template>
        </UModal>
      </div>
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
    ]" :rows="adminList" :loading="loadingList" empty-title="Sin productos"
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
      <UPagination :v-model:page="adminPagination.current_page" :total="adminPagination.total" :items-per-page="adminPagination.per_page"
        @update:page="(p: number) => productStore.loadAdminList({ ...adminFilters, page: p })" />
    </div>
  </div>
</template>
