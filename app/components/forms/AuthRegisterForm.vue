<script setup lang="ts">
import type { RegisterPayload } from '~/types/api'
import { useAuthService } from '~/composables/services/auth'

interface Props {
  action?: (payload: RegisterPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<RegisterPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Crear cuenta',
  loading: false,
  initial: () => ({ nombre: '', email: '', password: '', password_confirmation: '' })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const submitLoading = ref(false)
const { form, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'nombre', label: 'Nombre', required: true, minLength: 2, maxLength: 120 },
  { key: 'email', label: 'Email', required: true, isEmail: true },
  { key: 'password', label: 'Contraseña', required: true, minLength: 8 },
  { key: 'password_confirmation', label: 'Confirmar contraseña', required: true, match: 'password' }
])

setForm({ ...props.initial })

const authService = useAuthService()

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const payload: RegisterPayload = {
      nombre: String(form.value.nombre ?? ''),
      email: String(form.value.email ?? ''),
      password: String(form.value.password ?? ''),
      password_confirmation: String(form.value.password_confirmation ?? '')
    }
    const result = props.action ? await props.action(payload) : await authService.register(payload)
    emit('success', result)
  } catch (e) {
    emit('error', e)
  } finally {
    submitLoading.value = false
  }
}

defineExpose({ form, visibleErrors, isValid })
</script>

<template>
  <UForm class="space-y-4" :state="form" @submit.prevent="onSubmit">
    <UiBaseInput
      v-model="form.nombre"
      label="Nombre completo"
      placeholder="Tu nombre"
      icon="i-lucide-user"
      autocomplete="name"
      required
      :error="visibleErrors.nombre || undefined"
      @blur="touch('nombre')"
      @update:model-value="touch('nombre')"
    />
    <UiBaseInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="tu@correo.com"
      icon="i-lucide-mail"
      autocomplete="email"
      required
      :error="visibleErrors.email || undefined"
      @blur="touch('email')"
      @update:model-value="touch('email')"
    />
    <UiBaseInput
      v-model="form.password"
      label="Contraseña"
      type="password"
      placeholder="Mínimo 8 caracteres"
      icon="i-lucide-lock"
      autocomplete="new-password"
      required
      :error="visibleErrors.password || undefined"
      @blur="touch('password')"
      @update:model-value="touch('password')"
    />
    <UiBaseInput
      v-model="form.password_confirmation"
      label="Confirmar contraseña"
      type="password"
      placeholder="Repite tu contraseña"
      icon="i-lucide-lock"
      autocomplete="new-password"
      required
      :error="visibleErrors.password_confirmation || undefined"
      @blur="touch('password_confirmation')"
      @update:model-value="touch('password_confirmation')"
    />

    <UiBaseButton
      type="submit"
      block
      size="lg"
      color="primary"
      :label="submitLabel"
      :loading="loading || submitLoading"
      :disabled="!isValid"
      class="rounded-xl mt-2"
    />
  </UForm>
</template>
