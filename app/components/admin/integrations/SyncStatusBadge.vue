<script setup lang="ts">
import type { IntegrationEstado } from '~/types/integrations'

const props = defineProps<{
  estado: IntegrationEstado | string
}>()

const map: Record<string, { label: string, color: 'success' | 'neutral' | 'warning' | 'error' | 'info' }> = {
  sin_credenciales: { label: 'Sin credenciales', color: 'warning' },
  inactiva: { label: 'Inactiva', color: 'neutral' },
  activa: { label: 'Activa', color: 'success' },
  sincronizando: { label: 'Sincronizando', color: 'info' },
  con_errores: { label: 'Con errores', color: 'error' },
  pausada_por_errores: { label: 'Pausada por errores', color: 'error' }
}

const meta = computed(() => map[props.estado] || { label: props.estado, color: 'neutral' as const })
</script>

<template>
  <UBadge
    :label="meta.label"
    :color="meta.color"
    variant="subtle"
    size="sm"
  />
</template>
