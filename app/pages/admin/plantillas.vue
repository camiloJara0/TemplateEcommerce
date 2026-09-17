<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
import { getTemplateCategories, getFilteredTemplates, type Template } from '~/lib/templates'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

useSeoMeta({ title: 'Plantillas — Admin' })

const configStore = useStoreConfigStore()
const toast = useToast()

const search = ref('')
const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

const categories = getTemplateCategories()

const categoryOptions = computed(() => [
  { label: 'Todas', value: 'all' },
  ...categories.map(c => ({ label: c.label, value: c.key })),
])

const difficultyOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Básico', value: 'basico' },
  { label: 'Intermedio', value: 'intermedio' },
  { label: 'Avanzado', value: 'avanzado' },
]

const filteredTemplates = computed(() =>
  getFilteredTemplates({
    category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
    difficulty: selectedDifficulty.value === 'all' ? undefined : selectedDifficulty.value,
    search: search.value || undefined,
  })
)

const activeFilters = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'all') count++
  if (selectedDifficulty.value !== 'all') count++
  if (search.value) count++
  return count
})

function clearFilters() {
  search.value = ''
  selectedCategory.value = 'all'
  selectedDifficulty.value = 'all'
}

const selectedTemplate = ref<Template | null>(null)
const showPreview = ref(false)
const applying = ref(false)

function openPreview(template: Template) {
  selectedTemplate.value = template
  showPreview.value = true
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ecommerce: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    moda: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    gourmet: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
    tecnologia: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    deportes: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
    general: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }
  return colors[category] ?? 'bg-slate-50 text-slate-700 border-slate-200'
}

function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    basico: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    intermedio: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    avanzado: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
  }
  return colors[difficulty] ?? 'bg-slate-50 text-slate-700 border-slate-200'
}

function getGradientStyle(gradient: string) {
  const map: Record<string, string> = {
    'from-violet-600 to-blue-600': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
    'from-amber-600 to-rose-600': 'linear-gradient(135deg, #d97706 0%, #e11d48 100%)',
    'from-red-600 to-orange-600': 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
    'from-cyan-600 to-teal-600': 'linear-gradient(135deg, #0891b2 0%, #0d9488 100%)',
    'from-fuchsia-600 to-pink-600': 'linear-gradient(135deg, #c026d3 0%, #ec4899 100%)',
    'from-neutral-800 to-neutral-950': 'linear-gradient(135deg, #262626 0%, #0a0a0a 100%)',
    'from-stone-400 to-stone-600': 'linear-gradient(135deg, #a8a29e 0%, #57534e 100%)',
    'from-amber-700 to-amber-900': 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
    'from-orange-700 to-yellow-800': 'linear-gradient(135deg, #c2410c 0%, #854d0e 100%)',
    'from-pink-600 to-rose-700': 'linear-gradient(135deg, #db2777 0%, #be123c 100%)',
    'from-blue-600 to-indigo-700': 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
    'from-violet-600 to-purple-700': 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    'from-green-600 to-emerald-700': 'linear-gradient(135deg, #16a34a 0%, #047857 100%)',
    'from-red-500 to-rose-600': 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)',
    'from-slate-500 to-slate-700': 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
    'from-pink-500 via-purple-500 to-indigo-500': 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)',
  }
  return map[gradient] ?? 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
}

async function handleApply(template: Template) {
  if (!confirm(`¿Aplicar plantilla "${template.name}"?\n\nEsto reemplazará TODA la configuración actual de tu tienda (secciones, header, categorías, estilos, etc.).\n\nPuedes modificar cada sección después de aplicarla.`)) return
  applying.value = true
  try {
    const templateConfig = JSON.parse(JSON.stringify(template.config))
    await configStore.updateTienda(templateConfig)
    toast.add({ title: 'Plantilla aplicada', description: `"${template.name}" aplicada y guardada correctamente.`, color: 'success', icon: 'i-lucide-check-circle' })
    showPreview.value = false
    navigateTo('/admin/tienda')
  } catch {
    toast.add({ title: 'Error', description: 'No se pudo guardar la plantilla.', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    applying.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100dvh-4rem)] bg-slate-50 dark:bg-slate-900">
    <!-- Hero Header -->
    <div class="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 50%, rgb(99 102 241 / 0.1), transparent 50%), radial-gradient(circle at 80% 20%, rgb(217 70 239 / 0.08), transparent 40%)" />
      <div class="relative page-container py-10 sm:py-14">
        <div class="max-w-2xl">
          <div class="flex items-center gap-3 mb-4">
            <div class="size-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
              <UIcon name="i-lucide-layout-template" class="size-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Plantillas</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">Elige un diseño base y personalízalo a tu gusto</p>
            </div>
          </div>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Cada plantilla incluye secciones pre-configuradas con variantes específicas. Después de aplicarla, puedes modificar cada sección desde el editor de tienda.
          </p>
        </div>
      </div>
    </div>

    <div class="page-container py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-4 space-y-6">
            <!-- Search -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Buscar</label>
              <UInput
                v-model="search"
                placeholder="Nombre o descripción..."
                icon="i-lucide-search"
                :ui="{ root: 'w-full' }"
              />
            </div>

            <!-- Category Filter -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Categoría</label>
              <div class="space-y-1">
                <button
                  v-for="opt in categoryOptions"
                  :key="opt.value"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                  :class="selectedCategory === opt.value
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  @click="selectedCategory = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Difficulty Filter -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Dificultad</label>
              <div class="space-y-1">
                <button
                  v-for="opt in difficultyOptions"
                  :key="opt.value"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                  :class="selectedDifficulty === opt.value
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
                  @click="selectedDifficulty = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Active Filters -->
            <div v-if="activeFilters > 0" class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                class="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                @click="clearFilters"
              >
                Limpiar filtros ({{ activeFilters }})
              </button>
            </div>
          </div>
        </aside>

        <!-- Template Grid -->
        <div class="flex-1 min-w-0">
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ filteredTemplates.length }}</span>
              plantilla{{ filteredTemplates.length !== 1 ? 's' : '' }}
              <span v-if="activeFilters > 0" class="text-brand-600 dark:text-brand-400">(filtradas)</span>
            </p>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTemplates.length === 0" class="text-center py-20">
            <div class="size-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <UIcon name="i-lucide-search-x" class="size-7 text-slate-400" />
            </div>
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300">No se encontraron plantillas</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Prueba con otros filtros o términos de búsqueda</p>
            <UButton label="Limpiar filtros" variant="outline" class="mt-4" @click="clearFilters" />
          </div>

          <!-- Template Cards Grid -->
          <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <article
              v-for="template in filteredTemplates"
              :key="template.id"
              class="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer flex flex-col"
              @click="openPreview(template)"
            >
              <!-- Template Visual -->
              <div class="relative aspect-16/10 overflow-hidden">
                <div
                  class="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  :style="{ background: getGradientStyle(template.gradient) }"
                />
                <!-- Decorative Elements -->
                <div class="absolute inset-0 overflow-hidden">
                  <div class="absolute -top-8 -right-8 size-32 rounded-full bg-white/10 blur-xl" />
                  <div class="absolute -bottom-4 -left-4 size-24 rounded-full bg-white/5 blur-lg" />
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-2xl bg-white/10 backdrop-blur-sm rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                </div>
                <!-- Icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="size-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UIcon :name="template.icon" class="size-8 text-white drop-shadow" />
                  </div>
                </div>
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
                  <span class="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-sm translate-y-2 group-hover:translate-y-0">
                    Ver detalles
                  </span>
                </div>
              </div>

              <!-- Template Info -->
              <div class="p-4 flex-1 flex flex-col">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {{ template.name }}
                  </h3>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                  {{ template.description }}
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap items-center gap-1.5 mb-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                    :class="getCategoryColor(template.category)"
                  >
                    {{ template.categoryLabel }}
                  </span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                    :class="getDifficultyColor(template.difficulty)"
                  >
                    {{ template.difficultyLabel }}
                  </span>
                </div>

                <!-- Sections Preview -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <span
                    v-for="section in template.sections.slice(0, 4)"
                    :key="section"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  >
                    {{ section }}
                  </span>
                  <span
                    v-if="template.sections.length > 4"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                  >
                    +{{ template.sections.length - 4 }}
                  </span>
                </div>

                <!-- Apply Button -->
                <button
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                  @click.stop="handleApply(template)"
                  :disabled="applying"
                >
                  {{ applying ? 'Aplicando...' : 'Aplicar plantilla' }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <UModal v-model:open="showPreview" :ui="{ content: 'max-w-5xl max-h-[90vh] overflow-y-auto' }">
      <template #content>
        <div v-if="selectedTemplate" class="p-6 sm:p-8">
          <!-- Modal Header -->
          <div class="flex items-start justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <div class="size-10 rounded-xl flex items-center justify-center" :style="{ background: getGradientStyle(selectedTemplate.gradient) }">
                  <UIcon :name="selectedTemplate.icon" class="size-5 text-white" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedTemplate.name }}</h2>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                      :class="getCategoryColor(selectedTemplate.category)"
                    >
                      {{ selectedTemplate.categoryLabel }}
                    </span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                      :class="getDifficultyColor(selectedTemplate.difficulty)"
                    >
                      {{ selectedTemplate.difficultyLabel }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="showPreview = false" />
          </div>

          <!-- Description -->
          <p class="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{{ selectedTemplate.description }}</p>

          <!-- Preview Visual -->
          <div class="aspect-video rounded-xl overflow-scroll mb-6 relative max-h-auto min-h-[50vh]">
            <ClientPageRenderer 
              :config="selectedTemplate.config"
              mode="template-preview"
              :dark="false"
              :scale="1"
            />
          </div>

          <!-- Sections List -->
          <div class="mb-6">
            <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Secciones incluidas</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div
                v-for="(section, i) in selectedTemplate.sections"
                :key="section"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
              >
                <span class="size-5 rounded-md bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {{ i + 1 }}
                </span>
                <span class="text-sm text-slate-700 dark:text-slate-300 truncate">{{ section }}</span>
              </div>
            </div>
          </div>

          <!-- Warning -->
          <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div class="flex gap-3">
              <UIcon name="i-lucide-alert-triangle" class="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">Reemplazo completo</p>
                <p class="text-sm text-amber-700 dark:text-amber-400/80 mt-0.5">
                  Esta plantilla reemplazará toda la configuración actual (secciones, header, categorías, estilos, marca, navbar, footer). Podrás modificar cada sección después.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <UButton color="neutral" variant="outline" label="Cancelar" @click="showPreview = false" />
            <UButton
              color="primary"
              size="lg"
              :label="applying ? 'Aplicando...' : 'Aplicar plantilla'"
              :loading="applying"
              icon="i-lucide-check"
              @click="handleApply(selectedTemplate)"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
