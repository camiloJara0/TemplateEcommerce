import type { TiendaConfig, HeroSection, BenefitsSection, CategoriesSection, FeaturedSection, DealsSection, TestimonialsSection, CtaSection, HeaderSection, CategoriesHomeSection, ProductoSecciones, NosotrosSecciones, NewsletterSection, BrandLogosSection, GalleryFeedSection, StatsSection, VideoSection, MapSection, RichTextSection } from '~/types/store'
import { DEFAULT_TIENDA_CONFIG } from '~/types/store'

export function usePageConfig() {
  const configStore = useStoreConfigStore()

  async function loadPageConfig(force = true) {
    await configStore.loadTienda(force)
  }

  const config = computed<TiendaConfig>(() => configStore.effectiveTiendaConfig)

  const hero = computed<HeroSection>(() => config.value.secciones.hero)
  const benefits = computed<BenefitsSection>(() => config.value.secciones.benefits)
  const categories = computed<CategoriesSection>(() => config.value.secciones.categories)
  const featured = computed<FeaturedSection>(() => config.value.secciones.featured)
  const deals = computed<DealsSection>(() => config.value.secciones.deals)
  const testimonials = computed<TestimonialsSection>(() => config.value.secciones.testimonials)
  const cta = computed<CtaSection>(() => config.value.secciones.cta)
  const newsletter = computed<NewsletterSection>(() => config.value.secciones.newsletter)
  const brandLogos = computed<BrandLogosSection>(() => config.value.secciones.brand_logos)
  const galleryFeed = computed<GalleryFeedSection>(() => config.value.secciones.gallery_feed)
  const stats = computed<StatsSection>(() => config.value.secciones.stats)
  const video = computed<VideoSection>(() => config.value.secciones.video)
  const map = computed<MapSection>(() => config.value.secciones.map)
  const richtext = computed<RichTextSection>(() => config.value.secciones.richtext)

  const header = computed<HeaderSection>(() => config.value.header)
  const categoriesHome = computed<CategoriesHomeSection>(() => config.value.categories_home)
  const producto = computed<ProductoSecciones>(() => config.value.producto)
  const nosotros = computed<NosotrosSecciones>(() => config.value.nosotros)

  const brand = computed(() => config.value.brand)
  const social = computed(() => config.value.social)
  const navbar = computed(() => config.value.navbar)
  const footer = computed(() => config.value.footer)
  const estilos = computed(() => config.value.estilos)

  const navbarLinks = computed(() => navbar.value.links.filter(l => l.visible))

  return {
    config,
    hero,
    benefits,
    categories,
    featured,
    deals,
    testimonials,
    cta,
    newsletter,
    brandLogos,
    galleryFeed,
    stats,
    video,
    map,
    richtext,
    header,
    categoriesHome,
    producto,
    nosotros,
    brand,
    social,
    navbar,
    navbarLinks,
    footer,
    estilos,
    loadPageConfig,
  }
}
