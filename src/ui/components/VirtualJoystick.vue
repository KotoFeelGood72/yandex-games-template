<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { useInputStore } from '@/stores/inputStore'

const BASE_SIZE = 120
const STICK_SIZE = 52
const MAX_OFFSET = 42

const inputStore = useInputStore()
const active = ref(false)
const baseRef = ref<HTMLDivElement | null>(null)
const stickX = ref(0)
const stickY = ref(0)

function resetStick(): void {
  active.value = false
  stickX.value = 0
  stickY.value = 0
  inputStore.setMove(0, 0)
}

function handlePointerDown(event: PointerEvent): void {
  if (!baseRef.value) return
  active.value = true
  baseRef.value.setPointerCapture(event.pointerId)
  updateStick(event)
}

function handlePointerMove(event: PointerEvent): void {
  if (!active.value) return
  updateStick(event)
}

function handlePointerUp(): void {
  resetStick()
}

function updateStick(event: PointerEvent): void {
  if (!baseRef.value) return

  const rect = baseRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = event.clientX - centerX
  const dy = event.clientY - centerY
  const len = Math.hypot(dx, dy)

  if (len <= 6) {
    stickX.value = 0
    stickY.value = 0
    inputStore.setMove(0, 0)
    return
  }

  const clamped = Math.min(MAX_OFFSET, len)
  const nx = dx / len
  const ny = dy / len

  stickX.value = nx * clamped
  stickY.value = ny * clamped
  inputStore.setMove(nx * (clamped / MAX_OFFSET), ny * (clamped / MAX_OFFSET))
}

onMounted(() => {
  window.addEventListener('pointerup', resetStick)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', resetStick)
  resetStick()
})
</script>

<template>
  <div
    ref="baseRef"
    class="joystick"
    :style="{ width: `${BASE_SIZE}px`, height: `${BASE_SIZE}px` }"
    @pointerdown.prevent="handlePointerDown"
    @pointermove.prevent="handlePointerMove"
    @pointerup.prevent="handlePointerUp"
    @pointercancel.prevent="handlePointerUp"
  >
    <div class="joystick__ring" :class="{ 'joystick__ring--active': active }" />
    <div
      class="joystick__stick"
      :style="{
        width: `${STICK_SIZE}px`,
        height: `${STICK_SIZE}px`,
        transform: `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`,
      }"
    />
  </div>
</template>

<style scoped>
.joystick {
  position: absolute;
  left: 20px;
  bottom: calc(var(--hud-bar-height, 112px) + 16px);
  touch-action: none;
  pointer-events: auto;
}

.joystick__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.joystick__ring--active {
  border-color: rgba(255, 213, 74, 0.55);
}

.joystick__stick {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

@media (hover: hover) and (pointer: fine) {
  .joystick {
    display: none;
  }
}
</style>
