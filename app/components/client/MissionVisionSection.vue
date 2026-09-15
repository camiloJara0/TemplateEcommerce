<script setup lang="ts">
import type { MissionVisionSection } from '~/types/store'

const props = defineProps<{ config: MissionVisionSection }>()
</script>

<template>
  <section v-if="config.show" class="py-14 sm:py-20">
    <div class="page-container">
      <div
        v-if="config.layout === 'side-by-side'"
        class="grid md:grid-cols-2 gap-12 items-center"
      >
        <div>
          <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.mission_title }}</h3>
          <p class="text-theme-muted leading-relaxed">{{ config.mission_text }}</p>
          <img v-if="config.mission_image" :src="config.mission_image" alt="" class="mt-6 rounded-xl w-full object-cover max-h-60" />
        </div>
        <div>
          <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.vision_title }}</h3>
          <p class="text-theme-muted leading-relaxed">{{ config.vision_text }}</p>
          <img v-if="config.vision_image" :src="config.vision_image" alt="" class="mt-6 rounded-xl w-full object-cover max-h-60" />
        </div>
      </div>

      <div v-else-if="config.layout === 'alternating'" class="space-y-16">
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div v-if="config.mission_image">
            <img :src="config.mission_image" alt="" class="rounded-2xl w-full object-cover shadow-lg" />
          </div>
          <div>
            <p class="text-xs text-theme-brand uppercase tracking-wider font-semibold mb-2">Misión</p>
            <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.mission_title }}</h3>
            <p class="text-theme-muted leading-relaxed">{{ config.mission_text }}</p>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div class="md:order-2">
            <img v-if="config.vision_image" :src="config.vision_image" alt="" class="rounded-2xl w-full object-cover shadow-lg" />
          </div>
          <div class="md:order-1">
            <p class="text-xs text-theme-accent uppercase tracking-wider font-semibold mb-2">Visión</p>
            <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.vision_title }}</h3>
            <p class="text-theme-muted leading-relaxed">{{ config.vision_text }}</p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-12 max-w-2xl mx-auto text-center">
        <div>
          <p class="text-xs text-theme-brand uppercase tracking-wider font-semibold mb-2">Misión</p>
          <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.mission_title }}</h3>
          <p class="text-theme-muted leading-relaxed">{{ config.mission_text }}</p>
          <img v-if="config.mission_image" :src="config.mission_image" alt="" class="mt-6 rounded-xl mx-auto object-cover max-h-60" />
        </div>
        <div class="w-16 h-px bg-theme-brand mx-auto" />
        <div>
          <p class="text-xs text-theme-accent uppercase tracking-wider font-semibold mb-2">Visión</p>
          <h3 class="text-xl sm:text-2xl font-bold text-theme mb-3">{{ config.vision_title }}</h3>
          <p class="text-theme-muted leading-relaxed">{{ config.vision_text }}</p>
          <img v-if="config.vision_image" :src="config.vision_image" alt="" class="mt-6 rounded-xl mx-auto object-cover max-h-60" />
        </div>
      </div>
    </div>
  </section>
</template>
