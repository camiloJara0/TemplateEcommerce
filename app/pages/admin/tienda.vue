<script setup lang="ts">
import { DEFAULT_TIENDA_CONFIG, ABOUT_SECTION_META } from '~/types/store'
import type { TiendaConfig, SectionKey, AboutSectionKey, PageSection } from '~/types/store'

const fullscreen = ref(false)

definePageMeta({
  layout: false,
  middleware: ['auth'],
})

const layout = computed(() => fullscreen.value ? 'admin-editor' : 'admin')

const configStore = useStoreConfigStore()
const toast = useToast()
const { getOrderedSections, updateSectionVariant } = usePageSections()

useSeoMeta({ title: 'Editor de tienda — Admin' })

const config = ref<TiendaConfig>(JSON.parse(JSON.stringify(DEFAULT_TIENDA_CONFIG)))
const selectedSection = ref<string>('hero-1')
const selectedAboutSection = ref<AboutSectionKey>('hero')
const activeTab = ref<'home' | 'producto' | 'about' | 'styles' | 'plantillas'>('home')
const hasChanges = ref(false)
const saving = ref(false)

const router = useRouter()

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

function updateSection(key: SectionKey, value: any) {
  if (key === '_header' || key === '_categories_home') return
  config.value = {
    ...config.value,
    secciones: { ...config.value.secciones, [key]: value }
  }
  pushHistory()
}

function updateAboutSection<K extends AboutSectionKey>(key: K, value: TiendaConfig['nosotros'][K]) {
  config.value = {
    ...config.value,
    nosotros: { ...config.value.nosotros, [key]: value }
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

function updatePageSection(id: string, patch: Partial<PageSection>) {
  if (patch.variant !== undefined) {
    config.value = updateSectionVariant(config.value, id, patch.variant)
  } else if (patch.config !== undefined) {
    const sections = getOrderedSections(config.value).map(s =>
      s.id === id ? { ...s, config: { ...s.config, ...patch.config } } : s
    )
    config.value = { ...config.value, page_sections: sections }
  } else if (patch.visible !== undefined) {
    const sections = getOrderedSections(config.value).map(s =>
      s.id === id ? { ...s, visible: patch.visible! } : s
    )
    config.value = { ...config.value, page_sections: sections }
  }
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

async function handleApplyTemplate(templateConfig: TiendaConfig) {
  config.value = JSON.parse(JSON.stringify(templateConfig))
  pushHistory()
  activeTab.value = 'home'

  saving.value = true
  try {
    await configStore.updateTienda(config.value)
    hasChanges.value = false
    toast.add({ title: 'Plantilla aplicada y guardada', description: 'La plantilla ha sido aplicada y guardada en la base de datos. Puedes personalizar cada sección.', color: 'success', icon: 'i-lucide-check-circle' })
  } catch {
    toast.add({ title: 'Plantilla aplicada', description: 'La plantilla se aplicó localmente. Presiona Guardar para persistir.', color: 'warning', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
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
  { key: 'producto' as const, label: 'Producto', icon: 'i-lucide-package' },
  { key: 'about' as const, label: 'Nosotros', icon: 'i-lucide-users' },
  { key: 'styles' as const, label: 'Global', icon: 'i-lucide-palette' },
]
</script>

<template>
  <NuxtLayout :name="layout">
    <div class=" flex flex-col -m-6" :class="{'h-[calc(100dvh-4rem)]': !fullscreen, 'h-screen': fullscreen}">
      <!-- Toolbar -->
      <AdminEditorToolbar
        :has-changes="hasChanges"
        :saving="saving"
        :can-undo="historyIndex > 0"
        :can-redo="historyIndex < history.length - 1"
        :fullscreen="fullscreen"
        @save="handleSave"
        @back="handleBack"
        @preview="handlePreview"
        @undo="undo"
        @redo="redo"
        @toggle-fullscreen="fullscreen = !fullscreen"
      />

    <!-- Normal Layout -->
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
                      <AdminHomeSectionEditor
              :config="config"
              :selected="selectedSection"
              @update:section="(key, value) => updateSection(key, value)"
              @update:header="updateHeader"
              @update:categories_home="updateCategoriesHome"
              @update:pageSection="updatePageSection"
            />
        </div>

        <!-- About sections -->
        <div v-else-if="activeTab === 'about'" class="flex-1 overflow-y-auto">
          <AdminAboutSectionList
            v-model:selected="selectedAboutSection"
          />
          <div class="border-t border-slate-200 dark:border-slate-800">
            <AdminAboutSectionEditor
              :config="config.nosotros"
              :selected="selectedAboutSection"
              @update:section="(key, value) => updateAboutSection(key, value)"
            />
          </div>
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
          <UTabs color="neutral" :items="[
              {label:'Estilos', slot: 'estilos'},
              {label:'Navbar', slot: 'navbar'},
              {label:'Footer', slot: 'footer'}]"
            >
            <template #estilos>
              <AdminEditorsGlobalStylesEditor
                :value="config.estilos"
                @update="updateStyles"
              />
            </template>
            <template #navbar>
              <AdminEditorsNavbarEditor
                :value="config.navbar"
                @update="updateNavbar"
              />
            </template>
            <template #footer>
              <AdminEditorsFooterEditor
                :value="config.footer"
                @update="updateFooter"
              />
            </template>
          </UTabs>
        </div>

      </div>

      <!-- Center: Live Preview -->
      <div class="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900">
        <div class="bg-white dark:bg-slate-950 min-h-full">
          <AdminProductSectionPreview
            v-if="activeTab === 'producto'"
            :value="config.producto"
          />
          <AdminAboutSectionPreview
            v-else-if="activeTab === 'about'"
            :config="config.nosotros"
            :selected="selectedAboutSection"
          />
          <AdminSectionEditor
            v-else
            :config="config"
            :selected="selectedSection"
            @update:selected="(selectedSection = $event)"
          />
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>
