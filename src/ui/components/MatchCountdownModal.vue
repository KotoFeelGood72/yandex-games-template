<script setup lang="ts">
import { useMatchStore } from '@/stores/matchStore'

const matchStore = useMatchStore()
</script>

<template>
  <div v-if="matchStore.countdownActive" class="countdown-modal">
    <div class="countdown-modal__card">
      <p class="countdown-modal__label">Игра начнётся через</p>
      <div class="countdown-modal__digit">{{ matchStore.countdownValue }}</div>
    </div>
  </div>
</template>

<style scoped>
.countdown-modal {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  background: rgba(5, 4, 12, 0.55);
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.countdown-modal__card {
  min-width: 240px;
  padding: 28px 36px;
  border-radius: 16px;
  background: rgba(18, 16, 42, 0.95);
  border: 1px solid rgba(0, 245, 255, 0.35);
  text-align: center;
  color: #eef4ff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.countdown-modal__label {
  margin: 0 0 12px;
  font-size: 16px;
  opacity: 0.85;
}

.countdown-modal__digit {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: #00f5ff;
  text-shadow: 0 0 24px rgba(0, 245, 255, 0.55);
  animation: pulse 0.9s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    transform: scale(1.08);
    opacity: 0.85;
  }
}
</style>
