<script setup lang="ts">
import type { Integration, IntegrationSistema } from '~/types/integrations'
import { useAdminIntegracionesService, apiErrorMessage } from '~/composables/services/admin/integraciones'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const toast = useToast()
const service = useAdminIntegracionesService()

const loading = ref(false)
const integraciones = ref<Integration[]>([])
const sistemas = ref<IntegrationSistema[]>([])
const busyId = ref<number | null>(null)

const createOpen = ref(false)
const createLoading = ref(false)
const selectedProvider = ref('#')
const createNombre = ref('')
const createCredenciales = ref<Record<string, string>>({})

const deleteOpen = ref(false)
const deleteTarget = ref<Integration | null>(null)
const deleteLoading = ref(false)

const selectedSistema = computed(() =>
  sistemas.value.find(s => s.key === selectedProvider.value) || null
)

async function load() {
  loading.value = true
  try {
    const { items } = await service.listar()
    integraciones.value = items
  } finally {
    loading.value = false
  }
}

async function loadSistemas() {
  if (!sistemas.value.length) {
    sistemas.value = await service.listarSistemas()
  }
}

function openCreate() {
  selectedProvider.value = '#'
  createNombre.value = ''
  createCredenciales.value = {}
  createOpen.value = true
  loadSistemas()
}

async function submitCreate() {
  if (!selectedSistema.value || !createNombre.value.trim()) {
    toast.add({ title: 'Selecciona un sistema y escribe un nombre', color: 'warning', icon: 'i-lucide-alert-circle' })
    return
  }
  createLoading.value = true
  try {
    await service.crear({
      nombre: createNombre.value.trim(),
      provider: selectedSistema.value.key,
      credenciales: createCredenciales.value
    })
    createOpen.value = false
    toast.add({ title: 'Integración creada', color: 'success', icon: 'i-lucide-check-circle' })
    await load()
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo crear la integración'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    createLoading.value = false
  }
}

async function runAction(id: number, fn: () => Promise<void>) {
  busyId.value = id
  try {
    await fn()
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'La operación falló'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    busyId.value = null
  }
}

function probar(item: Integration) {
  runAction(item.id, async () => {
    const res = await service.probar(item.id)
    toast.add({
      title: res.success ? 'Conexión exitosa' : 'La conexión falló',
      description: res.message,
      color: res.success ? 'success' : 'error',
      icon: res.success ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'
    })
  })
}

function activar(item: Integration) {
  runAction(item.id, async () => {
    await service.activar(item.id)
    toast.add({ title: 'Integración activada', color: 'success' })
    await load()
  })
}

function desactivar(item: Integration) {
  runAction(item.id, async () => {
    await service.desactivar(item.id)
    toast.add({ title: 'Integración desactivada', color: 'warning' })
    await load()
  })
}

function sincronizar(item: Integration) {
  runAction(item.id, async () => {
    const { run } = await service.sincronizar(item.id, 'todo')
    toast.add({
      title: 'Sincronización completada',
      description: `${run.creados} creados · ${run.actualizados} actualizados · ${run.omitidos} omitidos · ${run.errores} errores`,
      color: run.estado === 'fallida' ? 'error' : run.estado === 'parcial' ? 'warning' : 'success',
      icon: 'i-lucide-refresh-cw'
    })
    await load()
  })
}

function openDelete(item: Integration) {
  deleteTarget.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const id = deleteTarget.value.id
  deleteLoading.value = true
  try {
    await service.eliminar(id)
    deleteOpen.value = false
    toast.add({ title: 'Integración eliminada', color: 'success' })
    await load()
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo eliminar'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    deleteLoading.value = false
  }
}

onMounted(load)

useSeoMeta({ title: 'Integraciones — Admin' })
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Integraciones
        </h1>
        <p class="page-subtitle">
          Conecta tu tienda con sistemas externos (ERP, CRM, marketplace) para sincronizar catálogo e inventario
        </p>
      </div>
      <UButton
        label="Nueva integración"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreate"
      />
    </div>

    <FeedbackSkeletonLoader
      v-if="loading && !integraciones.length"
      :rows="3"
      label="Cargando integraciones…"
    />

    <div
      v-else-if="!integraciones.length"
      class="surface rounded-2xl border border-theme p-12 text-center"
    >
      <UIcon
        name="i-lucide-plug-zap"
        class="size-10 text-theme-muted mx-auto mb-3"
      />
      <p class="font-semibold text-theme">
        Sin integraciones configuradas
      </p>
      <p class="text-sm text-theme-muted mt-1 mb-4">
        Agrega un sistema externo para importar productos y sincronizar inventario automáticamente.
      </p>
      <UButton
        label="Crear integración"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreate"
      />
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <AdminIntegrationsIntegrationCard
        v-for="item in integraciones"
        :key="item.id"
        :integration="item"
        :busy="busyId === item.id"
        @probar="probar(item)"
        @activar="activar(item)"
        @desactivar="desactivar(item)"
        @sincronizar="sincronizar(item)"
        @ver="navigateTo(`/admin/integraciones/${item.id}`)"
        @eliminar="openDelete(item)"
      />
    </div>

    <!-- ===== MODAL NUEVA INTEGRACIÓN ===== -->
    <UModal
      v-model:open="createOpen"
      title="Nueva integración"
      :ui="{ content: 'w-full max-w-lg' }"
    >
      <template #body>
        <div class="space-y-4">
          <UField
            label="Sistema"
            name="provider"
            required
          >
            <USelect
              v-model="selectedProvider"
              :items="[
                { label: 'Selecciona un sistema…', value: '#' },
                ...sistemas.map(s => ({ label: s.label, value: s.key }))
              ]"
              class="w-full"
            />
          </UField>

          <p
            v-if="selectedSistema?.description"
            class="text-xs text-theme-muted mt-2"
          >
            {{ selectedSistema.description }}
          </p>

          <UField
            label="Nombre"
            name="nombre"
            required
          >
            <UInput
              v-model="createNombre"
              :placeholder="selectedSistema ? `${selectedSistema.label} principal` : 'Mi integración'"
              class="w-full"
            />
          </UField>

          <div
            v-if="selectedSistema && Object.keys(selectedSistema.fields || {}).length"
            class="border-t border-theme pt-4"
          >
            <p class="text-sm font-medium text-theme mb-3">
              Credenciales
            </p>
            <AdminIntegrationsCredentialsForm
              v-model:credentials="createCredenciales"
              :fields="selectedSistema.fields"
              :configurado="{}"
            />
          </div>

          <p
            v-if="selectedSistema?.capabilities?.length"
            class="text-xs text-theme-muted flex items-center gap-1"
          >
            <UIcon
              name="i-lucide-info"
              class="size-3.5"
            />
            Capacidades: {{ selectedSistema.capabilities.join(', ') }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="outline"
            @click="createOpen = false"
          />
          <UButton
            label="Crear"
            color="primary"
            :loading="createLoading"
            @click="submitCreate"
          />
        </div>
      </template>
    </UModal>

    <!-- ===== MODAL ELIMINAR ===== -->
    <UModal
      v-model:open="deleteOpen"
      title="Eliminar integración"
      :ui="{ content: 'w-full max-w-md' }"
    >
      <template #body>
        <p
          v-if="deleteTarget"
          class="text-sm text-theme-muted"
        >
          ¿Estás seguro de eliminar <span class="font-semibold text-theme">{{ deleteTarget.nombre }}</span>?
          Se borrarán sus credenciales y ejecuciones. Los productos ya importados se conservan.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            variant="outline"
            @click="deleteOpen = false"
          />
          <UButton
            label="Eliminar"
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
