<script setup lang="ts">
import { ref, toRef } from 'vue'

import continueBtn from '@/assets/ui/continiue.png'
import menuBtn from '@/assets/ui/menu.png'
import coinIcon from '@/assets/ui/coin.png'
import { useGsapModal } from '@/composables/useGsapModal'
import { useGameStore } from '@/stores/game'

const props = defineProps<{ show: boolean }>()

const store = useGameStore()

const emit = defineEmits<{
  continue: []
  menu: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const starRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  starRef,
  staggerSelector: '.game-modal__stats, .game-modal__btn',
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="game-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div ref="panelRef" class="game-modal game-modal--victory">
        <div ref="starRef" class="game-modal__star">⭐</div>
        <h2 class="game-modal__title">Уровень пройден!</h2>
        <p class="game-modal__cat">{{ store.getVictoryLabel() }}</p>

        <div class="game-modal__stats">
          <div>Счёт: <strong>{{ store.score }}</strong></div>
          <div>Рекорд: <strong>{{ store.bestScore }}</strong></div>
          <div class="game-modal__coins">
            Монеты: <strong>{{ store.currentRunCoins }}</strong>
            <img :src="coinIcon" alt="" aria-hidden="true" />
          </div>
        </div>

        <div class="game-modal__actions">
          <button
            v-gsap-press
            type="button"
            class="game-modal__btn"
            aria-label="Продолжить"
            @click="emit('continue')"
          >
            <img :src="continueBtn" alt="Продолжить" />
          </button>
          <button
            v-gsap-press
            type="button"
            class="game-modal__btn"
            aria-label="Главное меню"
            @click="emit('menu')"
          >
            <img :src="menuBtn" alt="Главное меню" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.game-modal__coins {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.game-modal__coins img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
</style>
