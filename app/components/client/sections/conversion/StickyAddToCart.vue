<script setup lang="ts">
const props = defineProps<{
  config: {
    show: boolean
    product_name: string
    price: string
    original_price: string
    cta_label: string
    show_discount_badge: boolean
  }
}>()

const visible = ref(false)
const hasScrolled = ref(false)

function onScroll() {
  if (!props.config.show) return
  const scrolled = window.scrollY > 300
  if (scrolled && !hasScrolled.value) {
    hasScrolled.value = true
  }
  visible.value = scrolled
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const discountPercent = computed(() => {
  if (!props.config.original_price || !props.config.price) return 0
  const original = parseFloat(props.config.original_price.replace(/[^0-9.]/g, ''))
  const current = parseFloat(props.config.price.replace(/[^0-9.]/g, ''))
  if (!original || !current || original <= current) return 0
  return Math.round(((original - current) / original) * 100)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sticky-slide">
      <div
        v-if="config.show && visible"
        class="sticky-cart"
      >
        <div class="sticky-cart__inner">
          <div class="sticky-cart__product">
            <span class="sticky-cart__name">{{ config.product_name }}</span>
            <div class="sticky-cart__pricing">
              <span class="sticky-cart__price">{{ config.price }}</span>
              <span
                v-if="config.original_price"
                class="sticky-cart__original"
              >
                {{ config.original_price }}
              </span>
              <span
                v-if="config.show_discount_badge && discountPercent > 0"
                class="sticky-cart__badge"
              >
                -{{ discountPercent }}%
              </span>
            </div>
          </div>

          <UButton
            size="lg"
            color="primary"
            :label="config.cta_label"
            class="sticky-cart__cta rounded-xl cta-glow"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sticky-cart {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0 16px 16px;
  pointer-events: none;
}

.sticky-cart__inner {
  pointer-events: all;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow:
    0 -2px 40px rgba(0, 0, 0, 0.08),
    0 4px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

:root.dark .sticky-cart__inner,
.dark .sticky-cart__inner {
  background: rgba(15, 15, 20, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 -2px 40px rgba(0, 0, 0, 0.4),
    0 4px 20px rgba(0, 0, 0, 0.2);
}

.sticky-cart__product {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sticky-cart__name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-cart__pricing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sticky-cart__price {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text, #0f172a);
  font-variant-numeric: tabular-nums;
}

.sticky-cart__original {
  font-size: 0.8rem;
  color: var(--color-text-muted, #94a3b8);
  text-decoration: line-through;
}

.sticky-cart__badge {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 0.7rem;
  font-weight: 800;
}

.sticky-cart__cta {
  flex-shrink: 0;
  font-weight: 700;
}

.sticky-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.sticky-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.sticky-slide-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.sticky-slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
