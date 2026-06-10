<script setup lang="ts">
import { computed } from 'vue'

import coinIcon from '@/assets/ui/coin.png'
import happyIcon from '@/assets/ui/happy.png'
import plusIcon from '@/assets/ui/plus.png'
import settingsIcon from '@/assets/ui/settings.png'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{ settings: [] }>()

const store = useGameStore()
const player = usePlayerStore()

const formattedCoins = computed(() =>
  store.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
)

function onDailyReward(): void {
  if (player.claimDailyReward()) {
    store.showToast(`День ${player.dailyRewardDayIndex}: ${player.nextDailyReward.label}!`)
  } else {
    store.showToast('Награда уже получена сегодня')
  }
}
</script>

<template>
  <header class="hub-header">
    <div class="hub-coin-bar">
      <img class="hub-coin-bar__coin" :src="coinIcon" alt="" aria-hidden="true" />
      <span class="hub-coin-bar__amount">{{ formattedCoins }}</span>
      <button
        v-gsap-press="0.96"
        type="button"
        class="hub-coin-bar__plus"
        aria-label="Магазин"
        @click="store.openShop()"
      >
        <img :src="plusIcon" alt="" />
      </button>
    </div>

    <h1 v-if="title" class="hub-header__title">{{ title }}</h1>
    <div v-else class="hub-header__spacer" />

    <button
      v-gsap-press="0.96"
      type="button"
      class="hub-header__daily"
      :class="{ 'hub-header__daily--claimed': !player.canClaimDailyReward() }"
      :aria-label="
        player.canClaimDailyReward()
          ? `Ежедневная награда, день ${player.dailyRewardDayIndex}`
          : 'Ежедневная награда уже получена'
      "
      @click="onDailyReward"
    >
      <img class="hub-header__daily-img" :src="happyIcon" alt="" />
      <span
        v-if="player.canClaimDailyReward()"
        class="hub-header__daily-dot"
        aria-hidden="true"
      />
    </button>

    <button
      v-gsap-press="0.96"
      type="button"
      class="hub-header__settings"
      aria-label="Настройки"
      @click="emit('settings')"
    >
      <img class="hub-header__settings-img" :src="settingsIcon" alt="" />
    </button>
  </header>
</template>

<style scoped>
.hub-coin-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 148px;
  height: 46px;
  padding: 4px 4px 4px 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, #6b4423 0%, #4a2810 100%);
  border: 3px solid #3d2010;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.28),
    0 3px 10px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  flex-shrink: 0;
}

.hub-coin-bar__coin {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
}

.hub-coin-bar__amount {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.hub-coin-bar__plus {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  transition: filter 0.12s ease;
}

.hub-coin-bar__plus:hover {
  filter: brightness(1.06);
}

.hub-coin-bar__plus img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.hub-header__settings {
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  transition: filter 0.12s ease;
}

.hub-header__settings:hover {
  filter: brightness(1.06);
}

.hub-header__settings-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.hub-header__daily {
  position: relative;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  transition: filter 0.15s ease;
}

.hub-header__daily:hover:not(.hub-header__daily--claimed) {
  filter: brightness(1.06);
}

.hub-header__daily-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.hub-header__daily-dot {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ff3b30;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(198, 40, 40, 0.55);
  pointer-events: none;
}

.hub-header__daily--claimed {
  cursor: default;
}
</style>
