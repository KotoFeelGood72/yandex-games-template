<script setup lang="ts">
import { GAME_EVENTS, gameEvents } from '@/game/utils/events'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

function acceptAltar(): void {
  gameEvents.emit(GAME_EVENTS.EVENT_ALTAR)
}

function skipEvent(): void {
  gameStore.closeGameEvent()
  gameEvents.emit(GAME_EVENTS.RESUME)
}
</script>

<template>
  <div class="event-modal">
    <div class="event-modal__panel">
      <h2>{{ gameStore.gameEventTitle }}</h2>
      <p>{{ gameStore.gameEventDescription }}</p>

      <div v-if="gameStore.gameEventTitle === 'Алтарь'" class="event-modal__actions">
        <button type="button" class="event-modal__btn" @click="acceptAltar">
          Отдать 15% HP → +10% урона
        </button>
        <button type="button" class="event-modal__btn event-modal__btn--ghost" @click="skipEvent">
          Пройти мимо
        </button>
      </div>

      <div v-else class="event-modal__actions">
        <button type="button" class="event-modal__btn" @click="skipEvent">Продолжить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-modal {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(8, 12, 18, 0.78);
  z-index: 20;
}

.event-modal__panel {
  width: min(420px, calc(100% - 24px));
  padding: 24px;
  border-radius: 16px;
  background: #151d29;
  color: #eef4ff;
  text-align: center;
}

.event-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.event-modal__btn {
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  background: #ffd54a;
  color: #1a1a1a;
  font-weight: 700;
  cursor: pointer;
}

.event-modal__btn--ghost {
  background: transparent;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
