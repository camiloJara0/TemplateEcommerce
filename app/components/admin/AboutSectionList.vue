<script setup lang="ts">
import type { AboutSectionKey } from '~/types/store'
import { ABOUT_SECTION_META } from '~/types/store'

const selected = defineModel<AboutSectionKey>('selected', { required: true })
const collapsed = ref(false)
</script>

<template>
  <div class="select-none">
    <!-- Toggle header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      @click="collapsed = !collapsed"
    >
      <span>Secciones Sobre Nosotros</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5 transition-transform duration-300 ease-out"
        :class="collapsed ? '-rotate-90' : 'rotate-0'"
      />
    </button>

    <!-- Collapsible content -->
    <div
      class="overflow-hidden transition-all duration-300 ease-out"
      :style="{ maxHeight: collapsed ? '0px' : '500px', opacity: collapsed ? 0 : 1 }"
    >
      <div class="px-3 pb-3 space-y-1">
        <button
          v-for="(meta, key) in ABOUT_SECTION_META"
          :key="key"
          class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
          :class="selected === key
            ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          @click="() => {selected = key; collapsed = true}"
        >
          <UIcon :name="meta.icon" class="size-4 shrink-0" />
          <span class="truncate">{{ meta.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
