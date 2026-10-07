<script setup lang="ts">
definePageMeta({ layout: 'client' })

const route = useRoute()
const communityStore = useCommunityStore()

const token = computed(() => String(route.query.token ?? route.params.token ?? ''))

const loading = ref(true)
const invalid = ref(false)
const info = ref<{ correo: string, estado: string, cancelado: boolean } | null>(null)
const canceling = ref(false)
const canceled = ref(false)

useSeoMeta({
  title: 'Cancelar suscripción al newsletter',
  description: 'Cancela tu suscripción a nuestro newsletter.',
  robots: 'noindex, nofollow'
})

onMounted(async () => {
  if (!token.value) {
    invalid.value = true
    loading.value = false
    return
  }
  try {
    info.value = await communityStore.fetchBaja(token.value)
    canceled.value = Boolean(info.value?.cancelado)
  } catch {
    invalid.value = true
  } finally {
    loading.value = false
  }
})

async function cancelar() {
  if (!token.value || canceling.value) return
  canceling.value = true
  try {
    await communityStore.cancelarSuscripcion(token.value)
    canceled.value = true
  } finally {
    canceling.value = false
  }
}
</script>

<template>
  <div class="page-container py-16 sm:py-24">
    <div class="max-w-lg mx-auto">
      <div class="surface rounded-2xl border border-theme p-8 text-center space-y-5">
        <div
          class="mx-auto size-14 rounded-2xl flex items-center justify-center"
          :class="invalid ? 'bg-error-50 dark:bg-error-950' : canceled ? 'bg-warning-50 dark:bg-warning-950' : 'bg-primary-50 dark:bg-primary-950'"
        >
          <UIcon
            :name="invalid ? 'i-lucide-link-2-off' : canceled ? 'i-lucide-mail-x' : 'i-lucide-mail-open'"
            class="size-7"
            :class="invalid ? 'text-error-500' : canceled ? 'text-warning-600' : 'text-primary-600'"
          />
        </div>

        <template v-if="loading">
          <p class="text-sm text-theme-muted">
            Verificando tu suscripción…
          </p>
        </template>

        <template v-else-if="invalid">
          <h1 class="text-2xl font-semibold">
            Enlace inválido
          </h1>
          <p class="text-sm text-theme-muted">
            El enlace de baja no es válido o ha expirado. Si deseas darte de baja,
            utiliza el enlace que aparece al pie de cualquiera de nuestros correos.
          </p>
          <UiBaseButton
            label="Volver al inicio"
            to="/"
            color="primary"
            class="rounded-xl"
          />
        </template>

        <template v-else>
          <h1 class="text-2xl font-semibold">
            {{ canceled ? 'Suscripción cancelada' : 'Cancelar suscripción' }}
          </h1>

          <template v-if="!canceled">
            <p class="text-sm text-theme-muted">
              Vas a dejar de recibir nuestros correos en
              <strong class="text-theme">{{ info?.correo }}</strong>.
              Esta acción no se puede deshacer desde aquí, pero puedes volver a suscribirte
              en cualquier momento.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <UiBaseButton
                label="No, mantener mi suscripción"
                to="/"
                color="neutral"
                variant="outline"
                class="rounded-xl"
              />
              <UiBaseButton
                label="Sí, cancelar"
                color="error"
                icon="i-lucide-mail-x"
                :loading="canceling"
                class="rounded-xl"
                @click="cancelar"
              />
            </div>
          </template>

          <template v-else>
            <p class="text-sm text-theme-muted">
              Listo. Hemos cancelado la suscripción de
              <strong class="text-theme">{{ info?.correo }}</strong>.
              No volverás a recibir nuestros correos.
            </p>
            <div class="flex justify-center pt-2">
              <UiBaseButton
                label="Volver al inicio"
                to="/"
                color="primary"
                class="rounded-xl"
              />
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
