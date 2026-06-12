import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'

import { collectionMilestones } from '@/game/config/collectionMilestones'
import { MAX_CATALOG_LEVEL } from '@/game/config/cats'
import { dailyRewardCycle } from '@/game/config/dailyRewards'
import { dailyQuests, type QuestDef } from '@/game/config/quests'
import type { BoosterType } from '@/game/types/booster.types'
import { loadJson, saveJson } from '@/shared/utils/localStorage'
import { flushCatMergeProgress, loadCatMergeProgress, saveCatMergeProgress } from '@/yandex/playerCloud'
import { syncLeaderboardBest } from '@/yandex/leaderboard'

const STORAGE_KEY = 'cat-merge-player'

export interface CollectionEntry {
  timesCreated: number
  discoveredAt: number
  bestComboWith: number
}

export interface DailyProgress {
  date: string
  gamesPlayed: number
  scoreToday: number
  mergesToday: number
  maxLevelToday: number
  comboMaxToday: number
  boostersUsedToday: number
  creationsByLevel: Record<string, number>
  claimedQuests: string[]
  dailyRewardClaimed: boolean
}

export interface PlayerProgress {
  coins: number
  bestScore: number
  maxUnlockedLevel: number
  boosters: Record<BoosterType, number>
  tutorialCompleted: boolean
  victoryMilestonesShown: number[]
  claimedCollectionMilestones: string[]
  collectionStats: Record<string, CollectionEntry>
  dailyLoginStreak: number
  lastDailyClaimDate: string | null
  totalMerges: number
  totalGames: number
  daily: DailyProgress
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function freshDaily(): DailyProgress {
  return {
    date: todayKey(),
    gamesPlayed: 0,
    scoreToday: 0,
    mergesToday: 0,
    maxLevelToday: 1,
    comboMaxToday: 1,
    boostersUsedToday: 0,
    creationsByLevel: {},
    claimedQuests: [],
    dailyRewardClaimed: false,
  }
}

const defaults: PlayerProgress = {
  coins: 0,
  bestScore: 0,
  maxUnlockedLevel: 1,
  boosters: { bomb: 1, rainbow: 1, cookie: 1 },
  tutorialCompleted: false,
  victoryMilestonesShown: [],
  claimedCollectionMilestones: [],
  collectionStats: {},
  dailyLoginStreak: 0,
  lastDailyClaimDate: null,
  totalMerges: 0,
  totalGames: 0,
  daily: freshDaily(),
}

function normalizeProgress(raw: Partial<PlayerProgress>): PlayerProgress {
  const daily =
    raw.daily?.date === todayKey() ? { ...freshDaily(), ...raw.daily } : freshDaily()

  return {
    ...defaults,
    ...raw,
    boosters: { ...defaults.boosters, ...raw.boosters },
    victoryMilestonesShown: raw.victoryMilestonesShown ?? [],
    claimedCollectionMilestones: raw.claimedCollectionMilestones ?? [],
    collectionStats: raw.collectionStats ?? {},
    daily,
  }
}

function levelKey(level: number): string {
  return String(level)
}

export const usePlayerStore = defineStore('player', () => {
  const progress = ref<PlayerProgress>(normalizeProgress(loadJson(STORAGE_KEY, defaults)))

  const collectionProgress = computed(() =>
    Math.round((progress.value.maxUnlockedLevel / MAX_CATALOG_LEVEL) * 100),
  )

  const dailyRewardDayIndex = computed(() => {
    const streak = progress.value.dailyLoginStreak
    if (streak <= 0) return 1
    return ((streak - 1) % 7) + 1
  })

  const nextDailyReward = computed(
    () => dailyRewardCycle.find((d) => d.day === dailyRewardDayIndex.value) ?? dailyRewardCycle[0]!,
  )

  function persist(flush = false): void {
    const snapshot = toRaw(progress.value)
    saveJson(STORAGE_KEY, snapshot)
    saveCatMergeProgress(snapshot as unknown as Record<string, unknown>, flush)
  }

  function flushProgressNow(): void {
    persist(true)
    void flushCatMergeProgress()
  }

  async function loadProgress(): Promise<void> {
    const local = normalizeProgress(loadJson(STORAGE_KEY, defaults))

    try {
      const cloud = await loadCatMergeProgress()
      if (cloud) {
        const cloudNorm = normalizeProgress(cloud as Partial<PlayerProgress>)
        progress.value = normalizeProgress({
          ...local,
          ...cloudNorm,
          bestScore: Math.max(local.bestScore, cloudNorm.bestScore),
        })
        saveJson(STORAGE_KEY, progress.value)
        void syncLeaderboardBest(progress.value.bestScore)
        return
      }
    } catch {
      /* cloud unavailable — local fallback */
    }

    progress.value = local
    void syncLeaderboardBest(local.bestScore)
  }

  function ensureDaily(): void {
    if (progress.value.daily.date !== todayKey()) {
      progress.value.daily = freshDaily()
      persist()
    }
  }

  function addCoins(amount: number): void {
    progress.value.coins += amount
    persist()
  }

  function spendCoins(amount: number): boolean {
    if (progress.value.coins < amount) return false
    progress.value.coins -= amount
    persist()
    return true
  }

  function updateBestScore(score: number): void {
    if (score > progress.value.bestScore) {
      progress.value.bestScore = score
      persist(true)
      void syncLeaderboardBest(score)
    }
  }

  function unlockLevel(level: number): void {
    if (level > progress.value.maxUnlockedLevel) {
      progress.value.maxUnlockedLevel = level
      checkCollectionMilestones()
      persist()
    }
  }

  function recordCollectionCreation(level: number, combo: number): void {
    const key = levelKey(level)
    const existing = progress.value.collectionStats[key]
    if (existing) {
      existing.timesCreated += 1
      existing.bestComboWith = Math.max(existing.bestComboWith, combo)
    } else {
      progress.value.collectionStats[key] = {
        timesCreated: 1,
        discoveredAt: Date.now(),
        bestComboWith: combo,
      }
    }
    persist()
  }

  function getCollectionEntry(level: number): CollectionEntry | null {
    return progress.value.collectionStats[levelKey(level)] ?? null
  }

  function checkCollectionMilestones(): void {
    const unlocked = progress.value.maxUnlockedLevel
    for (const milestone of collectionMilestones) {
      if (
        unlocked >= milestone.unlockedCount &&
        !progress.value.claimedCollectionMilestones.includes(milestone.id)
      ) {
        progress.value.claimedCollectionMilestones.push(milestone.id)
        if (milestone.reward.coins) addCoins(milestone.reward.coins)
        if (milestone.reward.booster) {
          addBooster(milestone.reward.booster.type, milestone.reward.booster.amount)
        }
      }
    }
  }

  function addBooster(type: BoosterType, amount = 1): void {
    progress.value.boosters[type] += amount
    persist()
  }

  function useBooster(type: BoosterType): boolean {
    if (progress.value.boosters[type] <= 0) return false
    progress.value.boosters[type] -= 1
    persist()
    return true
  }

  function completeTutorial(): void {
    progress.value.tutorialCompleted = true
    persist()
  }

  function isVictoryMilestoneNew(level: number): boolean {
    return !progress.value.victoryMilestonesShown.includes(level)
  }

  function markVictoryMilestone(level: number): void {
    if (!progress.value.victoryMilestonesShown.includes(level)) {
      progress.value.victoryMilestonesShown.push(level)
      persist()
    }
  }

  function recordGameStart(): void {
    ensureDaily()
    progress.value.totalGames += 1
    progress.value.daily.gamesPlayed += 1
    persist()
  }

  function recordGameEnd(score: number): void {
    ensureDaily()
    progress.value.daily.scoreToday += score
    persist(true)
  }

  function recordMerge(level: number, combo = 1): void {
    ensureDaily()
    progress.value.totalMerges += 1
    progress.value.daily.mergesToday += 1
    if (level > progress.value.daily.maxLevelToday) {
      progress.value.daily.maxLevelToday = level
    }
    if (combo > progress.value.daily.comboMaxToday) {
      progress.value.daily.comboMaxToday = combo
    }

    const key = levelKey(level)
    progress.value.daily.creationsByLevel[key] =
      (progress.value.daily.creationsByLevel[key] ?? 0) + 1

    unlockLevel(level)
    recordCollectionCreation(level, combo)
    persist()
  }

  function recordCombo(combo: number): void {
    ensureDaily()
    if (combo > progress.value.daily.comboMaxToday) {
      progress.value.daily.comboMaxToday = combo
      persist()
    }
  }

  function recordBoosterUsed(): void {
    ensureDaily()
    progress.value.daily.boostersUsedToday += 1
    persist()
  }

  function getQuestProgress(quest: QuestDef): number {
    ensureDaily()
    const d = progress.value.daily
    switch (quest.metric) {
      case 'play_games':
        return d.gamesPlayed
      case 'score_daily':
        return d.scoreToday
      case 'merge_count':
        return d.mergesToday
      case 'reach_level':
        return d.maxLevelToday
      case 'combo_max':
        return d.comboMaxToday
      case 'use_booster':
        return d.boostersUsedToday
      case 'create_level_count':
        return d.creationsByLevel[String(quest.levelTarget ?? 0)] ?? 0
      default:
        return 0
    }
  }

  function isQuestComplete(quest: QuestDef): boolean {
    return getQuestProgress(quest) >= quest.target
  }

  function isQuestClaimed(questId: string): boolean {
    ensureDaily()
    return progress.value.daily.claimedQuests.includes(questId)
  }

  function claimQuest(quest: QuestDef): boolean {
    ensureDaily()
    if (!isQuestComplete(quest) || isQuestClaimed(quest.id)) return false

    if (quest.reward.coins) addCoins(quest.reward.coins)
    if (quest.reward.booster) {
      addBooster(quest.reward.booster.type, quest.reward.booster.amount)
    }

    progress.value.daily.claimedQuests.push(quest.id)
    persist()
    return true
  }

  function applyDailyReward(): void {
    const reward = nextDailyReward.value
    if (reward.coins) addCoins(reward.coins)
    if (reward.booster) addBooster(reward.booster.type, reward.booster.amount)
  }

  function claimDailyReward(): boolean {
    ensureDaily()
    if (progress.value.daily.dailyRewardClaimed) return false

    const today = todayKey()
    const last = progress.value.lastDailyClaimDate

    if (last === yesterdayKey()) {
      progress.value.dailyLoginStreak += 1
    } else if (last !== today) {
      progress.value.dailyLoginStreak = 1
    }

    progress.value.daily.dailyRewardClaimed = true
    progress.value.lastDailyClaimDate = today
    applyDailyReward()
    persist()
    return true
  }

  function canClaimDailyReward(): boolean {
    ensureDaily()
    return !progress.value.daily.dailyRewardClaimed
  }

  function pendingQuestsCount(): number {
    return dailyQuests.filter((q) => isQuestComplete(q) && !isQuestClaimed(q.id)).length
  }

  function getUnclaimedMilestones(): typeof collectionMilestones {
    return collectionMilestones.filter(
      (m) =>
        progress.value.maxUnlockedLevel >= m.unlockedCount &&
        !progress.value.claimedCollectionMilestones.includes(m.id),
    )
  }

  return {
    progress,
    collectionProgress,
    dailyRewardDayIndex,
    nextDailyReward,
    loadProgress,
    flushProgressNow,
    addCoins,
    spendCoins,
    updateBestScore,
    unlockLevel,
    addBooster,
    useBooster,
    completeTutorial,
    isVictoryMilestoneNew,
    markVictoryMilestone,
    recordGameStart,
    recordGameEnd,
    recordMerge,
    recordCombo,
    recordBoosterUsed,
    getCollectionEntry,
    getQuestProgress,
    isQuestComplete,
    isQuestClaimed,
    claimQuest,
    claimDailyReward,
    canClaimDailyReward,
    pendingQuestsCount,
    getUnclaimedMilestones,
    ensureDaily,
  }
})
