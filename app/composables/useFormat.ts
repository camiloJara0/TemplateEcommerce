export function useFormat() {
  function currency(value: number | null | undefined, code = 'COP', locale = 'es-CO') {
    if (value == null || Number.isNaN(value)) return '—'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'COP' ? 0 : 2
    }).format(value)
  }

  function number(value: number | null | undefined, locale = 'es-CO') {
    if (value == null || Number.isNaN(value)) return '—'
    return new Intl.NumberFormat(locale).format(value)
  }

  function percent(value: number | null | undefined, digits = 1) {
    if (value == null || Number.isNaN(value)) return '—'
    return `${value.toFixed(digits)}%`
  }

  function compact(value: number | null | undefined, locale = 'es-CO') {
    if (value == null || Number.isNaN(value)) return '—'
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  function date(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
    if (!value) return '—'
    const d = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('es-CO', options ?? {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d)
  }

  function relative(value: string | Date | null | undefined) {
    if (!value) return '—'
    const d = typeof value === 'string' ? new Date(value) : value
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours} h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days} d`
    return date(d)
  }

  function discountPercent(price: number, discount?: number | null) {
    if (!discount || discount >= price) return 0
    return Math.round(((price - discount) / price) * 100)
  }

  function effectivePrice(price: number, discount?: number | null) {
    if (discount != null && discount > 0 && discount < price) return discount
    return price
  }

  function initials(name?: string | null) {
    if (!name) return '?'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('')
  }

  return {
    currency,
    number,
    percent,
    compact,
    date,
    relative,
    discountPercent,
    effectivePrice,
    initials
  }
}
