<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Product } from '~/types/catalog'

definePageMeta({ layout: 'client' })

const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()

const { items: products, loadingList } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { items: brands } = storeToRefs(brandStore)

const search = ref(String(route.query.q || ''))
const category = ref(String(route.query.categoria || ''))
const brand = ref('')
const sort = ref('relevancia')
const onlyAvailable = ref(false)
const priceMin = ref<number | undefined>()
const priceMax = ref<number | undefined>()

const sortOptions = [
  { label: 'Relevancia', value: 'relevancia' },
  { label: 'Precio: menor a mayor', value: 'precio_asc' },
  { label: 'Precio: mayor a menor', value: 'precio_desc' },
  { label: 'Más vendidos', value: 'mas_vendidos' }
]

const brandOptions = computed(() => [
  { label: 'Todas las marcas', value: null },
  ...brands.value.map(b => ({ label: b.name, value: String(b.id) }))
])

onMounted(async () => {
  await Promise.all([
    productStore.loadList(),
    categoryStore.loadList(),
    brandStore.loadList()
  ])
})

const filtered = computed(() => {
  let list = [...products.value]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.brand?.name?.toLowerCase().includes(q)
    )
  }

  if (category.value) {
    list = list.filter(p => p.category?.slug === category.value)
  }

  if (brand.value) {
    list = list.filter(p => String(p.brand_id) === brand.value)
  }

  if (onlyAvailable.value) {
    list = list.filter(p => p.stock > 0)
  }

  if (priceMin.value != null) {
    list = list.filter(p => (p.price_discount ?? p.price) >= priceMin.value!)
  }

  if (priceMax.value != null) {
    list = list.filter(p => (p.price_discount ?? p.price) <= priceMax.value!)
  }

  if (sort.value === 'precio_asc') {
    list.sort((a, b) => (a.price_discount ?? a.price) - (b.price_discount ?? b.price))
  } else if (sort.value === 'precio_desc') {
    list.sort((a, b) => (b.price_discount ?? b.price) - (a.price_discount ?? a.price))
  } else if (sort.value === 'mas_vendidos') {
    list.sort((a, b) => (b.rating_count ?? 0) - (a.rating_count ?? 0))
  }

  return list
})

const filtersOpen = ref(false)

const previewProduct = ref<Product | null>(null)
const previewOpen = ref(false)

function openPreview(product: Product) {
  previewProduct.value = product
  previewOpen.value = true
}

useSeoMeta({
  title: 'Catálogo de productos',
  description: 'Explora nuestro catálogo completo de productos. Encuentra lo que buscas con los mejores precios y envío rápido.',
  ogTitle: 'Catálogo de productos',
  ogDescription: 'Explora nuestro catálogo completo de productos. Encuentra lo que buscas con los mejores precios y envío rápido.',
  ogType: 'website'
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="page-header mb-8">
      <div>
        <h1 class="page-title">
          Catálogo
        </h1>
        <p class="page-subtitle">
          {{ filtered.length }} productos encontrados
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <EcommerceSearchBar
          v-model="search"
          class="flex-1 sm:w-72"
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
            <p class="text-sm font-semibold mb-3">
              Categorías
            </p>
            <ul class="space-y-1">
              <li>
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="!category ? 'bg-theme-imagenes text-theme-brand font-medium' : 'text-theme-secondary hover:bg-theme-imagenes'"
                  @click="category = ''"
                >
                  Todas
                </button>
              </li>
              <li
                v-for="cat in categories"
                :key="cat.id"
              >
                <button
                  type="button"
                  class="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                  :class="category === cat.slug ? 'bg-theme-imagenes text-theme-brand font-medium' : 'text-theme-secondary hover:bg-theme-imagenes'"
                  @click="category = cat.slug || ''"
                >
                  {{ cat.name }}
                </button>
              </li>
            </ul>
          </div>

          <USeparator />

          <UiBaseSelect
            v-model="brand"
            label="Marca"
            :items="brandOptions"
          />

          <div class="space-y-3">
            <p class="text-sm font-semibold">
              Precio
            </p>
            <div class="grid grid-cols-2 gap-2">
              <UInput
                v-model.number="priceMin"
                type="number"
                placeholder="Mín"
                size="sm"
              />
              <UInput
                v-model.number="priceMax"
                type="number"
                placeholder="Máx"
                size="sm"
              />
            </div>
          </div>

          <UCheckbox
            v-model="onlyAvailable"
            label="Solo disponibles"
          />
        </div>
      </aside>

      <!-- Results -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="category"
              :label="categories.find(c => c.slug === category)?.name"
              color="primary"
              variant="subtle"
              class="cursor-pointer"
              @click="category = ''"
            />
            <UBadge
              v-if="search"
              :label="`“${search}”`"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              @click="search = ''"
            />
          </div>
          <USelect
            v-model="sort"
            :items="sortOptions"
            value-key="value"
            label-key="label"
            size="sm"
            class="w-48"
          />
        </div>

        <EcommerceProductGrid
          :products="filtered"
          @quickview="openPreview"
        />
      </div>
    </div>

    <!-- Mobile filters -->
    <USlideover v-model:open="filtersOpen">
      <template #header>
        <div class="w-full flex justify-between items-center">
          <h2 class="font-semibold">
            Filtros
          </h2>
          <UButton icon="i-lucide-x" @click="filtersOpen = false" color="neutral" variant="soft"></UButton>
        </div>
      </template>
      <template #body>
        <div class="space-y-5">
          <div>
            <p class="text-sm font-semibold mb-3">
              Categorías
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="sm"
                :color="!category ? 'primary' : 'neutral'"
                :variant="!category ? 'solid' : 'outline'"
                label="Todas"
                @click="category = ''"
              />
              <UButton
                v-for="cat in categories"
                :key="cat.id"
                size="sm"
                :color="category === cat.slug ? 'primary' : 'neutral'"
                :variant="category === cat.slug ? 'solid' : 'outline'"
                :label="cat.name"
                @click="category = cat.slug || ''"
              />
            </div>
          </div>
          <UiBaseSelect
            v-model="brand"
            label="Marca"
            :items="brandOptions"
          />
          <UCheckbox
            v-model="onlyAvailable"
            label="Solo disponibles"
          />
        </div>
      </template>
      <template #footer>
        <UButton
          block
          color="primary"
          label="Aplicar filtros"
          @click="filtersOpen = false"
        />
      </template>
    </USlideover>

    <!-- Product preview modal -->
    <EcommerceProductPreviewModal
      :product="previewProduct"
      :open="previewOpen"
      @update:open="previewOpen = $event"
    />
  </div>
</template>
