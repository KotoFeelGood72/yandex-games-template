<script setup lang="ts">
import { ref } from 'vue'

import HubLayout from '@/components/hub/HubLayout.vue'
import logoUrl from '@/assets/logo.png'
import gameStartIcon from '@/assets/ui/gamestart.png'
import catsIllustration from '@/assets/ui/cats.png'
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

      <button
        ref="playRef"
        v-gsap-press="0.97"
        type="button"
        class="home__play"
        aria-label="Играть"
        @click="onPlay"
      >
        <img class="home__play-img" :src="gameStartIcon" alt="Играть" />
      </button>

      <img
        ref="catsRef"
        class="home__cats"
        :src="catsIllustration"
        alt=""
        aria-hidden="true"
      />
    </div>
  </HubLayout>
</template>

<style scoped>
.home {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2.5vh, 30px);
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 8px 0 0;
  overflow: hidden;
  box-sizing: border-box;
}

.home__logo {
  margin: 0;
  flex-shrink: 0;
  text-align: center;
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
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0;
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.home__play:hover {
  filter: brightness(1.06);
}

.home__play-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.35));
  pointer-events: none;
}

.home__cats {
  display: block;
  flex: 1 1 0;
  width: min(100%, 340px);
  min-height: 0;
  max-height: 100%;
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  pointer-events: none;
}
</style>
