<script setup lang="ts">
import type { LoginPayload } from '~/types/api'
import { useAuthService } from '~/composables/services/auth'

interface Props {
  action?: (payload: LoginPayload) => Promise<unknown>
  submitLabel?: string
  loading?: boolean
  initial?: Partial<LoginPayload>
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Iniciar sesión',
  loading: false,
  initial: () => ({ email: '', password: '' })
})

const emit = defineEmits<{
  success: [data: unknown]
  error: [error: unknown]
}>()

const showPassword = ref(false)
const submitLoading = ref(false)

const { form, errors, visibleErrors, isValid, touch, submit: validate, setForm } = useFormValidation([
  { key: 'email', label: 'Email', required: true, isEmail: true },
  { key: 'password', label: 'Contraseña', required: true, minLength: 8 }
])

setForm({ ...props.initial })

// const { login: storeLogin } = useAuthService()

const { login: storeLogin } = useAuthStore()

async function runAction(payload: LoginPayload) {
  if (props.action) return props.action(payload)
  await storeLogin(payload)
}

async function onSubmit() {
  if (!validate()) return
  submitLoading.value = true
  try {
    const result = await runAction({
      email: String(form.value.email ?? ''),
      password: String(form.value.password ?? '')
    })
    emit('success', result)
  } catch (e) {
    emit('error', e)
  } finally {
    submitLoading.value = false
  }
}

defineExpose({ form, errors, isValid, reset: () => setForm({ email: '', password: '' }) })
</script>

<template>
  <UForm class="space-y-4" :state="form" @submit.prevent="onSubmit">
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

    <UFormField label="Contraseña" required :error="visibleErrors.password || undefined">
      <UInput
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••"
        size="md"
        class="w-full"
        autocomplete="current-password"
        @blur="touch('password')"
        @update:model-value="touch('password')"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>
    </UFormField>

    <slot name="extras" />

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
