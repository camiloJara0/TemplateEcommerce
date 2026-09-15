<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Product } from '~/types/catalog'

definePageMeta({ layout: 'client' })

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()

const { items: products, loadingList, pagination } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { items: brands } = storeToRefs(brandStore)

const search = ref(String(route.query.q || ''))
const categorySlug = ref(String(route.query.categoria || ''))
const brandId = ref('')
const sort = ref('relevancia')
const priceMin = ref<number | undefined>()
const priceMax = ref<number | undefined>()
const currentPage = ref(1)
const filtersOpen = ref(false)

const PER_PAGE = 24

const sortOptions = [
  { label: 'Relevancia', value: 'relevancia' },
  { label: 'Precio: menor a mayor', value: 'precio_asc' },
  { label: 'Precio: mayor a menor', value: 'precio_desc' },
  { label: 'Más recientes', value: 'mas_recientes' }
]

const brandOptions = computed(() => [
  { label: 'Todas las marcas', value: 'a' },
  ...brands.value.map(b => ({ label: b.name, value: String(b.id) }))
])

const selectedCategory = computed(() =>
  categories.value.find(c => c.slug === categorySlug.value)
)

async function loadProducts(page = 1) {
  currentPage.value = page
  const filters: Record<string, unknown> = { page, per_page: PER_PAGE }

  if (search.value.trim()) filters.busqueda = search.value.trim()
  if (categorySlug.value) {
    const cat = categories.value.find(c => c.slug === categorySlug.value)
    if (cat) filters.categoria_id = cat.id
  }
  if (brandId.value) filters.marca_id = Number(brandId.value)
  if (priceMin.value != null) filters.precio_min = priceMin.value
  if (priceMax.value != null) filters.precio_max = priceMax.value
  if (sort.value !== 'relevancia') filters.orden = sort.value

  await productStore.loadList(filters)
}

function applyFilters() {
  filtersOpen.value = false
  loadProducts(1)
}

function clearSearch() {
  search.value = ''
  loadProducts(1)
}

function clearCategory() {
  categorySlug.value = ''
  loadProducts(1)
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadProducts(1), 400)
}

onMounted(async () => {
  await Promise.all([
    categoryStore.loadList(),
    brandStore.loadList(),
  ])
  await loadProducts(1)
})

const previewProduct = ref<Product | null>(null)
const previewOpen = ref(false)

function openPreview(product: Product) {
  previewProduct.value = product
  previewOpen.value = true
}

useSeoMeta({
  title: 'Catálogo de productos',
  description: 'Explora nuestro catálogo completo de productos.',
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-8">
      <div>
        <h1 class="page-title">Catálogo</h1>
        <p class="page-subtitle">
          {{ pagination?.total ?? products.length }} productos encontrados
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <UInput
          v-model="search"
          placeholder="Buscar productos…"
          icon="i-lucide-search"
          class="flex-1 sm:w-72"
          @update:model-value="onSearchInput"
        />
        <UButton
          icon="i-lucide-sliders-horizontal"
          color="neutral"
          variant="outline"
          class="lg:hidden rounded-xl"
          aria-label="Filtros"
          @click="filtersOpen = true"
        />
      </div>
    </div>

    <div class="flex gap-8">
      <!-- Desktop filters -->
      <aside class="hidden lg:block w-64 shrink-0 space-y-6">
        <div class="surface p-5 space-y-5 sticky top-24">
          <div>
            <p class="text-sm font-semibold mb-3">Categorías</p>
            <ul class="space-y-1">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="!categorySlug ? 'bg-theme-imagenes text-theme-brand font-medium' : 'text-theme-secondary hover:bg-theme-imagenes'"
                  @click="categorySlug = ''; applyFilters()"
                >
                  Todas
                </button>
              </li>
              <li v-for="cat in categories" :key="cat.id">
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="categorySlug === cat.slug ? 'bg-theme-imagenes text-theme-brand font-medium' : 'text-theme-secondary hover:bg-theme-imagenes'"
                  @click="categorySlug = cat.slug || ''; applyFilters()"
                >
                  {{ cat.name }}
                </button>
              </li>
            </ul>
          </div>

          <USeparator />

          <UiBaseSelect
            v-model="brandId"
            label="Marca"
            :items="brandOptions"
            @update:model-value="applyFilters()"
          />

          <div class="space-y-3">
            <p class="text-sm font-semibold">Precio</p>
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model.number="priceMin" type="number" placeholder="Mín" size="sm" />
              <UInput v-model.number="priceMax" type="number" placeholder="Máx" size="sm" />
            </div>
            <UButton label="Aplicar" size="xs" color="primary" variant="outline" block @click="applyFilters" />
          </div>
        </div>
      </aside>

      <!-- Results -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="selectedCategory"
              :label="selectedCategory.name"
              color="primary" variant="subtle" class="cursor-pointer"
              @click="clearCategory"
            />
            <UBadge
              v-if="search"
              :label="'&quot;' + search + '&quot;'"
              color="neutral" variant="subtle" class="cursor-pointer"
              @click="clearSearch"
            />
          </div>
          <USelect
            v-model="sort"
            :items="sortOptions"
            size="sm" class="w-48"
            @update:model-value="loadProducts(1)"
          />
        </div>

        <EcommerceProductGrid
          :products="products"
          :loading="loadingList"
          @quickview="openPreview"
        />

        <div v-if="!loadingList && products.length === 0" class="text-center py-16">
          <UIcon name="i-lucide-package-search" class="size-12 text-theme-muted mx-auto mb-4" />
          <p class="text-theme-muted">No se encontraron productos con los filtros seleccionados.</p>
        </div>

        <div class="mt-8">
          <UiPaginationBar
            :current-page="currentPage"
            :last-page="pagination?.last_page ?? 1"
            :total="pagination?.total"
            @update:current-page="loadProducts"
          />
        </div>
      </div>
    </div>

    <!-- Mobile filters -->
    <USlideover v-model:open="filtersOpen">
      <template #header>
        <div class="w-full flex justify-between items-center">
          <h2 class="font-semibold">Filtros</h2>
          <UButton icon="i-lucide-x" @click="filtersOpen = false" color="neutral" variant="soft" />
        </div>
      </template>
      <template #body>
        <div class="space-y-5">
          <div>
            <p class="text-sm font-semibold mb-3">Categorías</p>
            <div class="flex flex-wrap gap-2">
              <UButton size="sm" :color="!categorySlug ? 'primary' : 'neutral'" :variant="!categorySlug ? 'solid' : 'outline'" label="Todas" @click="categorySlug = ''" />
              <UButton
                v-for="cat in categories" :key="cat.id"
                size="sm"
                :color="categorySlug === cat.slug ? 'primary' : 'neutral'"
                :variant="categorySlug === cat.slug ? 'solid' : 'outline'"
                :label="cat.name"
                @click="categorySlug = cat.slug || ''"
              />
            </div>
          </div>
          <UiBaseSelect v-model="brandId" label="Marca" :items="brandOptions" />
          <div class="grid grid-cols-2 gap-2">
            <UInput v-model.number="priceMin" type="number" placeholder="Precio mín" size="sm" />
            <UInput v-model.number="priceMax" type="number" placeholder="Precio máx" size="sm" />
          </div>
        </div>
      </template>
      <template #footer>
        <UButton block color="primary" label="Aplicar filtros" @click="applyFilters" />
      </template>
    </USlideover>

    <EcommerceProductPreviewModal
      :product="previewProduct"
      :open="previewOpen"
      @update:open="previewOpen = $event"
    />
  </div>
</template>
