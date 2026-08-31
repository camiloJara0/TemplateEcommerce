<script setup lang="ts">
definePageMeta({ layout: 'client' })
const storeName = computed(() => useStoreConfigStore().storeName)

useSeoMeta({
  title: 'Nosotros',
  description: 'Conoce más sobre nuestra tienda y misión.'
})
</script>

<template>
  <div class="page-container py-8 sm:py-10">
    <div class="max-w-3xl mx-auto space-y-10">
      <!-- Hero -->
      <section class="text-center space-y-4">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
          Sobre nosotros
        </h1>
        <p class="text-lg text-theme-secondary leading-relaxed">
          En <strong>{{ storeName || 'nuestra tienda' }}</strong> creemos que comprar
          debería ser una experiencia clara, segura y placentera.
        </p>
      </section>

      <!-- Misión -->
      <section class="surface p-6 sm:p-8 space-y-4">
        <h2 class="text-xl font-semibold">
          Nuestra misión
        </h2>
        <p class="text-theme-secondary leading-relaxed">
          Ofrecer productos curados con estándares de calidad elevados, combinados con un proceso
          de compra sin fricción. Cada detalle — desde la selección del catálogo hasta la entrega
          — está diseñado para que tu experiencia sea intuitiva y confiable.
        </p>
      </section>

      <!-- Valores -->
      <section class="grid sm:grid-cols-3 gap-4">
        <div class="surface p-6 text-center space-y-3">
          <div class="size-12 rounded-2xl bg-theme-imagenes flex items-center justify-center mx-auto">
            <UIcon name="i-lucide-shield-check" class="size-6 text-theme-brand" />
          </div>
          <h3 class="font-semibold">
            Confianza
          </h3>
          <p
            class="text-sm text-theme-muted leading-relaxed"
          >
            Pagos seguros, transparencia total en cada transacción y políticas claras.
          </p>
        </div>
        <div class="surface p-6 text-center space-y-3">
          <div class="size-12 rounded-2xl bg-theme-imagenes flex items-center justify-center mx-auto">
            <UIcon name="i-lucide-sparkles" class="size-6 text-theme-brand" />
          </div>
          <h3 class="font-semibold">
            Calidad
          </h3>
          <p
            class="text-sm text-theme-muted leading-relaxed"
          >
            Productos seleccionados cuidadosamente para garantizar que superen tus expectativas.
          </p>
        </div>
        <div class="surface p-6 text-center space-y-3">
          <div class="size-12 rounded-2xl bg-theme-imagenes flex items-center justify-center mx-auto">
            <UIcon name="i-lucide-headphones" class="size-6 text-theme-brand" />
          </div>
          <h3 class="font-semibold">
            Soporte real
          </h3>
          <p
            class="text-sm text-theme-muted leading-relaxed"
          >
            Un equipo humano listo para ayudarte antes, durante y después de tu compra.
          </p>
        </div>
      </section>

      <!-- CTA -->
      <section class="text-center">
        <UButton
          to="/catalogo"
          color="primary"
          label="Explorar catálogo"
          size="lg"
          class="rounded-2xl"
        />
      </section>
    </div>
  </div>
</template>
