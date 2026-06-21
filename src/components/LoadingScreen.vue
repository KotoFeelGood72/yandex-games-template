<script setup lang="ts">
import { ref } from 'vue'

import { APP_TITLE } from '@/config/env'

const progress = ref(0)

function setProgress(value: number): void {
  progress.value = Math.min(1, Math.max(0, value))
}

async function finish(): Promise<void> {
  setProgress(1)
  await new Promise((resolve) => window.setTimeout(resolve, 200))
}

function waitUntilReady(): Promise<void> {
  return Promise.resolve()
}

defineExpose({ setProgress, finish, waitUntilReady })
</script>

<template>
  <div class="loading-screen" role="status" aria-live="polite" aria-busy="true">
    <div class="loading-screen__content">
      <p class="loading-screen__title">{{ APP_TITLE }}</p>
      <div class="loading-screen__progress" aria-hidden="true">
        <div class="loading-screen__progress-track">
          <div class="loading-screen__progress-fill" :style="{ width: `${progress * 100}%` }" />
        </div>
      </div>
      <p class="loading-screen__label">Загрузка…</p>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #1a2a44 0%, #0f1724 100%);
}

.loading-screen__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: min(100%, 320px);
  padding: 24px;
}

.loading-screen__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

.loading-screen__progress {
  width: 100%;
}

.loading-screen__progress-track {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.loading-screen__progress-fill {
  height: 100%;
  border-radius: 4px;
  background: #ffd54a;
  transition: width 0.2s ease;
}

.loading-screen__label {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}
</style>
