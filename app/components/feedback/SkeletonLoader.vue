<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'card' | 'list' | 'table' | 'metrics' | 'product' | 'text'
  count?: number
}>(), {
  variant: 'card',
  count: 1
})
</script>

<template>
  <div
    class="w-full"
    role="status"
    aria-label="Cargando contenido"
  >
    <!-- Metrics -->
    <div
      v-if="variant === 'metrics'"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="i in count"
        :key="i"
        class="surface p-5 space-y-3"
      >
        <USkeleton class="h-4 w-24" />
        <USkeleton class="h-8 w-32" />
        <USkeleton class="h-3 w-20" />
      </div>
    </div>

    <!-- Product grid cards -->
    <div
      v-else-if="variant === 'product'"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      <div
        v-for="i in count"
        :key="i"
        class="surface overflow-hidden"
      >
        <USkeleton class="aspect-square w-full rounded-none" />
        <div class="p-4 space-y-2">
          <USkeleton class="h-3 w-16" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-5 w-24" />
        </div>
      </div>
    </div>

    <!-- List -->
    <div
      v-else-if="variant === 'list'"
      class="space-y-3"
    >
      <div
        v-for="i in count"
        :key="i"
        class="flex items-center gap-3 p-3"
      >
        <USkeleton class="size-10 rounded-full shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-2/3" />
          <USkeleton class="h-3 w-1/3" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div
      v-else-if="variant === 'table'"
      class="surface overflow-hidden"
    >
      <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-4">
        <USkeleton
          v-for="i in 5"
          :key="i"
          class="h-3 flex-1"
        />
      </div>
      <div
        v-for="i in count"
        :key="i"
        class="px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 flex gap-4"
      >
        <USkeleton
          v-for="j in 5"
          :key="j"
          class="h-4 flex-1"
        />
      </div>
    </div>

    <!-- Text -->
    <div
      v-else-if="variant === 'text'"
      class="space-y-2"
    >
      <USkeleton
        v-for="i in count"
        :key="i"
        class="h-4"
        :class="i === count ? 'w-2/3' : 'w-full'"
      />
    </div>

    <!-- Card default -->
    <div
      v-else
      class="grid gap-4"
      :class="count > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''"
    >
      <div
        v-for="i in count"
        :key="i"
        class="surface p-5 space-y-4"
      >
        <USkeleton class="h-40 w-full" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-1/2" />
      </div>
    </div>

    <span class="sr-only">Cargando…</span>
  </div>
</template>
