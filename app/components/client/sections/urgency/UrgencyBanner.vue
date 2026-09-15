<script setup lang="ts">
const props = defineProps<{
  config: {
    headline: string
    subtext: string
    cta_label: string
    cta_url: string
    bg_color: string
    text_color: string
    show_close: boolean
  }
}>()

const dismissed = ref(false)

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <div
    v-if="!dismissed"
    class="urgency-banner relative overflow-hidden"
    :style="{ backgroundColor: config.bg_color, color: config.text_color }"
  >
    <div class="urgency-banner__shimmer" />

    <div class="urgency-banner__track">
      <div class="urgency-banner__text">
        <span class="urgency-banner__headline">{{ config.headline }}</span>
        <span class="urgency-banner__sep">|</span>
        <span>{{ config.subtext }}</span>
        <span class="urgency-banner__sep">|</span>
        <span class="urgency-banner__headline">{{ config.headline }}</span>
        <span class="urgency-banner__sep">|</span>
        <span>{{ config.subtext }}</span>
      </div>
    </div>

    <NuxtLink
      :to="config.cta_url"
      class="urgency-banner__cta"
    >
      {{ config.cta_label }}
    </NuxtLink>

    <button
      v-if="config.show_close"
      class="urgency-banner__close"
      aria-label="Cerrar"
      @click="dismiss"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.urgency-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 48px 8px 16px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  min-height: 38px;
}

.urgency-banner__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 25%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: urgency-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

.urgency-banner__track {
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

.urgency-banner__text {
  display: inline-flex;
  gap: 24px;
  animation: urgency-scroll 20s linear infinite;
  padding-right: 24px;
}

.urgency-banner__headline {
  font-weight: 800;
}

.urgency-banner__sep {
  opacity: 0.35;
}

.urgency-banner__cta {
  flex-shrink: 0;
  margin-left: 16px;
  padding: 4px 14px;
  border-radius: 6px;
  background: currentColor;
  color: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all 0.2s ease;
  opacity: 0.9;
  position: relative;
  z-index: 2;
}

.urgency-banner__cta:hover {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.urgency-banner__close {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 3;
}

.urgency-banner__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

@keyframes urgency-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes urgency-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
