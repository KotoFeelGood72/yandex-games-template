<script setup lang="ts">
import { ref, toRef } from 'vue'

import adIcon from '@/assets/ui/ad.png'
import restartBtn from '@/assets/ui/restart.png'
import endRibbon from '@/assets/ui/end.png'
import { useGsapModal } from '@/composables/useGsapModal'
import { useGameStore } from '@/stores/game'

const props = defineProps<{ show: boolean }>()

const store = useGameStore()

const emit = defineEmits<{
  continue: []
  restart: []
  menu: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const ribbonRef = ref<HTMLElement | null>(null)
const scoreRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  ribbonRef,
  scoreRef,
  staggerSelector: '.game-over-modal__actions > *',
})

function formatScore(value: number): string {
  return value.toLocaleString('ru-RU')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="game-over-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div ref="panelRef" class="game-over-modal">
        <div ref="ribbonRef" class="game-over-modal__ribbon">
          <img :src="endRibbon" alt="Проиграли!" />
        </div>

        <div class="game-over-modal__body">
          <p class="game-over-modal__label">Ваш счёт</p>
          <p ref="scoreRef" class="game-over-modal__score">{{ formatScore(store.score) }}</p>
          <p class="game-over-modal__record">Рекорд: {{ formatScore(store.bestScore) }}</p>

          <div class="game-over-modal__actions">
            <button
              v-if="store.canContinueWithAd"
              v-gsap-press
              type="button"
              class="game-over-modal__ad-btn"
              aria-label="Смотреть рекламу и продолжить"
              @click="emit('continue')"
            >
              <img :src="adIcon" alt="" class="game-over-modal__ad-btn-icon" aria-hidden="true" />
              <span class="game-over-modal__ad-btn-text">Смотреть рекламу и продолжить</span>
            </button>
            <button
              v-gsap-press
              type="button"
              class="game-over-modal__btn"
              aria-label="Рестарт"
              @click="emit('restart')"
            >
              <img :src="restartBtn" alt="Рестарт" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.game-over-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    max(16px, env(safe-area-inset-top))
    max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom))
    max(16px, env(safe-area-inset-left));
  background: rgba(8, 12, 28, 0.62);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.game-over-modal {
  position: relative;
  width: min(100%, 320px);
  padding-top: 36px;
}

.game-over-modal__ribbon {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 2;
  width: min(100%, 300px);
  transform: translateX(-50%);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
  pointer-events: none;
}

.game-over-modal__ribbon img {
  display: block;
  width: 100%;
  height: auto;
}

.game-over-modal__body {
  padding: 52px 28px 28px;
  border-radius: 28px;
  text-align: center;
  background: linear-gradient(180deg, #243878 0%, #1a2a5e 55%, #141f48 100%);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.45),
    inset 0 2px 0 rgba(255, 255, 255, 0.08);
}

.game-over-modal__label {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

.game-over-modal__score {
  margin: 0 0 8px;
  font-size: clamp(42px, 12vw, 52px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #f5e6c8;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
}

.game-over-modal__record {
  margin: 0 0 22px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffd54a;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

.game-over-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.game-over-modal__ad-btn {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 49px;
  padding: 10px 12px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(180deg, #8ee04a 0%, #5fc928 42%, #3da818 100%);
  box-shadow:
    0 4px 0 #2a7a12,
    0 6px 14px rgba(0, 0, 0, 0.35),
    inset 0 2px 0 rgba(255, 255, 255, 0.45);
  transition: filter 0.12s ease;
}

.game-over-modal__ad-btn:hover {
  filter: brightness(1.05);
}

.game-over-modal__ad-btn-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
}

.game-over-modal__ad-btn-text {
  grid-column: 2;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 2px rgba(20, 80, 20, 0.55);
}

.game-over-modal__btn {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.game-over-modal__btn:hover {
  filter: brightness(1.05);
}

.game-over-modal__btn img {
  display: block;
  width: 100%;
  height: 49px;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
}
</style>
