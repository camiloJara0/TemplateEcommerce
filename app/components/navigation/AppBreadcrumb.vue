<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <UBreadcrumb
    :items="items.map(i => ({
      label: i.label,
      to: i.to,
      icon: i.icon
    }))"
  />
</template>
