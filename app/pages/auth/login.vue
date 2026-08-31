<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const toast = useToast()
const authStore = useAuthStore()

useSeoMeta({ title: 'Iniciar sesión', robots: 'noindex, nofollow' })

function handleSuccess() {
  toast.add({
    title: 'Bienvenido',
    description: 'Has iniciado sesión correctamente.',
    color: 'info',
    icon: 'i-lucide-info',
  })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">
      Bienvenido de nuevo
    </h1>
    <p class="mt-2 text-sm text-theme-muted">
      Ingresa a tu cuenta para continuar
    </p>

    <FormsAuthLoginForm
      class="mt-8"
      @success="handleSuccess"
      @error="(e) => console.error(e)"
    >
      <template #extras>
        <div class="flex items-center justify-between">
          <UCheckbox label="Recordarme" />
          <NuxtLink
            to="/auth/recuperar"
            class="text-sm text-theme-brand hover:text-theme-brand font-medium"
          >
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </div>
      </template>
    </FormsAuthLoginForm>

    <p class="mt-8 text-center text-sm text-theme-muted">
      ¿No tienes cuenta?
      <NuxtLink
        to="/auth/register"
        class="text-theme-brand font-medium hover:text-theme-brand"
      >
        Regístrate
      </NuxtLink>
    </p>

    <div class="mt-6 text-center">
      <UButton
        to="/admin"
        color="neutral"
        variant="link"
        size="sm"
        label="Ir al panel admin (demo)"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>
  </div>
</template>
