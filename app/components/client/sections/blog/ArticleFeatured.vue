<script setup lang="ts">
interface PressArticle {
  title: string
  source: string
  logo: string | null
  url: string
  date: string
  excerpt: string
}

interface ArticleConfig {
  title: string
  subtitle: string
  articles: PressArticle[]
}

const props = defineProps<{ config: ArticleConfig }>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

function checkScroll() {
  const el = scrollContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
}

function scroll(direction: 'left' | 'right') {
  const el = scrollContainer.value
  if (!el) return
  const amount = el.clientWidth * 0.7
  el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' })
}

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', checkScroll, { passive: true })
  nextTick(checkScroll)
})

onUnmounted(() => {
  scrollContainer.value?.removeEventListener('scroll', checkScroll)
})

function getInitials(source: string): string {
  return source.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase()
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <section class="section-padding homepage-section-bg relative">
    <div class="page-container">
      <div class="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
          <p class="page-subtitle">{{ config.subtitle }}</p>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <button
            class="size-10 rounded-full border border-theme flex items-center justify-center hover:bg-theme-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollLeft"
            @click="scroll('left')"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4 text-theme-muted" />
          </button>
          <button
            class="size-10 rounded-full border border-theme flex items-center justify-center hover:bg-theme-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="!canScrollRight"
            @click="scroll('right')"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4 text-theme-muted" />
          </button>
        </div>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <NuxtLink
        v-for="(article, i) in config.articles"
        :key="i"
        :to="article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group shrink-0 w-85 sm:w-100 snap-start surface rounded-2xl p-6 sm:p-7 flex flex-col hover:shadow-xl hover:shadow-theme-brand/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        <div class="flex items-center gap-3 mb-5">
          <div
            v-if="article.logo"
            class="size-11 rounded-xl overflow-hidden bg-theme-alt flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
          >
            <img
              :src="article.logo"
              :alt="article.source"
              class="size-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          </div>
          <div
            v-else
            class="size-11 rounded-xl bg-theme-brand/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-theme-brand group-hover:scale-110"
          >
            <span class="text-xs font-bold text-theme-brand group-hover:text-white transition-colors">
              {{ getInitials(article.source) }}
            </span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-theme truncate">{{ article.source }}</p>
            <p class="text-xs text-theme-muted">{{ formatDate(article.date) }}</p>
          </div>
        </div>

        <h3 class="text-base sm:text-lg font-semibold text-theme leading-snug mb-3 line-clamp-2 group-hover:text-theme-brand transition-colors">
          {{ article.title }}
        </h3>

        <p class="text-sm text-theme-muted leading-relaxed line-clamp-3 flex-1">{{ article.excerpt }}</p>

        <div class="mt-5 pt-4 border-t border-theme flex items-center gap-2 text-theme-brand">
          <span class="text-xs font-semibold">Leer más</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </NuxtLink>
    </div>

    <div class="absolute bottom-0 left-0 w-16 h-full bg-linear-to-r from-theme-bg to-transparent pointer-events-none sm:block hidden" />
    <div class="absolute bottom-0 right-0 w-16 h-full bg-linear-to-l from-theme-bg to-transparent pointer-events-none sm:block hidden" />
  </section>
</template>
