<script setup lang="ts">
const appConfig = useAppConfig()
const configStore = useStoreConfigStore()

useThemeConfig()

useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: () => configStore.effectiveTiendaConfig?.estilos?.tipografia?.font_family ? 'es' : 'es'
  }
})

const appSettings = computed(
  () => (appConfig.app as { name?: string; description?: string } | undefined) ?? {}
)

const title = computed(() => configStore.effectiveTiendaConfig?.brand?.name || appSettings.value.name || 'CommerceOS')
const description = computed(() => appSettings.value.description || 'Ecommerce premium')

useSeoMeta({
  titleTemplate: (t) => t && t !== title.value ? `${t} · ${title.value}` : title.value,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const colorMode = useColorMode()
colorMode.preference = colorMode.preference || 'system'

onMounted(() => {
  configStore.loadTienda()
})
</script>

<template>
  <UApp>
    <UiAppLoader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
