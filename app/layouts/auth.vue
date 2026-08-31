<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="min-h-dvh flex">
    <!-- Brand panel -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 text-white">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-600/40 via-slate-950 to-accent-600/20" />
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 20%, rgb(99 102 241 / 0.35), transparent 40%), radial-gradient(circle at 80% 80%, rgb(217 70 239 / 0.25), transparent 40%)" />

      <div class="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 w-fit focus-ring rounded-xl"
        >
          <div class="size-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
            <UIcon
              name="i-lucide-hexagon"
              class="size-5 text-white"
            />
          </div>
          <span class="font-semibold text-lg">{{ appConfig.app?.name || 'CommerceOS' }}</span>
        </NuxtLink>

        <div class="max-w-md animate-fade-up">
          <h1 class="text-3xl xl:text-4xl font-semibold tracking-tight leading-tight">
            Comercio moderno,<br>
            <span class="text-gradient">experiencia premium.</span>
          </h1>
            <p class="mt-4 text-theme-muted leading-relaxed">
            Administra tu tienda, impulsa conversiones y ofrece una compra memorable en cada dispositivo.
          </p>
        </div>

        <p class="text-xs text-theme-muted">
          © {{ new Date().getFullYear() }} {{ appConfig.app?.name || 'CommerceOS' }}
        </p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex-1 flex flex-col">
      <div class="flex items-center justify-between p-4 sm:p-6">
        <NuxtLink
          to="/"
          class="lg:hidden flex items-center gap-2"
        >
          <div class="size-8 rounded-xl bg-theme-brand flex items-center justify-center">
            <UIcon
              name="i-lucide-hexagon"
              class="size-4 text-theme-on-brand"
            />
          </div>
          <span class="font-semibold">{{ appConfig.app?.name || 'CommerceOS' }}</span>
        </NuxtLink>
        <div class="ml-auto">
          <NavigationThemeToggle />
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center px-4 sm:px-8 pb-12">
        <div class="w-full max-w-md animate-fade-up">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
