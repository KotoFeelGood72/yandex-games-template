<script setup lang="ts">
import { ref } from 'vue'

import CustomScroll from '@/components/CustomScroll.vue'
import HubLayout from '@/components/hub/HubLayout.vue'
import coinIcon from '@/assets/ui/hud/coin.webp'
import payBtn from '@/assets/ui/buttons/pay.webp'
import boosterBomb from '@/assets/ui/boosters/booster-1.webp'
import boosterRainbow from '@/assets/ui/boosters/booster-2.webp'
import boosterCookie from '@/assets/ui/boosters/booster-3.webp'
import { boosterShopItems } from '@/game/config/shopCatalog'
import type { BoosterType } from '@/game/types/booster.types'
import { useGsapStaggerEnter } from '@/composables/useGsapEnter'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

const store = useGameStore()
const player = usePlayerStore()

const emit = defineEmits<{ settings: [] }>()

const shopRef = ref<HTMLElement | null>(null)
useGsapStaggerEnter(shopRef, '.shop-card', { y: 20, stagger: 0.08, delay: 0.12 })

const boosterIcons: Record<BoosterType, string> = {
  bomb: boosterBomb,
  rainbow: boosterRainbow,
  cookie: boosterCookie,
}

function buyBooster(id: BoosterType, price: number): void {
  store.buyBooster(id, price)
}
</script>

<template>
  <HubLayout active="shop" title="Магазин" @settings="emit('settings')">
    <CustomScroll class="hub-list-scroll" height="100%" max-height="100%">
      <div ref="shopRef" class="shop">
        <div class="shop__list">
        <div v-for="item in boosterShopItems" :key="item.id" class="game-card shop-card">
          <div class="shop-card__icon-wrap">
            <img class="shop-card__icon" :src="boosterIcons[item.id]" :alt="item.title" />
            <span class="shop-card__count">{{ player.progress.boosters[item.id] }}</span>
          </div>
          <div class="shop-card__body">
            <span class="shop-card__title">{{ item.title }}</span>
            <p class="shop-card__desc">{{ item.description }}</p>
          </div>
          <button
            v-gsap-press
            type="button"
            class="shop-card__pay"
            :disabled="store.coins < item.price"
            :aria-label="`Купить за ${item.price} монет`"
            @click="buyBooster(item.id, item.price)"
          >
            <img class="shop-card__pay-bg" :src="payBtn" alt="" aria-hidden="true" />
            <span class="shop-card__pay-label">
              {{ item.price }}
              <img class="shop-card__coin" :src="coinIcon" alt="" aria-hidden="true" />
            </span>
          </button>
        </div>
        </div>
      </div>
    </CustomScroll>
  </HubLayout>
</template>

<style scoped>
.shop__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shop-card {
  align-items: center;
}

.shop-card__icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.shop-card__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.shop-card__count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  background: linear-gradient(180deg, #6bb8ff, #2a6fc8);
  border: 2px solid rgba(255, 255, 255, 0.85);
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(42, 111, 200, 0.4);
  pointer-events: none;
}

.shop-card__body {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.shop-card__title {
  display: block;
  font-weight: 800;
  font-size: 15px;
  color: var(--hub-text-accent);
}

.shop-card__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: var(--hub-text);
}

.shop-card__pay {
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.shop-card__pay:hover:not(:disabled) {
  filter: brightness(1.06);
}

.shop-card__pay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shop-card__pay-bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.shop-card__pay-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.shop-card__coin {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
</style>
