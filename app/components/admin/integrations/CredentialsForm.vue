<script setup lang="ts">
import type { IntegrationProviderField } from '~/types/integrations'

const props = defineProps<{
  fields: Record<string, IntegrationProviderField>
  configurado: Record<string, boolean>
  disabled?: boolean
}>()

const credentials = defineModel<Record<string, string>>('credentials', { default: () => ({}) })

const entries = computed(() => Object.entries(props.fields || {}))

function updateValue(key: string, value: string) {
  credentials.value = { ...credentials.value, [key]: value }
}
</script>

<template>
  <div class="space-y-4">
    <UField
      v-for="[key, field] in entries"
      :key="key"
      :label="field.label"
      :required="field.required"
      :hint="configurado[key] ? 'Guardado — deja vacío para no cambiar' : undefined"
    >
      <div class="w-full max-w-md space-y-1">
        <UInput
          :type="field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'"
          :placeholder="configurado[key] ? '••••••••' : field.placeholder"
          :value="credentials[key] ?? ''"
          :disabled="disabled"
          class="w-full"
          autocomplete="off"
          @update:model-value="updateValue(key, String($event ?? ''))"
        />
        <p
          v-if="configurado[key]"
          class="text-[11px] text-theme-muted flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-check-circle-2"
            class="size-3 text-success"
          />
          Credencial configurada
        </p>
      </div>
    </UField>
  </div>
</template>
