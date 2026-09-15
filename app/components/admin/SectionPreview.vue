<script setup lang="ts">
import type { TiendaConfig } from '~/types/store'

const props = defineProps<{
  config: TiendaConfig
  previewPage?: 'home' | 'nosotros'
}>()

const { getComponent } = useSectionVariants()

const heroComponent = computed(() => getComponent('hero', props.config.secciones.hero.variant ?? 'classic'))
const headerComponent = computed(() => getComponent('header', props.config.header.variant ?? 'animation'))
const categoriesComponent = computed(() => getComponent('categories_home', props.config.categories_home.variant ?? 'grid'))
const benefitsComponent = computed(() => getComponent('benefits', props.config.secciones.benefits.variant ?? 'icons'))
const testimonialsComponent = computed(() => getComponent('testimonials', props.config.secciones.testimonials.variant ?? 'cards'))
const ctaComponent = computed(() => getComponent('cta', props.config.secciones.cta.variant ?? 'banner'))
</script>

<template>
  <div class="pointer-events-none">
    <div class="origin-top-left" style="transform: scale(0.5); width: 200%; min-height: 200vh">
      <div v-if="previewPage === 'nosotros'" class="min-h-screen">
        <ClientAboutHeroSection :config="config.nosotros.hero" />
        <ClientMissionVisionSection :config="config.nosotros.mission_vision" />
        <ClientValuesSection :config="config.nosotros.values" />
        <ClientTeamSection :config="config.nosotros.team" />
        <ClientTimelineSection :config="config.nosotros.timeline" />
        <ClientAboutMapSection :config="config.nosotros.map" />
        <ClientAboutCtaSection :config="config.nosotros.cta" />
      </div>
      <div v-else class="min-h-screen">
        <component :is="headerComponent" :config="config.header" />
        <component :is="heroComponent" :config="config.secciones.hero" />
        <component :is="benefitsComponent" :config="config.secciones.benefits" />
        <component :is="categoriesComponent" :config="config.categories_home" />
        <ClientNewsletterSection :config="config.secciones.newsletter" />
        <component :is="testimonialsComponent" :config="config.secciones.testimonials" />
        <ClientStatsSection :config="config.secciones.stats" />
        <ClientBrandLogosSection :config="config.secciones.brand_logos" />
        <ClientVideoSection :config="config.secciones.video" />
        <ClientMapSection :config="config.secciones.map" />
        <ClientRichTextSection :config="config.secciones.richtext" />
        <component :is="ctaComponent" :config="config.secciones.cta" />
      </div>
    </div>
  </div>
</template>
