<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { StoreConfigPayload } from '~/types/store'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const configStore = useStoreConfigStore()
const { adminConfig, loadingAdmin } = storeToRefs(configStore)

const formInitial = computed<Partial<StoreConfigPayload> | undefined>(() => {
  const cfg = adminConfig.value
  if (!cfg) return undefined
  return {
    store_name: cfg.general.store_name,
    store_tagline: cfg.general.store_tagline ?? undefined,
    logo: cfg.general.logo ?? undefined,
    currency: cfg.general.currency,
    tax_rate: cfg.general.tax_rate,
    default_language: cfg.general.default_language,
    support_email: cfg.general.support_email ?? undefined,
    support_phone: cfg.general.support_phone ?? undefined,
    color_primario: cfg.colores.color_primario,
    color_secundario: cfg.colores.color_secundario,
    color_fondo: cfg.colores.color_fondo,
    meta_title: cfg.seo.meta_title ?? undefined,
    meta_description: cfg.seo.meta_description ?? undefined,
    meta_keywords: cfg.seo.meta_keywords ?? undefined,
    og_image: cfg.seo.og_image ?? undefined
  }
})

useSeoMeta({ title: 'Configuración — Admin' })

onMounted(async () => {
  await configStore.loadAdmin()
})
</script>

<template>
  <div class="space-y-6 animate-fade-up max-w-3xl">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Configuración de la tienda
        </h1>
        <p class="page-subtitle">
          Identidad, economía, marca y SEO
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
  </div>
</template>
