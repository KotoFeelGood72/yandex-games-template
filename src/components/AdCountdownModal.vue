<script setup lang="ts">
import { ref, toRef } from 'vue'

import { useGsapModal } from '@/composables/useGsapModal'

const props = defineProps<{
  show: boolean
  countdown: number
}>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const numberRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  staggerSelector: '.ad-countdown-modal__text',
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="ad-countdown-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ad-countdown-title"
      aria-describedby="ad-countdown-desc"
    >
      <div ref="panelRef" class="ad-countdown-modal">
        <h2 id="ad-countdown-title" class="ad-countdown-modal__title">Реклама</h2>
        <p id="ad-countdown-desc" class="ad-countdown-modal__text">
          Сейчас будет показана реклама
        </p>
        <p
          ref="numberRef"
          :key="countdown"
          class="ad-countdown-modal__number"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ countdown }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ad-countdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    max(16px, var(--app-safe-top))
    max(16px, var(--app-safe-right))
    max(16px, var(--app-safe-bottom))
    max(16px, var(--app-safe-left));
  background: rgba(12, 8, 6, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: all;
  touch-action: none;
  user-select: none;
}

.ad-countdown-modal {
  width: min(100%, 340px);
  padding: 32px 28px 36px;
  border-radius: 28px;
  text-align: center;
  color: var(--hub-text);
  background: var(--hub-panel-bg);
  border: 4px solid var(--hub-panel-border);
  box-shadow:
    0 16px 48px rgba(40, 24, 10, 0.45),
    inset 0 2px 6px rgba(255, 255, 255, 0.85);
}

.ad-countdown-modal__title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--hub-text);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.ad-countdown-modal__text {
  margin: 0 0 20px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--hub-text-muted, #6b5344);
}

.ad-countdown-modal__number {
  margin: 0;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  color: #e86a1a;
  text-shadow:
    0 3px 0 rgba(120, 52, 8, 0.25),
    0 6px 18px rgba(232, 106, 26, 0.35);
  animation: ad-countdown-pop 0.35s ease-out;
}

@keyframes ad-countdown-pop {
  0% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
