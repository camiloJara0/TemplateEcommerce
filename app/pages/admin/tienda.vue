<script setup lang="ts">
import type { TiendaConfig, SectionKey } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const configStore = useStoreConfigStore()
const toast = useToast()

useSeoMeta({ title: 'Editor de tienda — Admin' })

const config = ref<TiendaConfig>(JSON.parse(JSON.stringify(DEFAULT_TIENDA_CONFIG)))
const selectedSection = ref('hero')
const activeTab = ref<'home' | 'header' | 'categories' | 'producto' | 'styles' | 'brand' | 'navbar' | 'footer'>('home')
const hasChanges = ref(false)
const saving = ref(false)

const history = ref<string[]>([])
const historyIndex = ref(-1)

function pushHistory() {
  const snapshot = JSON.stringify(config.value)
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(snapshot)
  historyIndex.value = history.value.length - 1
  hasChanges.value = true
}

function undo() {
  if (historyIndex.value <= 0) return
  historyIndex.value--
  const snapshot = history.value[historyIndex.value]
  if (snapshot) config.value = JSON.parse(snapshot)
  hasChanges.value = true
}

function redo() {
  if (historyIndex.value >= history.value.length - 1) return
  historyIndex.value++
  const snapshot = history.value[historyIndex.value]
  if (snapshot) config.value = JSON.parse(snapshot)
  hasChanges.value = true
}

function updateSection<K extends SectionKey>(key: K, value: TiendaConfig['secciones'][K]) {
  config.value = {
    ...config.value,
    secciones: { ...config.value.secciones, [key]: value }
  }
  pushHistory()
}

function updateHeader(value: TiendaConfig['header']) {
  config.value = { ...config.value, header: value }
  pushHistory()
}

function updateCategoriesHome(value: TiendaConfig['categories_home']) {
  config.value = { ...config.value, categories_home: value }
  pushHistory()
}

function updateProducto(value: TiendaConfig['producto']) {
  config.value = { ...config.value, producto: value }
  pushHistory()
}

function updateStyles(value: TiendaConfig['estilos']) {
  config.value = { ...config.value, estilos: value }
  pushHistory()
}

function updateBrand(value: TiendaConfig['brand']) {
  config.value = { ...config.value, brand: value }
  pushHistory()
}

function updateNavbar(value: TiendaConfig['navbar']) {
  config.value = { ...config.value, navbar: value }
  pushHistory()
}

function updateFooter(value: TiendaConfig['footer']) {
  config.value = { ...config.value, footer: value }
  pushHistory()
}

async function handleSave() {
  saving.value = true
  try {
    await configStore.updateTienda(config.value)
    hasChanges.value = false
    toast.add({ title: 'Guardado', description: 'Configuración de tienda guardada.', color: 'success', icon: 'i-lucide-check-circle' })
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo guardar.', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

function handleBack() {
  if (hasChanges.value) {
    if (!confirm('Hay cambios sin guardar. ¿Salir de todos modos?')) return
  }
  navigateTo('/admin')
}

function handlePreview() {
  window.open('/', '_blank')
}

onMounted(async () => {
  await configStore.loadTiendaAdmin()
  if (configStore.tiendaConfig) {
    config.value = JSON.parse(JSON.stringify(configStore.tiendaConfig))
  }
  pushHistory()
})

const tabs = [
  { key: 'home' as const, label: 'Inicio', icon: 'i-lucide-home' },
  { key: 'header' as const, label: 'Header', icon: 'i-lucide-panel-top' },
  { key: 'categories' as const, label: 'Categorías', icon: 'i-lucide-layout-grid' },
  { key: 'producto' as const, label: 'Producto', icon: 'i-lucide-package' },
  { key: 'styles' as const, label: 'Estilos', icon: 'i-lucide-palette' },
  { key: 'brand' as const, label: 'Brand', icon: 'i-lucide-hexagon' },
  { key: 'navbar' as const, label: 'Nav', icon: 'i-lucide-menu' },
  { key: 'footer' as const, label: 'Footer', icon: 'i-lucide-panel-bottom' },
]
</script>

<template>
  <div class="h-[calc(100dvh-4rem)] flex flex-col -m-6">
    <!-- Toolbar -->
    <AdminEditorToolbar
      :has-changes="hasChanges"
      :saving="saving"
      :can-undo="historyIndex > 0"
      :can-redo="historyIndex < history.length - 1"
      @save="handleSave"
      @back="handleBack"
      @preview="handlePreview"
      @undo="undo"
      @redo="redo"
    />

    <!-- Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Tabs + Section list / Editors -->
      <div class="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
        <!-- Tab bar -->
        <div class="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
            @click="activeTab = tab.key"
          >
            <UIcon :name="tab.icon" class="size-3.5" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Home sections -->
        <div v-if="activeTab === 'home'" class="flex-1 overflow-y-auto">
          <AdminSectionList
            v-model:config="config"
            v-model:selected="selectedSection"
          />
        </div>

        <!-- Header editor -->
        <div v-else-if="activeTab === 'header'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsHeaderEditor
            :value="config.header"
            @update="updateHeader"
          />
        </div>

        <!-- Categories home editor -->
        <div v-else-if="activeTab === 'categories'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsCategoriesHomeEditor
            :value="config.categories_home"
            @update="updateCategoriesHome"
          />
        </div>

        <!-- Product sections editor -->
        <div v-else-if="activeTab === 'producto'" class="flex-1 overflow-hidden">
          <AdminEditorsProductSectionsEditor
            :value="config.producto"
            @update="updateProducto"
          />
        </div>

        <!-- Style editors -->
        <div v-else-if="activeTab === 'styles'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsGlobalStylesEditor
            :value="config.estilos"
            @update="updateStyles"
          />
        </div>

        <div v-else-if="activeTab === 'brand'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsBrandEditor
            :value="config.brand"
            :social="config.social"
            @update="updateBrand"
            @update:social="(v) => { config = { ...config, social: v }; pushHistory() }"
          />
        </div>

        <div v-else-if="activeTab === 'navbar'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsNavbarEditor
            :value="config.navbar"
            @update="updateNavbar"
          />
        </div>

        <div v-else-if="activeTab === 'footer'" class="flex-1 overflow-y-auto p-4">
          <AdminEditorsFooterEditor
            :value="config.footer"
            @update="updateFooter"
          />
        </div>
      </div>

      <!-- Center: Live Preview -->
      <div class="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900">
        <div class="bg-white dark:bg-slate-950 min-h-full">
          <AdminProductSectionPreview
            v-if="activeTab === 'producto'"
            :value="config.producto"
          />
          <AdminSectionEditor
            v-else
            :config="config"
            :selected="selectedSection"
            @update:selected="selectedSection = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>
