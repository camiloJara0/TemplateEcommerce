export type IntegrationEstado
  = | 'sin_credenciales'
    | 'inactiva'
    | 'activa'
    | 'sincronizando'
    | 'con_errores'
    | 'pausada_por_errores'

export interface IntegrationProviderField {
  label: string
  type: 'text' | 'password' | 'url'
  required: boolean
  placeholder?: string
}

export interface IntegrationSistema {
  key: string
  label: string
  description: string | null
  version: string | null
  capabilities: string[]
  supports_login: boolean
  fields: Record<string, IntegrationProviderField>
}

export interface IntegrationUltimaEjecucion {
  id: number
  tipo: string
  estado: string
  procesados: number
  creados: number
  actualizados: number
  omitidos: number
  errores: number
  iniciado_en: string | null
  finalizado_en: string | null
}

export interface IntegrationConfigSync {
  frecuencia_minutos?: number
  direccion?: string
  productos?: boolean
  inventario?: boolean
}

export interface Integration {
  id: number
  nombre: string
  provider: string
  provider_info: {
    label: string
    description: string | null
    version: string | null
    capabilities: string[]
    supports_login: boolean
  }
  estado: IntegrationEstado
  estado_label: string
  configurado: boolean
  credenciales_configuradas: Record<string, boolean>
  soporta_login: boolean
  rol_login_federado: string | null
  config_sincronizacion: IntegrationConfigSync | null
  ultimo_sincronizado: string | null
  ultimo_estado: string | null
  intentos_fallo: number
  activa: boolean
  ultima_ejecucion: IntegrationUltimaEjecucion | null
  created_at: string | null
  updated_at: string | null
}

export interface IntegrationSyncRun {
  id: number
  tipo: string
  origen?: string
  estado: string
  procesados: number
  creados: number
  actualizados: number
  omitidos: number
  errores: number
  iniciado_en: string | null
  finalizado_en: string | null
}

export interface IntegrationPayload {
  nombre?: string
  provider?: string
  soporta_login?: boolean
  rol_login_federado?: string | null
  config_sincronizacion?: IntegrationConfigSync
  credenciales?: Record<string, string>
}

export interface ImportacionInicialPreview {
  total_externos: number
  registros_existentes: number
  proyectados: number
}
