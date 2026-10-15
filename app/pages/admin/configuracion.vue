<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { StoreConfigPayload } from '~/types/store'
import type { Integration } from '~/types/integrations'
import { useAdminIntegracionesService } from '~/composables/services/admin/integraciones'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const configStore = useStoreConfigStore()
const { adminConfig, loadingAdmin } = storeToRefs(configStore)
const auth = useAuthStore()
const integracionesService = useAdminIntegracionesService()

const integraciones = ref<Integration[]>([])

const puedeVerIntegraciones = computed(() => auth.can('integraciones.ver'))

const primeraIntegracion = computed(() => integraciones.value[0] || null)

const formInitial = computed<Partial<StoreConfigPayload> | undefined>(() => {
  const cfg = adminConfig.value
  if (!cfg) return undefined
  return {
    store_name: cfg.general.store_name ?? undefined,
    store_tagline: cfg.general.store_tagline ?? undefined,
    logo: cfg.general.logo ?? undefined,
    currency: cfg.general.currency,
    tax_rate: cfg.general.tax_rate,
    default_language: cfg.general.default_language,
    support_email: cfg.general.support_email ?? undefined,
    support_phone: cfg.general.support_phone ?? undefined,
    meta_title: cfg.seo.meta_title ?? undefined,
    meta_description: cfg.seo.meta_description ?? undefined,
    meta_keywords: cfg.seo.meta_keywords ?? undefined,
    og_image: cfg.seo.og_image ?? undefined
  }
})

useSeoMeta({ title: 'Configuración — Admin' })

onMounted(async () => {
  await configStore.loadAdmin()
  if (puedeVerIntegraciones.value) {
    try {
      const { items } = await integracionesService.listar()
      integraciones.value = items
    } catch {
      integraciones.value = []
    }
  }
})
</script>

<template>
  <div class="space-y-6 animate-fade-up max-w-3xl mx-auto">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Configuración de la tienda
        </h1>
        <p class="page-subtitle">
          Moneda, impuestos, soporte y SEO
        </p>
      </div>
    </div>

    <FeedbackSkeletonLoader
      v-if="loadingAdmin && !adminConfig"
      variant="card"
      :count="2"
    />

    <div
      v-else-if="adminConfig"
      class="surface p-5 sm:p-6"
    >
      <FormsStoreConfigForm
        :initial="formInitial"
        @success="() => configStore.loadAdmin()"
      />
    </div>

    <!-- ===== INTEGRACIÓN DE API ===== -->
    <div
      v-if="puedeVerIntegraciones"
      class="surface p-5 sm:p-6"
    >
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 class="font-semibold text-theme flex items-center gap-2">
            <UIcon
              name="i-lucide-plug-zap"
              class="size-5 text-theme-brand"
            />
            Integración de API
          </h2>
          <p class="text-sm text-theme-muted mt-1">
            Conecta sistemas externos (ERP, CRM) para sincronizar catálogo e inventario.
          </p>
          <p
            v-if="primeraIntegracion"
            class="text-sm mt-3 flex items-center gap-2 flex-wrap"
          >
            <span class="font-medium text-theme">{{ primeraIntegracion.nombre }}</span>
            <AdminIntegrationsSyncStatusBadge :estado="primeraIntegracion.estado" />
            <span
              v-if="integraciones.length > 1"
              class="text-xs text-theme-muted"
            >
              +{{ integraciones.length - 1 }} más
            </span>
          </p>
          <p
            v-else
            class="text-sm text-theme-muted mt-3"
          >
            Sin integraciones configuradas.
          </p>
        </div>
        <UButton
          label="Gestionar integraciones"
          icon="i-lucide-arrow-right"
          variant="outline"
          color="primary"
          @click="navigateTo('/admin/integraciones')"
        />
      </div>
    </div>
  </div>
</template>
