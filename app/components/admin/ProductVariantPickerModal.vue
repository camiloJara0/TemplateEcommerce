<script setup lang="ts">
import { getSectionPreview, getSectionPreviews } from '~/lib/sectionPreviews'

export interface ProductVariantOption {
  key: string
  label: string
  description: string
}

const props = defineProps<{
  open: boolean
  sectionLabel: string
  sectionType: string
  variants: ProductVariantOption[]
  currentVariant: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [variant: string]
}>()

const selectedVariant = ref(props.currentVariant)

watch(() => props.currentVariant, (val) => { selectedVariant.value = val })
watch(() => props.open, (val) => { if (val) selectedVariant.value = props.currentVariant })

function close() { emit('update:open', false) }

function selectVariant(key: string) {
  selectedVariant.value = key
  emit('select', key)
  close()
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-9999 flex items-end sm:items-center justify-center" @click="onOverlayClick">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div class="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
          <!-- Header -->
          <div class="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{{ sectionLabel }}</h2>
              <button class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="close">
                <UIcon name="i-lucide-x" class="size-4 text-slate-400" />
              </button>
            </div>
            <p class="text-xs text-slate-500">Selecciona un estilo para esta sección</p>
          </div>

          <!-- Variants grid -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="variant in variants"
                :key="variant.key"
                class="group relative rounded-xl border-2 overflow-hidden transition-all duration-200 text-left"
                :class="selectedVariant === variant.key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-md shadow-primary-200/50 dark:shadow-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg'"
                @click="selectVariant(variant.key)"
              >
                <!-- SVG Preview -->
                <div class="w-full aspect-16/10 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <div
                    v-if="getSectionPreview(sectionType, variant.key)"
                    class="w-full h-full"
                    v-html="getSectionPreview(sectionType, variant.key)?.svg"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <UIcon name="i-lucide-layout-template" class="size-8 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>

                <!-- Label -->
                <div class="px-3 py-2.5 flex items-center gap-2">
                  <div
                    class="size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                    :class="selectedVariant === variant.key
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300 dark:border-slate-600'"
                  >
                    <div v-if="selectedVariant === variant.key" class="size-1.5 rounded-full bg-white" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ variant.label }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ variant.description }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
</style>
