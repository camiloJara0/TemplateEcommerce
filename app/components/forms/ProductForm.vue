<script setup lang="ts">
import type { ProductPayload } from '~/types/admin'
import type { SelectOption } from '~/components/ui/BaseSelect.vue'
import { PRODUCT_SECTION_META } from '~/types/store'

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

// ── Page Config (per-product customization) ──────────────────────────────
const showPageConfig = ref(false)
const pageConfig = ref<Record<string, unknown>>(props.initial?.page_config as Record<string, unknown> ?? {})
type ProductSectionKey = keyof typeof PRODUCT_SECTION_META

const activePageSection = ref<ProductSectionKey>('hero')

const pageSectionKeys = Object.keys(PRODUCT_SECTION_META) as ProductSectionKey[]

function togglePageSection(key: ProductSectionKey) {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  pageConfig.value[key] = { ...section, show: !(section.show as boolean) }
}

function updatePageSectionField(key: ProductSectionKey, field: string, val: unknown) {
  const section = (pageConfig.value[key] as Record<string, unknown>) ?? {}
  pageConfig.value[key] = { ...section, [field]: val }
}

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

defineExpose({ form, visibleErrors, isValid })
</script>

<template>
  <UForm class="space-y-4" :state="form" @submit.prevent="onSubmit">
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
          <img :src="url" class="w-full h-full object-cover" />
          <button type="button" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" @click="removeExistingImage(i)">
            <UIcon name="i-lucide-trash-2" class="size-5 text-white" />
          </button>
        </div>
        <div v-for="(file, i) in newImageFiles" :key="'new-'+i" class="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img :src="getNewImagePreview(file)" class="w-full h-full object-cover" />
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

    <!-- Page Config: Personalización de página del producto -->
    <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" @click="showPageConfig = !showPageConfig">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-layout-template" class="size-5 text-primary-600" />
          <div class="text-left">
            <p class="font-medium text-slate-900 dark:text-white text-sm">Personalización de página</p>
            <p class="text-xs text-slate-500">Configura secciones adicionales para este producto</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="Object.keys(pageConfig).length" class="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
            {{ Object.keys(pageConfig).filter(k => (pageConfig[k] as Record<string, unknown>)?.show).length }} activas
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-slate-400 transition-transform" :class="showPageConfig ? 'rotate-180' : ''" />
        </div>
      </button>

      <div v-show="showPageConfig" class="border-t border-slate-200 dark:border-slate-700">
        <p class="p-4 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50">
          Activa y personaliza las secciones que quieres mostrar en la página de este producto. Las secciones inactivas no se renderizarán.
        </p>

        <!-- Section tabs -->
        <div class="flex flex-wrap gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <button
            v-for="key in pageSectionKeys"
            :key="key"
            type="button"
            class="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
            :class="activePageSection === key
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
            @click="activePageSection = key"
          >
            <UIcon :name="PRODUCT_SECTION_META[key].icon" class="size-3" />
            {{ PRODUCT_SECTION_META[key].label }}
          </button>
        </div>

        <!-- Section toggle + fields -->
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ PRODUCT_SECTION_META[activePageSection]?.label }}
            </span>
            <UButton
              :label="(pageConfig[activePageSection] as Record<string, unknown>)?.show ? 'Activa' : 'Inactiva'"
              :color="(pageConfig[activePageSection] as Record<string, unknown>)?.show ? 'success' : 'neutral'"
              variant="outline"
              size="xs"
              @click="togglePageSection(activePageSection)"
            />
          </div>

          <template v-if="(pageConfig[activePageSection] as Record<string, unknown>)?.show">
            <UiBaseInput
              v-if="['hero', 'bundle', 'countdown', 'cta', 'warranty'].includes(activePageSection)"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.headline as string) ?? ''"
              label="Headline / Título"
              @update:model-value="updatePageSectionField(activePageSection, 'headline', String($event))"
            />
            <UiBaseTextarea
              v-if="['hero', 'bundle', 'countdown', 'cta', 'transform'].includes(activePageSection)"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.subtext as string) ?? ''"
              label="Subtext / Descripción"
              :rows="2"
              @update:model-value="updatePageSectionField(activePageSection, 'subtext', String($event))"
            />
            <UiBaseInput
              v-if="activePageSection === 'bundle'"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.discount_label as string) ?? ''"
              label="Label de descuento"
              @update:model-value="updatePageSectionField(activePageSection, 'discount_label', String($event))"
            />
            <UiBaseInput
              v-if="activePageSection === 'countdown'"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.end_date as string) ?? ''"
              label="Fecha fin (YYYY-MM-DD HH:mm)"
              @update:model-value="updatePageSectionField(activePageSection, 'end_date', String($event))"
            />
            <UiBaseSelect
              v-if="activePageSection === 'hero'"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.layout as string) ?? 'gallery-left'"
              label="Layout"
              :items="[{ label: 'Galería izquierda', value: 'gallery-left' }, { label: 'Galería derecha', value: 'gallery-right' }, { label: 'Ancho completo', value: 'full-width' }]"
              @update:model-value="updatePageSectionField(activePageSection, 'layout', $event)"
            />
            <UiBaseSelect
              v-if="activePageSection === 'faq'"
              :model-value="((pageConfig[activePageSection] as Record<string, unknown>)?.style as string) ?? 'accordion'"
              label="Estilo FAQ"
              :items="[{ label: 'Accordion', value: 'accordion' }, { label: 'Tabs', value: 'tabs' }, { label: 'Simple', value: 'simple' }]"
              @update:model-value="updatePageSectionField(activePageSection, 'style', $event)"
            />
            <p class="text-xs text-slate-400 italic">
              Los campos detallados (items, imágenes, colores) se heredan de la configuración global. Activa la sección y personaliza desde el editor de tienda.
            </p>
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
</template>
