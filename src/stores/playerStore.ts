import { defineStore } from 'pinia'
import { ref } from 'vue'

import { DEFAULT_PLAYER, calcXpToNextLevel, type PlayerConfig } from '@/game/data/playerConfig'
import { ENERGY_BOLT, type WeaponConfig } from '@/game/data/weaponsConfig'

function clonePlayer(): PlayerConfig {
  return { ...DEFAULT_PLAYER, xpToNextLevel: calcXpToNextLevel(1) }
}

function cloneWeapon(): WeaponConfig {
  return { ...ENERGY_BOLT }
}

export const usePlayerStore = defineStore('player', () => {
  const stats = ref<PlayerConfig>(clonePlayer())
  const weapon = ref<WeaponConfig>(cloneWeapon())

  function resetRuntime(): void {
    stats.value = clonePlayer()
    weapon.value = cloneWeapon()
  }

  function syncFromRuntime(player: PlayerConfig, weaponState: WeaponConfig): void {
    stats.value = { ...player }
    weapon.value = { ...weaponState }
  }

  return {
    stats,
    weapon,
    resetRuntime,
    syncFromRuntime,
  }
})
