<script setup lang="ts">
const props = defineProps<{
  config: {
    headline: string
    subtext: string
    offer_end_date: string
    cta_label: string
    cta_url: string
    bg_color: string
    show_progress: boolean
    stock_total: number
    stock_sold: number
  }
}>()

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const prevDigits = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

function updateTimer() {
  if (!props.config.offer_end_date) return
  const end = new Date(props.config.offer_end_date).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)

  prevDigits.value = { ...timeLeft.value }

  timeLeft.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

onMounted(() => {
  updateTimer()
  timer = setInterval(updateTimer, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

const pad = (n: number) => String(n).padStart(2, '0')

const percentSold = computed(() => {
  if (!props.config.stock_total) return 0
  return Math.min(100, Math.round((props.config.stock_sold / props.config.stock_total) * 100))
})

const remaining = computed(() => props.config.stock_total - props.config.stock_sold)
</script>

<template>
  <section class="countdown-offer section-padding homepage-section-bg">
    <div class="page-container">
      <div class="countdown-offer__card">
        <div class="countdown-offer__glow" />

        <div class="countdown-offer__content">
          <div class="countdown-offer__badge">
            <span class="countdown-offer__badge-dot" />
            OFERTA LIMITADA
          </div>

          <h2 class="countdown-offer__headline">{{ config.headline }}</h2>
          <p class="countdown-offer__subtext">{{ config.subtext }}</p>

          <div class="countdown-offer__timer">
            <div class="countdown-offer__unit">
              <div class="countdown-offer__flip">
                <span class="countdown-offer__digit">{{ pad(timeLeft.days) }}</span>
              </div>
              <span class="countdown-offer__label">Días</span>
            </div>
            <span class="countdown-offer__colon">:</span>
            <div class="countdown-offer__unit">
              <div class="countdown-offer__flip">
                <span class="countdown-offer__digit">{{ pad(timeLeft.hours) }}</span>
              </div>
              <span class="countdown-offer__label">Horas</span>
            </div>
            <span class="countdown-offer__colon">:</span>
            <div class="countdown-offer__unit">
              <div class="countdown-offer__flip">
                <span class="countdown-offer__digit">{{ pad(timeLeft.minutes) }}</span>
              </div>
              <span class="countdown-offer__label">Min</span>
            </div>
            <span class="countdown-offer__colon">:</span>
            <div class="countdown-offer__unit">
              <div class="countdown-offer__flip">
                <span class="countdown-offer__digit">{{ pad(timeLeft.seconds) }}</span>
              </div>
              <span class="countdown-offer__label">Seg</span>
            </div>
          </div>

          <div v-if="config.show_progress" class="countdown-offer__stock">
            <div class="countdown-offer__stock-header">
              <span class="text-theme-secondary text-sm font-semibold">{{ percentSold }}% vendido</span>
              <span class="text-theme-muted text-xs">Quedan {{ remaining }} unidades</span>
            </div>
            <div class="countdown-offer__progress-track">
              <div
                class="countdown-offer__progress-bar"
                :style="{ width: `${percentSold}%` }"
              />
              <div class="countdown-offer__progress-glow" :style="{ left: `${percentSold}%` }" />
            </div>
          </div>

          <UButton
            :to="config.cta_url"
            size="xl"
            color="primary"
            :label="config.cta_label"
            class="countdown-offer__cta rounded-2xl cta-glow"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.countdown-offer {
  --neon-primary: #f43f5e;
  --neon-glow: rgba(244, 63, 94, 0.4);
}

.countdown-offer__card {
  position: relative;
  background: linear-gradient(145deg, #0f0f13 0%, #1a1a24 50%, #0f0f13 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 48px 32px;
  overflow: hidden;
}

.countdown-offer__glow {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 240px;
  background: radial-gradient(ellipse, var(--neon-glow) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0.5;
}

.countdown-offer__content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.countdown-offer__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  color: #f43f5e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 24px;
  animation: countdown-badge-pulse 2s ease-in-out infinite;
}

.countdown-offer__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f43f5e;
  animation: countdown-dot-blink 1s ease-in-out infinite;
}

.countdown-offer__headline {
  color: #f0f0f5;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.countdown-offer__subtext {
  color: rgba(240, 240, 245, 0.5);
  font-size: 1.05rem;
  max-width: 480px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.countdown-offer__timer {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.countdown-offer__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.countdown-offer__flip {
  position: relative;
  width: 80px;
  height: 90px;
  background: linear-gradient(180deg, #1e1e2a 0%, #14141c 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.countdown-offer__flip::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.countdown-offer__digit {
  font-size: 2.8rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #f43f5e;
  text-shadow: 0 0 30px var(--neon-glow);
  line-height: 1;
}

.countdown-offer__colon {
  font-size: 2.4rem;
  font-weight: 800;
  color: rgba(244, 63, 94, 0.4);
  margin-top: 24px;
  animation: countdown-colon-blink 1s ease-in-out infinite;
}

.countdown-offer__label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(240, 240, 245, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.countdown-offer__stock {
  max-width: 400px;
  margin: 0 auto 36px;
}

.countdown-offer__stock-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.countdown-offer__progress-track {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.countdown-offer__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #f43f5e, #fb7185);
  border-radius: 999px;
  transition: width 1s ease;
}

.countdown-offer__progress-glow {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  background: var(--neon-primary);
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.6;
  transform: translateX(-50%);
  transition: left 1s ease;
}

.countdown-offer__cta {
  font-weight: 700;
  letter-spacing: 0.01em;
}

@media (max-width: 640px) {
  .countdown-offer__flip {
    width: 62px;
    height: 72px;
  }

  .countdown-offer__digit {
    font-size: 2rem;
  }

  .countdown-offer__timer {
    gap: 8px;
  }
}

@keyframes countdown-badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(244, 63, 94, 0); }
}

@keyframes countdown-dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes countdown-colon-blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
