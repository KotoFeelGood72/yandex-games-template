/** Legacy arena-survivor player config (deprecated, kept for old modules) */
export interface PlayerConfig {
  hp: number
  maxHp: number
  speed: number
  level: number
  xp: number
  xpToNextLevel: number
  damageMultiplier: number
  fireRateMultiplier: number
  projectileSpeedMultiplier: number
  pickupRadius: number
  armor: number
  invincibilityMs: number
  critChance: number
}

export const DEFAULT_PLAYER: PlayerConfig = {
  hp: 100,
  maxHp: 100,
  speed: 180,
  level: 1,
  xp: 0,
  xpToNextLevel: 11,
  damageMultiplier: 1,
  fireRateMultiplier: 1,
  projectileSpeedMultiplier: 1,
  pickupRadius: 80,
  armor: 0,
  invincibilityMs: 900,
  critChance: 0,
}

export function calcXpToNextLevel(level: number): number {
  return Math.floor(10 + level * 8 + level * level * 1.5)
}
