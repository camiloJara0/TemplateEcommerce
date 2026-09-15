<script setup lang="ts">
import type { TimelineSection } from '~/types/store'

const props = defineProps<{ config: TimelineSection }>()
</script>

<template>
  <section v-if="config.show && config.events.length" class="py-14 sm:py-20 bg-theme-alt">
    <div class="page-container">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.title }}</h2>
        <p v-if="config.subtitle" class="text-theme-muted">{{ config.subtitle }}</p>
      </div>
      <div class="relative max-w-3xl mx-auto">
        <div class="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-theme-brand/30 -translate-x-1/2" />
        <div
          v-for="(event, i) in config.events"
          :key="i"
          class="relative flex items-start gap-6 mb-10"
          :class="i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'"
        >
          <div class="hidden sm:block sm:w-1/2" />
          <div class="absolute left-4 sm:left-1/2 w-8 h-8 rounded-full bg-theme-brand flex items-center justify-center -translate-x-1/2 z-10 shadow-md">
            <UIcon :name="event.icon || 'i-lucide-circle'" class="size-4 text-theme-on-brand" />
          </div>
          <div class="pl-12 sm:pl-0 sm:w-1/2">
            <div class="bg-theme-surface rounded-xl p-5 border border-theme shadow-sm hover:shadow-md transition-shadow">
              <span class="text-xs font-bold text-theme-brand uppercase tracking-wider">{{ event.year }}</span>
              <h3 class="font-bold text-theme mt-1 mb-2">{{ event.title }}</h3>
              <p class="text-sm text-theme-muted leading-relaxed">{{ event.description }}</p>
              <img v-if="event.image" :src="event.image" alt="" class="mt-3 rounded-lg w-full h-32 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
