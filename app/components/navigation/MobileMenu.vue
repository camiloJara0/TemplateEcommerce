<script setup lang="ts">
defineProps<{
  links: Array<{ label: string, to: string }>
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <USlideover
    v-model:open="open"
    side="left"
    :ui="{ content: 'max-w-xs' }"
  >
    <template #header>
      <div class="flex items-center gap-2.5">
        <div class="size-8 rounded-xl bg-theme-brand flex items-center justify-center">
          <UIcon
            name="i-lucide-hexagon"
            class="size-4 text-theme-on-brand"
          />
        </div>
        <span class="font-semibold">CommerceOS</span>
      </div>
    </template>

    <template #body>
      <nav
        class="flex flex-col gap-1"
        aria-label="Móvil"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3 py-3 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="open = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <EcommerceSearchBar />
        <UButton
          to="/auth/login"
          block
          color="primary"
          label="Iniciar sesión"
          icon="i-lucide-log-in"
          class="mt-4"
          @click="open = false"
        />
      </div>
    </template>
  </USlideover>
</template>
