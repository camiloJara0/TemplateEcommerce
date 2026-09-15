<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'
import { getTemplateCategories, type Template } from '~/lib/templates'

const emit = defineEmits<{
  applyTemplate: [config: TiendaConfig]
}>()

const templates = getTemplateCategories()

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ecommerce: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    moda: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    gourmet: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    tecnologia: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    deportes: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }
  return colors[category] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    basico: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    intermedio: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    avanzado: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  }
  return colors[difficulty] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const selectedTemplate = ref<Template | null>(null)
const showPreview = ref(false)
const applying = ref(false)

function openPreview(template: Template) {
  selectedTemplate.value = template
  showPreview.value = true
}

function handleApply(template: Template) {
  if (!confirm(`¿Aplicar plantilla "${template.name}"? Esto reemplazará toda la configuración actual.`)) return
  applying.value = true
  setTimeout(() => {
    emit('applyTemplate', JSON.parse(JSON.stringify(template.config)))
    applying.value = false
    showPreview.value = false
  }, 800)
}
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Header -->
    <div>
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Plantillas</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Selecciona una plantilla para personalizar tu tienda. Puedes modificar cada sección después.
      </p>
    </div>

    <!-- Template Grid -->
    <div class="space-y-3">
      <div
        v-for="category in templates"
        :key="category.key"
        class="space-y-2"
      >
        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ category.label }}</h4>
        <div class="space-y-2">
          <div
            v-for="template in category.items"
            :key="template.id"
            class="group relative rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-200 overflow-hidden bg-white dark:bg-slate-800/50 hover:shadow-md cursor-pointer"
            @click="openPreview(template)"
          >
            <!-- Template Image -->
            <div class="aspect-video bg-linear-to-br" :class="template.gradient">
              <div class="w-full h-full flex items-center justify-center">
                <div class="text-center p-4">
                  <div class="w-12 h-12 mx-auto rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <UIcon :name="template.icon" class="size-6 text-white" />
                  </div>
                  <span class="text-sm font-medium text-white/90">{{ template.name }}</span>
                </div>
              </div>
            </div>

            <!-- Template Info -->
            <div class="p-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ template.name }}
                  </h5>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {{ template.description }}
                  </p>
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap items-center gap-1.5 mt-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                  :class="getCategoryColor(template.category)"
                >
                  {{ template.categoryLabel }}
                </span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                  :class="getDifficultyColor(template.difficulty)"
                >
                  {{ template.difficultyLabel }}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {{ template.sectionCount }} secciones
                </span>
              </div>

              <!-- Apply Button -->
              <button
                class="w-full mt-3 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                @click.stop="handleApply(template)"
                :disabled="applying"
              >
                {{ applying ? 'Aplicando...' : 'Aplicar plantilla' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <UModal v-model:open="showPreview" :ui="{ content: 'max-w-4xl max-h-[90vh]' }">
      <template #content>
        <div v-if="selectedTemplate" class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">
                {{ selectedTemplate.name }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ selectedTemplate.description }}</p>
            </div>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="showPreview = false" />
          </div>

          <!-- Preview placeholder -->
          <div class="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div class="w-full h-full bg-linear-to-br" :class="selectedTemplate.gradient">
              <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <UIcon :name="selectedTemplate.icon" class="size-8 text-white" />
                  </div>
                  <span class="text-lg font-semibold text-white/90">{{ selectedTemplate.name }}</span>
                  <p class="text-sm text-white/70 mt-1">{{ selectedTemplate.sectionCount }} secciones incluidas</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section List -->
          <div class="mt-4">
            <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secciones incluidas:</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="section in selectedTemplate.sections"
                :key="section"
                class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                {{ section }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 mt-6">
            <UButton color="neutral" variant="outline" label="Cancelar" @click="showPreview = false" />
            <UButton
              color="primary"
              label="Aplicar plantilla"
              :loading="applying"
              @click="handleApply(selectedTemplate)"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
