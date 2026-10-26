<script setup lang="ts">
import { useAuthService } from '~/composables/services/auth'

definePageMeta({ layout: 'auth' })

const toast = useToast()
const route = useRoute()
const communityStore = useCommunityStore()
const { infoLoginFederado } = useAuthService()
const token = route.query.token

useSeoMeta({ title: 'Iniciar sesión', robots: 'noindex, nofollow' })

const federado = ref<{ federado: boolean, sistema?: string } | null>(null)

async function handleSuccess() {
  toast.add({
    title: 'Bienvenido',
    description: 'Has iniciado sesión correctamente.',
    color: 'info',
    icon: 'i-lucide-info'
  })
}

onMounted(async () => {
  // Aviso opcional de acceso federado (HU-052 CA6).
  try {
    const info = await infoLoginFederado()
    if (info?.federado) federado.value = info
  } catch { /* sin federación o endpoint no disponible: sin aviso */ }

  if (typeof token !== 'string' || !token) return
  await communityStore.confirmSubscribe(token)
  toast.add({
    title: 'Subscrito',
    description: 'Te mandaremos ofertas y novedades!.',
    color: 'info',
    icon: 'i-lucide-info'
  })
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">
      Bienvenido de nuevo
    </h1>
    <p class="mt-2 text-sm text-theme-muted">
      Ingresa a tu cuenta para continuar
    </p>

    <UAlert
      v-if="federado?.federado"
      class="mt-4"
      icon="i-lucide-shield-check"
      color="info"
      variant="subtle"
      title="Acceso validado con tu sistema"
      :description="`Usa las mismas credenciales de ${federado.sistema || 'tu sistema externo'} para entrar.`"
    />

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
