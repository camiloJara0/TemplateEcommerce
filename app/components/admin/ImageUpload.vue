<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
  label?: string
  folder?: string
  accept?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { upload, uploading } = useImageUpload()
const inputRef = ref<HTMLInputElement | null>(null)
const urlMode = ref(!props.modelValue)

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await upload(file, props.folder ?? 'sections')
  if (result) {
    emit('update:modelValue', result.url)
  }
  input.value = ''
}

function onUrlInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.trim()
  emit('update:modelValue', val || null)
}

function clear() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-xs font-medium text-slate-500">{{ label }}</label>

    <!-- Preview -->
    <div v-if="modelValue" class="relative group rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 h-32">
      <img :src="modelValue" alt="" class="w-full h-full object-cover" />
      <button
        class="absolute top-2 right-2 size-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        @click="clear"
      >
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </div>

    <!-- Input modes -->
    <div class="flex gap-1 text-[10px] font-medium">
      <button
        class="px-2 py-1 rounded transition-colors"
        :class="urlMode ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-slate-400 hover:text-slate-600'"
        @click="urlMode = true"
      >
        URL
      </button>
      <button
        class="px-2 py-1 rounded transition-colors"
        :class="!urlMode ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-slate-400 hover:text-slate-600'"
        @click="urlMode = false; inputRef?.click()"
      >
        Subir
      </button>
    </div>

    <!-- URL input -->
    <input
      v-if="urlMode"
      type="url"
      :value="modelValue ?? ''"
      placeholder="https://ejemplo.com/imagen.jpg"
      class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
      @input="onUrlInput"
    />

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      type="file"
      :accept="accept ?? 'image/*'"
      class="hidden"
      @change="onFileChange"
    />

    <!-- Upload indicator -->
    <p v-if="uploading" class="text-xs text-brand-500 flex items-center gap-1.5">
      <UIcon name="i-lucide-loader-2" class="size-3 animate-spin" />
      Subiendo...
    </p>
  </div>
</template>
