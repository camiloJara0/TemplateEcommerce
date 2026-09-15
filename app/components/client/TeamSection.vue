<script setup lang="ts">
import type { TeamSection } from '~/types/store'

const props = defineProps<{ config: TeamSection }>()
</script>

<template>
  <section v-if="config.show && config.members.length" class="py-14 sm:py-20">
    <div class="page-container">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-theme mb-2">{{ config.title }}</h2>
        <p v-if="config.subtitle" class="text-theme-muted">{{ config.subtitle }}</p>
      </div>
      <div
        class="grid gap-6"
        :class="{
          'grid-cols-1 sm:grid-cols-2': config.layout === 'grid-2',
          'grid-cols-1 sm:grid-cols-3': config.layout === 'grid-3',
          'grid-cols-2 sm:grid-cols-4': config.layout === 'grid-4',
        }"
      >
        <div
          v-for="(member, i) in config.members"
          :key="i"
          class="text-center group"
        >
          <div class="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-theme-surface shadow-lg group-hover:ring-theme-brand transition-all">
            <img
              v-if="member.avatar"
              :src="member.avatar"
              :alt="member.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-theme-brand/10 flex items-center justify-center">
              <UIcon name="i-lucide-user" class="size-10 text-theme-brand" />
            </div>
          </div>
          <h3 class="font-bold text-theme">{{ member.name }}</h3>
          <p class="text-sm text-theme-brand mb-2">{{ member.role }}</p>
          <p class="text-xs text-theme-muted max-w-[200px] mx-auto">{{ member.bio }}</p>
          <div v-if="member.social_links" class="flex justify-center gap-3 mt-3">
            <a v-if="member.social_links.instagram" :href="member.social_links.instagram" target="_blank" class="text-theme-muted hover:text-theme-brand transition-colors">
              <UIcon name="i-lucide-instagram" class="size-4" />
            </a>
            <a v-if="member.social_links.linkedin" :href="member.social_links.linkedin" target="_blank" class="text-theme-muted hover:text-theme-brand transition-colors">
              <UIcon name="i-lucide-linkedin" class="size-4" />
            </a>
            <a v-if="member.social_links.twitter" :href="member.social_links.twitter" target="_blank" class="text-theme-muted hover:text-theme-brand transition-colors">
              <UIcon name="i-lucide-twitter" class="size-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
