<script setup lang="ts">
import type { ProductPayload } from '~/types/admin'
import type { SelectOption } from '~/components/ui/BaseSelect.vue'
import type { ProductoSecciones, ProductSectionKey } from '~/types/store'
import { PRODUCT_SECTION_META, INDIVIDUAL_PRODUCT_SECTIONS, MOCK_PRODUCT_FOR_PREVIEW } from '~/types/store'
import ProductSectionPreview from '~/components/admin/ProductSectionPreview.vue'

interface Props {
  action?: (payload: FormData) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<ProductPayload>
  productId?: number
  categoryOptions?: SelectOption[]
  brandOptions?: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar producto',
  loading: false,
  initial: () => ({
    name: '',
    sku: '',
    price: 0,
    category_id: undefined as unknown as number,
    brand_id: undefined as unknown as number,
    description: '',
    price_discount: undefined as unknown as number,
    stock: 0,
    is_featured: false,
    estado: 'activo',
    images: [] as string[],
    tags: [] as number[]
  }),
  categoryOptions: () => [] as SelectOption[],
  brandOptions: () => [] as SelectOption[]
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
  preview: [show: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 200 },
  { key: 'sku', label: 'SKU', required: true, minLength: 1, maxLength: 80 },
  { key: 'price', label: 'Precio', required: true, min: 0 },
  { key: 'description', label: 'Descripción', maxLength: 2000 },
  { key: 'stock', label: 'Stock', min: 0 }
])

setForm({ ...props.initial })

const estadoOptions = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' }
]

// ── Images ──────────────────────────────────────────────────────────────────
const existingImages = ref<string[]>(
  (props.initial?.images ?? []).filter((image): image is string => typeof image === 'string')
)
const newImageFiles = ref<File[]>([])

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files) return
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      newImageFiles.value.push(file)
    }
  }
  input.value = ''
}

function removeExistingImage(index: number) {
  existingImages.value.splice(index, 1)
}

function removeNewImage(index: number) {
  newImageFiles.value.splice(index, 1)
}

function getNewImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// ── Page Config (individual sections only) ──────────────────────────────────
const showPageConfig = ref(false)
const pageConfig = ref<Record<string, unknown>>(props.initial?.page_config as Record<string, unknown> ?? {})
const activeSection = ref<ProductSectionKey>('problem_solution')

// Initialize individual sections with product_ids if not present
function ensureProductIds() {
  for (const key of INDIVIDUAL_PRODUCT_SECTIONS) {
    const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
    if (!section.product_ids) {
      section.product_ids = []
    }
    const pids = section.product_ids as number[]
    // If this product has the section enabled (has any config), add its ID
    if (props.productId && pids.length === 0 && Object.keys(section).length > 1) {
      pids.push(props.productId)
    }
    pageConfig.value[key] = section
  }
}
ensureProductIds()

function isSectionActive(key: ProductSectionKey): boolean {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  const pids = section.product_ids as number[] | undefined
  return !!pids && props.productId != null && pids.includes(props.productId)
}

function toggleSection(key: ProductSectionKey) {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  const pids = (section.product_ids as number[]) ?? []
  if (props.productId == null) return
  if (pids.includes(props.productId)) {
    section.product_ids = pids.filter(id => id !== props.productId)
  } else {
    section.product_ids = [...pids, props.productId]
  }
  pageConfig.value[key] = { ...section }
}

function removeSection(key: ProductSectionKey) {
  // Remove the entire section config from pageConfig
  const updated = { ...pageConfig.value }
  delete updated[key]
  pageConfig.value = updated
}

function hasSectionConfig(key: ProductSectionKey): boolean {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  return Object.keys(section).length > 0
}

function updateSectionField(key: ProductSectionKey, field: string, val: unknown) {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  pageConfig.value[key] = { ...section, [field]: val }
}

function updateListItem(key: ProductSectionKey, listField: string, index: number, itemField: string, val: unknown) {
  const section = (pageConfig.value[key] as Record<string, unknown>)
  const list = [...(section[listField] as Array<Record<string, unknown>>)]
  list[index] = { ...list[index], [itemField]: val }
  pageConfig.value[key] = { ...section, [listField]: list }
}

function addListItem(key: ProductSectionKey, listField: string, template: Record<string, unknown>) {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  console.log(section, listField)
  const list = [...((section[listField] as Array<Record<string, unknown>>) ?? []),{ ...template }]
  pageConfig.value[key] = { ...section, [listField]: list }
}

function removeListItem(key: ProductSectionKey, listField: string, index: number) {
  const section = (pageConfig.value[key] as Record<string, unknown>)
  const list = (section[listField] as Array<Record<string, unknown>>).filter((_, i) => i !== index)
  pageConfig.value[key] = { ...section, [listField]: list }
}

// ── Bundle product picker ───────────────────────────────────────────────────
const bundleProductSearch = ref('')
const bundleProducts = ref<Array<{ id: number, name: string, price: number, images: Array<{ url: string }>, slug: string }>>([])
const bundleProductsLoading = ref(false)

async function searchBundleProducts() {
  if (!bundleProductSearch.value || bundleProductSearch.value.length < 2) {
    bundleProducts.value = []
    return
  }
  bundleProductsLoading.value = true
  try {
    const { request } = useApi()
    const res = await request<{ data: Array<{ id: number, name: string, price: number, images: Array<{ url: string }>, slug: string }> }>(
      `/admin/productos?search=${encodeURIComponent(bundleProductSearch.value)}&per_page=10`
    )
    const items = (res as any).data ?? res ?? []
    bundleProducts.value = (Array.isArray(items) ? items : []).filter((p: any) => p.id !== props.productId)
  } catch {
    bundleProducts.value = []
  } finally {
    bundleProductsLoading.value = false
  }
}

function addProductToBundle(product: { id: number, name: string, price: number, images: Array<{ url: string }> }) {
  const section = (pageConfig.value.bundle as Record<string, unknown>) ?? {}
  const items = [...((section.items as Array<Record<string, unknown>>) ?? [])]
  // Avoid duplicates
  if (items.some(i => i.product_id === product.id)) return
  items.push({
    product_id: product.id,
    name: product.name,
    original_price: product.price,
    bundle_price: Math.round(product.price * 0.8),
    image: product.images?.[0]?.url ?? null,
  })
  pageConfig.value.bundle = { ...section, items }
  bundleProductSearch.value = ''
  bundleProducts.value = []
}

function removeBundleItem(index: number) {
  const section = (pageConfig.value.bundle as Record<string, unknown>) ?? {}
  const items = [...((section.items as Array<Record<string, unknown>>) ?? [])]
  items.splice(index, 1)
  pageConfig.value.bundle = { ...section, items }
}

function updateBundleItem(index: number, field: string, val: unknown) {
  const section = (pageConfig.value.bundle as Record<string, unknown>) ?? {}
  const items = [...((section.items as Array<Record<string, unknown>>) ?? [])]
  items[index] = { ...items[index], [field]: val }
  pageConfig.value.bundle = { ...section, items }
}

// ── Preview modal ───────────────────────────────────────────────────────────
const showPreview = ref(false)

// Build preview sections: merge global sections from store with per-product individual sections
const { globalSections } = useProductSections(null)
const previewSections = computed<ProductoSecciones>(() => {
  const merged = JSON.parse(JSON.stringify(globalSections.value)) as ProductoSecciones
  // Apply individual section configs from pageConfig
  for (const key of INDIVIDUAL_PRODUCT_SECTIONS) {
    const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
    if (Object.keys(section).length > 0) {
      ;(merged as unknown as Record<string, unknown>)[key] = {
        ...((merged as unknown as Record<string, unknown>)[key] as Record<string, unknown>),
        ...section,
      }
    }
  }
  return merged
})

const previewProduct = computed(() => ({
  ...MOCK_PRODUCT_FOR_PREVIEW,
  id: props.productId ?? MOCK_PRODUCT_FOR_PREVIEW.id,
  name: form.value.name || MOCK_PRODUCT_FOR_PREVIEW.name,
  price: form.value.price || MOCK_PRODUCT_FOR_PREVIEW.price,
  price_discount: form.value.price_discount || MOCK_PRODUCT_FOR_PREVIEW.price_discount,
  description: form.value.description || MOCK_PRODUCT_FOR_PREVIEW.description,
}))

// ── Submit ──────────────────────────────────────────────────────────────────
async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true

  try {
    const hasPageConfig = Object.keys(pageConfig.value).length > 0

    const formData = new FormData()
    formData.append('name', String(form.value.name ?? ''))
    formData.append('sku', String(form.value.sku ?? ''))
    formData.append('price', String(Number(form.value.price ?? 0)))

    if (form.value.category_id) formData.append('category_id', String(Number(form.value.category_id)))
    if (form.value.brand_id) formData.append('brand_id', String(Number(form.value.brand_id)))
    if (form.value.description) formData.append('description', String(form.value.description))
    if (form.value.price_discount) formData.append('price_discount', String(Number(form.value.price_discount)))
    if (form.value.stock != null) formData.append('stock', String(Number(form.value.stock)))
    formData.append('is_featured', form.value.is_featured)
    formData.append('estado', String((form.value.estado as 'activo' | 'inactivo') ?? 'activo'))

    if (form.value.tags?.length) {
      form.value.tags.forEach((tagId: number) => formData.append('tags[]', String(tagId)))
    }

    existingImages.value.forEach((url) => formData.append('existing_image_urls[]', url))
    newImageFiles.value.forEach((file) => formData.append('images[]', file))

    if (hasPageConfig) {
      formData.append('page_config_json', JSON.stringify(pageConfig.value))
    }

    if (props.productId) {
      formData.append('_method', 'PUT')
    }

    const { request } = useApi()
    const url = props.productId ? `/admin/productos/${props.productId}` : '/admin/productos'
    const result = await request(url, { method: 'POST', body: formData })
    emit('success', result)
  } catch (e) {
    emit('error', e)
  } finally {
    submitLoading.value = false
  }
}

function changePreview () {
  showPreview.value = !showPreview.value
  emit('preview', showPreview.value)
}

defineExpose({ form, visibleErrors, isValid })
</script>

<template>
  <div class="flex gap-4 h-full">
    <!-- Main form -->
    <UForm class="flex-1 space-y-4 overflow-y-auto" :state="form" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiBaseInput
          v-model="form.name"
          label="Nombre del producto"
          required
          :error="visibleErrors.name || undefined"
          @blur="touch('name')"
        />
        <UiBaseInput
          v-model="form.sku"
          label="SKU"
          required
          :error="visibleErrors.sku || undefined"
          @blur="touch('sku')"
        />
      </div>
      <UiBaseTextarea
        v-model="form.description"
        label="Descripción"
        :rows="4"
        :error="visibleErrors.description || undefined"
        @blur="touch('description')"
      />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UiBaseInput
          v-model.number="form.price"
          label="Precio"
          type="number"
          required
          :error="visibleErrors.price || undefined"
          @blur="touch('price')"
        />
        <UiBaseInput
          v-model.number="form.price_discount"
          label="Precio descuento"
          type="number"
          :error="visibleErrors.price_discount || undefined"
        />
        <UiBaseInput
          v-model.number="form.stock"
          label="Stock"
          type="number"
          :error="visibleErrors.stock || undefined"
          @blur="touch('stock')"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiBaseSelect
          v-model="form.category_id"
          label="Categoría"
          :items="categoryOptions"
          placeholder="Selecciona"
          :error="visibleErrors.category_id || undefined"
        />
        <UiBaseSelect
          v-model="form.brand_id"
          label="Marca"
          :items="brandOptions"
          placeholder="Selecciona"
          :error="visibleErrors.brand_id || undefined"
        />
      </div>
      <UiBaseSelect
        v-model="form.estado"
        label="Estado"
        :items="estadoOptions"
      />
      <UCheckbox
        v-model="form.is_featured"
        label="Producto destacado"
      />

      <!-- Image Manager -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Imágenes del producto</label>
        <div v-if="existingImages.length || newImageFiles.length" class="flex flex-wrap gap-3">
          <div v-for="(url, i) in existingImages" :key="'existing-'+i" class="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img :src="url" class="w-full h-full object-cover" :alt="`Imagen ${i + 1}`" />
            <button type="button" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" @click="removeExistingImage(i)">
              <UIcon name="i-lucide-trash-2" class="size-5 text-white" />
            </button>
          </div>
          <div v-for="(file, i) in newImageFiles" :key="'new-'+i" class="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img :src="getNewImagePreview(file)" class="w-full h-full object-cover" :alt="`Nueva imagen ${i + 1}`" />
            <span class="absolute top-1 right-1 text-[9px] bg-primary-500 text-white px-1 rounded">Nuevo</span>
            <button type="button" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" @click="removeNewImage(i)">
              <UIcon name="i-lucide-trash-2" class="size-5 text-white" />
            </button>
          </div>
        </div>
        <label class="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
          <UIcon name="i-lucide-upload" class="size-4 text-slate-400" />
          <span class="text-xs text-slate-400">Agregar imagen</span>
          <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
        </label>
      </div>

      <!-- Individual Sections -->
      <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-layout-template" class="size-5 text-primary-600" />
            <div class="text-left">
              <p class="font-medium text-slate-900 dark:text-white text-sm">Secciones de página</p>
              <p class="text-xs text-slate-500">Activa y configura secciones individuales para este producto</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
              {{ INDIVIDUAL_PRODUCT_SECTIONS.filter(k => isSectionActive(k)).length }} activas
            </span>
            <UButton label="Preview" icon="i-lucide-eye" size="xs" variant="outline" @click="changePreview" />
          </div>
        </div>

        <div  class="border-t border-slate-200 dark:border-slate-700">
          <!-- Section tabs -->
          <div class="flex flex-wrap gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <button
              v-for="key in INDIVIDUAL_PRODUCT_SECTIONS"
              :key="key"
              type="button"
              class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              :class="activeSection === key
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
              @click="activeSection = key"
            >
              <UIcon :name="PRODUCT_SECTION_META[key].icon" class="size-3" />
              {{ PRODUCT_SECTION_META[key].label }}
            </button>
          </div>

          <!-- Section toggle -->
          <div class="px-4 pt-3">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ PRODUCT_SECTION_META[activeSection]?.label }}
              </span>
              <div class="flex items-center gap-2">
                <UButton
                  v-if="hasSectionConfig(activeSection)"
                  label="Quitar"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash-2"
                  @click="removeSection(activeSection)"
                />
                <UButton
                  :label="isSectionActive(activeSection) ? 'Activa' : 'Inactiva'"
                  :color="isSectionActive(activeSection) ? 'success' : 'neutral'"
                  variant="outline"
                  size="xs"
                  @click="toggleSection(activeSection)"
                />
              </div>
            </div>
          </div>

          <!-- Section field editors (only when active) -->
          <div v-if="isSectionActive(activeSection)" class="px-4 pb-4 space-y-3">

            <!-- PROBLEM/SOLUTION -->
            <template v-if="activeSection === 'problem_solution'">
              <UiBaseInput :model-value="((pageConfig.problem_solution as Record<string, unknown>)?.headline as string) ?? ''" label="Headline problemas" @update:model-value="updateSectionField('problem_solution', 'headline', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-red-500">Problemas</p>
                  <UButton label="Agregar" color="error" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('problem_solution', 'problems', { icon: 'i-lucide-x-circle', title: 'Problema', description: 'Descripción' })" />
                </div>
                <div v-for="(item, i) in ((pageConfig.problem_solution as Record<string, unknown>)?.problems as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-red-200 dark:border-red-900 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('problem_solution', 'problems', i)" />
                  </div>
                  <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('problem_solution', 'problems', i, 'title', String($event))" />
                  <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('problem_solution', 'problems', i, 'description', String($event))" />
                </div>
              </div>
              <UiBaseInput :model-value="((pageConfig.problem_solution as Record<string, unknown>)?.solution_headline as string) ?? ''" label="Headline solución" @update:model-value="updateSectionField('problem_solution', 'solution_headline', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-green-500">Soluciones</p>
                  <UButton label="Agregar" color="success" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('problem_solution', 'solution_items', { icon: 'i-lucide-check-circle', title: 'Solución', description: 'Descripción' })" />
                </div>
                <div v-for="(item, i) in ((pageConfig.problem_solution as Record<string, unknown>)?.solution_items as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-green-200 dark:border-green-900 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('problem_solution', 'solution_items', i)" />
                  </div>
                  <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('problem_solution', 'solution_items', i, 'title', String($event))" />
                  <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('problem_solution', 'solution_items', i, 'description', String($event))" />
                </div>
              </div>
            </template>

            <!-- TRANSFORM -->
            <template v-if="activeSection === 'transform'">
              <UiBaseInput :model-value="((pageConfig.transform as Record<string, unknown>)?.headline as string) ?? ''" label="Headline" @update:model-value="updateSectionField('transform', 'headline', String($event))" />
              <UiBaseInput :model-value="((pageConfig.transform as Record<string, unknown>)?.subtext as string) ?? ''" label="Subtext" @update:model-value="updateSectionField('transform', 'subtext', String($event))" />
              <UiBaseInput :model-value="((pageConfig.transform as Record<string, unknown>)?.before_image as string) ?? ''" label="URL imagen antes" @update:model-value="updateSectionField('transform', 'before_image', String($event) || null)" />
              <UiBaseInput :model-value="((pageConfig.transform as Record<string, unknown>)?.after_image as string) ?? ''" label="URL imagen después" @update:model-value="updateSectionField('transform', 'after_image', String($event) || null)" />
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                  <p class="text-xs font-medium text-red-500">Antes</p>
                  <div v-for="(item, i) in ((pageConfig.transform as Record<string, unknown>)?.before as Array<Record<string, unknown>> ?? [])" :key="i" class="space-y-1">
                    <UiBaseInput :model-value="item.label as string" label="Label" @update:model-value="updateListItem('transform', 'before', i, 'label', String($event))" />
                    <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('transform', 'before', i, 'description', String($event))" />
                  </div>
                  <UButton label="Agregar" color="error" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('transform', 'before', { label: 'Antes', description: 'Situación' })" />
                </div>
                <div class="space-y-2">
                  <p class="text-xs font-medium text-green-500">Después</p>
                  <div v-for="(item, i) in ((pageConfig.transform as Record<string, unknown>)?.after as Array<Record<string, unknown>> ?? [])" :key="i" class="space-y-1">
                    <UiBaseInput :model-value="item.label as string" label="Label" @update:model-value="updateListItem('transform', 'after', i, 'label', String($event))" />
                    <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('transform', 'after', i, 'description', String($event))" />
                  </div>
                  <UButton label="Agregar" color="success" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('transform', 'after', { label: 'Después', description: 'Situación' })" />
                </div>
              </div>
            </template>

            <!-- FEATURES -->
            <template v-if="activeSection === 'features'">
              <UiBaseInput :model-value="((pageConfig.features as Record<string, unknown>)?.title as string) ?? ''" label="Título" @update:model-value="updateSectionField('features', 'title', String($event))" />
              <UiBaseInput :model-value="((pageConfig.features as Record<string, unknown>)?.subtitle as string) ?? ''" label="Subtítulo" @update:model-value="updateSectionField('features', 'subtitle', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Características</p>
                  <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('features', 'items', { icon: 'i-lucide-star', title: 'Característica', description: 'Descripción', image: null })" />
                </div>
                <div v-for="(item, i) in ((pageConfig.features as Record<string, unknown>)?.items as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('features', 'items', i)" />
                  </div>
                  <UiBaseInput :model-value="item.icon as string" label="Icono" @update:model-value="updateListItem('features', 'items', i, 'icon', String($event))" />
                  <UiBaseInput :model-value="item.title as string" label="Título" @update:model-value="updateListItem('features', 'items', i, 'title', String($event))" />
                  <UiBaseInput :model-value="item.description as string" label="Descripción" @update:model-value="updateListItem('features', 'items', i, 'description', String($event))" />
                  <UiBaseInput :model-value="(item.image as string) ?? ''" label="URL imagen (opcional)" @update:model-value="updateListItem('features', 'items', i, 'image', String($event) || null)" />
                </div>
              </div>
            </template>

            <!-- COMPARISON -->
            <template v-if="activeSection === 'comparison'">
              <UiBaseInput :model-value="((pageConfig.comparison as Record<string, unknown>)?.headline as string) ?? ''" label="Headline" @update:model-value="updateSectionField('comparison', 'headline', String($event))" />
              <UiBaseInput :model-value="((pageConfig.comparison as Record<string, unknown>)?.subtext as string) ?? ''" label="Subtext" @update:model-value="updateSectionField('comparison', 'subtext', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Columnas</p>
                  <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('comparison', 'columns', { label: 'Columna', is_ours: false })" />
                </div>
                <div v-for="(col, i) in ((pageConfig.comparison as Record<string, unknown>)?.columns as Array<Record<string, unknown>> ?? [])" :key="i" class="flex gap-2 items-center">
                  <UiBaseInput :model-value="col.label as string" label="" placeholder="Nombre" class="flex-1" @update:model-value="updateListItem('comparison', 'columns', i, 'label', String($event))" />
                  <UCheckbox :model-value="col.is_ours as boolean" label="Nuestro" @update:model-value="updateListItem('comparison', 'columns', i, 'is_ours', $event)" />
                  <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('comparison', 'columns', i)" />
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Filas</p>
                  <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('comparison', 'rows', { feature: 'Característica', values: ['', ''] })" />
                </div>
                <div v-for="(row, i) in ((pageConfig.comparison as Record<string, unknown>)?.rows as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <UiBaseInput :model-value="row.feature as string" label="" placeholder="Feature" class="flex-1" @update:model-value="updateListItem('comparison', 'rows', i, 'feature', String($event))" />
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('comparison', 'rows', i)" />
                  </div>
                </div>
              </div>
            </template>

            <!-- BUNDLE -->
            <template v-if="activeSection === 'bundle'">
              <UiBaseInput :model-value="((pageConfig.bundle as Record<string, unknown>)?.headline as string) ?? ''" label="Headline" @update:model-value="updateSectionField('bundle', 'headline', String($event))" />
              <UiBaseInput :model-value="((pageConfig.bundle as Record<string, unknown>)?.subtext as string) ?? ''" label="Subtext" @update:model-value="updateSectionField('bundle', 'subtext', String($event))" />
              <UiBaseInput :model-value="((pageConfig.bundle as Record<string, unknown>)?.discount_label as string) ?? ''" label="Label descuento" @update:model-value="updateSectionField('bundle', 'discount_label', String($event))" />
              <UiBaseInput :model-value="((pageConfig.bundle as Record<string, unknown>)?.cta_label as string) ?? ''" label="CTA Label" @update:model-value="updateSectionField('bundle', 'cta_label', String($event))" />
              <!-- Product picker -->
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Agregar productos al bundle</label>
                <div class="relative">
                  <UiBaseInput v-model="bundleProductSearch" label="" placeholder="Buscar producto por nombre..." @update:model-value="searchBundleProducts" />
                  <div v-if="bundleProducts.length" class="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <button
                      v-for="p in bundleProducts"
                      :key="p.id"
                      type="button"
                      class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                      @click="addProductToBundle(p)"
                    >
                      <img v-if="p.images?.[0]?.url" :src="p.images[0].url" class="w-8 h-8 rounded object-cover" :alt="p.name" />
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{{ p.name }}</p>
                        <p class="text-[10px] text-slate-400">${{ p.price.toLocaleString() }}</p>
                      </div>
                    </button>
                  </div>
                </div>
                <!-- Bundle items list -->
                <div v-for="(item, i) in ((pageConfig.bundle as Record<string, unknown>)?.items as Array<Record<string, unknown>> ?? [])" :key="i" class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 space-y-2">
                  <div class="flex items-center gap-2">
                    <img v-if="item.image" :src="item.image as string" class="w-10 h-10 rounded-md object-cover" :alt="item.name as string" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{{ item.name }}</p>
                      <p class="text-[10px] text-slate-400">ID: {{ item.product_id ?? 'manual' }}</p>
                    </div>
                    <button type="button" class="p-1 text-red-400 hover:text-red-600" @click="removeBundleItem(i)">
                      <UIcon name="i-lucide-trash-2" class="size-3.5" />
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <UiBaseInput :model-value="item.original_price as number" label="Precio original" type="number"
                      @update:model-value="updateBundleItem(i, 'original_price', Number($event))" />
                    <UiBaseInput :model-value="item.bundle_price as number" label="Precio con descuento" type="number"
                      @update:model-value="updateBundleItem(i, 'bundle_price', Number($event))" />
                  </div>
                </div>
              </div>
            </template>

            <!-- COUNTDOWN -->
            <template v-if="activeSection === 'countdown'">
              <UiBaseInput :model-value="((pageConfig.countdown as Record<string, unknown>)?.headline as string) ?? ''" label="Headline" @update:model-value="updateSectionField('countdown', 'headline', String($event))" />
              <UiBaseInput :model-value="((pageConfig.countdown as Record<string, unknown>)?.subtext as string) ?? ''" label="Subtext" @update:model-value="updateSectionField('countdown', 'subtext', String($event))" />
              <UiBaseInput :model-value="((pageConfig.countdown as Record<string, unknown>)?.end_date as string) ?? ''" label="Fecha fin (YYYY-MM-DD HH:mm)" @update:model-value="updateSectionField('countdown', 'end_date', String($event))" />
              <div class="grid grid-cols-2 gap-3">
                <UiBaseInput :model-value="((pageConfig.countdown as Record<string, unknown>)?.bg_color as string) ?? '#dc2626'" label="Color fondo" type="color" @update:model-value="updateSectionField('countdown', 'bg_color', String($event))" />
                <UiBaseInput :model-value="((pageConfig.countdown as Record<string, unknown>)?.text_color as string) ?? '#ffffff'" label="Color texto" type="color" @update:model-value="updateSectionField('countdown', 'text_color', String($event))" />
              </div>
            </template>

            <!-- TESTIMONIALS -->
            <template v-if="activeSection === 'testimonials'">
              <UiBaseInput :model-value="((pageConfig.testimonials as Record<string, unknown>)?.title as string) ?? ''" label="Título" @update:model-value="updateSectionField('testimonials', 'title', String($event))" />
              <UiBaseInput :model-value="((pageConfig.testimonials as Record<string, unknown>)?.subtitle as string) ?? ''" label="Subtítulo" @update:model-value="updateSectionField('testimonials', 'subtitle', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Testimonios</p>
                  <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('testimonials', 'items', { name: 'Cliente', role: 'Comprador', avatar: null, rating: 5, text: 'Excelente producto.' })" />
                </div>
                <div v-for="(item, i) in ((pageConfig.testimonials as Record<string, unknown>)?.items as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('testimonials', 'items', i)" />
                  </div>
                  <UiBaseInput :model-value="item.name as string" label="Nombre" @update:model-value="updateListItem('testimonials', 'items', i, 'name', String($event))" />
                  <UiBaseInput :model-value="item.role as string" label="Rol" @update:model-value="updateListItem('testimonials', 'items', i, 'role', String($event))" />
                  <UiBaseInput :model-value="(item.avatar as string) ?? ''" label="URL avatar (opcional)" @update:model-value="updateListItem('testimonials', 'items', i, 'avatar', String($event) || null)" />
                  <UiBaseInput :model-value="item.text as string" label="Testimonio" @update:model-value="updateListItem('testimonials', 'items', i, 'text', String($event))" />
                </div>
              </div>
            </template>

            <!-- UGC -->
            <template v-if="activeSection === 'ugc'">
              <UiBaseInput :model-value="((pageConfig.ugc as Record<string, unknown>)?.title as string) ?? ''" label="Título" @update:model-value="updateSectionField('ugc', 'title', String($event))" />
              <UiBaseInput :model-value="((pageConfig.ugc as Record<string, unknown>)?.subtitle as string) ?? ''" label="Subtítulo" @update:model-value="updateSectionField('ugc', 'subtitle', String($event))" />
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Posts de clientes</p>
                  <UButton label="Agregar" color="primary" variant="ghost" size="xs" icon="i-lucide-plus" @click="addListItem('ugc', 'items', { image: null, author: '@usuario', platform: 'Instagram', text: '¡increíble producto!' })" />
                </div>
                <div v-for="(item, i) in ((pageConfig.ugc as Record<string, unknown>)?.items as Array<Record<string, unknown>> ?? [])" :key="i" class="border border-slate-200 dark:border-slate-800 rounded p-2 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500">#{{ i + 1 }}</span>
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeListItem('ugc', 'items', i)" />
                  </div>
                  <UiBaseInput :model-value="(item.image as string) ?? ''" label="URL imagen" @update:model-value="updateListItem('ugc', 'items', i, 'image', String($event) || null)" />
                  <UiBaseInput :model-value="item.author as string" label="Autor" @update:model-value="updateListItem('ugc', 'items', i, 'author', String($event))" />
                  <UiBaseInput :model-value="item.platform as string" label="Plataforma" @update:model-value="updateListItem('ugc', 'items', i, 'platform', String($event))" />
                  <UiBaseInput :model-value="item.text as string" label="Texto" @update:model-value="updateListItem('ugc', 'items', i, 'text', String($event))" />
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>

      <slot name="extras" />

      <UiBaseButton
        type="submit"
        color="primary"
        :label="submitLabel"
        :loading="loading || submitLoading"
        :disabled="!isValid"
        class="rounded-xl mt-2"
      />
    </UForm>

    <!-- Optional preview panel -->
    <div v-if="showPreview" class="w-[60%] h-full shrink-0 border-l border-slate-200 dark:border-slate-700 overflow-y-auto hidden xl:block">
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center justify-between">
        <p class="text-xs font-medium text-slate-500">Preview en vivo</p>
        <UButton icon="i-lucide-x" size="xs" variant="ghost" @click="showPreview = false" />
      </div>
      <div class="p-2">
        <ClientProductSectionRenderer
          :sections="previewSections"
          :visible-keys="Object.keys(previewSections)"
          :product="previewProduct"
          :images="previewProduct.images"
        />
      </div>
    </div>
  </div>
</template>
