import type { ApiResponse } from '~/types/api'
import type { OfflineActionType, OfflineResource, OutboxItem, OutboxExport } from '~/types/offline'
import { OFFLINE_COLLECTIONS, RESOURCE_COLLECTION } from '~/types/offline'
import { dbGet, dbGetAll, dbPut, dbDelete, dbClear } from '~/utils/idb'
import { isNetworkError } from '~/utils/network'

type Row = Record<string, unknown>

const MAX_ATTEMPTS = 5
const KV_CACHE_PREFIX = 'collection:'

function makeLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useOfflineStore = defineStore('offline', () => {
  const isOnline = ref(true)
  const isReady = ref(false)
  const syncing = ref(false)
  const lastSyncAt = ref<number | null>(null)
  const syncIntervalMs = ref(5 * 60 * 1000)

  const pending = ref<OutboxItem[]>([])
  const collections = ref<Record<string, Row[]>>({})
  const loading = ref<Record<string, boolean>>({})

  const pendingCount = computed(() => pending.value.length)
  const hasPending = computed(() => pending.value.length > 0)
  const isOffline = computed(() => !isOnline.value)

  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let intervalHandle: ReturnType<typeof setInterval> | null = null
  const fetchers = new Map<string, () => Promise<{ data: unknown }>>()

  /* ---------- Persistencia ---------- */

  async function persistCollection(name: string) {
    await dbPut('kv', { key: `${KV_CACHE_PREFIX}${name}`, value: collections.value[name] ?? [], updatedAt: Date.now() })
  }

  async function persistOutbox() {
    for (const item of pending.value) {
      await dbPut('outbox', item)
    }
  }

  function setOffline(value: boolean) {
    isOnline.value = value
  }

  /* ---------- Bootstrap ---------- */

  async function bootstrap() {
    if (isReady.value || typeof window === 'undefined') return
    isReady.value = true

    for (const name of OFFLINE_COLLECTIONS) {
      const cached = await dbGet<{ key: string, value: Row[] }>('kv', `${KV_CACHE_PREFIX}${name}`)
      if (cached?.value) {
        collections.value[name] = cached.value
      }
    }

    pending.value = await dbGetAll<OutboxItem>('outbox')

    const lastSync = await dbGet<{ key: string, value: number }>('meta', 'lastSyncAt')
    if (lastSync?.value) lastSyncAt.value = lastSync.value

    const storedInterval = await dbGet<{ key: string, value: number }>('kv', 'syncIntervalMs')
    if (storedInterval?.value) syncIntervalMs.value = storedInterval.value

    isOnline.value = navigator.onLine

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibility)

    const { authToken } = useApi()
    watch(authToken, (token) => {
      void persistAuthToken(token)
    }, { immediate: true })

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_OUTBOX') {
          void syncNow()
        }
      })
    }

    watch(syncIntervalMs, () => {
      startTimer()
      void dbPut('kv', { key: 'syncIntervalMs', value: syncIntervalMs.value })
    })

    startTimer()

    if (isOnline.value) {
      void syncNow()
    }
  }

  async function persistAuthToken(token: string | null | undefined) {
    if (typeof window === 'undefined') return
    if (token) {
      await dbPut('kv', { key: 'auth_token', value: token, updatedAt: Date.now() })
    } else {
      await dbDelete('kv', 'auth_token')
    }
  }

  function registerBackgroundSync() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    if (pending.value.length === 0) return
    void navigator.serviceWorker.ready
      .then((reg) => {
        const syncManager = (reg as unknown as { sync?: { register(tag: string): Promise<void> } }).sync
        if (syncManager) return syncManager.register('sync-outbox')
      })
      .catch(() => {})
  }

  function handleOnline() {
    isOnline.value = true
    void syncNow()
    registerBackgroundSync()
  }

  function handleOffline() {
    isOnline.value = false
  }

  function handleVisibility() {
    if (document.visibilityState === 'visible' && isOnline.value) {
      void syncNow()
    }
  }

  function startTimer() {
    if (intervalHandle) clearInterval(intervalHandle)
    intervalHandle = setInterval(() => {
      void syncNow()
      void refreshCollections()
    }, syncIntervalMs.value)
  }

  function registerFetcher(name: string, fetcher: () => Promise<{ data: unknown }>) {
    fetchers.set(name, fetcher)
  }

  async function refreshCollections() {
    if (!isOnline.value) return
    const loaded = Object.keys(collections.value)
    for (const name of loaded) {
      const fetcher = fetchers.get(name)
      if (!fetcher) continue
      try {
        await loadCollection(name, fetcher, { force: true })
      } catch {
        // sin red o error: se conserva la caché
      }
    }
  }

  function setSyncInterval(minutes: number) {
    syncIntervalMs.value = minutes * 60 * 1000
  }

  /* ---------- Lecturas offline-first ---------- */

  async function loadCollection<T>(
    name: string,
    fetcher: () => Promise<{ data: T }>,
    options: { key?: string, ttlMs?: number, force?: boolean } = {}
  ): Promise<T> {
    const key = options.key ?? `${KV_CACHE_PREFIX}${name}`
    const ttlMs = options.ttlMs ?? syncIntervalMs.value
    const cached = collections.value[name]

    if (!options.force && cached && cached.length > 0) {
      const fetched = await dbGet<{ key: string, value: number }>('meta', `fetched:${name}`)
      if (fetched?.value && Date.now() - fetched.value < ttlMs) {
        return cached as unknown as T
      }
    }

    loading.value[name] = true
    try {
      fetchers.set(name, fetcher as () => Promise<{ data: unknown }>)
      const res = await fetcher()
      const data = res.data
      collections.value[name] = data as unknown as Row[]
      await persistCollection(name)
      await dbPut('meta', { key: `fetched:${name}`, value: Date.now() })
      return data
    } catch (error) {
      if (isNetworkError(error)) {
        isOnline.value = false
        if (cached) return cached as unknown as T
        const stored = await dbGet<{ key: string, value: Row[] }>('kv', key)
        if (stored?.value) {
          collections.value[name] = stored.value
          return stored.value as unknown as T
        }
      }
      throw error
    } finally {
      loading.value[name] = false
    }
  }

  async function setCollection(name: string, items: Row[]) {
    collections.value[name] = items
    await persistCollection(name)
  }

  /* ---------- Optimistic + cola ---------- */

  function applyOptimistic(item: OutboxItem) {
    const name = RESOURCE_COLLECTION[item.resource]
    const list = collections.value[name] ?? []

    if (item.type === 'create') {
      collections.value[name] = [{ ...item.body, id: item.tempId, _localId: item.tempId }, ...list]
    } else if (item.type === 'update') {
      const idx = list.findIndex(r => r.id === item.targetId || r._localId === item.tempId)
      if (idx >= 0) {
        const next = [...list]
        next[idx] = { ...next[idx]!, ...item.body }
        collections.value[name] = next
      }
    } else if (item.type === 'delete') {
      collections.value[name] = list.filter(r => r.id !== item.targetId && r._localId !== item.tempId)
    }

    void persistCollection(name)
  }

  async function enqueue(payload: {
    type: OfflineActionType
    resource: OfflineResource
    method: 'POST' | 'PUT' | 'DELETE'
    url: string
    body: Record<string, unknown>
  }): Promise<OutboxItem> {
    const localId = makeLocalId()
    const tempId = payload.type === 'create' ? localId : undefined
    const targetId = payload.type === 'create'
      ? undefined
      : typeof payload.body.id === 'number'
        ? payload.body.id
        : undefined

    const list = collections.value[RESOURCE_COLLECTION[payload.resource]] ?? []
    const targetRow = targetId != null
      ? list.find(r => r.id === targetId)
      : list.find(r => r._localId === tempId)

    const item: OutboxItem = {
      localId,
      type: payload.type,
      resource: payload.resource,
      method: payload.method,
      url: payload.url,
      body: payload.body,
      tempId,
      targetId,
      original: targetRow && payload.type !== 'create' ? { ...targetRow } : undefined,
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'pending'
    }

    pending.value.push(item)
    applyOptimistic(item)
    await dbPut('outbox', item)
    scheduleSync()
    registerBackgroundSync()
    return item
  }

  function scheduleSync() {
    if (syncTimer) return
    syncTimer = setTimeout(() => {
      syncTimer = null
      void syncNow()
    }, 1500)
  }

  /* ---------- Sincronización ---------- */

  function handleSyncError(item: OutboxItem, error: unknown) {
    const statusCode = typeof error === 'object' && error !== null
      ? (error as { statusCode?: number }).statusCode
      : undefined
    const message = typeof error === 'object' && error !== null
      ? (error as { data?: { message?: string } }).data?.message
      : undefined

    if (isNetworkError(error)) {
      item.attempts += 1
      item.status = item.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending'
      item.lastError = 'Sin conexión'
      isOnline.value = false
    } else if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
      item.attempts += 1
      item.status = 'failed'
      item.lastError = message || `Error ${statusCode}`
    } else {
      item.attempts += 1
      item.status = item.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending'
      item.lastError = message || (statusCode ? `Error ${statusCode}` : 'Error de red')
    }
  }

  function reconcile(item: OutboxItem, res: ApiResponse<unknown>) {
    const name = RESOURCE_COLLECTION[item.resource]
    const list = collections.value[name] ?? []

    if (item.type === 'create') {
      const created = res.data as Row | undefined
      if (created && typeof created.id !== 'undefined') {
        const idx = list.findIndex(r => r._localId === item.tempId)
        if (idx >= 0) {
          const next = [...list]
          const copy = { ...created }
          delete copy._localId
          next[idx] = { ...next[idx]!, ...copy }
          collections.value[name] = next
        } else {
          collections.value[name] = [created, ...list]
        }
      }
    } else if (item.type === 'update') {
      const updated = res.data as Row | undefined
      const idx = list.findIndex(r => r.id === item.targetId || r._localId === item.tempId)
      if (updated && idx >= 0) {
        const next = [...list]
        next[idx] = { ...next[idx]!, ...updated }
        collections.value[name] = next
      }
    } else if (item.type === 'delete') {
      collections.value[name] = list.filter(r => r.id !== item.targetId && r._localId !== item.tempId)
    }

    void persistCollection(name)
  }

  async function syncNow(targetLocalId?: string) {
    if (typeof window === 'undefined') return
    if (syncing.value || !isOnline.value) return

    const items = targetLocalId
      ? pending.value.filter(p => p.localId === targetLocalId)
      : [...pending.value]

    if (items.length === 0) {
      lastSyncAt.value = Date.now()
      void dbPut('meta', { key: 'lastSyncAt', value: lastSyncAt.value })
      return
    }

    syncing.value = true
    const { request } = useApi()
    try {
      for (const item of items) {
        item.status = 'syncing'
        try {
          const res = await request<ApiResponse<unknown>>(item.url, { method: item.method, body: item.body })
          reconcile(item, res)
          pending.value = pending.value.filter(p => p.localId !== item.localId)
          await dbDelete('outbox', item.localId)
        } catch (error) {
          handleSyncError(item, error)
          if (isNetworkError(error)) break
          if (typeof error === 'object' && error !== null && (error as { statusCode?: number }).statusCode === 401) break
        }
      }
      lastSyncAt.value = Date.now()
      await dbPut('meta', { key: 'lastSyncAt', value: lastSyncAt.value })
      await persistOutbox()
    } finally {
      syncing.value = false
    }
  }

  /* ---------- Gestión de la cola ---------- */

  function revertOptimistic(item: OutboxItem) {
    const name = RESOURCE_COLLECTION[item.resource]
    const list = collections.value[name] ?? []

    if (item.type === 'create' && item.tempId) {
      collections.value[name] = list.filter(r => r._localId !== item.tempId)
    } else if (item.type === 'update' && item.original) {
      const idx = list.findIndex(r => r.id === item.targetId || r._localId === item.tempId)
      if (idx >= 0) {
        const next = [...list]
        next[idx] = { ...next[idx]!, ...item.original }
        collections.value[name] = next
      }
    } else if (item.type === 'delete' && item.original && item.targetId != null) {
      collections.value[name] = [item.original, ...list]
    }

    void persistCollection(name)
  }

  async function editPending(localId: string, body: Record<string, unknown>) {
    const item = pending.value.find(p => p.localId === localId)
    if (!item) return
    item.body = body
    item.attempts = 0
    item.status = 'pending'
    item.lastError = undefined
    applyOptimistic(item)
    await dbPut('outbox', item)
    scheduleSync()
  }

  async function removePending(localId: string) {
    const item = pending.value.find(p => p.localId === localId)
    pending.value = pending.value.filter(p => p.localId !== localId)
    await dbDelete('outbox', localId)
    if (item) revertOptimistic(item)
  }

  async function clearPending() {
    pending.value = []
    await dbClear('outbox')
  }

  /* ---------- Exportar / importar ---------- */

  function exportPending() {
    if (typeof window === 'undefined') return
    const payload: OutboxExport = {
      app: 'CommerceOS',
      version: 1,
      exportedAt: new Date().toISOString(),
      items: pending.value.map(p => ({ ...p }))
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Template-pendientes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importPending(parsed: unknown) {
    const payload = parsed as Partial<OutboxExport>
    if (payload?.app !== 'CommerceOS' || !Array.isArray(payload.items)) {
      throw new Error('Archivo de sincronización inválido')
    }
    for (const item of payload.items) {
      if (!item || typeof item.url !== 'string' || typeof item.body !== 'object' || item.body === null) continue
      await enqueue({
        type: (['create', 'update', 'delete'].includes(item.type) ? item.type : 'update') as OfflineActionType,
        resource: (['task', 'workspace', 'team', 'notification'].includes(item.resource) ? item.resource : 'task') as OfflineResource,
        method: (['POST', 'PUT', 'DELETE'].includes(item.method) ? item.method : 'PUT') as 'POST' | 'PUT' | 'DELETE',
        url: item.url,
        body: item.body as Row
      })
    }
    await syncNow()
    registerBackgroundSync()
  }

  return {
    isOnline, isReady, syncing, lastSyncAt, syncIntervalMs,
    pending, collections, loading,
    pendingCount, hasPending, isOffline,
    bootstrap, setOffline, setSyncInterval,
    registerFetcher, refreshCollections,
    loadCollection, setCollection, persistCollection,
    enqueue, syncNow,
    editPending, removePending, clearPending,
    exportPending, importPending
  }
})
