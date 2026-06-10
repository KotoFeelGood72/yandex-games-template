<script setup lang="ts">
import gsap from 'gsap'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import circleFrame from '@/assets/game/circle.webp'
import logoUrl from '@/assets/brand/logo.webp'
import cat1 from '@/assets/game/cats/1.webp'
import cat5 from '@/assets/game/cats/5.webp'
import cat9 from '@/assets/game/cats/9.webp'
import cat20 from '@/assets/game/cats/20.webp'
import IconPaw from '~icons/mdi/paw'

import {
  animateLoadingScreenEnter,
  animateLoadingScreenFloatingPaws,
  animateLoadingScreenIdle,
  animateLoadingScreenOut,
  LOADING_FLOATING_PAW_COUNT,
  setLoadingProgress,
} from '@/shared/animations/gsapPresets'

const LOADING_CATS = [
  { src: cat1, alt: '' },
  { src: cat5, alt: '' },
  { src: cat9, alt: '' },
  { src: cat20, alt: '' },
] as const

const rootRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const catsRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const labelRef = ref<HTMLElement | null>(null)
const dotsRef = ref<HTMLElement | null>(null)
const pawsLayerRef = ref<HTMLElement | null>(null)

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

    if (pawsLayerRef.value) {
      animateLoadingScreenFloatingPaws(pawsLayerRef.value)
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
    <div ref="pawsLayerRef" class="loading-screen__paws-layer" aria-hidden="true">
      <span
        v-for="n in LOADING_FLOATING_PAW_COUNT"
        :key="n"
        class="loading-screen__float-paw"
      >
        <IconPaw />
      </span>
    </div>

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
          class="cat-preview loading-screen__cat-preview"
        >
          <img class="cat-preview__circle" :src="circleFrame" alt="" aria-hidden="true" />
          <img class="cat-preview__sprite" :src="cat.src" :alt="cat.alt" />
        </div>
      </div>

      <div class="loading-screen__progress" aria-hidden="true">
        <div class="loading-screen__progress-track">
          <div ref="barRef" class="loading-screen__progress-fill" />
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
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  pointer-events: none;
}

.loading-screen__paws-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.loading-screen__float-paw {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(36px, 9vw, 58px);
  height: clamp(36px, 9vw, 58px);
  color: #fff;
  transform-origin: center center;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.28));
  pointer-events: none;
  will-change: transform, opacity;
}

.loading-screen__float-paw :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
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

.loading-screen__cat-preview {
  width: clamp(56px, 16vw, 72px);
  height: clamp(56px, 16vw, 72px);
}

.loading-screen__progress {
  width: min(88vw, 280px);
}

.loading-screen__progress-track {
  height: 18px;
  padding: 2px;
  border-radius: 9px;
  background: linear-gradient(180deg, #2b2b2b 0%, #161616 52%, #0c0c0c 100%);
  border: 1px solid #000;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 1px rgba(0, 0, 0, 0.65);
  overflow: hidden;
}

.loading-screen__progress-fill {
  width: 0;
  height: 100%;
  min-width: 0;
  border-radius: 7px;
  background-color: #e89528;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 48%, rgba(0, 0, 0, 0.1) 100%),
    repeating-linear-gradient(
      -45deg,
      #ffd060 0,
      #ffd060 6px,
      #f0a028 6px,
      #f0a028 12px
    );
  background-size:
    100% 100%,
    16.97px 16.97px;
  animation: loading-bar-stripes 0.55s linear infinite;
  will-change: width, background-position;
}

@keyframes loading-bar-stripes {
  from {
    background-position:
      0 0,
      0 0;
  }

  to {
    background-position:
      0 0,
      16.97px 0;
  }
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
