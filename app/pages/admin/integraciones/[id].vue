<script setup lang="ts">
import type { Integration, IntegrationCompraDoc, IntegrationSyncRun, IntegrationSistema, IntegrationVentaItem } from '~/types/integrations'
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

const syncConfig = ref({ frecuencia_minutos: 60, productos: true, inventario: true, compras: true, ventas: true })
const savingConfig = ref(false)

const syncTipo = ref<'productos' | 'inventario' | 'compras' | 'ventas' | 'inicial' | 'todo'>('todo')

const comprasDocs = ref<IntegrationCompraDoc[]>([])
const comprasPagination = ref<{ current_page: number, last_page: number, per_page: number, total: number } | null>(null)
const comprasPage = ref(1)
const comprasLoading = ref(false)

const ventasItems = ref<IntegrationVentaItem[]>([])
const ventasPagination = ref<{ current_page: number, last_page: number, per_page: number, total: number } | null>(null)
const ventasPage = ref(1)
const ventasSoloCola = ref(false)
const ventasLoading = ref(false)

const soporta_login = ref(false)
const rol_login_federado = ref<string | undefined>(undefined)
const login_fallback_local = ref(true)
const savingLogin = ref(false)

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

const comprasColumns = [
  { key: 'external_id', label: 'Documento' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'lineas', label: 'Líneas' },
  { key: 'estado', label: 'Estado' },
  { key: 'skus_pendientes', label: 'SKUs pendientes' }
]

const ventasColumns = [
  { key: 'numero', label: 'Pedido' },
  { key: 'estado', label: 'Estado' },
  { key: 'externo_id', label: 'ID externo' },
  { key: 'enviado_en', label: 'Enviado' },
  { key: 'error', label: 'Error' }
]

const tipoLabels: Record<string, string> = {
  productos: 'Productos',
  inventario: 'Inventario',
  compras: 'Compras',
  ventas: 'Ventas',
  inicial: 'Importación inicial',
  todo: 'Completa'
}

const soportaCompras = computed(() => sistema.value?.capabilities.includes('compras') ?? false)
const soportaVentas = computed(() => sistema.value?.capabilities.includes('ventas') ?? false)
const soportaLogin = computed(() => sistema.value?.supports_login ?? false)

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

const docEstadoMeta = (estado: string) => ({
  aplicada: { label: 'Aplicada', color: 'success' as const },
  pendiente_resolucion: { label: 'Pendiente resolución', color: 'warning' as const },
  error: { label: 'Error', color: 'error' as const }
}[estado] || { label: estado, color: 'neutral' as const })

const ventaEstadoMeta = (estado: string) => ({
  pendiente_envio: { label: 'Pendiente', color: 'warning' as const },
  enviado: { label: 'Enviado', color: 'info' as const },
  aceptado: { label: 'Aceptado', color: 'success' as const },
  error: { label: 'Error', color: 'error' as const }
}[estado] || { label: estado, color: 'neutral' as const })

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
        inventario: cfg.inventario ?? true,
        compras: cfg.compras ?? true,
        ventas: cfg.ventas ?? true
      }
    }
    soporta_login.value = integration.value?.soporta_login ?? false
    rol_login_federado.value = integration.value?.rol_login_federado ?? undefined
    login_fallback_local.value = integration.value?.login_fallback_local ?? true
    await loadRuns()
    if (soportaCompras.value) await loadCompras()
    if (soportaVentas.value) await loadVentas()
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

async function loadCompras(page = 1) {
  comprasLoading.value = true
  comprasPage.value = page
  try {
    const { items, pagination } = await service.listarCompras(id, { page, per_page: 10 })
    comprasDocs.value = items
    comprasPagination.value = pagination
  } finally {
    comprasLoading.value = false
  }
}

async function loadVentas(page = 1) {
  ventasLoading.value = true
  ventasPage.value = page
  try {
    const { items, pagination } = await service.listarVentas(id, {
      page,
      per_page: 10,
      ...(ventasSoloCola.value ? { queue: 'cola' as const } : {})
    })
    ventasItems.value = items
    ventasPagination.value = pagination
  } finally {
    ventasLoading.value = false
  }
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

async function guardarLoginFederado() {
  savingLogin.value = true
  try {
    integration.value = await service.actualizar(id, {
      soporta_login: soporta_login.value,
      rol_login_federado: rol_login_federado.value || null,
      login_fallback_local: login_fallback_local.value,
    })
    toast.add({ title: 'Login federado guardado', color: 'success', icon: 'i-lucide-check-circle' })
  } catch (e: unknown) {
    toast.add({ title: apiErrorMessage(e, 'No se pudo guardar el login federado'), color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    savingLogin.value = false
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
              name="i-lucide-unplug"
              class="size-4 shrink-0"
            />
            Este proveedor no requiere credenciales de conexión.
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

      <!-- ===== LOGIN FEDERADO ===== -->
      <section
        v-if="soportaLogin"
        class="surface rounded-2xl border border-theme p-6 space-y-4"
      >
        <div>
          <h2 class="font-semibold text-theme">
            Login federado
          </h2>
          <p class="text-sm text-theme-muted">
            Valida el inicio de sesión contra el sistema externo antes del login local (HU-052).
          </p>
        </div>

        <div class="space-y-3">
          <UCheckbox
            v-model="soporta_login"
            label="Habilitar acceso con credenciales del sistema externo"
          />

          <UFormField
            v-if="soporta_login"
            label="Rol para usuarios creados por federación"
            description="Vacío = cliente (recomendado). Si el rol no existe, el usuario se crea sin él."
          >
            <UInput
              v-model="rol_login_federado"
              placeholder="cliente"
              class="w-full"
            />
          </UFormField>

          <UCheckbox
            v-if="soporta_login"
            v-model="login_fallback_local"
            label="Si el sistema externo no responde, permitir login local de respaldo"
          />
        </div>

        <div class="flex justify-end">
          <UButton
            label="Guardar login federado"
            icon="i-lucide-save"
            color="primary"
            :loading="savingLogin"
            @click="guardarLoginFederado"
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
          <div class="flex items-center gap-4 pb-1 flex-wrap">
            <UCheckbox
              v-model="syncConfig.productos"
              label="Productos"
            />
            <UCheckbox
              v-model="syncConfig.inventario"
              label="Inventario"
            />
            <UCheckbox
              v-if="soportaCompras"
              v-model="syncConfig.compras"
              label="Compras (entrada)"
            />
            <UCheckbox
              v-if="soportaVentas"
              v-model="syncConfig.ventas"
              label="Ventas (salida)"
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
                { label: 'Completa (todo lo habilitado)', value: 'todo' },
                { label: 'Solo productos', value: 'productos' },
                { label: 'Solo inventario', value: 'inventario' },
                { label: 'Solo compras (entrada)', value: 'compras' },
                { label: 'Solo ventas (salida)', value: 'ventas' },
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

      <!-- ===== COMPRAS (ENTRADA) ===== -->
      <section
        v-if="soportaCompras"
        class="surface rounded-2xl border border-theme p-6 space-y-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-theme">
              Compras (entrada)
            </h2>
            <p class="text-sm text-theme-muted">
              Documentos de compra del ERP y su aplicación al stock local. Los documentos con SKUs sin resolver quedan pendientes hasta completar el catálogo.
            </p>
          </div>
          <UButton
            label="Actualizar"
            icon="i-lucide-refresh-cw"
            variant="outline"
            size="sm"
            :loading="comprasLoading"
            @click="loadCompras(comprasPage)"
          />
        </div>

        <DashboardDataTable
          :columns="comprasColumns"
          :rows="comprasDocs"
          empty-title="Sin compras"
          empty-description="Todavía no se han importado documentos de compra. Ejecuta la sincronización con alcance «Compras»."
        >
          <template #cell-fecha="{ value }">
            {{ value ? date(value as string) : '—' }}
          </template>
          <template #cell-proveedor="{ value }">
            {{ value ?? '—' }}
          </template>
          <template #cell-estado="{ value }">
            <UBadge
              :label="docEstadoMeta(value as string).label"
              :color="docEstadoMeta(value as string).color"
              variant="subtle"
              size="sm"
            />
          </template>
          <template #cell-skus_pendientes="{ value }">
            <span
              v-if="Array.isArray(value) && value.length"
              class="text-xs text-amber-600"
            >{{ value.join(', ') }}</span>
            <span
              v-else
              class="text-theme-muted"
            >—</span>
          </template>
        </DashboardDataTable>

        <div
          v-if="comprasPagination && comprasPagination.last_page > 1"
          class="flex justify-center"
        >
          <UPagination
            v-model:page="comprasPage"
            :items-per-page="comprasPagination.per_page"
            :total="comprasPagination.total"
            @update:page="loadCompras"
          />
        </div>
      </section>

      <!-- ===== VENTAS (SALIDA) ===== -->
      <section
        v-if="soportaVentas"
        class="surface rounded-2xl border border-theme p-6 space-y-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-theme">
              Ventas (salida)
            </h2>
            <p class="text-sm text-theme-muted">
              Pedidos de la tienda enviados al ERP. Los errores transitorios vuelven a la cola automáticamente; los permanentes se reenvían desde la ficha del pedido.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <UCheckbox
              v-model="ventasSoloCola"
              label="Solo cola"
              @update:model-value="loadVentas(1)"
            />
            <UButton
              label="Actualizar"
              icon="i-lucide-refresh-cw"
              variant="outline"
              size="sm"
              :loading="ventasLoading"
              @click="loadVentas(ventasPage)"
            />
          </div>
        </div>

        <DashboardDataTable
          :columns="ventasColumns"
          :rows="ventasItems"
          empty-title="Sin ventas"
          empty-description="Ningún pedido en estado de sincronización con este ERP."
        >
          <template #cell-numero="{ row }">
            <NuxtLink
              :to="`/admin/pedidos/${(row as IntegrationVentaItem).order_id}`"
              class="text-brand-600 hover:underline font-medium"
            >
              {{ (row as IntegrationVentaItem).numero }}
            </NuxtLink>
          </template>
          <template #cell-estado="{ row }">
            <UBadge
              :label="ventaEstadoMeta((row as IntegrationVentaItem).estado).label"
              :color="ventaEstadoMeta((row as IntegrationVentaItem).estado).color"
              variant="subtle"
              size="sm"
            />
          </template>
          <template #cell-externo_id="{ value }">
            {{ value ?? '—' }}
          </template>
          <template #cell-enviado_en="{ value }">
            {{ value ? date(value as string) : '—' }}
          </template>
          <template #cell-error="{ value }">
            <span
              v-if="value"
              class="text-xs text-red-500"
              :title="value as string"
            >{{ String(value).slice(0, 60) }}{{ String(value).length > 60 ? '…' : '' }}</span>
            <span
              v-else
              class="text-theme-muted"
            >—</span>
          </template>
        </DashboardDataTable>

        <div
          v-if="ventasPagination && ventasPagination.last_page > 1"
          class="flex justify-center"
        >
          <UPagination
            v-model:page="ventasPage"
            :items-per-page="ventasPagination.per_page"
            :total="ventasPagination.total"
            @update:page="loadVentas"
          />
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
