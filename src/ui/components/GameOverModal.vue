<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { GAME_EVENTS, gameEvents } from '@/game/utils/events'
import { useGameStore } from '@/stores/gameStore'
import { useMetaStore } from '@/stores/metaStore'
import { usePlayerStore } from '@/stores/playerStore'

const router = useRouter()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const metaStore = useMetaStore()

const formattedTime = computed(() => {
  const minutes = Math.floor(gameStore.timeSeconds / 60)
  const seconds = gameStore.timeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

function restart(): void {
  gameStore.resetSession()
  gameEvents.emit(GAME_EVENTS.RESTART)
}

function goHub(): void {
  gameStore.resetSession()
  router.push({ name: 'hub' })
}
</script>

<template>
  <div class="game-over">
    <div class="game-over__panel">
      <h2>Сектор потерян</h2>
      <p class="game-over__ether">+{{ metaStore.lastEarnedEther }} Эфира</p>
      <dl class="game-over__stats">
        <div>
          <dt>Время</dt>
          <dd>{{ formattedTime }}</dd>
        </div>
        <div>
          <dt>Убийства</dt>
          <dd>{{ gameStore.kills }}</dd>
        </div>
        <div>
          <dt>Уровень</dt>
          <dd>{{ playerStore.stats.level }}</dd>
        </div>
        <div>
          <dt>Волна</dt>
          <dd>{{ gameStore.waveIndex }}</dd>
        </div>
        <div>
          <dt>Gold</dt>
          <dd>{{ gameStore.gold }}</dd>
        </div>
        <div>
          <dt>Эфир всего</dt>
          <dd>{{ metaStore.ether }}</dd>
        </div>
      </dl>
      <div class="game-over__actions">
        <button type="button" class="game-over__btn" @click="restart">Ещё раз</button>
        <button type="button" class="game-over__btn game-over__btn--ghost" @click="goHub">
          В хаб
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(8, 12, 18, 0.8);
  z-index: 30;
}

.game-over__panel {
  width: min(420px, calc(100% - 24px));
  padding: 24px;
  border-radius: 16px;
  background: #151d29;
  color: #eef4ff;
  text-align: center;
}

.game-over__ether {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
  color: #66ffcc;
}

.game-over__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0 0 20px;
}

.game-over__stats div {
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.game-over__stats dt {
  opacity: 0.7;
  font-size: 12px;
}

.game-over__stats dd {
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 700;
}

.game-over__actions {
  display: flex;
  gap: 10px;
}

.game-over__btn {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  background: #ffd54a;
  color: #1a1a1a;
  font-weight: 700;
  cursor: pointer;
}

.game-over__btn--ghost {
  background: transparent;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
