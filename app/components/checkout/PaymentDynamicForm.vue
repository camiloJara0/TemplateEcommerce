<script setup lang="ts">
import type { RapydRequiredField } from '~/types/rapyd'

const props = defineProps<{
  fields: RapydRequiredField[]
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function updateField(name: string, value: string) {
  localValue.value = { ...localValue.value, [name]: value }
}

function isRequired(field: RapydRequiredField): boolean {
  return field.is_required === true || field.is_required === 'true'
}

// ── Field label mapping ──────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  number: 'Número de tarjeta',
  expiration_month: 'Mes de expiración',
  expiration_year: 'Año de expiración',
  cvv: 'Código de seguridad (CVV)',
  name: 'Nombre en la tarjeta',
  financial_institution_code: 'Banco',
  person_type: 'Tipo de persona',
  document_type: 'Tipo de documento',
  document_number: 'Número de documento',
  phone_number: 'Número de celular',
  email: 'Correo electrónico',
  amount: 'Monto',
  description: 'Descripción',
  expiration: 'Fecha de expiración',
  date_of_birth: 'Fecha de nacimiento',
}

const FIELD_PLACEHOLDERS: Record<string, string> = {
  number: '0000 0000 0000 0000',
  expiration_month: 'MM',
  expiration_year: 'AA',
  cvv: '***',
  name: 'Como aparece en la tarjeta',
  financial_institution_code: 'Selecciona tu banco',
  document_number: 'Tu número de documento',
  phone_number: '300 123 4567',
  email: 'correo@ejemplo.com',
  date_of_birth: 'DD/MM/AAAA',
}

// ── Banks list for PSE ──────────────────────────────────────

const PSE_BANKS = [
  { value: '1022', label: 'Banco de Bogotá' },
  { value: '1007', label: 'Bancolombia' },
  { value: '1019', label: 'Davivienda' },
  { value: '1023', label: 'Banco de Occidente' },
  { value: '1012', label: 'Banco Popular' },
  { value: '1013', label: 'Banco AV Villas' },
  { value: '1002', label: 'Banco Ganadero' },
  { value: '1006', label: 'Banco Corpbanca' },
  { value: '1025', label: 'Coopcentral' },
  { value: '1032', label: 'Banco Falabella' },
  { value: '1034', label: 'Banco Citi' },
  { value: '1051', label: 'Banco Pichincha' },
  { value: '1053', label: 'Banco Mundo Mujer' },
  { value: '1058', label: 'Banco Blue' },
  { value: '1059', label: 'Scotiabank Colpatria' },
  { value: '1063', label: 'Banco Itaú' },
  { value: '1065', label: 'Banco Multibank' },
  { value: '1069', label: 'Banco Santander' },
  { value: '1070', label: 'Banco Inter' },
]

const PERSON_TYPES = [
  { value: 'N', label: 'Persona natural' },
  { value: 'J', label: 'Persona jurídica' },
]

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'TI', label: 'Tarjeta de identidad' },
]

// ── Card formatting ─────────────────────────────────────────

function onCardNumberInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 16)
  const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
  updateField('number', formatted)
}

function onExpirationInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 4)
  let month = raw.slice(0, 2)
  let year = raw.slice(2)
  if (month.length === 2) {
    const m = parseInt(month)
    if (m > 12) month = '12'
    if (m < 1 && month !== '') month = '01'
  }
  updateField('expiration_month', month)
  // updateField('expiration_year', year)
}

function onCvvInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 4)
  updateField('cvv', raw)
}

function onPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 10)
  updateField('phone_number', raw)
}

function onDigitsInput(e: Event, fieldName: string) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  updateField(fieldName, raw)
}

function getInputMode(field: RapydRequiredField): string {
  if (field.name.includes('number') || field.name === 'cvv' || field.name === 'phone') return 'numeric'
  if (field.name.includes('email')) return 'email'
  return 'text'
}

function shouldUseSelect(field: RapydRequiredField): boolean {
  return field.name === 'financial_institution_code'
    || field.name === 'person_type'
    || field.name === 'document_type'
}

function getSelectOptions(field: RapydRequiredField): Array<{ value: string, label: string }> {
  if (field.name === 'financial_institution_code') return PSE_BANKS
  if (field.name === 'person_type') return PERSON_TYPES
  if (field.name === 'document_type') return DOCUMENT_TYPES
  return []
}
</script>

<template>
  <div class="space-y-4">
    <template v-for="field in fields" :key="field.name">
      <!-- ── Select fields ──────────────────────────────────── -->
      <div v-if="shouldUseSelect(field)">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS[field.name] || field.name }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <select
          :value="localValue[field.name] ?? ''"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
          @change="updateField(field.name, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>{{ FIELD_PLACEHOLDERS[field.name] || 'Seleccionar...' }}</option>
          <option v-for="opt in getSelectOptions(field)" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- ── Card number ────────────────────────────────────── -->
      <div v-else-if="field.name === 'number'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.number }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            :value="localValue.number ?? ''"
            type="text"
            inputmode="numeric"
            :placeholder="FIELD_PLACEHOLDERS.number"
            maxlength="19"
            class="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums tracking-wider"
            @input="onCardNumberInput"
          >
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div class="w-8 h-5 rounded bg-[#1a1f71] flex items-center justify-center">
              <span class="text-[7px] font-bold text-white tracking-wider">VISA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Expiration (MM/YY) ─────────────────────────────── -->
      <div v-else-if="field.name === 'expiration_month'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          Vencimiento
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-3">
          <input
            :value="localValue.expiration_month ?? ''"
            type="text"
            inputmode="numeric"
            placeholder="MM"
            maxlength="2"
            class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 text-center tabular-nums tracking-widest"
            @input="onExpirationInput"
          >
          <input
            :value="localValue.expiration_year ?? ''"
            type="text"
            inputmode="numeric"
            placeholder="AA"
            maxlength="2"
            class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 text-center tabular-nums tracking-widest"
            @input="(e: Event) => updateField('expiration_year', (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2))"
          >
        </div>
      </div>

      <!-- ── CVV ────────────────────────────────────────────── -->
      <div v-else-if="field.name === 'cvv'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.cvv }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.cvv ?? ''"
          type="password"
          inputmode="numeric"
          :placeholder="FIELD_PLACEHOLDERS.cvv"
          maxlength="4"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums tracking-widest"
          @input="onCvvInput"
        >
      </div>

      <!-- ── Cardholder name ────────────────────────────────── -->
      <div v-else-if="field.name === 'name'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.name }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.name ?? ''"
          type="text"
          :placeholder="FIELD_PLACEHOLDERS.name"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- ── Phone number ───────────────────────────────────── -->
      <div v-else-if="field.name === 'phone_number'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.phone_number }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.phone_number ?? ''"
          type="tel"
          inputmode="numeric"
          :placeholder="FIELD_PLACEHOLDERS.phone_number"
          maxlength="10"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums"
          @input="onPhoneInput"
        >
      </div>

      <!-- ── Email ──────────────────────────────────────────── -->
      <div v-else-if="field.name === 'email'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.email }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.email ?? ''"
          type="email"
          :placeholder="FIELD_PLACEHOLDERS.email"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- ── Document number ────────────────────────────────── -->
      <div v-else-if="field.name === 'document_number'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.document_number }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.document_number ?? ''"
          type="text"
          inputmode="numeric"
          :placeholder="FIELD_PLACEHOLDERS.document_number"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200 tabular-nums"
          @input="(e: Event) => onDigitsInput(e, 'document_number')"
        >
      </div>

      <!-- ── Date of birth ──────────────────────────────────── -->
      <div v-else-if="field.name === 'date_of_birth'">
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS.date_of_birth }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue.date_of_birth ?? ''"
          type="date"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
          @input="updateField('date_of_birth', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- ── Generic fallback ───────────────────────────────── -->
      <div v-else>
        <label class="block text-xs font-medium text-theme-secondary mb-1.5">
          {{ FIELD_LABELS[field.name] || field.name }}
          <span v-if="isRequired(field)" class="text-red-500">*</span>
        </label>
        <input
          :value="localValue[field.name] ?? ''"
          :type="field.name.includes('email') ? 'email' : 'text'"
          :inputmode="getInputMode(field)"
          :placeholder="FIELD_PLACEHOLDERS[field.name] || field.description || ''"
          class="w-full px-3.5 py-2.5 rounded-xl border border-theme bg-theme-alt text-theme text-sm placeholder-theme-muted/50 focus:outline-none focus:ring-2 focus:ring-theme-brand/40 focus:border-theme-brand transition-all duration-200"
          @input="updateField(field.name, ($event.target as HTMLInputElement).value)"
        >
        <p v-if="field.description" class="text-[11px] text-theme-muted mt-1">{{ field.description }}</p>
      </div>
    </template>
  </div>
</template>
