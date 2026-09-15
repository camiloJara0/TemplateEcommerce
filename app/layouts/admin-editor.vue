<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="admin-scope min-h-dvh flex flex-col bg-slate-50 dark:bg-slate-950 m-0 p-5">
    <slot />
  </div>
</template>
