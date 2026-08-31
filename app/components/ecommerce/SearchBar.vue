<script setup lang="ts">
const props = withDefaults(defineProps<{
  compact?: boolean
  placeholder?: string
}>(), {
  compact: false,
  placeholder: 'Buscar productos…'
})

const query = defineModel<string>({ default: '' })
const emit = defineEmits<{
  search: [value: string]
}>()

function submit() {
  emit('search', query.value.trim())
  if (query.value.trim()) {
    navigateTo({ path: '/catalogo', query: { q: query.value.trim() } })
  }
}
</script>

<template>
  <form
    class="w-full relative"
    role="search"
    @submit.prevent="submit"
  >
    <UInput
      v-model="query"
      :placeholder="placeholder"
      icon="i-lucide-search"
      :size="compact ? 'sm' : 'md'"
      class="w-full"
      :ui="{ base: 'rounded-xl bg-slate-50 dark:bg-slate-900/80' }"
      aria-label="Buscar productos"
    >
      <template
        v-if="query"
        #trailing
      >
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Limpiar"
          @click="query = ''"
        />
      </template>
    </UInput>
  </form>
</template>
