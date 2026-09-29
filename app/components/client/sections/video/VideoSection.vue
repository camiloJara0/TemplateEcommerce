<script setup lang="ts">
import type { VideoSection } from '~/types/store'

const props = defineProps<{ config: VideoSection }>()
const playing = ref(false)

function getEmbedUrl(url: string | null): string {
  if (!url) return ''
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?autoplay=1`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`
  return url
}
</script>

<template>
  <section v-if="config.show" class="py-14 sm:py-20">
    <div class="page-container">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.headline }}</h2>
        <p v-if="config.subtext" class="text-theme-muted max-w-xl mx-auto">{{ config.subtext }}</p>
      </div>
      <div
        class="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-theme-surface shadow-xl"
        :aspect-ratio="config.aspect_ratio === '21:9' ? '21/9' : config.aspect_ratio === '4:3' ? '4/3' : '16/9'"
      >
        <template v-if="playing && config.video_url">
          <iframe
            :src="getEmbedUrl(config.video_url)"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          />
        </template>
        <template v-else>
          <img
            v-if="config.thumbnail"
            :src="config.thumbnail"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 bg-theme-imagenes flex items-center justify-center" />
          <button
            class="absolute inset-0 flex items-center justify-center group"
            @click="playing = true"
          >
            <div class="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
              <UIcon name="i-lucide-play" class="size-8 text-theme-brand ml-1" />
            </div>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>
