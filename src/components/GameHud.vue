<script setup lang="ts">
import { ref } from 'vue'

import coinIcon from '@/assets/ui/hud/coin.webp'
import pauseIcon from '@/assets/ui/hud/pause.webp'
import { useGsapSlideEnter } from '@/composables/useGsapEnter'
import { useGameStore } from '@/stores/game'

const store = useGameStore()

const emit = defineEmits<{
  pause: []
}>()

const hudRef = ref<HTMLElement | null>(null)
useGsapSlideEnter(hudRef, 'top', 0.05)
</script>

<template>
  <header ref="hudRef" class="game-hud">
    <button
      v-gsap-press="0.96"
      type="button"
      class="game-hud__pause"
      aria-label="Пауза"
      @click="emit('pause')"
    >
      <img class="game-hud__pause-img" :src="pauseIcon" alt="" />
    </button>

    <div class="game-hud__stats">
      <div class="game-stat">
        <span class="game-stat__label">Счёт</span>
        <span class="game-stat__value">{{ store.score }}</span>
      </div>
      <div class="game-stat">
        <span class="game-stat__label">Рекорд</span>
        <span class="game-stat__value">{{ store.bestScore }}</span>
      </div>
    </div>

    <div class="coin-badge game-hud__coins">
      <img class="coin-badge__icon" :src="coinIcon" alt="" aria-hidden="true" />
      {{ store.coins + store.currentRunCoins }}
    </div>
  </header>
</template>

<style scoped>
.game-hud {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.game-hud__pause {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  transition: filter 0.12s ease;
}

.game-hud__pause:hover {
  filter: brightness(1.06);
}

.game-hud__pause-img {
  width: 38px;
  height: 38px;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.game-hud__stats {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  gap: 6px;
  overflow: hidden;
}

.game-hud__coins {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 42%;
  overflow: hidden;
}
</style>
