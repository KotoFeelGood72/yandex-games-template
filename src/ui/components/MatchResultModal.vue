<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useMatchStore } from '@/stores/matchStore'

const router = useRouter()
const matchStore = useMatchStore()

const title = computed(() => {
  if (matchStore.winner === 'draw') return 'Ничья!'
  if (matchStore.winner === 'blue') return 'Победа Blue!'
  return 'Победа Pink!'
})

function goHub(): void {
  matchStore.reset()
  router.push({ name: 'hub' })
}

function playAgain(): void {
  matchStore.reset()
  window.location.reload()
}
</script>

<template>
  <div class="result-modal">
    <div class="result-modal__card">
      <h2>{{ title }}</h2>

      <dl class="result-modal__stats">
        <div>
          <dt>Blue Team</dt>
          <dd>{{ matchStore.blueScore }}</dd>
        </div>
        <div>
          <dt>Pink Team</dt>
          <dd>{{ matchStore.pinkScore }}</dd>
        </div>
        <div>
          <dt>Ваши палочки</dt>
          <dd>
            ⚡{{ matchStore.playerNeon }}
            🍣{{ matchStore.playerSushi }}
            ★{{ matchStore.playerGolden }}
          </dd>
        </div>
      </dl>

      <div class="result-modal__actions">
        <button type="button" class="result-modal__btn" @click="playAgain">
          Ещё матч
        </button>
        <button type="button" class="result-modal__btn result-modal__btn--ghost" @click="goHub">
          В меню
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-modal {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: rgba(5, 4, 12, 0.82);
  backdrop-filter: blur(6px);
}

.result-modal__card {
  width: min(420px, 92vw);
  padding: 24px;
  border-radius: 16px;
  background: #12102a;
  border: 1px solid rgba(0, 245, 255, 0.25);
  text-align: center;
  color: #eef4ff;
}

.result-modal__card h2 {
  margin: 0 0 20px;
  font-size: 28px;
  color: #00f5ff;
}

.result-modal__stats {
  display: grid;
  gap: 12px;
  margin: 0 0 24px;
}

.result-modal__stats div {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.result-modal__stats dt {
  opacity: 0.75;
}

.result-modal__stats dd {
  margin: 0;
  font-weight: 800;
}

.result-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-modal__btn {
  border: none;
  border-radius: 10px;
  padding: 12px;
  background: linear-gradient(90deg, #00f5ff, #ff44cc);
  color: #0a0814;
  font-weight: 800;
  cursor: pointer;
}

.result-modal__btn--ghost {
  background: transparent;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
