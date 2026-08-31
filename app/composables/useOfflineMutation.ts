import type { ApiResponse } from '~/types/api'
import type { OfflineActionType, OfflineResource } from '~/types/offline'
import { isNetworkError } from '~/utils/network'

export interface OfflineMutationConfig {
  type: OfflineActionType
  resource: OfflineResource
  method: 'POST' | 'PUT' | 'DELETE'
  url: string
  body?: Record<string, unknown>
}

export interface MutationOptions<T> {
  /** Petición online */
  request: () => Promise<ApiResponse<T>>
  /** Si hay red falla, encola esta mutación (opcional en lecturas) */
  offline?: OfflineMutationConfig
  /** Mensaje toast de éxito online */
  successMessage?: string
  /** Mensaje cuando se encola offline */
  offlineMessage?: string
  /** Actualizar store / estado local con la respuesta */
  onSuccess?: (data: T, res: ApiResponse<T>, meta: { offline: boolean }) => void | Promise<void>
  /** Redirección tras éxito online (no offline) */
  redirectTo?: string | ((data: T) => string)
  /** Si true, no muestra toast de éxito */
  silent?: boolean
  /** Forzar cola offline aunque haya red (tests) */
  forceOffline?: boolean
}

/**
 * Ejecuta una mutación online o la encola en el outbox offline-first.
 * Centraliza toasts, actualización de stores y redirects.
 */
export async function runMutation<T = unknown>(options: MutationOptions<T>): Promise<{
  data: T | null
  offline: boolean
  res?: ApiResponse<T>
}> {
  const offlineStore = useOfflineStore()
  const { showSuccess } = useApi()
  const toast = useToast()

  const goOffline = options.forceOffline || !offlineStore.isOnline

  if (goOffline) {
    if (!options.offline) {
      toast.add({
        title: 'Sin conexión',
        description: 'Esta acción requiere conexión a internet.',
        color: 'warning',
        icon: 'i-lucide-wifi-off'
      })
      throw new Error('OFFLINE_UNSUPPORTED')
    }

    const item = await offlineStore.enqueue({
      type: options.offline.type,
      resource: options.offline.resource,
      method: options.offline.method,
      url: options.offline.url,
      body: options.offline.body ?? {}
    })

    const optimistic = {
      ...(options.offline.body ?? {}),
      id: item.tempId ?? item.targetId,
      _localId: item.tempId
    } as T

    if (!options.silent) {
      showSuccess(options.offlineMessage || 'Guardado offline. Se sincronizará al reconectar.')
    }

    await options.onSuccess?.(optimistic, {
      success: true,
      data: optimistic,
      message: 'queued'
    }, { offline: true })

    return { data: optimistic, offline: true }
  }

  try {
    const res = await options.request()
    const data = res.data

    if (!options.silent && options.successMessage) {
      showSuccess(options.successMessage)
    }

    await options.onSuccess?.(data, res, { offline: false })

    if (options.redirectTo && import.meta.client) {
      const path = typeof options.redirectTo === 'function'
        ? options.redirectTo(data)
        : options.redirectTo
      if (path) await navigateTo(path)
    }

    return { data, offline: false, res }
  } catch (error) {
    if (isNetworkError(error) && options.offline) {
      offlineStore.setOffline(true)
      return runMutation({ ...options, forceOffline: true })
    }
    throw error
  }
}

/**
 * Carga una colección con caché IndexedDB (offline-first).
 */
export async function loadCachedCollection<T>(
  name: string,
  fetcher: () => Promise<ApiResponse<T>>,
  options?: { force?: boolean, ttlMs?: number }
): Promise<T> {
  const offlineStore = useOfflineStore()
  return offlineStore.loadCollection(name, fetcher, options)
}
