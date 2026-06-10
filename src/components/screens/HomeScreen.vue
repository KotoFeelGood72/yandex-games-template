<script setup lang="ts">
import { ref } from 'vue'

import HubLayout from '@/components/hub/HubLayout.vue'
import logoUrl from '@/assets/brand/logo.webp'
import catsIllustration from '@/assets/ui/illustrations/cats.webp'
import { showInterstitialThen } from '@/ads/ads'
import { useGsapIdleFloat, useGsapPopEnter } from '@/composables/useGsapEnter'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

const store = useGameStore()
const player = usePlayerStore()

const emit = defineEmits<{ settings: [] }>()

const logoRef = ref<HTMLElement | null>(null)
const playRef = ref<HTMLElement | null>(null)
const catsRef = ref<HTMLElement | null>(null)

useGsapPopEnter(logoRef)
useGsapPopEnter(playRef, 0.12)
useGsapPopEnter(catsRef, 0.25)
useGsapIdleFloat(catsRef, 0.7)

function onPlay(): void {
  showInterstitialThen(
    () => {
      if (!player.progress.tutorialCompleted) {
        store.showTutorial()
      } else {
        store.startGame()
      }
    },
    'start_game',
    { userInitiated: true },
  )
}
</script>

<template>
  <HubLayout active="home" fill @settings="emit('settings')">
    <div class="home">
      <h1 ref="logoRef" class="home__logo">
        <img class="home__logo-img" :src="logoUrl" alt="Кот Слияние" />
      </h1>

      <div class="home__play-wrap">
        <button
          ref="playRef"
          v-gsap-press="0.97"
          type="button"
          class="game-play-btn home__play"
          @click="onPlay"
        >
          <span class="game-play-btn__label">Играть</span>
        </button>
      </div>

      <img ref="catsRef" class="home__cats" :src="catsIllustration" alt="" aria-hidden="true" />
    </div>
  </HubLayout>
</template>

<style scoped>
.home {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.home__logo {
  margin: 0;
  flex-shrink: 0;
  width: 100%;
  text-align: center;
}

.home__play-wrap {
  flex: 1 1 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 0;
  padding: clamp(10px, 2vh, 18px) 0 clamp(6px, 1.5vh, 12px);
}

.home__logo-img {
  display: block;
  width: min(100%, 220px);
  max-height: min(18vh, 120px);
  height: auto;
  margin: 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.home__play {
  margin: 0;
  flex-shrink: 0;
  width: min(100%, 340px);
  max-width: 340px;
  min-height: 72px;
  padding: 12px 36px 14px;
}

.home__play .game-play-btn__label {
  font-size: clamp(30px, 7.5vw, 38px);
}

.home__cats {
  display: block;
  flex: 0 1 auto;
  width: min(100%, 340px);
  min-height: 0;
  max-height: min(48vh, 320px);
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  pointer-events: none;
}
</style>
