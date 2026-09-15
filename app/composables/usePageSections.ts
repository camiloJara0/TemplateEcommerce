import type { TiendaConfig, PageSection, SectionKey } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'
import { getSectionDefinition, getDefaultConfigForSection } from '~/lib/SectionRegistry'

export function usePageSections() {
  function getOrderedSections(config: TiendaConfig): PageSection[] {
    if (!config.page_sections || config.page_sections.length === 0) {
      return migrateToPageSections(config)
    }
    return [...config.page_sections].sort((a, b) => a.order - b.order)
  }

  function getVisibleSections(config: TiendaConfig): PageSection[] {
    return getOrderedSections(config).filter(s => s.visible)
  }

  function migrateToPageSections(config: TiendaConfig): PageSection[] {
    const sections: PageSection[] = []
    let order = 0

    // Header
    sections.push({
      id: 'header-1',
      type: '_header',
      order: order++,
      visible: config.header?.show ?? true,
      variant: (config.header as any)?.variant ?? 'animation',
      config: {},
    })

    // Hero
    sections.push({
      id: 'hero-1',
      type: 'hero',
      order: order++,
      visible: true,
      variant: (config.secciones.hero as any)?.variant ?? 'classic',
      config: {},
    })

    // Benefits
    sections.push({
      id: 'benefits-1',
      type: 'benefits',
      order: order++,
      visible: true,
      variant: (config.secciones.benefits as any)?.variant ?? 'icons',
      config: {},
    })

    // Categories Home
    sections.push({
      id: 'categories-home-1',
      type: '_categories_home',
      order: order++,
      visible: config.categories_home?.show ?? true,
      variant: (config.categories_home as any)?.variant ?? 'grid',
      config: {},
    })

    // Featured
    sections.push({
      id: 'featured-1',
      type: 'featured',
      order: order++,
      visible: true,
      variant: (config.secciones.featured as any)?.variant ?? 'grid',
      config: {},
    })

    // Deals
    sections.push({
      id: 'deals-1',
      type: 'deals',
      order: order++,
      visible: config.secciones.deals?.show_section ?? true,
      variant: 'default',
      config: {},
    })

    // Testimonials
    sections.push({
      id: 'testimonials-1',
      type: 'testimonials',
      order: order++,
      visible: true,
      variant: (config.secciones.testimonials as any)?.variant ?? 'cards',
      config: {},
    })

    // Newsletter
    if (config.secciones.newsletter?.show) {
      sections.push({
        id: 'newsletter-1',
        type: 'newsletter',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // Brand Logos
    if (config.secciones.brand_logos?.show) {
      sections.push({
        id: 'brand-logos-1',
        type: 'brand_logos',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // Gallery Feed
    if (config.secciones.gallery_feed?.show) {
      sections.push({
        id: 'gallery-feed-1',
        type: 'gallery_feed',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // Stats
    if (config.secciones.stats?.show) {
      sections.push({
        id: 'stats-1',
        type: 'stats',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // Video
    if (config.secciones.video?.show) {
      sections.push({
        id: 'video-1',
        type: 'video',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // Map
    if (config.secciones.map?.show) {
      sections.push({
        id: 'map-1',
        type: 'map',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // RichText
    if (config.secciones.richtext?.show) {
      sections.push({
        id: 'richtext-1',
        type: 'richtext',
        order: order++,
        visible: true,
        variant: 'default',
        config: {},
      })
    }

    // CTA
    sections.push({
      id: 'cta-1',
      type: 'cta',
      order: order++,
      visible: true,
      variant: (config.secciones.cta as any)?.variant ?? 'banner',
      config: {},
    })

    return sections
  }

  function addSection(config: TiendaConfig, type: SectionKey): TiendaConfig {
    const def = getSectionDefinition(type)
    const sections = getOrderedSections(config)
    const newSection: PageSection = {
      id: `${type}-${Date.now()}`,
      type,
      order: sections.length,
      visible: true,
      variant: def?.variants[0]?.key ?? 'default',
      config: getDefaultConfigForSection(type),
    }
    return {
      ...config,
      page_sections: [...sections, newSection],
    }
  }

  function removeSection(config: TiendaConfig, sectionId: string): TiendaConfig {
    const sections = getOrderedSections(config).filter(s => s.id !== sectionId)
    return {
      ...config,
      page_sections: sections.map((s, i) => ({ ...s, order: i })),
    }
  }

  function duplicateSection(config: TiendaConfig, sectionId: string): TiendaConfig {
    const sections = getOrderedSections(config)
    const idx = sections.findIndex(s => s.id === sectionId)
    if (idx === -1) return config

    const original = sections[idx]!
    const copy: PageSection = {
      ...original,
      id: `${original.type}-${Date.now()}`,
      order: idx + 1,
    }

    const newSections = [...sections]
    newSections.splice(idx + 1, 0, copy)

    return {
      ...config,
      page_sections: newSections.map((s, i) => ({ ...s, order: i })),
    }
  }

  function toggleSectionVisibility(config: TiendaConfig, sectionId: string): TiendaConfig {
    const sections = getOrderedSections(config).map(s =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    )
    return { ...config, page_sections: sections }
  }

  function reorderSections(config: TiendaConfig, sectionIds: string[]): TiendaConfig {
    const sections = getOrderedSections(config)
    const reordered = sectionIds
      .map(id => sections.find(s => s.id === id))
      .filter((s): s is PageSection => s !== undefined)
      .map((s, i) => ({ ...s, order: i }))
    return { ...config, page_sections: reordered }
  }

  function updateSectionVariant(config: TiendaConfig, sectionId: string, variant: string): TiendaConfig {
    const sections = getOrderedSections(config).map(s =>
      s.id === sectionId ? { ...s, variant } : s
    )
    return { ...config, page_sections: sections }
  }

  function updateSectionConfig(config: TiendaConfig, sectionId: string, sectionConfig: Record<string, any>): TiendaConfig {
    const sections = getOrderedSections(config).map(s =>
      s.id === sectionId ? { ...s, config: { ...s.config, ...sectionConfig } } : s
    )
    return { ...config, page_sections: sections }
  }

  return {
    getOrderedSections,
    getVisibleSections,
    migrateToPageSections,
    addSection,
    removeSection,
    duplicateSection,
    toggleSectionVisibility,
    reorderSections,
    updateSectionVariant,
    updateSectionConfig,
  }
}
