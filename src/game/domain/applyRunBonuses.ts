import { getHero } from '../data/heroesConfig'
import {
  getMetaUpgradeLevel,
  META_UPGRADES,
} from '../data/metaUpgradesConfig'
import { DEFAULT_PLAYER, calcXpToNextLevel, type PlayerConfig } from '../data/survivorPlayerConfig'
import { ENERGY_BOLT, type WeaponConfig } from '../data/weaponsConfig'

export interface RunStartContext {
  heroId: string
  metaUpgradeLevels: Record<string, number>
  startGoldMultiplier: number
}

export interface RunStartResult {
  player: PlayerConfig
  weapon: WeaponConfig
  startGold: number
}

export function buildRunStart(ctx: RunStartContext): RunStartResult {
  const hero = getHero(ctx.heroId)
  const player: PlayerConfig = { ...DEFAULT_PLAYER }

  for (const meta of META_UPGRADES) {
    const level = getMetaUpgradeLevel(ctx.metaUpgradeLevels, meta.id)
    const bonus = level * meta.bonusPerLevel

    switch (meta.id) {
      case 'damage':
        player.damageMultiplier *= 1 + bonus
        break
      case 'health':
        player.maxHp = Math.floor(player.maxHp * (1 + bonus))
        player.hp = player.maxHp
        break
      case 'speed':
        player.speed *= 1 + bonus
        break
      case 'crit':
        player.critChance = bonus
        break
      case 'xp_pickup':
        player.pickupRadius *= 1 + bonus
        break
      case 'start_gold':
        break
    }
  }

  player.speed *= hero.speedMultiplier
  player.pickupRadius *= hero.xpPickupMultiplier
  player.maxHp += hero.hpBonus
  player.hp = player.maxHp
  player.armor += hero.armorBonus

  player.xpToNextLevel = calcXpToNextLevel(player.level)

  const startGoldLevel = getMetaUpgradeLevel(ctx.metaUpgradeLevels, 'start_gold')
  const startGold = Math.floor(10 * (1 + startGoldLevel * 0.1) * ctx.startGoldMultiplier)

  return {
    player,
    weapon: { ...ENERGY_BOLT },
    startGold,
  }
}
