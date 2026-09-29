<script setup lang="ts">
definePageMeta({ layout: 'client' })

const storeConfigStore = useStoreConfigStore()
const { nosotros } = usePageConfig()

const storeName = computed(() => storeConfigStore.storeName)

useSeoMeta({
  title: 'Sobre nosotros',
  description: () => `Conoce más sobre ${storeName.value || 'nuestra tienda'} y nuestra misión.`,
})
</script>

<template>
  <div>
    <ClientAboutHeroSection :config="nosotros.hero" />
    <ClientAboutMissionVisionSection :config="nosotros.mission_vision" />
    <ClientAboutValuesSection :config="nosotros.values" />
    <ClientAboutTeamSection :config="nosotros.team" />
    <ClientAboutTimelineSection :config="nosotros.timeline" />
    <ClientAboutMapSection :config="nosotros.map" />
    <ClientAboutCtaSection :config="nosotros.cta" />
  </div>
</template>
