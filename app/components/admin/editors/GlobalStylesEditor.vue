<script setup lang="ts">
import type { GlobalStyles } from '~/types/store'

const props = defineProps<{ value: GlobalStyles }>()
const emit = defineEmits<{ update: [value: GlobalStyles] }>()

function updateGroup(group: 'tipografia' | 'colores' | 'paleta' | 'fondos' | 'borders' | 'spacing', field: string, val: unknown) {
  emit('update', {
    ...props.value,
    [group]: { ...props.value[group], [field]: val }
  } as GlobalStyles)
}

const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'System', value: 'system-ui' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
]

const radiusOptions = [
  { label: 'Ninguno', value: '0' },
  { label: 'Pequeño (0.25rem)', value: '0.25rem' },
  { label: 'Medio (0.5rem)', value: '0.5rem' },
  { label: 'Normal (0.75rem)', value: '0.75rem' },
  { label: 'Grande (1rem)', value: '1rem' },
  { label: 'XL (1.5rem)', value: '1.5rem' },
  { label: '2XL (2rem)', value: '2rem' },
]

const spacingOptions = [
  { label: 'Pequeño (3rem)', value: '3rem' },
  { label: 'Normal (5rem)', value: '5rem' },
  { label: 'Grande (7rem)', value: '7rem' },
  { label: 'XL (10rem)', value: '10rem' },
]

const containerOptions = [
  { label: 'Estrecho (64rem)', value: '64rem' },
  { label: 'Normal (80rem)', value: '80rem' },
  { label: 'Ancho (96rem)', value: '96rem' },
  { label: 'Sin límite', value: '100%' },
]

const tipoFondoOptions = [
  { label: 'Color sólido', value: 'solid' },
  { label: 'Degradado', value: 'gradient' },
]

const gradienteDirOptions = [
  { label: '→ Derecha', value: 'to-r' },
  { label: '↘ Diagonal', value: 'to-br' },
  { label: '↓ Abajo', value: 'to-b' },
  { label: '↙ Diagonal invertida', value: 'to-bl' },
  { label: '← Izquierda', value: 'to-l' },
]

function ColorPicker(field: string, label: string, group: 'colores' | 'fondos' = 'colores') {
  return { field, label, group }
}

const colorFields = [
  { field: 'primario', label: 'Color primario', group: 'colores' as const },
  { field: 'secundario', label: 'Color secundario', group: 'colores' as const },
  { field: 'fondo', label: 'Color de fondo', group: 'colores' as const },
  { field: 'accent', label: 'Color accent', group: 'colores' as const },
]

const fondosFields = [
  { field: 'fondo_principal', label: 'Fondo principal (claro)' },
  { field: 'fondo_principal_dark', label: 'Fondo principal (oscuro)' },
  { field: 'fondo_imagenes', label: 'Fondo imágenes (claro)' },
  { field: 'fondo_imagenes_dark', label: 'Fondo imágenes (oscuro)' },
  { field: 'fondo_componentes', label: 'Fondo componentes (claro)' },
  { field: 'fondo_componentes_dark', label: 'Fondo componentes (oscuro)' },
]

const gradFields = [
  { field: 'gradiente_from', label: 'Degradado inicio' },
  { field: 'gradiente_via', label: 'Degradado medio' },
  { field: 'gradiente_to', label: 'Degradado fin' },
]

const paletaPairs = [
  { label: 'Texto principal', light: 'texto_principal_claro', dark: 'texto_principal_oscuro' },
  { label: 'Texto secundario', light: 'texto_secundario_claro', dark: 'texto_secundario_oscuro' },
  { label: 'Texto muted', light: 'texto_muted_claro', dark: 'texto_muted_oscuro' },
  { label: 'Borde', light: 'borde_claro', dark: 'borde_oscuro' },
  { label: 'Superficie (cards)', light: 'superficie_claro', dark: 'superficie_oscuro' },
  { label: 'Fondo alterno', light: 'fondo_alt_claro', dark: 'fondo_alt_oscuro' },
  { label: 'Marca', light: 'marca_claro', dark: 'marca_oscuro' },
  { label: 'Marca hover', light: 'marca_hover_claro', dark: 'marca_hover_oscuro' },
  { label: 'Acento', light: 'acento_claro', dark: 'acento_oscuro' },
  { label: 'Texto sobre marca', light: 'texto_sobre_marca_claro', dark: 'texto_sobre_marca_oscuro' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Tipografía -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tipografía</p>

      <USelect
        :model-value="value.tipografia.font_family"
        :items="fontOptions"
        label="Familia tipográfica"
        @update:model-value="updateGroup('tipografia', 'font_family', String($event))"
      />

      <UiBaseInput
        :model-value="value.tipografia.heading_weight"
        label="Peso de headings"
        type="number"
        @update:model-value="updateGroup('tipografia', 'heading_weight', Number($event))"
      />

      <UiBaseInput
        :model-value="value.tipografia.base_size"
        label="Tamaño base (px)"
        type="number"
        @update:model-value="updateGroup('tipografia', 'base_size', Number($event))"
      />
    </div>

    <!-- Colores -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Colores</p>

      <div v-for="c in colorFields" :key="c.field" class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ c.label }}</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="(value[c.group] as Record<string, string>)[c.field]"
            class="size-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            @input="updateGroup(c.group, c.field, ($event.target as HTMLInputElement).value)"
          />
          <UiBaseInput
            :model-value="(value[c.group] as Record<string, string>)[c.field]"
            class="flex-1"
            @update:model-value="updateGroup(c.group, c.field, String($event))"
          />
        </div>
      </div>
    </div>

    <!-- Fondos y Tema -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fondos y tema</p>

      <USelect
        :model-value="value.fondos.tipo_fondo"
        :items="tipoFondoOptions"
        label="Tipo de fondo"
        @update:model-value="updateGroup('fondos', 'tipo_fondo', String($event))"
      />

      <div v-for="f in fondosFields" :key="f.field" class="space-y-2">
        <label class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ f.label }}</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="value.fondos[f.field as keyof typeof value.fondos] as string"
            class="size-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            @input="updateGroup('fondos', f.field, ($event.target as HTMLInputElement).value)"
          />
          <UiBaseInput
            :model-value="value.fondos[f.field as keyof typeof value.fondos] as string"
            class="flex-1"
            @update:model-value="updateGroup('fondos', f.field, String($event))"
          />
        </div>
      </div>

      <!-- Gradient config (only when tipo_fondo === 'gradient') -->
      <template v-if="value.fondos.tipo_fondo === 'gradient'">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-4">Configuración de degradado</p>

        <div v-for="g in gradFields" :key="g.field" class="space-y-2">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ g.label }}</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="value.fondos[g.field as keyof typeof value.fondos] as string"
              class="size-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              @input="updateGroup('fondos', g.field, ($event.target as HTMLInputElement).value)"
            />
            <UiBaseInput
              :model-value="value.fondos[g.field as keyof typeof value.fondos] as string"
              class="flex-1"
              @update:model-value="updateGroup('fondos', g.field, String($event))"
            />
          </div>
        </div>

        <USelect
          :model-value="value.fondos.gradiente_direccion"
          :items="gradienteDirOptions"
          label="Dirección del degradado"
          @update:model-value="updateGroup('fondos', 'gradiente_direccion', String($event))"
        />

        <!-- Preview -->
        <div
          class="h-16 rounded-xl border border-slate-200 dark:border-slate-700"
          :style="{
            background: `linear-gradient(${value.fondos.gradiente_direccion === 'to-r' ? 'to right' : value.fondos.gradiente_direccion === 'to-br' ? 'to bottom right' : value.fondos.gradiente_direccion === 'to-b' ? 'to bottom' : value.fondos.gradiente_direccion === 'to-bl' ? 'to bottom left' : 'to left'}, ${value.fondos.gradiente_from}, ${value.fondos.gradiente_via}, ${value.fondos.gradiente_to})`
          }"
        />
      </template>
    </div>

    <!-- Paleta semántica -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paleta semántica</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Colores que usan todos los textos, bordes e iconos. Define claro y oscuro para evitar contrastes rotos con fondos personalizados.
      </p>

      <div
        v-for="pair in paletaPairs"
        :key="pair.label"
        class="grid grid-cols-2 gap-3"
      >
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ pair.label }} · claro</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="value.paleta[pair.light as keyof typeof value.paleta]"
              class="size-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              @input="updateGroup('paleta', pair.light, ($event.target as HTMLInputElement).value)"
            >
            <UiBaseInput
              :model-value="value.paleta[pair.light as keyof typeof value.paleta]"
              class="flex-1"
              @update:model-value="updateGroup('paleta', pair.light, String($event))"
            />
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ pair.label }} · oscuro</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="value.paleta[pair.dark as keyof typeof value.paleta]"
              class="size-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              @input="updateGroup('paleta', pair.dark, ($event.target as HTMLInputElement).value)"
            >
            <UiBaseInput
              :model-value="value.paleta[pair.dark as keyof typeof value.paleta]"
              class="flex-1"
              @update:model-value="updateGroup('paleta', pair.dark, String($event))"
            />
          </div>
        </div>
      </div>

      <!-- Vista previa -->
      <div
        class="mt-2 p-4 rounded-xl border flex items-center justify-between gap-3"
        style="background-color: var(--surface); border-color: var(--border-color); color: var(--text-primary)"
      >
        <span class="text-sm font-medium" style="color: var(--text-primary)">Vista previa de la paleta</span>
        <span class="text-xs" style="color: var(--text-muted)">Texto muted</span>
        <span class="size-6 rounded-full" style="background-color: var(--color-brand)" />
        <span class="size-6 rounded-full" style="background-color: var(--color-accent)" />
      </div>
    </div>

    <!-- Bordes -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bordes</p>

      <USelect
        :model-value="value.borders.radius_global"
        :items="radiusOptions"
        label="Radio global"
        @update:model-value="updateGroup('borders', 'radius_global', String($event))"
      />

      <USelect
        :model-value="value.borders.radius_buttons"
        :items="radiusOptions"
        label="Radio de botones"
        @update:model-value="updateGroup('borders', 'radius_buttons', String($event))"
      />

      <USelect
        :model-value="value.borders.radius_cards"
        :items="radiusOptions"
        label="Radio de cards"
        @update:model-value="updateGroup('borders', 'radius_cards', String($event))"
      />
    </div>

    <!-- Spacing -->
    <div class="space-y-3">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Espaciado</p>

      <USelect
        :model-value="value.spacing.section_padding"
        :items="spacingOptions"
        label="Padding de secciones"
        @update:model-value="updateGroup('spacing', 'section_padding', String($event))"
      />

      <USelect
        :model-value="value.spacing.container_max"
        :items="containerOptions"
        label="Ancho máximo del contenedor"
        @update:model-value="updateGroup('spacing', 'container_max', String($event))"
      />
    </div>
  </div>
</template>
