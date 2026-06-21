import { GOLDEN_SCORE, NEON_SCORE, SUSHI_SCORE } from '../data/matchConfig'
import type { PlayerInventory } from '../data/playerConfig'

export function calcInventoryScore(inventory: PlayerInventory): number {
  return (
    inventory.neon * NEON_SCORE +
    inventory.sushi * SUSHI_SCORE +
    inventory.golden * GOLDEN_SCORE
  )
}

export function calcCatchLoss(inventory: PlayerInventory): {
  lostNeon: number
  lostSushi: number
  remaining: PlayerInventory
} {
  const lostNeon = Math.floor(inventory.neon * 0.5)
  const lostSushi = Math.floor(inventory.sushi * 0.3)

  return {
    lostNeon,
    lostSushi,
    remaining: {
      neon: inventory.neon - lostNeon,
      sushi: inventory.sushi - lostSushi,
      golden: inventory.golden,
    },
  }
}

export function canExchange(inventory: PlayerInventory, neonCost: number): boolean {
  return inventory.neon >= neonCost
}
