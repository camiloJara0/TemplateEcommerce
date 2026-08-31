<script setup lang="ts">
import type { Product } from '~/types/catalog'

definePageMeta({ layout: 'client' })

const appConfig = useAppConfig()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const storeConfigStore = useStoreConfigStore()
const { hero, benefits, categories: catSection, featured: featSection, deals: dealsSection, testimonials, cta: ctaSection, header, categoriesHome } = usePageConfig()

const { items: products } = storeToRefs(productStore)
const { items: categories } = storeToRefs(categoryStore)
const { storeName } = storeToRefs(storeConfigStore)

const featured = computed(() => products.value.filter(p => p.is_featured).slice(0, 8))
const deals = computed(() => products.value.filter(p => p.price_discount).slice(0, 4))

onMounted(async () => {
  await Promise.all([
    productStore.loadList({ destacado: 1, per_page: 8 }),
    categoryStore.loadList(),
    storeConfigStore.loadPublic(),
    storeConfigStore.loadTienda()
  ])
})

useSeoMeta({
  title: () => `${storeName.value || appConfig.app?.name || 'CommerceOS'} — ${appConfig.app?.tagline || 'Tu tienda'}`,
  description: () => appConfig.app?.description || 'Ecommerce premium con los mejores productos, envío rápido y checkout seguro.',
  ogTitle: () => storeName.value || appConfig.app?.name || 'CommerceOS',
  ogDescription: () => appConfig.app?.description || 'Ecommerce premium con los mejores productos, envío rápido y checkout seguro.',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: storeName.value || 'CommerceOS',
        url: '/',
        potentialAction: {
          '@type': 'SearchAction',
          target: '/catalogo?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})

const previewProduct = ref<Product | null>(null)
const previewOpen = ref(false)

function openPreview(product: Product) {
  previewProduct.value = product
  previewOpen.value = true
}
</script>

<template>
  <div>
    <!-- Animated Header -->
    <ClientAnimatedHeader :config="header" />

    <!-- Hero (existing) -->
    <section class="relative overflow-hidden section-gradient">
      <div class="absolute inset-0 section-gradient" />
      <!-- <div
        v-if="hero.background_image"
        class="absolute inset-0 opacity-20"
        :style="{ backgroundImage: `url(${hero.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
      />
      <div
        v-else
        class="absolute inset-0 opacity-40 dark:opacity-20"
        style="background-image: radial-gradient(circle at 10% 20%, rgb(99 102 241 / 0.15), transparent 35%), radial-gradient(circle at 90% 10%, rgb(217 70 239 / 0.12), transparent 30%)"
      /> -->

      <div class="page-container relative section-padding">
        <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div class="animate-fade-up">
            <UBadge
              v-if="hero.badge"
              :label="hero.badge"
              color="primary"
              variant="subtle"
              class="mb-5"
            />
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-theme leading-[1.08]">
              {{ hero.headline }}
            </h1>
            <p class="mt-5 text-base sm:text-lg text-theme-secondary leading-relaxed max-w-xl">
              {{ hero.subtext }}
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <UButton
                :to="hero.cta_primary.url"
                size="xl"
                color="primary"
                :label="hero.cta_primary.label"
                trailing-icon="i-lucide-arrow-right"
                class="cta-glow rounded-2xl"
              />
              <UButton
                v-if="hero.cta_secondary"
                :to="hero.cta_secondary.url"
                size="xl"
                color="neutral"
                variant="outline"
                :label="hero.cta_secondary.label"
                class="rounded-2xl"
              />
            </div>
            <div class="mt-10 flex items-center gap-6 text-sm text-theme-muted">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="size-4 text-emerald-500" />
                Pago seguro
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-truck" class="size-4 text-theme-brand" />
                Envío 24–48h
              </div>
            </div>
          </div>

          <div v-if="hero.show_stats" class="relative animate-fade-up delay-150">
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div
                v-for="(stat, i) in hero.stats"
                :key="i"
                class="surface p-4 sm:p-5"
                :class="i === 1 ? 'glass' : ''"
              >
                <p class="text-2xl font-semibold tabular-nums" :class="i === 1 ? 'text-gradient-subtle' : ''">
                  {{ stat.value }}
                </p>
                <p class="text-xs text-theme-muted mt-1">
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="border-y border-theme homepage-section-bg">
      <div class="page-container py-8 sm:py-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div
            v-for="(b, i) in benefits.items"
            :key="b.title"
            class="flex items-start gap-3 animate-fade-up"
            :style="{ animationDelay: `${i * 75}ms` }"
          >
            <div class="size-10 rounded-xl bg-theme-imagenes flex items-center justify-center shrink-0 border-theme">
              <UIcon :name="b.icon" class="size-5 text-theme-brand" />
            </div>
            <div>
              <p class="font-medium text-sm text-theme">
                {{ b.title }}
              </p>
              <p class="text-xs text-theme-muted mt-0.5 leading-relaxed">
                {{ b.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories (Apple/Nike Style) -->
    <ClientCategoryCards :config="categoriesHome" />

    <!-- Featured products -->
    <section class="section-padding homepage-section-bg">
      <div class="page-container">
        <div class="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 class="page-title text-2xl sm:text-3xl text-theme">
              {{ featSection.title }}
            </h2>
            <p class="page-subtitle text-theme-secondary">
              {{ featSection.subtitle }}
            </p>
          </div>
          <UButton
            v-if="featSection.show_all_link"
            to="/catalogo?orden=mas_vendidos"
            color="neutral"
            variant="ghost"
            label="Ver más"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <EcommerceProductGrid :products="featured" @quickview="openPreview"/>
      </div>
    </section>

    <!-- Product preview modal -->
    <EcommerceProductPreviewModal
      :product="previewProduct"
      :open="previewOpen"
      @update:open="previewOpen = $event"
    />

    <!-- Deals banner -->
    <section v-if="dealsSection.show_section" class="section-padding homepage-section-bg">
      <div class="page-container">
        <div class="relative overflow-hidden rounded-3xl bg-slate-950 text-white">
          <div class="absolute inset-0 bg-linear-to-r from-brand-600/80 via-brand-700/60 to-accent-600/40" />
          <div class="relative grid lg:grid-cols-2 gap-8 p-8 sm:p-12 lg:p-14 items-center">
            <div>
              <UBadge
                :label="dealsSection.badge"
                color="neutral"
                variant="solid"
                class="mb-4 bg-white/10 text-white ring-white/20"
              />
              <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                {{ dealsSection.headline }}
              </h2>
              <p class="mt-3 text-white/80 max-w-md leading-relaxed">
                {{ dealsSection.subtext }}
              </p>
              <UButton
                to="/ofertas"
                size="lg"
                color="neutral"
                variant="solid"
                :label="dealsSection.cta_label"
                trailing-icon="i-lucide-arrow-right"
                class="mt-6 rounded-2xl bg-white text-slate-900 hover:bg-slate-100"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <EcommerceProductCard
                v-for="p in deals.slice(0, 2)"
                :key="p.id"
                :product="p"
                class="bg-white/95! dark:bg-slate-900!"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section-padding homepage-section-bg">
      <div class="page-container">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <h2 class="page-title text-2xl sm:text-3xl">
            {{ testimonials.title }}
          </h2>
          <p class="page-subtitle">
            {{ testimonials.subtitle }}
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-4 sm:gap-6">
          <article
            v-for="t in testimonials.items"
            :key="t.name"
            class="surface p-6 flex flex-col gap-4"
          >
            <div class="flex gap-0.5 text-amber-400">
              <UIcon
                v-for="n in t.rating"
                :key="n"
                name="i-lucide-star"
                class="size-4 fill-current"
              />
            </div>
            <p class="text-sm text-theme-secondary leading-relaxed flex-1">
              "{{ t.text }}"
            </p>
            <div class="flex items-center gap-3 pt-2 border-t border-theme">
              <UAvatar :src="t.avatar ?? undefined" :alt="t.name" size="sm" />
              <div>
                <p class="text-sm font-medium text-theme">{{ t.name }}</p>
                <p class="text-xs text-theme-muted">{{ t.role }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="section-padding homepage-section-bg">
      <div class="page-container">
        <div class="surface text-center px-6 py-14 sm:py-16 relative overflow-hidden">
          <div class="absolute inset-0 bg-linear-to-br from-brand-50/80 to-transparent dark:from-brand-950/30 pointer-events-none" />
          <div class="relative">
            <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-theme">
              {{ ctaSection.headline }}
            </h2>
            <p class="mt-3 text-theme-muted max-w-md mx-auto">
              {{ ctaSection.subtext }}
            </p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <UButton
                :to="ctaSection.cta_primary.url"
                size="lg"
                color="primary"
                :label="ctaSection.cta_primary.label"
                class="rounded-2xl cta-glow"
              />
              <UButton
                v-if="ctaSection.cta_secondary"
                :to="ctaSection.cta_secondary.url"
                size="lg"
                color="neutral"
                variant="outline"
                :label="ctaSection.cta_secondary.label"
                class="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
