<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { createPhaserGame, destroyPhaserGame, resizePhaserGame } from '@/game/PhaserGame'
import { useMatchStore } from '@/stores/matchStore'
import HUD from '@/ui/components/HUD.vue'
import MatchCountdownModal from '@/ui/components/MatchCountdownModal.vue'
import MatchResultModal from '@/ui/components/MatchResultModal.vue'
import VirtualJoystick from '@/ui/components/VirtualJoystick.vue'
import MatchControls from '@/ui/components/MatchControls.vue'

const containerRef = ref<HTMLDivElement | null>(null)
const matchStore = useMatchStore()

let resizeObserver: ResizeObserver | null = null

function syncGameSize(): void {
  const container = containerRef.value
  if (!container) return
  resizePhaserGame(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  createPhaserGame(container)
  syncGameSize()

  resizeObserver = new ResizeObserver(() => {
    syncGameSize()
  })
  resizeObserver.observe(container)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  destroyPhaserGame()
  matchStore.reset()
})
</script>

<template>
  <div class="game-view">
    <div ref="containerRef" class="game-view__canvas" />

    <HUD />
    <VirtualJoystick v-if="matchStore.livePhase && !matchStore.finished" />
    <MatchControls v-if="matchStore.livePhase && !matchStore.finished" />

    <MatchCountdownModal />
    <MatchResultModal v-if="matchStore.finished" />
  </div>
</template>

<style scoped>
.game-view {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #0a0814;
  --hud-bar-height: 124px;
}

@media (max-width: 640px) {
  .game-view {
    --hud-bar-height: 108px;
  }
}

.game-view__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.game-view__canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
