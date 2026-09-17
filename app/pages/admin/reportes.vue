<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const { currency, date } = useFormat()
const { request } = useApi()

const ventasItems = ref<any[]>([])
const ventasTotales = ref<any>(null)
const inventarioItems = ref<any[]>([])
const inventarioTotales = ref<any>(null)
const clientesItems = ref<any[]>([])
const productosItems = ref<any[]>([])
const loading = ref(false)
const activeTab = ref('ventas')

const ventasDesde = ref('')
const ventasHasta = ref('')
const inventarioSearch = ref('')

const tabs = [
  { key: 'ventas', label: 'Ventas', icon: 'i-lucide-trending-up' },
  { key: 'inventario', label: 'Inventario', icon: 'i-lucide-package' },
  { key: 'clientes', label: 'Clientes', icon: 'i-lucide-users' },
  { key: 'productos', label: 'Productos', icon: 'i-lucide-star' },
]

const ventasColumns = [
  { key: 'numero', label: 'Número' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'subtotal', label: 'Subtotal' },
  { key: 'envio', label: 'Envío' },
  { key: 'total', label: 'Total' },
  { key: 'estado', label: 'Estado' },
]

const inventarioColumns = [
  { key: 'nombre', label: 'Producto' },
  { key: 'sku', label: 'SKU' },
  { key: 'stock', label: 'Stock' },
  { key: 'precio', label: 'Precio' },
  { key: 'estado', label: 'Estado' },
  { key: 'variantes', label: 'Variantes' },
]

const clientesColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'registro', label: 'Registro' },
  { key: 'pedidos', label: 'Pedidos' },
]

const productosColumns = [
  { key: 'nombre', label: 'Producto' },
  { key: 'sku', label: 'SKU' },
  { key: 'stock', label: 'Stock' },
  { key: 'precio', label: 'Precio' },
  { key: 'rating', label: 'Rating' },
  { key: 'resenas', label: 'Reseñas' },
]

const estadoColor = (estado: string) => {
  const map: Record<string, string> = {
    entregado: 'success',
    enviado: 'info',
    pagado: 'warning',
    cancelado: 'error',
    nuevo: 'primary',
  }
  return (map[estado] || 'neutral') as any
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

async function downloadReport(tipo: string, formato: string, query?: Record<string, string>) {
  const params = { ...query, formato }
  const res = await request<Blob>(`/admin/reportes/${tipo}`, {
    query: params,
    responseType: 'blob'
  })
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
  const ext = formato === 'excel' ? 'xlsx' : formato
  downloadBlob(blob, `reporte-${tipo}.${ext}`)
}

async function loadVentas() {
  loading.value = true
  try {
    const query: Record<string, string> = {}
    if (ventasDesde.value) query.desde = ventasDesde.value
    if (ventasHasta.value) query.hasta = ventasHasta.value
    const res = await request<{ items: any[], totales: any }>('/admin/reportes/ventas', { query })
    ventasItems.value = res.data.items
    ventasTotales.value = res.data.totales
  } finally {
    loading.value = false
  }
}

async function loadInventario() {
  loading.value = true
  try {
    const query: Record<string, string> = {}
    if (inventarioSearch.value) query.busqueda = inventarioSearch.value
    const res = await request<{ items: any[], totales: any }>('/admin/reportes/inventario', { query })
    inventarioItems.value = res.data.items
    inventarioTotales.value = res.data.totales
  } finally {
    loading.value = false
  }
}

async function loadClientes() {
  loading.value = true
  try {
    const res = await request<{ items: any[] }>('/admin/reportes/clientes')
    clientesItems.value = res.data.items
  } finally {
    loading.value = false
  }
}

async function loadProductos() {
  loading.value = true
  try {
    const res = await request<{ items: any[] }>('/admin/reportes/productos')
    productosItems.value = res.data.items
  } finally {
    loading.value = false
  }
}

function loadData(tab: string) {
  switch (tab) {
    case 'ventas':
      loadVentas()
      break
    case 'inventario':
      loadInventario()
      break
    case 'clientes':
      loadClientes()
      break
    case 'productos':
      loadProductos()
      break
  }
}

function onTabChange(val: string | number) {
  const tab = String(val)
  activeTab.value = tab
  loadData(tab)
}

onMounted(() => loadData('ventas'))

useSeoMeta({ title: 'Reportes — Admin' })
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          Reportes
        </h1>
        <p class="page-subtitle">
          Análisis de ventas, inventario, clientes y productos
        </p>
      </div>
    </div>

    <UTabs :items="tabs" variant="link" @update:model-value="onTabChange">
      <template #content="{ item }">
        <!-- ===== VENTAS ===== -->
        <div v-if="item.key === 'ventas'" class="space-y-6 mt-6">
          <div class="flex flex-wrap items-end gap-4">
            <UField label="Desde" name="desde">
              <UInput v-model="ventasDesde" type="date" class="w-44" />
            </UField>
            <UField label="Hasta" name="hasta">
              <UInput v-model="ventasHasta" type="date" class="w-44" />
            </UField>
            <UButton label="Buscar" icon="i-lucide-search" color="primary" @click="loadVentas" />
          </div>

          <div v-if="ventasTotales" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Total ventas</p>
              <p class="text-2xl font-bold text-theme">{{ ventasTotales.ventas }}</p>
            </div>
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Ingresos</p>
              <p class="text-2xl font-bold text-theme">{{ currency(ventasTotales.ingresos) }}</p>
            </div>
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Impuestos</p>
              <p class="text-2xl font-bold text-theme">{{ currency(ventasTotales.impuestos) }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton label="CSV" icon="i-lucide-file-text" size="xs" variant="outline" color="neutral" @click="downloadReport('ventas', 'csv')" />
            <UButton label="PDF" icon="i-lucide-file" size="xs" variant="outline" color="neutral" @click="downloadReport('ventas', 'pdf')" />
            <UButton label="Excel" icon="i-lucide-table" size="xs" variant="outline" color="neutral" @click="downloadReport('ventas', 'excel')" />
          </div>

          <DashboardDataTable :columns="ventasColumns" :rows="ventasItems" :loading="loading" empty-title="Sin ventas" empty-description="No se encontraron ventas para el período seleccionado.">
            <template #cell-fecha="{ value }">
              {{ date(value as string) }}
            </template>
            <template #cell-subtotal="{ value }">
              {{ currency(value as number) }}
            </template>
            <template #cell-envio="{ value }">
              {{ currency(value as number) }}
            </template>
            <template #cell-total="{ value }">
              <span class="font-semibold">{{ currency(value as number) }}</span>
            </template>
            <template #cell-estado="{ value }">
              <UBadge :label="value as string" :color="estadoColor(value as string)" variant="subtle" size="sm" />
            </template>
          </DashboardDataTable>
        </div>

        <!-- ===== INVENTARIO ===== -->
        <div v-else-if="item.key === 'inventario'" class="space-y-6 mt-6">
          <div class="flex flex-wrap items-end gap-4">
            <UField label="Buscar producto" name="busqueda">
              <UInput v-model="inventarioSearch" placeholder="Nombre o SKU…" icon="i-lucide-search" class="w-64" />
            </UField>
            <UButton label="Buscar" icon="i-lucide-search" color="primary" @click="loadInventario" />
          </div>

          <div v-if="inventarioTotales" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Productos</p>
              <p class="text-2xl font-bold text-theme">{{ inventarioTotales.productos }}</p>
            </div>
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Stock total</p>
              <p class="text-2xl font-bold text-theme">{{ inventarioTotales.stock_total }}</p>
            </div>
            <div class="surface p-4">
              <p class="text-sm text-theme-muted">Agotados</p>
              <p class="text-2xl font-bold text-rose-500">{{ inventarioTotales.agotados }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton label="CSV" icon="i-lucide-file-text" size="xs" variant="outline" color="neutral" @click="downloadReport('inventario', 'csv')" />
            <UButton label="PDF" icon="i-lucide-file" size="xs" variant="outline" color="neutral" @click="downloadReport('inventario', 'pdf')" />
            <UButton label="Excel" icon="i-lucide-table" size="xs" variant="outline" color="neutral" @click="downloadReport('inventario', 'excel')" />
          </div>

          <DashboardDataTable :columns="inventarioColumns" :rows="inventarioItems" :loading="loading" empty-title="Sin inventario" empty-description="No se encontraron productos.">
            <template #cell-stock="{ value }">
              <span :class="(value as number) <= 5 ? 'text-rose-500 font-semibold' : ''">{{ value }}</span>
            </template>
            <template #cell-precio="{ value }">
              {{ currency(value as number) }}
            </template>
            <template #cell-estado="{ value }">
              <UBadge :label="value as string" :color="value === 'activo' ? 'success' : 'neutral'" variant="subtle" size="sm" />
            </template>
          </DashboardDataTable>
        </div>

        <!-- ===== CLIENTES ===== -->
        <div v-else-if="item.key === 'clientes'" class="space-y-6 mt-6">
          <div class="flex gap-2">
            <UButton label="CSV" icon="i-lucide-file-text" size="xs" variant="outline" color="neutral" @click="downloadReport('clientes', 'csv')" />
            <UButton label="PDF" icon="i-lucide-file" size="xs" variant="outline" color="neutral" @click="downloadReport('clientes', 'pdf')" />
            <UButton label="Excel" icon="i-lucide-table" size="xs" variant="outline" color="neutral" @click="downloadReport('clientes', 'excel')" />
          </div>

          <DashboardDataTable :columns="clientesColumns" :rows="clientesItems" :loading="loading" empty-title="Sin clientes" empty-description="No se encontraron clientes registrados.">
            <template #cell-telefono="{ value }">
              {{ value || '—' }}
            </template>
            <template #cell-registro="{ value }">
              {{ date(value as string) }}
            </template>
            <template #cell-pedidos="{ value }">
              <span class="font-semibold">{{ value }}</span>
            </template>
          </DashboardDataTable>
        </div>

        <!-- ===== PRODUCTOS ===== -->
        <div v-else-if="item.key === 'productos'" class="space-y-6 mt-6">
          <div class="flex gap-2">
            <UButton label="CSV" icon="i-lucide-file-text" size="xs" variant="outline" color="neutral" @click="downloadReport('productos', 'csv')" />
            <UButton label="PDF" icon="i-lucide-file" size="xs" variant="outline" color="neutral" @click="downloadReport('productos', 'pdf')" />
            <UButton label="Excel" icon="i-lucide-table" size="xs" variant="outline" color="neutral" @click="downloadReport('productos', 'excel')" />
          </div>

          <DashboardDataTable :columns="productosColumns" :rows="productosItems" :loading="loading" empty-title="Sin productos" empty-description="No se encontraron productos.">
            <template #cell-precio="{ value }">
              {{ currency(value as number) }}
            </template>
            <template #cell-rating="{ value }">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-star" class="size-4 text-yellow-400 fill-yellow-400" />
                <span>{{ (value as number).toFixed(1) }}</span>
              </div>
            </template>
          </DashboardDataTable>
        </div>
      </template>
    </UTabs>
  </div>
</template>
