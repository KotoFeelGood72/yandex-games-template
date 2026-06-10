import { balanceConfig } from '@/game/config/balanceConfig'

export type FieldLevelCounts = Readonly<Record<number, number>>

export interface SpawnContext {
  maxUnlockedLevel: number
  fieldMaxLevel: number
  sessionMergedLevels: ReadonlySet<number>
  fieldCounts: FieldLevelCounts
}

function getReferenceLevel(ctx: SpawnContext): number {
  return Math.max(ctx.maxUnlockedLevel, ctx.fieldMaxLevel)
}

/** Диапазон выпадения — растёт медленнее, с жёстким потолком из balanceConfig */
export function getSpawnBounds(ctx: SpawnContext): { min: number; max: number } {
  const ref = getReferenceLevel(ctx)
  const unlocked = Math.max(1, ctx.maxUnlockedLevel)

  let max = 2
  if (ref >= 4) max = 3
  if (ref >= 6) max = 4
  if (ref >= 9) max = 5
  if (ref >= 14) max = 6

  max = Math.min(max, balanceConfig.spawnAbsoluteMaxLevel, unlocked)
  return { min: 1, max: Math.max(1, max) }
}

/** Уровень 1 + уже созданные слиянием в сессии + последние открытые */
export function getAllowedSpawnLevels(ctx: SpawnContext): number[] {
  const { min, max } = getSpawnBounds(ctx)
  const allowed = new Set<number>()

  for (let level = min; level <= max; level++) {
    if (level === 1 || ctx.sessionMergedLevels.has(level)) {
      allowed.add(level)
    }
  }

  const recentStart = Math.max(1, ctx.maxUnlockedLevel - balanceConfig.spawnRecentUnlockedWindow + 1)
  for (let level = recentStart; level <= Math.min(max, ctx.maxUnlockedLevel); level++) {
    if (ctx.sessionMergedLevels.has(level) || level === 1) {
      allowed.add(level)
    }
  }

  const list = [...allowed].sort((a, b) => a - b)
  return list.length > 0 ? list : [1]
}

/** Уровни с нечётным количеством на поле — нужна пара для слияния */
export function getLevelsNeedingPair(
  allowed: number[],
  counts: FieldLevelCounts,
): number[] {
  return allowed.filter((level) => {
    const count = counts[level] ?? 0
    return count > 0 && count % 2 === 1
  })
}

function pickWeightedLevel(candidates: { level: number; weight: number }[]): number {
  let total = 0
  for (const { weight } of candidates) {
    total += weight
  }

  let roll = Math.random() * total
  for (const { level, weight } of candidates) {
    roll -= weight
    if (roll <= 0) return level
  }

  return candidates[candidates.length - 1]!.level
}

/**
 * Упрощённый спавн:
 * 1. Если на поле одиночка — с высокой вероятностью даём пару.
 * 2. Иначе — в основном 1–2 уровень, реже 3+.
 */
export function getWeightedSpawnLevel(ctx: SpawnContext): number {
  const allowed = getAllowedSpawnLevels(ctx)
  if (allowed.length === 1) return allowed[0]!

  const needingPair = getLevelsNeedingPair(allowed, ctx.fieldCounts)

  if (needingPair.length > 0 && Math.random() < balanceConfig.spawnPairMatchChance) {
    const weights = needingPair.map((level) => {
      const count = ctx.fieldCounts[level] ?? 0
      return {
        level,
        // Чем дольше одиночка ждёт — тем выше шанс (но мелкие уровни приоритетнее)
        weight: 6 - level * 0.35 + Math.min(count, 3) * 0.5,
      }
    })
    return pickWeightedLevel(weights)
  }

  const weights = allowed.map((level) => {
    let weight = 1
    if (level === 1) weight = balanceConfig.spawnLevel1MinWeight
    else if (level === 2) weight = 2.2
    else if (level === 3) weight = 1.4
    else weight = 0.7

    const count = ctx.fieldCounts[level] ?? 0
    if (count === 2) weight += 1.5
    if (count >= 4 && count % 2 === 0) weight += 0.8

    return { level, weight }
  })

  return pickWeightedLevel(weights)
}
