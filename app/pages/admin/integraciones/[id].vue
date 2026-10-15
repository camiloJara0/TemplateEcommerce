<script setup lang="ts">
import type { Integration, IntegrationSyncRun, IntegrationSistema } from '~/types/integrations'
import { useAdminIntegracionesService, apiErrorMessage } from '~/composables/services/admin/integraciones'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const route = useRoute()
const toast = useToast()
const { date } = useFormat()
const service = useAdminIntegracionesService()

const id = Number(route.params.id)

const loading = ref(true)
const notFound = ref(false)
const integration = ref<Integration | null>(null)
const sistema = ref<IntegrationSistema | null>(null)
const runs = ref<IntegrationSyncRun[]>([])
const runsPagination = ref<{ current_page: number, last_page: number, per_page: number, total: number } | null>(null)
const runsPage = ref(1)

const credentials = ref<Record<string, string>>({})
const savingCreds = ref(false)
const busy = ref(false)

const syncConfig = ref({ frecuencia_minutos: 60, productos: true, inventario: true })
const savingConfig = ref(false)

const syncTipo = ref<'productos' | 'inventario' | 'inicial' | 'todo'>('todo')

const preview = ref<{ total_externos: number, registros_existentes: number, proyectados: number } | null>(null)
const importando = ref(false)
const dryRunLoading = ref(false)

const runColumns = [
  { key: 'id', label: '#' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'estado', label: 'Estado' },
  { key: 'procesados', label: 'Procesados' },
  { key: 'creados', label: 'Creados' },
  { key: 'actualizados', label: 'Actualizados' },
  { key: 'omitidos', label: 'Omitidos' },
  { key: 'errores', label: 'Errores' },
  { key: 'iniciado_en', label: 'Iniciado' }
]

const tipoLabels: Record<string, string> = {
  productos: 'Productos',
  inventario: 'Inventario',
  inicial: 'Importación inicial',
  todo: 'Completa'
}

const runEstadoColor = (estado: string) => {
  const map: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
    iniciando: 'info',
    en_curso: 'info',
    exitosa: 'success',
    parcial: 'warning',
    fallida: 'error'
  }
  return map[estado] || 'neutral'
}

const runEstadoLabel = (estado: string) => ({
  iniciando: 'Iniciando',
  en_curso: 'En curso',
  exitosa: 'Exitosa',
  parcial: 'Parcial',
  fallida: 'Fallida'
}[estado] || estado)

async function loadAll() {
  loading.value = true
  try {
    integration.value = await service.obtener(id)
    const sistemas = await service.listarSistemas()
    sistema.value = sistemas.find(s => s.key === integration.value?.provider) || null
    const cfg = integration.value?.config_sincronizacion
    if (cfg) {
      syncConfig.value = {
        frecuencia_minutos: cfg.frecuencia_minutos ?? 60,
        productos: cfg.productos ?? true,
        inventario: cfg.inventario ?? true
      }
    }
    await loadRuns()
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function loadRuns(page = 1) {
  runsPage.value = page
  const { items, pagination } = await service.listarEjecuciones(id, { page, per_page: 10 })
  runs.value = items
  runsPagination.value = pagination
}

async function guardarCredenciales() {
  savingCreds.value = true
  try {
    const payload = Object.fromEntries(
      Object.entries(credentials.value).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    integration.value = await service.actualizar(id, { credenciales: payload })
    credentials.value = {}
    toast.add({ title: 'Credenciales guardadas', color: 'success', icon: 'i-lucide-check-circle' })
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudieron guardar las credenciales'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    savingCreds.value = false
  }
}

async function probar() {
  busy.value = true
  try {
    const res = await service.probar(id)
    toast.add({
      title: res.success ? 'Conexión exitosa' : 'La conexión falló',
      description: res.message,
      color: res.success ? 'success' : 'error',
      icon: res.success ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'
    })
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo probar la conexión'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    busy.value = false
  }
}

async function toggleActiva() {
  if (!integration.value) return
  busy.value = true
  try {
    integration.value = integration.value.activa
      ? await service.desactivar(id)
      : await service.activar(id)
    toast.add({
      title: integration.value.activa ? 'Integración activada' : 'Integración desactivada',
      color: integration.value.activa ? 'success' : 'warning'
    })
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'La operación falló'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    busy.value = false
  }
}

async function guardarConfig() {
  savingConfig.value = true
  try {
    integration.value = await service.actualizar(id, {
      config_sincronizacion: { ...syncConfig.value }
    })
    toast.add({ title: 'Configuración de sincronización guardada', color: 'success' })
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo guardar'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    savingConfig.value = false
  }
}

async function sincronizarAhora() {
  busy.value = true
  try {
    const { run } = await service.sincronizar(id, syncTipo.value)
    toast.add({
      title: 'Sincronización completada',
      description: `${run.creados} creados · ${run.actualizados} actualizados · ${run.omitidos} omitidos · ${run.errores} errores`,
      color: run.estado === 'fallida' ? 'error' : run.estado === 'parcial' ? 'warning' : 'success',
      icon: 'i-lucide-refresh-cw'
    })
    integration.value = await service.obtener(id)
    await loadRuns()
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'La sincronización falló'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    busy.value = false
  }
}

async function previsualizarImportacion() {
  dryRunLoading.value = true
  try {
    const res = await service.importacionInicial(id, true)
    preview.value = res.preview || null
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo generar la vista previa'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    dryRunLoading.value = false
  }
}

async function ejecutarImportacion() {
  importando.value = true
  try {
    const res = await service.importacionInicial(id, false)
    const run = res.run
    toast.add({
      title: 'Importación inicial completada',
      description: run ? `${run.creados} creados · ${run.actualizados} actualizados · ${run.omitidos} omitidos · ${run.errores} errores` : undefined,
      color: run && run.errores > 0 ? 'warning' : 'success',
      icon: 'i-lucide-download'
    })
    preview.value = null
    integration.value = await service.obtener(id)
    await loadRuns()
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'La importación falló'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    importando.value = false
  }
}

onMounted(loadAll)

useSeoMeta({ title: 'Detalle de integración — Admin' })
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <FeedbackSkeletonLoader
      v-if="loading"
      :rows="4"
      label="Cargando integración…"
    />

    <div
      v-else-if="notFound || !integration"
      class="surface rounded-2xl border border-theme p-12 text-center"
    >
      <UIcon
        name="i-lucide-search-x"
        class="size-10 text-theme-muted mx-auto mb-3"
      />
      <p class="font-semibold text-theme">
        Integración no encontrada
      </p>
      <UButton
        label="Volver a integraciones"
        icon="i-lucide-arrow-left"
        variant="outline"
        class="mt-4"
        @click="navigateTo('/admin/integraciones')"
      />
    </div>

    <template v-else>
      <div class="page-header">
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="page-title">
              {{ integration.nombre }}
            </h1>
            <AdminIntegrationsSyncStatusBadge :estado="integration.estado" />
          </div>
          <p class="page-subtitle">
            {{ integration.provider_info.label }}
            <template v-if="integration.provider_info.description">
              · {{ integration.provider_info.description }}
            </template>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            label="Volver"
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            @click="navigateTo('/admin/integraciones')"
          />
          <UButton
            label="Probar"
            icon="i-lucide-zap"
            variant="outline"
            :loading="busy"
            @click="probar"
          />
          <UButton
            :label="integration.activa ? 'Desactivar' : 'Activar'"
            :icon="integration.activa ? 'i-lucide-pause' : 'i-lucide-play'"
            :color="integration.activa ? 'warning' : 'success'"
            :variant="integration.activa ? 'outline' : 'solid'"
            :loading="busy"
            :disabled="!integration.activa && !integration.configurado"
            @click="toggleActiva"
          />
        </div>
      </div>

      <!-- ===== CREDENCIALES ===== -->
      <section class="surface rounded-2xl border border-theme p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-theme">
            Credenciales
          </h2>
          <p class="text-sm text-theme-muted">
            Cifradas en el servidor. Los valores guardados nunca se muestran completos.
          </p>
        </div>
        <div>
          <AdminIntegrationsCredentialsForm
            v-if="Object.keys(sistema?.fields || {}).length"
            v-model:credentials="credentials"
            :fields="sistema?.fields || {}"
            :configurado="integration.credenciales_configuradas"
          />
          <p
            v-else
            class="text-sm text-theme-muted flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-server"
              class="size-4 shrink-0"
            />
            Este proveedor no pide credenciales en el panel: la URL y la API key se configuran en el backend (.env del servidor).
          </p>
        </div>
        <div class="flex justify-end">
          <UButton
            label="Guardar credenciales"
            icon="i-lucide-save"
            color="primary"
            :loading="savingCreds"
            :disabled="!Object.values(credentials).some(v => v)"
            @click="guardarCredenciales"
          />
        </div>
      </section>

      <!-- ===== SINCRONIZACIÓN ===== -->
      <section class="surface rounded-2xl border border-theme p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-theme">
            Sincronización
          </h2>
          <p class="text-sm text-theme-muted">
            Última sincronización:
            <template v-if="integration.ultimo_sincronizado">
              {{ date(integration.ultimo_sincronizado) }}
            </template>
            <template v-else>
              nunca
            </template>
          </p>
        </div>

        <div class="flex flex-wrap items-end gap-4">
          <UField
            label="Frecuencia (minutos)"
            name="frecuencia_minutos"
          >
            <UInput
              v-model.number="syncConfig.frecuencia_minutos"
              type="number"
              min="15"
              step="15"
              class="w-40"
            />
          </UField>
          <div class="flex items-center gap-4 pb-1">
            <UCheckbox
              v-model="syncConfig.productos"
              label="Productos"
            />
            <UCheckbox
              v-model="syncConfig.inventario"
              label="Inventario"
            />
          </div>
          <UButton
            label="Guardar"
            icon="i-lucide-save"
            variant="outline"
            :loading="savingConfig"
            @click="guardarConfig"
          />
        </div>

        <div class="border-t border-theme pt-4 flex flex-wrap items-end gap-4">
          <UField
            label="Alcance"
            name="tipo"
          >
            <USelect
              v-model="syncTipo"
              :items="[
                { label: 'Completa (productos + inventario)', value: 'todo' },
                { label: 'Solo productos', value: 'productos' },
                { label: 'Solo inventario', value: 'inventario' },
                { label: 'Importación inicial (lectura completa)', value: 'inicial' }
              ]"
              class="w-72"
            />
          </UField>
          <UButton
            label="Sincronizar ahora"
            icon="i-lucide-refresh-cw"
            color="primary"
            :loading="busy"
            :disabled="!integration.activa || !integration.configurado"
            @click="sincronizarAhora"
          />
        </div>
      </section>

      <!-- ===== IMPORTACIÓN INICIAL ===== -->
      <section class="surface rounded-2xl border border-theme p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-theme">
            Importación inicial
          </h2>
          <p class="text-sm text-theme-muted">
            Trae el catálogo completo del sistema externo. Primero genera una vista previa (dry-run) sin escribir en la base de datos.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            label="Previsualizar"
            icon="i-lucide-eye"
            variant="outline"
            :loading="dryRunLoading"
            :disabled="!integration.configurado"
            @click="previsualizarImportacion"
          />
          <UButton
            label="Ejecutar importación"
            icon="i-lucide-download"
            color="primary"
            :loading="importando"
            :disabled="!integration.configurado"
            @click="ejecutarImportacion"
          />
        </div>

        <div
          v-if="preview"
          class="grid grid-cols-3 gap-4 rounded-xl bg-theme-imagenes p-4"
        >
          <div>
            <p class="text-xs text-theme-muted">
              Registros externos
            </p>
            <p class="text-lg font-semibold text-theme">
              {{ preview.total_externos }}
            </p>
          </div>
          <div>
            <p class="text-xs text-theme-muted">
              Ya existentes
            </p>
            <p class="text-lg font-semibold text-theme">
              {{ preview.registros_existentes }}
            </p>
          </div>
          <div>
            <p class="text-xs text-theme-muted">
              Se crearían/actualizarían
            </p>
            <p class="text-lg font-semibold text-theme-brand">
              {{ preview.proyectados }}
            </p>
          </div>
        </div>
      </section>

      <!-- ===== HISTORIAL ===== -->
      <section class="surface rounded-2xl border border-theme p-6 space-y-4">
        <div>
          <h2 class="font-semibold text-theme">
            Historial de ejecuciones
          </h2>
          <p class="text-sm text-theme-muted">
            Últimas sincronizaciones y su resultado.
          </p>
        </div>

        <DashboardDataTable
          :columns="runColumns"
          :rows="runs"
          empty-title="Sin ejecuciones"
          empty-description="Todavía no se han ejecutado sincronizaciones para esta integración."
        >
          <template #cell-tipo="{ value }">
            {{ tipoLabels[value as string] || value }}
          </template>
          <template #cell-estado="{ value }">
            <UBadge
              :label="runEstadoLabel(value as string)"
              :color="runEstadoColor(value as string)"
              variant="subtle"
              size="sm"
            />
          </template>
          <template #cell-iniciado_en="{ value }">
            {{ value ? date(value as string) : '—' }}
          </template>
        </DashboardDataTable>

        <div
          v-if="runsPagination && runsPagination.last_page > 1"
          class="flex justify-center"
        >
          <UPagination
            v-model:page="runsPage"
            :items-per-page="runsPagination.per_page"
            :total="runsPagination.total"
            @update:page="loadRuns"
          />
        </div>
      </section>
    </template>
  </div>
</template>
