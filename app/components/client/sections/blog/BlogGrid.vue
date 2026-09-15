<script setup lang="ts">
interface BlogPost {
  title: string
  excerpt: string
  image: string | null
  author: string
  date: string
  category: string
  read_time: string
  url: string
}

interface BlogConfig {
  title: string
  subtitle: string
  posts: BlogPost[]
}

const props = defineProps<{ config: BlogConfig }>()

const categoryColors: Record<string, string> = {
  default: 'bg-theme-brand/10 text-theme-brand',
  tech: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  design: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  news: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  guide: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  opinion: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

function getCategoryColor(category: string): string {
  const key = category.toLowerCase().replace(/\s+/g, '')
  return categoryColors[key] ?? 'bg-theme-brand/10 text-theme-brand'
}

const featured = computed(() => props.config?.posts?.[0])
const rest = computed(() => props.config?.posts.slice(1, 5))

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <UButton
          to="/blog"
          color="neutral"
          variant="ghost"
          label="Ver todos"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>

      <div v-if="featured" class="grid lg:grid-cols-5 gap-6">
        <NuxtLink
          :to="featured.url"
          class="lg:col-span-3 group relative overflow-hidden rounded-2xl surface cursor-pointer"
        >
          <div class="relative aspect-16/10 overflow-hidden">
            <div
              v-if="featured.image"
              class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              :style="{ backgroundImage: `url(${featured.image})` }"
            />
            <div
              v-else
              class="absolute inset-0 bg-linear-to-br from-theme-brand/20 to-theme-accent/10 transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
            <div class="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <span
                class="self-start px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm"
                :class="getCategoryColor(featured.category)"
              >
                {{ featured.category }}
              </span>
              <h3 class="text-xl sm:text-2xl font-bold text-white leading-snug mb-3 group-hover:-translate-y-1 transition-transform duration-300">
                {{ featured.title }}
              </h3>
              <p class="text-white/70 text-sm line-clamp-2 mb-4">{{ featured.excerpt }}</p>
              <div class="flex items-center gap-3">
                <div class="size-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span class="text-xs font-bold text-white">{{ getInitials(featured.author) }}</span>
                </div>
                <div class="text-white/80 text-xs">
                  <span class="font-medium">{{ featured.author }}</span>
                  <span class="mx-1.5">·</span>
                  <span>{{ formatDate(featured.date) }}</span>
                  <span class="mx-1.5">·</span>
                  <span>{{ featured.read_time }}</span>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>

        <div class="lg:col-span-2 flex flex-col gap-4">
          <NuxtLink
            v-for="(post, i) in rest"
            :key="i"
            :to="post.url"
            class="group surface rounded-xl p-4 flex gap-4 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div
              v-if="post.image"
              class="shrink-0 size-20 rounded-lg bg-cover bg-center overflow-hidden"
              :style="{ backgroundImage: `url(${post.image})` }"
            />
            <div
              v-else
              class="shrink-0 size-20 rounded-lg bg-linear-to-br from-theme-brand/15 to-theme-accent/10"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <span
                class="self-start px-2 py-0.5 rounded-full text-[0.65rem] font-semibold mb-2"
                :class="getCategoryColor(post.category)"
              >
                {{ post.category }}
              </span>
              <h4 class="text-sm font-semibold text-theme leading-snug line-clamp-2 group-hover:text-theme-brand transition-colors">
                {{ post.title }}
              </h4>
              <div class="text-xs text-theme-muted mt-1.5">
                {{ post.author }} · {{ formatDate(post.date) }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
