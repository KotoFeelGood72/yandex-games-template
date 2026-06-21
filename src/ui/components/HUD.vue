<script setup lang="ts">
import { computed } from 'vue'

import { useMatchStore } from '@/stores/matchStore'

const matchStore = useMatchStore()

const exchangePercent = computed(() => matchStore.exchangeProgress * 100)

function togglePause(): void {
  matchStore.setPaused(!matchStore.paused)
}
</script>

<template>
  <div class="hud">
    <header class="hud__top">
      <div class="hud__timer">
        {{ matchStore.countdownActive ? '—' : matchStore.formattedTime }}
      </div>

      <div class="hud__scores">
        <div class="hud__team hud__team--blue">
          <span>Blue</span>
          <strong>{{ matchStore.blueScore }}</strong>
        </div>
        <div class="hud__team hud__team--pink">
          <span>Pink</span>
          <strong>{{ matchStore.pinkScore }}</strong>
        </div>
      </div>

      <button
        type="button"
        class="hud__pause"
        :disabled="matchStore.countdownActive"
        @click="togglePause"
      >
        {{ matchStore.paused ? '▶' : '⏸' }}
      </button>
    </header>

    <div v-if="matchStore.traderActive" class="hud__trader">
      Торговец активен — подойди к зелёной зоне (E)
    </div>

    <div v-if="matchStore.exchangeProgress > 0" class="hud__exchange">
      <span>Обмен...</span>
      <div class="hud__bar">
        <div class="hud__fill hud__fill--exchange" :style="{ width: `${exchangePercent}%` }" />
      </div>
    </div>

    <div v-if="matchStore.goldenOnMap" class="hud__golden">
      ★ Golden Sushi на карте!
    </div>

    <footer class="hud__bottom">
      <div class="hud__inventory">
        <span class="hud__stick hud__stick--neon">⚡ {{ matchStore.playerNeon }}</span>
        <span class="hud__stick hud__stick--sushi">🍣 {{ matchStore.playerSushi }}</span>
        <span class="hud__stick hud__stick--golden">★ {{ matchStore.playerGolden }}</span>
      </div>

      <div class="hud__abilities">
        <span>Shift — рывок</span>
        <span>H — скрыться</span>
        <span>E — обмен</span>
      </div>
    </footer>

    <aside class="hud__minimap">
      <div class="hud__minimap-inner">
        <div
          v-if="matchStore.traderActive"
          class="hud__minimap-trader"
          :style="{
            left: `${50 + (matchStore.traderZoneX / 3000) * 100}%`,
            top: `${50 + (matchStore.traderZoneY / 3000) * 100}%`,
          }"
        />
        <div
          v-if="matchStore.goldenOnMap"
          class="hud__minimap-golden"
          :style="{
            left: `${50 + (matchStore.goldenX / 3000) * 100}%`,
            top: `${50 + (matchStore.goldenY / 3000) * 100}%`,
          }"
        />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  color: #eef4ff;
  font-size: 13px;
}

.hud__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hud__timer {
  font-size: 22px;
  font-weight: 800;
  color: #00f5ff;
  text-shadow: 0 0 12px rgba(0, 245, 255, 0.5);
}

.hud__scores {
  display: flex;
  gap: 16px;
}

.hud__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
}

.hud__team--blue {
  background: rgba(68, 136, 255, 0.2);
  border: 1px solid rgba(102, 204, 255, 0.4);
}

.hud__team--pink {
  background: rgba(255, 68, 170, 0.2);
  border: 1px solid rgba(255, 102, 204, 0.4);
}

.hud__pause:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.hud__pause {
  pointer-events: auto;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  font-weight: 700;
  cursor: pointer;
}

.hud__trader {
  align-self: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(68, 255, 136, 0.15);
  border: 1px solid rgba(68, 255, 136, 0.4);
  color: #66ffaa;
  font-weight: 700;
}

.hud__exchange {
  align-self: center;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.hud__bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.hud__fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.1s linear;
}

.hud__fill--exchange {
  background: linear-gradient(90deg, #44ff88, #00f5ff);
}

.hud__golden {
  align-self: center;
  color: #ffd54a;
  font-weight: 800;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  50% { opacity: 0.6; }
}

.hud__bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud__inventory {
  display: flex;
  gap: 12px;
  font-weight: 700;
}

.hud__stick--neon { color: #00f5ff; }
.hud__stick--sushi { color: #ff44cc; }
.hud__stick--golden { color: #ffd54a; }

.hud__abilities {
  display: flex;
  gap: 12px;
  opacity: 0.65;
  font-size: 11px;
}

@media (max-width: 640px) {
  .hud__abilities {
    display: none;
  }
}

.hud__minimap {
  position: absolute;
  top: 60px;
  right: 12px;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background: rgba(10, 8, 20, 0.75);
  border: 1px solid rgba(0, 245, 255, 0.25);
  overflow: hidden;
}

.hud__minimap-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.hud__minimap-trader,
.hud__minimap-golden {
  position: absolute;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.hud__minimap-trader {
  background: rgba(68, 255, 136, 0.6);
  box-shadow: 0 0 8px #44ff88;
}

.hud__minimap-golden {
  background: #ffd54a;
  box-shadow: 0 0 8px #ffd54a;
}
</style>
