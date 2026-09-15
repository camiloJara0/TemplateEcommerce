<script setup lang="ts">
import type { SectionKey, SectionDefinition } from '~/types/store'
import { SECTION_META } from '~/types/store'
import { SECTION_DEFINITIONS } from '~/lib/SectionRegistry'
import { getSectionPreview, getSectionPreviews } from '~/lib/sectionPreviews'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [type: SectionKey, variant: string]
}>()

const search = ref('')
const activeCategory = ref('all')
const expandedCard = ref<string | null>(null)
const selectedVariant = ref<Record<string, string>>({})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = ref('')
watch(search, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { debouncedSearch.value = val }, 300)
})

const categories = [
  { key: 'all', label: 'Todos' },
  { key: 'hero', label: 'Hero' },
  { key: 'content', label: 'Contenido' },
  { key: 'conversion', label: 'Conversión' },
  { key: 'social', label: 'Social' },
  { key: 'media', label: 'Media' },
  { key: 'layout', label: 'Layout' },
] as const

const categoryBadgeColors: Record<string, string> = {
  hero: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  content: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  conversion: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  media: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  layout: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
}

const filteredSections = computed(() => {
  let sections = SECTION_DEFINITIONS.filter(d => !d.isSpecial && !d.type.startsWith('_'))
  if (activeCategory.value !== 'all') {
    sections = sections.filter(d => d.category === activeCategory.value)
  }
  const q = debouncedSearch.value.toLowerCase().trim()
  if (q) {
    sections = sections.filter(d =>
      d.label.toLowerCase().includes(q)
      || d.variants.some(v => v.label.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
    )
  }
  return sections
})

const totalCount = computed(() =>
  SECTION_DEFINITIONS.filter(d => !d.isSpecial && !d.type.startsWith('_')).length
)

function close() { emit('update:open', false) }

function handleSelect(def: SectionDefinition) {
  if (def.variants.length === 1) {
    emit('select', def.type, def.variants[0]!.key)
    close()
  } else {
    expandedCard.value = expandedCard.value === def.type ? null : def.type
    if (!selectedVariant.value[def.type]) {
      selectedVariant.value[def.type] = def.variants[0]!.key
    }
  }
}

function confirmVariant(def: SectionDefinition) {
  const variant = selectedVariant.value[def.type] ?? def.variants[0]!.key
  emit('select', def.type, variant)
  close()
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

onMounted(() => { search.value = ''; debouncedSearch.value = ''; activeCategory.value = 'all'; expandedCard.value = null })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-9999 flex items-end sm:items-center justify-center" @click="onOverlayClick">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div class="relative z-10 w-full sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-slide-up">
          <!-- Header -->
          <div class="relative px-5 pt-5 pb-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-bold tracking-tight">Agregar sección</h2>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-medium text-slate-400 tabular-nums">{{ filteredSections.length }} de {{ totalCount }}</span>
                <button class="p-1.5 rounded-lg hover:bg-white/10 transition-colors" @click="close">
                  <UIcon name="i-lucide-x" class="size-4" />
                </button>
              </div>
            </div>

            <div class="relative">
              <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                v-model="search"
                type="text"
                placeholder="Buscar sección..."
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              >
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="px-5 pt-3 pb-1 border-b border-slate-200 dark:border-slate-700/50 shrink-0 overflow-x-auto scrollbar-none">
            <div class="flex gap-1 min-w-max">
              <button
                v-for="cat in categories"
                :key="cat.key"
                class="relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap"
                :class="activeCategory === cat.key
                  ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'"
                @click="activeCategory = cat.key"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Grid -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-4">
            <div v-if="filteredSections.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <UIcon name="i-lucide-search-x" class="size-10 mb-3 opacity-50" />
              <p class="text-sm font-medium">No se encontraron secciones</p>
              <p class="text-xs mt-1">Intenta con otro término o categoría</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="def in filteredSections"
                :key="def.type"
                class="group relative rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600"
                @click="handleSelect(def)"
              >
                <!-- SVG Preview -->
                <div class="relative w-full aspect-16/10 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <div
                    v-if="getSectionPreview(def.type, selectedVariant[def.type])"
                    class="w-full h-full"
                    v-html="getSectionPreview(def.type, selectedVariant[def.type])?.svg"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                    <div class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <UIcon :name="def.icon" class="size-5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>
                  <span v-if="def.variants.length > 1" class="absolute top-2 right-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    {{ def.variants.length }} variantes
                  </span>
                </div>

                <!-- Info -->
                <div class="p-3">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{{ def.label }}</h3>
                    <span class="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md" :class="categoryBadgeColors[def.category]">
                      {{ categories.find(c => c.key === def.category)?.label }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {{ def.variants[0]?.description }}
                  </p>
                </div>

                <!-- Inline variant picker with previews -->
                <Transition name="expand">
                  <div v-if="expandedCard === def.type && def.variants.length > 1" class="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 px-3 py-3">
                    <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Elegir variante</p>
                    <div class="space-y-1.5">
                      <label
                        v-for="variant in def.variants"
                        :key="variant.key"
                        class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all"
                        :class="selectedVariant[def.type] === variant.key
                          ? 'bg-brand-50 dark:bg-brand-950/50 ring-1 ring-brand-200 dark:ring-brand-800'
                          : 'hover:bg-white dark:hover:bg-slate-700/50'"
                        @click.stop="selectedVariant[def.type] = variant.key"
                      >
                        <!-- Variant mini preview -->
                        <div class="w-12 h-8 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                          <div
                            v-if="getSectionPreview(def.type, variant.key)"
                            class="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                            v-html="getSectionPreview(def.type, variant.key)?.svg"
                          />
                          <div v-else class="w-full h-full flex items-center justify-center">
                            <UIcon :name="def.icon" class="size-3 text-slate-400" />
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-slate-800 dark:text-slate-200">{{ variant.label }}</p>
                          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ variant.description }}</p>
                        </div>
                        <div
                          class="size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                          :class="selectedVariant[def.type] === variant.key
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-slate-300 dark:border-slate-600'"
                        >
                          <div v-if="selectedVariant[def.type] === variant.key" class="size-1.5 rounded-full bg-white" />
                        </div>
                      </label>
                    </div>
                    <button
                      class="mt-2.5 w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
                      @click.stop="confirmVariant(def)"
                    >
                      Agregar
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-enter-active { transition: opacity 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal-enter-active .relative.z-10 { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active .relative.z-10 { animation: slideDown 0.2s ease-in; }

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideDown {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(40px); opacity: 0; }
}

.expand-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; }
.expand-leave-active { transition: all 0.2s ease-in; overflow: hidden; }
.expand-enter-from { max-height: 0; opacity: 0; }
.expand-enter-to { max-height: 400px; opacity: 1; }
.expand-leave-from { max-height: 400px; opacity: 1; }
.expand-leave-to { max-height: 0; opacity: 0; }
</style>
