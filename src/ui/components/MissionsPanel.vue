<script setup lang="ts">
import { computed } from 'vue'

import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const missions = computed(() => gameStore.missions)

function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, (current / target) * 100)
}
</script>

<template>
  <aside class="missions">
    <div v-for="mission in missions" :key="mission.id" class="missions__item">
      <div class="missions__head">
        <span>{{ mission.title }}</span>
        <strong>{{ mission.current }}/{{ mission.target }}</strong>
      </div>
      <div class="missions__bar">
        <div
          class="missions__fill"
          :class="{ 'missions__fill--done': mission.completed }"
          :style="{ width: `${progressPercent(mission.current, mission.target)}%` }"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.missions {
  position: absolute;
  top: 12px;
  left: 12px;
  width: min(168px, 38vw);
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.missions__item {
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(10, 14, 20, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.missions__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.missions__head strong {
  color: #ffd54a;
}

.missions__bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.missions__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #42e695, #3bb2b8);
}

.missions__fill--done {
  background: linear-gradient(90deg, #ffd54a, #ffb347);
}
</style>
