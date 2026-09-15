<script setup lang="ts">
import type { NosotrosSecciones, AboutSectionKey } from '~/types/store'
import { ABOUT_SECTION_META } from '~/types/store'

const props = defineProps<{
  config: NosotrosSecciones
  selected: AboutSectionKey
}>()
</script>

<template>
  <div class="p-6">
    <div class="text-center mb-6">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ ABOUT_SECTION_META[selected]?.label || selected }}
      </h2>
      <p class="text-xs text-slate-500 mt-1">Vista previa de la sección</p>
    </div>
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
      <div class="origin-top-left" style="transform: scale(0.6); width: 166%; min-height: 400px">
        <ClientAboutHeroSection v-if="selected === 'hero'" :config="config.hero" />
        <ClientMissionVisionSection v-else-if="selected === 'mission_vision'" :config="config.mission_vision" />
        <ClientValuesSection v-else-if="selected === 'values'" :config="config.values" />
        <ClientTeamSection v-else-if="selected === 'team'" :config="config.team" />
        <ClientTimelineSection v-else-if="selected === 'timeline'" :config="config.timeline" />
        <ClientAboutMapSection v-else-if="selected === 'map'" :config="config.map" />
        <ClientAboutCtaSection v-else-if="selected === 'cta'" :config="config.cta" />
      </div>
    </div>
  </div>
</template>
