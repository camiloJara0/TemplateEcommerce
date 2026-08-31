import type { ResponseType } from 'ofetch'
import type { ApiResponse, User } from '~/types/api'

const BASE_URL = 'http://localhost:8000/api/v1'

export interface ApiRequestOptions<TBody = unknown, TQuery extends object = object> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: TBody
  query?: { [K in keyof TQuery]?: string | number | boolean | null | undefined }
  headers?: Record<string, string>
  responseType?: ResponseType
}

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

export function useApi() {
  const toast = useToast()
  const authStore = useAuthStore()

  async function request<T = unknown, TQuery extends object = object, TBody = unknown>(
    url: string,
    options: ApiRequestOptions<TBody, TQuery> = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers || {})
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    const isFormData = options.body instanceof FormData
    if (!isFormData && options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await $fetch<ApiResponse<T>>(`${BASE_URL}${url}`, {
        method: options.method || 'GET',
        body: options.body as BodyInit | Record<string, unknown> | null | undefined,
        query: options.query,
        headers,
        responseType: options.responseType,
        onResponseError({ response: res }) {
          handleError(res.status, res._data as ApiErrorBody | null | undefined)
        }
      })

      const isBlob = options.responseType === 'blob' || response instanceof Blob
      if (!isBlob && response && typeof response === 'object' && 'success' in response && !response.success) {
        throw new Error(response.message || 'Error en la operación.')
      }

      return response
    } catch (error) {
      if (
        error
        && typeof error === 'object'
        && 'statusCode' in error
        && error.statusCode === 401
      ) {
        authStore.clearSession()
        navigateTo('/auth/login')
      }
      throw error
    }
  }

  function handleError(status: number, data: ApiErrorBody | null | undefined) {
    const messages: Record<number, string> = {
      400: 'Datos inválidos. Verifica los campos.',
      401: 'Sesión expirada. Inicia sesión nuevamente.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'Recurso no encontrado.',
      422: data?.message || 'Error de validación.',
      429: 'Demasiadas solicitudes. Intenta más tarde.',
      500: 'Error del servidor. Intenta nuevamente.'
    }

    const message = data?.message || messages[status] || 'Error inesperado.'

    if (status === 422 && data?.errors) {
      const fields = Object.values(data.errors).flat()
      toast.add({
        title: 'Error de validación',
        description: fields.join('. '),
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    } else {
      toast.add({
        title: `Error ${status}`,
        description: message,
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  }

  function showSuccess(message: string, title = 'Operación exitosa') {
    toast.add({
      title,
      description: message,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  function showInfo(message: string, title = 'Información') {
    toast.add({
      title,
      description: message,
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  function showWarning(message: string, title = 'Atención') {
    toast.add({
      title,
      description: message,
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
  }

  function setSession(token: string, userData: User) {
    authStore.setSession(token, userData)
  }

  function clearSession() {
    authStore.clearSession()
  }

  return {
    request,
    showSuccess,
    showInfo,
    showWarning,
    handleError,
    setSession,
    clearSession,
    authToken: computed(() => authStore.token),
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated)
  }
}
