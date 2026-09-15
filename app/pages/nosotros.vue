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
    <ClientMissionVisionSection :config="nosotros.mission_vision" />
    <ClientValuesSection :config="nosotros.values" />
    <ClientTeamSection :config="nosotros.team" />
    <ClientTimelineSection :config="nosotros.timeline" />
    <ClientAboutMapSection :config="nosotros.map" />
    <ClientAboutCtaSection :config="nosotros.cta" />
  </div>
</template>
