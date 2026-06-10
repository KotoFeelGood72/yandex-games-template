import {
  getWeightedSpawnLevel,
  type FieldLevelCounts,
  type SpawnContext,
} from '@/game/config/spawnConfig'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomSpawnLevel(
  maxUnlockedLevel: number,
  fieldMaxLevel = 1,
  sessionMergedLevels: ReadonlySet<number> = new Set(),
  fieldCounts: FieldLevelCounts = {},
): number {
  const ctx: SpawnContext = {
    maxUnlockedLevel,
    fieldMaxLevel,
    sessionMergedLevels,
    fieldCounts,
  }
  return getWeightedSpawnLevel(ctx)
}
