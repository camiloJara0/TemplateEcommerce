import type { TiendaConfig, HeroSection, BenefitsSection, CategoriesSection, FeaturedSection, DealsSection, TestimonialsSection, CtaSection, HeaderSection, CategoriesHomeSection, ProductoSecciones } from '~/types/store'
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

  const header = computed<HeaderSection>(() => config.value.header)
  const categoriesHome = computed<CategoriesHomeSection>(() => config.value.categories_home)
  const producto = computed<ProductoSecciones>(() => config.value.producto)

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
    header,
    categoriesHome,
    producto,
    brand,
    social,
    navbar,
    navbarLinks,
    footer,
    estilos,
    loadPageConfig,
  }
}
