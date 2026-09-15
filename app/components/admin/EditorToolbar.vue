<script setup lang="ts">
interface Props {
  hasChanges: boolean
  saving: boolean
  canUndo: boolean
  canRedo: boolean
  fullscreen?: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  save: []
  back: []
  preview: []
  undo: []
  redo: []
  expand: []
  'toggle-fullscreen': []
}>()
</script>

<template>
  <div class="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 gap-2 shrink-0">
    <!-- Back -->
    <UButton
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-xl"
      @click="emit('back')"
    />

    <!-- Fullscreen toggle -->
    <UButton
      :icon="fullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-xl"
      @click="emit('toggle-fullscreen')"
    />

    <div class="w-px h-5 bg-slate-200 dark:bg-slate-800" />

    <!-- Undo / Redo -->
    <UButton
      icon="i-lucide-undo-2"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-xl"
      :disabled="!canUndo"
      @click="emit('undo')"
    />
    <UButton
      icon="i-lucide-redo-2"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-xl"
      :disabled="!canRedo"
      @click="emit('redo')"
    />

    <div class="w-px h-5 bg-slate-200 dark:bg-slate-800" />

    <!-- Title -->
    <div class="flex-1">
      <p class="text-sm font-semibold text-slate-900 dark:text-white">
        Editor de tienda
      </p>
    </div>

    <!-- Status -->
    <UBadge
      v-if="hasChanges"
      label="Sin guardar"
      color="warning"
      variant="subtle"
      size="sm"
    />
    <UBadge
      v-else
      label="Guardado"
      color="success"
      variant="subtle"
      size="sm"
    />

    <!-- Save -->
    <UButton
      icon="i-lucide-save"
      color="primary"
      size="sm"
      label="Guardar"
      :loading="saving"
      :disabled="!hasChanges"
      class="rounded-xl"
      @click="emit('save')"
    />
  </div>
</template>
