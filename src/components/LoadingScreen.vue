<script setup lang="ts">
import gsap from 'gsap'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import logoUrl from '@/assets/logo.png'
import cat11 from '@/assets/cats/11.png'
import cat15 from '@/assets/cats/15.png'
import cat19 from '@/assets/cats/19.png'
import cat23 from '@/assets/cats/23.png'
import {
  animateLoadingScreenEnter,
  animateLoadingScreenIdle,
  animateLoadingScreenOut,
  setLoadingProgress,
} from '@/shared/animations/gsapPresets'

const LOADING_CATS = [
  { src: cat11, alt: '' },
  { src: cat15, alt: '' },
  { src: cat19, alt: '' },
  { src: cat23, alt: '' },
] as const

const rootRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const catsRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const dotsRef = ref<HTMLElement | null>(null)

let idleCtx: gsap.Context | null = null
let progressTween: gsap.core.Tween | null = null
let pendingProgress = 0.08
let isReady = false

let resolveReady: (() => void) | null = null
const whenReady = new Promise<void>((resolve) => {
  resolveReady = resolve
})

function applyProgress(value: number): void {
  pendingProgress = Math.max(pendingProgress, value)
  if (!barRef.value) return

  progressTween?.kill()
  progressTween = setLoadingProgress(barRef.value, pendingProgress)
}

function setProgress(value: number): void {
  applyProgress(value)
}

async function finish(): Promise<void> {
  applyProgress(1)
  await progressTween

  idleCtx?.revert()
  idleCtx = null
  progressTween?.kill()

  if (!rootRef.value) return
  await animateLoadingScreenOut(rootRef.value)
}

function waitUntilReady(): Promise<void> {
  return isReady ? Promise.resolve() : whenReady
}

onMounted(async () => {
  await nextTick()
  if (!rootRef.value) return

  idleCtx = gsap.context(() => {
    animateLoadingScreenEnter({
      root: rootRef.value!,
      logo: logoRef.value,
      cats: catsRef.value,
      label: labelRef.value,
      bar: barRef.value,
    })

    if (catsRef.value && dotsRef.value) {
      animateLoadingScreenIdle(catsRef.value, dotsRef.value)
    }
  }, rootRef.value)

  isReady = true
  resolveReady?.()

  if (pendingProgress > 0.08) {
    applyProgress(pendingProgress)
  }
})

onBeforeUnmount(() => {
  idleCtx?.revert()
  progressTween?.kill()
})

defineExpose({ setProgress, finish, waitUntilReady })
</script>

<template>
  <div ref="rootRef" class="loading-screen scene-bg" role="status" aria-live="polite" aria-busy="true">
    <div class="loading-screen__veil" aria-hidden="true" />

    <div class="loading-screen__content">
      <img
        ref="logoRef"
        class="loading-screen__logo"
        :src="logoUrl"
        alt="Кот Слияние"
        width="220"
        height="120"
      />

      <div ref="catsRef" class="loading-screen__cats" aria-hidden="true">
        <div
          v-for="(cat, index) in LOADING_CATS"
          :key="index"
          class="loading-screen__cat-slot"
        >
          <img class="loading-screen__cat" :src="cat.src" :alt="cat.alt" />
        </div>
      </div>

      <div class="loading-screen__progress" aria-hidden="true">
        <div class="loading-screen__progress-track">
          <div ref="barRef" class="loading-screen__progress-fill" />
        </div>
        <div class="loading-screen__paws">
          <span v-for="n in 5" :key="n" class="loading-screen__paw">🐾</span>
        </div>
      </div>

      <p ref="labelRef" class="loading-screen__label">
        Загрузка<span ref="dotsRef" class="loading-screen__dots">...</span>
      </p>
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
  overflow: hidden;
}

.loading-screen__veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.22) 0%, transparent 42%),
    linear-gradient(180deg, rgba(142, 200, 240, 0.35) 0%, rgba(106, 158, 200, 0.55) 100%);
  pointer-events: none;
}

.loading-screen__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(18px, 4vh, 28px);
  width: min(100%, 360px);
  padding: 24px 20px;
}

.loading-screen__logo {
  display: block;
  width: min(72vw, 220px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.28));
}

.loading-screen__cats {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(8px, 3vw, 16px);
  min-height: clamp(72px, 16vw, 96px);
}

.loading-screen__cat-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(56px, 16vw, 72px);
  height: clamp(56px, 16vw, 72px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, #fff9ef 0%, #f5e6c8 55%, #e8cc9b 100%);
  border: 3px solid #c49a6c;
  box-shadow:
    0 4px 0 rgba(74, 48, 24, 0.35),
    inset 0 2px 6px rgba(255, 255, 255, 0.45);
}

.loading-screen__cat {
  display: block;
  width: 78%;
  height: 78%;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.18));
}

.loading-screen__progress {
  width: min(88vw, 280px);
}

.loading-screen__progress-track {
  height: 14px;
  border-radius: 999px;
  padding: 2px;
  background: rgba(255, 249, 239, 0.55);
  border: 2px solid rgba(196, 154, 108, 0.85);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.loading-screen__progress-fill {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(180deg, #ffb35a 0%, #e89540 45%, #c46828 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transform: scaleX(0);
  transform-origin: left center;
  will-change: transform;
}

.loading-screen__paws {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
  font-size: 14px;
  opacity: 0.72;
}

.loading-screen__paw {
  display: inline-block;
  transform-origin: center bottom;
}

.loading-screen__label {
  margin: 0;
  font-family: var(--font-game);
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.04em;
  text-shadow:
    0 2px 0 rgba(40, 20, 0, 0.45),
    0 0 16px rgba(255, 255, 255, 0.25);
}

.loading-screen__dots {
  display: inline-block;
  min-width: 1.2em;
}
</style>
