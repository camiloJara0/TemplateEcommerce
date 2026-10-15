<script setup lang="ts">
import { shippingStatusMeta } from '~/utils/orderStatus'

definePageMeta({ layout: 'client' })

const route = useRoute()
const shipmentStore = useShipmentStore()
const { tracking, loadingTrack } = storeToRefs(shipmentStore)
const { date } = useFormat()

const query = ref(typeof route.query.t === 'string' ? route.query.t : '')
const searched = ref(false)

async function search() {
  const code = query.value.trim()
  if (!code) return
  searched.value = true
  await shipmentStore.track(code)
}

onMounted(() => {
  if (query.value) search()
})

useSeoMeta({ title: 'Seguimiento de envío' })
</script>

<template>
  <div class="page-container py-10 sm:py-16">
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <UIcon
          name="i-lucide-truck"
          class="size-10 text-theme-brand mx-auto"
        />
        <h1 class="text-2xl font-semibold">
          Seguimiento de envío
        </h1>
        <p class="text-theme-muted text-sm">
          Ingresa tu número de guía para ver el estado de tu pedido
        </p>
      </div>

      <form
        class="surface p-5 flex flex-col sm:flex-row gap-3"
        @submit.prevent="search"
      >
        <UInput
          v-model="query"
          icon="i-lucide-search"
          placeholder="Ej. TRK-ABC123"
          class="flex-1"
          size="lg"
        />
        <UButton
          type="submit"
          label="Rastrear"
          icon="i-lucide-arrow-right"
          color="primary"
          size="lg"
          class="rounded-xl"
          :loading="loadingTrack"
        />
      </form>

      <FeedbackSkeletonLoader
        v-if="loadingTrack"
        variant="card"
        :count="2"
      />

      <div
        v-else-if="searched && !tracking"
        class="surface p-10 text-center"
      >
        <UIcon
          name="i-lucide-package-x"
          class="size-10 text-theme-muted mx-auto mb-3"
        />
        <p class="font-medium">
          No encontramos envíos con ese número
        </p>
        <p class="text-sm text-theme-muted mt-1">
          Verifica que el código sea correcto e intenta de nuevo
        </p>
      </div>

      <div
        v-else-if="tracking"
        class="surface p-5 sm:p-6 space-y-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs text-theme-muted uppercase tracking-wider">
              Guía
            </p>
            <p class="font-mono font-semibold">
              {{ tracking.tracking_number }}
            </p>
            <p
              v-if="tracking.order_numero"
              class="text-sm text-theme-muted mt-1"
            >
              Pedido {{ tracking.order_numero }}
            </p>
          </div>
          <UBadge
            :label="shippingStatusMeta(tracking.status).label"
            :color="shippingStatusMeta(tracking.status).color"
            :icon="shippingStatusMeta(tracking.status).icon"
            variant="subtle"
            size="md"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div v-if="tracking.carrier">
            <p class="text-theme-muted text-xs">
              Transportadora
            </p>
            <p class="font-medium capitalize">
              {{ String(tracking.carrier).replace(/_/g, ' ') }}
            </p>
          </div>
          <div v-if="tracking.ciudad">
            <p class="text-theme-muted text-xs">
              Destino
            </p>
            <p class="font-medium">
              {{ tracking.ciudad }}
            </p>
          </div>
          <div v-if="tracking.destinatario">
            <p class="text-theme-muted text-xs">
              Destinatario
            </p>
            <p class="font-medium">
              {{ tracking.destinatario }}
            </p>
          </div>
          <div v-if="tracking.estimated_delivery">
            <p class="text-theme-muted text-xs">
              Entrega estimada
            </p>
            <p class="font-medium">
              {{ date(tracking.estimated_delivery) }}
            </p>
          </div>
        </div>

        <USeparator v-if="tracking.events?.length" />

        <div
          v-if="tracking.events?.length"
          class="space-y-3"
        >
          <h2 class="font-semibold text-sm">
            Historial de eventos
          </h2>
          <ol class="space-y-3">
            <li
              v-for="(event, i) in tracking.events"
              :key="i"
              class="flex items-start gap-3"
            >
              <div
                class="size-2.5 rounded-full mt-1.5 shrink-0"
                :class="i === 0 ? 'bg-theme-brand' : 'bg-slate-300 dark:bg-slate-700'"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium">
                  {{ event.description ?? event.descripcion ?? event.status ?? event.estado }}
                </p>
                <p
                  v-if="event.location"
                  class="text-xs text-theme-muted"
                >
                  {{ event.location }}
                </p>
                <p class="text-xs text-theme-muted">
                  {{ event.date ?? event.fecha ? date(event.date ?? event.fecha!) : '' }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
