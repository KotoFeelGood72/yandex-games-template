<script setup lang="ts">
import { ref } from 'vue'

import boosterBomb from '@/assets/ui/booster-1.png'
import boosterRainbow from '@/assets/ui/booster-2.png'
import boosterCookie from '@/assets/ui/booster-3.png'
import type { BoosterType } from '@/game/types/booster.types'
import { useGsapSlideEnter, useGsapStaggerEnter } from '@/composables/useGsapEnter'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

const store = useGameStore()
const player = usePlayerStore()

const boosters: { type: BoosterType; icon: string; label: string }[] = [
  { type: 'bomb', icon: boosterBomb, label: 'Бомба' },
  { type: 'rainbow', icon: boosterRainbow, label: 'Клубок' },
  { type: 'cookie', icon: boosterCookie, label: 'Печенье' },
]

const barRef = ref<HTMLElement | null>(null)
useGsapSlideEnter(barRef, 'bottom', 0.1)
useGsapStaggerEnter(barRef, '.booster-slot', { y: 14, stagger: 0.08, delay: 0.22 })

function activate(type: BoosterType): void {
  if (store.boosterMode === type) {
    store.setBoosterMode(null)
    return
  }
  store.activateBooster(type)
}
</script>

<template>
  <div ref="barRef" class="booster-bar">
    <div class="booster-panel">
      <button
        v-for="b in boosters"
        :key="b.type"
        v-gsap-press
        type="button"
        class="booster-slot"
        :class="{ 'booster-slot--active': store.boosterMode === b.type }"
        :disabled="player.progress.boosters[b.type] <= 0"
        :aria-label="`${b.label}: ${player.progress.boosters[b.type]} шт.`"
        @click="activate(b.type)"
      >
        <span class="booster-slot__icon-wrap">
          <img class="booster-slot__icon" :src="b.icon" alt="" aria-hidden="true" />
        </span>
        <span class="booster-slot__count">{{ player.progress.boosters[b.type] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.booster-panel {
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.booster-slot {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 54px;
  padding: 0;
  border: 2px solid #c49a6c;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff6e8 0%, #edd5a8 100%);
  box-shadow:
    inset 0 2px 5px rgba(255, 255, 255, 0.72),
    inset 0 -2px 3px rgba(120, 80, 40, 0.12),
    0 2px 6px rgba(40, 24, 10, 0.18);
  cursor: pointer;
}

.booster-slot:not(:disabled):hover {
  filter: brightness(1.03);
}

.booster-slot:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.booster-slot--active {
  border-color: #2a9e3a;
  background: linear-gradient(180deg, #eefce8 0%, #d4efbc 100%);
  box-shadow:
    0 0 0 2px rgba(42, 158, 58, 0.28),
    inset 0 2px 5px rgba(255, 255, 255, 0.72),
    0 3px 10px rgba(42, 158, 58, 0.2);
}

.booster-slot__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, #fffdf8 0%, #f3e2bf 58%, #e6cf9a 100%);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.85),
    inset 0 -2px 3px rgba(120, 80, 40, 0.16),
    0 1px 3px rgba(40, 24, 10, 0.16);
}

.booster-slot__icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  filter: drop-shadow(0 2px 3px rgba(40, 24, 10, 0.22));
}

.booster-slot__count {
  position: absolute;
  right: -4px;
  bottom: -4px;
  z-index: 1;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #7ec4ff 0%, #4a9ef0 45%, #2a6fc8 100%);
  border: 2px solid rgba(255, 255, 255, 0.92);
  font-family: var(--font-game);
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    0 2px 6px rgba(42, 111, 200, 0.42);
  pointer-events: none;
}

@media (max-height: 740px) {
  .booster-slot {
    height: 48px;
  }

  .booster-slot__icon-wrap {
    width: 36px;
    height: 36px;
  }

  .booster-slot__icon {
    width: 30px;
    height: 30px;
  }

  .booster-slot__count {
    min-width: 18px;
    height: 18px;
    font-size: 10px;
  }
}
</style>
