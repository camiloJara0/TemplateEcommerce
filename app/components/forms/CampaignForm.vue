<script setup lang="ts">
import type { SelectOption } from '~/components/ui/BaseSelect.vue'
import type { CampanaProducto, CreateCampaignPayload, EstadoCampana, NewsletterCampaign } from '~/types/commerce'

interface Props {
  campaignId?: number
  initial?: Partial<NewsletterCampaign>
  submitLabel?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Guardar campaña',
  loading: false
})

const emit = defineEmits<{
  success: [data: NewsletterCampaign]
  error: [error: unknown]
}>()

const communityStore = useCommunityStore()
const submitLoading = ref(false)

const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'titulo', label: 'Título', required: true, minLength: 2, maxLength: 255 },
  { key: 'asunto', label: 'Asunto', required: true, minLength: 5, maxLength: 255 },
  { key: 'contenido', label: 'Contenido', required: true, minLength: 20, maxLength: 10000 }
])

setForm({
  titulo: props.initial?.titulo ?? '',
  asunto: props.initial?.asunto ?? '',
  contenido: props.initial?.contenido ?? '',
  estado: props.initial?.estado ?? 'Borrador',
  fecha_programada: props.initial?.fecha_programada ? String(props.initial.fecha_programada).slice(0, 10) : '',
  cupon_id: props.initial?.cupon_id ?? null
})

const estadoOptions: SelectOption[] = [
  { label: 'Borrador', value: 'Borrador' },
  { label: 'Programada', value: 'Programada' }
]

// ── Imágenes (se suben en el momento para que la vista previa las muestre) ──
const images = ref<string[]>((props.initial?.media ?? []).map(m => m.url))
const uploading = ref(false)

async function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  uploading.value = true
  const { request } = useApi()

  try {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'campaigns')
      const res = await request<{ url: string }>('/admin/upload', { method: 'POST', body: fd })
      if (res.data?.url) images.value.push(res.data.url)
    }
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

// ── Productos ──────────────────────────────────────────────────────────────
const selectedProducts = ref<CampanaProducto[]>(
  (props.initial?.items ?? []).flatMap(i => (i.product ? [i.product] : []))
)
const productQuery = ref('')
const productResults = ref<CampanaProducto[]>([])
const productSearching = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function searchProducts() {
  if (searchTimer) clearTimeout(searchTimer)
  const q = productQuery.value.trim()
  if (q.length < 2) {
    productResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    productSearching.value = true
    try {
      const { request } = useApi()
      const res = await request<{ data: CampanaProducto[] }>('/admin/productos', {
        query: { busqueda: q, per_page: 8 }
      })
      const ids = new Set(selectedProducts.value.map(p => p.id))
      productResults.value = (res.data?.data ?? []).filter(p => !ids.has(p.id))
    } catch {
      productResults.value = []
    } finally {
      productSearching.value = false
    }
  }, 300)
}

function addProduct(product: CampanaProducto) {
  if (selectedProducts.value.some(p => p.id === product.id)) return
  selectedProducts.value.push(product)
  productQuery.value = ''
  productResults.value = []
  schedulePreview()
}

function removeProduct(id: number) {
  selectedProducts.value = selectedProducts.value.filter(p => p.id !== id)
  schedulePreview()
}

// ── Cupones ────────────────────────────────────────────────────────────────
const couponOptions = ref<SelectOption[]>([{ label: 'Sin cupón', value: 0 }])

onMounted(async () => {
  const { request } = useApi()
  try {
    const res = await request<{ items: Array<{ id: number, code: string, active: boolean }> }>(
      '/admin/cupones',
      { query: { per_page: 100 } }
    )
    couponOptions.value = [
      { label: 'Sin cupón', value: 0 },
      ...(res.data?.items ?? []).map(c => ({ label: c.code, value: c.id }))
    ]
  } catch {
    couponOptions.value = [{ label: 'Sin cupón', value: 0 }]
  }
})

// ── Vista previa del correo (mismo template que el envío real) ─────────────
const previewHtml = ref('')
const previewLoading = ref(false)
const previewError = ref('')
const device = ref<'desktop' | 'mobile'>('desktop')
let previewTimer: ReturnType<typeof setTimeout> | null = null

function buildPayload(): CreateCampaignPayload {
  return {
    titulo: String(form.value.titulo ?? ''),
    asunto: String(form.value.asunto ?? ''),
    contenido: String(form.value.contenido ?? ''),
    estado: (form.value.estado as EstadoCampana) ?? 'Borrador',
    fecha_programada: form.value.fecha_programada ? String(form.value.fecha_programada) : undefined,
    cupon_id: form.value.cupon_id ? Number(form.value.cupon_id) : undefined,
    items: selectedProducts.value.map(p => p.id),
    existing_image_urls: [...images.value]
  }
}

async function refreshPreview() {
  if (!form.value.titulo && !form.value.contenido && !images.value.length && !selectedProducts.value.length) {
    previewHtml.value = ''
    previewError.value = ''
    return
  }

  previewLoading.value = true
  try {
    const res = await communityStore.previewCampaign(buildPayload())
    previewHtml.value = res.html
    previewError.value = ''
  } catch (error) {
    previewError.value = error instanceof Error ? error.message : 'No se pudo generar la vista previa'
  } finally {
    previewLoading.value = false
  }
}

function schedulePreview() {
  if (previewTimer) clearTimeout(previewTimer)
  previewTimer = setTimeout(refreshPreview, 700)
}

watch(
  () => [form.value.titulo, form.value.asunto, form.value.contenido, form.value.cupon_id, images.value, selectedProducts.value],
  schedulePreview,
  { deep: true }
)

// ── Submit ─────────────────────────────────────────────────────────────────
async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const result = await communityStore.saveCampaign(buildPayload(), props.campaignId)
    emit('success', result.data as NewsletterCampaign)
  } catch (error) {
    emit('error', error)
    throw error
  } finally {
    submitLoading.value = false
  }
}

defineExpose({ form, visibleErrors, isValid, refreshPreview })
</script>

<template>
  <div class="flex flex-col xl:flex-row gap-4">
    <!-- ── Editor ─────────────────────────────────────────────────────── -->
    <UForm
      class="flex-1 space-y-5 overflow-y-auto max-h-[78vh] pr-1"
      :state="form"
      @submit.prevent="onSubmit"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiBaseInput
          v-model="form.titulo"
          label="Título de la campaña"
          required
          placeholder="Nueva colección de verano"
          :error="visibleErrors.titulo || undefined"
          @blur="touch('titulo')"
        />
        <UiBaseInput
          v-model="form.asunto"
          label="Asunto del correo"
          required
          placeholder="Hasta 40% de descuento"
          hint="Es lo que el cliente ve en su bandeja de entrada"
          :error="visibleErrors.asunto || undefined"
          @blur="touch('asunto')"
        />
      </div>

      <UiBaseTextarea
        v-model="form.contenido"
        label="Contenido"
        required
        :rows="6"
        placeholder="Escribe el mensaje principal de la campaña…"
        :error="visibleErrors.contenido || undefined"
        @blur="touch('contenido')"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UiBaseInput
          v-model="form.fecha_programada"
          type="date"
          label="Fecha programada"
          placeholder="Selecciona"
        />
        <UiBaseSelect
          v-model="form.cupon_id"
          label="Cupón promocional"
          hint="Se muestra en el correo con su código"
          :items="couponOptions"
        />
      </div>

      <UiBaseSelect
        v-model="form.estado"
        label="Estado"
        :items="estadoOptions"
        hint="El estado Enviada se asigna al enviar"
      />

      <!-- Imágenes -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Imágenes promocionales</label>
        <div
          v-if="images.length"
          class="flex flex-wrap gap-3"
        >
          <div
            v-for="(url, i) in images"
            :key="url"
            class="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <img
              :src="url"
              class="w-full h-full object-cover"
              :alt="`Imagen ${i + 1}`"
            >
            <button
              type="button"
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              @click="removeImage(i)"
            >
              <UIcon
                name="i-lucide-trash-2"
                class="size-5 text-white"
              />
            </button>
          </div>
        </div>
        <label
          class="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
        >
          <UIcon
            :name="uploading ? 'i-lucide-loader-circle' : 'i-lucide-upload'"
            class="size-4 text-slate-400"
            :class="{ 'animate-spin': uploading }"
          />
          <span class="text-xs text-slate-400">{{ uploading ? 'Subiendo…' : 'Agregar imagen' }}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            :disabled="uploading"
            @change="handleFiles"
          >
        </label>
      </div>

      <!-- Productos -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Productos destacados</label>
        <div class="relative">
          <UiBaseInput
            v-model="productQuery"
            label=""
            icon="i-lucide-search"
            placeholder="Buscar producto por nombre…"
            @update:model-value="searchProducts"
          />
          <div
            v-if="productResults.length || productSearching"
            class="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-56 overflow-y-auto"
          >
            <p
              v-if="productSearching"
              class="px-3 py-2 text-xs text-slate-400"
            >
              Buscando…
            </p>
            <button
              v-for="p in productResults"
              :key="p.id"
              type="button"
              class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              @click="addProduct(p)"
            >
              <img
                v-if="p.images?.[0]?.url"
                :src="p.images[0].url"
                class="w-8 h-8 rounded object-cover"
                :alt="p.name"
              >
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {{ p.name }}
                </p>
                <p class="text-[10px] text-slate-400">
                  ${{ Number(p.price).toLocaleString('es-CO') }}
                </p>
              </div>
            </button>
          </div>
        </div>
        <div
          v-if="selectedProducts.length"
          class="flex flex-wrap gap-2"
        >
          <span
            v-for="p in selectedProducts"
            :key="p.id"
            class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs"
          >
            {{ p.name }}
            <button
              type="button"
              class="p-0.5 rounded-full hover:bg-primary-100"
              @click="removeProduct(p.id)"
            >
              <UIcon
                name="i-lucide-x"
                class="size-3.5"
              />
            </button>
          </span>
        </div>
      </div>

      <UiBaseButton
        type="submit"
        color="primary"
        :label="submitLabel"
        :loading="loading || submitLoading"
        :disabled="!isValid"
        class="rounded-xl"
      />
    </UForm>

    <!-- ── Vista previa del correo ─────────────────────────────────────── -->
    <div
      class="w-full xl:w-[52%] shrink-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900"
      :class="previewHtml ? 'min-h-[420px] xl:min-h-[78vh]' : 'min-h-[180px]'"
    >
      <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon
            name="i-lucide-mail"
            class="size-4 text-primary-600 shrink-0"
          />
          <p class="text-xs font-semibold truncate">
            Vista previa del correo
          </p>
          <span
            v-if="previewLoading"
            class="text-[10px] text-slate-400"
          >actualizando…</span>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-monitor"
            size="xs"
            :color="device === 'desktop' ? 'primary' : 'neutral'"
            variant="ghost"
            aria-label="Vista de escritorio"
            @click="device = 'desktop'"
          />
          <UButton
            icon="i-lucide-smartphone"
            size="xs"
            :color="device === 'mobile' ? 'primary' : 'neutral'"
            variant="ghost"
            aria-label="Vista móvil"
            @click="device = 'mobile'"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            size="xs"
            color="neutral"
            variant="ghost"
            aria-label="Actualizar vista previa"
            :loading="previewLoading"
            @click="refreshPreview"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div
          v-if="previewError"
          class="text-xs text-red-500 p-3 bg-red-50 dark:bg-red-950/40 rounded-lg"
        >
          {{ previewError }}
        </div>

        <div
          v-else-if="!previewHtml"
          class="h-full min-h-[160px] flex flex-col items-center justify-center text-center gap-2 px-6"
        >
          <UIcon
            name="i-lucide-mail-open"
            class="size-8 text-slate-300"
          />
          <p class="text-xs text-slate-400">
            Escribe el título y el contenido para ver aquí cómo quedará el correo
            que recibirán tus suscriptores.
          </p>
        </div>

        <div
          v-else
          class="flex justify-center"
        >
          <iframe
            :srcdoc="previewHtml"
            title="Vista previa del correo"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            class="bg-white rounded-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
            :class="device === 'mobile' ? 'w-[375px] h-[640px]' : 'w-full h-[640px]'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
