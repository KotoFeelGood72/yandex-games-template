<script setup lang="ts">
import { UPGRADES, type UpgradeDefinition } from '@/game/data/upgradesConfig'
import { GAME_EVENTS, gameEvents } from '@/game/utils/events'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useRunStore } from '@/stores/runStore'

defineProps<{
  options: UpgradeDefinition[]
}>()

const gameStore = useGameStore()
const playerStore = usePlayerStore()
const runStore = useRunStore()

function selectUpgrade(upgrade: UpgradeDefinition): void {
  const player = { ...playerStore.stats }
  const weapon = { ...playerStore.weapon }

  upgrade.apply(player, weapon)
  runStore.registerUpgrade(upgrade.id, upgrade.tags ?? [])

  if (upgrade.secondaryUnlock) {
    gameEvents.emit(GAME_EVENTS.SECONDARY_UPDATE, upgrade.secondaryUnlock, 'unlock')
  }
  if (upgrade.secondaryUpgrade) {
    gameEvents.emit(GAME_EVENTS.SECONDARY_UPDATE, upgrade.secondaryUpgrade, 'upgrade')
  }

  playerStore.syncFromRuntime(player, weapon)
  gameStore.closeUpgradeModal()
  gameEvents.emit(GAME_EVENTS.UPGRADE_APPLIED)
  gameEvents.emit(GAME_EVENTS.RESUME)
}
</script>

<template>
  <div class="upgrade-modal">
    <div class="upgrade-modal__panel">
      <h2 class="upgrade-modal__title">Level Up</h2>
      <p class="upgrade-modal__subtitle">Выберите одно улучшение</p>

      <div class="upgrade-modal__cards">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="upgrade-modal__card"
          @click="selectUpgrade(option)"
        >
          <strong>{{ option.title }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upgrade-modal {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(8, 12, 18, 0.72);
  backdrop-filter: blur(4px);
}

.upgrade-modal__panel {
  width: min(720px, calc(100% - 24px));
  padding: 20px;
  border-radius: 16px;
  background: #151d29;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.upgrade-modal__title {
  margin: 0;
  font-size: 24px;
}

.upgrade-modal__subtitle {
  margin: 8px 0 16px;
  opacity: 0.75;
}

.upgrade-modal__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.upgrade-modal__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: #1d2735;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.upgrade-modal__card:hover {
  border-color: #ffd54a;
}
</style>
