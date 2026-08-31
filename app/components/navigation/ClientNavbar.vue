<script setup lang="ts">
const route = useRoute()
const { open: cartOpen } = useCartDrawer()
const { brand, navbarLinks, navbar } = usePageConfig()
const authStore = useAuthStore()
const mobileOpen = ref(false)

const cartStore = useCartStore()
const { itemCount } = storeToRefs(cartStore)

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-40 glass border-b border-theme homepage-section-bg">
    <div class="page-container">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Brand -->
        <div class="flex items-center gap-8">
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5 group focus-ring rounded-xl"
          >
            <div class="size-8 rounded-xl bg-theme-brand flex items-center justify-center shadow-glow transition-transform duration-200 group-hover:scale-105">
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
            <span class="font-semibold text-theme tracking-tight hidden sm:block">
              {{ brand.name }}
            </span>
          </NuxtLink>

          <nav
            class="hidden lg:flex items-center gap-1"
            aria-label="Principal"
          >
            <NuxtLink
              v-for="link in navbarLinks"
              :key="link.url"
              :to="link.url"
              class="px-3 py-2 text-sm font-medium rounded-xl transition-colors duration-150"
              :class="route.path === link.url
                ? 'text-theme-brand bg-theme-imagenes'
                : 'text-theme-secondary hover:text-theme hover:bg-theme-imagenes'"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Search (desktop) -->
        <div v-if="navbar.show_search" class="hidden md:flex flex-1 max-w-md">
          <EcommerceSearchBar compact />
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 sm:gap-2">
          <NavigationThemeToggle />

          <NavigationNotificationDropdown v-if="authStore.isAuthenticated" />

          <UButton
            v-if="navbar.show_favorites"
            to="/cuenta/favoritos"
            icon="i-lucide-heart"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl hidden sm:inline-flex"
            aria-label="Favoritos"
          />

          <UButton
            v-if="navbar.show_cart"
            icon="i-lucide-shopping-bag"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl relative"
            aria-label="Carrito"
            @click="cartOpen = true"
          >
            <span
              v-if="itemCount > 0"
              class="absolute -top-0.5 -right-0.5 size-4.5 min-w-4.5 px-1 rounded-full bg-theme-brand text-[10px] font-semibold text-theme-on-brand flex items-center justify-center"
            >
              {{ itemCount > 9 ? '9+' : itemCount }}
            </span>
          </UButton>

          <UButton
            to="/auth/login"
            icon="i-lucide-user"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl hidden sm:inline-flex"
            aria-label="Cuenta"
          />

          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl lg:hidden"
            aria-label="Abrir menú"
            @click="mobileOpen = true"
          />
        </div>
      </div>
    </div>

    <NavigationMobileMenu v-model:open="mobileOpen" :links="navbarLinks.map(l => ({ label: l.label, to: l.url }))" />
  </header>
</template>
