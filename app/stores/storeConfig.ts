import type { AdminStoreConfig, PublicStoreConfig, StoreConfigPayload, TiendaConfig } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

const TIENDA_SS_KEY = 'tienda_config_cache'
const PUBLIC_SS_KEY = 'public_config_cache'

function readSS<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return null
}

function writeSS(key: string, data: unknown) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore */ }
}

export const useStoreConfigStore = defineStore('storeConfig', () => {
  const offlineStore = useOfflineStore()
  const publicConfig = ref<PublicStoreConfig | null>(null)
  const adminConfig = ref<AdminStoreConfig | null>(null)
  const tiendaConfig = ref<TiendaConfig | null>(null)
  const loadingPublic = ref(false)
  const loadingAdmin = ref(false)
  const loadingTienda = ref(false)

  const currency = computed(() => publicConfig.value?.currency ?? 'COP')
  const taxRate = computed(() => publicConfig.value?.tax_rate ?? 0)
  const storeName = computed(() => publicConfig.value?.store_name ?? 'CommerceOS')

  const effectiveTiendaConfig = computed<TiendaConfig>(() => {
    if (!tiendaConfig.value) return DEFAULT_TIENDA_CONFIG
    return {
      ...DEFAULT_TIENDA_CONFIG,
      ...tiendaConfig.value,
      secciones: {
        ...DEFAULT_TIENDA_CONFIG.secciones,
        ...(tiendaConfig.value.secciones ?? {}),
        hero: { ...DEFAULT_TIENDA_CONFIG.secciones.hero, ...(tiendaConfig.value.secciones?.hero ?? {}) },
        benefits: { ...DEFAULT_TIENDA_CONFIG.secciones.benefits, ...(tiendaConfig.value.secciones?.benefits ?? {}) },
        categories: { ...DEFAULT_TIENDA_CONFIG.secciones.categories, ...(tiendaConfig.value.secciones?.categories ?? {}) },
        featured: { ...DEFAULT_TIENDA_CONFIG.secciones.featured, ...(tiendaConfig.value.secciones?.featured ?? {}) },
        deals: { ...DEFAULT_TIENDA_CONFIG.secciones.deals, ...(tiendaConfig.value.secciones?.deals ?? {}) },
        testimonials: { ...DEFAULT_TIENDA_CONFIG.secciones.testimonials, ...(tiendaConfig.value.secciones?.testimonials ?? {}) },
        newsletter: { ...DEFAULT_TIENDA_CONFIG.secciones.newsletter, ...(tiendaConfig.value.secciones?.newsletter ?? {}) },
        brand_logos: { ...DEFAULT_TIENDA_CONFIG.secciones.brand_logos, ...(tiendaConfig.value.secciones?.brand_logos ?? {}) },
        gallery_feed: { ...DEFAULT_TIENDA_CONFIG.secciones.gallery_feed, ...(tiendaConfig.value.secciones?.gallery_feed ?? {}) },
        stats: { ...DEFAULT_TIENDA_CONFIG.secciones.stats, ...(tiendaConfig.value.secciones?.stats ?? {}) },
        video: { ...DEFAULT_TIENDA_CONFIG.secciones.video, ...(tiendaConfig.value.secciones?.video ?? {}) },
        map: { ...DEFAULT_TIENDA_CONFIG.secciones.map, ...(tiendaConfig.value.secciones?.map ?? {}) },
        richtext: { ...DEFAULT_TIENDA_CONFIG.secciones.richtext, ...(tiendaConfig.value.secciones?.richtext ?? {}) },
        cta: { ...DEFAULT_TIENDA_CONFIG.secciones.cta, ...(tiendaConfig.value.secciones?.cta ?? {}) },
      },
      header: { ...DEFAULT_TIENDA_CONFIG.header, ...(tiendaConfig.value.header ?? {}) },
      categories_home: { ...DEFAULT_TIENDA_CONFIG.categories_home, ...(tiendaConfig.value.categories_home ?? {}) },
      producto: { ...DEFAULT_TIENDA_CONFIG.producto, ...(tiendaConfig.value.producto ?? {}) },
      nosotros: {
        ...DEFAULT_TIENDA_CONFIG.nosotros,
        ...(tiendaConfig.value.nosotros ?? {}),
        hero: { ...DEFAULT_TIENDA_CONFIG.nosotros.hero, ...(tiendaConfig.value.nosotros?.hero ?? {}) },
        mission_vision: { ...DEFAULT_TIENDA_CONFIG.nosotros.mission_vision, ...(tiendaConfig.value.nosotros?.mission_vision ?? {}) },
        values: { ...DEFAULT_TIENDA_CONFIG.nosotros.values, ...(tiendaConfig.value.nosotros?.values ?? {}) },
        team: { ...DEFAULT_TIENDA_CONFIG.nosotros.team, ...(tiendaConfig.value.nosotros?.team ?? {}) },
        timeline: { ...DEFAULT_TIENDA_CONFIG.nosotros.timeline, ...(tiendaConfig.value.nosotros?.timeline ?? {}) },
        map: { ...DEFAULT_TIENDA_CONFIG.nosotros.map, ...(tiendaConfig.value.nosotros?.map ?? {}) },
        cta: { ...DEFAULT_TIENDA_CONFIG.nosotros.cta, ...(tiendaConfig.value.nosotros?.cta ?? {}) },
      },
      estilos: {
        ...DEFAULT_TIENDA_CONFIG.estilos,
        ...(tiendaConfig.value.estilos ?? {}),
        fondos: { ...DEFAULT_TIENDA_CONFIG.estilos.fondos, ...(tiendaConfig.value.estilos?.fondos ?? {}) },
        paleta: { ...DEFAULT_TIENDA_CONFIG.estilos.paleta, ...(tiendaConfig.value.estilos?.paleta ?? {}) },
      },
      brand: { ...DEFAULT_TIENDA_CONFIG.brand, ...(tiendaConfig.value.brand ?? {}) },
      navbar: { ...DEFAULT_TIENDA_CONFIG.navbar, ...(tiendaConfig.value.navbar ?? {}) },
      footer: { ...DEFAULT_TIENDA_CONFIG.footer, ...(tiendaConfig.value.footer ?? {}) },
      page_sections: tiendaConfig.value.page_sections ?? DEFAULT_TIENDA_CONFIG.page_sections,
    }
  })

  async function loadPublic(force = false) {
    // Intentar cache de sessionStorage para carga instantánea
    if (!force && !publicConfig.value) {
      const cached = readSS<PublicStoreConfig>(PUBLIC_SS_KEY)
      if (cached) publicConfig.value = cached
    }

    loadingPublic.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<PublicStoreConfig>(
        'store_config',
        () => request<PublicStoreConfig>('/configuracion/publica'),
        { force }
      )
      publicConfig.value = data
      writeSS(PUBLIC_SS_KEY, data)
    } finally {
      loadingPublic.value = false
    }
  }

  async function loadAdmin() {
    loadingAdmin.value = true
    try {
      const { request } = useApi()
      const res = await request<AdminStoreConfig>('/admin/configuracion')
      adminConfig.value = res.data
    } finally {
      loadingAdmin.value = false
    }
  }

  async function updateAdmin(payload: StoreConfigPayload) {
    const { request } = useApi()
    return runMutation<AdminStoreConfig>({
      request: () => request<AdminStoreConfig>('/admin/configuracion', { method: 'PUT', body: payload }),
      offline: {
        type: 'update',
        resource: 'store_config',
        method: 'PUT',
        url: '/admin/configuracion',
        body: { ...payload }
      },
      successMessage: 'Configuración actualizada',
      onSuccess: (data) => {
        adminConfig.value = data
        if (publicConfig.value) {
          publicConfig.value = {
            ...publicConfig.value,
            store_name: data.general.store_name,
            store_tagline: data.general.store_tagline ?? null,
            logo: data.general.logo ?? null,
            currency: data.general.currency,
            tax_rate: data.general.tax_rate,
            default_language: data.general.default_language,
            support_email: data.general.support_email ?? null,
            support_phone: data.general.support_phone ?? null,
            color_primario: data.colores.color_primario,
            color_secundario: data.colores.color_secundario,
            color_fondo: data.colores.color_fondo,
            meta_title: data.seo.meta_title ?? null,
            meta_description: data.seo.meta_description ?? null,
            meta_keywords: data.seo.meta_keywords ?? null,
            og_image: data.seo.og_image ?? null
          }
          writeSS(PUBLIC_SS_KEY, publicConfig.value)
        }
      }
    })
  }

  async function loadTienda(force = false) {
    // Intentar cache de sessionStorage para carga instantánea
    if (!force && !tiendaConfig.value) {
      const cached = readSS<TiendaConfig>(TIENDA_SS_KEY)
      if (cached) {
        tiendaConfig.value = cached
        loadingTienda.value = false
        return
      }
    }

    loadingTienda.value = true
    try {
      const { request } = useApi()
      const data = await offlineStore.loadCollection<TiendaConfig>(
        'tienda_config',
        () => request<TiendaConfig>('/configuracion/tienda'),
        { force }
      )
      tiendaConfig.value = data
      writeSS(TIENDA_SS_KEY, data)
    } finally {
      loadingTienda.value = false
    }
  }

  async function loadCombined(force = false) {
    if (!force && publicConfig.value && tiendaConfig.value) return

    loadingPublic.value = true
    loadingTienda.value = true
    try {
      const { request } = useApi()
      const res = await request<{ publica: PublicStoreConfig; tienda: TiendaConfig }>(
        '/configuracion/completa'
      )
      publicConfig.value = res.data.publica
      tiendaConfig.value = res.data.tienda
      writeSS(PUBLIC_SS_KEY, res.data.publica)
      writeSS(TIENDA_SS_KEY, res.data.tienda)
    } finally {
      loadingPublic.value = false
      loadingTienda.value = false
    }
  }

  async function loadTiendaAdmin() {
    loadingTienda.value = true
    try {
      const { request } = useApi()
      const res = await request<TiendaConfig>('/admin/configuracion/tienda')
      tiendaConfig.value = res.data
      writeSS(TIENDA_SS_KEY, res.data)
    } finally {
      loadingTienda.value = false
    }
  }

  async function updateTienda(config: TiendaConfig) {
    const { request } = useApi()
    return runMutation<TiendaConfig>({
      request: () => request<TiendaConfig>('/admin/configuracion/tienda', { method: 'PUT', body: config }),
      offline: {
        type: 'update',
        resource: 'tienda_config',
        method: 'PUT',
        url: '/admin/configuracion/tienda',
        body: { ...config }
      },
      successMessage: 'Configuración de tienda guardada',
      onSuccess: (data) => {
        tiendaConfig.value = data
        writeSS(TIENDA_SS_KEY, data)
        if (import.meta.client) {
          void offlineStore.loadCollection<TiendaConfig>(
            'tienda_config',
            () => request<TiendaConfig>('/configuracion/tienda'),
            { force: true }
          )
        }
      }
    })
  }

  return {
    publicConfig, adminConfig, tiendaConfig,
    loadingPublic, loadingAdmin, loadingTienda,
    currency, taxRate, storeName, effectiveTiendaConfig,
    loadPublic, loadAdmin, updateAdmin,
    loadTienda, loadCombined, loadTiendaAdmin, updateTienda
  }
})
