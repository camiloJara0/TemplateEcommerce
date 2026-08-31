<script setup lang="ts">
import type { TiendaConfig, SectionKey } from '~/types/store'

const props = defineProps<{
  config: TiendaConfig
  selected: string
}>()

const emit = defineEmits<{
  'update:selected': [value: string]
}>()

function selectSection(key: string) {
  emit('update:selected', key)
}

function sectionClass(key: string) {
  return [
    'relative cursor-pointer transition-all duration-200',
    props.selected === key
      ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
      : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
  ]
}
</script>

<template>
  <div>
    <!-- Navbar Preview -->
    <div :class="sectionClass('navbar')" @click="selectSection('navbar')">
      <nav class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14">
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg text-slate-900 dark:text-white">{{ config.brand.name }}</span>
            </div>
            <div class="hidden md:flex items-center gap-6">
              <span v-for="link in config.navbar.links.filter(l => l.visible)" :key="link.label" class="text-sm text-slate-600 dark:text-slate-400">
                {{ link.label }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon v-if="config.navbar.show_search" name="i-lucide-search" class="size-5 text-slate-400" />
              <UIcon v-if="config.navbar.show_cart" name="i-lucide-shopping-cart" class="size-5 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Header Preview -->
    <div v-if="config.header.show" :class="sectionClass('header')" @click="selectSection('header')">
      <section class="relative overflow-hidden" :style="{ height: config.header.height }">
        <div
          v-if="config.header.background_image"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${config.header.background_image})` }"
        />
        <div v-else class="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div class="absolute inset-0" :style="{ backgroundColor: config.header.overlay_color, opacity: config.header.overlay_opacity }" />
        <div class="relative z-10 flex items-center justify-center h-full text-center px-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">{{ config.header.headline }}</h1>
            <p class="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{{ config.header.subtext }}</p>
            <div class="flex gap-4 justify-center">
              <span class="px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm">{{ config.header.cta_primary.label }}</span>
              <span v-if="config.header.cta_secondary" class="px-6 py-3 border border-white/30 text-white rounded-xl font-semibold text-sm">{{ config.header.cta_secondary.label }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Hero Section -->
    <section :class="sectionClass('hero')" @click="selectSection('hero')">
      <div class="relative overflow-hidden">
        <div class="absolute inset-0 bg-linear-to-br from-brand-50 via-white to-accent-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/30" />
        <div class="page-container relative section-padding">
          <div class="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span v-if="config.secciones.hero.badge" class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full mb-4">
                {{ config.secciones.hero.badge }}
              </span>
              <h1 class="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                {{ config.secciones.hero.headline }}
              </h1>
              <p class="mt-4 text-slate-600 dark:text-slate-300 max-w-xl">
                {{ config.secciones.hero.subtext }}
              </p>
              <div class="mt-6 flex gap-3">
                <span class="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold">{{ config.secciones.hero.cta_primary.label }}</span>
                <span v-if="config.secciones.hero.cta_secondary" class="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm">{{ config.secciones.hero.cta_secondary.label }}</span>
              </div>
            </div>
            <div v-if="config.secciones.hero.show_stats" class="grid grid-cols-2 gap-3">
              <div v-for="(stat, i) in config.secciones.hero.stats" :key="i" class="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stat.value }}</p>
                <p class="text-xs text-slate-500 mt-1">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section :class="sectionClass('benefits')" @click="selectSection('benefits')">
      <div class="border-y border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="page-container py-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="(b, i) in config.secciones.benefits.items" :key="i" class="flex items-start gap-3">
              <div class="size-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center shrink-0">
                <UIcon :name="b.icon" class="size-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p class="font-medium text-sm text-slate-900 dark:text-white">{{ b.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ b.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Home -->
    <div v-if="config.categories_home.show" :class="sectionClass('categories')" @click="selectSection('categories')">
      <section class="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white">{{ config.categories_home.title }}</h2>
            <p class="mt-2 text-slate-500 dark:text-slate-400">{{ config.categories_home.subtitle }}</p>
          </div>
          <div
            class="grid gap-4"
            :class="{
              'grid-cols-2': config.categories_home.layout === 'grid-2',
              'grid-cols-3': config.categories_home.layout === 'grid-3',
              'grid-cols-4': config.categories_home.layout === 'grid-4',
            }"
          >
            <div
              v-for="(item, i) in config.categories_home.items"
              :key="i"
              class="relative rounded-2xl overflow-hidden group"
              :style="{ height: config.categories_home.card_height }"
            >
              <div v-if="item.image" class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${item.image})` }" />
              <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
              <div class="absolute inset-0 bg-black/40" :style="{ opacity: item.overlay_opacity }" />
              <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 class="text-xl font-bold" :style="{ color: item.text_color }">{{ item.name }}</h3>
                <p class="text-sm opacity-80 mt-1" :style="{ color: item.text_color }">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Categories (from secciones) -->
    <section :class="sectionClass('categories')" @click="selectSection('categories')">
      <div class="section-padding">
        <div class="page-container">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{{ config.secciones.categories.title }}</h2>
          <p class="text-slate-500 mb-6">{{ config.secciones.categories.subtitle }}</p>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div v-for="i in 6" :key="i" class="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <UIcon name="i-lucide-layers" class="size-8 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section :class="sectionClass('featured')" @click="selectSection('featured')">
      <div class="section-padding bg-white dark:bg-slate-950/50">
        <div class="page-container">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">{{ config.secciones.featured.title }}</h2>
          <p class="text-slate-500 mb-6">{{ config.secciones.featured.subtitle }}</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
              <div class="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <UIcon name="i-lucide-package" class="size-10 text-slate-300 dark:text-slate-600" />
              </div>
              <div class="p-4">
                <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Deals -->
    <section v-if="config.secciones.deals.show_section" :class="sectionClass('deals')" @click="selectSection('deals')">
      <div class="section-padding">
        <div class="page-container">
          <div class="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-10">
            <div class="absolute inset-0 bg-linear-to-r from-primary-600/80 via-primary-700/60 to-purple-600/40" />
            <div class="relative">
              <span class="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4">{{ config.secciones.deals.badge }}</span>
              <h2 class="text-3xl font-bold">{{ config.secciones.deals.headline }}</h2>
              <p class="mt-3 text-white/80 max-w-md">{{ config.secciones.deals.subtext }}</p>
              <span class="inline-block mt-6 px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold">{{ config.secciones.deals.cta_label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section :class="sectionClass('testimonials')" @click="selectSection('testimonials')">
      <div class="section-padding bg-white dark:bg-slate-950/50">
        <div class="page-container">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">{{ config.secciones.testimonials.title }}</h2>
          <p class="text-slate-500 text-center mb-8">{{ config.secciones.testimonials.subtitle }}</p>
          <div class="grid md:grid-cols-3 gap-4">
            <div v-for="(t, i) in config.secciones.testimonials.items" :key="i" class="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              <div class="flex gap-0.5 text-amber-400 mb-3">
                <UIcon v-for="n in t.rating" :key="n" name="i-lucide-star" class="size-4 fill-current" />
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-300 italic">"{{ t.text }}"</p>
              <div class="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span class="text-xs font-semibold text-primary-600">{{ t.name[0] }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ t.name }}</p>
                  <p class="text-xs text-slate-400">{{ t.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section :class="sectionClass('cta')" @click="selectSection('cta')">
      <div class="section-padding">
        <div class="page-container">
          <div class="text-center py-14 bg-slate-50 dark:bg-slate-900 rounded-3xl">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ config.secciones.cta.headline }}</h2>
            <p class="mt-3 text-slate-500 max-w-md mx-auto">{{ config.secciones.cta.subtext }}</p>
            <div class="mt-8 flex justify-center gap-3">
              <span class="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold">{{ config.secciones.cta.cta_primary.label }}</span>
              <span v-if="config.secciones.cta.cta_secondary" class="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-xl text-sm">{{ config.secciones.cta.cta_secondary.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Preview -->
    <div :class="sectionClass('footer')" @click="selectSection('footer')">
      <footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white mb-3">{{ config.brand.name }}</h3>
              <p class="text-sm text-slate-500">{{ config.brand.tagline }}</p>
            </div>
            <div v-for="(col, i) in config.footer.columns" :key="i">
              <h4 class="font-semibold text-slate-900 dark:text-white mb-3 text-sm">{{ col.title }}</h4>
              <ul class="space-y-2">
                <li v-for="link in col.links" :key="link.label">
                  <span class="text-sm text-slate-500 hover:text-primary-600">{{ link.label }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p class="text-xs text-slate-400">&copy; 2026 {{ config.brand.name }}. {{ config.footer.copyright_text }}</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
