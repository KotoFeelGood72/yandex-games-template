import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { TeamId } from '@/game/data/mapConfig'

export const useMatchStore = defineStore('match', () => {
  const started = ref(false)
  const finished = ref(false)
  const paused = ref(false)
  const countdownActive = ref(false)
  const countdownValue = ref(3)
  const livePhase = ref(false)

  const elapsedMs = ref(0)
  const remainingMs = ref(5 * 60 * 1000)

  const blueScore = ref(0)
  const pinkScore = ref(0)
  const winner = ref<TeamId | 'draw' | null>(null)

  const playerNeon = ref(0)
  const playerSushi = ref(0)
  const playerGolden = ref(0)

  const exchangeProgress = ref(0)
  const traderActive = ref(false)
  const traderZoneX = ref(0)
  const traderZoneY = ref(0)

  const goldenOnMap = ref(false)
  const goldenX = ref(0)
  const goldenY = ref(0)

  const dashCooldownLeft = ref(0)
  const hideCooldownLeft = ref(0)
  const playerX = ref(0)
  const playerY = ref(0)

  const formattedTime = computed(() => {
    const totalSec = Math.ceil(remainingMs.value / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })

  function beginMatch(): void {
    started.value = true
    finished.value = false
    paused.value = false
    countdownActive.value = true
    countdownValue.value = 3
    livePhase.value = false
    elapsedMs.value = 0
    remainingMs.value = 5 * 60 * 1000
    blueScore.value = 0
    pinkScore.value = 0
    winner.value = null
    playerNeon.value = 0
    playerSushi.value = 0
    playerGolden.value = 0
    exchangeProgress.value = 0
    traderActive.value = false
    goldenOnMap.value = false
  }

  function setCountdown(value: number): void {
    countdownValue.value = value
  }

  function startLivePhase(): void {
    countdownActive.value = false
    livePhase.value = true
  }

  function syncState(payload: {
    elapsedMs: number
    remainingMs: number
    blueScore: number
    pinkScore: number
    playerNeon: number
    playerSushi: number
    playerGolden: number
    exchangeProgress: number
    traderActive: boolean
    traderZoneX?: number
    traderZoneY?: number
    goldenOnMap?: boolean
    goldenX?: number
    goldenY?: number
    dashCooldownLeft?: number
    hideCooldownLeft?: number
    playerX?: number
    playerY?: number
  }): void {
    elapsedMs.value = payload.elapsedMs
    remainingMs.value = payload.remainingMs
    blueScore.value = payload.blueScore
    pinkScore.value = payload.pinkScore
    playerNeon.value = payload.playerNeon
    playerSushi.value = payload.playerSushi
    playerGolden.value = payload.playerGolden
    exchangeProgress.value = payload.exchangeProgress
    traderActive.value = payload.traderActive
    if (payload.traderZoneX !== undefined) traderZoneX.value = payload.traderZoneX
    if (payload.traderZoneY !== undefined) traderZoneY.value = payload.traderZoneY
    if (payload.goldenOnMap !== undefined) goldenOnMap.value = payload.goldenOnMap
    if (payload.goldenX !== undefined) goldenX.value = payload.goldenX
    if (payload.goldenY !== undefined) goldenY.value = payload.goldenY
    if (payload.dashCooldownLeft !== undefined) dashCooldownLeft.value = payload.dashCooldownLeft
    if (payload.hideCooldownLeft !== undefined) hideCooldownLeft.value = payload.hideCooldownLeft
    if (payload.playerX !== undefined) playerX.value = payload.playerX
    if (payload.playerY !== undefined) playerY.value = payload.playerY
  }

  function endMatch(result: TeamId | 'draw'): void {
    finished.value = true
    winner.value = result
  }

  function setPaused(value: boolean): void {
    paused.value = value
  }

  function reset(): void {
    started.value = false
    finished.value = false
    paused.value = false
    countdownActive.value = false
    countdownValue.value = 3
    livePhase.value = false
  }

  /** @deprecated use beginMatch */
  function startMatch(): void {
    beginMatch()
  }

  return {
    started,
    finished,
    paused,
    countdownActive,
    countdownValue,
    livePhase,
    elapsedMs,
    remainingMs,
    blueScore,
    pinkScore,
    winner,
    playerNeon,
    playerSushi,
    playerGolden,
    exchangeProgress,
    traderActive,
    traderZoneX,
    traderZoneY,
    goldenOnMap,
    goldenX,
    goldenY,
    dashCooldownLeft,
    hideCooldownLeft,
    playerX,
    playerY,
    formattedTime,
    beginMatch,
    startMatch,
    setCountdown,
    startLivePhase,
    syncState,
    endMatch,
    setPaused,
    reset,
  }
})
