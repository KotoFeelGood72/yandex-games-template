import { defineStore } from 'pinia'
import { ref } from 'vue'

import { HEROES, DEFAULT_HERO_ID } from '@/game/data/heroesConfig'
import {
  META_UPGRADES,
  getMetaUpgradeCost,
  getMetaUpgradeLevel,
} from '@/game/data/metaUpgradesConfig'
import { loadJson, saveJson } from '@/shared/utils/localStorage'

const SAVE_KEY = 'void-harvest-meta'

export interface MetaSave {
  ether: number
  bestTime: number
  bestKills: number
  totalGold: number
  selectedHeroId: string
  unlockedHeroIds: string[]
  unlockedWeapons: string[]
  metaUpgradeLevels: Record<string, number>
  completedMissions: string[]
  missionProgress: Record<string, number>
}

const DEFAULT_SAVE: MetaSave = {
  ether: 0,
  bestTime: 0,
  bestKills: 0,
  totalGold: 0,
  selectedHeroId: DEFAULT_HERO_ID,
  unlockedHeroIds: [DEFAULT_HERO_ID],
  unlockedWeapons: ['energy_bolt'],
  metaUpgradeLevels: {},
  completedMissions: [],
  missionProgress: {},
}

function migrateSave(raw: Partial<MetaSave>): MetaSave {
  return {
    ...DEFAULT_SAVE,
    ...raw,
    ether: raw.ether ?? 0,
    unlockedHeroIds: raw.unlockedHeroIds?.length ? [...raw.unlockedHeroIds] : [DEFAULT_HERO_ID],
    unlockedWeapons: raw.unlockedWeapons?.length ? [...raw.unlockedWeapons] : ['energy_bolt'],
    metaUpgradeLevels: { ...raw.metaUpgradeLevels },
    completedMissions: [...(raw.completedMissions ?? [])],
    missionProgress: { ...raw.missionProgress },
  }
}

export const useMetaStore = defineStore('meta', () => {
  const loaded = ref(false)
  const ether = ref(0)
  const bestTime = ref(0)
  const bestKills = ref(0)
  const totalGold = ref(0)
  const selectedHeroId = ref(DEFAULT_HERO_ID)
  const unlockedHeroIds = ref<string[]>([DEFAULT_HERO_ID])
  const unlockedWeapons = ref<string[]>(['energy_bolt'])
  const metaUpgradeLevels = ref<Record<string, number>>({})
  const completedMissions = ref<string[]>([])
  const missionProgress = ref<Record<string, number>>({})
  const lastEarnedEther = ref(0)

  function load(): void {
    const legacy = loadJson<Partial<MetaSave>>('arena-survivor-meta', {})
    const save = migrateSave(loadJson<Partial<MetaSave>>(SAVE_KEY, legacy))
    ether.value = save.ether
    bestTime.value = save.bestTime
    bestKills.value = save.bestKills
    totalGold.value = save.totalGold
    selectedHeroId.value = save.selectedHeroId
    unlockedHeroIds.value = [...save.unlockedHeroIds]
    unlockedWeapons.value = [...save.unlockedWeapons]
    metaUpgradeLevels.value = { ...save.metaUpgradeLevels }
    completedMissions.value = [...save.completedMissions]
    missionProgress.value = { ...save.missionProgress }
    loaded.value = true
  }

  function persist(): void {
    saveJson(SAVE_KEY, {
      ether: ether.value,
      bestTime: bestTime.value,
      bestKills: bestKills.value,
      totalGold: totalGold.value,
      selectedHeroId: selectedHeroId.value,
      unlockedHeroIds: unlockedHeroIds.value,
      unlockedWeapons: unlockedWeapons.value,
      metaUpgradeLevels: metaUpgradeLevels.value,
      completedMissions: completedMissions.value,
      missionProgress: missionProgress.value,
    } satisfies MetaSave)
  }

  function selectHero(id: string): void {
    if (!unlockedHeroIds.value.includes(id)) return
    selectedHeroId.value = id
    persist()
  }

  function unlockHero(id: string): boolean {
    const hero = HEROES[id]
    if (!hero || unlockedHeroIds.value.includes(id)) return false
    if (ether.value < hero.unlockCost) return false
    ether.value -= hero.unlockCost
    unlockedHeroIds.value.push(id)
    persist()
    return true
  }

  function buyMetaUpgrade(id: string): boolean {
    const def = META_UPGRADES.find((u) => u.id === id)
    if (!def) return false
    const level = getMetaUpgradeLevel(metaUpgradeLevels.value, id)
    if (level >= def.maxLevel) return false
    const cost = getMetaUpgradeCost(def, level)
    if (ether.value < cost) return false
    ether.value -= cost
    metaUpgradeLevels.value = { ...metaUpgradeLevels.value, [id]: level + 1 }
    persist()
    return true
  }

  function recordRun(payload: {
    timeSeconds: number
    kills: number
    gold: number
    etherGained: number
    missionProgressNext: Record<string, number>
    newCompletedMissions: string[]
  }): void {
    bestTime.value = Math.max(bestTime.value, payload.timeSeconds)
    bestKills.value = Math.max(bestKills.value, payload.kills)
    totalGold.value += payload.gold
    ether.value += payload.etherGained
    lastEarnedEther.value = payload.etherGained
    missionProgress.value = payload.missionProgressNext

    for (const id of payload.newCompletedMissions) {
      if (!completedMissions.value.includes(id)) {
        completedMissions.value.push(id)
      }
    }

    persist()
  }

  return {
    loaded,
    ether,
    bestTime,
    bestKills,
    totalGold,
    selectedHeroId,
    unlockedHeroIds,
    unlockedWeapons,
    metaUpgradeLevels,
    completedMissions,
    missionProgress,
    lastEarnedEther,
    load,
    persist,
    selectHero,
    unlockHero,
    buyMetaUpgrade,
    recordRun,
  }
})
