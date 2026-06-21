export interface MatchPlayerConfig {
  speed: number
  dashSpeed: number
  dashDurationMs: number
  invincibilityMs: number
}

export const DEFAULT_MATCH_PLAYER: MatchPlayerConfig = {
  speed: 195,
  dashSpeed: 520,
  dashDurationMs: 180,
  invincibilityMs: 2000,
}

export interface PlayerInventory {
  neon: number
  sushi: number
  golden: number
}

export function emptyInventory(): PlayerInventory {
  return { neon: 0, sushi: 0, golden: 0 }
}
