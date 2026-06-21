<script setup lang="ts">
import { useInputStore } from '@/stores/inputStore'

const inputStore = useInputStore()

function onInteractDown(): void {
  inputStore.setInteract(true)
}

function onInteractUp(): void {
  inputStore.setInteract(false)
}

function onDash(): void {
  inputStore.triggerDash()
}

function onHide(): void {
  inputStore.triggerHide()
}
</script>

<template>
  <div class="match-controls">
    <button
      type="button"
      class="match-controls__btn match-controls__btn--interact"
      @pointerdown.prevent="onInteractDown"
      @pointerup.prevent="onInteractUp"
      @pointercancel.prevent="onInteractUp"
    >
      E
    </button>
    <button
      type="button"
      class="match-controls__btn match-controls__btn--hide"
      @pointerdown.prevent="onHide"
    >
      H
    </button>
    <button
      type="button"
      class="match-controls__btn match-controls__btn--dash"
      @pointerdown.prevent="onDash"
    >
      ⚡
    </button>
  </div>
</template>

<style scoped>
.match-controls {
  position: absolute;
  right: 20px;
  bottom: calc(var(--hud-bar-height, 112px) + 16px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: auto;
}

.match-controls__btn {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #eef4ff;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  touch-action: none;
}

.match-controls__btn--interact {
  background: rgba(68, 255, 136, 0.2);
  border-color: rgba(68, 255, 136, 0.45);
}

.match-controls__btn--dash {
  background: rgba(0, 245, 255, 0.2);
  border-color: rgba(0, 245, 255, 0.45);
}

.match-controls__btn--hide {
  background: rgba(124, 77, 255, 0.2);
  border-color: rgba(124, 77, 255, 0.45);
}

@media (hover: hover) and (pointer: fine) {
  .match-controls {
    display: none;
  }
}
</style>
