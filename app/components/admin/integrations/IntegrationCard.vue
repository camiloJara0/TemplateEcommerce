<script setup lang="ts">
import type { Integration } from '~/types/integrations'

defineProps<{
  integration: Integration
  busy?: boolean
}>()

const emit = defineEmits<{
  probar: []
  activar: []
  desactivar: []
  sincronizar: []
  ver: []
  eliminar: []
}>()

const { date } = useFormat()

const capabilityIcons: Record<string, string> = {
  productos: 'i-lucide-package',
  inventario: 'i-lucide-warehouse',
  pedidos: 'i-lucide-shopping-bag',
  clientes: 'i-lucide-users',
  login: 'i-lucide-log-in'
}

function capabilityLabel(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}
</script>

<template>
  <div class="surface rounded-2xl border border-theme overflow-hidden transition-all duration-200 hover:shadow-sm">
    <div class="p-5 flex items-start gap-4">
      <div class="w-12 h-12 rounded-xl bg-theme-imagenes text-theme-brand flex items-center justify-center shrink-0">
        <UIcon
          name="i-lucide-plug-zap"
          class="size-6"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="font-semibold text-theme truncate">
            {{ integration.nombre }}
          </p>
          <AdminIntegrationsSyncStatusBadge :estado="integration.estado" />
          <UBadge
            v-if="integration.provider_info.version"
            :label="`v${integration.provider_info.version}`"
            color="neutral"
            variant="subtle"
            size="sm"
          />
        </div>
        <p class="text-xs text-theme-muted mt-0.5">
          {{ integration.provider_info.label }}
          <template v-if="integration.provider_info.description">
            · {{ integration.provider_info.description }}
          </template>
        </p>

        <div class="flex items-center gap-2 flex-wrap mt-2.5">
          <span
            v-for="cap in integration.provider_info.capabilities"
            :key="cap"
            class="inline-flex items-center gap-1 rounded-full bg-theme-imagenes px-2 py-0.5 text-[11px] text-theme-muted"
          >
            <UIcon
              :name="capabilityIcons[cap] || 'i-lucide-circle-dot'"
              class="size-3"
            />
            {{ capabilityLabel(cap) }}
          </span>
        </div>

        <div class="mt-3 flex items-center gap-4 text-xs text-theme-muted">
          <span class="inline-flex items-center gap-1">
            <UIcon
              name="i-lucide-clock"
              class="size-3.5"
            />
            Última sync:
            <template v-if="integration.ultimo_sincronizado">{{ date(integration.ultimo_sincronizado) }}</template>
            <template v-else>nunca</template>
          </span>
          <span
            v-if="integration.ultima_ejecucion"
            class="inline-flex items-center gap-1"
          >
            <UIcon
              name="i-lucide-list-checks"
              class="size-3.5"
            />
            {{ integration.ultima_ejecucion.creados }} creados ·
            {{ integration.ultima_ejecucion.actualizados }} actualizados ·
            {{ integration.ultima_ejecucion.errores }} errores
          </span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2 shrink-0">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-zap"
            variant="ghost"
            color="neutral"
            size="xs"
            aria-label="Probar conexión"
            :loading="busy"
            @click="emit('probar')"
          />
          <UButton
            v-if="integration.activa"
            icon="i-lucide-pause"
            variant="ghost"
            color="warning"
            size="xs"
            aria-label="Desactivar"
            :loading="busy"
            @click="emit('desactivar')"
          />
          <UButton
            v-else
            icon="i-lucide-play"
            variant="ghost"
            color="success"
            size="xs"
            aria-label="Activar"
            :loading="busy"
            :disabled="!integration.configurado"
            @click="emit('activar')"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            variant="ghost"
            color="primary"
            size="xs"
            aria-label="Sincronizar ahora"
            :loading="busy"
            :disabled="!integration.activa || !integration.configurado"
            @click="emit('sincronizar')"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            size="xs"
            aria-label="Eliminar"
            :loading="busy"
            @click="emit('eliminar')"
          />
        </div>
        <UButton
          label="Configurar"
          icon="i-lucide-settings-2"
          variant="subtle"
          color="neutral"
          size="xs"
          @click="emit('ver')"
        />
      </div>
    </div>
  </div>
</template>
