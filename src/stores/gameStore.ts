import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { UpgradeDefinition } from '@/game/data/upgradesConfig'

export interface MissionHudState {
  id: string
  title: string
  current: number
  target: number
  completed: boolean
}

export const useGameStore = defineStore('game', () => {
  const running = ref(false)
  const paused = ref(false)
  const gameOver = ref(false)
  const waveIndex = ref(1)
  const waveElapsed = ref(0)
  const waveDuration = ref(60)
  const kills = ref(0)
  const gold = ref(0)
  const timeSeconds = ref(0)
  const showUpgradeModal = ref(false)
  const upgradeOptions = ref<UpgradeDefinition[]>([])
  const bossActive = ref(false)
  const bossHp = ref(0)
  const bossMaxHp = ref(0)
  const bossName = ref('')
  const missions = ref<MissionHudState[]>([])
  const waveEventLabel = ref('')
  const fogActive = ref(false)
  const showGameEventModal = ref(false)
  const gameEventTitle = ref('')
  const gameEventDescription = ref('')
  const activeSynergyTitles = ref<string[]>([])

  const waveProgress = computed(() =>
    waveDuration.value > 0 ? waveElapsed.value / waveDuration.value : 0,
  )

  const waveStageLabel = computed(() => {
    if (bossActive.value) return bossName.value || 'BOSS'
    if (waveEventLabel.value && waveEventLabel.value !== 'Обычная волна') {
      return waveEventLabel.value
    }
    const stage = Math.min(4, Math.ceil(waveProgress.value * 4) || 1)
    return String(stage)
  })

  function resetSession(): void {
    running.value = false
    paused.value = false
    gameOver.value = false
    waveIndex.value = 1
    waveElapsed.value = 0
    waveDuration.value = 60
    kills.value = 0
    gold.value = 0
    timeSeconds.value = 0
    showUpgradeModal.value = false
    upgradeOptions.value = []
    bossActive.value = false
    bossHp.value = 0
    bossMaxHp.value = 0
    bossName.value = ''
    missions.value = []
    waveEventLabel.value = ''
    fogActive.value = false
    showGameEventModal.value = false
    gameEventTitle.value = ''
    gameEventDescription.value = ''
    activeSynergyTitles.value = []
  }

  function startSession(): void {
    resetSession()
    running.value = true
  }

  function setPaused(value: boolean): void {
    paused.value = value
  }

  function setGameOver(value: boolean): void {
    gameOver.value = value
    running.value = !value
  }

  function addKill(): void {
    kills.value += 1
  }

  function addGold(amount: number): void {
    gold.value += amount
  }

  function syncWave(index: number, elapsed: number, duration: number): void {
    waveIndex.value = index
    waveElapsed.value = elapsed
    waveDuration.value = duration
  }

  function syncBoss(hp: number, maxHp: number, active: boolean, name = ''): void {
    bossHp.value = hp
    bossMaxHp.value = maxHp
    bossActive.value = active
    bossName.value = name
  }

  function setWaveEvent(label: string, fog: boolean): void {
    waveEventLabel.value = label
    fogActive.value = fog
  }

  function openGameEvent(title: string, description: string): void {
    gameEventTitle.value = title
    gameEventDescription.value = description
    showGameEventModal.value = true
    paused.value = true
  }

  function closeGameEvent(): void {
    showGameEventModal.value = false
    paused.value = false
  }

  function setSynergyTitles(titles: string[]): void {
    activeSynergyTitles.value = titles
  }

  function syncMissions(states: MissionHudState[]): void {
    missions.value = states
  }

  function syncTime(seconds: number): void {
    timeSeconds.value = seconds
  }

  function openUpgradeModal(options: UpgradeDefinition[]): void {
    upgradeOptions.value = options
    showUpgradeModal.value = true
    paused.value = true
  }

  function closeUpgradeModal(): void {
    showUpgradeModal.value = false
    upgradeOptions.value = []
    paused.value = false
  }

  return {
    running,
    paused,
    gameOver,
    waveIndex,
    waveElapsed,
    waveDuration,
    waveProgress,
    waveStageLabel,
    kills,
    gold,
    timeSeconds,
    showUpgradeModal,
    upgradeOptions,
    bossActive,
    bossHp,
    bossMaxHp,
    bossName,
    missions,
    waveEventLabel,
    fogActive,
    showGameEventModal,
    gameEventTitle,
    gameEventDescription,
    activeSynergyTitles,
    resetSession,
    startSession,
    setPaused,
    setGameOver,
    addKill,
    addGold,
    syncWave,
    syncBoss,
    setWaveEvent,
    openGameEvent,
    closeGameEvent,
    setSynergyTitles,
    syncMissions,
    syncTime,
    openUpgradeModal,
    closeUpgradeModal,
  }
})
