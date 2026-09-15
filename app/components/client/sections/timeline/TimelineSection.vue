<script setup lang="ts">
interface TimelineItem {
  year: string
  title: string
  description: string
  icon?: string
}

interface TimelineConfig {
  title: string
  subtitle: string
  items: TimelineItem[]
}

const props = defineProps<{ config: TimelineConfig }>()

const lineRef = ref<HTMLElement | null>(null)
const itemsRef = ref<HTMLElement[]>([])
const visibleItems = ref<Set<number>>(new Set())

function setItemRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) itemsRef.value[index] = el
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute('data-index'))
        if (entry.isIntersecting) {
          visibleItems.value = new Set([...visibleItems.value, index])
        }
      })
    },
    { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
  )

  itemsRef.value.forEach((el) => {
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <section class="section-padding homepage-section-bg">
    <div class="page-container">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="page-title text-2xl sm:text-3xl">{{ config.title }}</h2>
        <p class="page-subtitle">{{ config.subtitle }}</p>
      </div>

      <div class="relative max-w-4xl mx-auto">
        <div
          class="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-theme-brand/20 via-theme-brand/40 to-theme-brand/20 hidden md:block"
        />

        <div class="space-y-12 md:space-y-0">
          <div
            v-for="(item, i) in config.items"
            :key="i"
            :ref="(el: Element | null) => setItemRef(el, i)"
            :data-index="i"
            class="relative md:grid md:grid-cols-2 md:gap-12 md:items-center md:pb-16 last:pb-0"
          >
            <div
              class="hidden md:flex absolute left-1/2 -translate-x-1/2 size-4 rounded-full border-[3px] border-theme-brand bg-theme z-10 transition-all duration-500"
              :class="visibleItems.has(i) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
              :style="{ transitionDelay: `${i * 100 + 200}ms` }"
            >
              <span
                class="absolute inset-0 rounded-full animate-ping bg-theme-brand/30"
                :class="visibleItems.has(i) ? 'block' : 'hidden'"
                :style="{ animationDelay: `${i * 100}ms` }"
              />
            </div>

            <div
              class="md:text-right transition-all duration-600 ease-out"
              :class="[
                visibleItems.has(i)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              ]"
              :style="{ transitionDelay: `${i * 100}ms` }"
            >
              <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme-brand/10 mb-3"
              >
                <UIcon
                  v-if="item.icon"
                  :name="item.icon"
                  class="size-4 text-theme-brand"
                />
                <span class="text-sm font-bold text-theme-brand tracking-wide">{{ item.year }}</span>
              </div>
              <h3 class="text-lg font-semibold text-theme">{{ item.title }}</h3>
            </div>

            <div
              class="mt-4 md:mt-0 transition-all duration-600 ease-out"
              :class="[
                visibleItems.has(i)
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              ]"
              :style="{ transitionDelay: `${i * 100 + 100}ms` }"
            >
              <div class="surface p-5 sm:p-6 rounded-xl group hover:shadow-lg hover:shadow-theme-brand/5 transition-all duration-300">
                <div class="md:hidden flex items-center gap-2 mb-3">
                  <div class="size-2.5 rounded-full bg-theme-brand" />
                  <span class="text-xs font-bold text-theme-brand uppercase tracking-widest">{{ item.year }}</span>
                </div>
                <p class="text-theme-muted text-[0.9rem] leading-relaxed">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
