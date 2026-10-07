interface Pagination {
  last_page?: number
  current_page?: number
}

interface ProductsResponse {
  data?: {
    data?: Array<{ slug?: string, updated_at?: string }>
    pagination?: Pagination
  }
}

interface CategoriesResponse {
  data?: Array<{ slug?: string, updated_at?: string }>
}

const STATIC_ROUTES: Array<{ path: string, priority: string, changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/catalogo', priority: '0.9', changefreq: 'daily' },
  { path: '/ofertas', priority: '0.8', changefreq: 'daily' },
  { path: '/nosotros', priority: '0.5', changefreq: 'monthly' },
  { path: '/ayuda', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.3', changefreq: 'yearly' }
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod?: string | null, priority = '0.7', changefreq = 'weekly'): string {
  const last = lastmod ? new Date(lastmod) : null
  const lastTag = last && !Number.isNaN(last.getTime())
    ? `\n    <lastmod>${last.toISOString()}</lastmod>`
    : ''

  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const origin = String(config.public.siteUrl || 'http://localhost:3000').replace(/\/+$/, '')
  const api = String(config.public.apiBase || 'http://localhost:8000').replace(/\/+$/, '')

  const entries: string[] = STATIC_ROUTES.map(route => urlEntry(`${origin}${route.path}`, null, route.priority, route.changefreq))

  const fetchJson = async <T>(url: string): Promise<T | null> => {
    try {
      const data = await $fetch(url, {
        headers: { Accept: 'application/json' },
        timeout: 8000
      })
      return data as unknown as T
    } catch {
      return null
    }
  }

  // Categorías → /catalogo?categoria={slug}
  const categorias = await fetchJson<CategoriesResponse>(`${api}/api/v1/categorias`)
  for (const categoria of categorias?.data ?? []) {
    if (!categoria.slug) continue
    entries.push(urlEntry(`${origin}/catalogo?categoria=${encodeURIComponent(categoria.slug)}`, categoria.updated_at, '0.6', 'weekly'))
  }

  // Productos → /producto/{slug} (máx. 10 páginas x 100 = 1.000 productos)
  let page = 1
  let lastPage = 1
  while (page <= lastPage) {
    const res = await fetchJson<ProductsResponse>(`${api}/api/v1/productos?per_page=100&page=${page}`)
    const productos = res?.data?.data ?? []

    for (const producto of productos) {
      if (!producto.slug) continue
      entries.push(urlEntry(`${origin}/producto/${encodeURIComponent(producto.slug)}`, producto.updated_at, '0.8', 'weekly'))
    }

    lastPage = Math.min(Number(res?.data?.pagination?.last_page ?? 1), 10)
    page += 1
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')

  return xml
})
