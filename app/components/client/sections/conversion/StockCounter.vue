<script setup lang="ts">
const props = defineProps<{
  config: {
    headline: string
    subtext: string
    stock_total: number
    stock_sold: number
    low_stock_threshold: number
    style: 'bar' | 'counter' | 'dots'
  }
}>()

const remaining = computed(() => props.config.stock_total - props.config.stock_sold)
const percentSold = computed(() => {
  if (!props.config.stock_total) return 0
  return Math.min(100, Math.round((props.config.stock_sold / props.config.stock_total) * 100))
})
const isLowStock = computed(() => remaining.value <= props.config.low_stock_threshold)

const animatedCount = ref(0)
let countInterval: ReturnType<typeof setInterval> | null = null

function animateCount() {
  const target = props.config.stock_sold
  const duration = 1500
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedCount.value = Math.round(eased * target)
    if (progress < 1) {
      countInterval = requestAnimationFrame(tick) as unknown as ReturnType<typeof setInterval>
    }
  }

  countInterval = requestAnimationFrame(tick) as unknown as ReturnType<typeof setInterval>
}

onMounted(() => {
  animateCount()
})

onUnmounted(() => {
  if (countInterval) cancelAnimationFrame(countInterval as unknown as number)
})

const dotsArray = computed(() => {
  const total = Math.min(props.config.stock_total, 50)
  const sold = Math.round((props.config.stock_sold / props.config.stock_total) * total)
  return Array.from({ length: total }, (_, i) => i < sold)
})
</script>

<template>
  <section class="stock-counter section-padding homepage-section-bg">
    <div class="page-container">
      <div class="stock-counter__card">
        <div class="stock-counter__header">
          <h3 class="stock-counter__headline">{{ config.headline }}</h3>
          <p class="stock-counter__subtext">{{ config.subtext }}</p>
        </div>

        <div v-if="config.style === 'bar'" class="stock-counter__bar-style">
          <div class="stock-counter__progress-info">
            <span class="text-theme-secondary font-bold text-lg tabular-nums">
              {{ percentSold }}% vendido
            </span>
            <span class="stock-counter__remaining" :class="{ 'stock-counter__remaining--low': isLowStock }">
              Quedan {{ remaining }}
            </span>
          </div>
          <div class="stock-counter__track">
            <div
              class="stock-counter__fill"
              :class="{ 'stock-counter__fill--low': isLowStock }"
              :style="{ width: `${percentSold}%` }"
            />
          </div>
          <div class="stock-counter__bar-icons">
            <UIcon name="i-lucide-flame" class="stock-counter__flame" />
            <span class="text-theme-muted text-xs">¡Se está agotando!</span>
          </div>
        </div>

        <div v-else-if="config.style === 'counter'" class="stock-counter__counter-style">
          <div class="stock-counter__big-number" :class="{ 'stock-counter__big-number--low': isLowStock }">
            <span class="stock-counter__animated">{{ animatedCount }}</span>
            <span class="stock-counter__of">de</span>
            <span class="stock-counter__total">{{ config.stock_total }}</span>
          </div>
          <p class="stock-counter__label-text">unidades vendidas</p>
          <div
            v-if="isLowStock"
            class="stock-counter__urgency-badge"
          >
            <span class="stock-counter__urgency-dot" />
            ¡Solo quedan {{ remaining }}!
          </div>
        </div>

        <div v-else-if="config.style === 'dots'" class="stock-counter__dots-style">
          <div class="stock-counter__dots-grid">
            <span
              v-for="(sold, i) in dotsArray"
              :key="i"
              class="stock-counter__dot"
              :class="{
                'stock-counter__dot--sold': sold,
                'stock-counter__dot--low': isLowStock && !sold
              }"
            />
          </div>
          <div class="stock-counter__dots-info">
            <span class="stock-counter__dots-count">{{ remaining }}</span>
            <span class="text-theme-muted text-sm">disponibles</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stock-counter__card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, rgba(0, 0, 0, 0.06));
  border-radius: 20px;
  padding: 36px 32px;
}

.stock-counter__header {
  text-align: center;
  margin-bottom: 32px;
}

.stock-counter__headline {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text, #0f172a);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.stock-counter__subtext {
  color: var(--color-text-muted, #64748b);
  font-size: 0.95rem;
}

.stock-counter__remaining {
  font-weight: 700;
  color: var(--color-text-secondary, #334155);
}

.stock-counter__remaining--low {
  color: #ef4444;
}

.stock-counter__bar-style .stock-counter__progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stock-counter__track {
  height: 12px;
  background: var(--color-border, rgba(0, 0, 0, 0.06));
  border-radius: 999px;
  overflow: hidden;
}

.stock-counter__fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.stock-counter__fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: stock-bar-shimmer 2s ease-in-out infinite;
}

.stock-counter__fill--low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.stock-counter__bar-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.stock-counter__flame {
  font-size: 14px;
  color: #f97316;
  animation: stock-flame-flicker 0.6s ease-in-out infinite alternate;
}

.stock-counter__counter-style {
  text-align: center;
}

.stock-counter__big-number {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: var(--color-text, #0f172a);
}

.stock-counter__animated {
  font-size: 3.5rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  animation: stock-number-pulse 2s ease-in-out infinite;
}

.stock-counter__big-number--low .stock-counter__animated {
  color: #ef4444;
}

.stock-counter__of {
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.4;
}

.stock-counter__total {
  font-size: 1.6rem;
  font-weight: 700;
  opacity: 0.5;
}

.stock-counter__label-text {
  color: var(--color-text-muted, #64748b);
  font-size: 0.95rem;
  margin-top: 8px;
}

.stock-counter__urgency-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 700;
  animation: stock-urgency-pulse 1.5s ease-in-out infinite;
}

.stock-counter__urgency-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: stock-dot-pulse 1s ease-in-out infinite;
}

.stock-counter__dots-style {
  text-align: center;
}

.stock-counter__dots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto 24px;
}

.stock-counter__dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--color-border, rgba(0, 0, 0, 0.08));
  transition: all 0.3s ease;
}

.stock-counter__dot--sold {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.stock-counter__dot--sold:nth-child(3n) {
  animation: stock-dot-pop 0.4s ease-out;
}

.stock-counter__dot--low {
  background: rgba(239, 68, 68, 0.12);
  border: 1px dashed rgba(239, 68, 68, 0.3);
}

.stock-counter__dots-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}

.stock-counter__dots-count {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--color-text, #0f172a);
  font-variant-numeric: tabular-nums;
}

@keyframes stock-bar-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes stock-flame-flicker {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.15); opacity: 1; }
}

@keyframes stock-number-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes stock-urgency-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.15); }
  50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}

@keyframes stock-dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

@keyframes stock-dot-pop {
  0% { transform: scale(0.5); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
