<script setup lang="ts">
const appConfig = useAppConfig()
const { brand, footer, social } = usePageConfig()
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-theme text-theme">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-theme-brand focus:text-theme-on-brand focus:rounded-xl"
    >
      Saltar al contenido
    </a>

    <NavigationClientNavbar />

    <main
      id="main-content"
      class="flex-1"
    >
      <slot />
    </main>

    <footer class="border-t border-theme bg-theme">
      <div class="page-container py-12 sm:py-16">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="size-8 rounded-xl bg-theme-brand flex items-center justify-center">
                <UIcon
                  v-if="!brand.logo"
                  name="i-lucide-hexagon"
                  class="size-4 text-theme-on-brand"
                />
                <img
                  v-else
                  :src="brand.logo"
                  :alt="brand.name"
                  class="size-4 object-contain"
                >
              </div>
              <span class="font-semibold">{{ brand.name }}</span>
            </div>
            <p class="text-sm text-theme-muted leading-relaxed max-w-xs">
              {{ brand.tagline }}
            </p>
          </div>

          <div v-for="col in footer.columns" :key="col.title">
            <h4 class="text-sm font-semibold mb-3">
              {{ col.title }}
            </h4>
            <ul class="space-y-2 text-sm text-theme-muted">
              <li v-for="link in col.links" :key="link.url">
                <NuxtLink :to="link.url" class="hover:text-theme-brand transition-colors">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-theme-muted">
            © {{ new Date().getFullYear() }} {{ brand.name }}. {{ footer.copyright_text }}
          </p>
          <div class="flex items-center gap-2">
            <UButton
              v-if="social.instagram"
              :to="social.instagram"
              icon="i-simple-icons-instagram"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Instagram"
              target="_blank"
            />
            <UButton
              v-if="social.twitter"
              :to="social.twitter"
              icon="i-simple-icons-x"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="X"
              target="_blank"
            />
            <UButton
              v-if="social.facebook"
              :to="social.facebook"
              icon="i-simple-icons-facebook"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Facebook"
              target="_blank"
            />
            <UButton
              v-if="social.youtube"
              :to="social.youtube"
              icon="i-simple-icons-youtube"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="YouTube"
              target="_blank"
            />
          </div>
        </div>
      </div>
    </footer>

    <EcommerceCartDrawer />
    <ClientPushSubscribeBanner />
  </div>
</template>
