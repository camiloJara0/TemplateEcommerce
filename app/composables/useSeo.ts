/**
 * Utilidades de SEO on-page: URL canónica, hreflang y URLs absolutas
 * para datos estructurados (JSON-LD).
 */

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref'
]

export function useSiteUrl(): string {
  const config = useRuntimeConfig()
  const raw = String(config.public.siteUrl || 'http://localhost:3000')
  return raw.replace(/\/+$/, '')
}

/** Quita parámetros de tracking (utm_*, fbclid, gclid…) para la URL canónica. */
export function stripTracking(fullPath: string): string {
  const [path, query] = (fullPath || '/').split('?')
  if (!query) return path || '/'

  const params = new URLSearchParams(query)
  TRACKING_PARAMS.forEach(key => params.delete(key))
  const search = params.toString()

  return `${path || '/'}${search ? `?${search}` : ''}`
}

/** Convierte una ruta relativa en URL absoluta (para JSON-LD, og:url, sitemap). */
export function absoluteUrl(fullPath: string, base?: string): string {
  if (/^https?:\/\//i.test(fullPath)) return fullPath

  let origin = base
  if (!origin) {
    try {
      origin = useSiteUrl()
    } catch {
      origin = 'http://localhost:3000'
    }
  }

  const clean = origin.replace(/\/+$/, '')
  return `${clean}${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`
}

interface UseSeoOptions {
  /** Ruta a usar como canónica. Por defecto: la ruta actual sin tracking. */
  path?: string | (() => string)
  /** Marca la página como noindex (también se puede hacer por página con useSeoMeta). */
  noindex?: boolean
}

/**
 * Registra la URL canónica, hreflang (`es` + `x-default`) y og:url de la
 * página actual. Llamar una sola vez a nivel global (app.vue); las páginas
 * solo necesitan usar `useSeoMeta` para título/descripción.
 */
export function useSeo(options: UseSeoOptions = {}) {
  const route = useRoute()
  const origin = useSiteUrl()

  const canonicalPath = computed(() => {
    const custom = typeof options.path === 'function' ? options.path() : options.path
    return stripTracking(custom ?? route.fullPath)
  })

  const canonicalUrl = computed(() => `${origin}${canonicalPath.value}`)

  useSeoMeta({
    ogUrl: () => canonicalUrl.value,
    ...(options.noindex ? { robots: 'noindex, nofollow' } : {})
  })

  useHead({
    link: [
      { key: 'canonical', rel: 'canonical', href: () => canonicalUrl.value },
      { key: 'alternate-es', rel: 'alternate', hreflang: 'es', href: () => canonicalUrl.value },
      { key: 'alternate-x-default', rel: 'alternate', hreflang: 'x-default', href: () => canonicalUrl.value }
    ]
  })

  return { canonicalUrl, canonicalPath }
}
