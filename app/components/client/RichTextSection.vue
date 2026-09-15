<script setup lang="ts">
import type { RichTextSection } from '~/types/store'

const props = defineProps<{ config: RichTextSection }>()
</script>

<template>
  <section
    v-if="config.show"
    class="py-14 sm:py-20"
    :style="{
      backgroundColor: config.bg_color || undefined,
      color: config.text_color || undefined,
    }"
  >
    <div class="page-container">
      <div
        :class="{
          'max-w-3xl mx-auto text-center': config.layout === 'full',
          'grid md:grid-cols-2 gap-10 items-center': config.layout?.startsWith('split'),
        }"
      >
        <div :class="{ 'order-2': config.layout === 'split-right' }">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">{{ config.headline }}</h2>
          <div class="prose prose-lg opacity-80" v-html="config.content" />
          <a
            v-if="config.cta_label && config.cta_url"
            :href="config.cta_url"
            class="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-theme-brand text-theme-on-brand font-semibold hover:scale-105 transition-transform"
          >
            {{ config.cta_label }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </a>
        </div>
        <div v-if="config.image && config.layout?.includes('split')" :class="{ 'order-1': config.layout === 'split-right' }">
          <img :src="config.image" alt="" class="rounded-2xl w-full object-cover shadow-lg" />
        </div>
      </div>
    </div>
  </section>
</template>
