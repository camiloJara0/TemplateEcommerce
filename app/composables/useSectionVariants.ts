import type { Component } from 'vue'
import type {
  HeroSection, BenefitsSection, CategoriesSection, FeaturedSection,
  TestimonialsSection, CtaSection, HeaderSection, CategoriesHomeSection,
  SectionVariantMeta,
} from '~/types/store'
import { VARIANT_MAP, type SectionType } from '~/lib/PageBuilder'

// ─── Variant Component Maps ──────────────────────────────────────────────────

import HeroClassic from '~/components/client/sections/hero/HeroClassic.vue'
import HeroCentered from '~/components/client/sections/hero/HeroCentered.vue'
import HeroSplit from '~/components/client/sections/hero/HeroSplit.vue'
import HeroVideo from '~/components/client/sections/hero/HeroVideo.vue'
import HeroSlider from '~/components/client/sections/hero/HeroSlider.vue'
import HeroCountdown from '~/components/client/sections/hero/HeroCountdown.vue'
import HeroParallax from '~/components/client/sections/hero/HeroParallax.vue'
import CategoriesGrid from '~/components/client/sections/categories/CategoriesGrid.vue'
import CategoriesCarousel from '~/components/client/sections/categories/CategoriesCarousel.vue'
import CategoriesPills from '~/components/client/sections/categories/CategoriesPills.vue'
import BenefitsIcons from '~/components/client/sections/benefits/BenefitsIcons.vue'
import BenefitsSteps from '~/components/client/sections/benefits/BenefitsSteps.vue'
import BenefitsCards from '~/components/client/sections/benefits/BenefitsCards.vue'
import TestimonialsCards from '~/components/client/sections/testimonials/TestimonialsCards.vue'
import TestimonialsSpotlight from '~/components/client/sections/testimonials/TestimonialsSpotlight.vue'
import TestimonialsMasonry from '~/components/client/sections/testimonials/TestimonialsMasonry.vue'
import FeaturedGrid from '~/components/client/sections/featured/FeaturedGrid.vue'
import FeaturedCarousel from '~/components/client/sections/featured/FeaturedCarousel.vue'
import FeaturedLargeCards from '~/components/client/sections/featured/FeaturedLargeCards.vue'
import CtaBanner from '~/components/client/sections/cta/CtaBanner.vue'
import CtaSplit from '~/components/client/sections/cta/CtaSplit.vue'
import CtaGradient from '~/components/client/sections/cta/CtaGradient.vue'
import HeaderAnimation from '~/components/client/AnimatedHeader.vue'
import HeaderVideo from '~/components/client/sections/header/HeaderVideo.vue'
import UrgencyBanner from '~/components/client/sections/urgency/UrgencyBanner.vue'
import CountdownOffer from '~/components/client/sections/conversion/CountdownOffer.vue'
import StockCounter from '~/components/client/sections/conversion/StockCounter.vue'
import StickyAddToCart from '~/components/client/sections/conversion/StickyAddToCart.vue'
import FaqSection from '~/components/client/sections/faq/FaqSection.vue'
import TimelineSection from '~/components/client/sections/timeline/TimelineSection.vue'
import BlogGrid from '~/components/client/sections/blog/BlogGrid.vue'
import ArticleFeatured from '~/components/client/sections/blog/ArticleFeatured.vue'

import NewsletterSection from '~/components/client/NewsletterSection.vue'
import BrandLogosSection from '~/components/client/BrandLogosSection.vue'
import GalleryFeedSection from '~/components/client/GalleryFeedSection.vue'
import StatsSection from '~/components/client/StatsSection.vue'
import VideoSection from '~/components/client/VideoSection.vue'
import MapSection from '~/components/client/MapSection.vue'
import RichTextSection from '~/components/client/RichTextSection.vue'
import DealsEditor from '~/components/admin/editors/DealsEditor.vue'

// ─── Variant Maps ────────────────────────────────────────────────────────────

const HERO_COMPONENTS: Record<string, Component> = {
  classic: HeroClassic,
  centered: HeroCentered,
  split: HeroSplit,
  video: HeroVideo,
  slider: HeroSlider,
  countdown: HeroCountdown,
  parallax: HeroParallax,
}

const CATEGORIES_COMPONENTS: Record<string, Component> = {
  grid: CategoriesGrid,
  carousel: CategoriesCarousel,
  pills: CategoriesPills,
}

const BENEFITS_COMPONENTS: Record<string, Component> = {
  icons: BenefitsIcons,
  steps: BenefitsSteps,
  cards: BenefitsCards,
}

const TESTIMONIALS_COMPONENTS: Record<string, Component> = {
  cards: TestimonialsCards,
  spotlight: TestimonialsSpotlight,
  masonry: TestimonialsMasonry,
}

const FEATURED_COMPONENTS: Record<string, Component> = {
  grid: FeaturedGrid,
  carousel: FeaturedCarousel,
  'large-cards': FeaturedLargeCards,
}

const CTA_COMPONENTS: Record<string, Component> = {
  banner: CtaBanner,
  split: CtaSplit,
  gradient: CtaGradient,
}

const HEADER_COMPONENTS: Record<string, Component> = {
  animation: HeaderAnimation,
  video: HeaderVideo,
}

const URGENCY_COMPONENTS: Record<string, Component> = {
  default: UrgencyBanner,
}

const CONVERSION_COMPONENTS: Record<string, Component> = {
  default: CountdownOffer,
  countdown: CountdownOffer,
  stock: StockCounter,
  sticky: StickyAddToCart,
}

const COUNTER_COMPONENTS: Record<string, Component> = {
  default: StockCounter,
}

const CONTENT_COMPONENTS: Record<string, Component> = {
  default: FaqSection,
  faq: FaqSection,
  timeline: TimelineSection,
  'blog-grid': BlogGrid,
  'article-featured': ArticleFeatured,
}

const TIMELINE_COMPONENTS: Record<string, Component> = {
  default: TimelineSection,
}

const NEWSLETTER_COMPONENTS: Record<string, Component> = {
  default: NewsletterSection,
  centered: NewsletterSection,
  split: NewsletterSection,
}

const BRAND_LOGOS_COMPONENTS: Record<string, Component> = {
  default: BrandLogosSection,
  grayscale: BrandLogosSection,
  color: BrandLogosSection,
  minimal: BrandLogosSection,
}

const GALLERY_FEED_COMPONENTS: Record<string, Component> = {
  default: GalleryFeedSection,
  'grid-2': GalleryFeedSection,
  'grid-3': GalleryFeedSection,
  'grid-4': GalleryFeedSection,
  masonry: GalleryFeedSection,
}

const STATS_COMPONENTS: Record<string, Component> = {
  default: StatsSection,
  'grid-3': StatsSection,
  'grid-4': StatsSection,
  horizontal: StatsSection,
}

const VIDEO_COMPONENTS: Record<string, Component> = {
  default: VideoSection,
}

const MAP_COMPONENTS: Record<string, Component> = {
  default: MapSection,
  standard: MapSection,
  satellite: MapSection,
  terrain: MapSection,
}

const RICHTEXT_COMPONENTS: Record<string, Component> = {
  default: RichTextSection,
  full: RichTextSection,
  'split-left': RichTextSection,
  'split-right': RichTextSection,
}

const DEALS_COMPONENTS: Record<string, Component> = {
  default: VideoSection
}

const CART_COMPONENTS: Record<string, Component> = {
  default: StickyAddToCart
}

const FAQ_COMPONENTS: Record<string, Component> = {
  default: FaqSection
}

const BLOG_COMPONENTS: Record<string, Component> = {
  default: BlogGrid
}

const ARTICLE_COMPONENTS: Record<string, Component> = {
  default: ArticleFeatured
}



// ─── Main Component Map ──────────────────────────────────────────────────────

const COMPONENT_MAP: Record<string, Record<string, Component>> = {
  hero: HERO_COMPONENTS,
  _categories_home: CATEGORIES_COMPONENTS,
  categories: CATEGORIES_COMPONENTS,
  benefits: BENEFITS_COMPONENTS,
  testimonials: TESTIMONIALS_COMPONENTS,
  featured: FEATURED_COMPONENTS,
  cta: CTA_COMPONENTS,
  _header: HEADER_COMPONENTS,
  urgency_banner: URGENCY_COMPONENTS,
  countdown_offer: CONVERSION_COMPONENTS,
  stock_counter: COUNTER_COMPONENTS,
  sticky_add_to_cart: CART_COMPONENTS,
  faq: FAQ_COMPONENTS,
  timeline: TIMELINE_COMPONENTS,
  blog_grid: BLOG_COMPONENTS,
  article_featured: ARTICLE_COMPONENTS,
  newsletter: NEWSLETTER_COMPONENTS,
  brand_logos: BRAND_LOGOS_COMPONENTS,
  gallery_feed: GALLERY_FEED_COMPONENTS,
  stats: STATS_COMPONENTS,
  video: VIDEO_COMPONENTS,
  map: MAP_COMPONENTS,
  richtext: RICHTEXT_COMPONENTS,
  deals: DEALS_COMPONENTS
}

// ─── Composable ──────────────────────────────────────────────────────────────

export function useSectionVariants() {
  function getComponent(sectionType: string, variant: string): Component | null {
    console.log(sectionType, variant)
    const map = COMPONENT_MAP[sectionType]
    if (!map) return null
    return map[variant] ?? Object.values(map)[0] ?? null
  }

  function getVariants(sectionType: string): SectionVariantMeta[] {
    return (VARIANT_MAP as any)[sectionType] ?? []
  }

  function getDefaultVariant(sectionType: string): string {
    const variants = getVariants(sectionType)
    return variants[0]?.key ?? 'default'
  }

  return {
    getComponent,
    getVariants,
    getDefaultVariant,
  }
}
