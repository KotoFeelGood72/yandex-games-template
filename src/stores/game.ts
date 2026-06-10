import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { MAX_CONTINUE_PER_SESSION } from '@/game/config/gameConfig'
import { getCatByLevel } from '@/game/config/cats'
import type { BoosterMode, GameState } from '@/game/types/game.types'
import type { BoosterType } from '@/game/types/booster.types'
import { usePlayerStore } from '@/stores/playerStore'

export const useGameStore = defineStore('game', () => {
  const playerStore = usePlayerStore()

  const gameState = ref<GameState>('menu')
  const score = ref(0)
  const combo = ref(1)
  const currentRunCoins = ref(0)
  const nextObjectLevel = ref(1)
  const boosterMode = ref<BoosterMode>(null)
  const toastMessage = ref<string | null>(null)
  const victoryLevel = ref(0)
  const continueCountThisSession = ref(0)

  const bestScore = computed(() => playerStore.progress.bestScore)
  const maxUnlockedLevel = computed(() => playerStore.progress.maxUnlockedLevel)
  const coins = computed(() => playerStore.progress.coins)

  const canContinueWithAd = computed(
    () => continueCountThisSession.value < MAX_CONTINUE_PER_SESSION,
  )

  const remainingAdContinues = computed(
    () => Math.max(0, MAX_CONTINUE_PER_SESSION - continueCountThisSession.value),
  )

  function showToast(message: string): void {
    toastMessage.value = message
    setTimeout(() => {
      if (toastMessage.value === message) toastMessage.value = null
    }, 2000)
  }

  function startGame(): void {
    score.value = 0
    combo.value = 1
    currentRunCoins.value = 0
    boosterMode.value = null
    victoryLevel.value = 0
    continueCountThisSession.value = 0
    playerStore.recordGameStart()
    gameState.value = 'playing'
  }

  function goToHub(screen: 'home' | 'shop' | 'collection' | 'tasks' = 'home'): void {
    boosterMode.value = null
    gameState.value = screen === 'home' ? 'menu' : screen
  }

  function goToMenu(): void {
    goToHub('home')
  }

  function openShop(): void {
    goToHub('shop')
  }

  function openCollection(): void {
    goToHub('collection')
  }

  function openTasks(): void {
    goToHub('tasks')
  }

  function showTutorial(): void {
    gameState.value = 'tutorial'
  }

  function pauseGame(): void {
    if (gameState.value === 'playing') {
      gameState.value = 'paused'
    }
  }

  function resumeGame(): void {
    if (gameState.value === 'paused') {
      gameState.value = 'playing'
    }
  }

  function restartGame(): void {
    startGame()
  }

  function gameOver(): void {
    playerStore.updateBestScore(score.value)
    playerStore.recordGameEnd(score.value)
    playerStore.addCoins(currentRunCoins.value)
    gameState.value = 'gameOver'
  }

  function showVictory(level: number): void {
    if (!playerStore.isVictoryMilestoneNew(level)) return
    victoryLevel.value = level
    gameState.value = 'victory'
    playerStore.markVictoryMilestone(level)
  }

  function continueAfterVictory(): void {
    gameState.value = 'playing'
  }

  function offerContinue(): void {
    gameState.value = 'continueOffer'
  }

  function registerAdContinue(): void {
    if (continueCountThisSession.value >= MAX_CONTINUE_PER_SESSION) return
    continueCountThisSession.value += 1
    gameState.value = 'playing'
  }

  function addScore(value: number, comboMultiplier = 1): void {
    combo.value = comboMultiplier
    score.value += value
    playerStore.recordCombo(comboMultiplier)
    if (score.value > playerStore.progress.bestScore) {
      playerStore.updateBestScore(score.value)
    }
  }

  function addCoins(value: number): void {
    currentRunCoins.value += value
  }

  function setNextObject(level: number): void {
    nextObjectLevel.value = level
  }

  function unlockLevel(level: number, comboMultiplier = 1): void {
    playerStore.recordMerge(level, comboMultiplier)
  }

  function setBoosterMode(mode: BoosterMode): void {
    boosterMode.value = mode
  }

  function activateBooster(type: BoosterType): boolean {
    if (!playerStore.useBooster(type)) {
      showToast('Бустер закончился')
      return false
    }
    boosterMode.value = type
    return true
  }

  function buyBooster(type: BoosterType, price: number): boolean {
    if (!playerStore.spendCoins(price)) {
      showToast('Недостаточно монет')
      return false
    }
    playerStore.addBooster(type)
    return true
  }

  function onBoosterApplied(): void {
    playerStore.recordBoosterUsed()
    boosterMode.value = null
  }

  function finishTutorial(): void {
    playerStore.completeTutorial()
    startGame()
  }

  function getVictoryLabel(): string {
    return getCatByLevel(victoryLevel.value).name
  }

  return {
    gameState,
    score,
    combo,
    bestScore,
    coins,
    currentRunCoins,
    nextObjectLevel,
    maxUnlockedLevel,
    boosterMode,
    toastMessage,
    victoryLevel,
    continueCountThisSession,
    remainingAdContinues,
    canContinueWithAd,
    startGame,
    goToMenu,
    goToHub,
    openShop,
    openCollection,
    openTasks,
    showTutorial,
    pauseGame,
    resumeGame,
    restartGame,
    gameOver,
    showVictory,
    continueAfterVictory,
    offerContinue,
    registerAdContinue,
    addScore,
    addCoins,
    setNextObject,
    unlockLevel,
    setBoosterMode,
    activateBooster,
    buyBooster,
    onBoosterApplied,
    finishTutorial,
    getVictoryLabel,
    showToast,
  }
})
