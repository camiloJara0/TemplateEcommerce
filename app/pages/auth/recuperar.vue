<script setup lang="ts">
import { useAuthService } from '~/composables/services/auth'

definePageMeta({ layout: 'auth' })

const email = ref('')
const loading = ref(false)
const authService = useAuthService()

useSeoMeta({ title: 'Recuperar contraseña', robots: 'noindex, nofollow' })

async function onSubmit() {
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return
  loading.value = true
  try {
    await authService.enviarCodigo({ email: email.value })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">
      Recupera tu contraseña
    </h1>
    <p class="mt-2 text-sm text-theme-muted">
      Te enviaremos un código de 6 dígitos a tu correo
    </p>

    <UForm
      class="mt-8 space-y-4"
      @submit.prevent="onSubmit"
    >
      <UiBaseInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="tu@correo.com"
        icon="i-lucide-mail"
        autocomplete="email"
        required
      />

      <UiBaseButton
        type="submit"
        block
        size="lg"
        color="primary"
        label="Enviar código"
        :loading="loading"
        class="rounded-xl mt-2"
      />
    </UForm>

    <p class="mt-8 text-center text-sm text-theme-muted">
      ¿Recordaste tu contraseña?
      <NuxtLink
        to="/auth/login"
        class="text-theme-brand font-medium hover:text-theme-brand"
      >
        Inicia sesión
      </NuxtLink>
    </p>
  </div>
</template>
