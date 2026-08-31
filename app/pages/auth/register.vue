<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const toast = useToast()

useSeoMeta({ title: 'Crear cuenta', robots: 'noindex, nofollow' })

async function onSuccess() {
  toast.add({
    title: 'Cuenta creada',
    description: 'Iniciando sesión automáticamente…',
    color: 'info',
    icon: 'i-lucide-info'
  })
  await navigateTo('/auth/login')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">
      Crea tu cuenta
    </h1>
    <p class="mt-2 text-sm text-theme-muted">
      Únete y empieza a comprar en minutos
    </p>

    <FormsAuthRegisterForm
      class="mt-8"
      @success="onSuccess"
      @error="() => {}"
    />

    <p class="mt-8 text-center text-sm text-theme-muted">
      ¿Ya tienes cuenta?
      <NuxtLink
        to="/auth/login"
        class="text-theme-brand font-medium hover:text-theme-brand"
      >
        Inicia sesión
      </NuxtLink>
    </p>
  </div>
</template>
