import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ArtifactDefinition } from '@/game/data/artifactsConfig'
import { DEFAULT_HERO_ID } from '@/game/data/heroesConfig'
import type { SynergyDefinition } from '@/game/data/synergiesConfig'

export const useRunStore = defineStore('run', () => {
  const heroId = ref(DEFAULT_HERO_ID)
  const ownedUpgradeIds = ref<string[]>([])
  const ownedTags = ref<string[]>([])
  const activeSynergies = ref<SynergyDefinition[]>([])
  const artifacts = ref<ArtifactDefinition[]>([])
  const bossesKilled = ref(0)

  function reset(): void {
    heroId.value = DEFAULT_HERO_ID
    ownedUpgradeIds.value = []
    ownedTags.value = []
    activeSynergies.value = []
    artifacts.value = []
    bossesKilled.value = 0
  }

  function prepare(hero: string): void {
    reset()
    heroId.value = hero
  }

  function registerUpgrade(id: string, tags: string[] = []): void {
    if (!ownedUpgradeIds.value.includes(id)) {
      ownedUpgradeIds.value.push(id)
    }
    for (const tag of tags) {
      if (!ownedTags.value.includes(tag)) {
        ownedTags.value.push(tag)
      }
    }
  }

  function setSynergies(list: SynergyDefinition[]): void {
    activeSynergies.value = list
  }

  function addArtifact(artifact: ArtifactDefinition): void {
    if (artifacts.value.some((a) => a.id === artifact.id)) return
    artifacts.value.push(artifact)
  }

  function addBossKill(): void {
    bossesKilled.value += 1
  }

  return {
    heroId,
    ownedUpgradeIds,
    ownedTags,
    activeSynergies,
    artifacts,
    bossesKilled,
    reset,
    prepare,
    registerUpgrade,
    setSynergies,
    addArtifact,
    addBossKill,
  }
})
