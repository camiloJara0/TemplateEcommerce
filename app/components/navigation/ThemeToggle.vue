<script setup lang="ts">
const { mode, setMode } = useThemeMode()

const items = [
  [
    {
      label: 'Claro',
      icon: 'i-lucide-sun',
      onSelect: () => setMode('light')
    },
    {
      label: 'Oscuro',
      icon: 'i-lucide-moon',
      onSelect: () => setMode('dark')
    },
    {
      label: 'Sistema',
      icon: 'i-lucide-monitor',
      onSelect: () => setMode('system')
    }
  ]
]

const currentIcon = computed(() => {
  if (mode.value === 'dark') return 'i-lucide-moon'
  if (mode.value === 'light') return 'i-lucide-sun'
  return 'i-lucide-monitor'
})
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      :icon="currentIcon"
      color="neutral"
      variant="ghost"
      size="sm"
      aria-label="Cambiar tema"
      class="rounded-xl"
    />
  </UDropdownMenu>
</template>
