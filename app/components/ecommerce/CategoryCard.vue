<script setup lang="ts">
import type { Category } from '~/types/catalog'

const props = defineProps<{
  category: Category
  count?: number
}>()

const icons: Record<string, string> = {
  electronica: 'i-lucide-cpu',
  moda: 'i-lucide-shirt',
  hogar: 'i-lucide-home',
  deportes: 'i-lucide-dumbbell',
  belleza: 'i-lucide-sparkles',
  tecnologia: 'i-lucide-monitor-smartphone'
}

const icon = computed(() => icons[props.category.slug ?? ''] ?? 'i-lucide-tag')
</script>

<template>
  <NuxtLink
    :to="`/catalogo?categoria=${category.slug}`"
    class="surface-interactive group p-5 sm:p-6 flex flex-col items-start gap-4 focus-ring"
  >
    <div class="size-12 rounded-2xl bg-theme-imagenes flex items-center justify-center transition-colors duration-200 group-hover:bg-theme-imagenes dark:group-hover:bg-theme-imagenes">
      <UIcon
        :name="icon"
        class="size-6 text-theme-brand"
      />
    </div>
    <div>
      <h3 class="font-semibold text-theme group-hover:text-theme-brand transition-colors">
        {{ category.name }}
      </h3>
      <p
        v-if="count != null"
        class="text-sm text-theme-muted mt-0.5"
      >
        {{ count }} productos
      </p>
      <p
        v-else-if="category.description"
        class="text-sm text-theme-muted mt-0.5 line-clamp-2"
      >
        {{ category.description }}
      </p>
    </div>
  </NuxtLink>
</template>
