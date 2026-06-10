<script setup lang="ts">
import { computed } from 'vue'

import { GAME_HEIGHT, GAME_WIDTH, LOSE_LINE_Y } from '@/game/config/gameConfig'

const props = defineProps<{
  progress?: number
  displayWidth: number
  displayHeight: number
}>()

const lineStyle = computed(() => {
  if (props.displayWidth <= 0 || props.displayHeight <= 0) {
    return { top: '0px', '--line-scale': '1' }
  }

  const topPx = (LOSE_LINE_Y / GAME_HEIGHT) * props.displayHeight
  const scale = props.displayWidth / GAME_WIDTH

  return {
    top: `${topPx}px`,
    '--line-scale': String(scale),
  }
})
</script>

<template>
  <div
    class="lose-line"
    :class="{ 'lose-line--danger': (progress ?? 0) > 0 }"
    :style="lineStyle"
    aria-hidden="true"
  >
    <div class="lose-line__row">
      <svg class="lose-line__paw" viewBox="0 0 512 512" aria-hidden="true">
        <path
          fill="currentColor"
          d="M256 224c-79.41 0-192 122.76-192 200.25c0 34.9 26.81 55.75 71.74 55.75c48.84 0 81.09-25.08 120.26-25.08c39.51 0 71.85 25.08 120.26 25.08c44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224m-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13S-7.13 201.95 3.27 236.6s42.44 57.09 71.56 50.13s44.29-40.69 33.89-75.34m84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87s-46.42 49.94-34.58 93.36s46.53 72.02 77.46 63.87m281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13c-10.4 34.65 4.77 68.38 33.89 75.34s61.15-15.48 71.56-50.13c10.4-34.65-4.77-68.38-33.89-75.34m-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87s-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87s3.64 85.22 34.58 93.36"
        />
      </svg>

      <span class="lose-line__dash" />

      <span class="lose-line__label">Линия проигрыша</span>

      <span class="lose-line__dash" />

      <svg class="lose-line__paw" viewBox="0 0 512 512" aria-hidden="true">
        <path
          fill="currentColor"
          d="M256 224c-79.41 0-192 122.76-192 200.25c0 34.9 26.81 55.75 71.74 55.75c48.84 0 81.09-25.08 120.26-25.08c39.51 0 71.85 25.08 120.26 25.08c44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224m-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13S-7.13 201.95 3.27 236.6s42.44 57.09 71.56 50.13s44.29-40.69 33.89-75.34m84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87s-46.42 49.94-34.58 93.36s46.53 72.02 77.46 63.87m281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13c-10.4 34.65 4.77 68.38 33.89 75.34s61.15-15.48 71.56-50.13c10.4-34.65-4.77-68.38-33.89-75.34m-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87s-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87s3.64 85.22 34.58 93.36"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.lose-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  pointer-events: none;
  transform: translateY(-50%);
  padding: 0 calc(8px * var(--line-scale, 1));
  box-sizing: border-box;
  --lose-color: #f06a52;
}

.lose-line__row {
  display: flex;
  align-items: center;
  gap: calc(6px * var(--line-scale, 1));
  width: 100%;
  min-height: calc(22px * var(--line-scale, 1));
}

.lose-line__paw {
  flex-shrink: 0;
  display: block;
  width: calc(22px * var(--line-scale, 1));
  height: calc(22px * var(--line-scale, 1));
  color: var(--lose-color);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.lose-line__dash {
  flex: 1;
  min-width: 0;
  height: max(1px, calc(2px * var(--line-scale, 1)));
  background: repeating-linear-gradient(
    90deg,
    var(--lose-color) 0 7px,
    transparent 7px 11px
  );
  opacity: 0.95;
}

.lose-line__label {
  flex-shrink: 1;
  min-width: 0;
  padding: 0 calc(2px * var(--line-scale, 1));
  font-family: var(--font-game);
  font-size: calc(10px * var(--line-scale, 1));
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--lose-color);
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.lose-line--danger {
  --lose-color: #ff4545;
}

.lose-line--danger .lose-line__label,
.lose-line--danger .lose-line__paw {
  animation: lose-line-pulse 0.55s ease-in-out infinite alternate;
}

@keyframes lose-line-pulse {
  from {
    opacity: 0.85;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
  }
  to {
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(255, 70, 70, 0.75));
  }
}
</style>
